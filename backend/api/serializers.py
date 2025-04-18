from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Course, Hole, Tee, Round
from rest_framework.permissions import IsAuthenticated


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(style={"input_type": "password"}, write_only=True)


class HoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hole
        fields = ["hole_number", "par", "yardage", "handicap"]


class TeeSerializer(serializers.ModelSerializer):
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
