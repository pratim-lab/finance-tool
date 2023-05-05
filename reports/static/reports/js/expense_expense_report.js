$(document).ready(function () {
    $('.expense-txt-container-span').on('click', function () {
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
        const expenseType = $inputField.attr('data-expense-type');
        const $button = $(this);
        const $closeButton = $(this).parent().parent().find('.edit-close-btn');

        $.ajax({
            type: 'POST',
            url: '/admin/reports/typetotalexpensereport/edit',
            data: JSON.stringify({
                expense_type: expenseType,
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

                // Update total yearly expense for an expense type
                let className = expenseType.replaceAll(' ', '_');
                const typeExpenses = $('.expense_' + className).map((_,el) => el.value).get();
                let typeYearlyExpense = 0;
                for(let i = 0; i < typeExpenses.length; i++) {
                    typeYearlyExpense += Number(typeExpenses[i]);
                }
                $('#expense_' + className).html('$' + typeYearlyExpense);

                // Update total monthly expense for all the expense types
                const values = $('.expense_'+ year + '_' + month).map((_,el) => el.value).get();
                let monthlyTotal = 0;
                for (let i = 0; i < values.length; i++) {
                    monthlyTotal += Number(values[i]);
                }
                console.log(monthlyTotal);
                $('#total_expense_'+ year + '_' + month).html(monthlyTotal);

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
