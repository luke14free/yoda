from django import forms
from yoda.models import *

class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        exclude = ("full_name",
                   "email",
                   "phone",
                   "mobile_phone",
                   "job_position",
                   "location",
                   "education",
                   "work_experiences",
                   "about_me",
                   "manager_id")