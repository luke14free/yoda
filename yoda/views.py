from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.http import Http404
from django.shortcuts import render_to_response
from django.views.generic.simple import direct_to_template
from django.shortcuts import get_object_or_404
from django.template import loader, Context
from django.template import RequestContext
from itertools import product
from django.db.models import get_model as django_get_model
from google.appengine.api.users import get_current_user, create_login_url
from google.appengine.api.users import is_current_user_admin as _is_current_user_admin
from google.appengine.api import users
from functools import wraps
from yoda.models import Profile, Skill
from django.core.exceptions import ObjectDoesNotExist
from filetransfers.api import prepare_upload
from django.core.urlresolvers import reverse
from google.appengine.api import mail
from google.appengine.ext import blobstore
import models as client_models
import os
import datetime
import json
import time
import pickle
import settings
from google.appengine.ext import db

"""
Parameters:
"""

#Override this function to customize your admins.
is_current_user_admin = lambda user: _is_current_user_admin() or user.email() in settings.ADMINS

CHANGED_MANAGER_MAIL_TEMPLATE = """
Dear Admin,

This email is to report that %(employee)s changed his current manager to: %(manager)s.

If you think this is a mistake and want to correct it feel free to edit %(employee)s details here:
http://%(domain)s/profile?email=%(employee)s

Truly yours, Yoda - autogenerated mail (do not answer!)
"""


def login_required(view):
    @wraps(view)
    def wrapper(*args, **kwds):
        user = get_current_user()
        if not user:
            return HttpResponseRedirect(create_login_url(dest_url="/"))
        return view(*args, **kwds)
    return wrapper    


def enforce_permissions(view):
    @wraps(view)
    def wrapper(*args, **kwds):
        request = args[0]
        current_user = get_current_user()
        if request.method=="POST":
            arr = request.POST
        else:
            arr = request.GET
        if not (arr['user_email']==current_user.email() or is_current_user_admin(current_user)):
            raise Exception("Permission denied for %s" % current_user.email())
        return view(*args, **kwds)
    return wrapper    


def get_or_create_profile(user):
    try:
        return Profile.objects.get(email = user.email())
    except ObjectDoesNotExist:
        profile = Profile(full_name = user.nickname(), email = user.email())
        profile.save()
        return profile
    
def public_index(request):
    return render_to_response("index.html")

@login_required
def profile(request):
    user_email = request.GET.get("email")
    current_user = get_current_user()

    if not user_email:
        profile = get_or_create_profile(current_user)
        is_profile_owner = True
        is_real_owner = True
    else:
        is_real_owner = False
        user = users.User(user_email)
        profile = get_or_create_profile(user)
        is_profile_owner = False
        if user.email() == current_user.email():
            is_profile_owner = True
            
    if is_current_user_admin(current_user):
        is_profile_owner = True
        
    view_url = reverse('yoda.views.profile')

    return render_to_response("profile.html", {'is_profile_owner':is_profile_owner,
                                               'is_real_owner': is_real_owner,
                                               'profile':profile})
    

@login_required
@enforce_permissions
def profile_update(request):
    view_url = reverse('yoda.views.profile_update')
    current_user = get_current_user()
    
    profile = Profile.objects.get(email = request.POST['user_email'])
    if request.POST['key']=="manager":
        manager_pk = get_or_create_profile(users.User(request.POST['value'])).pk
        if not manager_pk == profile.manager_id:
            mail.send_mail_to_admins(
                                     sender="Yoda Profile Management <yoda@%s>" % settings.DOMAIN,
                                     subject="Reporting changed manager for %s" % current_user.email,
                                     body=CHANGED_MANAGER_MAIL_TEMPLATE % {'manager':request.POST['value'],
                                                                           'employee':current_user.email,
                                                                           'domain':settings.DOMAIN}
                                    )
            setattr(profile, "manager_id", manager_pk)
            profile.save()
        return HttpResponse("OK")
        
    else:
        setattr(profile, request.POST['key'], request.POST['value'])
        profile.save()
    return HttpResponse("OK")

@login_required
@enforce_permissions
def put_skill(request):
    current_user = get_current_user()
    profile = get_or_create_profile(current_user)
    if request.GET.get('drop_all') in [1,"1"]:
        Skill.objects.all().delete()
    if request.GET['skill_name'] and (int(request.GET['years_of_experience']) > 0 or request.GET.get('drop_all')!=None):
        s = Skill(name = request.GET['skill_name'], 
                  years_of_experience = request.GET['years_of_experience'], 
                  owner_id = profile.pk)
        s.save()
        return HttpResponse(json.dumps({'pk':s.pk,'name':s.name,'years_of_experience':s.years_of_experience}),mimetype="application/json")

@login_required
def remove_skill(request):
    current_user = get_current_user()
    s = Skill.objects.get(pk = request.GET['pk'])
    if Profile.objects.get(pk = s.owner_id).email == current_user.email() or is_current_user_admin():
        s.delete()
        return HttpResponse("OK")
    raise Exception("Permission denied for %s" % current_user.email())


@login_required
def search(request):
    t = request.GET['t']
    q = request.GET['q']
    p = request.GET.get('p',0)
    out = []
    
    gravatar_size = 90
    
    if t == "people":
        for i in Profile.objects.filter(full_name__icontains = q):
            z = {'full_name':i.full_name,'email':i.email,'img_url':i.get_gravatar_url(gravatar_size)}
            if z not in out:
                out.append(z)
        for i in Profile.objects.filter(email__icontains = q):
            z = {'full_name':i.full_name,'email':i.email,'img_url':i.get_gravatar_url(gravatar_size)}
            if z not in out:
                out.append(z)
        
    elif t == "people-with-skills":
        for j in Skill.objects.filter(name__icontains = q):
            i = Profile.objects.get(pk=j.owner_id)
            z = {'full_name':i.full_name,'email':i.email,'img_url':i.get_gravatar_url(gravatar_size)}
            if z not in out:
                out.append(z)
            
    elif t == "skills":
        for j in Skill.objects.filter(name__icontains = q):
            z = {'name':j.name,'total_people':Skill.objects.filter(name=j.name).count()}
            if z not in out:
                out.append(z)
            
    return HttpResponse(json.dumps(out), mimetype="application/json")
        
    
    
    