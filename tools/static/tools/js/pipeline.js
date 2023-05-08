if (!$) {
    $ = django.jQuery;
}
//alert('Pipeline Loaded!');



$(document).ready(function() {
	
	$(".field-expected_date_of_second_payment").hide();
	$(".field-expected_date_of_third_payment").hide();
	$(".field-expected_date_of_forth_payment").hide();
	$(".field-expected_date_of_fifth_payment").hide();
	$(".field-expected_date_of_sixth_payment").hide();
	$(".field-expected_date_of_seventh_payment").hide();
	$(".field-expected_date_of_eighth_payment").hide();
	$(".field-expected_date_of_nineth_payment").hide();
	$(".field-expected_date_of_tenth_payment").hide();
	$(".field-expected_date_of_eleventh_payment").hide();
	$(".field-expected_date_of_twelfth_payment").hide();

	no_of_payments = $("#id_no_of_payments").val();
	date_of_payments(no_of_payments);


	//$('#id_project').empty();
	$("#id_client").change(function () {
	    var client_val = $(this).val();
	    //alert(client_val);

		$.ajax({
			url: "/tools/get_projects_by_client",
			type: "get",
			data: { 
				client_id: client_val,
			},
			success: function(response) {
				//alert(response.data);
				var project = $('#id_project');
				project.empty();
				for (var i = 0; i < response.data.length; i++) {
					project.append('<option value="' + response.data[i].id + '">' + response.data[i].project_name + '</option>');
				}
			},
			error: function(xhr) {
				//Do Something to handle error
			}
		});
	});

	$("#id_no_of_payments").change(function () {
	    var no_of_payments = $(this).val();
	    //alert(no_of_payments);
	    date_of_payments(no_of_payments);

	});
	    
	$("#id_estimated_price").blur(function(){
		calculate_net();
	});

	$("#id_confidence").blur(function(){
		calculate_net();
	}); 

	$("#id_total_value_in_forecast").blur(function(){
		calculate_net2();
	});

	$("#id_no_of_payments").change(function(){
		calculate_net2();
	});

	
});

function calculate_net(){
	sal = parseFloat($("#id_estimated_price").val());
	hours = parseFloat($("#id_confidence").val());
	if(!isNaN(sal) && !isNaN(hours)){
		netsal = sal * (hours/100);
		$("#id_total_value_in_forecast").val(netsal);
	}else{
		$("#id_total_value_in_forecast").val('');
	}
}

function calculate_net2(){
	sal = parseFloat($("#id_total_value_in_forecast").val());
	hours = parseFloat($("#id_no_of_payments").val());
	if(!isNaN(sal) && !isNaN(hours)){
		netsal = sal/hours;
		$("#id_estimated_payment_amount").val(netsal);
	}else{
		$("#id_estimated_payment_amount").val('');
	}
}

function date_of_payments(no_of_payments){
	if(no_of_payments>= 2){
	    	$(".field-expected_date_of_second_payment").show();
	    	$("#id_expected_date_of_second_payment").prop('required',true);
	    }else{
	    	$("#id_expected_date_of_second_payment").val('');
	    	$(".field-expected_date_of_second_payment").hide();
	    }

		if(no_of_payments>= 3){
			$(".field-expected_date_of_third_payment").show();
			$("#id_expected_date_of_third_payment").prop('required',true);
		}else{
	    	$("#id_expected_date_of_third_payment").val('');
	    	$(".field-expected_date_of_third_payment").hide();
	    }

		if(no_of_payments>= 4){
			$(".field-expected_date_of_forth_payment").show();
			$("#id_expected_date_of_forth_payment").prop('required',true);
		}else{
	    	$("#id_expected_date_of_forth_payment").val('');
	    	$(".field-expected_date_of_forth_payment").hide();
	    }

		if(no_of_payments>= 5){
			$(".field-expected_date_of_fifth_payment").show();
			$("#id_expected_date_of_fifth_payment").prop('required',true);
		}else{
	    	$("#id_expected_date_of_fifth_payment").val('');
	    	$(".field-expected_date_of_fifth_payment").hide();
	    }

		if(no_of_payments>= 6){
			$(".field-expected_date_of_sixth_payment").show();
			$("#id_expected_date_of_sixth_payment").prop('required',true);
		}else{
	    	$("#id_expected_date_of_sixth_payment").val('');
	    	$(".field-expected_date_of_sixth_payment").hide();
	    }

		if(no_of_payments>= 7){
			$(".field-expected_date_of_seventh_payment").show();
			$("#id_expected_date_of_seventh_payment").prop('required',true);
		}else{
	    	$("#id_expected_date_of_seventh_payment").val('');
	    	$(".field-expected_date_of_seventh_payment").hide();
	    }

		if(no_of_payments>= 8){
			$(".field-expected_date_of_eighth_payment").show();
			$("#id_expected_date_of_eight_payment").prop('required',true);
		}else{
	    	$("#id_expected_date_of_eighth_payment").val('');
	    	$(".field-expected_date_of_eighth_payment").hide();
	    }

		if(no_of_payments>= 9){
			$(".field-expected_date_of_nineth_payment").show();
			$("#id_expected_date_of_ninth_payment").prop('required',true);
		}else{
	    	$("#id_expected_date_of_nineth_payment").val('');
	    	$(".field-expected_date_of_nineth_payment").hide();
	    }

		if(no_of_payments>= 10){
			$(".field-expected_date_of_tenth_payment").show();
			$("#id_expected_date_of_tenth_payment").prop('required',true);
		}else{
	    	$("#id_expected_date_of_tenth_payment").val('');
	    	$(".field-expected_date_of_tenth_payment").hide();
	    }

		if(no_of_payments>= 11){
			$(".field-expected_date_of_eleventh_payment").show();
			$("#id_expected_date_of_eleventh_payment").prop('required',true);
		}else{
	    	$("#id_expected_date_of_eleventh_payment").val('');
	    	$(".field-expected_date_of_eleventh_payment").hide();
	    }

		if(no_of_payments>= 12){
			$(".field-expected_date_of_twelfth_payment").show();
			$("#id_expected_date_of_twelfth_payment").prop('required',true);
		}else{
	    	$("#id_expected_date_of_twelfth_payment").val('');
	    	$(".field-expected_date_of_twelfth_payment").hide();
	    }
}