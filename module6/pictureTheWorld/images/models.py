from django.db import models
from django.forms import ModelForm
from django.contrib.auth.models import User

class Tag(models.Model):
    name = models.CharField(max_length=50)

    def __unicode__(self):
        return self.name

class Location(models.Model):
    name = models.CharField(max_length=255)
    lat = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    lng = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)

    def __unicode__(self):
        return self.name

    def has_latlng(self):
        return not (self.lat is None or self.lng is None)


class Image(models.Model):
    title = models.CharField(max_length=50)
    image = models.ImageField(
        null = False,
        blank = False,
        upload_to = 'userimages'
    )
    location = models.ForeignKey(Location, null=True, blank=True)
    pubdate = models.DateTimeField(auto_now=True)
    tag = models.ManyToManyField(Tag, related_name = "image_tag")
    user = models.ForeignKey(User, blank=False, null=False, on_delete=models.CASCADE)
    
    def __unicode__(self):
        return self.title
    
    def has_latlng(self):
        if not self.location:
            return False
        return self.location.has_latlng()

class ImageForm(ModelForm):
    class Meta:
        model = Image
        exclude = ('user',)
class TagForm(ModelForm):
    class Meta:
        model = Tag
class LocationForm(ModelForm):
    class Meta:
        model = Location
