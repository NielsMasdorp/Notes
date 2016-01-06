app.directive('scrollToAfterEdit', function() {
  return {
    restrict: 'A',
    link: function(scope, $elm) {
      $elm.on('click', function() {
      	if (scope.editingNote) {
        	$("body").animate({scrollTop: $(".note-container").offset().top - ($elm.height()/2)}, "slow");
    	}
      });
    }
  }
});

