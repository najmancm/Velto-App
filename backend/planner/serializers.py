from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Q
from rest_framework import serializers

from .models import Task

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='first_name', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'name']


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=254)
    name = serializers.CharField(max_length=150, trim_whitespace=True)
    password = serializers.CharField(write_only=True, trim_whitespace=False, min_length=8)

    def validate_email(self, value):
        normalized_email = value.strip().lower()
        if User.objects.filter(Q(username__iexact=normalized_email) | Q(email__iexact=normalized_email)).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return normalized_email

    def validate(self, attributes):
        user = User(username=attributes['email'], email=attributes['email'], first_name=attributes['name'])
        try:
            validate_password(attributes['password'], user=user)
        except DjangoValidationError as error:
            raise serializers.ValidationError({'password': list(error.messages)}) from error
        return attributes

    def create(self, validated_data):
        email = validated_data['email']
        return User.objects.create_user(
            username=email,
            email=email,
            first_name=validated_data['name'],
            password=validated_data['password'],
        )


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=254)
    password = serializers.CharField(write_only=True, trim_whitespace=False)


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'due_date', 'priority', 'completed', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
