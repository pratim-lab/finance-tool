if (!$) {
    $ = django.jQuery;
}
//alert('Project Loaded!');

$(document).ready(function() {
	
	if($("#id_project_type").val() != 'P'){
		$(".field-confidence").hide();
	}
	
	$("#id_project_type").change(function () {
	    var project_type_val = $(this).val();
	    if(project_type_val== 'P'){
			$(".field-confidence").show(); 
	    }else{
	    	$(".field-confidence").hide();
	    }
	});

});