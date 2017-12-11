app.directive("boilingTable", function(){
	return{
		restrict: 'EA',
		replace: true,
		template: function(tElement,tAttrs){ 
			 var _html = ''; 
			 _html += '<div>' +'hello '+'</div>'; 
			 return _html; 
		}
	};
});