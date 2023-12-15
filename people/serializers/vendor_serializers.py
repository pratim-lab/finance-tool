import datetime

from rest_framework import serializers

from people.models import Vendor


def current_year():
    return datetime.date.today().year


class VendorAddSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Vendor
        fields = [
            'id',
            'vendor_name',
            'vendor_description'
        ]


class VendorExpenseEditSerializer(serializers.Serializer):
    vendor_id = serializers.IntegerField(allow_null=False, required=True)
    year = serializers.IntegerField(allow_null=False, required=True, min_value=2000, max_value=current_year())
    month = serializers.IntegerField(allow_null=False, required=True, min_value=1, max_value=12)
    expense = serializers.DecimalField(allow_null=False, required=True, max_digits=10, decimal_places=2, min_value=0)
