if (!$) {
    $ = django.jQuery;
}
//alert('Contractor Loaded!');

$(document).ready(function() {
	$("#id_contractor_hourly_salary").blur(function(){
		calculate_net();
	});

	$("#id_contractor_expected_weekly_hours").blur(function(){
		calculate_net();
	}); 

});

function calculate_net(){
	sal = parseFloat($("#id_contractor_hourly_salary").val());
	hours = parseFloat($("#id_contractor_expected_weekly_hours").val());
	if(!isNaN(sal) && !isNaN(hours)){
		netsal = sal * hours;
		$("#id_contractor_estimated_weekly_salary").val(netsal);
	}else{
		$("#id_contractor_estimated_weekly_salary").val('');
	}
	
}