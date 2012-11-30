import random
from django import forms
from django.shortcuts import render_to_response, get_object_or_404
from django.db.models import Count
from django.template import RequestContext
from django.http import HttpResponse, HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect
from images.models import Tag
from images.models import Image
from images.models import Location
from images.models import TagForm
from images.models import ImageForm
from images.models import LocationForm
from gmapi import maps
from gmapi.forms.widgets import GoogleMap

def tag(request, tag_id, img_num):
    chosen_tag = get_object_or_404(Tag, pk=tag_id)
    
    images = Image.objects.filter(
            tag=chosen_tag
    ).order_by('-pubdate')
    
    if (len(images) > int(img_num)) and (int(img_num) >= 0):
        image = images[int(img_num)]
        next_img = (int(img_num) + 1)%len(images)
        imageTags = Tag.objects.filter(
               image_tag=image 
        )
    else:
        image = 0
        imageTags = 0
        next_img = 0
    
    allTags = Tag.objects.all()
    
    return render_to_response('tags/picture.html', {"image": image, "image_tags": imageTags, "chosen_tag": chosen_tag, "all_tags": allTags, "next_img": next_img, "tag_id": str(tag_id)}, context_instance=RequestContext(request))

def image(request, img_id):
    image = get_object_or_404(Image, pk=img_id)
    imageTags = Tag.objects.filter(
       image_tag=image 
    )
    
    allTags = Tag.objects.all()
    
    return render_to_response('tags/picture_alone.html', {"image": image, "all_tags": allTags, "image_tags": imageTags}, context_instance=RequestContext(request))



@login_required
def add_image(request):
    if request.is_ajax():
        image_form = ImageForm()
        if "locations" in request.GET:
            return render_to_response('tags/image_form_locations.html', {'image_form': image_form})
        else:
            return render_to_response('tags/image_form_tags.html', {'image_form': image_form})
    else:
        if request.POST:
            image_form = ImageForm(request.POST, request.FILES)
            if image_form.is_valid():
                img = image_form.save(commit=False)
                img.user = request.user
                img.save()
                image_form.save_m2m()
                return HttpResponseRedirect("/")
        else:
            image_form = ImageForm()

    return render_to_response('tags/add_image.html', {'image_form': image_form}, context_instance=RequestContext(request))

@login_required
def add_tag(request):
    if request.is_ajax():
        if request.method == "POST":
            tag_form = TagForm(request.POST)
            if tag_form.is_valid():
                tag_form.save()
                return HttpResponse("Success")
        elif request.method == "GET":
            tag_form = TagForm()

    return render_to_response('tags/add_tag.html', {'tag_form': tag_form}, context_instance=RequestContext(request))

@login_required
def add_location(request):
    if request.is_ajax():
        if request.method == "POST":
            location_form = LocationForm(request.POST)
            if location_form.is_valid():
                location_form.save()
                return HttpResponse("Success")
        elif request.method == "GET":
            location_form = LocationForm()

    return render_to_response('tags/add_location.html', {'location_form': location_form}, context_instance=RequestContext(request))

class MapForm(forms.Form):
    map = forms.Field(widget=GoogleMap(attrs={'width':1200}))

def random_tag(request):
    images = Image.objects.all()
    tags = list(Tag.objects.filter(
        image_tag__in=images
    ))
    random.shuffle(tags)
    if not tags:
        request.session['alert'] = 'There is no tags with images'
        return HttpResponseRedirect('/')
    tag_id = tags[0].pk
    return HttpResponseRedirect(reverse('tag_image', args=(tag_id, 0)))


def map(request, images, lat, lng):
    gmap = maps.Map(opts = {
        'center': maps.LatLng(float(lat), float(lng)),
        'mapTypeId': maps.MapTypeId.ROADMAP,
        'zoom': 2,
        'mapTypeControlOptions': {
            'style': maps.MapTypeControlStyle.DROPDOWN_MENU
        },
    })
    for image in images:
        location = image.location
        if not image.has_latlng():
            continue
        lat, lng = location.lat, location.lng
        if not lat or not lng:
            continue
        marker = maps.Marker(opts = {
            'map': gmap,
            'title': image.title,
            'position': maps.LatLng(lat, lng)
        })
        maps.event.addListener(marker, 'click', 'myobj.markerOver')
        #maps.event.addListener(marker, 'mouseout', 'myobj.markerOut')
        info = maps.InfoWindow({
            'content': '<a href="'+ reverse('image', args=(image.pk,)) +'"><h1 class="marker_title">'+ image.title+'</h1><img class="marker_image" src="/'+ image.image.url + '"></a>',
            'disableAutoPan': False
        })
        info.open(gmap, marker)
    return gmap

@login_required
def my_map(request):
    images = request.user.image_set.all()
    gmap = map(request, images, 0, 0)
    context = {'world': False, 'form': MapForm(initial={'map': gmap})}
    return render_to_response('tags/world_map.html', context, context_instance=RequestContext(request))

def location(request, lat, lng):
    images = Image.objects.all()
    gmap = map(request, images, lat, lng)
    context = {'world': True, 'form': MapForm(initial={'map': gmap})}
    return render_to_response('tags/world_map.html', context, context_instance=RequestContext(request))

def world_map(request):
    images = Image.objects.all()
    gmap = map(request, images, 0, 0)
    context = {'world': True, 'form': MapForm(initial={'map': gmap})}
    return render_to_response('tags/world_map.html', context, context_instance=RequestContext(request))
