# Generated by Django 3.2.16 on 2023-09-29 16:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tools', '0007_pipeline_estimated_payment_amount'),
    ]

    operations = [
        migrations.AddField(
            model_name='contractor',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
    ]