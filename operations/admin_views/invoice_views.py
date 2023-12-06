import django_filters
from rest_framework import generics, filters
from rest_framework.permissions import IsAdminUser

from operations.admin_views.utils import AdminPagination
from operations.models import Invoice
from operations.serializers.invoice_serializers import InvoiceAddSerializer, InvoiceRetrieveSerializer, \
    ListInvoiceRetrieveSerializer


class InvoiceCreateAdminAPIView(generics.CreateAPIView):
    permission_classes = [IsAdminUser, ]

    def get_queryset(self):
        return Invoice.objects.all()

    def get_serializer_class(self):
        return InvoiceAddSerializer


class InvoiceRetrieveUpdateDestroyAdminAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser, ]

    def get_queryset(self):
        return Invoice.objects.all()

    def get_serializer_class(self):
        if self.request.method == "GET":
            return InvoiceRetrieveSerializer
        elif self.request.method == "PATCH":
            return InvoiceAddSerializer


class InvoiceListView(generics.ListAPIView):
    permission_classes = [IsAdminUser, ]
    serializer_class = ListInvoiceRetrieveSerializer
    pagination_class = AdminPagination
    filter_backends = [django_filters.rest_framework.DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['invoice_status']
    ordering_fields = ['invoice_number', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return Invoice.objects.all()
