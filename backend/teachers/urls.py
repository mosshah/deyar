from django.urls import path
from rest_framework.response import Response
from rest_framework.views import APIView


class TeacherListView(APIView):
    def get(self, request):
        return Response([])


urlpatterns = [
    path("", TeacherListView.as_view(), name="teacher-list"),
]
