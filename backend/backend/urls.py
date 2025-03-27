from django.contrib import admin
from django.urls import path, include
from api.views import (
    CreateUserView,
    LoginUserView,
    CourseSearchAPIView,
    SavedCourseView,
    RoundView,
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    path("api/user/login/", LoginUserView.as_view(), name="login"),
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api/course/search/", CourseSearchAPIView.as_view(), name="course_search"),
    path("api/courses/", SavedCourseView.as_view(), name="saved_courses"),
    path("api/rounds/", RoundView.as_view(), name="round_scorecard"),
    path(
        "api/rounds/<int:round_id>", RoundView.as_view(), name="round_detail"
    ),  # Removed trailing slash
    path("api-auth", include("rest_framework.urls")),
]
