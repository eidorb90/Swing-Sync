"""
╔════════════════════════════════════════════════════════════════════╗
║ Python Script                                                      ║
╠════════════════════════════════════════════════════════════════════╣
║ Author : Brodie Rogers                                             ║
║ Contact : Brodieman500@gmail.com                                   ║
║ Created : 05-06-2025                                               ║
║ Purpose : Form classes for user registration and golf scorecards   ║
║ Notes : Ollama is the best                                         ║
╚════════════════════════════════════════════════════════════════════╝

This module contains Django form classes for handling user registration,
authentication, and golf scorecard input. Forms include validation logic
and custom processing for complex data structures like golf scorecards.
"""

from django import forms
from .models import User, Round, Course, Tee, HoleScore


class RegisterForm(forms.Form):
    """
    User registration form with validation for unique usernames.

    Collects essential user information for account creation,
    including username, email, password, and location data.
    """

    username = forms.CharField(max_length=100)
    email = forms.EmailField()
    password = forms.CharField(widget=forms.PasswordInput)
    confirm_password = forms.CharField(widget=forms.PasswordInput)
    first_name = forms.CharField(max_length=50)
    last_name = forms.CharField(max_length=50)
    city_name = forms.CharField(max_length=50)

    def clean_username(self):
        """
        Validate that the username is unique.

        Args:
            username: The username to validate

        Returns:
            The validated username

        Raises:
            ValidationError: If username already exists
        """
        username = self.cleaned_data["username"]
        if User.objects.filter(username=username).exists():
            raise forms.ValidationError(
                "This username is already taken. Please try a different one."
            )
        return username


class LoginForm(forms.Form):
    """
    User login form.

    Simple form for collecting username and password credentials
    for authentication.
    """

    username = forms.CharField(max_length=100)
    password = forms.CharField(widget=forms.PasswordInput)


class ScorecardForm(forms.ModelForm):
    """
    Dynamic form for entering golf round scores and statistics.

    This complex form dynamically generates input fields based on the selected
    course and tee. It handles validation and creates both Round and HoleScore
    objects when saved.
    """

    class Meta:
        model = Round
        fields = ["course", "tee", "date_played", "notes"]

    def __init__(self, *args, **kwargs):
        """
        Initialize the scorecard form with dynamic hole-specific fields.

        Dynamically creates form fields for each hole on the selected tee,
        including inputs for strokes, putts, fairway hits, green in regulation,
        and penalties.

        Args:
            *args: Variable length argument list
            **kwargs: Arbitrary keyword arguments
        """
        super().__init__(*args, **kwargs)
        self.hole_score_data = []

        if "tee" in self.data:
            tee = Tee.objects.get(id=self.data["tee"])
            holes = tee.holes.all().order_by("hole_number")

            for hole in holes:
                self.fields[f"strokes_{hole.hole_number}"] = forms.IntegerField(
                    min_value=1, label=f"Hole {hole.hole_number} Score"
                )
                self.fields[f"putts_{hole.hole_number}"] = forms.IntegerField(
                    min_value=0, required=False, label=f"Hole {hole.hole_number} Putts"
                )
                self.fields[f"fairway_{hole.hole_number}"] = forms.BooleanField(
                    required=False, label=f"Hole {hole.hole_number} Fairway Hit"
                )
                self.fields[f"gir_{hole.hole_number}"] = forms.BooleanField(
                    required=False, label=f"Hole {hole.hole_number} GIR"
                )
                self.fields[f"penalties_{hole.hole_number}"] = forms.IntegerField(
                    min_value=0,
                    required=False,
                    initial=0,
                    label=f"Hole {hole.hole_number} Penalties",
                )

    def clean(self):
        """
        Validate form data and prepare hole score data for saving.

        Performs cross-field validation to ensure data integrity,
        such as verifying putts don't exceed strokes. Collects
        all hole score data for later saving.

        Returns:
            dict: The cleaned form data
        """
        cleaned_data = super().clean()
        tee = cleaned_data.get("tee")

        if tee:
            holes = tee.holes.all().order_by("hole_number")
            for hole in holes:
                strokes = cleaned_data.get(f"strokes_{hole.hole_number}")
                putts = cleaned_data.get(f"putts_{hole.hole_number}")

                if putts and putts > strokes:
                    self.add_error(
                        f"putts_{hole.hole_number}",
                        "Putts cannot exceed total strokes for the hole",
                    )

                self.hole_score_data.append(
                    {
                        "hole": hole,
                        "strokes": strokes,
                        "putts": putts or 0,
                        "fairway_hit": cleaned_data.get(
                            f"fairway_{hole.hole_number}", False
                        ),
                        "green_in_regulation": cleaned_data.get(
                            f"gir_{hole.hole_number}", False
                        ),
                        "penalties": cleaned_data.get(
                            f"penalties_{hole.hole_number}", 0
                        ),
                    }
                )

        return cleaned_data

    def save(self, commit=True):
        """
        Save the round data and create associated hole scores.

        First saves the Round instance, then creates individual
        HoleScore records for each hole played.

        Args:
            commit (bool): Whether to save to the database

        Returns:
            Round: The saved round instance
        """
        round_instance = super().save(commit=commit)

        if commit:
            for score_data in self.hole_score_data:
                HoleScore.objects.create(
                    round=round_instance,
                    hole=score_data["hole"],
                    strokes=score_data["strokes"],
                    putts=score_data["putts"],
                    fairway_hit=score_data["fairway_hit"],
                    green_in_regulation=score_data["green_in_regulation"],
                    penalties=score_data["penalties"],
                )

        return round_instance
