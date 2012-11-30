from django.conf.urls.defaults import patterns, include, url
import yoda.views
# Uncomment the next two lines to enable the admin:
from djangoappengine.views import warmup

handler500 = 'djangotoolbox.errorviews.server_error'

urlpatterns = patterns('',
    url('^_ah/warmup$', warmup),
    
    url(r'',yoda.views.index,name='index'),
)
