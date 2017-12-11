'use strict';

app.controller('LoginController', function ($log, $rootScope, $scope, $cookies, $location, AlertService, AuthService, ProjectService) {
	$log.debug("LoginController called.");
	
	function login() {
		if(!$scope.credential.role){
			$scope.credential.role = 'PROJECT';
		}
		AuthService.login($scope.credential).success(function(user, status, headers, config) {
			$log.debug('login user = ' + JSON.stringify(user));
			
			if(user) {
				if(user.status == 'DISABLED') {
					$scope.error = "User account is disabled, please contact with the service.";
				}else {
					$rootScope.userId = user.id.toString();
					$rootScope.userName = user.name;
					$rootScope.role = user.role;
					$rootScope.userToken = user.token;
					
					if($scope.rememberPassword) {
						$cookies.userUsername = $scope.credential.username;
						$cookies.userPassword = $scope.credential.password;
					}
					
					if(!user.role){
						user.role = 'PROJECT';
					}
						
					if(user.role == 'ADMIN')
					{
						
						$location.path('/user/company/companys');
					}
					if(user.role == 'PROJECT')
					{
						ProjectService.findByUserId(user.id).success(function(project, status, headers, config) {
							$rootScope.project = project[0];
							$log.debug("root project =" +JSON.stringify($rootScope.project));
							$location.path('/summary/project/statusSummary');
						}).error(function(user, status, headers, config) {
				    		if(status == 401) {
				    			$scope.error = "User not exsits, please check whether the username and password is correct.";
				    		}else {
				    			AlertService.error('Login failed, please try again later.');
				    		}
				    	});
					}	
					else
						$location.path('/project/project/projects');
				}
			}
    	}).error(function(user, status, headers, config) {
    		if(status == 401) {
    			$scope.error = "User not exsits, please check whether the username and password is correct.";
    		}else {
    			AlertService.error('Login failed, please try again later.');
    		}
    	});
	};
	
	//auto log if remember password
	if($cookies.userUsername && $cookies.userPassword) {
		$scope.credential = {
			username : $cookies.userUsername,
			password : $cookies.userPassword
		};
			
		login();
	}
	
	$scope.doLogin = function(form) {
		$scope.submitted = true;
		
		if(form.$valid) {
			login();
		}
	};
	
});