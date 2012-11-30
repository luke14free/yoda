#from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.http import Http404
from django.shortcuts import render_to_response
from django.shortcuts import get_object_or_404
from django.template import loader, Context
from django.template import RequestContext
from itertools import product
from django.db.models import get_model as django_get_model
import models as client_models
import os
#if "/bi" not in sys.path:   sys.path.append("/bi")
import datetime
import json
import time
import pickle

def index(request):
    return render_to_response("index.html")