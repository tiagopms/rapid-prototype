from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    url(r'^login/$', 
        'django.contrib.auth.views.login', 
        {
            'template_name': 'users/login.html'
        }, 
        name="auth_login"
    ),

    url(r'^logout/$', 
        'django.contrib.auth.views.logout',
        {
            'next_page': '/'
        }, 
        name="auth_logout"
    ),
    
    url(r'^change_password/$', 
        'django.contrib.auth.views.password_change', 
        {
            'template_name': 'users/change_password.html',
            'post_change_redirect': '/users/change_password_done'
        }, 
        name="user_change_password"
    ),
    
    url(r'^change_password_done/$', 
        'users.views.change_password_done', 
        name="user_change_password_done"
    ),
    
    url(r'^signup/$', 
        'users.views.create_user', 
        name="user_signup"
    ),
    
    url(r'^lost_password/$', 
        'django.contrib.auth.views.password_reset',
        {
            'is_admin_site': False,
            'template_name': 'users/lost_password.html',
            'email_template_name': 'users/lost_password_email.html',
            'post_reset_redirect': '/users/lost_password_done',
            'from_email': 'picturetheworldemail@gmail.com',
        },
        name="user_lost_password"
    ),

    url(r'^lost_password_done/$',
        'users.views.lost_password_done',
        name="user_lost_password_done"
    ),

    url(r'^password_reset/(?P<uidb36>[0-9A-Za-z]+)-(?P<token>.+)/$',
        'django.contrib.auth.views.password_reset_confirm',
        {
            'template_name': 'users/password_reset.html',
            'post_reset_redirect': '/users/password_reset_done',
        },
        name="user_password_reset"
    ),

    url(r'^password_reset_done/$',
        'users.views.password_reset_done',
        name="user_password_reset_done"
    ),

)
