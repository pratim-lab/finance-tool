from django.contrib import admin
from django.urls import path
from djangoproject.admin import custom_admin
from tools.admin_views.contractor_views import ContractorListView, ContractorCreateAdminAPIView, \
    ContractorRetrieveUpdateDestroyAdminAPIView
from tools.forms.contractor_forms import ContractorForm
from tools.models import Contractor
from django.contrib.auth.admin import csrf_protect_m


class ContractorAdmin(admin.ModelAdmin):
    change_list_template = 'admin/contractor/contractor_change_list.html'

    def get_urls(self):
        urls = super().get_urls()
        my_urls = [
            path("api/add", self.admin_site.admin_view(ContractorCreateAdminAPIView.as_view())),
            path("api/list", self.admin_site.admin_view(ContractorListView.as_view())),
            path("api/<pk>", self.admin_site.admin_view(ContractorRetrieveUpdateDestroyAdminAPIView.as_view())),
        ]
        return my_urls + urls

    @csrf_protect_m
    def changelist_view(self, request, extra_context=None):
        return super().changelist_view(request, extra_context={"form": ContractorForm(), "title": "Contractors"})


custom_admin.register(Contractor, ContractorAdmin)