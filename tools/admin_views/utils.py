from rest_framework.pagination import PageNumberPagination


class AdminPagination(PageNumberPagination):
    page_size = 10


class ContractorAdminPagination(PageNumberPagination):
    page_size = 1000
