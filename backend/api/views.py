from django.shortcuts import render, redirect, get_object_or_404
from .models import User
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth import authenticate
from .serializers import (
    UserSerializer,
    LoginSerializer,
    CourseSerializer,
)
from django.http import StreamingHttpResponse
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Course, Tee, Hole, Round, HoleScore
import os
import requests
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import transaction
from .chat_bot import ChatBot
from .ollama_vision import ChatBot as VisionChatBot
from django.utils import timezone
import tempfile
import builtins
import logging

# Set up logger
logger = logging.getLogger(__name__)


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class LoginUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")
        email = request.data.get("email")

        # Authenticate the user
        user = authenticate(username=username, password=password)

        if user is not None:
            # Update user status
            user.is_online = True
            user.last_login = timezone.now()
            user.save()

            # Generate token
            refresh = RefreshToken.for_user(user)

            return Response(
                {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user_id": user.id,
                    "username": user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "email": user.email,
                },
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
            )


class UsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id=None):
        if user_id:
            user = get_object_or_404(User, pk=user_id)
            return Response({"user": UserSerializer(user).data})
        else:
            users = User.objects.all()
            return Response({"users": UserSerializer(users, many=True).data})


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

            data = response.json()

            saved_courses = []
            for course_data in data.get("courses", []):
                try:
                    saved_course = self.save_single_course(course_data)
                    if saved_course:
                        saved_courses.append(saved_course.id)
                except Exception as e:
                    print(
                        f"Error saving course {course_data.get('course_name')}: {str(e)}"
                    )
                    import traceback

                    traceback.print_exc()

            return Response(data)

        except requests.RequestException as e:
            error_message = f"Golf API error: {str(e)}"
            if hasattr(e, "response") and e.response is not None:
                error_message += f" - {e.response.text}"
            return Response(
                {"error": error_message},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def save_single_course(self, course_data):
        """Process and save a single course and its tees"""
        try:
            location = course_data.get("location", {})
            course_id = course_data.get("id")

            course, created = Course.objects.update_or_create(
                id=course_id,
                defaults={
                    "club_name": course_data.get("club_name", ""),
                    "course_name": course_data.get("course_name", ""),
                    "address": location.get("address", ""),
                    "city": location.get("city", ""),
                    "state": location.get("state", ""),
                    "country": location.get("country", ""),
                    "latitude": location.get("latitude", 0.0),
                    "longitude": location.get("longitude", 0.0),
                },
            )

            tees_data = course_data.get("tees", {})

            for tee_data in tees_data.get("female", []):
                self._create_or_update_tee(course, tee_data, "F")

            for tee_data in tees_data.get("male", []):
                self._create_or_update_tee(course, tee_data, "M")

            return course

        except Exception as e:
            print(f"Error in save_single_course: {str(e)}")
            import traceback

            traceback.print_exc()
            return None

    def _create_or_update_tee(self, course, tee_data, gender):
        """Helper method to create or update a tee and its holes"""
        try:
            tee_name = tee_data.get("tee_name", "").strip()

            print(
                f"Processing tee: {tee_name} ({gender}) for course {course.course_name}"
            )

            tee, created = Tee.objects.update_or_create(
                course=course,
                tee_name=tee_name,
                gender=gender,
                defaults={
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

            for i, hole_data in enumerate(tee_data.get("holes", []), 1):
                hole, hole_created = Hole.objects.update_or_create(
                    tee=tee,
                    hole_number=i,
                    defaults={
                        "par": hole_data.get("par", 4),
                        "yardage": hole_data.get("yardage", 0),
                        "handicap": hole_data.get("handicap", 0),
                    },
                )

            return tee
        except Exception as e:
            print(f"Error creating tee {tee_data.get('tee_name')}: {str(e)}")
            import traceback

            traceback.print_exc()
            return None


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
        """
        Create or update a round record with hole scores.

        Parameters:
        - course_id: ID of the course
        - tee_name: Name of the tee (will be used to look up the tee_id)
        - date_played: ISO format date (optional)
        - notes: Additional notes about the round (optional)
        - hole_scores: List of scores for each hole with structure:
            {
                hole_id: ID of the hole,
                strokes: Number of strokes,
                putts: Number of putts (optional),
                fairway_hit: Boolean (optional),
                green_in_regulation: Boolean (optional),
                penalties: Number of penalties (optional)
            }
        """
        try:
            data = request.data.copy()
            logger.info(f"Processing round data: {data}")

            # Required fields validation
            required_fields = ["course_id", "tee_name"]
            for field in required_fields:
                if field not in data:
                    return Response(
                        {"error": f"Missing required field: {field}"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            course_id = data.get("course_id")
            tee_name = data.get("tee_name", "").strip()

            try:
                # Get the course
                course = Course.objects.get(id=course_id)
                logger.info(f"Found course: {course.course_name} (ID: {course.id})")

                # Find the tee by name
                tee = Tee.objects.filter(
                    course=course, tee_name__iexact=tee_name
                ).first()

                if not tee:
                    # Log available tees for debugging
                    available_tees = Tee.objects.filter(course=course)
                    tee_names = [t.tee_name for t in available_tees]
                    logger.error(
                        f"Tee '{tee_name}' not found. Available tees: {', '.join(tee_names)}"
                    )

                    return Response(
                        {
                            "error": f"Tee '{tee_name}' not found for this course",
                            "available_tees": tee_names,
                        },
                        status=status.HTTP_404_NOT_FOUND,
                    )

                logger.info(f"Found tee: {tee.tee_name} (ID: {tee.id})")
                data["tee_id"] = tee.id

            except Course.DoesNotExist:
                return Response(
                    {"error": f"Course with ID {course_id} not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Process hole scores
            hole_scores_data = data.get("hole_scores", [])
            if not hole_scores_data:
                return Response(
                    {"error": "No hole scores provided"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Update existing round
            if round_id is not None:
                round_obj = get_object_or_404(Round, id=round_id, player=request.user)
                round_obj.tee = tee
                round_obj.course = course

                if "date_played" in data:
                    round_obj.date_played = data["date_played"]

                round_obj.notes = data.get("notes", round_obj.notes)
                round_obj.save()

                logger.info(f"Updated round: {round_obj.id}")

                # Update hole scores
                for score_data in hole_scores_data:
                    hole_id = score_data.get("hole_id")
                    if not hole_id:
                        continue

                    hole = get_object_or_404(Hole, id=hole_id)

                    HoleScore.objects.update_or_create(
                        round=round_obj,
                        hole=hole,
                        defaults={
                            "strokes": score_data.get("strokes", 0),
                            "putts": score_data.get("putts", 0),
                            "fairway_hit": score_data.get("fairway_hit", False),
                            "green_in_regulation": score_data.get(
                                "green_in_regulation", False
                            ),
                            "penalties": score_data.get("penalties", 0),
                        },
                    )

                message = "Scorecard updated successfully"
                status_code = status.HTTP_200_OK

            # Create new round
            else:
                round_obj = Round.objects.create(
                    tee=tee,
                    player=request.user,
                    course=course,
                    notes=data.get("notes", ""),
                )

                if "date_played" in data:
                    round_obj.date_played = data["date_played"]
                    round_obj.save()

                logger.info(f"Created new round: {round_obj.id}")

                # Create hole scores
                for score_data in hole_scores_data:
                    hole_id = score_data.get("hole_id")
                    if not hole_id:
                        continue

                    try:
                        hole = Hole.objects.get(id=hole_id)

                        HoleScore.objects.create(
                            round=round_obj,
                            hole=hole,
                            strokes=score_data.get("strokes", 0),
                            putts=score_data.get("putts", 0),
                            fairway_hit=score_data.get("fairway_hit", False),
                            green_in_regulation=score_data.get(
                                "green_in_regulation", False
                            ),
                            penalties=score_data.get("penalties", 0),
                        )
                    except Hole.DoesNotExist:
                        logger.warning(f"Hole with ID {hole_id} not found. Skipping.")
                        continue

                message = "Scorecard created successfully"
                status_code = status.HTTP_201_CREATED

            # Calculate total score
            total_score = sum(score.strokes for score in round_obj.hole_scores.all())

            return Response(
                {
                    "id": round_obj.id,
                    "player": round_obj.player.username,
                    "date_played": round_obj.date_played,
                    "total_score": total_score,
                    "message": message,
                },
                status=status_code,
            )

        except Exception as e:
            logger.exception(f"Error processing round: {str(e)}")
            return Response(
                {"error": f"Failed to process round: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def get(self, request, round_id=None):
        """
        Get round details or list of rounds.

        If round_id is provided, returns detailed information about that round.
        Otherwise, returns a list of rounds for the current user.
        """
        if round_id:
            try:
                round_obj = Round.objects.prefetch_related("hole_scores__hole").get(
                    id=round_id
                )

                # Check if user has permission to view this round
                if round_obj.player != request.user:
                    return Response(
                        {"error": "You are not permitted to view this round"},
                        status=status.HTTP_403_FORBIDDEN,
                    )

                return Response(
                    {
                        "id": round_obj.id,
                        "player": round_obj.player.username,
                        "date_played": round_obj.date_played,
                        "course": round_obj.course.course_name,
                        "tee": round_obj.tee.tee_name,
                        "total_score": round_obj.total_score,
                        "front_nine": round_obj.front_nine_score,
                        "back_nine": round_obj.back_nine_score,
                        "green_in_regulation": round_obj.green_in_regulation,
                        "fairways_hit_percent": round_obj.fairways_hit_percent,
                        "putt_total": round_obj.putt_total,
                        "putt_per_hole": round_obj.putt_per_hole,
                        "penalties_total": round_obj.penalties_total,
                        "penalties_per_hole": round_obj.penalties_per_hole,
                        "notes": round_obj.notes,
                        "hole_scores": [
                            {
                                "hole": score.hole.hole_number,
                                "par": score.hole.par,
                                "yardage": score.hole.yardage,
                                "handicap": score.hole.handicap,
                                "strokes": score.strokes,
                                "putts": score.putts,
                                "fairway_hit": score.fairway_hit,
                                "green_in_regulation": score.green_in_regulation,
                                "penalties": score.penalties,
                            }
                            for score in round_obj.hole_scores.all().order_by(
                                "hole__hole_number"
                            )
                        ],
                    },
                    status=status.HTTP_200_OK,
                )
            except Round.DoesNotExist:
                return Response(
                    {"error": f"Round with ID {round_id} not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            # Return list of rounds for current user
            rounds = Round.objects.filter(player=request.user).order_by("-date_played")

            return Response(
                [
                    {
                        "id": round_obj.id,
                        "date_played": round_obj.date_played,
                        "course": round_obj.course.course_name,
                        "tee": round_obj.tee.tee_name,
                        "total_score": round_obj.total_score,
                    }
                    for round_obj in rounds
                ],
                status=status.HTTP_200_OK,
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

    def stream_response(self, prompt, rounds_text):
        bot = ChatBot()
        response_stream = bot.answer_question(prompt, rounds_text)

        for chunk in response_stream:
            yield chunk

    def post(self, request):
        prompt = request.data.get("message")
        if not prompt:
            return Response(
                {"error": "Prompt is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            rounds = Round.objects.all().order_by("-date_played")[:5]
            rounds_text = "\n\nRecent rounds data:\n"
            for round in rounds:
                rounds_text += f"- Course: {round.course.course_name}, Date: {round.date_played.strftime('%Y-%m-%d')}, Score: {round.total_score}\n"

            return StreamingHttpResponse(
                self.stream_response(prompt, rounds_text), content_type="text/plain"
            )

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VisionChatBotView(APIView):
    permission_classes = [IsAuthenticated]

    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def post(self, request):
        message = request.data.get("message")
        video_file = request.FILES.get("video")

        if not message and not video_file:
            return Response(
                {"error": "Either message or video is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            bot = VisionChatBot()

            if video_file:
                with tempfile.NamedTemporaryFile(
                    suffix=".mp4", delete=False
                ) as temp_video:
                    for chunk in video_file.chunks():
                        temp_video.write(chunk)
                    video_path = temp_video.name

                try:
                    response = bot.handle_video(video_path)
                finally:
                    if os.path.exists(video_path):
                        os.unlink(video_path)

                return Response({"response": response}, status=status.HTTP_200_OK)
            else:
                response = bot.answer_question(message)
                return Response({"response": response}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserStats(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user = User.objects.get(id=user_id)
        user.save()
        rounds = Round.objects.filter(player=user).order_by("-date_played")[:10]
        round_count = len(rounds)

        if round_count == 0:
            return Response(
                {
                    "handicap": None,
                    "avg_putts_per_round": 0,
                    "avg_penalities_per_round": 0,
                    "avg_score_per_round": 0,
                    "fairway_hit_percentage": 0,
                    "gir_percentage": 0,
                    "scores_list": [],
                }
            )

        # Initialize counters
        p, pen, s, fir, gir = 0, 0, 0, 0, 0
        differentials = []

        for round in rounds:
            p += round.putt_total
            pen += round.penalties_total
            s += round.total_score
            fir += round.fairways_hit_percent
            gir += round.green_in_regulation

            num_holes = round.hole_scores.count()

            # Handicap calculation using USGA formula, adjusted for 9-hole rounds
            course_rating = round.tee.course_rating
            slope_rating = round.tee.slope_rating

            if num_holes == 9:
                # For 9-hole rounds, double the score and use full course rating
                adjusted_score = round.total_score * 2
                differential = (adjusted_score - course_rating) * 113 / slope_rating
            elif num_holes == 18:
                # Standard calculation for 18 holes
                differential = (round.total_score - course_rating) * 113 / slope_rating
            else:
                continue

            differentials.append(differential)

        avg_p_pr = p / round_count
        avg_pen_pr = pen / round_count
        avg_s_pr = s / round_count
        fhp = fir / round_count
        girp = gir / round_count

        # Calculate handicap index (average of best differentials * 0.96)
        best_differentials = sorted(differentials)[: max(1, round_count // 2)]
        handicap = (
            builtins.round(
                (sum(best_differentials) / len(best_differentials)) * 0.96, 2
            )
            if best_differentials
            else None
        )

        scores_list = [
            {
                "round_id": round_obj.id,
                "date": round_obj.date_played,
                "course": round_obj.course.course_name,
                "scores": [
                    {
                        "hole": score.hole.hole_number,
                        "par": score.hole.par,
                        "strokes": score.strokes,
                        "putts": score.putts,
                        "fairway_hit": score.fairway_hit,
                        "green_in_regulation": score.green_in_regulation,
                        "penalties": score.penalties,
                        "date": round_obj.date_played,
                    }
                    for score in round_obj.hole_scores.all()
                ],
                "note": round_obj.notes,
            }
            for round_obj in rounds
        ]

        return Response(
            {
                "handicap": handicap,
                "avg_putts_per_round": avg_p_pr,
                "avg_penalities_per_round": avg_pen_pr,
                "avg_score_per_round": avg_s_pr,
                "fairway_hit_percentage": fhp,
                "gir_percentage": girp,
                "scores_list": scores_list,
            }
        )


class LeaderBoardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        players = User.objects.all()[:50]
        leader_board = []

        for player in players:
            player_rounds = Round.objects.filter(player=player).order_by(
                "-date_played"
            )[:20]

            round_count = len(player_rounds)
            if round_count == 0:
                continue

            total = 0
            for player_round in player_rounds:
                total += player_round.total_score

            # Calculate handicap using same logic as UserStats view
            differentials = []
            for player_round in player_rounds:
                # Get number of holes in this round by counting hole scores
                num_holes = player_round.hole_scores.count()

                course_rating = player_round.tee.course_rating
                slope_rating = player_round.tee.slope_rating

                if num_holes == 9:
                    # For 9-hole rounds, double the score and use full course rating
                    adjusted_score = player_round.total_score * 2
                    differential = (adjusted_score - course_rating) * 113 / slope_rating
                elif num_holes == 18:
                    # Standard calculation for 18 holes
                    differential = (
                        (player_round.total_score - course_rating) * 113 / slope_rating
                    )
                else:
                    # Skip rounds that don't have exactly 9 or 18 holes
                    continue

                differentials.append(differential)

            # Calculate handicap index
            best_differentials = sorted(differentials)[: max(1, round_count // 2)]
            handicap = None
            if best_differentials:
                handicap = builtins.round(
                    (sum(best_differentials) / len(best_differentials)) * 0.96, 2
                )

            if player.is_online:
                is_online = "Online"
            else:
                is_online = "Offline"

            leader_board.append(
                {
                    "is_online": is_online,
                    "id": player.id,
                    "user_id": player.id,
                    "username": player.username,
                    "average_score": builtins.round(total / round_count, 1),
                    "handicap": handicap,
                    "total_rounds": round_count,
                }
            )

        leader_board.sort(key=lambda x: x["average_score"])

        # Return the sorted leaderboard
        return Response(leader_board)


class CourseTeeDebugView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id)
            tees = Tee.objects.filter(course=course)

            tee_details = [
                {
                    "id": tee.id,
                    "name": tee.tee_name,
                    "gender": tee.gender,
                    "holes_count": tee.holes.count(),
                }
                for tee in tees
            ]

            return Response(
                {
                    "course_id": course.id,
                    "course_name": course.course_name,
                    "tees_count": len(tee_details),
                    "tees": tee_details,
                }
            )
        except Course.DoesNotExist:
            return Response(
                {"error": f"Course with ID {course_id} not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
