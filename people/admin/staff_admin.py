from django.contrib import admin
from django.urls import path
from djangoproject.admin import custom_admin
from django.template.response import TemplateResponse

from people.admin_views.staff_views import StaffListView, StaffCreateAdminAPIView, \
    StaffRetrieveUpdateDestroyAdminAPIView
from people.forms.employee_forms import StaffForm
from people.models import Staff


class StaffAdmin(admin.ModelAdmin):
    change_list_template = 'admin/contractor/contractor_change_list.html'

    def get_urls(self):
        info = self.model._meta.app_label, self.model._meta.model_name
        my_urls = [
            path("api/add", self.admin_site.admin_view(StaffCreateAdminAPIView.as_view())),
            path("api/list", self.admin_site.admin_view(StaffListView.as_view())),
            # path("api/expense", self.admin_site.admin_view(ContractorReportView.as_view())),
            path("api/<pk>", self.admin_site.admin_view(StaffRetrieveUpdateDestroyAdminAPIView.as_view())),
            path("", self.admin_site.admin_view(self.staffs), name='%s_%s_changelist' % info)
        ]
        return my_urls

    def staffs(self, request):
        context = dict(
            self.admin_site.each_context(request),
            form=StaffForm(),
        )
        return TemplateResponse(request, 'admin/staff/staff_change_list.html', context)


custom_admin.register(Staff, StaffAdmin)
