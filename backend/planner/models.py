from django.conf import settings
from django.db import models


class Task(models.Model):
    class Priority(models.TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=140)
    due_date = models.DateField(blank=True, null=True)
    priority = models.CharField(max_length=8, choices=Priority.choices, default=Priority.MEDIUM)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['completed', 'due_date', '-created_at']
        indexes = [models.Index(fields=['owner', 'completed', 'due_date'])]

    def __str__(self):
        return self.title
