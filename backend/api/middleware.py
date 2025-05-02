from datetime import timedelta
from django.utils import timezone
from django.conf import settings


class UserOnlineStatusMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.online_timeout = getattr(settings, "USER_ONLINE_TIMEOUT", 15 * 60)

    def __call__(self, request):
        if request.user.is_authenticated:
            current_time = timezone.now()

            update_threshold = current_time - timedelta(minutes=5)

            if (
                not request.user.last_login
                or request.user.last_login < update_threshold
            ):
                request.user.last_login = current_time
                request.user.is_online = True
                request.user.save(update_fields=["last_login", "is_online"])
        print(
            f"User {request.user.username} last login updated to {request.user.last_login}, {'Online' if request.user.is_online else 'Offline'}"
        )
        response = self.get_response(request)

        return response
