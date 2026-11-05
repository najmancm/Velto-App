from django.urls import path

from .views import (
    AssistantView,
    CurrentUserView,
    GoalDetailView,
    GoalListCreateView,
    LoginView,
    LogoutView,
    ProjectDetailView,
    ProjectListCreateView,
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
    path('goals/', GoalListCreateView.as_view(), name='goal-list-create'),
    path('goals/<int:pk>/', GoalDetailView.as_view(), name='goal-detail'),
    path('projects/', ProjectListCreateView.as_view(), name='project-list-create'),
    path('projects/<int:pk>/', ProjectDetailView.as_view(), name='project-detail'),
    path('assistant/', AssistantView.as_view(), name='assistant-message'),
]
