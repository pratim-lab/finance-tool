from rest_framework import generics
from rest_framework.permissions import IsAdminUser

from operations.serializers.client_type_serializers import ClientTypeAddSerializer, ClientTypeRetrieveSerializer
from tools.models import ClientType


class ClientTypeCreateAdminAPIView(generics.CreateAPIView):
    permission_classes = [IsAdminUser, ]

    def get_queryset(self):
        return ClientType.objects.all()

    def get_serializer_class(self):
        return ClientTypeAddSerializer


class ClientTypeRetrieveUpdateDestroyAdminAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser, ]

    def get_queryset(self):
        return ClientType.objects.all()

    def get_serializer_class(self):
        if self.request.method == "GET":
            return ClientTypeRetrieveSerializer
        elif self.request.method == "PATCH":
            return ClientTypeAddSerializer
