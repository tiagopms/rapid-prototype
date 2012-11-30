from django.shortcuts import render_to_response
from django.db.models import Count
from django.template import RequestContext
from django.utils import simplejson
from django.http import HttpResponse
from images.models import Tag
from images.models import Image
from forms import SearchForm

def index(request):
    search = SearchForm(request.GET)
    images = Image.objects.all()

    search_field = request.GET.get('search', "")

    all_tags_list = Tag.objects.filter(
            image_tag__in=images,
    ).annotate(itemcount=Count('id')).order_by('-itemcount')

    tags_list = Tag.objects.filter(
            image_tag__in=images,
            name__contains=search_field,
    ).annotate(itemcount=Count('id')).order_by('-itemcount')
    
    zero_list = Tag.objects.exclude(
        image_tag__in=images
    )
    


    return render_to_response(
        'pictureTheWorld/index.html',
        {
            "tags_list": tags_list,
            "search_form": search,
            'all_tags_list':all_tags_list,
            'zero_list': zero_list,
        },
        context_instance=RequestContext(request)
    )


def search(request):
    search_field = request.GET.get('search', "")
    images = Image.objects.all()

    tags_list = Tag.objects.filter(
            image_tag__in=images,
            name__contains=search_field,
    ).annotate(itemcount=Count('id')).order_by('-itemcount')

    zero_list = Tag.objects.exclude(
        image_tag__in=images
    )
    return render_to_response(
        'pictureTheWorld/search.html', 
        {
            "tags_list": tags_list, 
            'div': 'all',
            'show_number': True,
            'zero_list': zero_list,
        }, 
        context_instance=RequestContext(request)
    )
