from django.urls import path
from rest_framework.response import Response
from rest_framework.views import APIView


class StudentProfileView(APIView):
    def get(self, request):
        return Response({})


urlpatterns = [
    path("me/", StudentProfileView.as_view(), name="student-me"),
]
