from django.contrib import admin
from django.urls import path
from django.template.response import TemplateResponse
from djangoproject.admin import custom_admin
from people.admin_views.vendor_views import VendorCreateAdminAPIView, VendorListView, \
    VendorRetrieveUpdateDestroyAdminAPIView, VendorReportView, VendorExpenseUpdateView, VendorExpenseResetView
from people.forms.vendor_forms import VendorForm
from people.models import Vendor


class VendorAdmin(admin.ModelAdmin):

    def get_urls(self):
        info = self.model._meta.app_label, self.model._meta.model_name
        urls = [
            path("api/add", self.admin_site.admin_view(VendorCreateAdminAPIView.as_view())),
            path("api/list", self.admin_site.admin_view(VendorListView.as_view())),
            path("api/expense/edit", self.admin_site.admin_view(VendorExpenseUpdateView.as_view())),
            path("api/expense/reset", self.admin_site.admin_view(VendorExpenseResetView.as_view())),
            path("api/report", self.admin_site.admin_view(VendorReportView.as_view())),
            path("api/<pk>", self.admin_site.admin_view(VendorRetrieveUpdateDestroyAdminAPIView.as_view())),
            path("", self.admin_site.admin_view(self.vendors), name='%s_%s_changelist' % info)
        ]
        return urls

    def vendors(self, request):
        context = dict(
            self.admin_site.each_context(request),
            vendor_add_form=VendorForm(),
        )
        return TemplateResponse(request, 'admin/vendor/vendor_change_list.html', context)


custom_admin.register(Vendor, VendorAdmin)
