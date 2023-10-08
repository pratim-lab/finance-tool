import django_filters
from rest_framework import generics, status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from operations.admin_views.utils import AdminPagination
from operations.models import Pipeline
from operations.serializers.pipeline_serializers import ListPipelineRetrieveSerializer, PipelineAddSerializer


class PipelineCreateView(APIView):
    permission_classes = [IsAdminUser, ]

    def post(self, request):
        serializer = PipelineAddSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        obj = serializer.save()
        return Response(ListPipelineRetrieveSerializer(obj).data, status=status.HTTP_201_CREATED)


class PipelineRetrieveUpdateDestroyAdminAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser, ]

    def get_queryset(self):
        return Pipeline.objects.all()

    def get_serializer_class(self):
        if self.request.method == "GET":
            return ListPipelineRetrieveSerializer
        elif self.request.method == "PATCH":
            return PipelineAddSerializer


class PipelineListView(generics.ListAPIView):
    permission_classes = [IsAdminUser, ]
    serializer_class = ListPipelineRetrieveSerializer
    pagination_class = AdminPagination
    filter_backends = [django_filters.rest_framework.DjangoFilterBackend]
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return Pipeline.objects.all()
