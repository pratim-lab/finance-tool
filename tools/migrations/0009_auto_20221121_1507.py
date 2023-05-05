# Generated by Django 3.2.16 on 2022-11-21 15:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tools', '0008_employee'),
    ]

    operations = [
        migrations.AddField(
            model_name='employee',
            name='employee_net_income',
            field=models.CharField(default=0, max_length=10),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='employee',
            name='employee_monthly_tax',
            field=models.CharField(help_text='Please enter fee as %', max_length=10),
        ),
    ]
