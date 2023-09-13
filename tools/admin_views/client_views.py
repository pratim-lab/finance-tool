from rest_framework import generics

from tools.models import Client
from tools.serializers.client_serializers import ClientAddSerializer, ClientRetrieveSerializer


class ClientCreateAdminAPIView(generics.CreateAPIView):

    def get_queryset(self):
        return Client.objects.all()

    def get_serializer_class(self):
        return ClientAddSerializer


class ClientRetrieveUpdateDestroyAdminAPIView(generics.RetrieveUpdateDestroyAPIView):

    def get_queryset(self):
        return Client.objects.all()

    def get_serializer_class(self):
        if self.request.method == "GET":
            return ClientRetrieveSerializer
        elif self.request.method == "PATCH":
            return ClientAddSerializer
