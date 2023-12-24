if (!$) {
    $ = django.jQuery;
}

$(document).ready(function () {
    // Cost tab
    let reportData = {};
    let total = 0;

    function getFormattedAmount(amount) {
        if (amount === '') {
            return "";
        }
        return Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(Math.floor(amount));
    }

    function calculateMonthlyTotal() {
        total = 0;
        const year = reportData.year;
        let monthlyTotal = {};
        monthlyTotal[year] = {
            "1": 0,
            "2": 0,
            "3": 0,
            "4": 0,
            "5": 0,
            "6": 0,
            "7": 0,
            "8": 0,
            "9": 0,
            "10": 0,
            "11": 0,
            "12": 0
        };
        for (let i = 0; i < reportData.rows.length; i++) {
            for (let j = 1; j < reportData.rows[i].length - 1; j++) {
                const monthStr = reportData.rows[i][j].month;
                monthlyTotal[year][monthStr] += Number(reportData.rows[i][j].expense);
                total += Number(reportData.rows[i][j].expense);
            }
        }
        reportData.monthlyTotal = monthlyTotal;
    }

    function getThRow(){
        let thTds = '<th scope="col"></th>';
        for (let i = 0; i < reportData.months.length; i++) {
            thTds += `<th scope="col">${reportData.months[i].value.substring(0, 3)}</th>`;
        }
        thTds += '<td><b>EOY Projection</b></td>';
        return `<tr>${thTds}</tr>`;
    }

    function getRows() {
        let rows = '';
        for (let i = 0; i < reportData.rows.length; i++) {
            let tds = '';
            let staffTotal = 0;
            for (let j = 0; j < reportData.rows[i].length; j++) {
                const col = reportData.rows[i][j];
                if (j === 0) {
                    tds += '<th>' + col.name + '</th>';
                } else if (j === reportData.rows[i].length - 1) {
                    // tds += '<td id="yearly_total_contractor_"' + reportData.rows[0].id + '>' + getFormattedAmount(col) + '</td>';
                } else {
                    let updatedClass = '';
                    if (col.updated) {
                        updatedClass = 'updated';
                    }
                    staffTotal += col.expense;
                    tds += `
                        <td class="${updatedClass}">
                            <span class="clickarea"><span class="val">${getFormattedAmount(col.expense)}</span></span>
                            <div class="input-area" style="display: none;">
                                <input type="text" class="txt_modified" placeholder="$${col.expense}" value="${col.expense}" data-i="${i}" data-j="${j}"/>
                                <div class="btn-sec">
                                    <input type="button" class="reset" value="reset"/>
                                    <a href="#" class="cross"><img src="/static/custom_admin_assets/images/cross.svg" alt=""/></a>
                                    <input type="button" class="save" value="submit"/>
                                </div>
                            </div>
                        </td>
                        `;
                }
            }
            tds += `<td>${getFormattedAmount(staffTotal)}</td>`;
            const row = `<tr>${tds}</tr>`;
            rows += row;
        }
        let lastRowTds = '';
        lastRowTds += '<th><div class="totals"><b>Total</b></div></th>';
        for (let i = 1; i <= 12; i++) {
            lastRowTds += `
                <td>
                    <span></span>
                    <span><b>${getFormattedAmount(reportData.monthlyTotal[reportData.year][i])}</b></span>
                </td>
                `;
        }
        lastRowTds += `
            <td>
                <span></span>
                <span id="total"><b>${getFormattedAmount(total)}</b></span>
            </td>`;
        const lastRow = `<tr>${lastRowTds}</tr>`;
        return lastRow + rows;
    }

    function updateReportTable() {
        calculateMonthlyTotal();
        const thRow = getThRow();
        const rows = getRows();
        $('#id_thead').html(thRow);
        $('#id_tbody').html(rows);
    }

    async function fetchReportData() {
        let path = '/custom-admin/people/staff/api/report';
        const response = await apiClient.get(path);
        reportData = response.data;
        updateReportTable();
    }

    $('#id_tbody').on('click', '.clickarea', function () {
        $(this).hide();
        // $(this).parent().find('.txt_modified').val($(this).find('.val').html());
        $(this).parent().find('.input-area').show();
    });

    $('#id_tbody').on('click', '.save', async function () {
        let $txtField = $(this).parents('.input-area').find('.txt_modified');
        const value = $txtField.val();
        const i = $txtField.attr('data-i');
        const j = $txtField.attr('data-j');
        let requestData = {
            employee_id: reportData.rows[i][0].id,
            year: reportData.rows[i][j].year,
            month: reportData.rows[i][j].month,
            expense: value
        };
        const resp = await apiClient.post('/admin/reports/employeemonthlyexpensereport/edit', requestData);
        reportData.rows[i][j].expense = Number(value);
        reportData.rows[i][j].updated = true;
        $(this).parents('.input-area').hide();
        $(this).parents('td').find('.clickarea').show();
        updateReportTable();
    });

    $('#id_tbody').on('click', '.cross', function () {
        $(this).parents('.input-area').hide();
        $(this).parents('td').find('.clickarea').show();
    });

    $('#id_tbody').on('click', '.reset', async function () {
        let $txtField = $(this).parents('.input-area').find('.txt_modified');
        const i = $txtField.attr('data-i');
        const j = $txtField.attr('data-j');
        if(!reportData.rows[i][j].updated) {
            $(this).parents('.input-area').hide();
            $(this).parents('td').find('.clickarea').show();
            return;
        }
        let requestData = {
            employee_id: reportData.rows[i][0].id,
            year: reportData.rows[i][j].year,
            month: reportData.rows[i][j].month
        };
        const resp = await apiClient.post('/admin/reports/employeemonthlyexpensereport/reset', requestData);
        reportData.rows[i][j].expense = resp.data.expense;
        reportData.rows[i][j].updated = false;
        $(this).parents('.input-area').hide();
        $(this).parents('td').find('.clickarea').show();
        updateReportTable();
    });

    function updateReportTable2(updatedItem) {
        let matched = false;
        for (let i = 0; i < reportData.rows.length; i++) {
            if (reportData.rows[i][0].id == updatedItem.id) {
                reportData.rows[i] = updatedItem.expense;
                matched = true;
                break;
            }
        }
        if (!matched) {
            reportData.rows.push(updatedItem.expense);
        }
        updateReportTable();
    }

    function removeDeletedItem(itemId) {
        for (let i = 0; i < reportData.rows.length; i++) {
            if (reportData.rows[i][0].id == itemId) {
                reportData.rows.splice(i, 1);
            }
        }
        updateReportTable();
    }

    // Information tab

    let currentSelection = {
        filters: {},
        pageNumber: 1,
        pageSize: 8
    };

    let itemData = {
        count: 0,
        currentPageNumber: 1,
        results: []
    };

    let selectedIndex = null;

    function getItemColumnsHtml(item, index) {
        return `
            <th class="employee_name">
                <div class="btn-group dropend" role="group">
                    <button type="button" class="btn btn-secondary list-action-button" data-bs-toggle="dropdown" aria-expanded="false">
                        <img src="/static/custom_admin_assets/images/primary_fill.svg" alt="">
                     </button>
                    <div>
                        <p class="item-title">${item.employee_name}</p>
                        <p class="item-subtitle">${item.city}, ${item.state}</p>
                    </div>
                    <ul class="dropdown-menu">
                        <li><button class="btn btn-item-edit" data-index="${index}">Edit</button></li>
                        <li><button class="btn btn-item-delete" data-index="${index}">Delete</button></li>
                    </ul>
                </div>
            </th>
            <td class="project_role">${item.project_role}</td>
            <td class="employee_monthly_salary">${getFormattedAmount(item.employee_monthly_salary)}</td>
            <td class="fte_billable_rate">${getFormattedAmount(item.fte_billable_rate)}</td>
            <td class="benefits">${item.benefits}</td>
        `;
    }

    function getItemRowHtml(item, index) {
        return `<tr>${getItemColumnsHtml(item, index)}</tr>`;
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
        }
        else {
            const itemsRowsHtml = getItemRowsHtml();
            $('#id_no_content').hide();
            $('#id_item_table').show();
            $('#id_item_table').find('tbody').html(itemsRowsHtml);
        }
    }

    function updatePagination() {
        const numberOfPages = Math.ceil(itemData.count / currentSelection.pageSize);
        if(numberOfPages <= 1) {
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
        let path = '/custom-admin/people/staff/api/list?page=' + currentSelection.pageNumber;
        const response = await apiClient.get(path);
        itemData = response.data;
        itemData.currentPageNumber = currentSelection.pageNumber;
        updateTable();
        updatePagination();
    }

    function showValidationErrors(errorData) {
        for (let key in errorData) {
            let errorHtml = '';
            for (let i = 0; i < errorData[key].length; i++) {
                errorHtml += `<li>* ${errorData[key][i]}</li>`;
            }
            $('#id_error_' + key).html(errorHtml);
        }
    }

    let currentOperation = 'add';

    function resetForm() {
        $('#id_employee_name').val('');
        $('#id_address1').val('');
        $('#id_address2').val('');
        $('#id_city').val('');
        $('#id_state').val('');
        $('#id_zipcode').val('');
        $('#id_employee_start_date').val('');
        $('#id_payment_structure').val('');
        $('#id_employee_monthly_salary').val('');
        $('#id_employee_monthly_tax').val('');
        $('#id_employee_net_income').val('');
        $('#id_project_role').val('');
        $('#id_fte_billable_rate').val('');
        $('#id_benefits').val('');
    }

    function fillUpForm(item) {
        $('#id_employee_name').val(item.employee_name);
        $('#id_address1').val(item.address1);
        $('#id_address2').val(item.address2);
        $('#id_city').val(item.city);
        $('#id_state').val(item.state);
        $('#id_zipcode').val(item.zipcode);
        $('#id_employee_start_date').val(item.employee_start_date);
        $('#id_payment_structure').val(item.payment_structure);
        $('#id_employee_monthly_salary').val(item.employee_monthly_salary);
        $('#id_employee_monthly_tax').val(item.employee_monthly_tax);
        $('#id_employee_net_income').val(item.employee_net_income);
        $('#id_project_role').val(item.project_role);
        $('#id_fte_billable_rate').val(item.fte_billable_rate);
        $('#id_benefits').val(item.benefits);
    }

    function showModal(type) {
        $('.error_container').html('');
        if (type === 'add') {
            currentOperation = 'add';
            $('.modal-title').html('Add a staff member');
            $('#id_btn_item_add').html('Save');
        } else if (type === 'edit') {
            currentOperation = 'edit';
            $('.modal-title').html('Edit staff member');
            $('#id_btn_item_add').html('Update');
        }
        $('#modal-item').modal('show');
    }

    $('#btn-item-modal-show').on('click', function () {
        resetForm();
        showModal('add');
    });

    async function addItem(data) {
        const resp = await apiClient.post('/custom-admin/people/staff/api/add', data, {
            validateStatus: (status) => {
                return status >= 200 && status < 500;
            },
        });
        if (resp.status === 201) {
            itemData.results = [resp.data, ...itemData.results];
            updateTable();
            $('#modal-item').modal('hide');
            resetForm();
            updateReportTable2(resp.data);
        } else if (resp.status === 400) {
            showValidationErrors(resp.data);
        }
    }

    async function editItem(data) {
        let itemId = itemData.results[selectedIndex].id;
        const resp = await apiClient.patch('/custom-admin/people/staff/api/' + itemId, data, {
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
            updateReportTable2(resp.data);
        } else if (resp.status === 400) {
            showValidationErrors(resp.data);
        }
    }

    $('#id_btn_item_add').on('click', function () {
        $('.error_container').html('');
        let data = {
            employee_name: $('#id_employee_name').val(),
            address1: $('#id_address1').val(),
            address2: $('#id_address2').val(),
            city: $('#id_city').val(),
            state: $('#id_state').val(),
            zipcode: $('#id_zipcode').val(),
            employee_start_date: $('#id_employee_start_date').val(),
            payment_structure: $('#id_payment_structure').val(),
            employee_monthly_salary: $('#id_employee_monthly_salary').val(),
            employee_monthly_tax: $('#id_employee_monthly_tax').val(),
            employee_net_income: $('#id_employee_net_income').val(),
            project_role: $('#id_project_role').val(),
            fte_billable_rate: $('#id_fte_billable_rate').val(),
            benefits: $('#id_benefits').val(),
        };
        if (currentOperation === 'add') {
            addItem(data);
        } else if (currentOperation === 'edit') {
            editItem(data);
        }
    });

    $('tbody').on('click', '.btn-item-edit', async function (e) {
        e.preventDefault();
        selectedIndex = $(this).attr('data-index');
        const response = await apiClient.get('/custom-admin/people/staff/api/' + itemData.results[selectedIndex].id);
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
        const response = await apiClient.delete('/custom-admin/people/staff/api/' + itemId);
        $('#modal-delete').modal('hide');
        for (let i = 0; i < itemData.results.length; i++) {
            if (itemId == itemData.results[i].id) {
                itemData.results.splice(i, 1);
                break;
            }
        }
        updateTable();
        removeDeletedItem(itemId);
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
        let sal = parseFloat($("#id_employee_monthly_salary").val());
        let taxparc = parseFloat($("#id_employee_monthly_tax").val());
        if (!isNaN(sal) && !isNaN(taxparc)) {
            let tax = sal * (taxparc / 100);
            let netsal = sal - tax;
            $("#id_employee_net_income").val(netsal);
        } else {
            $("#id_employee_net_income").val('');
        }
    }

    $("#id_employee_monthly_salary").blur(function () {
        calculate_net();
    });

    $("#id_employee_monthly_tax").blur(function () {
        calculate_net();
    });

    fetchReportData();
    getItems();

});
