import hashlib

def notice_alert(request):
    alert = ""
    notice = ""
    try:
        alert = request.session['alert']
        del request.session['alert']
    except KeyError:
        pass
    try:
        notice = request.session['notice']
        del request.session['notice']
    except KeyError:
        pass
    return {
        'alert': alert,
        'notice': notice,
    }


