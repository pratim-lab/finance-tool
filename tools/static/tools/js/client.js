if (!$) {
    $ = django.jQuery;
}
//alert('Client Loaded!');

$(document).ready(function () {

    const apiClient = axios.create({
        headers: {
			'X-CSRFToken': $('#id_csrf_token').val(),
			'Content-Type': 'application/json'
        }
    });

	let currentSelection = {
		filters: {
			clientType: ""
		}
	};

    let clientData = {
		count: 0,
		next: null,
		previous: null,
		results : []
	};

    function getProjectNames(projects) {
        let projectNames = '';
        for (let i = 0; i < projects.length; i++) {
            projectNames += projects[i].project_name + ', ';
        }
        return projectNames;
    }

    function getClientColumnsHtml(client) {
        let activeProjects = getProjectNames(client.projects.active_projects);
        let pipelineProjects = getProjectNames(client.projects.pipeline_projects);
        return '' +
            '<td class="field-action">' +
            '<div class="btn-group dropend client-id-' + client.id + '" role="group">' +
            '<button type="button" class="btn btn-secondary" data-bs-toggle="dropdown" aria-expanded="false">:</button>' +
            '<ul class="dropdown-menu" style="">' +
            '<li><button class="btn btn-client-edit" data-id="' + client.id + '">Edit</button></li>       ' +
            '<li><button class="btn btn-client-delete" data-id="' + client.id + '">Delete</button></li>' +
            '</ul>' +
            '</div>' +
            '</td>' +
            '<th class="client_name">' + client.client_name + '</th>' +
            '<td class="client_type">' + client.client_type + '</td>' +
            '<td class="client_status">' + client.client_type + '</td>' +
            '<td class="active_projects">' + activeProjects + '</td>' +
            '<td class="pipeline_projects">' + pipelineProjects + '</td>' +
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
		console.log(clientData);
        const clientsRowsHtml = getClientRowsHtml();
        $('#id_client_table').find('tbody').html(clientsRowsHtml);
		if(clientData.next === null) {
			$('#id_btn_next_page').addClass('disabled');
		}
		else {
			$('#id_btn_next_page').removeClass('disabled');
		}
		if(clientData.previous === null) {
			$('#id_btn_previous_page').addClass('disabled');
		}
		else {
			$('#id_btn_previous_page').removeClass('disabled');
		}
    }

    async function getClients(pageLink) {
		if (pageLink === null) {
			pageLink = '/admin/tools/client/api/list';
		}
		let params = {};
		if (currentSelection.filters.clientType !== "") {
			params.client_type = currentSelection.filters.clientType;
		}
        const response = await apiClient.get(pageLink, {
			params: params
		});
		clientData = response.data;
		updateTable();
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

    getClients(null);

    let currentOperation = 'add';

    function resetForm() {
        $('#id_client_name').val('');
        $('#id_address1').val('');
        $('#id_address2').val('');
        $('#id_city').val('');
        $('#id_state').val('');
        $('#id_country').val('');
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
        $('#id_country').val(client.country);
        $('#id_zipcode').val(client.zipcode);
        $('#id_client_type').val(client.client_type);
        $('#id_billing_structure').val(client.billing_structure);
        $('#id_billing_target').val(client.billing_target);
        $('#id_payment_terms').val(client.payment_terms);
    }

    function showModal(type) {
        if (type === 'add') {
            currentOperation = 'add';
            $('.modal-title').html('Add New Client');
        } else if (type === 'edit') {
            currentOperation = 'edit';
            $('.modal-title').html('Edit Client');
        }
        $('#modal-client').modal('show');
    }

    $('#btn-client-modal-show').on('click', function () {
        resetForm();
        showModal('add');
    });

    async function addClient(data) {
		const resp = await apiClient.post('/admin/tools/client/api/add', data, {
			validateStatus: (status) => {
            	return status >= 200 && status < 500;
        	},
		});
		if(resp.status === 201) {
			clientData.results = [resp.data, ...clientData.results];
			updateTable();
			$('#modal-client').modal('hide');
			resetForm();
		}
		else if(resp.status === 400) {
			showValidationErrors(resp.data);
		}
    }

    async function editClient(data) {
		let clientId = $('#id_selected_client').val();
		const resp = await apiClient.patch('/admin/tools/client/api/' + clientId, data, {
			validateStatus: (status) => {
            	return status >= 200 && status < 500;
        	},
		});
		if(resp.status === 200) {
			for (let i = 0; i < clientData.results.length; i++) {
				if(clientData.results[i].id === resp.data.id) {
					clientData.results[i] = resp.data;
				}
			}
			updateTable();
			$('#modal-client').modal('hide');
			resetForm();
		}
		else if(resp.status === 400) {
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
            country: $('#id_country').val(),
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
		const response = await apiClient.get('/admin/tools/client/api/' + id);
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
		const clientId =  $('#id_selected_client').val();
		const response = await apiClient.delete('/admin/tools/client/api/' + clientId);
		$('#modal-delete').modal('hide');
		for(let i = 0; i < clientData.results.length; i++) {
			if(clientId == clientData.results[i].id) {
				console.log("matched");
				clientData.results.splice(i, 1);
				break;
			}
		}
		updateTable();
    });

	$('#id_filters_container').on('click', '.btn_filter', async function(){
		console.log("ji");
		currentSelection.filters.clientType = $(this).attr('data-filter');
		await getClients(null);
	});
	
	$('#id_pagination_container').on('click', '#id_btn_next_page', async function(){
		await getClients(clientData.next);
	});

	$('#id_pagination_container').on('click', '#id_btn_previous_page', async function(){
		await getClients(clientData.previous);
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
