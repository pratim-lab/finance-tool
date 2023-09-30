from django.db import models
from tools.models import Contractor as ToolsContractor


class Contractor(ToolsContractor):
    class Meta:
        proxy = True
