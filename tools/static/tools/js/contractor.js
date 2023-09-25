if (!$) {
    $ = django.jQuery;
}
//alert('Contractor Loaded!');

$(document).ready(function() {

	const apiClient = axios.create({
        headers: {
			'X-CSRFToken': $('#id_csrf_token').val(),
			'Content-Type': 'application/json'
        }
    });

	let currentSelection = {
		filters: {},
        pageNumber: 1,
        pageSize: 10
	};

    let data = {
		count: 0,
		currentPageNumber: 1,
		results : []
	};

    const ADD = 'add';
    const EDIT = 'edit';
    const ADD_TITLE = 'Add New Contractor';
    const EDIT_TITLE = 'Edit Contractor';

    let currentOperation = ADD;
    let selectedItemId = '';

    const $formModal = $('#modal-contractor');

    function showModal(type) {
        if (type === ADD) {
            currentOperation = ADD;
            $('.modal-title').html(ADD_TITLE);
        } else if (type === EDIT) {
            currentOperation = EDIT;
            $('.modal-title').html(EDIT_TITLE);
        }
        $formModal.modal('show');
    }

    function hideModal() {
        $formModal.modal('hide');
    }

    function resetForm() {
        $('#id_contractor_name').val('');
        $('#id_address1').val('');
        $('#id_address2').val('');
        $('#id_city').val('');
        $('#id_state').val('');
        $('#id_country').val('');
        $('#id_zipcode').val('');
        $('#id_contractor_start_date').val('');
        $('#id_contractor_hourly_salary').val('');
        $('#id_contractor_expected_weekly_hours').val('');
        $('#id_contractor_estimated_weekly_salary').val('');
    }

    function fillUpForm(contractor) {
        $('#id_contractor_name').val(contractor.contractor_name);
        $('#id_address1').val(contractor.address1);
        $('#id_address2').val(contractor.address2);
        $('#id_city').val(contractor.city);
        $('#id_state').val(contractor.state);
        $('#id_country').val(contractor.country);
        $('#id_zipcode').val(contractor.zipcode);
        $('#id_contractor_start_date').val(contractor.contractor_start_date);
        $('#id_contractor_hourly_salary').val(contractor.contractor_hourly_salary);
        $('#id_contractor_expected_weekly_hours').val(contractor.contractor_expected_weekly_hours);
        $('#id_contractor_estimated_weekly_salary').val(contractor.contractor_estimated_weekly_salary);
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

	function getColumnsHtml(contractor) {
        return '' +
            '<th class="client_name">' +
                '<div class="btn-group dropend contractor-id-' + contractor.id + '" role="group">' +
                    '<button type="button" class="btn btn-secondary list-action-button" data-bs-toggle="dropdown" aria-expanded="false">' +
                        '<img src="/static/custom_admin_assets/images/primary_fill.svg" alt="">' +
                    '</button>'+
                    '<div>' + contractor.contractor_name +
                        '<span class="locate">' + contractor.city + ', '+ contractor.state +'</span>' +
                    '</div>' +
                    '<ul class="dropdown-menu">' +
                        '<li><button class="btn btn-edit" data-id="' + contractor.id + '">Edit</button></li>' +
                        '<li><button class="btn btn-delete" data-id="' + contractor.id + '">Delete</button></li>' +
                    '</ul>' +
                '</div>' +
            '</th>' +
            '<td class="contractor_start_date">' + contractor.contractor_start_date + '</td>' +
            '<td class="contractor_hourly_salary">' + contractor.contractor_hourly_salary + '</td>' +
            '<td class="contractor_expected_weekly_hours">' + contractor.contractor_expected_weekly_hours + '</td>' +
            '<td class="contractor_estimated_weekly_salary">' + contractor.contractor_estimated_weekly_salary + '</td>';
    }

	function getRowHtml(client) {
        return '<tr>' + getColumnsHtml(client) + '</tr>';
    }

    function getRowsHtml() {
        let rowsHtml = '';
        for (let i = 0; i < data.results.length; i++) {
            rowsHtml += getRowHtml(data.results[i]);
        }
        return rowsHtml;
    }

    function updateTable() {
        const rowsHtml = getRowsHtml();
        $('#id_list_table').find('tbody').html(rowsHtml);
    }

	function updatePagination() {
        const numberOfPages = Math.ceil(data.count / currentSelection.pageSize);
        let paginationHtml = '';
        for(let i = 1; i <= numberOfPages; i++) {
            let buttonStateClass = '';
            if (data.currentPageNumber  === i) {
                buttonStateClass = 'active';
            }
            paginationHtml += '<li class="page-item '+ buttonStateClass +'"><a class="page-link page" href="#">' + i + '</a></li>';
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

	async function getListData() {
        let path = '/custom-admin/tools/contractor/api/list?page=' + currentSelection.pageNumber;
        const response = await apiClient.get(path);
		data = response.data;
        data.currentPageNumber = currentSelection.pageNumber;
		updateTable();
        updatePagination();
    }

	getListData();

    async function addContractor(contractorData) {
		const resp = await apiClient.post('/custom-admin/tools/contractor/api/add', contractorData, {
			validateStatus: (status) => {
            	return status >= 200 && status < 500;
        	},
		});
		if(resp.status === 201) {
			data.results = [resp.data, ...data.results];
			updateTable();
			hideModal();
			resetForm();
		}
		else if(resp.status === 400) {
			showValidationErrors(resp.data);
		}
    }
    
    async function editContractor(contractorData) {
		const resp = await apiClient.patch('/custom-admin/tools/contractor/api/' + selectedItemId, contractorData, {
			validateStatus: (status) => {
            	return status >= 200 && status < 500;
        	},
		});
		if(resp.status === 200) {
			for (let i = 0; i < data.results.length; i++) {
				if(data.results[i].id === resp.data.id) {
					data.results[i] = resp.data;
				}
			}
			updateTable();
			hideModal();
			resetForm();
		}
		else if(resp.status === 400) {
			showValidationErrors(resp.data);
		}
    }

    $('#id_btn_contractor_add').on('click', function () {
        $('.error_container').html('');
        let contractorData = {
            contractor_name: $('#id_contractor_name').val(),
            address1: $('#id_address1').val(),
            address2: $('#id_address2').val(),
            city: $('#id_city').val(),
            state: $('#id_state').val(),
            country: $('#id_country').val(),
            zipcode: $('#id_zipcode').val(),
            contractor_start_date: $('#id_contractor_start_date').val(),
            contractor_hourly_salary: $('#id_contractor_hourly_salary').val(),
            contractor_expected_weekly_hours: $('#id_contractor_expected_weekly_hours').val(),
            contractor_estimated_weekly_salary: $('#id_contractor_estimated_weekly_salary').val(),
        };

        if (currentOperation === ADD) {
            addContractor(contractorData);
        } else if (currentOperation === EDIT) {
            editContractor(contractorData);
        }

    });

    $('#btn_modal_contractor').click(function () {
        showModal(ADD);
    });

    $('tbody').on('click', '.btn-edit', async function (e) {
        e.preventDefault();
        let id = $(this).attr('data-id');
		const response = await apiClient.get('/custom-admin/tools/contractor/api/' + id);
		selectedItemId = id;
		fillUpForm(response.data);
		showModal(EDIT);
    });

    $('tbody').on('click', '.btn-delete', function (e) {
        e.preventDefault();
        selectedItemId = $(this).attr('data-id');
        $('#modal-delete').modal('show');
    });

    $('#modal-delete').on('click', '#btn-confirm-delete', async function () {
		const response = await apiClient.delete('/custom-admin/tools/contractor/api/' + selectedItemId);
		$('#modal-delete').modal('hide');
		for(let i = 0; i < data.results.length; i++) {
			if(selectedItemId == data.results[i].id) {
				console.log("matched");
				data.results.splice(i, 1);
				break;
			}
		}
		updateTable();
    });

	$("#id_contractor_hourly_salary").blur(function(){
		calculate_net();
	});

	$("#id_contractor_expected_weekly_hours").blur(function(){
		calculate_net();
	});

});

function calculate_net(){
	sal = parseFloat($("#id_contractor_hourly_salary").val());
	hours = parseFloat($("#id_contractor_expected_weekly_hours").val());
	if(!isNaN(sal) && !isNaN(hours)){
		netsal = sal * hours;
		$("#id_contractor_estimated_weekly_salary").val(netsal);
	}else{
		$("#id_contractor_estimated_weekly_salary").val('');
	}
	
}