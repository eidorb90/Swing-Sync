from django.db import models
from django.contrib.auth.models import User as DjangoUser  # Add this import at the top


# Create your models here.
class User(models.Model):
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    username = models.CharField(max_length=50)
    email = models.EmailField()
    password = models.CharField(max_length=20)
    phone_number = models.CharField(max_length=15)
    course_name = models.CharField(max_length=50)

    def __str__(self):
        return self.username

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)


class Course(models.Model):
    club_name = models.CharField(max_length=100)
    course_name = models.CharField(max_length=100)
    address = models.CharField(max_length=200)
    city = models.CharField(max_length=50)
    state = models.CharField(max_length=50)
    country = models.CharField(max_length=50)
    latitude = models.FloatField()
    longitude = models.FloatField()

    def __str__(self):
        return self.course_name


class Tee(models.Model):
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

    def __str__(self):
        return (
            f"{self.course.course_name} - {self.tee_name} ({self.get_gender_display()})"
        )


class Hole(models.Model):
    tee = models.ForeignKey(Tee, on_delete=models.CASCADE, related_name="holes")
    hole_number = models.IntegerField()
    par = models.IntegerField()
    yardage = models.IntegerField()
    handicap = models.IntegerField()

    class Meta:
        ordering = ["hole_number"]

    def __str__(self):
        return f"{self.tee.course.course_name} - Hole {self.hole_number}"


class HoleScore(models.Model):
    round = models.ForeignKey(
        "Round", on_delete=models.CASCADE, related_name="hole_scores"
    )
    hole = models.ForeignKey(Hole, on_delete=models.CASCADE)
    strokes = models.IntegerField()
    putts = models.IntegerField(default=0)
    fairway_hit = models.BooleanField(default=False)
    green_in_regulation = models.BooleanField(default=False)
    penalties = models.IntegerField(default=0)

    class Meta:
        ordering = ["hole__hole_number"]

    def __str__(self):
        return f"Hole {self.hole.hole_number} - {self.strokes} strokes"


class Round(models.Model):
    tee = models.ForeignKey(Tee, on_delete=models.CASCADE)
    player = models.ForeignKey(DjangoUser, on_delete=models.CASCADE)
    date_played = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    is_complete = models.BooleanField(default=False)

    @property
    def total_score(self):
        return sum(score.strokes for score in self.hole_scores.all())

    @property
    def front_nine_score(self):
        return sum(
            score.strokes
            for score in self.hole_scores.all()
            if score.hole.hole_number <= 9
        )

    @property
    def back_nine_score(self):
        return sum(
            score.strokes
            for score in self.hole_scores.all()
            if score.hole.hole_number > 9
        )

    @property
    def green_in_regulation(self):
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
        return round(
            (
                sum(score.fairway_hit for score in self.hole_scores.all())
                / len(self.hole_scores.all())
                * 100
            ),
            2,
        )

    @property
    def putt_total(self):
        return sum(score.putts for score in self.hole_scores.all())

    @property
    def putt_per_hole(self):
        return round(self.putt_total / len(self.hole_scores.all()), 2)

    @property
    def penalties_total(self):
        return sum(score.penalties for score in self.hole_scores.all())

    @property
    def penalties_per_hole(self):
        return round(self.penalties_total / len(self.hole_scores.all()), 2)

    def __str__(self):
        return (
            f"{self.player.username} - {self.course.course_name} ({self.date_played})"
        )
