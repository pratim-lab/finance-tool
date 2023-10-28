$(document).ready(function () {

    let currentSelection = {
        filters: {
            projectType: ""
        },
        pageNumber: 1,
        pageSize: 8
    };

    let projectData = {
        count: 0,
        currentPageNumber: 1,
        results: []
    };

    

    function getProjectColumnsHtml(project) {
        return '' +
            '<th class="client_name">' +
                '<div class="btn-group dropend project-id-' + project.id + '" role="group">' +
                    '<button type="button" class="btn btn-secondary list-action-button" data-bs-toggle="dropdown" aria-expanded="false">' +
                        '<img src="/static/custom_admin_assets/images/primary_fill.svg" alt="">' +
                    '</button>' +
                    '<span> ' + project.project_name + '</span>' +
                    '<ul class="dropdown-menu">' +
                        '<li><button class="btn btn-client-edit" data-id="' + project.id + '">Edit</button></li>       ' +
                        '<li><button class="btn btn-client-delete" data-id="' + project.id + '">Delete</button></li>' +
                    '</ul>' +
                '</div>' +
            '</th>' +
            '<td class="client_type">' + project.project_type + '</td>' +
            '<td class="client_status">' + project.start_date + '</td>' +
            '<td class="client_status">' + project.end_date + '</td>' +
            '<td class="projected_revenue">' + project.project_budget + '</td>';
    }

    function getProjectRowHtml(project) {
        return '<tr>' + getProjectColumnsHtml(project) + '</tr>';
    }

    function getProjectRowsHtml() {
        let rowsHtml = '';
        for (let i = 0; i < projectData.results.length; i++) {
            rowsHtml += getProjectRowHtml(projectData.results[i]);
        }
        return rowsHtml;
    }

    function updateTable() {
        if (projectData.results.length === 0) {
            $('#id_no_content').show();
            $('#id_project_table').hide();
        }
        else {
            const projectsRowsHtml = getProjectRowsHtml();
            $('#id_no_content').hide();
            $('#id_project_table').show();
            $('#id_project_table').find('tbody').html(projectsRowsHtml);
        }
    }

    function updatePagination() {
        const numberOfPages = Math.ceil(projectData.count / currentSelection.pageSize);
        if(numberOfPages <= 1) {
            $('#id_pagination_container').html('');
            return;
        }
        let paginationHtml = '';
        for (let i = 1; i <= numberOfPages; i++) {
            let buttonStateClass = '';
            if (projectData.currentPageNumber === i) {
                buttonStateClass = 'active';
            }
            paginationHtml += '<li class="page-item ' + buttonStateClass + '"><a class="page-link page" href="#">' + i + '</a></li>';
        }
        paginationHtml = '' +
            '<li class="page-item">' +
                '<a class="page-link" href="#" tabindex="-1" aria-disabled="true" id="id_btn_previous_page">' +
                    '<i class="fa fa-chevron-left" aria-hidden="true"></i>' +
                '</a>' +
            '</li>'
                + paginationHtml +
            '<li class="page-item">' +
                '<a class="page-link" href="#" id="id_btn_next_page">' +
                    '<i class="fa fa-chevron-right" aria-hidden="true"></i>' +
                '</a>' +
            '</li>';
        $('#id_pagination_container').html(paginationHtml);
    }

    async function getProjects() {
        let path = '/custom-admin/operations/project/api/list?page=' + currentSelection.pageNumber;
        let params = {};
        if (currentSelection.filters.projectType !== "") {
            params.project_type = currentSelection.filters.projectType;
        }
        const response = await apiClient.get(path, {
            params: params
        });
        projectData = response.data;
        projectData.currentPageNumber = currentSelection.pageNumber;
        updateTable();
        updatePagination();
    }

    function showValidationErrors(errorData) {
        for (let key in errorData) {
            let errorHtml = '';
            for (let i = 0; i < errorData[key].length; i++) {
                errorHtml += '<li>* ' + errorData[key][i] + '</li>';
            }
            $('#id_error_' + key).html(errorHtml);
        }
    }

    getProjects();

    let currentOperation = 'add';

    function resetForm() {
        $('#id_project_name').val('');
        $('#id_client').val('');
        $('#id_project_type').val('');
        $('#id_start_date').val('');
        $('#id_end_date').val('');
        $('#id_project_budget').val('');
        $('#id_billing_structure').val('');
    }

    function fillUpForm(project) {
        $('#id_client').val(project.client_id);
        $('#id_project_name').val(project.project_name);
        $('#id_project_type').val(project.project_type);
        $('#id_start_date').val(project.start_date);
        $('#id_end_date').val(project.end_date);
        $('#id_project_budget').val(project.project_budget);
        $('#id_billing_structure').val(project.billing_structure);
    }

    function showModal(type) {
        $('.error_container').html('');
        if (type === 'add') {
            currentOperation = 'add';
            $('.modal-title').html('Add New Project');
            $('#id_btn_project_add').html('Add Project');
        } else if (type === 'edit') {
            currentOperation = 'edit';
            $('.modal-title').html('Edit Project');
            $('#id_btn_project_add').html('Update Project');
        }
        $('#modal-project').modal('show');
    }

    $('#btn-project-modal-show').on('click', function () {
        resetForm();
        showModal('add');
    });

    async function addProject(data) {
        const resp = await apiClient.post('/custom-admin/operations/project/api/add', data, {
            validateStatus: (status) => {
                return status >= 200 && status < 500;
            },
        });
        if (resp.status === 201) {
            projectData.results = [resp.data, ...projectData.results];
            updateTable();
            $('#modal-project').modal('hide');
            resetForm();
        } else if (resp.status === 400) {
            showValidationErrors(resp.data);
        }
    }

    async function editProject(data) {
        let projectId = $('#id_selected_project').val();
        const resp = await apiClient.patch('/custom-admin/operations/project/api/' + projectId, data, {
            validateStatus: (status) => {
                return status >= 200 && status < 500;
            },
        });
        if (resp.status === 200) {
            for (let i = 0; i < projectData.results.length; i++) {
                if (projectData.results[i].id === resp.data.id) {
                    projectData.results[i] = resp.data;
                }
            }
            updateTable();
            $('#modal-project').modal('hide');
            resetForm();
        } else if (resp.status === 400) {
            showValidationErrors(resp.data);
        }
    }

    $('#id_btn_project_add').on('click', function () {
        $('.error_container').html('');
        let data = {
            client_id: $('#id_client').val(),
            project_name: $('#id_project_name').val(),
            project_type: $('#id_project_type').val(),
            start_date: $('#id_start_date').val(),
            end_date: $('#id_end_date').val(),
            project_budget: $('#id_project_budget').val(),
            billing_structure: $('#id_billing_structure').val()
        };
        if (currentOperation === 'add') {
            addProject(data);
        } else if (currentOperation === 'edit') {
            editProject(data);
        }

    });

    $('tbody').on('click', '.btn-client-edit', async function (e) {
        e.preventDefault();
        let id = $(this).attr('data-id');
        const response = await apiClient.get('/custom-admin/operations/project/api/' + id);
        $('#id_selected_project').val(id);
        fillUpForm(response.data);
        showModal('edit');
    });

    $('tbody').on('click', '.btn-client-delete', function (e) {
        e.preventDefault();
        $('#id_selected_project').val($(this).attr('data-id'));
        $('#modal-delete').modal('show');
    });

    $('#modal-delete').on('click', '#btn-confirm-delete', async function () {
        const projectId = $('#id_selected_project').val();
        const response = await apiClient.delete('/custom-admin/operations/project/api/' + projectId);
        $('#modal-delete').modal('hide');
        for (let i = 0; i < projectData.results.length; i++) {
            if (projectId == projectData.results[i].id) {
                console.log("matched");
                projectData.results.splice(i, 1);
                break;
            }
        }
        updateTable();
    });

    $('#id_filters_container').on('click', '.btn_filter', async function (e) {
        e.preventDefault();
        currentSelection.filters.projectType = $(this).attr('data-filter');
        currentSelection.pageNumber = 1;
        await getProjects();
        $('#id_filters_container').find('.btn_filter').removeClass("active");
        $(this).addClass('active');
    });

    $('#id_pagination_container').on('click', '#id_btn_next_page', async function (e) {
        e.preventDefault();
        const numberOfPages = Math.ceil(projectData.count / currentSelection.pageSize);
        if (currentSelection.pageNumber - numberOfPages) {
            currentSelection.pageNumber += 1;
            await getProjects();
        }
    });

    $('#id_pagination_container').on('click', '#id_btn_previous_page', async function (e) {
        e.preventDefault();
        if (currentSelection.pageNumber > 1) {
            currentSelection.pageNumber -= 1;
            await getProjects();
        }
    });

    $('#id_pagination_container').on('click', '.page', async function (e) {
        e.preventDefault();
        const pageNumber = Number($(this).html());
        if (currentSelection.pageNumber !== pageNumber) {
            currentSelection.pageNumber = pageNumber;
            await getProjects();
        }
    });

    $('#id_project_table').on('change', '.project_dropdown', async function (e) {
        const selectedProjectId = $(this).val();
        if (selectedProjectId !== "-1") {
            window.open(`/admin/tools/project/${selectedProjectId}/change/`);
        }
    });

    if ($("#id_payment_terms").val() != 'OTR') {
        $(".field-payment_terms_other").hide();
    }

    $("#id_payment_terms").change(function () {
        let payment_terms_val = $(this).val();
        if (payment_terms_val == 'OTR') {
            $(".field-payment_terms_other").show();
        } else {
            $(".field-payment_terms_other").hide();
        }
    });

});
