$(document).ready(function () {

    let currentSelection = {
        filters: {
            clientType: ""
        },
        pageNumber: 1,
        pageSize: 8
    };

    let clientData = {
        count: 0,
        currentPageNumber: 1,
        results: []
    };

    function getProjectsHtml(projects) {
        if (projects.length === 0) {
            return '<span>-----</span>';
        } else if (projects.length === 1) {
            return '<a href="' + '/admin/tools/project/' + projects[0].id + '/change/' + '" target="_blank">' + projects[0].project_name + '</a>';
        } else {
            let optionsHtml = '<option value="-1" selected>' + projects.length + '</option>';
            for (let i = 0; i < projects.length; i++) {
                optionsHtml += '<option value="' + projects[i].id + '">' + projects[i].project_name + '</option>';
            }
            const selectHtml = '<select class="form-select form-select-sm project_dropdown" ' +
                'aria-label=".form-select-sm example">' + optionsHtml + '</select>';
            return selectHtml;
        }
    }

    function getClientColumnsHtml(client) {
        let activeProjectsHtml = getProjectsHtml(client.projects.active_projects);
        let pipelineProjectsHtml = getProjectsHtml(client.projects.pipeline_projects);
        return '' +
            '<th class="client_name">' +
                '<div class="btn-group dropend client-id-' + client.id + '" role="group">' +
                    '<button type="button" class="btn btn-secondary list-action-button" data-bs-toggle="dropdown" aria-expanded="false">' +
                        '<img src="/static/custom_admin_assets/images/primary_fill.svg" alt="">' +
                    '</button>' +
                    '<span> ' + client.client_name + '</span>' +
                    '<ul class="dropdown-menu">' +
                        '<li><button class="btn btn-client-edit" data-id="' + client.id + '">Edit</button></li>       ' +
                        '<li><button class="btn btn-client-delete" data-id="' + client.id + '">Delete</button></li>' +
                    '</ul>' +
                '</div>' +
            '</th>' +
            '<td class="client_type">' + client.client_type + '</td>' +
            '<td class="client_status">' + client.client_type + '</td>' +
            '<td class="active_projects">' + activeProjectsHtml + '</td>' +
            '<td class="pipeline_projects">' + pipelineProjectsHtml + '</td>' +
            '<td class="annual_revenue">' + client.committed_annual_revenue + '</td>' +
            '<td class="projected_revenue">' + client.projected_annual_revenue + '</td>';
    }

    function getClientRowHtml(client) {
        return '<tr>' + getClientColumnsHtml(client) + '</tr>';
    }

    function getClientRowsHtml() {
        let rowsHtml = '';
        for (let i = 0; i < clientData.results.length; i++) {
            rowsHtml += getClientRowHtml(clientData.results[i]);
        }
        return rowsHtml;
    }

    function updateTable() {
        if (clientData.results.length === 0) {
            $('#id_no_content').show();
            $('#id_client_table').hide();
        }
        else {
            const clientsRowsHtml = getClientRowsHtml();
            $('#id_no_content').hide();
            $('#id_client_table').show();
            $('#id_client_table').find('tbody').html(clientsRowsHtml);
        }
    }

    function updatePagination() {
        const numberOfPages = Math.ceil(clientData.count / currentSelection.pageSize);
        if(numberOfPages <= 1) {
            $('#id_pagination_container').html('');
            return;
        }
        let paginationHtml = '';
        for (let i = 1; i <= numberOfPages; i++) {
            let buttonStateClass = '';
            if (clientData.currentPageNumber === i) {
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

    async function getClients() {
        let path = '/custom-admin/operations/client/api/list?page=' + currentSelection.pageNumber;
        let params = {};
        if (currentSelection.filters.clientType !== "") {
            params.client_type = currentSelection.filters.clientType;
        }
        const response = await apiClient.get(path, {
            params: params
        });
        clientData = response.data;
        clientData.currentPageNumber = currentSelection.pageNumber;
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

    getClients();

    let currentOperation = 'add';

    function resetForm() {
        $('#id_client_name').val('');
        $('#id_address1').val('');
        $('#id_address2').val('');
        $('#id_city').val('');
        $('#id_state').val('');
        $('#id_zipcode').val('');
        $('#id_client_type').val('');
        $('#id_billing_structure').val('');
        $('#id_billing_target').val('');
        $('#id_payment_terms').val('');
    }

    function fillUpForm(client) {
        $('#id_client_name').val(client.client_name);
        $('#id_address1').val(client.address1);
        $('#id_address2').val(client.address2);
        $('#id_city').val(client.city);
        $('#id_state').val(client.state);
        $('#id_zipcode').val(client.zipcode);
        $('#id_client_type').val(client.client_type);
        $('#id_billing_structure').val(client.billing_structure);
        $('#id_billing_target').val(client.billing_target);
        $('#id_payment_terms').val(client.payment_terms);
    }

    function showModal(type) {
        $('.error_container').html('');
        if (type === 'add') {
            currentOperation = 'add';
            $('.modal-title').html('Add New Client');
            $('#id_btn_client_add').html('Add Client');
        } else if (type === 'edit') {
            currentOperation = 'edit';
            $('.modal-title').html('Edit Client');
            $('#id_btn_client_add').html('Update Client');
        }
        $('#modal-client').modal('show');
    }

    $('#btn-client-modal-show').on('click', function () {
        resetForm();
        showModal('add');
    });

    async function addClient(data) {
        const resp = await apiClient.post('/custom-admin/operations/client/api/add', data, {
            validateStatus: (status) => {
                return status >= 200 && status < 500;
            },
        });
        if (resp.status === 201) {
            clientData.results = [resp.data, ...clientData.results];
            updateTable();
            $('#modal-client').modal('hide');
            resetForm();
        } else if (resp.status === 400) {
            showValidationErrors(resp.data);
        }
    }

    async function editClient(data) {
        let clientId = $('#id_selected_client').val();
        const resp = await apiClient.patch('/custom-admin/operations/client/api/' + clientId, data, {
            validateStatus: (status) => {
                return status >= 200 && status < 500;
            },
        });
        if (resp.status === 200) {
            for (let i = 0; i < clientData.results.length; i++) {
                if (clientData.results[i].id === resp.data.id) {
                    clientData.results[i] = resp.data;
                }
            }
            updateTable();
            $('#modal-client').modal('hide');
            resetForm();
        } else if (resp.status === 400) {
            showValidationErrors(resp.data);
        }
    }

    $('#id_btn_client_add').on('click', function () {
        $('.error_container').html('');
        let data = {
            client_name: $('#id_client_name').val(),
            address1: $('#id_address1').val(),
            address2: $('#id_address2').val(),
            city: $('#id_city').val(),
            state: $('#id_state').val(),
            zipcode: $('#id_zipcode').val(),
            client_type: $('#id_client_type').val(),
            billing_structure: $('#id_billing_structure').val(),
            billing_target: $('#id_billing_target').val(),
            payment_terms: $('#id_payment_terms').val()
        };
        if (currentOperation === 'add') {
            addClient(data);
        } else if (currentOperation === 'edit') {
            editClient(data);
        }

    });

    $('tbody').on('click', '.btn-client-edit', async function (e) {
        e.preventDefault();
        let id = $(this).attr('data-id');
        const response = await apiClient.get('/custom-admin/operations/client/api/' + id);
        $('#id_selected_client').val(id);
        fillUpForm(response.data);
        showModal('edit');
    });

    $('tbody').on('click', '.btn-client-delete', function (e) {
        e.preventDefault();
        $('#id_selected_client').val($(this).attr('data-id'));
        $('#modal-delete').modal('show');
    });

    $('#modal-delete').on('click', '#btn-confirm-delete', async function () {
        const clientId = $('#id_selected_client').val();
        const response = await apiClient.delete('/custom-admin/operations/client/api/' + clientId);
        $('#modal-delete').modal('hide');
        for (let i = 0; i < clientData.results.length; i++) {
            if (clientId == clientData.results[i].id) {
                console.log("matched");
                clientData.results.splice(i, 1);
                break;
            }
        }
        updateTable();
    });

    $('#id_filters_container').on('click', '.btn_filter', async function (e) {
        e.preventDefault();
        currentSelection.filters.clientType = $(this).attr('data-filter');
        currentSelection.pageNumber = 1;
        await getClients();
        $('#id_filters_container').find('.btn_filter').removeClass("active");
        $(this).addClass('active');
    });

    $('#id_pagination_container').on('click', '#id_btn_next_page', async function (e) {
        e.preventDefault();
        const numberOfPages = Math.ceil(clientData.count / currentSelection.pageSize);
        if (currentSelection.pageNumber - numberOfPages) {
            currentSelection.pageNumber += 1;
            await getClients();
        }
    });

    $('#id_pagination_container').on('click', '#id_btn_previous_page', async function (e) {
        e.preventDefault();
        if (currentSelection.pageNumber > 1) {
            currentSelection.pageNumber -= 1;
            await getClients();
        }
    });

    $('#id_pagination_container').on('click', '.page', async function (e) {
        e.preventDefault();
        const pageNumber = Number($(this).html());
        if (currentSelection.pageNumber !== pageNumber) {
            currentSelection.pageNumber = pageNumber;
            await getClients();
        }
    });

    $('#id_client_table').on('change', '.project_dropdown', async function (e) {
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
