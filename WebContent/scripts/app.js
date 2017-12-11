'use strict';

var app = angular.module('vkApp', [ 'ngAnimate', 'ngResource', 'ngSanitize', 'ngRoute', 'ngCookies', 'mgcrea.ngStrap', 'ngGrid', 'angular-md5', 'ui.calendar']);

app.config(function($routeProvider, $locationProvider, $httpProvider, $timepickerProvider, $logProvider) {
	// 安全认证
	$routeProvider.when('/login', {templateUrl : 'partials/login.html', controller : 'LoginController'});
	
	// 用户管理
	$routeProvider.when('/user/company/companys', {templateUrl : 'partials/user/company/companys.html', controller : 'CompanyController', authenticate: true});
	$routeProvider.when('/user/operator/operators', {templateUrl : 'partials/user/operator/operators.html', controller : 'OperatorController', authenticate: true});
	
	// 项目管理
	$routeProvider.when('/summary/project/statusSummary', {templateUrl : 'partials/project/statussummary/statusSummary.html', controller : 'StatusSummaryController', authenticate: true});
	$routeProvider.when('/project/project/projectInfo', {templateUrl : 'partials/project/project/projectInfo.html', controller : 'ProjectInfoController', authenticate: true});
	$routeProvider.when('/project/project/projects', {templateUrl : 'partials/project/project/projects.html', controller : 'ProjectController', authenticate: true});
	$routeProvider.when('/project/project/buildings', {templateUrl : 'partials/project/building/buildings.html', controller : 'BuildingController', authenticate: true});
	$routeProvider.when('/project/project/obvsites', {templateUrl : 'partials/project/obvsite/obvsites.html', controller : 'ObvsiteController', authenticate: true});
	$routeProvider.when('/project/project/params', {templateUrl : 'partials/project/params/params.html', controller : 'ParamsController', authenticate: true});
	$routeProvider.when('/project/project/boilings', {templateUrl : 'partials/project/boiling/boilings.html', controller : 'BoilingController', authenticate: true});
	$routeProvider.when('/project/project/boilinggroups', {templateUrl : 'partials/project/boiling/boilingGroup.html', controller : 'BoilingGroupController', authenticate: true});
	$routeProvider.when('/project/project/controllers', {templateUrl : 'partials/project/controller/controllers.html', controller : 'DispatchCtrlController', authenticate: true});
	
	//监测数据
	$routeProvider.when('/monitor/monitor/datas', {templateUrl : 'partials/monitor/monitor/datas.html', controller : 'MonitordatasController', authenticate: true});
	$routeProvider.when('/monitor/wmonitor/datas', {templateUrl : 'partials/monitor/wmonitor/datas.html', controller : 'WMonitordatasController', authenticate: true});
	$routeProvider.when('/monitor/weather/metaweathers', {templateUrl : 'partials/monitor/weather/metaweathers.html', controller : 'MetaWeathersController', authenticate: true});
	$routeProvider.when('/monitor/weather/detailweathers', {templateUrl : 'partials/monitor/weather/detailweathers.html', controller : 'DetailWeathersController', authenticate: true});
	
	//操作记录
	$routeProvider.when('/operate/operate/operations', {templateUrl : 'partials/operate/operate/operations.html', controller : 'OperationsController', authenticate: true});
	$routeProvider.when('/operate/runningdata/runningdatas', {templateUrl : 'partials/operate/runningdata/runningDatas.html', controller : 'RunningDataController', authenticate: true});
	$routeProvider.when('/operate/daydata/datas', {templateUrl : 'partials/operate/daydata/datas.html', controller : 'DayDatasController', authenticate: true});
	$routeProvider.when('/operate/weekdata/datas', {templateUrl : 'partials/operate/weekdata/datas.html', controller : 'WeekDatasController', authenticate: true});
	$routeProvider.when('/operate/monthdata/datas', {templateUrl : 'partials/operate/monthdata/datas.html', controller : 'MonthDatasController', authenticate: true});
	$routeProvider.when('/operate/sessiondata/datas', {templateUrl : 'partials/operate/sessiondata/datas.html', controller : 'SessionDatasController', authenticate: true});
	$routeProvider.when('/operate/predict/predicts', {templateUrl : 'partials/operate/predict/datas.html', controller : 'PredictDataController', authenticate: true});
	
	// 默认前往登陆页面
	$routeProvider.otherwise({redirectTo : '/login'});

	// configure to use html 5 style url
	$locationProvider.html5Mode(true);
	
	// configure to enable CORS
	$httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

	// configure to intercept 401s and 403s and redirect you to login
	$httpProvider.interceptors.push([ '$q', '$location', '$rootScope', function($q, $location, $rootScope) {
		return {
			request : function(config) {
				config.headers = config.headers || {};
				if($rootScope.userId && $rootScope.userToken) {
			        config.headers.Authorization = $rootScope.userId + " " + $rootScope.userToken;
			    }
			    return config || $q.when(config);
			},
			
			responseError : function(response) {
				if (response.status === 401 || response.status === 403) {
//					$location.path('/login');
					return $q.reject(response);
				} else {
					return $q.reject(response);
				}
			}
		};
	} ]);

	// configure the time picker
	angular.extend($timepickerProvider.defaults, {
		minuteStep : 30,
		length : 3
	});
	
	// configure log
	$logProvider.debugEnabled = false;
});

app.run(function($rootScope, $location, AuthService) {
	// redirect to login if route requires auth and user has not login
	$rootScope.$on('$routeChangeStart', function(event, next) {
//		if(AuthService.hasLogin()) {
//			if($location.path() === '/signup' || $location.path() === '/login') {
//				$location.path('/user/parent/parents');
//			}
//		}else {
//			if(next.authenticate) {
//				$location.path("/login");
//			}
//		}
		
		if(!AuthService.hasLogin() && next.authenticate) {
			$location.path("/login");
		}
	});

	// configure grid
	$rootScope.gridMinHeight = 300;
	$rootScope.gridFooterTemplate = '/partials/common/grid/footerTemplate.html';
	$rootScope.gridLocale = 'zh-cn';
});