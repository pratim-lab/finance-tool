if (!$) {
    $ = django.jQuery;
}

$(document).ready(function () {

    const $pipelineModal = $('#modal-item');
    const $pipelineClient = $pipelineModal.find('#id_client');
    const $pipelineProject = $pipelineModal.find('#id_project');
    const $expectedDateOfFirstPayment = $('#id_expected_date_of_first_payment');
    const $expectedDateOfSecondPayment = $('#id_expected_date_of_second_payment');
    const $expectedDateOfThirdPayment = $('#id_expected_date_of_third_payment');
    const $expectedDateOfFourthPayment = $('#id_expected_date_of_forth_payment');
    const $expectedDateOfFifthPayment = $('#id_expected_date_of_fifth_payment');
    const $expectedDateOfSixthPayment = $('#id_expected_date_of_sixth_payment');
    const $expectedDateOfSeventhPayment = $('#id_expected_date_of_seventh_payment');
    const $expectedDateOfEighthPayment = $('#id_expected_date_of_eighth_payment');
    const $expectedDateOfNinthPayment = $('#id_expected_date_of_nineth_payment');
    const $expectedDateOfTenthPayment = $('#id_expected_date_of_tenth_payment');
    const $expectedDateOfEleventhPayment = $('#id_expected_date_of_eleventh_payment');
    const $expectedDateOfTwelfthPayment = $('#id_expected_date_of_twelfth_payment');

    let currentSelection = {
        filters: {
            status: "CUR"
        },
        pageNumber: 1,
        pageSize: 8
    };

    let itemData = {
        count: 0,
        currentPageNumber: 1,
        results: []
    };

    let selectedIndex = null;

    function getConfidenceSelectHtml(item) {
        let optionsHtml = '';
        let confidenceValues = ['25', '50', '75', '100'];
        let matched = false;
        for (let i = 0; i < confidenceValues.length; i++) {
            let selected = '';
            if (confidenceValues[i] === item.confidence) {
                selected = 'selected';
                matched = true;
            }
            optionsHtml += `<option value="${confidenceValues[i]}" ${selected}>${confidenceValues[i]}%</option>`;
        }
        if (!matched) {
            optionsHtml += `<option value="${item.confidence}" selected>${item.confidence}%</option>`;
        }
        return `
            <div id="selectpart-${item.id}" class="selectpart-${item.confidence}"><select class="form-select form-select-sm" aria-label=".form-select-sm example" 
                onchange="do_change_confidence(${item.id},this.value)">
                ${optionsHtml}
            </select></div>
        `;
    }

    function getFormattedAmount(amount) {
        return Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(Math.floor(amount));
    }

    function getItemColumnsHtml(item, index) {
        let toolTipHtml = ``;
        if (item.note === null || item.note === '') {
            toolTipHtml = `<a href="">`;
        } else {
            toolTipHtml = `<a href="" class="tooltiplink" data-title="${item.note}">`;
        }
        return `
            <th class="employee_name">
                <div class="btn-group dropend" role="group">
                    <button type="button" class="btn btn-secondary list-action-button" data-bs-toggle="dropdown" aria-expanded="false">
                        <img src="/static/custom_admin_assets/images/primary_fill.svg" alt="">
                     </button>
                    ${item.client.client_name}
                    <ul class="dropdown-menu">
                        <li><button class="btn btn-item-active" data-index="${index}">Add to active projects</button></li>
                        <li><button class="btn btn-item-closed" data-index="${index}">Mark as closed/lost</button></li>
                        <li><button class="btn btn-item-edit" data-index="${index}">Edit</button></li>
                        <li><button class="btn btn-item-delete" data-index="${index}">Delete</button></li>
                    </ul>
                </div>
            </th>
            <td>
               <div class="pipproject">
                    ${toolTipHtml}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M13 10C13 10.5523 13.4477 11 14 11C14.5523 11 15 10.5523 15 10C15 9.44772 14.5523 9 14 9C13.4477 9 13 9.44772 13 10ZM9 10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10C11 9.44772 10.5523 9 10 9C9.44772 9 9 9.44772 9 10ZM5 10C5 10.5523 5.44772 11 6 11C6.55228 11 7 10.5523 7 10C7 9.44772 6.55228 9 6 9C5.44772 9 5 9.44772 5 10ZM10 2C5.589 2 2 5.589 2 10C2 11.504 2.425 12.908 3.15 14.111L2.081 16.606C1.92 16.981 2.004 17.418 2.293 17.707C2.484 17.898 2.74 18 3 18C3.133 18 3.268 17.974 3.395 17.919L5.889 16.85C7.092 17.575 8.496 18 10 18C14.411 18 18 14.411 18 10C18 5.589 14.411 2 10 2Z" fill="#8C9196"/>
                    </svg>
                    </a>${item.project ? item.project.project_name : ''}
                </div>
            </td>
            <td>${getFormattedAmount(item.estimated_price)}</td>
            <td>${getConfidenceSelectHtml(item)}</td>
            <td>${item.no_of_payments}</td>
            <td class="fte_billable_rate">${getFormattedAmount(item.total_value_in_forecast)}</td>
            <td class="benefits">${getFormattedAmount(item.estimated_payment_amount)}</td>
        `;
    }

    function getItemRowHtml(item, index) {
        return '<tr>' + getItemColumnsHtml(item, index) + '</tr>';
    }

    function getItemRowsHtml() {
        let rowsHtml = '';
        for (let i = 0; i < itemData.results.length; i++) {
            rowsHtml += getItemRowHtml(itemData.results[i], i);
        }
        return rowsHtml;
    }

    function updateTable() {
        if (itemData.results.length === 0) {
            $('#id_no_content').show();
            $('#id_item_table').hide();
        } else {
            const itemsRowsHtml = getItemRowsHtml();
            $('#id_no_content').hide();
            $('#id_item_table').show();
            $('#id_item_table').find('tbody').html(itemsRowsHtml);
        }
    }

    function updatePagination() {
        const numberOfPages = Math.ceil(itemData.count / currentSelection.pageSize);
        if (numberOfPages <= 1) {
            $('#id_pagination_container').html('');
            return;
        }
        let paginationHtml = '';
        for (let i = 1; i <= numberOfPages; i++) {
            let buttonStateClass = '';
            if (itemData.currentPageNumber === i) {
                buttonStateClass = 'active';
            }
            paginationHtml += `<li class="page-item ${buttonStateClass}"><a class="page-link page" href="#">${i}</a></li>`;
        }
        paginationHtml = `
            <li class="page-item">
                <a class="page-link" href="#" tabindex="-1" aria-disabled="true" id="id_btn_previous_page">
                    <i class="fa fa-chevron-left" aria-hidden="true"></i>
                </a>
            </li>
            ${paginationHtml}
            <li class="page-item">
                <a class="page-link" href="#" id="id_btn_next_page">
                    <i class="fa fa-chevron-right" aria-hidden="true"></i>
                </a>
            </li>
            `;
        $('#id_pagination_container').html(paginationHtml);
    }

    async function getItems() {
        let path = '/custom-admin/operations/pipeline/api/list?page=' + currentSelection.pageNumber;
        //const response = await apiClient.get(path);
        let params = {};
        if (currentSelection.filters.status !== "") {
            params.status = currentSelection.filters.status;
        }
        const response = await apiClient.get(path, {
            params: params
        });
        itemData = response.data;
        itemData.currentPageNumber = currentSelection.pageNumber;
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

    getItems();

    let currentOperation = 'add';


    function resetForm() {
        $pipelineClient.val('');
        $('#id_project').val('');
        $('#id_estimated_price').val('');
        $('#id_confidence').val('');
        $('#id_no_of_payments').val('');
        $expectedDateOfFirstPayment.val('');
        $expectedDateOfSecondPayment.val('');
        $expectedDateOfThirdPayment.val('');
        $expectedDateOfFourthPayment.val('');
        $expectedDateOfFifthPayment.val('');
        $expectedDateOfSixthPayment.val('');
        $expectedDateOfSeventhPayment.val('');
        $expectedDateOfEighthPayment.val('');
        $expectedDateOfNinthPayment.val('');
        $expectedDateOfTenthPayment.val('');
        $expectedDateOfEleventhPayment.val('');
        $expectedDateOfTwelfthPayment.val('');
        $('#id_total_value_in_forecast').val('');
        $('#id_estimated_payment_amount').val('');
        $('#id_note').val('');
        hidePaymentDates();
        let no_of_payments = $("#id_no_of_payments").val();
        date_of_payments(no_of_payments);
    }

    function fillUpForm(item) {
        $pipelineClient.val(item.client.id);
        if (item.project) {
            $('#id_project').val(item.project.id);
        }
        $('#id_estimated_price').val(item.estimated_price);
        $('#id_confidence').val(item.confidence);
        $('#id_no_of_payments').val(item.no_of_payments);
        $expectedDateOfFirstPayment.val(item.expected_date_of_first_payment);
        $expectedDateOfSecondPayment.val(item.expected_date_of_second_payment);
        $expectedDateOfThirdPayment.val(item.expected_date_of_third_payment);
        $expectedDateOfFourthPayment.val(item.expected_date_of_forth_payment);
        $expectedDateOfFifthPayment.val(item.expected_date_of_fifth_payment);
        $expectedDateOfSixthPayment.val(item.expected_date_of_sixth_payment);
        $expectedDateOfSeventhPayment.val(item.expected_date_of_seventh_payment);
        $expectedDateOfEighthPayment.val(item.expected_date_of_eighth_payment);
        $expectedDateOfNinthPayment.val(item.expected_date_of_nineth_payment);
        $expectedDateOfTenthPayment.val(item.expected_date_of_tenth_payment);
        $expectedDateOfEleventhPayment.val(item.expected_date_of_eleventh_payment);
        $expectedDateOfTwelfthPayment.val(item.expected_date_of_twelfth_payment);
        $('#id_total_value_in_forecast').val(item.total_value_in_forecast);
        $('#id_estimated_payment_amount').val(item.estimated_payment_amount);
        $('#id_note').val(item.note);
        hidePaymentDates();
        let no_of_payments = $("#id_no_of_payments").val();
        date_of_payments(no_of_payments);
    }

    function showModal(type) {
        $('.error_container').html('');
        if (type === 'add') {
            currentOperation = 'add';
            $('.modal-title').html('Add a pipeline');
            $('#id_btn_item_add').html('Save');
        } else if (type === 'edit') {
            currentOperation = 'edit';
            $('.modal-title').html('Edit pipeline member');
            $('#id_btn_item_add').html('Update');
        }
        $('#modal-item').modal('show');
    }

    $('#btn-item-modal-show').on('click', function () {
        resetForm();
        showModal('add');
    });

    async function addItem(data) {
        const resp = await apiClient.post('/custom-admin/operations/pipeline/api/add', data, {
            validateStatus: (status) => {
                return status >= 200 && status < 500;
            },
        });
        if (resp.status === 201) {
            itemData.results = [resp.data, ...itemData.results];
            updateTable();
            $('#modal-item').modal('hide');
            resetForm();
        } else if (resp.status === 400) {
            showValidationErrors(resp.data);
        }
    }

    async function editItem(data) {
        let itemId = itemData.results[selectedIndex].id;
        const resp = await apiClient.patch('/custom-admin/operations/pipeline/api/' + itemId, data, {
            validateStatus: (status) => {
                return status >= 200 && status < 500;
            },
        });
        if (resp.status === 200) {
            for (let i = 0; i < itemData.results.length; i++) {
                if (itemData.results[i].id === resp.data.id) {
                    itemData.results[i] = resp.data;
                }
            }
            updateTable();
            $('#modal-item').modal('hide');
            resetForm();
        } else if (resp.status === 400) {
            showValidationErrors(resp.data);
        }
    }

    function getExpectedPaymentDate($element, paymentNo, noOfPayments) {
        return ($element.val() === '' || noOfPayments < paymentNo) ? null : $element.val();
    }

    $('#id_btn_item_add').on('click', function () {
        $('.error_container').html('');
        const noOfPayments = Number($('#id_no_of_payments').val());
        let data = {
            client: $pipelineClient.val(),
            project: $('#id_project').val(),
            estimated_price: $('#id_estimated_price').val(),
            confidence: $('#id_confidence').val(),
            no_of_payments: $('#id_no_of_payments').val(),
            expected_date_of_first_payment: $expectedDateOfFirstPayment.val() === '' ? null : $expectedDateOfFirstPayment.val(),
            expected_date_of_second_payment: getExpectedPaymentDate($expectedDateOfSecondPayment, 2, noOfPayments),
            expected_date_of_third_payment: getExpectedPaymentDate($expectedDateOfThirdPayment, 3, noOfPayments),
            expected_date_of_forth_payment: getExpectedPaymentDate($expectedDateOfFourthPayment, 4, noOfPayments),
            expected_date_of_fifth_payment: getExpectedPaymentDate($expectedDateOfFifthPayment, 5, noOfPayments),
            expected_date_of_sixth_payment: getExpectedPaymentDate($expectedDateOfSixthPayment, 6, noOfPayments),
            expected_date_of_seventh_payment: getExpectedPaymentDate($expectedDateOfSeventhPayment, 7, noOfPayments),
            expected_date_of_eighth_payment: getExpectedPaymentDate($expectedDateOfEighthPayment, 8, noOfPayments),
            expected_date_of_nineth_payment: getExpectedPaymentDate($expectedDateOfNinthPayment, 9, noOfPayments),
            expected_date_of_tenth_payment: getExpectedPaymentDate($expectedDateOfTenthPayment, 10, noOfPayments),
            expected_date_of_eleventh_payment: getExpectedPaymentDate($expectedDateOfEleventhPayment, 11, noOfPayments),
            expected_date_of_twelfth_payment: getExpectedPaymentDate($expectedDateOfTwelfthPayment, 12, noOfPayments),
            total_value_in_forecast: $('#id_total_value_in_forecast').val(),
            estimated_payment_amount: $('#id_estimated_payment_amount').val(),
            note: $('#id_note').val()
        };
        console.log(data);
        if (currentOperation === 'add') {
            addItem(data);
        } else if (currentOperation === 'edit') {
            editItem(data);
        }

    });

    $('tbody').on('click', '.btn-item-active', async function (e) {
        e.preventDefault();
        selectedIndex = $(this).attr('data-index');
        $.ajax({
            url: "/tools/update_status_of_pipeline",
            type: "get",
            data: {
                pipeline_id: itemData.results[selectedIndex].id,
                make_status: 'WON'
            },
            success: function (response) {
                //alert(response.data);
            },
            error: function (xhr) {
                //Do Something to handle error
            }
        });

        updateTable();
    });

    $('tbody').on('click', '.btn-item-closed', async function (e) {
        e.preventDefault();
        selectedIndex = $(this).attr('data-index');
        //alert(itemData.results[selectedIndex].id);

        $.ajax({
            url: "/tools/update_status_of_pipeline",
            type: "get",
            data: {
                pipeline_id: itemData.results[selectedIndex].id,
                make_status: 'LOST'
            },
            success: function (response) {
                //alert(response.data);
            },
            error: function (xhr) {
                //Do Something to handle error
            }
        });
        updateTable();
    });


    $('tbody').on('click', '.btn-item-edit', async function (e) {
        e.preventDefault();
        selectedIndex = $(this).attr('data-index');
        const response = await apiClient.get('/custom-admin/operations/pipeline/api/' + itemData.results[selectedIndex].id);
        fillUpForm(response.data);
        showModal('edit');
    });

    $('tbody').on('click', '.btn-item-delete', function (e) {
        e.preventDefault();
        selectedIndex = $(this).attr('data-index');
        $('#modal-delete').modal('show');
    });

    $('#modal-delete').on('click', '#btn-confirm-delete', async function () {
        const itemId = itemData.results[selectedIndex].id;
        const response = await apiClient.delete('/custom-admin/operations/pipeline/api/' + itemId);
        $('#modal-delete').modal('hide');
        for (let i = 0; i < itemData.results.length; i++) {
            if (itemId == itemData.results[i].id) {
                itemData.results.splice(i, 1);
                break;
            }
        }
        updateTable();
    });

    $('#id_filters_container').on('click', '.btn_filter', async function (e) {
        e.preventDefault();
        currentSelection.filters.status = $(this).attr('data-filter');
        currentSelection.pageNumber = 1;
        await getItems();
        $('#id_filters_container').find('.btn_filter').removeClass("active");
        $(this).addClass('active');
    });

    $('#id_pagination_container').on('click', '#id_btn_next_page', async function (e) {
        e.preventDefault();
        const numberOfPages = Math.ceil(itemData.count / currentSelection.pageSize);
        if (currentSelection.pageNumber - numberOfPages) {
            currentSelection.pageNumber += 1;
            await getItems();
        }
    });

    $('#id_pagination_container').on('click', '#id_btn_previous_page', async function (e) {
        e.preventDefault();
        if (currentSelection.pageNumber > 1) {
            currentSelection.pageNumber -= 1;
            await getItems();
        }
    });

    $('#id_pagination_container').on('click', '.page', async function (e) {
        e.preventDefault();
        const pageNumber = Number($(this).html());
        if (currentSelection.pageNumber !== pageNumber) {
            currentSelection.pageNumber = pageNumber;
            await getItems();
        }
    });

    function calculate_net() {
        let sal = parseFloat($("#id_estimated_price").val());
        let hours = parseFloat($("#id_confidence").val());
        if (!isNaN(sal) && !isNaN(hours)) {
            let netsal = sal * (hours / 100);
            $("#id_total_value_in_forecast").val(netsal.toFixed(2));
        } else {
            $("#id_total_value_in_forecast").val('');
        }
    }

    function calculate_net2() {
        let sal = parseFloat($("#id_total_value_in_forecast").val());
        let hours = parseFloat($("#id_no_of_payments").val());
        if (!isNaN(sal) && !isNaN(hours)) {
            let netsal = (sal / hours).toFixed(2);
            $("#id_estimated_payment_amount").val(netsal);
        } else {
            $("#id_estimated_payment_amount").val('');
        }
    }

    function date_of_payments(no_of_payments) {
        if (no_of_payments >= 2) {
            $(".field-expected_date_of_second_payment").show();
            $("#id_expected_date_of_second_payment").prop('required', true);
        } else {
            $("#id_expected_date_of_second_payment").val('');
            $(".field-expected_date_of_second_payment").hide();
        }

        if (no_of_payments >= 3) {
            $(".field-expected_date_of_third_payment").show();
            $("#id_expected_date_of_third_payment").prop('required', true);
        } else {
            $("#id_expected_date_of_third_payment").val('');
            $(".field-expected_date_of_third_payment").hide();
        }

        if (no_of_payments >= 4) {
            $(".field-expected_date_of_forth_payment").show();
            $("#id_expected_date_of_forth_payment").prop('required', true);
        } else {
            $("#id_expected_date_of_forth_payment").val('');
            $(".field-expected_date_of_forth_payment").hide();
        }

        if (no_of_payments >= 5) {
            $(".field-expected_date_of_fifth_payment").show();
            $("#id_expected_date_of_fifth_payment").prop('required', true);
        } else {
            $("#id_expected_date_of_fifth_payment").val('');
            $(".field-expected_date_of_fifth_payment").hide();
        }

        if (no_of_payments >= 6) {
            $(".field-expected_date_of_sixth_payment").show();
            $("#id_expected_date_of_sixth_payment").prop('required', true);
        } else {
            $("#id_expected_date_of_sixth_payment").val('');
            $(".field-expected_date_of_sixth_payment").hide();
        }

        if (no_of_payments >= 7) {
            $(".field-expected_date_of_seventh_payment").show();
            $("#id_expected_date_of_seventh_payment").prop('required', true);
        } else {
            $("#id_expected_date_of_seventh_payment").val('');
            $(".field-expected_date_of_seventh_payment").hide();
        }

        if (no_of_payments >= 8) {
            $(".field-expected_date_of_eighth_payment").show();
            $("#id_expected_date_of_eight_payment").prop('required', true);
        } else {
            $("#id_expected_date_of_eighth_payment").val('');
            $(".field-expected_date_of_eighth_payment").hide();
        }

        if (no_of_payments >= 9) {
            $(".field-expected_date_of_nineth_payment").show();
            $("#id_expected_date_of_ninth_payment").prop('required', true);
        } else {
            $("#id_expected_date_of_nineth_payment").val('');
            $(".field-expected_date_of_nineth_payment").hide();
        }

        if (no_of_payments >= 10) {
            $(".field-expected_date_of_tenth_payment").show();
            $("#id_expected_date_of_tenth_payment").prop('required', true);
        } else {
            $("#id_expected_date_of_tenth_payment").val('');
            $(".field-expected_date_of_tenth_payment").hide();
        }

        if (no_of_payments >= 11) {
            $(".field-expected_date_of_eleventh_payment").show();
            $("#id_expected_date_of_eleventh_payment").prop('required', true);
        } else {
            $("#id_expected_date_of_eleventh_payment").val('');
            $(".field-expected_date_of_eleventh_payment").hide();
        }

        if (no_of_payments >= 12) {
            $(".field-expected_date_of_twelfth_payment").show();
            $("#id_expected_date_of_twelfth_payment").prop('required', true);
        } else {
            $("#id_expected_date_of_twelfth_payment").val('');
            $(".field-expected_date_of_twelfth_payment").hide();
        }
    }

    function hidePaymentDates() {
        $(".field-expected_date_of_second_payment").hide();
        $(".field-expected_date_of_third_payment").hide();
        $(".field-expected_date_of_forth_payment").hide();
        $(".field-expected_date_of_fifth_payment").hide();
        $(".field-expected_date_of_sixth_payment").hide();
        $(".field-expected_date_of_seventh_payment").hide();
        $(".field-expected_date_of_eighth_payment").hide();
        $(".field-expected_date_of_nineth_payment").hide();
        $(".field-expected_date_of_tenth_payment").hide();
        $(".field-expected_date_of_eleventh_payment").hide();
        $(".field-expected_date_of_twelfth_payment").hide();
    }

    hidePaymentDates();

    let no_of_payments = $("#id_no_of_payments").val();
    date_of_payments(no_of_payments);


    //$('#id_project').empty();
    $pipelineClient.change(function () {
        var client_val = $(this).val();
        //alert(client_val);

        $.ajax({
            url: "/tools/get_projects_by_client",
            type: "get",
            data: {
                client_id: client_val,
            },
            success: function (response) {
                //alert(response.data);
                var project = $('#id_project');
                project.empty();
                for (var i = 0; i < response.data.length; i++) {
                    project.append('<option value="' + response.data[i].id + '">' + response.data[i].project_name + '</option>');
                }
            },
            error: function (xhr) {
                //Do Something to handle error
            }
        });
    });

    $("#id_no_of_payments").change(function () {
        var no_of_payments = $(this).val();
        //alert(no_of_payments);
        date_of_payments(no_of_payments);

    });

    $("#id_estimated_price").blur(function () {
        calculate_net();
    });

    $("#id_confidence").blur(function () {
        calculate_net();
    });

    $("#id_total_value_in_forecast").blur(function () {
        calculate_net2();
    });

    $("#id_no_of_payments").change(function () {
        calculate_net2();
    });

    $("#change_confidence").change(function () {
        var client_val = $(this).val();
        alert(client_val);
    });

    // Client -----------------------------------------------

    const $clientModal = $('#modal-client');
    const $clientName = $clientModal.find('#id_client_name');
    const $clientAddress1 = $clientModal.find('#id_address1');
    const $clientAddress2 = $clientModal.find('#id_address2');
    const $clientCity = $clientModal.find('#id_city');
    const $clientState = $clientModal.find('#id_state');
    const $clientZipcode = $clientModal.find('#id_zipcode');
    const $clientClientType = $clientModal.find('#id_client_type');
    const $clientClientStatus = $clientModal.find('#id_client_status');
    const $clientBillingStructure = $clientModal.find('#id_billing_structure');
    const $clientBillingTarget = $clientModal.find('#id_billing_target');
    const $clientPaymentTerms = $clientModal.find('#id_payment_terms');

    let clientOperation = 'add';

    function resetClientForm() {
        $clientName.val('');
        $clientAddress1.val('');
        $clientAddress2.val('');
        $clientCity.val('');
        $clientState.val('');
        $clientZipcode.val('');
        $clientClientType.val('');
        $clientClientStatus.val('');
        $clientBillingStructure.val('');
        $clientBillingTarget.val('');
        $clientPaymentTerms.val('');
    }

    function showClientModal(type) {
        $pipelineModal.modal('hide');
        $clientModal.find('.error_container').html('');
        if (type === 'add') {
            clientOperation = 'add';
            $clientModal.find('.modal-title').html('Add New Client');
            $clientModal.find('#id_btn_client_add').html('Add Client');
        } else if (type === 'edit') {
            clientOperation = 'edit';
            $clientModal.find('.modal-title').html('Edit Client');
            $clientModal.find('#id_btn_client_add').html('Update Client');
        }
        $clientModal.modal('show');
    }

    function showClientValidationErrors(errorData) {
        for (let key in errorData) {
            let errorHtml = '';
            for (let i = 0; i < errorData[key].length; i++) {
                errorHtml += '<li>* ' + errorData[key][i] + '</li>';
            }
            $clientModal.find('#id_error_' + key).html(errorHtml);
        }
    }

    $('#btn-add-client').on('click', function () {
        resetClientForm();
        showClientModal('add');
    });

    function fillUpClientForm(client) {
        resetClientForm();
        $clientName.val(client.client_name);
        $clientAddress1.val(client.address1);
        $clientAddress2.val(client.address2);
        $clientCity.val(client.city);
        $clientState.val(client.state);
        $clientZipcode.val(client.zipcode);
        const clientType = client.client_type ? client.client_type.id : null;
        $clientClientType.val(clientType);
        $clientClientStatus.val(client.client_status)
        $clientBillingStructure.val(client.billing_structure);
        $clientBillingTarget.val(client.billing_target);
        $clientPaymentTerms.val(client.payment_terms);
    }

    $('#btn-edit-client').on('click', async function () {
        const selectedClientId = $pipelineClient.val();
        if (!selectedClientId) {
            return;
        }
        const response = await apiClient.get('/custom-admin/operations/client/api/' + selectedClientId);
        fillUpClientForm(response.data);
        showClientModal('edit');
    });

    function repopulateClientSelectOptions(newClient) {
        const optionHtml = `<option value="${newClient.id}">${newClient.client_name}</option>`;
        $pipelineClient.append(optionHtml);
        setTimeout(function () {
            const size = $pipelineClient.find("option").length;
            $pipelineClient.prop('selectedIndex', (size - 1));
        }, 200);
        $pipelineProject.empty();
    }

    async function addClient(data) {
        const resp = await apiClient.post('/custom-admin/operations/client/api/add', data, {
            validateStatus: (status) => {
                return status >= 200 && status < 500;
            },
        });
        if (resp.status === 201) {
            $clientModal.modal('hide');
            repopulateClientSelectOptions(resp.data);
            resetClientForm();
        } else if (resp.status === 400) {
            showClientValidationErrors(resp.data);
        }
    }

    function updateSelectedClientName(updatedClient) {
        $pipelineClient.find(`option[value="${updatedClient.id}"]`).html(updatedClient.client_name);
    }

    async function editClient(data) {
        const selectedClientId = $pipelineClient.val();
        const resp = await apiClient.patch('/custom-admin/operations/client/api/' + selectedClientId, data, {
            validateStatus: (status) => {
                return status >= 200 && status < 500;
            },
        });
        if (resp.status === 200) {
            $clientModal.modal('hide');
            updateSelectedClientName(resp.data);
            resetClientForm();
        } else if (resp.status === 400) {
            showClientValidationErrors(resp.data);
        }
    }

    $clientModal.find('#id_btn_client_add').on('click', async function () {
        $clientModal.find('.error_container').html('');
        let data = {
            client_name: $clientName.val(),
            address1: $clientAddress1.val(),
            address2: $clientAddress2.val(),
            city: $clientCity.val(),
            state: $clientState.val(),
            zipcode: $clientZipcode.val(),
            client_type: $clientClientType.val(),
            client_status: $clientClientStatus.val(),
            billing_structure: $clientBillingStructure.val(),
            billing_target: $clientBillingTarget.val(),
            payment_terms: $clientPaymentTerms.val()
        };
        if (clientOperation === 'add') {
            addClient(data);
        } else if (clientOperation === 'edit') {
            editClient(data);
        }
    });

    $clientModal.on('hide.bs.modal', function () {
        $pipelineModal.modal('show');
    });

    // End Client ----------------------------------

    // Project -------------------------------------

    const $projectModal = $('#modal-project');
    const $projectClient = $projectModal.find('#id_client');
    const $projectProjectName = $projectModal.find('#id_project_name');
    const $projectProjectType = $projectModal.find('#id_project_type');
    const $projectStarDate = $projectModal.find('#id_start_date');
    const $projectEndDate = $projectModal.find('#id_end_date');
    const $projectBudget = $projectModal.find('#id_project_budget');
    const $projectBillingStructure = $projectModal.find('#id_billing_structure');

    let projectOperation = 'add';

    function resetProjectForm() {
        $projectClient.val('');
        $projectProjectName.val('');
        $projectProjectType.val('');
        $projectStarDate.val('');
        $projectEndDate.val('');
        $projectBudget.val('');
        $projectBillingStructure.val('');
    }

    function fillUpProjectForm(project) {
        setTimeout(function () {
            $projectClient.val(project.client_id);
        }, 50);
        $projectProjectName.val(project.project_name);
        $projectProjectType.val(project.project_type);
        $projectStarDate.val(project.start_date);
        $projectEndDate.val(project.end_date);
        $projectBudget.val(project.project_budget);
        $projectBillingStructure.val(project.billing_structure);
    }

    function showProjectModal(type) {
        $pipelineModal.modal('hide');
        $projectModal.find('.error_container').html('');
        if (type === 'add') {
            projectOperation = 'add';
            $projectModal.find('.modal-title').html('Add New Project');
            $projectModal.find('#id_btn_project_add').html('Add Project');
        } else if (type === 'edit') {
            projectOperation = 'edit';
            $projectModal.find('.modal-title').html('Edit Project');
            $projectModal.find('#id_btn_project_add').html('Update Project');
        }
        $projectModal.modal('show');
    }

    function showProjectValidationErrors(errorData) {
        for (let key in errorData) {
            let errorHtml = '';
            for (let i = 0; i < errorData[key].length; i++) {
                errorHtml += '<li>* ' + errorData[key][i] + '</li>';
            }
            $projectModal.find('#id_error_' + key).html(errorHtml);
        }
    }

    $('#btn-add-project').on('click', function () {
        resetProjectForm();
        showProjectModal('add');
    });

    $('#btn-edit-project').on('click', async function () {
        const selectedProjectId = $pipelineProject.val();
        if (!selectedProjectId) {
            return;
        }
        const response = await apiClient.get('/custom-admin/operations/project/api/' + selectedProjectId);
        fillUpProjectForm(response.data);
        showProjectModal('edit');
    });

    function repopulateProjectSelectOptions(newProject) {
        if ($pipelineClient.val() == newProject.client_id) {
            const optionHtml = `<option value="${newProject.id}">${newProject.project_name}</option>`;
            $pipelineProject.append(optionHtml);
            setTimeout(function () {
                const size = $pipelineProject.find("option").length;
                $pipelineProject.prop('selectedIndex', (size - 1));
            }, 200);
        } else {
            // $pipelineProject.empty();
        }
    }

    async function addProject(data) {
        const resp = await apiClient.post('/custom-admin/operations/project/api/add', data, {
            validateStatus: (status) => {
                return status >= 200 && status < 500;
            },
        });
        if (resp.status === 201) {
            $projectModal.modal('hide');
            repopulateProjectSelectOptions(resp.data);
            resetProjectForm();
        } else if (resp.status === 400) {
            showProjectValidationErrors(resp.data);
        }
    }

    function updateSelectedProjectName(updatedProject) {
        $pipelineProject.find(`option[value="${updatedProject.id}"]`).html(updatedProject.project_name);
    }

    async function editProject(data) {
        const selectedProjectId = $pipelineProject.val();
        const resp = await apiClient.patch('/custom-admin/operations/project/api/' + selectedProjectId, data, {
            validateStatus: (status) => {
                return status >= 200 && status < 500;
            },
        });
        if (resp.status === 200) {
            $projectModal.modal('hide');
            updateSelectedProjectName(resp.data);
            resetProjectForm();
        } else if (resp.status === 400) {
            showProjectValidationErrors(resp.data);
        }
    }

    $projectModal.find('#id_btn_project_add').on('click', async function () {
        $projectModal.find('.error_container').html('');
        let data = {
            client_id: $projectClient.val(),
            project_name: $projectProjectName.val(),
            project_type: $projectProjectType.val(),
            start_date: $projectStarDate.val(),
            end_date: $projectEndDate.val(),
            project_budget: $projectBudget.val(),
            billing_structure: $projectBillingStructure.val()
        };
        if (projectOperation === 'add') {
            addProject(data);
        } else if (projectOperation === 'edit') {
            editProject(data);
        }
    });

    $projectModal.on('hide.bs.modal', function () {
        $pipelineModal.modal('show');
    });

    // End Project -----------------------------------

});

function do_change_confidence(itemId, itemVal) {
    $("#selectpart-" + itemId).removeClass();
    $("#selectpart-" + itemId).addClass("selectpart-" + itemVal);
    $.ajax({
        url: "/tools/update_confidence_of_pipeline",
        type: "get",
        data: {
            pipeline_id: itemId,
            confidence_val: itemVal
        },
        success: function (response) {
            //alert(response.data);
        },
        error: function (xhr) {
            //Do Something to handle error
        }
    });
}
