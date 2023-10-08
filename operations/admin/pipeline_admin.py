from django.contrib import admin
from django.template.response import TemplateResponse
from django.urls import path

from djangoproject.admin import custom_admin
from operations.admin_views.pipeline_views import PipelineListView, PipelineCreateView, \
    PipelineRetrieveUpdateDestroyAdminAPIView
from operations.forms.pipeline_forms import PipelineAddForm
from operations.models import Pipeline


class PipelineAdmin(admin.ModelAdmin):
    change_list_template = 'admin/pipeline/pipeline_change_list.html'

    def get_urls(self):
        info = self.model._meta.app_label, self.model._meta.model_name
        urls = [
            path("api/add", self.admin_site.admin_view(PipelineCreateView.as_view())),
            path("api/list", self.admin_site.admin_view(PipelineListView.as_view())),
            path("api/<pk>", self.admin_site.admin_view(PipelineRetrieveUpdateDestroyAdminAPIView.as_view())),
            path("", self.admin_site.admin_view(self.pipelines), name='%s_%s_changelist' % info)
        ]
        return urls

    def pipelines(self, request):
        context = dict(
            self.admin_site.each_context(request),
            form=PipelineAddForm()
        )
        return TemplateResponse(request, 'admin/pipeline/pipeline_change_list.html', context)


custom_admin.register(Pipeline, PipelineAdmin)
