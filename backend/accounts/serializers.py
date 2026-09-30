from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "date_joined")
        read_only_fields = ("id", "username", "date_joined")


class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "first_name", "last_name")
        read_only_fields = ("id",)

    def validate_password(self, value):
        validate_password(value, user=User(**self.initial_data))
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=False, allow_blank=False)
    email = serializers.EmailField(required=False)
    password = serializers.CharField(trim_whitespace=False, write_only=True)

    def validate(self, attrs):
        identifier = attrs.get("username") or attrs.get("email")
        if not identifier:
            raise serializers.ValidationError({"username": "Provide a username or email address."})
        username = identifier
        if "@" in identifier:
            user = User.objects.filter(email__iexact=identifier).first()
            username = user.get_username() if user else identifier
        request = self.context.get("request")
        user = authenticate(request=request, username=username, password=attrs["password"])
        if not user:
            raise serializers.ValidationError("Invalid username/email or password.")
        attrs["user"] = user
        return attrs


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("username", "email", "first_name", "last_name", "date_joined")
        read_only_fields = ("username", "date_joined")
