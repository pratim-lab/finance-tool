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

    const $invoiceTable = $('#id_invoice_table');
    const $invoiceModal =  $('#modal-invoice');
    const $invoiceProject = $invoiceModal.find('#id_project');
    const $invoiceClient = $invoiceModal.find('#id_client');
    const $invoiceDate = $invoiceModal.find('#id_invoice_date');
    const $invoiceNumber = $invoiceModal.find('#id_invoice_number');
    const $invoiceAmount = $invoiceModal.find('#id_invoice_amount');
    const $expectedDateOfPayment = $invoiceModal.find('#id_expected_date_of_payment');
    const $invoiceStatus = $invoiceModal.find('#id_invoice_status');

    function getFormattedAmount(amount) {
        return Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(Math.floor(amount));
    }

    function getInvoiceColumnsHtml(invoice) {
        let optionsHtml = '';
        if(invoice.invoice_status === 'Sent'){
            optionsHtml = `<td class="annual_revenue"><span class="sent">${invoice.invoice_status}</span></td>`;
        } else if(invoice.invoice_status === 'Paid'){
            optionsHtml = `<td class="annual_revenue"><span class="paid">${invoice.invoice_status}</span></td>`;
        } else if(invoice.invoice_status === 'Not Sent'){
            optionsHtml = `<td class="annual_revenue"><span class="not-sent">${invoice.invoice_status}</span></td>`;
        } else {
            optionsHtml = `<td class="annual_revenue">${invoice.invoice_status}</td>`;
        }
        return  `
            <th class="client_name">
                <div class="btn-group dropend client-id-${invoice.id}" role="group">
                    <button type="button" class="btn btn-secondary list-action-button" data-bs-toggle="dropdown" aria-expanded="false">
                        <img src="/static/custom_admin_assets/images/primary_fill.svg" alt="">
                    </button>
                    <span>${invoice.client.client_name}</span>
                    <ul class="dropdown-menu">
                        <li><button class="btn btn-invoice-edit" data-id="${invoice.id}">Edit</button></li>
                        <li><button class="btn btn-invoice-delete" data-id="${invoice.id}">Delete</button></li>
                    </ul>
                </div>
            </th>
            <td class="client_type">${invoice.project.project_name}</td>
            <td class="client_status">${invoice.invoice_date}</td>
            <td class="annual_revenue">${invoice.invoice_number}</td>
            ${optionsHtml}
            <td class="annual_revenue">${invoice.expected_date_of_payment}</td>
            <td class="projected_revenue">${getFormattedAmount(invoice.invoice_amount)}</td>
        `;
    }

    function getInvoiceRowHtml(invoice) {
        return `<tr>${getInvoiceColumnsHtml(invoice)}</tr>`;
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
            $invoiceTable.hide();
        }
        else {
            const invoicesRowsHtml = getInvoiceRowsHtml();
            $('#id_no_content').hide();
            $invoiceTable.show();
            $invoiceTable.find('tbody').html(invoicesRowsHtml);
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
            $invoiceModal.find('#id_error_' + key).html(errorHtml);
        }
    }

    let currentOperation = 'add';

    function resetForm() {
        $invoiceClient.val('');
        $invoiceProject.val('');
        $invoiceDate.val('');
        $invoiceNumber.val('');
        $invoiceAmount.val('');
        $expectedDateOfPayment.val('');
        $invoiceStatus.val('');
    }

    function fillUpForm(invoice) {
        $invoiceClient.val(invoice.client.id);
        $invoiceProject.val(invoice.project.id);
        $invoiceDate.val(invoice.invoice_date);
        $invoiceNumber.val(invoice.invoice_number);
        $invoiceAmount.val(invoice.invoice_amount);
        $expectedDateOfPayment.val(invoice.expected_date_of_payment);
        $invoiceStatus.val(invoice.invoice_status);
    }

    function showModal(type) {
        $invoiceModal.find('.error_container').html('');
        if (type === 'add') {
            currentOperation = 'add';
            $invoiceModal.find('.modal-title').html('Add New Invoice');
            $invoiceModal.find('#id_btn_invoice_add').html('Add Invoice');
        } else if (type === 'edit') {
            currentOperation = 'edit';
            $invoiceModal.find('.modal-title').html('Edit Invoice');
            $invoiceModal.find('#id_btn_invoice_add').html('Update Invoice');
        }
        $invoiceModal.modal('show');
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
            resp.data.project = resp.data.project_obj;
            resp.data.client = resp.data.client_obj;
            resp.data.invoice_status = resp.data.inv_status;
            invoiceData.results = [resp.data, ...invoiceData.results];
            updateTable();
            $invoiceModal.modal('hide');
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
            resp.data.project = resp.data.project_obj;
            resp.data.client = resp.data.client_obj;
            resp.data.invoice_status = resp.data.inv_status;
            for (let i = 0; i < invoiceData.results.length; i++) {
                if (invoiceData.results[i].id === resp.data.id) {
                    invoiceData.results[i] = resp.data;
                }
            }
            updateTable();
            $invoiceModal.modal('hide');
            resetForm();
        } else if (resp.status === 400) {
            showValidationErrors(resp.data);
        }
    }

    $('#id_btn_invoice_add').on('click', function () {
        $invoiceModal.find('.error_container').html('');
        let data = {
            client: $invoiceClient.val(),
            project: $invoiceProject.val(),
            invoice_date: $invoiceDate.val(),
            invoice_number: $invoiceNumber.val(),
            invoice_amount: $invoiceAmount.val(),
            expected_date_of_payment: $expectedDateOfPayment.val(),
            invoice_status: $invoiceStatus.val()
        };
        if (currentOperation === 'add') {
            addInvoice(data);
        } else if (currentOperation === 'edit') {
            editInvoice(data);
        }
    });

    $invoiceTable.on('click', '.btn-invoice-edit', async function (e) {
        e.preventDefault();
        let id = $(this).attr('data-id');
        const response = await apiClient.get('/custom-admin/operations/invoice/api/' + id);
        $('#id_selected_invoice').val(id);
        fillUpForm(response.data);
        showModal('edit');
    });

    $invoiceTable.on('click', '.btn-invoice-delete', function (e) {
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

    $invoiceTable.on('change', '.project_dropdown', async function (e) {
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

    async function calculateExpectedPaymentDate() {
        const clientId = $invoiceClient.val();
        if (!clientId) {
            $expectedDateOfPayment.val('');
            return;
        }
        const invoiceDateStr = $invoiceDate.val();
        if(!invoiceDateStr) {
            $expectedDateOfPayment.val('');
            return;
        }
        const invoiceDate = moment(invoiceDateStr, 'YYYY-MM-DD');
        const response = await apiClient.get('/custom-admin/operations/client/api/' + clientId);
        const paymentTerms = response.data.payment_terms;
        if (paymentTerms.length <= 1) {
            $expectedDateOfPayment.val('');
            return;
        }
        const paymentTermsNumberStr = paymentTerms.substring(1);
        if (isNaN(paymentTermsNumberStr)) {
            $expectedDateOfPayment.val('');
            return;
        }
        const paymentTermsNumber = Number(paymentTermsNumberStr);
        const expectedPaymentDate = invoiceDate.add(paymentTermsNumber, 'days');
        $expectedDateOfPayment.val(expectedPaymentDate.format('YYYY-MM-DD'));
    }

    $invoiceClient.on('change', async function () {
        calculateExpectedPaymentDate();
        const clientVal = $(this).val();
        const response = await apiClient.get('/tools/get_projects_by_client?client_id=' + clientVal);
        $invoiceProject.empty();
        for (let i = 0; i < response.data.data.length; i++) {
            $invoiceProject.append(
                `<option value="${response.data.data[i].id}">${response.data.data[i].project_name}</option>`);
        }
    });

    $invoiceDate.on('change', async function () {
        await calculateExpectedPaymentDate();
    });

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
        $invoiceModal.modal('hide');
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
        const selectedProjectId = $invoiceProject.val();
        if (!selectedProjectId) {
            return;
        }
        const response = await apiClient.get('/custom-admin/operations/project/api/' + selectedProjectId);
        fillUpProjectForm(response.data);
        showProjectModal('edit');
    });

    function repopulateProjectSelectOptions(newProject) {
        if ($invoiceClient.val() == newProject.client_id) {
            const optionHtml = `<option value="${newProject.id}">${newProject.project_name}</option>`;
            $invoiceProject.append(optionHtml);
            setTimeout(function () {
                const size = $invoiceProject.find("option").length;
                $invoiceProject.prop('selectedIndex', (size - 1));
            }, 200);
        } else {
            // $invoiceProject.empty();
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
        $invoiceProject.find(`option[value="${updatedProject.id}"]`).html(updatedProject.project_name);
    }

    async function editProject(data) {
        const selectedProjectId = $invoiceProject.val();
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
        $invoiceModal.modal('show');
    });

    // End Project -----------------------------------

    getInvoices();

});
