import datetime

from rest_framework import generics, filters, views, status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from people.admin_views.utils import VendorAdminPagination
from people.models import Vendor
from people.serializers.vendor_serializers import VendorAddSerializer, VendorExpenseEditSerializer, \
    VendorExpenseResetSerializer
from tools.models import VendorExpense


class VendorCreateAdminAPIView(generics.CreateAPIView):
    permission_classes = [IsAdminUser, ]

    def get_queryset(self):
        return Vendor.objects.all()

    def get_serializer_class(self):
        return VendorAddSerializer


class VendorRetrieveUpdateDestroyAdminAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser, ]

    def get_queryset(self):
        return Vendor.objects.all()

    def get_serializer_class(self):
        if self.request.method == "GET":
            return VendorAddSerializer
        elif self.request.method == "PATCH":
            return VendorAddSerializer


class VendorListView(generics.ListAPIView):
    permission_classes = [IsAdminUser, ]
    serializer_class = VendorAddSerializer
    pagination_class = VendorAdminPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return Vendor.objects.all()


def get_months():
    return [
        {'id': 1, 'value': 'January'},
        {'id': 2, 'value': 'February'},
        {'id': 3, 'value': 'March'},
        {'id': 4, 'value': 'April'},
        {'id': 5, 'value': 'May'},
        {'id': 6, 'value': 'June'},
        {'id': 7, 'value': 'July'},
        {'id': 8, 'value': 'August'},
        {'id': 9, 'value': 'September'},
        {'id': 10, 'value': 'October'},
        {'id': 11, 'value': 'November'},
        {'id': 12, 'value': 'December'}
    ]


def get_current_year():
    return datetime.datetime.now().year


def get_default_vendor_expenses():
    return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]


class VendorReportView(views.APIView):
    permission_classes = [IsAdminUser, ]

    def get(self, request):
        year = get_current_year()
        previously_updated_expenses = VendorExpense.objects.filter(year=year)
        updated_expenses_dict = dict()
        for updated_expense in previously_updated_expenses:
            key = '{}_{}_{}'.format(updated_expense.vendor.id, updated_expense.year, updated_expense.month)
            updated_expenses_dict[key] = updated_expense.expense
        vendors = Vendor.objects.all().order_by('-created_at')
        expenses = []
        for vendor in vendors:
            monthly_expenses = []
            for m in range(1, 13):
                key = '{}_{}_{}'.format(vendor.id, year, m)
                if key in updated_expenses_dict:
                    expense = updated_expenses_dict[key]
                    monthly_expenses.append({
                        'value': expense,
                        'updated': True
                    })
                else:
                    monthly_expenses.append({
                        'value': 0,
                        'updated': False
                    })

            expenses.append({
                'id': vendor.id,
                'vendor_name': vendor.vendor_name,
                'expenses': monthly_expenses
            })
        return Response({
            'year': year,
            'vendors': expenses
        })


class VendorExpenseUpdateView(views.APIView):
    permission_classes = [IsAdminUser, ]

    def post(self, request):
        serializer = VendorExpenseEditSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data
        vendor = Vendor.objects.filter(id=data['vendor_id']).first()
        if vendor is None:
            return Response({'message': 'Vendor is not found'}, status=status.HTTP_400_BAD_REQUEST)
        vendor_expense, created = VendorExpense.objects.update_or_create(
            vendor=vendor,
            year=data['year'],
            month=data['month'],
            defaults={
                'expense': data['expense']
            }
        )
        return Response({
            'vendor_id': vendor.id,
            'expense': vendor_expense.expense
        })


class VendorExpenseResetView(views.APIView):
    permission_classes = [IsAdminUser, ]

    def post(self, request):
        serializer = VendorExpenseResetSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data
        vendor = Vendor.objects.filter(id=data['vendor_id']).first()
        if vendor is None:
            return Response({'message': 'Vendor is not found'}, status=status.HTTP_400_BAD_REQUEST)
        VendorExpense.objects.filter(
            vendor=vendor,
            year=data['year'],
            month=data['month']
        ).delete()
        return Response({
            'vendor_id': vendor.id,
            'expense': 0
        })
