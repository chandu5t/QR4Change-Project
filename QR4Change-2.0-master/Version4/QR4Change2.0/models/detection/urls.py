from django.urls import path, include
from .views import PathHoleDetectionView, urgency_view ,garbage_view # ✅ correct import

urlpatterns = [
    path("pothole/", PathHoleDetectionView.as_view(), name="classify_image"),  # CBV (class-based view)
    path("urgency/", urgency_view, name="predict_urgency"),  
    path('garbage/', garbage_view, name='garbage_classification'),          
]