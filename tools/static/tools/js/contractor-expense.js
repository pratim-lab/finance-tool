$(document).ready(function() {

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

        for (let i = 0; i < expenseData.rows.length; i ++) {
            for (let j = 0; j < expenseData.rows[i].length; j++) {
                const monthStr = expenseData.rows[i][j].month;
                monthlyTotal[year][monthStr] += Number(expenseData.rows[i][j].expense);
            }
        }
        expenseData.monthlyTotal = monthlyTotal;

    }

    let expenseData = {
    "year": 2023,
    "months": [
        {
            "id": 1,
            "value": "January"
        },
        {
            "id": 2,
            "value": "February"
        },
        {
            "id": 3,
            "value": "March"
        },
        {
            "id": 4,
            "value": "April"
        },
        {
            "id": 5,
            "value": "May"
        },
        {
            "id": 6,
            "value": "June"
        },
        {
            "id": 7,
            "value": "July"
        },
        {
            "id": 8,
            "value": "August"
        },
        {
            "id": 9,
            "value": "September"
        },
        {
            "id": 10,
            "value": "October"
        },
        {
            "id": 11,
            "value": "November"
        },
        {
            "id": 12,
            "value": "December"
        }
    ],
    "rows": [
        [
            {
                "id": 1,
                "name": "Contractor 1"
            },
            {
                "year": 2023,
                "month": 1,
                "expense": 2400.0
            },
            {
                "year": 2023,
                "month": 2,
                "expense": 2400.0
            },
            {
                "year": 2023,
                "month": 3,
                "expense": 2400.0
            },
            {
                "year": 2023,
                "month": 4,
                "expense": 2400.0
            },
            {
                "year": 2023,
                "month": 5,
                "expense": 2400.0
            },
            {
                "year": 2023,
                "month": 6,
                "expense": 2400.0
            },
            {
                "year": 2023,
                "month": 7,
                "expense": 2400.0
            },
            {
                "year": 2023,
                "month": 8,
                "expense": 2400.0
            },
            {
                "year": 2023,
                "month": 9,
                "expense": 2400.0
            },
            {
                "year": 2023,
                "month": 10,
                "expense": 2400.0
            },
            {
                "year": 2023,
                "month": 11,
                "expense": 2400.0
            },
            {
                "year": 2023,
                "month": 12,
                "expense": 2400.0
            },
            28800.0
        ]
    ],
    "monthly_total_items": [
        {
            "year": 2023,
            "month": 1,
            "total_expense": 2400.0
        },
        {
            "year": 2023,
            "month": 2,
            "total_expense": 2400.0
        },
        {
            "year": 2023,
            "month": 3,
            "total_expense": 2400.0
        },
        {
            "year": 2023,
            "month": 4,
            "total_expense": 2400.0
        },
        {
            "year": 2023,
            "month": 5,
            "total_expense": 2400.0
        },
        {
            "year": 2023,
            "month": 6,
            "total_expense": 2400.0
        },
        {
            "year": 2023,
            "month": 7,
            "total_expense": 2400.0
        },
        {
            "year": 2023,
            "month": 8,
            "total_expense": 2400.0
        },
        {
            "year": 2023,
            "month": 9,
            "total_expense": 2400.0
        },
        {
            "year": 2023,
            "month": 10,
            "total_expense": 2400.0
        },
        {
            "year": 2023,
            "month": 11,
            "total_expense": 2400.0
        },
        {
            "year": 2023,
            "month": 12,
            "total_expense": 2400.0
        }
    ],
    "total": 28800.0,
    "contractors": [
        {
            "id": 1,
            "contractor_name": "Contractor 1"
        }
    ]
};

    function getThRow() {
        let thTds = '<th scope="col"></th>';
        for (let i = 0; i < expenseData.months.length; i ++) {
            thTds += '<th scope="col">' + expenseData.months[i].value.substring(0, 3) + '</th>';
        }
        // thTds += '<td><b>Yearly Total</b></td>';
        return '<tr>' + thTds + '</tr>';
    }

    function getRows() {
        let rows = '';
        for (let i = 0; i < expenseData.rows.length; i ++) {
            let tds = '';
            for (let j = 0; j < expenseData.rows[i].length; j ++) {
                const col = expenseData.rows[i][j];
                if (j === 0) {
                    tds += '<th>' + col.name + '</th>';
                }
                else if (j === expenseData.rows[i].length - 1) {
                    // tds += '<td id="yearly_total_contractor_"' + expenseData.rows[0].id + '>' + col + '</td>';
                }
                else {
                    tds += '' +
                        '<td>' +
                            '<span class="clickarea">$<span class="val">' + col.expense + '</span></span>' +
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
        for (let i = 1; i <= 12; i ++) {
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
        console.log(expenseData.rows[i][j]);
        console.log(expenseData.rows[i][0].id);
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
    
});

