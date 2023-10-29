$(document).ready(function () {

    let currentSelection = {
        filters: {
            invoiceStatus: ""
        },
        pageNumber: 1,
        pageSize: 8
    };

    let invoiceData = {
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

    function getInvoiceColumnsHtml(invoice) {
        return '' +
            '<th class="client_name">' +
                '<div class="btn-group dropend client-id-' + invoice.id + '" role="group">' +
                    '<button type="button" class="btn btn-secondary list-action-button" data-bs-toggle="dropdown" aria-expanded="false">' +
                        '<img src="/static/custom_admin_assets/images/primary_fill.svg" alt="">' +
                    '</button>' +
                    '<span> ' + invoice.client.client_name + '</span>' +
                    '<ul class="dropdown-menu">' +
                        '<li><button class="btn btn-invoice-edit" data-id="' + invoice.id + '">Edit</button></li>       ' +
                        '<li><button class="btn btn-invoice-delete" data-id="' + invoice.id + '">Delete</button></li>' +
                    '</ul>' +
                '</div>' +
            '</th>' +
            '<td class="client_type">' + invoice.project.project_name + '</td>' +
            '<td class="client_status">' + invoice.invoice_date + '</td>' +
            '<td class="annual_revenue">' + invoice.invoice_number + '</td>' +
            '<td class="annual_revenue">' + invoice.invoice_status + '</td>' +
            '<td class="annual_revenue">' + invoice.expected_date_of_payment + '</td>' +
            '<td class="projected_revenue">' + invoice.invoice_amount + '</td>';
    }

    function getInvoiceRowHtml(invoice) {
        return '<tr>' + getInvoiceColumnsHtml(invoice) + '</tr>';
    }

    function getInvoiceRowsHtml() {
        let rowsHtml = '';
        for (let i = 0; i < invoiceData.results.length; i++) {
            rowsHtml += getInvoiceRowHtml(invoiceData.results[i]);
        }
        return rowsHtml;
    }

    function updateTable() {
        if (invoiceData.results.length === 0) {
            $('#id_no_content').show();
            $('#id_invoice_table').hide();
        }
        else {
            const invoicesRowsHtml = getInvoiceRowsHtml();
            $('#id_no_content').hide();
            $('#id_invoice_table').show();
            $('#id_invoice_table').find('tbody').html(invoicesRowsHtml);
        }
    }

    function updatePagination() {
        const numberOfPages = Math.ceil(invoiceData.count / currentSelection.pageSize);
        if(numberOfPages <= 1) {
            $('#id_pagination_container').html('');
            return;
        }
        let paginationHtml = '';
        for (let i = 1; i <= numberOfPages; i++) {
            let buttonStateClass = '';
            if (invoiceData.currentPageNumber === i) {
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

    async function getInvoices() {
        let path = '/custom-admin/operations/invoice/api/list?page=' + currentSelection.pageNumber;
        let params = {};
        if (currentSelection.filters.invoiceStatus !== "") {
            params.invoice_status = currentSelection.filters.invoiceStatus;
        }
        const response = await apiClient.get(path, {
            params: params
        });
        invoiceData = response.data;
        invoiceData.currentPageNumber = currentSelection.pageNumber;
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

    getInvoices();

    let currentOperation = 'add';

    function resetForm() {
        $('#id_client').val('');
        $('#id_project').val('');
        $('#id_invoice_date').val('');
        $('#id_invoice_number').val('');
        $('#id_invoice_amount').val('');
        $('#id_expected_date_of_payment').val('');
        $('#id_invoice_status').val('');
    }

    function fillUpForm(invoice) {
        $('#id_client').val(invoice.client.id);
        $('#id_project').val(invoice.project.id);
        $('#id_invoice_date').val(invoice.invoice_date);
        $('#id_invoice_number').val(invoice.invoice_number);
        $('#id_invoice_amount').val(invoice.invoice_amount);
        $('#id_expected_date_of_payment').val(invoice.expected_date_of_payment);
        $('#id_invoice_status').val(invoice.invoice_status);
    }

    function showModal(type) {
        $('.error_container').html('');
        if (type === 'add') {
            currentOperation = 'add';
            $('.modal-title').html('Add New Invoice');
            $('#id_btn_invoice_add').html('Add Invoice');
        } else if (type === 'edit') {
            currentOperation = 'edit';
            $('.modal-title').html('Edit Invoice');
            $('#id_btn_invoice_add').html('Update Invoice');
        }
        $('#modal-invoice').modal('show');
    }

    $('#btn-invoice-modal-show').on('click', function () {
        resetForm();
        showModal('add');
    });

    async function addInvoice(data) {
        const resp = await apiClient.post('/custom-admin/operations/invoice/api/add', data, {
            validateStatus: (status) => {
                return status >= 200 && status < 500;
            },
        });
        if (resp.status === 201) {
            invoiceData.results = [resp.data, ...invoiceData.results];
            updateTable();
            $('#modal-invoice').modal('hide');
            resetForm();
        } else if (resp.status === 400) {
            showValidationErrors(resp.data);
        }
    }

    async function editInvoice(data) {
        let invoiceId = $('#id_selected_invoice').val();
        const resp = await apiClient.patch('/custom-admin/operations/invoice/api/' + invoiceId, data, {
            validateStatus: (status) => {
                return status >= 200 && status < 500;
            },
        });
        if (resp.status === 200) {
            for (let i = 0; i < invoiceData.results.length; i++) {
                if (invoiceData.results[i].id === resp.data.id) {
                    invoiceData.results[i] = resp.data;
                }
            }
            updateTable();
            $('#modal-invoice').modal('hide');
            resetForm();
        } else if (resp.status === 400) {
            showValidationErrors(resp.data);
        }
    }

    $('#id_btn_invoice_add').on('click', function () {
        $('.error_container').html('');
        let data = {
            client_id: $('#id_client').val(),
            project_id: $('#id_project').val(),
            invoice_date: $('#id_invoice_date').val(),
            invoice_number: $('#id_invoice_number').val(),
            invoice_amount: $('#id_invoice_amount').val(),
            expected_date_of_payment: $('#id_expected_date_of_payment').val(),
            invoice_status: $('#id_invoice_status').val()
        };
        if (currentOperation === 'add') {
            addInvoice(data);
        } else if (currentOperation === 'edit') {
            editInvoice(data);
        }

    });

    $('tbody').on('click', '.btn-invoice-edit', async function (e) {
        e.preventDefault();
        let id = $(this).attr('data-id');
        const response = await apiClient.get('/custom-admin/operations/invoice/api/' + id);
        $('#id_selected_invoice').val(id);
        fillUpForm(response.data);
        showModal('edit');
    });

    $('tbody').on('click', '.btn-invoice-delete', function (e) {
        e.preventDefault();
        $('#id_selected_invoice').val($(this).attr('data-id'));
        $('#modal-delete').modal('show');
    });

    $('#modal-delete').on('click', '#btn-confirm-delete', async function () {
        const invoiceId = $('#id_selected_invoice').val();
        const response = await apiClient.delete('/custom-admin/operations/invoice/api/' + invoiceId);
        $('#modal-delete').modal('hide');
        for (let i = 0; i < invoiceData.results.length; i++) {
            if (invoiceId == invoiceData.results[i].id) {
                console.log("matched");
                invoiceData.results.splice(i, 1);
                break;
            }
        }
        updateTable();
    });

    $('#id_filters_container').on('click', '.btn_filter', async function (e) {
        e.preventDefault();
        currentSelection.filters.invoiceStatus = $(this).attr('data-filter');
        currentSelection.pageNumber = 1;
        await getInvoices();
        $('#id_filters_container').find('.btn_filter').removeClass("active");
        $(this).addClass('active');
    });

    $('#id_pagination_container').on('click', '#id_btn_next_page', async function (e) {
        e.preventDefault();
        const numberOfPages = Math.ceil(invoiceData.count / currentSelection.pageSize);
        if (currentSelection.pageNumber - numberOfPages) {
            currentSelection.pageNumber += 1;
            await getInvoices();
        }
    });

    $('#id_pagination_container').on('click', '#id_btn_previous_page', async function (e) {
        e.preventDefault();
        if (currentSelection.pageNumber > 1) {
            currentSelection.pageNumber -= 1;
            await getInvoices();
        }
    });

    $('#id_pagination_container').on('click', '.page', async function (e) {
        e.preventDefault();
        const pageNumber = Number($(this).html());
        if (currentSelection.pageNumber !== pageNumber) {
            currentSelection.pageNumber = pageNumber;
            await getInvoices();
        }
    });

    $('#id_invoice_table').on('change', '.project_dropdown', async function (e) {
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
