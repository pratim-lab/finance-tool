from rest_framework.pagination import PageNumberPagination


class ContractorAdminPagination(PageNumberPagination):
    page_size = 1000


class StaffAdminPagination(PageNumberPagination):
    page_size = 8


class VendorAdminPagination(PageNumberPagination):
    page_size = 8
