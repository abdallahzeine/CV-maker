from django.contrib import admin
from django.urls import path
from ninja import NinjaAPI

from main.api import router

api = NinjaAPI(
    title="SiraStudio AI",
    version="1.0.0",
    description="CV editing agent API",
)
api.add_router("/agent", router)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api.urls),
]
