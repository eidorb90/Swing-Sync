"""
╔════════════════════════════════════════════════════════════════════╗
║ Python Script                                                      ║
╠════════════════════════════════════════════════════════════════════╣
║ Author : Brodie Rogers                                             ║
║ Contact : Brodieman500@gmail.com                                   ║
║ Created : 05-06-2025                                               ║
║ Purpose : REST API serializers for data transformation             ║
║ Notes : Ollama is the best                                         ║
╚════════════════════════════════════════════════════════════════════╝


This module contains serializer classes for transforming database models
into JSON representations and validating incoming data for the REST API.
It includes serializers for users, courses, holes, tees, and authentication.
"""

from .models import User
from rest_framework import serializers
from .models import Course, Hole, Tee, Round
from rest_framework.permissions import IsAuthenticated


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model.

    Handles user registration with validation for unique usernames.
    Password field is write-only for security.
    """

    class Meta:
        model = User
        fields = ["username", "password", "email", "first_name", "last_name"]
        extra_kwargs = {"password": {"write_only": True}}

    def validate_username(self, value):
        """
        Validate that the username is unique.

        Args:
            value: The username to validate

        Returns:
            The validated username

        Raises:
            ValidationError: If username already exists
        """
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def create(self, validated_data):
        """
        Create and return a new user instance.

        Uses Django's create_user method to properly handle password hashing.

        Args:
            validated_data: Dictionary of validated form data

        Returns:
            User: The newly created user instance
        """
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )
        return user


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login authentication.

    Handles validation of username and password credentials.
    """

    username = serializers.CharField()
    password = serializers.CharField(style={"input_type": "password"}, write_only=True)


class HoleSerializer(serializers.ModelSerializer):
    """
    Serializer for golf course holes.

    Provides details about individual holes including par, yardage and handicap.
    """

    class Meta:
        model = Hole
        fields = ["hole_number", "par", "yardage", "handicap"]


class TeeSerializer(serializers.ModelSerializer):
    """
    Serializer for golf course tee boxes.

    Includes nested hole information and comprehensive rating details
    for different sections of the course.
    """

    holes = HoleSerializer(many=True, read_only=True)

    class Meta:
        model = Tee
        fields = [
            "id",
            "tee_name",
            "gender",
            "course_rating",
            "slope_rating",
            "bogey_rating",
            "total_yards",
            "total_meters",
            "number_of_holes",
            "par_total",
            "front_course_rating",
            "front_slope_rating",
            "front_bogey_rating",
            "back_course_rating",
            "back_slope_rating",
            "back_bogey_rating",
            "holes",
        ]


class CourseSerializer(serializers.ModelSerializer):
    """
    Serializer for golf courses.

    Includes comprehensive course information and nested tee data
    with their associated holes.
    """

    tees = TeeSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = [
            "id",
            "club_name",
            "course_name",
            "address",
            "city",
            "state",
            "country",
            "latitude",
            "longitude",
            "tees",
        ]
