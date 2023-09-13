from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse

from .models import Client, Project

def index(request):
    #return HttpResponse("Hello, world. You're at the tools index.")

    latest_client_list = Client.objects.order_by('-created_at')[:5]
    #output = ', '.join([q.client_name for q in latest_question_list])
    #return HttpResponse(output)

    context = {'latest_client_list': latest_client_list}
    return render(request, 'tools/index.html', context)

def detail(request, question_id):
    return HttpResponse("You're looking at tool %s." % question_id)

def results(request, question_id):
    response = "You're looking at the results of tool %s."
    return HttpResponse(response % question_id)

def vote(request, question_id):
    return HttpResponse("You're voting on tool %s." % question_id)

def get_projects_by_client(request,):
    if request.method == 'GET':
           client_id = request.GET['client_id']
           projects = list(Project.objects.filter(client_id=client_id).values())
           return JsonResponse({"data": projects})
