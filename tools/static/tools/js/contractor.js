if (!$) {
    $ = django.jQuery;
}
//alert('Contractor Loaded!');

$(document).ready(function () {

    // Contractor cost tab

    function calculateMonthlyTotal() {
        const year = expenseData.year;
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

        for (let i = 0; i < expenseData.rows.length; i++) {
            for (let j = 0; j < expenseData.rows[i].length; j++) {
                const monthStr = expenseData.rows[i][j].month;
                monthlyTotal[year][monthStr] += Number(expenseData.rows[i][j].expense);
            }
        }
        expenseData.monthlyTotal = monthlyTotal;

    }

    let expenseData = {};

    function getThRow() {
        let thTds = '<th scope="col"></th>';
        for (let i = 0; i < expenseData.months.length; i++) {
            thTds += '<th scope="col">' + expenseData.months[i].value.substring(0, 3) + '</th>';
        }
        // thTds += '<td><b>Yearly Total</b></td>';
        return '<tr>' + thTds + '</tr>';
    }

    function getRows() {
        let rows = '';
        for (let i = 0; i < expenseData.rows.length; i++) {
            let tds = '';
            for (let j = 0; j < expenseData.rows[i].length; j++) {
                const col = expenseData.rows[i][j];
                if (j === 0) {
                    tds += '<th>' + col.name + '</th>';
                } else if (j === expenseData.rows[i].length - 1) {
                    // tds += '<td id="yearly_total_contractor_"' + expenseData.rows[0].id + '>' + col + '</td>';
                } else {
                    let updatedClass = '';
                    if (col.updated) {
                        updatedClass = 'updated';
                    }
                    tds += '' +
                        '<td>' +
                            '<span class="clickarea">$<span class="val">' + col.expense + '</span></span>' +
                            '<span class="' + updatedClass + '"></span>' +
                            '<div class="input-area" style="display: none;">' +
                                '<input type="text" class="txt_modified" placeholder="$' + col.expense +
                                '" value="' + col.expense + '" data-i="' + i + '" data-j="' + j + '"/>' +
                                '<div class="btn-sec">' +
                                    '<input type="button" class="reset" value="reset"/>' +
                                    '<a href="#" class="cross"><img src="/static/custom_admin_assets/images/cross.svg" alt=""/></a>' +
                                    '<input type="button" class="save" value="submit"/>' +
                                '</div>' +
                            '</div>' +
                        '</td>';
                }
            }
            const row = '<tr>' + tds + '</tr>';
            rows += row;
        }
        let lastRowTds = '';

        lastRowTds += '<th><div class="totals">Total</div></th>';
        for (let i = 1; i <= 12; i++) {
            lastRowTds += '' +
                '<td>' +
                '<span>$</span>' +
                '<span>' + expenseData.monthlyTotal[expenseData.year][i] + '</span>' +
                '</td>';
        }
        // lastRowTds += '' +
        //     '<td>' +
        //         '<span>$</span>' +
        //         '<span id="total">' + expenseData.total + '</span>' +
        //     '</td>';
        const lastRow = '<tr>' + lastRowTds + '</tr>';
        return lastRow + rows;
    }

    function updateTable() {
        calculateMonthlyTotal();
        const thRow = getThRow();
        const rows = getRows();
        $('#id_thead').html(thRow);
        $('#id_tbody').html(rows);
    }

    async function fetchExpenseData() {
        let path = '/custom-admin/tools/contractor/api/expense';
        const response = await apiClient.get(path);
        expenseData = response.data;
        updateTable();
    }

    fetchExpenseData();

    $('#id_tbody').on('click', '.clickarea', function () {
        $(this).parent().find('.txt_modified').val($(this).find('.val').html());
        $(this).parent().find('.input-area').show();
    });

    $('#id_tbody').on('click', '.save', async function () {
        let $txtField = $(this).parents('.input-area').find('.txt_modified');
        const value = $txtField.val();
        const i = $txtField.attr('data-i');
        const j = $txtField.attr('data-j');
        let requestData = {
            contractor_id: expenseData.rows[i][0].id,
            year: expenseData.rows[i][j].year,
            month: expenseData.rows[i][j].month,
            expense: value
        };
        const resp = await apiClient.post('/admin/reports/contractormonthlyexpensereport/edit', requestData);
        expenseData.rows[i][j].expense = Number(value);
        $(this).parents('.input-area').hide();
        updateTable();
    });

    $('#id_tbody').on('click', '.cross', function () {
        $(this).parents('.input-area').hide();
    });

    $('#id_tbody').on('click', '.reset', function () {
        $(this).parents('.input-area').hide();
    });

    function updateExpenseTable(updatedContractor) {
        let matched = false;
        for (let i = 0; i < expenseData.rows.length; i++) {
            if (expenseData.rows[i][0].id == updatedContractor.id) {
                expenseData.rows[i] = updatedContractor.expense;
                matched = true;
                break;
            }
        }
        if (!matched) {
            expenseData.rows.push(updatedContractor.expense);
        }
        updateTable();
    }

    function removeDeletedContractor(contractorId) {
        for (let i = 0; i < expenseData.rows.length; i++) {
            if (expenseData.rows[i][0].id == contractorId) {
                expenseData.rows.splice(i, 1);
            }
        }
        updateTable();
    }


    // Contractor list tab ////////////////////////////

    let currentSelection = {
        filters: {},
        pageNumber: 1,
        pageSize: 1000
    };

    let data = {
        count: 0,
        currentPageNumber: 1,
        results: []
    };

    let selectedIndex = null;

    const ADD = 'add';
    const EDIT = 'edit';
    const ADD_TITLE = 'Add New Contractor';
    const EDIT_TITLE = 'Edit Contractor';

    let currentOperation = ADD;

    const $formModal = $('#modal-contractor');

    function showModal(type) {
        if (type === ADD) {
            currentOperation = ADD;
            $('.modal-title').html(ADD_TITLE);
            $('#id_btn_contractor_add').html('Add Contractor');
        } else if (type === EDIT) {
            currentOperation = EDIT;
            $('.modal-title').html(EDIT_TITLE);
            $('#id_btn_contractor_add').html('Update Contractor');
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
        $('#id_is_active').prop('checked', false);
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
        $('#id_is_active').prop('checked', contractor.is_active);
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

    function updateDetails() {
        const sc = data.results[selectedIndex];
        const address = `${sc.address1}, ${sc.city}, ${sc.zipcode}, ${sc.state}, ${sc.country}`;
        $('#id_contractor_details').find('.no').html(`#${sc.id}`);
        $('#id_contractor_details').find('.namearea').html(sc.contractor_name);
        $('#id_contractor_details').find('#id_address').html(address);
        $('#id_contractor_details').find('#id_cost_rate').html(sc.contractor_hourly_salary);
        $('#id_contractor_details').find('#id_hours').html(sc.contractor_expected_weekly_hours);
        if (sc.is_active) {
            $('#id_contractor_details').find('.active').show();
        }
        else {
            $('#id_contractor_details').find('.active').hide();
        }
    }

    function getLiHtml(contractor, index) {
        let statusClass = '';
        if (index === selectedIndex) {
            statusClass = 'active';
        }
        return `
            <li class="${statusClass}" data-index="${index}">
                <a href="#">
                    <label>${contractor.id}</label> · ${contractor.contractor_name}
                    <span>${contractor.city}, ${contractor.state}</span>
                </a>
            </li>
        `;
    }

    function getLisHtml() {
        let lisHtml = '';
        for (let i = 0; i < data.results.length; i++) {
            lisHtml += getLiHtml(data.results[i], i);
        }
        return lisHtml;
    }

    function updateListAndDetails() {
        const lisHtml = getLisHtml();
        $('#id_ul_contractors').html(lisHtml);
        updateDetails();
    }

    async function getListData() {
        let path = '/custom-admin/tools/contractor/api/list?page=' + currentSelection.pageNumber;
        const response = await apiClient.get(path);
        data = response.data;
        data.currentPageNumber = currentSelection.pageNumber;
        if (data.currentPageNumber === 1) {
            if (data.results.length > 0) {
                selectedIndex = 0;
            }
        }
        updateListAndDetails();
    }

    getListData();

    async function addContractor(contractorData) {
        const resp = await apiClient.post('/custom-admin/tools/contractor/api/add', contractorData, {
            validateStatus: (status) => {
                return status >= 200 && status < 500;
            },
        });
        if (resp.status === 201) {
            data.results = [...data.results, resp.data];
            selectedIndex = 0;
            updateListAndDetails();
            hideModal();
            resetForm();
            updateExpenseTable(resp.data);
        } else if (resp.status === 400) {
            showValidationErrors(resp.data);
        }
    }

    async function editContractor(contractorData) {
        const resp = await apiClient.patch('/custom-admin/tools/contractor/api/' + data.results[selectedIndex].id, contractorData, {
            validateStatus: (status) => {
                return status >= 200 && status < 500;
            },
        });
        if (resp.status === 200) {
            for (let i = 0; i < data.results.length; i++) {
                if (data.results[i].id === resp.data.id) {
                    data.results[i] = resp.data;
                }
            }
            updateListAndDetails();
            hideModal();
            resetForm();
            updateExpenseTable(resp.data);
        } else if (resp.status === 400) {
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
            is_active: $('#id_is_active').is(":checked")
        };

        if (currentOperation === ADD) {
            addContractor(contractorData);
        } else if (currentOperation === EDIT) {
            editContractor(contractorData);
        }

    });

    $('#btn_modal_contractor').click(function () {
        resetForm();
        showModal(ADD);
    });

    $('#id_contractor_details').on('click', '#id_btn_edit', async function (e) {
        e.preventDefault();
        const response = await apiClient.get('/custom-admin/tools/contractor/api/' + data.results[selectedIndex].id);
        resetForm();
        fillUpForm(response.data);
        showModal(EDIT);
    });

    $('#id_contractor_details').on('click', '#btn_delete', function (e) {
        e.preventDefault();
        $('#modal-delete').modal('show');
    });

    $('#modal-delete').on('click', '#btn-confirm-delete', async function () {
        const contractorId = data.results[selectedIndex].id;
        const response = await apiClient.delete('/custom-admin/tools/contractor/api/' + contractorId);
        $('#modal-delete').modal('hide');
        for (let i = 0; i < data.results.length; i++) {
            if (data.results[selectedIndex].id == data.results[i].id) {
                data.results.splice(i, 1);
                break;
            }
        }
        if (data.results.length > 0) {
            selectedIndex = 0;
        } else {
            selectedIndex = null;
        }
        updateListAndDetails();
        removeDeletedContractor(contractorId);
    });


    $('#id_ul_contractors').on('click', 'li', async function () {
        selectedIndex = Number($(this).attr('data-index'));
        $(this).parent().find('li').removeClass('active');
        $(this).addClass('active');
        updateDetails();
    });


    $("#id_contractor_hourly_salary").blur(function () {
        calculate_net();
    });

    $("#id_contractor_expected_weekly_hours").blur(function () {
        calculate_net();
    });

});

function calculate_net() {
    sal = parseFloat($("#id_contractor_hourly_salary").val());
    hours = parseFloat($("#id_contractor_expected_weekly_hours").val());
    if (!isNaN(sal) && !isNaN(hours)) {
        netsal = sal * hours;
        $("#id_contractor_estimated_weekly_salary").val(netsal);
    } else {
        $("#id_contractor_estimated_weekly_salary").val('');
    }

}
