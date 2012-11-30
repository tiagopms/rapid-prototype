from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'pictureTheWorld.views.home', name='home'),
    # url(r'^pictureTheWorld/', include('pictureTheWorld.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^$', 'pictureTheWorld.views.index'),
    url(r'^search/$', 'pictureTheWorld.views.search'),
    url(r'^', include('images.urls')),
    url(r'^users/', include('users.urls')),
    url(r'^admin/', include(admin.site.urls)),
)
