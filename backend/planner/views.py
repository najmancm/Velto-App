import json
import logging
from datetime import date

from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.db import transaction
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.utils import timezone
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from django.views.decorators.http import require_GET
from openai import OpenAI, OpenAIError
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Task
from .serializers import LoginSerializer, RegisterSerializer, TaskSerializer, UserSerializer
from .task_parser import parse_task_list

logger = logging.getLogger(__name__)


@require_GET
@ensure_csrf_cookie
def csrf_cookie(request):
    return JsonResponse({'detail': 'CSRF cookie set.'})


@method_decorator(csrf_protect, name='dispatch')
class RegisterView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        login(request, user)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


@method_decorator(csrf_protect, name='dispatch')
class LoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].strip().lower()
        user = authenticate(request, username=email, password=serializer.validated_data['password'])
        if user is None:
            return Response({'detail': 'Email or password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

        login(request, user)
        return Response(UserSerializer(user).data)


class CurrentUserView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(UserSerializer(request.user).data)


@method_decorator(csrf_protect, name='dispatch')
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(owner=self.request.user)


class TaskBulkCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        task_data = request.data.get('tasks')
        if not isinstance(task_data, list) or not 1 <= len(task_data) <= 50:
            return Response({'tasks': ['Provide between 1 and 50 tasks.']}, status=status.HTTP_400_BAD_REQUEST)

        serializer = TaskSerializer(data=task_data, many=True)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            tasks = [Task(owner=request.user, **item) for item in serializer.validated_data]
            created_tasks = Task.objects.bulk_create(tasks)
        return Response(TaskSerializer(created_tasks, many=True).data, status=status.HTTP_201_CREATED)


class AssistantView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message = request.data.get('message')
        if not isinstance(message, str) or not message.strip():
            return Response({'message': ['Enter a message.']}, status=status.HTTP_400_BAD_REQUEST)
        if len(message) > 2000:
            return Response({'message': ['Keep messages under 2,000 characters.']}, status=status.HTTP_400_BAD_REQUEST)
        current_date = timezone.localdate()
        today = current_date.isoformat()
        if not settings.OPENAI_API_KEY:
            local_tasks = parse_task_list(message, today=current_date)
            if local_tasks:
                return Response({
                    'reply': 'AI is not configured. I used local task-list parsing for this request; review these tasks before adding them.',
                    'proposed_tasks': local_tasks,
                    'source': 'local-parser',
                })
            return Response(
                {'detail': 'AI is not configured yet. Add OPENAI_API_KEY to backend/.env and restart Django for open-ended chat.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        task_context = list(
            request.user.tasks.values('title', 'due_date', 'priority', 'completed')[:50]
        )
        system_prompt = (
            'You are the VELTO task planning assistant. Help the signed-in user organize their tasks. '
            'Return only a JSON object with keys "reply" (a concise helpful string) and "proposed_tasks" '
            '(an array of objects with "title", "due_date" as YYYY-MM-DD or null, and "priority" as low, medium, or high). '
            'Only propose tasks when the user explicitly asks to add, create, or schedule them. '
            'When the user supplies a task list for today, make one task per item and use today as the due date. '
            'Do not claim tasks have been saved; the user must confirm proposed tasks in the interface. '
            'Do not invent dates, deadlines, or details. Use the current date only when the user explicitly says today. '
            f'Current date: {today}. Existing user tasks: {json.dumps(task_context, default=str)}'
        )

        try:
            client = OpenAI(api_key=settings.OPENAI_API_KEY, timeout=20.0, max_retries=1)
            completion = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': message.strip()},
                ],
                response_format={'type': 'json_object'},
                max_tokens=900,
            )
            content = completion.choices[0].message.content
            result = json.loads(content or '{}')
        except OpenAIError as error:
            provider_status = getattr(error, 'status_code', None)
            provider_code = getattr(error, 'code', None)
            request_id = getattr(error, 'request_id', None)
            logger.warning(
                'OpenAI request failed status=%s code=%s request_id=%s',
                provider_status,
                provider_code,
                request_id,
            )
            if provider_status == 401:
                detail = 'OpenAI rejected the API key. Check that it is active, then restart Django.'
            elif provider_status == 429:
                detail = 'OpenAI reports a rate or quota limit. Check the project usage and billing settings.'
            elif provider_status == 403:
                detail = 'OpenAI denied this request. Check the key permissions and selected model.'
            else:
                detail = 'The OpenAI request failed. Check the Django terminal for its safe status and error code.'
            return Response({'detail': detail}, status=status.HTTP_502_BAD_GATEWAY)
        except (json.JSONDecodeError, IndexError, TypeError, ValueError):
            logger.warning('Invalid assistant response returned by provider.')
            return Response(
                {'detail': 'The assistant returned an invalid response. Please try again.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        reply = result.get('reply')
        if not isinstance(reply, str):
            return Response({'detail': 'The assistant returned an invalid response.'}, status=status.HTTP_502_BAD_GATEWAY)

        proposed_tasks = []
        for item in result.get('proposed_tasks', [])[:10]:
            if not isinstance(item, dict):
                continue
            title = item.get('title')
            if not isinstance(title, str) or not title.strip():
                continue
            due_date = item.get('due_date')
            try:
                due_date = date.fromisoformat(due_date) if due_date else None
            except (TypeError, ValueError):
                due_date = None
            priority = item.get('priority')
            if priority not in Task.Priority.values:
                priority = Task.Priority.MEDIUM
            proposed_tasks.append({
                'title': title.strip()[:140],
                'due_date': due_date.isoformat() if due_date else None,
                'priority': priority,
                'completed': False,
            })

        return Response({'reply': reply[:2000], 'proposed_tasks': proposed_tasks, 'source': 'ai'})
