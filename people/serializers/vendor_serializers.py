from rest_framework import serializers

from people.models import Vendor


class VendorAddSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Vendor
        fields = [
            'id',
            'vendor_name',
            'vendor_description'
        ]
