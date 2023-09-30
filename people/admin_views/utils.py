from rest_framework.pagination import PageNumberPagination


class ContractorAdminPagination(PageNumberPagination):
    page_size = 1000
