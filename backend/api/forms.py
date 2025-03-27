from django import forms
from .models import User, Round, Course, Tee, HoleScore


class RegisterForm(forms.Form):
    username = forms.CharField(max_length=100)
    email = forms.EmailField()
    password = forms.CharField(widget=forms.PasswordInput)
    confirm_password = forms.CharField(widget=forms.PasswordInput)
    first_name = forms.CharField(max_length=50)
    last_name = forms.CharField(max_length=50)
    city_name = forms.CharField(max_length=50)

    def clean_username(self):
        username = self.cleaned_data["username"]
        if User.objects.filter(username=username).exists():
            raise forms.ValidationError(
                "This username is already taken. Please try a different one."
            )
        return username


class LoginForm(forms.Form):
    username = forms.CharField(max_length=100)
    password = forms.CharField(widget=forms.PasswordInput)


class ScorecardForm(forms.ModelForm):
    class Meta:
        model = Round
        fields = ["course", "tee", "date_played", "notes"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.hole_score_data = []

        # If we have a tee selected, create fields for all holes
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
        round_instance = super().save(commit=commit)

        if commit:
            # Create HoleScore instances
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
