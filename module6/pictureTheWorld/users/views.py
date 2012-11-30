from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponseRedirect
from django.contrib.auth import authenticate, login
from forms import UserCreateForm

def change_password_done(request):
    request.session['notice'] = "Password successfully changed"
    return HttpResponseRedirect("/")

def create_user(request):
    if request.POST:
        user_form = UserCreateForm(request.POST)
        if user_form.is_valid():
            username = user_form.clean_username()
            password = user_form.clean_password2()
            user_form.save()
            user = authenticate(username=username, password=password)
            login(request, user)
            request.session["notice"] = "User successfully logged in"
            return HttpResponseRedirect("/")
    else:
        user_form = UserCreateForm()

    return render_to_response('users/create_user.html', {'user_form': user_form}, context_instance=RequestContext(request))

def lost_password_done(request):
    request.session['notice'] = "A reset password email was sent to you."
    return HttpResponseRedirect("/")

def password_reset_done(request):
    request.session['notice'] = "Password successfully reseted."
    return HttpResponseRedirect("/")
