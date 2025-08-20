# accounts/serializers.py
from properties.models import Client
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password


User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_null=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, required=False, allow_null=True, min_length=8)

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name",
            "role", "password", "password_confirm", "is_active", "date_joined"
        ]
        read_only_fields = ("id", "is_active", "date_joined")

    def validate(self, attrs):
        # If password provided, ensure confirmation and run Django validators
        pw = attrs.get("password")
        pw2 = attrs.pop("password_confirm", None)
        if pw:
            if pw2 is None:
                raise serializers.ValidationError({"password_confirm": "Please confirm the password."})
            if pw != pw2:
                raise serializers.ValidationError({"password_confirm": "Password confirmation does not match."})
            validate_password(pw, user=self.instance)
        return attrs

    def create(self, validated_data):
        pw = validated_data.pop("password", None)
        user = User(**validated_data)
        if pw:
            user.set_password(pw)
        else:
            user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated_data):
        pw = validated_data.pop("password", None)
        # Prevent role escalation: only admins should change role — enforce in view perms if needed
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if pw:
            instance.set_password(pw)
        instance.save()
        return instance

class ClientSerializer(serializers.ModelSerializer):
    assigned_agent = serializers.SlugRelatedField(
        slug_field='username', queryset=User.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = Client
        fields = '__all__'
        read_only_fields = ('created_at',)

# serializers.py
# clients/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from properties.models import Client

User = get_user_model()

class ClientRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = [
            'full_name',
            'email',
            'phone',
            'preferences',
            'client_type',
            'assigned_agent',
        ]

# users/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]
