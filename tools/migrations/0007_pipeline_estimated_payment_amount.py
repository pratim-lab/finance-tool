# Generated by Django 3.2.16 on 2023-09-08 13:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tools', '0006_auto_20230508_1325'),
    ]

    operations = [
        migrations.AddField(
            model_name='pipeline',
            name='estimated_payment_amount',
            field=models.CharField(help_text='Please enter amount in USD', max_length=10, null=True),
        ),
    ]
