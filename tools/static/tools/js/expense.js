if (!$) {
    $ = django.jQuery;
}
//alert('Expense Loaded!');

$(document).ready(function() {
	
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
	    }else{
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

	    }else{
	    	$(".field-expense_frequency").hide();
			//$(".field-date_of_first_payment").hide();
			$("label[for='id_date_of_first_payment']").text('Date of payment:');
			$(".field-date_of_last_payment").hide();
	    }
	});


});