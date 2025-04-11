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
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    # API endpoints
    # User section
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    path("api/user/login/", LoginUserView.as_view(), name="login"),
    path("api/user/", UsersView.as_view(), name="users"),
    path("api/user/<int:user_id>", UsersView.as_view(), name="user_detail"),
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
    path("api/chatbot/", ChatBotView.as_view(), name="chatbot"),
]
