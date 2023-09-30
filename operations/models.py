from django.db import models

from tools.models import Client as ToolsClient


class Client(ToolsClient):
    class Meta:
        proxy = True
