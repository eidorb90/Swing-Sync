from django.db import models


# Create your models here.
class User(models.Model):
    username = models.CharField(max_length=50)
    email = models.EmailField()
    password = models.CharField(max_length=20)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    phone_number = models.CharField(max_length=15)
    city_name = models.CharField(max_length=50)

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
