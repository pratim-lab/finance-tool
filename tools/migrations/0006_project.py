# Generated by Django 3.2.16 on 2022-11-04 06:40

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tools', '0005_auto_20221104_0610'),
    ]

    operations = [
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('project_name', models.CharField(max_length=255)),
                ('project_type', models.CharField(choices=[('A', 'Active'), ('P', 'Pipeline')], max_length=2)),
                ('confidence', models.CharField(max_length=5)),
                ('billing_structure', models.CharField(choices=[('R', 'Retainer'), ('PB', 'Project Based')], max_length=2)),
                ('total_fees', models.CharField(max_length=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tools.client')),
            ],
        ),
    ]
