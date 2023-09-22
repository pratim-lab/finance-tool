(function($){
        $(window).on("load",function(){
            $("ul.slide-list2").mCustomScrollbar();
        });
})(jQuery);

// Menu accordian

var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var panel = this.nextElementSibling;
    if (panel.style.display === "block") {
      panel.style.display = "none";
    } else {
      panel.style.display = "block";
    }
  });
}

// really home tab start //

// Show the first tab and hide the rest
jQuery('#tabs-nav li:first-child').addClass('active');
jQuery('.tab-content').hide();
jQuery('.tab-content:first').show();

// Click function
jQuery('#tabs-nav li').click(function () {
    jQuery('#tabs-nav li').removeClass('active');
    jQuery(this).addClass('active');
    jQuery('.tab-content').hide();

    var activeTab = jQuery(this).find('a').attr('href');
    jQuery(activeTab).fadeIn();
    return false;
});


// really home tab end //