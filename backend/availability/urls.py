from django.urls import path
from rest_framework.response import Response
from rest_framework.views import APIView


class AvailabilityView(APIView):
    def get(self, request):
        return Response([])


urlpatterns = [
    path("", AvailabilityView.as_view(), name="availability-list"),
]
