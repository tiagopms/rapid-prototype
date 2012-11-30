from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    url(r'^tags/(?P<tag_id>\d+)/(?P<img_num>\d+)/$', 'images.views.tag', name="tag_image"),
    url(r'^images/(?P<img_id>\d+)/$', 'images.views.image', name="image"),
    url(r'^images/add_image/$', 'images.views.add_image', name="add_image"),
    url(r'^tags/add_tag/$', 'images.views.add_tag'),
    url(r'^tags/add_location/$', 'images.views.add_location'),
    url(r'^tags/random/$', 'images.views.random_tag', name='random_tag'),
    url(r'^world_map/$', 'images.views.world_map', name='world_map'),
    url(r'^mymap/$', 'images.views.my_map', name='my_map'),
    url(r'^world_map/(?P<lat>[\d/.-]+)/(?P<lng>[\d/.-]+)/$', 'images.views.location', name='world_map_location'),
)
