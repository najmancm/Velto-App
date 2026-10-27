from django.urls import path

from .views import (
    AssistantView,
    CurrentUserView,
    LoginView,
    LogoutView,
    RegisterView,
    TaskBulkCreateView,
    TaskDetailView,
    TaskListCreateView,
    csrf_cookie,
)

urlpatterns = [
    path('auth/csrf/', csrf_cookie, name='auth-csrf'),
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/me/', CurrentUserView.as_view(), name='auth-me'),
    path('auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('tasks/', TaskListCreateView.as_view(), name='task-list-create'),
    path('tasks/bulk/', TaskBulkCreateView.as_view(), name='task-bulk-create'),
    path('tasks/<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
    path('assistant/', AssistantView.as_view(), name='assistant-message'),
]
