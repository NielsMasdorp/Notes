$(document).ready(function(){
	$(".button-collapse").sideNav();
 });

var initTabs = function() {
   	$('ul.tabs').tabs();
    $('.indicator').css("background-color","#616161");
}

var scrollToTopOfNotes = function() {
	$('body').animate({scrollTop: $('.note-container').offset().top}, 'slow');
}