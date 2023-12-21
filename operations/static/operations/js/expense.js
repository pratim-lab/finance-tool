if (!$) {
    $ = django.jQuery;
}

$(document).ready(function () {
    // Expense Report ----------------------------

    let expenseReportData = {};
    
    function getFormattedAmount(amount) {
        return Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(Math.floor(amount));
    }

    function getThRow() {
        let thTds = '<th scope="col"></th>';
        for (let i = 0; i < expenseReportData.months.length; i++) {
            thTds += '<th scope="col">' + expenseReportData.months[i].value.substring(0, 3) + '</th>';
        }
        thTds += '<td><b>EOY Projection</b></td>';
        return '<tr>' + thTds + '</tr>';
    }

    function getRows() {
        let rows = '';
        for (let i = 0; i < expenseReportData.rows.length; i++) {
            let tds = '';
            let expenseRowTotal = 0;
            for (let j = 0; j < expenseReportData.rows[i].length; j++) {
                const col = expenseReportData.rows[i][j];
                if (j === 0) {
                    tds += '<th>' + col.name + '</th>';
                }  else {
                    let updatedClass = '';
                    if (col.updated) {
                        updatedClass = 'updated';
                    }
                    tds += `
                        <td class="${updatedClass}">
                            <span class="clickarea"><span class="val">${getFormattedAmount(col.expense)}</span></span>
                            <div class="input-area" style="display: none;">
                                <input type="text" class="txt_modified" placeholder="$${col.expense}"
                                    value="${col.expense}" data-i="${i}" data-j="${j}"/>
                                <div class="btn-sec">
                                    <input type="button" class="reset" value="reset"/>
                                    <a href="#" class="cross"><img src="/static/custom_admin_assets/images/cross.svg"
                                        alt=""/></a>
                                    <input type="button" class="save" value="submit"/>
                                </div>
                            </div>
                        </td>`;
                    expenseRowTotal += Number(col.expense);
                }

            }
            tds += `
                <td>
                    <span></span>
                    <span id="total">${getFormattedAmount(expenseRowTotal)}</span>
                </td>`;
            const row = '<tr>' + tds + '</tr>';
            rows += row;
        }
        let firstRowTds = '';
        firstRowTds += '<th><div class="totals"><b>Total</b></div></th>';
        for (const prop in expenseReportData.monthly_total_expenses) {
            firstRowTds += `
                <td>
                    <span><b></b></span>
                    <span><b>${getFormattedAmount(expenseReportData.monthly_total_expenses[prop])}</b></span>
                </td>`;
        }

        firstRowTds += `
            <td>
                <span><b></b></span>
                <span id="total"><b>${getFormattedAmount(expenseReportData.total)}</b></span>
            </td>`;
        const firstRow = `<tr>${firstRowTds}</tr>`;
        return firstRow + rows;
    }

    function updateExpenseReportTable() {
        const thRow = getThRow();
        const rows = getRows();
        $('#id_expense_report_thead').html(thRow);
        $('#id_expense_report_tbody').html(rows);
    }

    async function fetchExpenseReportData() {
        let path = '/custom-admin/operations/expense/api/report';
        const response = await apiClient.get(path);
        expenseReportData = response.data;
        updateExpenseReportTable();
    }

    fetchExpenseReportData();

    $('#id_expense_report_tbody').on('click', '.clickarea', function () {
        $(this).hide();
        // $(this).parent().find('.txt_modified').val($(this).find('.val').html());
        $(this).parent().find('.input-area').show();
    });

    $('#id_expense_report_tbody').on('click', '.save', async function () {
        let $txtField = $(this).parents('.input-area').find('.txt_modified');
        const value = $txtField.val();
        const i = $txtField.attr('data-i');
        const j = $txtField.attr('data-j');
        let requestData = {
            expense_type_id: expenseReportData.rows[i][0].id,
            year: expenseReportData.rows[i][j].year,
            month: expenseReportData.rows[i][j].month,
            expense: value
        };
        const resp = await apiClient.post('/admin/reports/typetotalexpensereport/edit', requestData);
        expenseReportData.rows[i][j].expense = Number(value);
        expenseReportData.rows[i][j].updated = true;
        $(this).parents('.input-area').hide();
        $(this).parents('td').find('.clickarea').show();
        fetchExpenseReportData();
    });

    $('#id_expense_report_tbody').on('click', '.cross', function () {
        $(this).parents('.input-area').hide();
        $(this).parents('td').find('.clickarea').show();
    });

    $('#id_expense_report_tbody').on('click', '.reset', async function () {
        let $txtField = $(this).parents('.input-area').find('.txt_modified');
        const i = $txtField.attr('data-i');
        const j = $txtField.attr('data-j');
        if(!expenseReportData.rows[i][j].updated) {
            $(this).parents('.input-area').hide();
            $(this).parents('td').find('.clickarea').show();
            return;
        }
        let requestData = {
            expense_type_id: expenseReportData.rows[i][0].id,
            year: expenseReportData.rows[i][j].year,
            month: expenseReportData.rows[i][j].month
        };
        const resp = await apiClient.post('/admin/reports/typetotalexpensereport/reset', requestData);
        // expenseReportData.rows[i][j].expense = Number(value);
        expenseReportData.rows[i][j].updated = false;
        $(this).parents('.input-area').hide();
        $(this).parents('td').find('.clickarea').show();
        fetchExpenseReportData();
    });

    // End Expense Report ------------------------

    // Expense List ------------------------------

    const $expenseTable = $('#id_expenses_table');
    const $expenseModal = $('#modal-expense');

    const $expenseExpenseType = $expenseModal.find('#id_expense_type');
    const $recurringPayment = $expenseModal.find('#id_recurring_payment');
    const $expensePaymentAmount = $expenseModal.find('#id_expense_payment_amount');
    const $expenseFrequency = $expenseModal.find('#id_expense_frequency');
    const $dateOfFirstPayment = $expenseModal.find('#id_date_of_first_payment');
    const $dateOfLastPayment = $expenseModal.find('#id_date_of_last_payment');

    let currentSelection = {
        filters: {
        },
        pageNumber: 1,
        pageSize: 8
    };

    let expenseData = {
        count: 0,
        currentPageNumber: 1,
        results: []
    };

    let selectedExpenseId = null;

    function getExpenseColumnsHtml(expense) {
        const expenseType = expense.expense_type !== null ? expense.expense_type.expense_name : null;
        return `
            <th class="client_name">
                <div class="btn-group dropend expense-id-${expense.id} role="group">
                    <button type="button" class="btn btn-secondary list-action-button" data-bs-toggle="dropdown" aria-expanded="false">
                        <img src="/static/custom_admin_assets/images/primary_fill.svg" alt="">
                    </button>
                    <span>${expenseType}</span>
                    <ul class="dropdown-menu">
                        <li><button class="btn btn-expense-edit" data-id="${expense.id}">Edit</button></li>
                        <li><button class="btn btn-expense-delete" data-id="${expense.id}">Delete</button></li>
                    </ul>
                </div>
            </th>
            <td class="client_type">${expense.recurring_payment}</td>
            <td class="client_status">${expense.expense_payment_amount}</td>
            <td class="active_projects">${expense.date_of_first_payment}</td>
        `;
    }

    function getExpenseRowHtml(expense) {
        return `<tr>${getExpenseColumnsHtml(expense)}</tr>`;
    }

    function getExpenseRowsHtml() {
        let rowsHtml = '';
        for (let i = 0; i < expenseData.results.length; i++) {
            rowsHtml += getExpenseRowHtml(expenseData.results[i]);
        }
        return rowsHtml;
    }

    function updateExpenseTable() {
        if (expenseData.results.length === 0) {
            $('#id_no_content').show();
            $('#id_expense_table').hide();
        }
        else {
            const expensesRowsHtml = getExpenseRowsHtml();
            $('#id_no_content').hide();
            $expenseTable.show();
            $expenseTable.find('tbody').html(expensesRowsHtml);
        }
        fetchExpenseReportData();
    }

    function updateExpenseListPagination() {
        const numberOfPages = Math.ceil(expenseData.count / currentSelection.pageSize);
        if(numberOfPages <= 1) {
            $('#id_pagination_container').html('');
            return;
        }
        let paginationHtml = '';
        for (let i = 1; i <= numberOfPages; i++) {
            let buttonStateClass = '';
            if (expenseData.currentPageNumber === i) {
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

    async function getExpenses() {
        let path = '/custom-admin/operations/expense/api/list?page=' + currentSelection.pageNumber;
        let params = {};

        const response = await apiClient.get(path);
        expenseData = response.data;
        expenseData.currentPageNumber = currentSelection.pageNumber;
        updateExpenseTable();
        updateExpenseListPagination();
    }

    function showExpenseValidationErrors(errorData) {
        for (let key in errorData) {
            let errorHtml = '';
            for (let i = 0; i < errorData[key].length; i++) {
                errorHtml += '<li>* ' + errorData[key][i] + '</li>';
            }
            $expenseModal.find('#id_error_' + key).html(errorHtml);
        }
    }

    getExpenses();

    let currentOperation = 'add';
    function resetExpenseForm() {
        $expenseExpenseType.val('');
        $recurringPayment.val('');
        $expensePaymentAmount.val('');
        $expenseFrequency.val('');
        $dateOfFirstPayment.val('');
        $dateOfLastPayment.val('');
    }

    function fillUpExpenseForm(expense) {
        const expenseType = expense.expense_type !== null ? expense.expense_type.id : null;
        $expenseExpenseType.val(expenseType);
        $recurringPayment.val(expense.recurring_payment);
        $expensePaymentAmount.val(expense.expense_payment_amount);
        $expenseFrequency.val(expense.expense_frequency);
        $dateOfFirstPayment.val(expense.date_of_first_payment);
        $dateOfLastPayment.val(expense.date_of_last_payment);
    }

    function showExpenseModal(type) {
        $expenseModal.find('.error_container').html('');
        if (type === 'add') {
            currentOperation = 'add';
            $expenseModal.find('.modal-title').html('Add New Expense');
            $expenseModal.find('#id_btn_expense_add').html('Add Expense');
        } else if (type === 'edit') {
            currentOperation = 'edit';
            $expenseModal.find('.modal-title').html('Edit Expense');
            $expenseModal.find('#id_btn_expense_add').html('Update Expense');
        }
        $expenseModal.modal('show');
    }

    $('#btn-modal-expense').on('click', function () {
        resetExpenseForm();
        showExpenseModal('add');
    });

    async function addExpense(data) {
        const resp = await apiClient.post('/custom-admin/operations/expense/api/add', data, {
            validateStatus: (status) => {
                return status >= 200 && status < 500;
            },
        });
        if (resp.status === 201) {
            resp.data.expense_type = resp.data.expense_type_alt;
            resp.data.recurring_payment = resp.data.recurring_payment_alt;
            expenseData.results = [resp.data, ...expenseData.results];
            updateExpenseTable();
            $expenseModal.modal('hide');
            resetExpenseForm();
        } else if (resp.status === 400) {
            showExpenseValidationErrors(resp.data);
        }
    }

    async function editExpense(data) {
        const resp = await apiClient.patch('/custom-admin/operations/expense/api/' + selectedExpenseId, data, {
            validateStatus: (status) => {
                return status >= 200 && status < 500;
            },
        });
        if (resp.status === 200) {
            resp.data.expense_type = resp.data.expense_type_alt;
            resp.data.recurring_payment = resp.data.recurring_payment_alt;
            for (let i = 0; i < expenseData.results.length; i++) {
                if (expenseData.results[i].id === resp.data.id) {
                    expenseData.results[i] = resp.data;
                }
            }
            updateExpenseTable();
            $expenseModal.modal('hide');
            resetExpenseForm();
        } else if (resp.status === 400) {
            showExpenseValidationErrors(resp.data);
        }
    }

    $expenseModal.find('#id_btn_expense_add').on('click', function () {
        $expenseModal.find('.error_container').html('');
        let data = {
            expense_type: $expenseExpenseType.val(),
            recurring_payment: $recurringPayment.val(),
            expense_payment_amount: $expensePaymentAmount.val(),
            expense_frequency: $expenseFrequency.val(),
            date_of_first_payment: $dateOfFirstPayment.val(),
            date_of_last_payment: $dateOfLastPayment.val() !== "" ? $dateOfLastPayment.val() : null
        };
        if (currentOperation === 'add') {
            addExpense(data);
        } else if (currentOperation === 'edit') {
            editExpense(data);
        }
    });

    $('tbody').on('click', '.btn-expense-edit', async function (e) {
        e.preventDefault();
        selectedExpenseId = $(this).attr('data-id');
        const response = await apiClient.get('/custom-admin/operations/expense/api/' + selectedExpenseId);
        fillUpExpenseForm(response.data);
        showExpenseModal('edit');
    });


    $('tbody').on('click', '.btn-expense-delete', function (e) {
        e.preventDefault();
        selectedExpenseId = $(this).attr('data-id');
        $('#modal-delete').modal('show');
    });


    $('#modal-delete').on('click', '#btn-confirm-delete', async function () {
        const response = await apiClient.delete('/custom-admin/operations/expense/api/' + selectedExpenseId);
        $('#modal-delete').modal('hide');
        for (let i = 0; i < expenseData.results.length; i++) {
            if (selectedExpenseId == expenseData.results[i].id) {
                console.log("matched");
                expenseData.results.splice(i, 1);
                break;
            }
        }
        updateExpenseTable();
    });

    $('#id_pagination_container').on('click', '#id_btn_next_page', async function (e) {
        e.preventDefault();
        const numberOfPages = Math.ceil(expenseData.count / currentSelection.pageSize);
        if (currentSelection.pageNumber - numberOfPages) {
            currentSelection.pageNumber += 1;
            await getExpenses();
        }
    });

    $('#id_pagination_container').on('click', '#id_btn_previous_page', async function (e) {
        e.preventDefault();
        if (currentSelection.pageNumber > 1) {
            currentSelection.pageNumber -= 1;
            await getExpenses();
        }
    });

    $('#id_pagination_container').on('click', '.page', async function (e) {
        e.preventDefault();
        const pageNumber = Number($(this).html());
        if (currentSelection.pageNumber !== pageNumber) {
            currentSelection.pageNumber = pageNumber;
            await getExpenses();
        }
    });

    if($("#id_expense_type").val() != 'Other'){
		$(".field-expense_type_other").hide();
	}

	if($("#id_recurring_payment").val() != 'Y'){
		$(".field-expense_frequency").hide();
		//$(".field-date_of_first_payment").hide();
		$("label[for='id_date_of_first_payment']").text('Date of payment:');
		$(".field-date_of_last_payment").hide();
	}

	$("#id_expense_type").change(function () {
	    var expense_type_val = $(this).val();
	    if(expense_type_val== 'Other'){
			$(".field-expense_type_other").show();
	    } else{
	    	$(".field-expense_type_other").hide();
	    }
	});

	$("#id_recurring_payment").change(function () {
	    var rec_pay_val = $(this).val();
	    if(rec_pay_val== 'Y'){
			$(".field-expense_frequency").show();
			//$(".field-date_of_first_payment").show();
			$("label[for='id_date_of_first_payment']").text('Date of first payment:');
			$(".field-date_of_last_payment").show();

	    }
        else {
	    	$(".field-expense_frequency").hide();
			//$(".field-date_of_first_payment").hide();
			$("label[for='id_date_of_first_payment']").text('Date of payment:');
			$(".field-date_of_last_payment").hide();
	    }
	});

    // End Expense List -----------------------

    // Expense Type ---------------------------

    const $expenseTypeModal = $('#modal-expense-type');
    const $expenseTypeName = $expenseTypeModal.find('#id_expense_name');
    const $expenseTypeDescription = $expenseTypeModal.find('#id_expense_description');

    let expenseTypeOperation= 'add';

    function resetExpenseTypeForm() {
        $expenseTypeName.val('');
        $expenseTypeDescription.val('');
    }

    function showExpenseTypeModal(type) {
        $expenseModal.modal('hide');
        $expenseTypeModal.find('.error_container').html('');
        if (type === 'add') {
            expenseTypeOperation = 'add';
            $expenseTypeModal.find('.modal-title').html('Add New Expense Type');
            $expenseTypeModal.find('#id_btn_expense_type_add').html('Add');
        } else if (type === 'edit') {
            expenseTypeOperation = 'edit';
            $expenseTypeModal.find('.modal-title').html('Edit Expense Type');
            $expenseTypeModal.find('#id_btn_expense_type_add').html('Update');
        }
        $expenseTypeModal.modal('show');
    }

    function showExpenseTypeValidationErrors(errorData) {
        for (let key in errorData) {
            let errorHtml = '';
            for (let i = 0; i < errorData[key].length; i++) {
                errorHtml += '<li>* ' + errorData[key][i] + '</li>';
            }
            $expenseTypeModal.find('#id_error_' + key).html(errorHtml);
        }
    }

    $('#btn-add-expense-type').on('click', function () {
        resetExpenseTypeForm();
        showExpenseTypeModal('add');
    });

    function fillUpExpenseTypeForm(expenseType) {
        resetExpenseTypeForm();
        $expenseTypeName.val(expenseType.expense_name);
        $expenseTypeDescription.val(expenseType.expense_description);
    }

    $('#btn-edit-expense-type').on('click', async function () {
        const selectedExpenseTypeId = $expenseExpenseType.val();
        if (!selectedExpenseTypeId) {
            return;
        }
        const response = await apiClient.get('/custom-admin/operations/expense/expense-type/api/' + selectedExpenseTypeId);
        fillUpExpenseTypeForm(response.data);
        showExpenseTypeModal('edit');
    });

    function repopulateExpenseTypeSelectOptions(newExpenseType) {
        const optionHtml = `<option value="${newExpenseType.id}">${newExpenseType.expense_name}</option>`;
        $expenseExpenseType.append(optionHtml);
        setTimeout(function (){
            const size = $expenseExpenseType.find("option").length;
            $expenseExpenseType.prop('selectedIndex', (size - 1));
        }, 200);
    }

    async function addExpenseType(data) {
        const resp = await apiClient.post('/custom-admin/operations/expense/expense-type/api/add', data, {
            validateStatus: (status) => {
                return status >= 200 && status < 500;
            },
        });
        if (resp.status === 201) {
            $expenseTypeModal.modal('hide');
            repopulateExpenseTypeSelectOptions(resp.data);
            resetExpenseTypeForm();
        } else if (resp.status === 400) {
            showExpenseTypeValidationErrors(resp.data);
        }
    }

    function updateSelectedExpenseTypeName(updatedExpenseType) {
        $expenseModal.find(`option[value="${updatedExpenseType.id}"]`).html(updatedExpenseType.expense_name);
    }

    async function editExpenseType(data) {
        const selectedExpenseTypeId = $expenseExpenseType.val();
        const resp = await apiClient.patch('/custom-admin/operations/expense/expense-type/api/' + selectedExpenseTypeId, data, {
            validateStatus: (status) => {
                return status >= 200 && status < 500;
            },
        });
        if (resp.status === 200) {
            $expenseTypeModal.modal('hide');
            updateSelectedExpenseTypeName(resp.data);
            resetExpenseTypeForm();
        } else if (resp.status === 400) {
            showExpenseTypeValidationErrors(resp.data);
        }
    }

    $expenseTypeModal.find('#id_btn_expense_type_add').on('click', async function () {
        $expenseTypeModal.find('.error_container').html('');
        let data = {
            expense_name: $expenseTypeName.val(),
            expense_description: $expenseTypeDescription.val(),
        };
        if (expenseTypeOperation === 'add') {
            addExpenseType(data);
        } else if (expenseTypeOperation === 'edit') {
            editExpenseType(data);
        }
    });

    $expenseTypeModal.on('hide.bs.modal', function(){
        $expenseModal.modal('show');
    });

    // End Expense Type

});
