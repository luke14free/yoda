from django.conf.urls.defaults import patterns, include, url
import yoda.views
# Uncomment the next two lines to enable the admin:
from djangoappengine.views import warmup

handler500 = 'djangotoolbox.errorviews.server_error'

urlpatterns = patterns('',
    url('^_ah/warmup$', warmup),
    
    url(r'^profile$', yoda.views.profile, name='profile'),
    url(r'^profile/update$',yoda.views.profile_update,name='profile_update'),
    url(r'^skills/put$', yoda.views.put_skill, name='put_skill'),
    url(r'^skills/remove$', yoda.views.remove_skill, name='remove_skill'),
    url(r'^search$', yoda.views.search, name='search'),
    url(r'', yoda.views.public_index, name='index'),
    
)
