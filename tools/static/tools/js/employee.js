if (!$) {
    $ = django.jQuery;
}
//alert('Employee Loaded!');

$(document).ready(function() {
	$("#id_employee_monthly_salary").blur(function(){
		calculate_net();
	});

	$("#id_employee_monthly_tax").blur(function(){
		calculate_net();
	}); 

});

function calculate_net(){
	sal = parseFloat($("#id_employee_monthly_salary").val());
	taxparc = parseFloat($("#id_employee_monthly_tax").val());
	if(!isNaN(sal) && !isNaN(taxparc)){
		tax = sal * (taxparc/100);
		netsal = sal - tax;
		$("#id_employee_net_income").val(netsal);
	}else{
		$("#id_employee_net_income").val('');
	}
	
}