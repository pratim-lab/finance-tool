if (!$) {
    $ = django.jQuery;
}
//alert('Pipeline Loaded!');

$(document).ready(function() {
	
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