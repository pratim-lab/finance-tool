from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('<int:question_id>/', views.detail, name='detail'),
    path('<int:question_id>/results/', views.results, name='results'),
    path('<int:question_id>/vote/', views.vote, name='vote'),

    path('get_projects_by_client/', views.get_projects_by_client, name='get_projects_by_client'),
    path('update_confidence_of_pipeline/', views.update_confidence_of_pipeline, name='update_confidence_of_pipeline'),
    path('update_status_of_pipeline/', views.update_status_of_pipeline, name='update_status_of_pipeline'),
]