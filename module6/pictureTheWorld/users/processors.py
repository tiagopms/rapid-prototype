import hashlib

def user(request):
    if hasattr(request, 'user') and request.user.is_authenticated():
        hash = hashlib.md5(request.user.email).hexdigest()
        return {
            'user': request.user,
            'user_logged': True,
            'gravatar': hash
        }
    else:
        return {
            'user_logged': False
        }
