from django.urls import path
from rest_framework.response import Response
from rest_framework.views import APIView


class ReviewListView(APIView):
    def get(self, request):
        return Response([])


urlpatterns = [
    path("", ReviewListView.as_view(), name="review-list"),
]
