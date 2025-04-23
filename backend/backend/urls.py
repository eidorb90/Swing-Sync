from django.contrib import admin
from django.urls import path, include
from api.views import (
    CreateUserView,
    LoginUserView,
    CourseSearchAPIView,
    SavedCourseView,
    RoundView,
    UsersView,
    CourseTeeView,
    TeeHoleView,
    ChatBotView,
    VisionChatBotView,
    UserStats,
    LeaderBoardView,
    VisionChatBotView,
    CourseTeeDebugView,
    HealthCheckView
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path("api/health/", HealthCheckView.as_view(), name="health_check"),
    path("admin/", admin.site.urls),
    # API endpoints
    # User section
    path("api/user/signup/", CreateUserView.as_view(), name="signup"),
    path("api/user/login/", LoginUserView.as_view(), name="login"),
    path("api/user/", UsersView.as_view(), name="users"),
    path("api/user/<int:user_id>", UsersView.as_view(), name="user_detail"),
    path("api/player/<int:user_id>/stats", UserStats.as_view(), name="player_stats"),
    path("api/leaderboard/", LeaderBoardView.as_view(), name="leaderboard"),
    # Token section
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    # Course section
    path("api/course/search/", CourseSearchAPIView.as_view(), name="course_search"),
    path("api/courses/", SavedCourseView.as_view(), name="courses"),
    path(
        "api/courses/<int:course_id>/tees/",
        CourseTeeView.as_view(),
        name="course_tee_detail",
    ),
    path("api/tees/<int:tee_id>/holes/", TeeHoleView.as_view(), name="tee_hole_detail"),
    # Round section
    path("api/rounds/", RoundView.as_view(), name="round"),
    path("api/rounds/<int:round_id>", RoundView.as_view(), name="round_detail"),
    path("api-auth", include("rest_framework.urls")),
    # custom ai chatbot section
    path("api/chat/", ChatBotView.as_view(), name="chatbot"),
    path("api/vision/", VisionChatBotView.as_view(), name="vision_chatbot"),
    path(
        "api/courses/<int:course_id>/tees/debug/",
        CourseTeeDebugView.as_view(),
        name="course_tee_debug",
    ),
]
