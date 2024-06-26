from django.contrib import admin
from django.urls import path
from django.template.response import TemplateResponse
from djangoproject.admin import custom_admin
from people.admin_views.contractor_views import ContractorCreateAdminAPIView, ContractorListView, \
    ContractorRetrieveUpdateDestroyAdminAPIView, ContractorReportView
from people.forms.contractor_forms import ContractorForm
from people.models import Contractor
from django.contrib.auth.admin import csrf_protect_m


class ContractorAdmin(admin.ModelAdmin):
    change_list_template = 'admin/contractor/contractor_change_list.html'

    def get_urls(self):
        info = self.model._meta.app_label, self.model._meta.model_name
        urls = [
            path("api/add", self.admin_site.admin_view(ContractorCreateAdminAPIView.as_view())),
            path("api/list", self.admin_site.admin_view(ContractorListView.as_view())),
            path("api/expense", self.admin_site.admin_view(ContractorReportView.as_view())),
            path("api/<pk>", self.admin_site.admin_view(ContractorRetrieveUpdateDestroyAdminAPIView.as_view())),
            path("", self.admin_site.admin_view(self.contractors), name='%s_%s_changelist' % info)
        ]
        return urls

    @csrf_protect_m
    def changelist_view(self, request, extra_context=None):
        return super().changelist_view(request, extra_context={"form": ContractorForm(), "title": "Contractors"})

    def contractors(self, request):
        context = dict(
            self.admin_site.each_context(request),
            form=ContractorForm(),
        )
        return TemplateResponse(request, 'admin/contractor/contractor_change_list.html', context)


custom_admin.register(Contractor, ContractorAdmin)
