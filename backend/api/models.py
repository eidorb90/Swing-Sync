"""
╔════════════════════════════════════════════════════════════════════╗
║ Python Script                                                      ║
╠════════════════════════════════════════════════════════════════════╣
║ Author : Brodie Rogers                                             ║
║ Contact : Brodieman500@gmail.com                                   ║
║ Created : 05-06-2025                                               ║
║ Purpose : Database models for golf scoring application             ║
║ Notes : Ollama is the best                                         ║
╚════════════════════════════════════════════════════════════════════╝


This module defines the database models for a golf scoring application.
It includes models for users, courses, tees, holes, rounds, and hole scores,
with relationships that reflect the structure of golf course data and scoring.
"""

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.core.validators import RegexValidator
from django.utils.timezone import now


class User(AbstractUser):
    """
    Extended user model with additional fields for golf app functionality.

    Adds tracking for online status, phone numbers, and preferred course,
    while extending Django's built-in user authentication model.
    """

    phone_regex = RegexValidator(
        regex=r"^\+?1?\d{9,15}$",
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.",
    )

    phone_number = models.CharField(validators=[phone_regex], max_length=17, blank=True)
    course_name = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(null=True, blank=True)
    is_online = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        """
        Override save method to add custom behavior.

        Normalizes username to lowercase and updates online status
        based on login activity time thresholds.

        Args:
            *args: Variable length argument list
            **kwargs: Arbitrary keyword arguments
        """
        self.username = self.username.lower()

        if self.last_login:
            time_since_last_login = now() - self.last_login
            if time_since_last_login.total_seconds() > 3600:
                self.is_online = False
            else:
                self.is_online = True

        super().save(*args, **kwargs)

    class Meta:
        verbose_name = _("user")
        verbose_name_plural = _("users")

    def __str__(self):
        """
        String representation of user with online status.

        Returns:
            str: Username with online/offline indicator
        """
        status = "online" if self.is_online else "offline"
        return f"{self.username} ({status})"

    def has_field_changed(self, field_name):
        if not self.pk:
            return True
        old_value = User.objects.get(pk=self.pk).__dict__[field_name]
        return old_value != self.__dict__[field_name]

    def check_password(self, raw_password):
        """Validate password against stored hash"""
        return check_password(raw_password, self.password)


class Course(models.Model):
    """
    Golf course model with location and identification information.

    Stores basic course details including name, address, and geographic
    coordinates for mapping functionality.
    """

    club_name = models.CharField(max_length=100)
    course_name = models.CharField(max_length=100)
    address = models.CharField(max_length=200)
    city = models.CharField(max_length=50)
    state = models.CharField(max_length=50)
    country = models.CharField(max_length=50)
    latitude = models.FloatField()
    longitude = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        """
        String representation of course.

        Returns:
            str: Course name
        """
        return self.course_name


class Tee(models.Model):
    """
    Tee box model with difficulty ratings and course measurements.

    Contains detailed rating information used for handicap calculations
    and course statistics, with different ratings for front and back nine.
    """

    GENDER_CHOICES = [
        ("M", "Male"),
        ("F", "Female"),
    ]

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="tees")
    tee_name = models.CharField(max_length=50)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    course_rating = models.FloatField()
    slope_rating = models.IntegerField()
    bogey_rating = models.FloatField()
    total_yards = models.IntegerField()
    total_meters = models.IntegerField()
    number_of_holes = models.IntegerField()
    par_total = models.IntegerField()
    front_course_rating = models.FloatField()
    front_slope_rating = models.IntegerField()
    front_bogey_rating = models.FloatField()
    back_course_rating = models.FloatField()
    back_slope_rating = models.IntegerField()
    back_bogey_rating = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        """
        String representation of tee with course name, tee name, and gender.

        Returns:
            str: Formatted tee information
        """
        return (
            f"{self.course.course_name} - {self.tee_name} ({self.get_gender_display()})"
        )


class Hole(models.Model):
    """
    Golf hole model with difficulty and distance information.

    Represents a single hole on a course with its number, par,
    distance, and relative difficulty (handicap).
    """

    tee = models.ForeignKey(Tee, on_delete=models.CASCADE, related_name="holes")
    hole_number = models.IntegerField()
    par = models.IntegerField()
    yardage = models.IntegerField()
    handicap = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["hole_number"]

    def __str__(self):
        """
        String representation of hole with course name and hole number.

        Returns:
            str: Course name and hole number
        """
        return f"{self.tee.course.course_name} - Hole {self.hole_number}"


class HoleScore(models.Model):
    """
    Score and statistics model for a single hole in a round.

    Tracks detailed performance metrics for a specific hole, including
    strokes, putts, accuracy, and penalties.
    """

    round = models.ForeignKey(
        "Round", on_delete=models.CASCADE, related_name="hole_scores"
    )
    hole = models.ForeignKey(Hole, on_delete=models.CASCADE)
    strokes = models.IntegerField()
    putts = models.IntegerField(default=0)
    fairway_hit = models.BooleanField(default=False)
    green_in_regulation = models.BooleanField(default=False)
    penalties = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["hole__hole_number"]

    def __str__(self):
        """
        String representation of hole score.

        Returns:
            str: Hole number and stroke count
        """
        return f"Hole {self.hole.hole_number} - {self.strokes} strokes"


class Round(models.Model):
    """
    Golf round model with player, course, and date information.

    Serves as the parent record for a complete round of golf, with
    calculated properties for various performance statistics.
    """

    tee = models.ForeignKey(Tee, on_delete=models.CASCADE)
    player = models.ForeignKey(User, on_delete=models.CASCADE)
    date_played = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    is_complete = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def total_score(self):
        """
        Calculate total strokes for the round.

        Returns:
            int: Sum of strokes across all holes
        """
        return sum(score.strokes for score in self.hole_scores.all())

    @property
    def front_nine_score(self):
        """
        Calculate score for the front nine holes.

        Returns:
            int: Sum of strokes for holes 1-9
        """
        return sum(
            score.strokes
            for score in self.hole_scores.all()
            if score.hole.hole_number <= 9
        )

    @property
    def back_nine_score(self):
        """
        Calculate score for the back nine holes.

        Returns:
            int: Sum of strokes for holes 10-18
        """
        return sum(
            score.strokes
            for score in self.hole_scores.all()
            if score.hole.hole_number > 9
        )

    @property
    def green_in_regulation(self):
        """
        Calculate percentage of greens hit in regulation.

        Returns:
            float: Percentage of greens in regulation (0-100)
        """
        hole_scores = self.hole_scores.all()
        if not hole_scores:
            return 0.0
        return round(
            (
                sum(score.green_in_regulation for score in self.hole_scores.all())
                / len(self.hole_scores.all())
                * 100
            ),
            2,
        )

    @property
    def fairways_hit_percent(self):
        """
        Calculate percentage of fairways hit.

        Returns:
            float: Percentage of fairways hit (0-100)
        """
        hole_scores = self.hole_scores.all()
        if not hole_scores:
            return 0.0
        return round(
            (sum(score.fairway_hit for score in hole_scores) / len(hole_scores) * 100),
            2,
        )

    @property
    def putt_total(self):
        """
        Calculate total number of putts.

        Returns:
            int: Sum of putts across all holes
        """
        return sum(score.putts for score in self.hole_scores.all())

    @property
    def putt_per_hole(self):
        """
        Calculate average putts per hole.

        Returns:
            float: Average number of putts per hole
        """
        hole_scores = self.hole_scores.all()
        if not hole_scores:
            return 0.0
        return round(self.putt_total / len(self.hole_scores.all()), 2)

    @property
    def penalties_total(self):
        """
        Calculate total penalty strokes.

        Returns:
            int: Sum of penalties across all holes
        """
        return sum(score.penalties for score in self.hole_scores.all())

    @property
    def penalties_per_hole(self):
        """
        Calculate average penalties per hole.

        Returns:
            float: Average number of penalties per hole
        """
        hole_scores = self.hole_scores.all()
        if not hole_scores:
            return 0.0
        return round(self.penalties_total / len(self.hole_scores.all()), 2)

    def __str__(self):
        """
        String representation of round with player, course, and date.

        Returns:
            str: Formatted round information
        """
        return (
            f"{self.player.username} - {self.course.course_name} ({self.date_played})"
        )
