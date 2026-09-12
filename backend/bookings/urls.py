from django.urls import path
from rest_framework.response import Response
from rest_framework.views import APIView


class BookingListView(APIView):
    def get(self, request):
        return Response([])


urlpatterns = [
    path("", BookingListView.as_view(), name="booking-list"),
]
