"""
╔════════════════════════════════════════════════════════════════════╗
║ Python Script                                                      ║
╠════════════════════════════════════════════════════════════════════╣
║ Author : Brodie Rogers                                             ║
║ Contact : Brodieman500@gmail.com                                   ║
║ Created : 05-06-2025                                               ║
║ Purpose : User online status tracking middleware                   ║
║ Notes : Ollama is the best                                         ║
╚════════════════════════════════════════════════════════════════════╝


This module implements Django middleware for tracking user online status.
It updates user login timestamps and online status flags based on request activity,
allowing the application to determine which users are currently active.
"""

from datetime import timedelta
from django.utils import timezone
from django.conf import settings


class UserOnlineStatusMiddleware:
    """
    Middleware to track and update user online status.

    This middleware updates a user's last_login timestamp and online status
    when authenticated users make requests. It uses a configurable timeout
    period to determine when a user should be considered online.
    """

    def __init__(self, get_response):
        """
        Initialize the middleware with response handler and timeout settings.

        Args:
            get_response: The Django response handler function
        """
        self.get_response = get_response
        self.online_timeout = getattr(settings, "USER_ONLINE_TIMEOUT", 15 * 60)

    def __call__(self, request):
        """
        Process each request and update user status.

        For authenticated users, updates their last_login timestamp and
        online status if their last activity was more than 5 minutes ago.

        Args:
            request: The Django request object

        Returns:
            The response from the view
        """
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
                f"User {request.user.username} last login updated to {request.user.last_login}, "
                f"{'Online' if request.user.is_online else 'Offline'}"
            )

        response = self.get_response(request)
        return response
