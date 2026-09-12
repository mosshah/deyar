from django.urls import path
from rest_framework.response import Response
from rest_framework.views import APIView


class SubjectListView(APIView):
    def get(self, request):
        return Response([])


urlpatterns = [
    path("", SubjectListView.as_view(), name="subject-list"),
]
