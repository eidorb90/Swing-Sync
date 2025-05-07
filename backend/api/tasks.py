from celery import shared_task
from django.utils import timezone
from django.conf import settings
from datetime import timedelta
from django.contrib.auth import get_user_model

User = get_user_model()


@shared_task
def update_user_status():
    timeout = getattr(settings, "USER_ONLINE_TIMEOUT", 15 * 60)
    cutoff_time = timezone.now() - timedelta(seconds=timeout)

    updated = User.objects.filter(is_online=True, last_login__lt=cutoff_time).update(
        is_online=False
    )

    return f"Updated {updated} users to offline status"
