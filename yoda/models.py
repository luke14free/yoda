from django.db import models
from django.core.exceptions import ObjectDoesNotExist
import urllib, hashlib, settings

class Profile (models.Model):
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=255,null=True,blank=True)
    mobile_phone = models.CharField(max_length=255,null=True,blank=True)
    job_position = models.CharField(max_length=255,null=True,blank=True)
    location = models.CharField(max_length=255,null=True,blank=True)
    education = models.TextField(null=True,blank=True)
    work_experiences = models.TextField(null=True,blank=True)
    about_me = models.TextField(null=True,blank=True)
    manager_id = models.CharField(max_length=255,null=True,blank=True)
    is_already_in = models.CharField(max_length=255,null=True,blank=True,default="False")
    
    def get_manager(self):
        if not self.manager_id:
            return None
        return Profile.objects.get(pk = self.manager_id)
        
    def get_headcount(self):
        return Profile.objects.filter(manager_id = self.pk)
    
    def get_team(self):
        if not self.manager_id:
            return None
        return [i for i in Profile.objects.filter(manager_id = self.manager_id) if i.pk!=self.pk]
    
    def get_skills(self):
        return Skill.objects.filter(owner_id = self.pk)
    
    def get_gravatar_url(self,size=250):
        gravatar_url = "http://www.gravatar.com/avatar/"
        gravatar_url += hashlib.md5(self.email.lower()).hexdigest() + "?"
        gravatar_url += urllib.urlencode({'s':str(size),'d':'http://'+settings.DOMAIN+"/static/img/yoda.jpg"})
        return gravatar_url

class Skill (models.Model):
    owner_id = models.CharField(max_length=255,null=True,blank=True)
    name = models.CharField(max_length=255,null=True,blank=True)
    years_of_experience = models.IntegerField()
    
