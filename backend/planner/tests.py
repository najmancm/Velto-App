from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient, APITestCase

User = get_user_model()


class PlannerApiTests(APITestCase):
    def create_user(self, email='planner@example.com'):
        return User.objects.create_user(
            username=email,
            email=email,
            first_name='Planner',
            password='Better-Tulip-4!Correct',
        )

    def test_anonymous_users_cannot_access_tasks_or_assistant(self):
        self.assertEqual(self.client.get(reverse('task-list-create')).status_code, 403)
        self.assertEqual(self.client.post(reverse('assistant-message'), {'message': 'Help'}, format='json').status_code, 403)

    def test_anonymous_session_check_returns_empty_success(self):
        self.assertEqual(self.client.get(reverse('auth-me')).status_code, 204)

    def test_registration_creates_account_and_starts_session(self):
        response = self.client.post(reverse('auth-register'), {
            'email': 'new@example.com',
            'name': 'New User',
            'password': 'Better-Tulip-4!Correct',
        }, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertTrue(self.client.session.get('_auth_user_id'))
        user = User.objects.get(email='new@example.com')
        self.assertTrue(user.check_password('Better-Tulip-4!Correct'))
        self.assertEqual(response.data['name'], 'New User')

    def test_registration_requires_csrf(self):
        csrf_client = APIClient(enforce_csrf_checks=True)
        csrf_client.get(reverse('auth-csrf'))
        payload = {
            'email': 'csrf@example.com',
            'name': 'CSRF User',
            'password': 'Better-Tulip-4!Correct',
        }

        without_token = csrf_client.post(reverse('auth-register'), payload, format='json')
        self.assertEqual(without_token.status_code, 403)

        token = csrf_client.cookies['csrftoken'].value
        with_token = csrf_client.post(
            reverse('auth-register'),
            payload,
            format='json',
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(with_token.status_code, 201)

    def test_login_uses_email_and_password(self):
        self.create_user()
        response = self.client.post(reverse('auth-login'), {
            'email': 'PLANNER@example.com',
            'password': 'Better-Tulip-4!Correct',
        }, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['email'], 'planner@example.com')
        self.assertTrue(self.client.session.get('_auth_user_id'))

    def test_tasks_are_only_visible_to_their_owner(self):
        first_user = self.create_user()
        first_client = APIClient()
        first_client.force_authenticate(first_user)
        created = first_client.post(reverse('task-list-create'), {
            'title': 'Write project brief',
            'due_date': '2026-10-13',
            'priority': 'high',
        }, format='json')
        self.assertEqual(created.status_code, 201)
        self.assertEqual(first_client.get(reverse('task-list-create')).data[0]['title'], 'Write project brief')

        second_user = self.create_user('another@example.com')
        second_client = APIClient()
        second_client.force_authenticate(second_user)
        self.assertEqual(len(second_client.get(reverse('task-list-create')).data), 0)
        other_owner_response = second_client.get(reverse('task-detail', args=[created.data['id']]))
        self.assertEqual(other_owner_response.status_code, 404)

    def test_bulk_create_is_validated_and_user_scoped(self):
        user = self.create_user()
        self.client.force_authenticate(user)
        response = self.client.post(reverse('task-bulk-create'), {
            'tasks': [
                {'title': 'Read chapter', 'due_date': '2026-10-13', 'priority': 'medium'},
                {'title': 'Take a walk', 'due_date': '2026-10-13', 'priority': 'low'},
            ],
        }, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(user.tasks.count(), 2)

    def test_assistant_returns_unavailable_without_server_api_key(self):
        from django.test import override_settings

        user = self.create_user()
        self.client.force_authenticate(user)
        with override_settings(OPENAI_API_KEY=''):
            response = self.client.post(reverse('assistant-message'), {'message': 'Plan my day'}, format='json')

        self.assertEqual(response.status_code, 503)

    def test_assistant_can_parse_explicit_task_lists_without_claiming_ai(self):
        from django.test import override_settings

        user = self.create_user()
        self.client.force_authenticate(user)
        with override_settings(OPENAI_API_KEY=''):
            response = self.client.post(
                reverse('assistant-message'),
                {'message': "My tasks for today are: Read a chapter, take a walk, and email Sam."},
                format='json',
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['source'], 'local-parser')
        self.assertIn('AI is not configured', response.data['reply'])
        self.assertEqual(
            [task['title'] for task in response.data['proposed_tasks']],
            ['Read a chapter', 'take a walk', 'email Sam'],
        )
        self.assertTrue(all(task['due_date'] for task in response.data['proposed_tasks']))

    def test_assistant_reports_invalid_provider_key_without_logging_credentials(self):
        import httpx
        from django.test import override_settings
        from openai import AuthenticationError
        from unittest.mock import patch

        user = self.create_user()
        self.client.force_authenticate(user)
        request = httpx.Request('POST', 'https://api.openai.com/v1/chat/completions')
        provider_response = httpx.Response(401, request=request)
        provider_error = AuthenticationError('invalid API key', response=provider_response, body=None)

        with override_settings(OPENAI_API_KEY='test-secret-not-for-logs'):
            with patch('planner.views.OpenAI') as mock_openai:
                mock_openai.return_value.chat.completions.create.side_effect = provider_error
                with self.assertLogs('planner.views', level='WARNING') as captured_logs:
                    response = self.client.post(
                        reverse('assistant-message'),
                        {'message': 'Help me plan my day'},
                        format='json',
                    )

        self.assertEqual(response.status_code, 502)
        self.assertIn('rejected the API key', response.data['detail'])
        self.assertNotIn('test-secret-not-for-logs', '\n'.join(captured_logs.output))
