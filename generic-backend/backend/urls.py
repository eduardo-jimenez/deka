"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

from events.views import athlete_results, events_available, analyze_performance, races_available

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/races/', races_available, name='races-available'),
    path('api/events/', events_available, name='events-available'),
    path('api/athlete-results/', athlete_results, name='athlete-results'),
    path('api/analyze-athlete/', analyze_performance, name='analyze_performance'),
]
