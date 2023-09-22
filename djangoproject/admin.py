from django.contrib.admin import AdminSite
from django.views.decorators.cache import never_cache
from django.contrib.auth import REDIRECT_FIELD_NAME
from django.conf import settings


class CustomAdminSite(AdminSite):

    @never_cache
    def login(self, request, extra_context=None):
        extra_context = {}
        if settings.ADMIN_LANDING_PAGE_URL != '':
            extra_context[REDIRECT_FIELD_NAME] = settings.ADMIN_LANDING_PAGE_URL
        return super().login(request, extra_context)


custom_admin = CustomAdminSite(name='Custom Admin')


