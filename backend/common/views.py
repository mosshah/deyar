from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import connection


class HealthCheckView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        db_ok = True
        db_error = None
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
        except Exception as e:
            db_ok = False
            db_error = str(e)

        data = {
            "status": "ok" if db_ok else "degraded",
            "database": "connected" if db_ok else "unreachable",
            "version": "1.0.0",
        }
        if not db_ok:
            data["database_error"] = db_error
            return Response(data, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response(data, status=status.HTTP_200_OK)
