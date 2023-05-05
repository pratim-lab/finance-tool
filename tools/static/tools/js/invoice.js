if (!$) {
    $ = django.jQuery;
}
//alert('Invoice Loaded!');

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
	
	
});