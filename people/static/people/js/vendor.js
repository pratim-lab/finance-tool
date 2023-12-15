$(document).ready(function () {

    // Vendors expenses tab

    let expenseData = null;
    const $vendorExpenseTable = $('#vendor-expense-table');

    function initializeMonthlyTotalExpense() {
        monthlyTotalExpenses = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
    }

    let monthlyTotalExpenses = null;

    function getMonthlyTotalExpensesRowHtml() {
        let totalExpense = 0;
        let monthlyTotalExpensesRowHtml = `<th><b>Total</b></th>`;
        for (let i = 0; i < monthlyTotalExpenses.length; i++) {
            totalExpense += monthlyTotalExpenses[i];
            monthlyTotalExpensesRowHtml += `<td><b>$${monthlyTotalExpenses[i]}</b></td>`;
        }
        return `
            <tr>
                ${monthlyTotalExpensesRowHtml}
                <td><b>$${totalExpense}</b></td>
            </tr>
        `;
    }

    function getExpensesRowHtml(vendor, index) {
        let rowHtml = `<th>${vendor.vendor_name}</th>`;
        let totalExpense = 0;
        for (let i = 0; i < vendor.expenses.length; i++) {
            const expense = vendor.expenses[i];
            monthlyTotalExpenses[i] += expense.value;
            totalExpense += expense.value;
            let updatedClass = expense.updated ? 'updated' : '';
            rowHtml += `
                <td class="${updatedClass}">
                    <span class="clickarea">$<span class="val">${expense.value}</span></span>
                    <div class="input-area" style="display: none;">
                        <input type="text" class="txt_modified" placeholder="${expense.value}"
                            value="${expense.value}" data-vendor-index="${index}" data-expense-index="${i}"/>
                        <div class="btn-sec">
                            <input type="button" class="reset" value="reset"/>
                            <a href="#" class="cross"><img src="/static/custom_admin_assets/images/cross.svg" alt=""/>
                            </a>
                            <input type="button" class="save" value="submit"/>
                        </div>
                    </div>
                </td>
            `;
        }
        return `
            <tr>
                ${rowHtml}
                <td>$${totalExpense}</td>
            </tr>`;
    }

    function getExpensesRowsHtml() {
        let expensesRowsHtml = '';
        for (let i = 0; i < expenseData.vendors.length; i++) {
            expensesRowsHtml += getExpensesRowHtml(expenseData.vendors[i], i);
        }
        return expensesRowsHtml;
    }

    function updateExpenseTable() {
        initializeMonthlyTotalExpense();
        const expensesRows = getExpensesRowsHtml();
        const monthlyTotalExpensesRowHtml = getMonthlyTotalExpensesRowHtml();
        $vendorExpenseTable.find('tbody').html(monthlyTotalExpensesRowHtml + expensesRows);
    }

    async function getVendorExpenses() {
        let path = '/custom-admin/people/vendor/api/report';
        let params = {};
        const response = await apiClient.get(path, {
            params: params
        });
        expenseData = response.data;
        updateExpenseTable();
    }

    $vendorExpenseTable.on('click', '.clickarea', function () {
        $(this).hide();
        $(this).parent().find('.txt_modified').val($(this).find('.val').html());
        $(this).parent().find('.input-area').show();
    });

    $vendorExpenseTable.on('click', '.save', async function () {
        let $txtField = $(this).parents('.input-area').find('.txt_modified');
        const value = $txtField.val();
        const vendorIndex = $txtField.attr('data-vendor-index');
        const expenseIndex = $txtField.attr('data-expense-index');
        const month = Number(expenseIndex) + 1;
        let requestData = {
            vendor_id: expenseData.vendors[vendorIndex].id,
            year: expenseData.year,
            month: month,
            expense: value
        };
        const resp = await apiClient.post('/custom-admin/people/vendor/api/expense/edit', requestData);
        expenseData.vendors[vendorIndex].expenses[expenseIndex].value = Number(value);
        expenseData.vendors[vendorIndex].expenses[expenseIndex].updated = true;
        $(this).parents('.input-area').hide();
        $(this).parents('td').find('.clickarea').show();
        updateExpenseTable();
    });

    $vendorExpenseTable.on('click', '.cross', function () {
        $(this).parents('.input-area').hide();
        $(this).parents('td').find('.clickarea').show();
    });

    $vendorExpenseTable.on('click', '.reset', function () {
        $(this).parents('.input-area').hide();
        $(this).parents('td').find('.clickarea').show();
    });

    function getDefaultVendorExpenses() {
        let vendorExpenses = [];
        for (let i = 0; i < 12; i++) {
            vendorExpenses.push({
                "value": 0,
                "updated": false
            });
        }
        return vendorExpenses;
    }

    function updateVendorExpenseTable(updatedVendor) {
        let matched = false;
        for (let i = 0; i < expenseData.vendors.length; i++) {
            if (expenseData.vendors[i].id == updatedVendor.id) {
                expenseData.vendors[i].vendor_name = updatedVendor.vendor_name;
                matched = true;
                break;
            }
        }
        if (!matched) {
            expenseData.vendors = [{
                'id': updatedVendor.id,
                'vendor_name': updatedVendor.vendor_name,
                'expenses': getDefaultVendorExpenses()
            }, ...expenseData.vendors];
        }
        updateExpenseTable();
    }

    function removeDeletedVendorFromExpense(vendorId) {
        for (let i = 0; i < expenseData.vendors.length; i++) {
            if (expenseData.vendors[i].id == vendorId) {
                expenseData.vendors.splice(i, 1);
            }
        }
        updateExpenseTable();
    }

    // End vendors expenses tab

    // Vendors list tab

    let currentSelection = {
        filters: {},
        pageNumber: 1,
        pageSize: 8
    };

    let vendorData = {
        count: 0,
        currentPageNumber: 1,
        results: []
    };

    let currentOperation = 'add';

    const $vendorName = $('#id_vendor_name');
    const $vendorDescription = $('#id_vendor_description');

    let selectedIndex = null;

    function getVendorColumnsHtml(vendor, index) {
        return `
            <th class="client_name">
                <div class="btn-group dropend vendor-id-${vendor.id}" role="group">
                    <button type="button" class="btn btn-secondary list-action-button" data-bs-toggle="dropdown" 
                        aria-expanded="false">
                        <img src="/static/custom_admin_assets/images/primary_fill.svg" alt="">
                    </button>
                    <span>${vendor.vendor_name}</span>
                    <ul class="dropdown-menu">
                        <li><button class="btn btn-vendor-edit" data-index="${index}">Edit</button></li>
                        <li><button class="btn btn-vendor-delete" data-index="${index}">Delete</button></li>
                    </ul>
                </div>
            </th>
            <td class="client_status">${vendor.vendor_description}</td>
        `;
    }

    function getVendorRowHtml(vendor, index) {
        return '<tr>' + getVendorColumnsHtml(vendor, index) + '</tr>';
    }

    function getVendorRowsHtml(index) {
        let rowsHtml = '';
        for (let i = 0; i < vendorData.results.length; i++) {
            rowsHtml += getVendorRowHtml(vendorData.results[i], i);
        }
        return rowsHtml;
    }

    function updateTable() {
        if (vendorData.results.length === 0) {
            $('#id_no_content').show();
            $('#id_vendor_table').hide();
        } else {
            const vendorsRowsHtml = getVendorRowsHtml();
            $('#id_no_content').hide();
            $('#id_vendor_table').show();
            $('#id_vendor_table').find('tbody').html(vendorsRowsHtml);
        }
    }

    function updatePagination() {
        const numberOfPages = Math.ceil(vendorData.count / currentSelection.pageSize);
        if (numberOfPages <= 1) {
            $('#id_pagination_container').html('');
            return;
        }
        let paginationHtml = '';
        for (let i = 1; i <= numberOfPages; i++) {
            let buttonStateClass = '';
            if (vendorData.currentPageNumber === i) {
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
            </li>`;
        $('#id_pagination_container').html(paginationHtml);
    }

    async function getVendors() {
        let path = '/custom-admin/people/vendor/api/list?page=' + currentSelection.pageNumber;
        let params = {};
        const response = await apiClient.get(path, {
            params: params
        });
        vendorData = response.data;
        vendorData.currentPageNumber = currentSelection.pageNumber;
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

    function resetForm() {
        $vendorName.val('');
        $vendorDescription.val('');
    }

    function fillUpForm(vendor) {
        $vendorName.val(vendor.vendor_name);
        $vendorDescription.val(vendor.vendor_description);
    }

    function showModal(type) {
        $('.error_container').html('');
        if (type === 'add') {
            currentOperation = 'add';
            $('.modal-title').html('Add New Vendor');
            $('#id_btn_vendor_add').html('Add Vendor');
        } else if (type === 'edit') {
            currentOperation = 'edit';
            $('.modal-title').html('Edit Vendor');
            $('#id_btn_vendor_add').html('Update Vendor');
        }
        $('#modal-vendor').modal('show');
    }

    $('#btn-vendor-modal-show').on('click', function () {
        resetForm();
        showModal('add');
    });

    async function addVendor(data) {
        const resp = await apiClient.post('/custom-admin/people/vendor/api/add', data, {
            validateStatus: (status) => {
                return status >= 200 && status < 500;
            },
        });
        if (resp.status === 201) {
            vendorData.results = [resp.data, ...vendorData.results];
            updateTable();
            $('#modal-vendor').modal('hide');
            resetForm();
            updateVendorExpenseTable(resp.data);
        } else if (resp.status === 400) {
            showValidationErrors(resp.data);
        }
    }

    async function editVendor(data) {
        let vendorId = vendorData.results[selectedIndex].id;
        const resp = await apiClient.patch('/custom-admin/people/vendor/api/' + vendorId, data, {
            validateStatus: (status) => {
                return status >= 200 && status < 500;
            },
        });
        if (resp.status === 200) {
            for (let i = 0; i < vendorData.results.length; i++) {
                if (vendorData.results[i].id === resp.data.id) {
                    vendorData.results[i] = resp.data;
                }
            }
            updateTable();
            $('#modal-vendor').modal('hide');
            resetForm();
            updateVendorExpenseTable(resp.data);
        } else if (resp.status === 400) {
            showValidationErrors(resp.data);
        }
    }

    $('#id_btn_vendor_add').on('click', function () {
        $('.error_container').html('');
        let data = {
            vendor_name: $vendorName.val(),
            vendor_description: $vendorDescription.val()
        };
        if (currentOperation === 'add') {
            addVendor(data);
        } else if (currentOperation === 'edit') {
            editVendor(data);
        }
    });

    $('tbody').on('click', '.btn-vendor-edit', async function (e) {
        e.preventDefault();
        const index = $(this).attr('data-index');
        const response = await apiClient.get('/custom-admin/people/vendor/api/' + vendorData.results[index].id);
        selectedIndex = $(this).attr('data-index');
        fillUpForm(response.data);
        showModal('edit');
    });

    $('tbody').on('click', '.btn-vendor-delete', function (e) {
        e.preventDefault();
        selectedIndex = $(this).attr('data-index');
        $('#modal-delete').modal('show');
    });

    $('#modal-delete').on('click', '#btn-confirm-delete', async function () {
        const vendorId = vendorData.results[selectedIndex].id;
        const response = await apiClient.delete('/custom-admin/people/vendor/api/' + vendorId);
        $('#modal-delete').modal('hide');
        for (let i = 0; i < vendorData.results.length; i++) {
            if (vendorId == vendorData.results[i].id) {
                console.log("matched");
                vendorData.results.splice(i, 1);
                break;
            }
        }
        updateTable();
        removeDeletedVendorFromExpense(vendorId);
    });

    $('#id_pagination_container').on('click', '#id_btn_next_page', async function (e) {
        e.preventDefault();
        const numberOfPages = Math.ceil(vendorData.count / currentSelection.pageSize);
        if (currentSelection.pageNumber - numberOfPages) {
            currentSelection.pageNumber += 1;
            await getVendors();
        }
    });

    $('#id_pagination_container').on('click', '#id_btn_previous_page', async function (e) {
        e.preventDefault();
        if (currentSelection.pageNumber > 1) {
            currentSelection.pageNumber -= 1;
            await getVendors();
        }
    });

    $('#id_pagination_container').on('click', '.page', async function (e) {
        e.preventDefault();
        const pageNumber = Number($(this).html());
        if (currentSelection.pageNumber !== pageNumber) {
            currentSelection.pageNumber = pageNumber;
            await getVendors();
        }
    });

    // End vendors list tab

    getVendorExpenses();
    getVendors();

});
