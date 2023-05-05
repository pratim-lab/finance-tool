if (!$) {
    $ = django.jQuery;
}
//alert('Client Loaded!');

$(document).ready(function() {
	
	if($("#id_payment_terms").val() != 'OTR'){
		$(".field-payment_terms_other").hide();
	}
	
	$("#id_payment_terms").change(function () {
	    var payment_terms_val = $(this).val();
	    if(payment_terms_val== 'OTR'){
			$(".field-payment_terms_other").show(); 
	    }else{
	    	$(".field-payment_terms_other").hide();
	    }
	});

});