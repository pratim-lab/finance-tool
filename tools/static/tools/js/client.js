if (!$) {
    $ = django.jQuery;
}
//alert('Client Loaded!');

$(document).ready(function() {

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
		if(type === 'add') {
			currentOperation = 'add';
			$('.modal-title').html('Add New Client');
		}
		else if(type === 'edit') {
			currentOperation = 'edit';
			$('.modal-title').html('Edit Client');
		}
		$('#modal-client').modal('show');
	}

	$('#btn-client-modal-show').on('click', function (){
		resetForm();
		showModal('add');
	});

	function addClient(data) {
		$.ajax({
            type: 'POST',
            url: '/admin/tools/client/api/add',
            data: JSON.stringify(data),
            dataType: 'json',
            headers: {
                "X-CSRFToken": $('#id_csrf_token').val()
            },
            contentType: 'application/json',
            success: function (response) {
				$('#modal-client').modal('hide');
				resetForm();
				let rowHtml ='' +
					'<tr>' +
					'    <td class="action-checkbox"><input type="checkbox" name="_selected_action" value="'+ response.id +'" class="action-select"></td>' +
						'<td class="field-action">' +
							'<div class="btn-group dropend client-id-22" role="group">' +
						'		<button type="button" class="btn btn-secondary" data-bs-toggle="dropdown" aria-expanded="false">:</button>' +
						'		<ul class="dropdown-menu" style="">' +
						'			<li><button class="btn btn-client-edit" data-id="' + response.id + '">Edit</button></li>       ' +
						'			<li><button class="btn btn-client-delete" data-id="' + response.id + '">Delete</button></li>' +
						'		</ul>' +
						'	</div>' +
						'</td>' +
					'    <th class="field-client_name"><a href="/admin/tools/client/'+ response.id +'/change/">' + response.client_name + '</a></th>' +
					'    <td class="field-client_type">' + response.client_type + '</td>' +
					'    <td class="field-billing_structure">' + response.billing_structure + '</td>' +
					'    <td class="field-created_at nowrap">' + response.created_at + '</td>' +
					'</tr>';
				$('#result_list').find('tbody').prepend(rowHtml).hide().show('slow');
            },
            error: function (xhr, status, error){
				// request data validation error
				if(xhr.status === 400) {
					let validationError = xhr.responseJSON;
					for (let key in validationError) {
						let errorHtml = '';
						for(let i = 0; i < validationError[key].length; i++) {
							errorHtml += '<li>* '+ validationError[key][i] +'</li>';
						}
						$('#id_error_' + key).html(errorHtml);
					}
				}
            }
        });
	}

	function editClient(data) {
		let clientId = $('#id_selected_client').val();
		$.ajax({
            type: 'PATCH',
            url: '/admin/tools/client/api/' + clientId,
            data: JSON.stringify(data),
            dataType: 'json',
            headers: {
                "X-CSRFToken": $('#id_csrf_token').val()
            },
            contentType: 'application/json',
            success: function (response) {
				$('#modal-client').modal('hide');
				resetForm();
				let rowHtml ='' +
					'<td class="action-checkbox"><input type="checkbox" name="_selected_action" value="'+ response.id +'" class="action-select"></td>' +
					'<td class="field-action">' +
						'<div class="btn-group dropend client-id-' + response.id +  '" role="group">' +
						'	<button type="button" class="btn btn-secondary" data-bs-toggle="dropdown" aria-expanded="false">:</button>' +
						'	<ul class="dropdown-menu" style="">' +
						'		<li><button class="btn btn-client-edit" data-id="' + response.id + '">Edit</button></li>       ' +
						'		<li><button class="btn btn-client-delete" data-id="' + response.id + '">Delete</button></li>' +
						'	</ul>' +
					'	</div>' +
					'</td>' +
					'<th class="field-client_name"><a href="/admin/tools/client/'+ response.id +'/change/">' + response.client_name + '</a></th>' +
					'<td class="field-client_type">' + response.client_type + '</td>' +
					'<td class="field-billing_structure">' + response.billing_structure + '</td>' +
					'<td class="field-created_at nowrap">' + response.created_at + '</td>';
				$('.client-id-' + clientId).parents('tr').html(rowHtml).show('slow');
            },
            error: function (xhr, status, error) {
				// request data validation error
				if(xhr.status === 400) {
					let validationError = xhr.responseJSON;
					for (let key in validationError) {
						let errorHtml = '';
						for(let i = 0; i < validationError[key].length; i++) {
							errorHtml += '<li>* '+ validationError[key][i] +'</li>';
						}
						$('#id_error_' + key).html(errorHtml);
					}
				}
            }
        });
	}

	$('#id_btn_client_add').on('click', function (){
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

		if(currentOperation === 'add') {
			addClient(data);
		}
		else if(currentOperation === 'edit') {
			editClient(data);
		}

	});

	$('tbody').on('click', '.btn-client-edit', function (e){
		e.preventDefault();
		let id = $(this).attr('data-id');

		$.ajax({
            type: 'GET',
            url: '/admin/tools/client/api/' + id,
            dataType: 'json',
            headers: {
                "X-CSRFToken": $('#id_csrf_token').val()
            },
            contentType: 'application/json',
            success: function (response) {
				$('#id_selected_client').val(id);
				fillUpForm(response);
				showModal('edit');
            },
            error: function (xhr, status, error) {

            }
        });
	});

	$('tbody').on('click', '.btn-client-delete', function (e){
		e.preventDefault();
		$('#id_selected_client').val($(this).attr('data-id'));
		$('#modal-delete').modal('show');
	});

	$('#modal-delete').on('click', '#btn-confirm-delete', function (){
		$.ajax({
            type: 'DELETE',
            url: '/admin/tools/client/api/' + $('#id_selected_client').val(),
            dataType: 'json',
            headers: {
                "X-CSRFToken": $('#id_csrf_token').val()
            },
            contentType: 'application/json',
            success: function (response) {
				$('#modal-delete').modal('hide');
				$('.client-id-' + $('#id_selected_client').val()).parents('tr').hide('slow', function(){
					$(this).remove();
				});
            },
            error: function (xhr, status, error) {

            }
        });
	});
	
	if($("#id_payment_terms").val() != 'OTR'){
		$(".field-payment_terms_other").hide();
	}
	
	$("#id_payment_terms").change(function () {
	    let payment_terms_val = $(this).val();
	    if(payment_terms_val== 'OTR') {
			$(".field-payment_terms_other").show(); 
	    } else {
	    	$(".field-payment_terms_other").hide();
	    }
	});

});
