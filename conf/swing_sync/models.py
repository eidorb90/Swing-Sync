from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile
import uuid

# Create your models here.
class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    username = models.CharField(max_length=50, unique=True)
    private = models.BooleanField(default=False)

    profile_image = models.ImageField(
        upload_to="profile_pic/",
        validators=[FileExtensionValidator(["png", "jpg", "jpeg", "gif"])],
        blank=True,
        null=True,
        default="profile_pic/default.png",
    )
    followers = models.ManyToManyField(
        "self", through="UserFollowing", symmetrical=False, related_name="following"
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.username

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def save(self, *args, **kwargs):
        if not self._state.adding:
            try:
                old_instance = self.__class__.objects.get(pk=self.pk)
            except self.__class__.DoesNotExist:
                old_instance = None
        else:
            old_instance = None

        if (
            old_instance
            and old_instance.profile_image != self.profile_image
            and self.profile_image
        ):
            # Process new profile image
            img = Image.open(self.profile_image)
            img.thumbnail((300, 300), Image.LANCZOS)
            if img.mode != "RGB":
                img = img.convert("RGB")

            buffer = BytesIO()
            img.save(buffer, format="PNG", quality=85)
            filename = f"{self.username}{self.id}.png"

            self.profile_image.save(
                filename, ContentFile(buffer.getvalue()), save=False
            )

        super().save(*args, **kwargs)



class UserFollowing(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="following_relationships"
    )
    following_user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="follower_relationships"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "following_user")

    def __str__(self):
        return f"{self.user.username} follows {self.following_user.username}"
