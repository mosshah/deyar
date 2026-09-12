from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    timezone = serializers.CharField(source="user_timezone", default="UTC")

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "timezone", "created_at"]
        read_only_fields = ["id", "created_at"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    timezone = serializers.CharField(
        source="user_timezone", default="UTC", required=False
    )

    class Meta:
        model = User
        fields = ["id", "email", "password", "first_name", "last_name", "timezone"]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)
