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


class PipelineRetrieveUpdateDestroyAdminAPIView(APIView):
    permission_classes = [IsAdminUser, ]

    def patch(self, request, pk):
        pipline = Pipeline.objects.filter(pk=pk).first()
        if pipline is None:
            return Response({'message': 'Pipeline not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = PipelineAddSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        Pipeline.objects.filter(pk=pk).update(**serializer.validated_data)
        return Response(ListPipelineRetrieveSerializer(Pipeline.objects.filter(pk=pk).first()).data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        pipline = Pipeline.objects.filter(id=pk).first()
        if pipline is None:
            return Response({'message': 'Pipeline not found'}, status=status.HTTP_404_NOT_FOUND)
        pipline.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get(self, request, pk):
        pipline = Pipeline.objects.filter(id=pk).first()
        if pipline is None:
            return Response({'message': 'Pipeline not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(ListPipelineRetrieveSerializer(pipline).data, status=status.HTTP_200_OK)


class PipelineListView(generics.ListAPIView):
    permission_classes = [IsAdminUser, ]
    serializer_class = ListPipelineRetrieveSerializer
    pagination_class = AdminPagination
    filter_backends = [django_filters.rest_framework.DjangoFilterBackend]
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return Pipeline.objects.all()
