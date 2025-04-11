from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.response import Response
from django.contrib.auth import authenticate
from .serializers import (
    UserSerializer,
    LoginSerializer,
    CourseSerializer,
)
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Course, Tee, Hole, Round, HoleScore
import os
import requests
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import transaction
from .chat_bot import generate_text


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


class UsersView(APIView):
    def get(self, request, user_id=None):
        if user_id:
            return Response(
                {"users": UserSerializer(User.objects.all(), many=True).data}
            )

        return Response({"users": UserSerializer(User.objects.get(pk=user_id)).data})


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
        if not api_key:
            return Response(
                {"error": "Golf API key not configured"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        try:
            response = requests.get(
                f"https://api.golfcourseapi.com/v1/search",
                params={"search_query": search_query},
                headers={
                    "Authorization": f"Key {api_key}",
                    "Content-Type": "application/json",
                },
            )

            if response.status_code == 401:
                return Response(
                    {"error": "Invalid Golf API key"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            response.raise_for_status()
            self.save_course(response)
            return Response(response.json())

        except requests.RequestException as e:
            error_message = f"Golf API error: {str(e)}"
            if (
                hasattr(e, "response") and e.response is not None
            ):  # Safe check for response
                error_message += f" - {e.response.text}"
            return Response(
                {"error": error_message},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def save_course(self, response):
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
                hole_number=i,
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


class RoundView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, round_id=None):
        try:
            data = request.data.copy()
            if round_id is not None:
                # Handle updating an existing round
                round = get_object_or_404(Round, id=round_id, player=request.user)
                round.tee_id = data.get("tee_id", round.tee_id)
                round.date_played = data.get("date_played", round.date_played)
                round.course_id = data.get("course_id", round.course_id)
                round.notes = data.get("notes", round.notes)
                round.save()

                # Update hole scores
                hole_scores = data.get("hole_scores", [])
                for score_data in hole_scores:
                    HoleScore.objects.update_or_create(
                        round=round,
                        hole_id=score_data["hole_id"],
                        defaults={
                            "strokes": score_data["strokes"],
                            "putts": score_data.get("putts", 0),
                            "fairway_hit": score_data.get("fairway_hit", False),
                            "green_in_regulation": score_data.get(
                                "green_in_regulation", False
                            ),
                            "penalties": score_data.get("penalties", 0),
                        },
                    )
            else:
                # Create new round
                round = Round.objects.create(
                    tee_id=data["tee_id"],
                    player=request.user,
                    course_id=data["course_id"],
                    notes=data.get("notes", ""),
                )

                # Create hole scores
                hole_scores = data.get("hole_scores", [])
                for score_data in hole_scores:
                    HoleScore.objects.create(
                        round=round,
                        hole_id=score_data["hole_id"],
                        strokes=score_data["strokes"],
                        putts=score_data.get("putts", 0),
                        fairway_hit=score_data.get("fairway_hit", False),
                        green_in_regulation=score_data.get(
                            "green_in_regulation", False
                        ),
                        penalties=score_data.get("penalties", 0),
                    )

            return Response(
                {
                    "id": round.id,
                    "player": round.player.username,
                    "date_played": round.date_played,
                    "total_score": round.total_score,
                    "message": "Scorecard updated successfully"
                    if round_id
                    else "Scorecard created successfully",
                },
                status=status.HTTP_200_OK if round_id else status.HTTP_201_CREATED,
            )

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, round_id=None):
        if round_id:
            round = get_object_or_404(
                Round.objects.prefetch_related("hole_scores"), id=round_id
            )
            return Response(
                {
                    "id": round.id,
                    "player": round.player.username,
                    "date_played": round.date_played,
                    "course": round.course.course_name,
                    "total_score": round.total_score,
                    "front_nine": round.front_nine_score,
                    "back_nine": round.back_nine_score,
                    "green_in_regulation": round.green_in_regulation,
                    "fairways_hit_percent": round.fairways_hit_percent,
                    "putt_total": round.putt_total,
                    "putt_per_hole": round.putt_per_hole,
                    "penalties_total": round.penalties_total,
                    "penalties_per_hole": round.penalties_per_hole,
                    "hole_scores": [
                        {
                            "hole": score.hole.hole_number,
                            "par": score.hole.par,
                            "strokes": score.strokes,
                            "putts": score.putts,
                            "fairway_hit": score.fairway_hit,
                            "green_in_regulation": score.green_in_regulation,
                            "penalties": score.penalties,
                        }
                        for score in round.hole_scores.all()
                    ],
                }
            )

        rounds = Round.objects.filter(player=request.user).order_by("-date_played")
        return Response(
            [
                {
                    "id": round.id,
                    "date_played": round.date_played,
                    "course": round.course.course_name,
                    "total_score": round.total_score,
                }
                for round in rounds
            ]
        )


class CourseTeeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)
        tees = Tee.objects.filter(course=course).prefetch_related("holes")
        serializer = CourseSerializer(tees, many=True)
        return Response(serializer.data)


class TeeHoleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, tee_id):
        tee = get_object_or_404(Tee, id=tee_id)
        holes = Hole.objects.filter(tee=tee)
        serializer = CourseSerializer(holes, many=True)
        return Response(serializer.data)


class ChatBotView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        prompt = request.data.get("message")
        if not prompt:
            return Response(
                {"error": "Prompt is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            response = generate_text(prompt)
            return Response({"response": response}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
