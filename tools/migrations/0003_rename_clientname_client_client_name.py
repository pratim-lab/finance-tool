# Generated by Django 3.2.16 on 2022-11-03 17:22

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tools', '0002_rename_clients_client'),
    ]

    operations = [
        migrations.RenameField(
            model_name='client',
            old_name='clientname',
            new_name='client_name',
        ),
    ]
