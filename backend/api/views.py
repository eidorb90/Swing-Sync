from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.response import Response
from django.contrib.auth import authenticate
from .serializers import UserSerializer, LoginSerializer, CourseSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Course, Tee, Hole
import os
import requests
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken


# Create your views here.


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class LoginUserView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)

        if user:
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user_id": user.pk,
                    "username": user.username,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )


class CourseSearchAPIView(APIView):
    """
    Golf Course Search API endpoint.

    GET Parameters:
        search (str): Search term for finding golf courses

    Headers Required:
        Authorization: Bearer <your_jwt_token>
        Content-Type: application/json

    Returns:
        200: List of matching golf courses
        401: Unauthorized - Invalid or missing token
        500: Internal server error
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        search_query = request.query_params.get("search", "")
        if not search_query:
            return Response(
                {"error": "Search query is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        api_key = os.getenv("GOLF_API_KEY")
        try:
            response = requests.get(
                f"https://api.golfcourseapi.com/v1/search",
                params={"search_query": search_query},
                headers={
                    "Authorization": f"{api_key}",
                    "Content-Type": "application/json",
                },
            )
            response.raise_for_status()
            self.save_course(request, response)
            return Response(response.json())

        except requests.RequestException as e:
            return Response(
                {"error": f"Golf API error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def save_course(self, request, response):
        try:
            data = response.json()

            for course_data in data.get("courses", []):
                # Get location data
                location = course_data.get("location", {})

                # Create or update course
                course, created = Course.objects.update_or_create(
                    club_name=course_data.get("club_name"),
                    course_name=course_data.get("course_name"),
                    defaults={
                        "address": location.get("address", ""),
                        "city": location.get("city", ""),
                        "state": location.get("state", ""),
                        "country": location.get("country", ""),
                        "latitude": location.get("latitude", 0.0),
                        "longitude": location.get("longitude", 0.0),
                    },
                )

                # Process tees by gender
                tees_data = course_data.get("tees", {})

                # Female tees
                for tee_data in tees_data.get("female", []):
                    self._create_or_update_tee(course, tee_data, "F")

                # Male tees
                for tee_data in tees_data.get("male", []):
                    self._create_or_update_tee(course, tee_data, "M")

        except Exception as e:
            print(f"Error saving course data: {str(e)}")
            # You may want to log this error properly in production

    def _create_or_update_tee(self, course, tee_data, gender):
        """Helper method to create or update a tee and its holes"""
        tee, created = Tee.objects.update_or_create(
            course=course,
            tee_name=tee_data.get("tee_name"),
            defaults={
                "gender": gender,
                "course_rating": tee_data.get("course_rating", 0.0),
                "slope_rating": tee_data.get("slope_rating", 0),
                "bogey_rating": tee_data.get("bogey_rating", 0.0),
                "total_yards": tee_data.get("total_yards", 0),
                "total_meters": tee_data.get("total_meters", 0),
                "number_of_holes": tee_data.get("number_of_holes", 18),
                "par_total": tee_data.get("par_total", 72),
                "front_course_rating": tee_data.get("front_course_rating", 0.0),
                "front_slope_rating": tee_data.get("front_slope_rating", 0),
                "front_bogey_rating": tee_data.get("front_bogey_rating", 0.0),
                "back_course_rating": tee_data.get("back_course_rating", 0.0),
                "back_slope_rating": tee_data.get("back_slope_rating", 0),
                "back_bogey_rating": tee_data.get("back_bogey_rating", 0.0),
            },
        )

        # Process holes
        for i, hole_data in enumerate(tee_data.get("holes", []), 1):
            Hole.objects.update_or_create(
                tee=tee,
                hole_number=i,  # Use index+1 since holes aren't numbered in data
                defaults={
                    "par": hole_data.get("par", 4),
                    "yardage": hole_data.get("yardage", 0),
                    "handicap": hole_data.get("handicap", 0),
                },
            )
        return tee


class SavedCourseView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        courses = Course.objects.prefetch_related("tees__holes").all()
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)
