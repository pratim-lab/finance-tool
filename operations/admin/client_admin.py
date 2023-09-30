from django.contrib import admin
from django.contrib.auth.admin import csrf_protect_m
from django.urls import path
from django.utils.html import format_html

from djangoproject.admin import custom_admin
from operations.admin_views.client_views import (ClientCreateAdminAPIView, ClientRetrieveUpdateDestroyAdminAPIView,
                                                 ClientListView)
from operations.forms.client_forms import ClientAddForm
from operations.models import Client


class ClientAdmin(admin.ModelAdmin):
    change_list_template = 'admin/client/client_change_list.html'
    list_display = ('action', 'client_name', 'client_type', 'billing_structure', 'created_at')
    list_display_links = ('client_name',)

    def get_urls(self):
        urls = super().get_urls()
        my_urls = [
            path("api/add", self.admin_site.admin_view(ClientCreateAdminAPIView.as_view())),
            path("api/list", self.admin_site.admin_view(ClientListView.as_view())),
            path("api/<pk>", self.admin_site.admin_view(ClientRetrieveUpdateDestroyAdminAPIView.as_view())),

        ]
        return my_urls + urls

    def action(self, obj):
        return format_html(
            '<div class="btn-group dropend client-id-' + str(obj.id) + '" role="group">'
                '<button type="button" class="btn btn-secondary" data-bs-toggle="dropdown">:</button>'
                '<ul class="dropdown-menu">'
                    '<li>'
                        '<button class="btn btn-client-edit" data-id=' + str(obj.id) + '>Edit</button>'
                    '</li>'
                    '<li>'
                        '<button class="btn btn-client-delete" data-id=' + str(obj.id) + '>Delete</button>'
                    '</li>'
                '</ul>'
            '</div>'
        )

    action.allow_tags = True
    # my_url_field.short_description = 'Action'

    @csrf_protect_m
    def changelist_view(self, request, extra_context=None):
        return super().changelist_view(request, extra_context={"client_add_form": ClientAddForm(), "title": "Clients"})


custom_admin.register(Client, ClientAdmin)
