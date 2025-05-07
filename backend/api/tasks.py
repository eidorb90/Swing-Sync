"""
╔════════════════════════════════════════════════════════════════════╗
║ Python Script                                                      ║
╠════════════════════════════════════════════════════════════════════╣
║ Author : Brodie Rogers                                             ║
║ Contact : Brodieman500@gmail.com                                   ║
║ Created : 05-06-2025                                               ║
║ Purpose : Scheduled tasks for user status management               ║
║ Notes : Ollama is the best                                         ║
╚════════════════════════════════════════════════════════════════════╝

This module contains Celery tasks for managing user online status.
It automatically updates users to offline status after a period of inactivity.
"""

from celery import shared_task
from django.utils import timezone
from django.conf import settings
from datetime import timedelta
from django.contrib.auth import get_user_model

User = get_user_model()


@shared_task
def update_user_status():
    """
    Celery task to update user online status.

    Identifies users who have been inactive beyond the timeout period
    (default: 15 minutes) and updates their status to offline.

    Returns:
        str: Message indicating how many users were updated
    """
    timeout = getattr(settings, "USER_ONLINE_TIMEOUT", 15 * 60)
    cutoff_time = timezone.now() - timedelta(seconds=timeout)

    updated = User.objects.filter(is_online=True, last_login__lt=cutoff_time).update(
        is_online=False
    )

    return f"Updated {updated} users to offline status"
