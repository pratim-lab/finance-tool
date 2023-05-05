$(document).ready(function () {
    $('.expense-txt-container-span').on('click', function () {
        console.log("kk");
        $(this).parent().find('.expense-edit-btn').show();
        $(this).parent().find('.edit-close-btn').show();

        $(this).parent().find('.expense-txt').prop("disabled", false);
        $(this).parent().find('.expense-txt').focus();
    });

    $('.edit-close-btn').on('click', function () {
        const $inputField = $(this).parent().parent().find('.expense-txt');
        $inputField.val($inputField.attr('data-previous-value'));
        $(this).parent().parent().find('.expense-edit-btn').hide();
        $(this).parent().parent().find('.edit-close-btn').hide();
        $(this).parent().parent().find('.expense-txt').prop("disabled", true);
    });

    $('.expense-edit-btn').on('click', function () {
        const $inputField = $(this).parent().parent().find('.expense-txt');
        const expense = $inputField.val();
        const year = $inputField.attr('data-year');
        const month = $inputField.attr('data-month');
        const employeeId = $inputField.attr('data-employee-id');
        const $button = $(this);
        const $closeButton = $(this).parent().parent().find('.edit-close-btn');

        $.ajax({
            type: 'POST',
            url: '/admin/reports/employeemonthlyexpensereport/edit',
            data: JSON.stringify({
                employee_id: employeeId,
                year: year,
                month: month,
                expense: expense
            }),
            dataType: 'json',
            headers: {
                "X-CSRFToken": $('#csrf-token').val()
            },
            contentType: 'application/json',
            success: function (response) {
                $button.hide();
                $closeButton.hide();
                $inputField.val(response.expense);
                $inputField.attr('data-previous-value', response.expense);
                $inputField.prop("disabled", true);

                // Update total yearly expense for a employee
                const employeeExpenses = $('.expense_employee_' + employeeId).map((_,el) => el.value).get();
                let employeeYearlyExpense = 0;
                for(let i = 0; i < employeeExpenses.length; i++) {
                    employeeYearlyExpense += Number(employeeExpenses[i]);
                }
                $('#yearly_total_employee_' + employeeId).html('$' + employeeYearlyExpense);

                // Update total monthly expense for all the employees
                const values = $('.expense_year_'+ year + '_month_' + month).map((_,el) => el.value).get();
                let monthlyTotal = 0;
                for (let i = 0; i < values.length; i++) {
                    monthlyTotal += Number(values[i]);
                }
                $('#total_expense_year_'+ year + '_month_' + month).html(monthlyTotal);

                // Update total
                let total = 0;
                $('.monthly_total').each(function (index, el) {
                    total = total + Number(el.innerHTML);
                });
                $('#total').html(total);
            },
            error: function (xhr, status, error) {
                console.log(error);
            }
        });

    });
});
