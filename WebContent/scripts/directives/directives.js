app.directive("passwordVerify", function() {
	return {
		require : "ngModel",
		scope : {
			passwordVerify : '='
		},
		link : function(scope, element, attrs, ctrl) {
			scope.$watch(function() {
				var combined;

				if (scope.passwordVerify || ctrl.$viewValue) {
					combined = scope.passwordVerify + '_' + ctrl.$viewValue;
				}
				return combined;
			}, function(value) {
				if (value) {
					ctrl.$parsers.unshift(function(viewValue) {
						var origin = scope.passwordVerify;
						if (origin !== viewValue) {
							ctrl.$setValidity("passwordVerify", false);
							return undefined;
						} else {
							ctrl.$setValidity("passwordVerify", true);
							return viewValue;
						}
					});
				}
			});
		}
	};
});

//上传文件
app.directive('fileModel', ['$parse', function ($parse) {
  return {
      restrict: 'A',
      link: function(scope, element, attrs) {
          var model = $parse(attrs.fileModel);
          var modelSetter = model.assign;
          
          element.bind('change', function() {
              scope.$apply(function() {
                  modelSetter(scope, element[0].files[0]);
              });
          });
      }
  };
}]);