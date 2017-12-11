'use strict';

app.controller('AppController', function($log, $rootScope, $scope, $cookies, $location, $timeout, $window, AlertService, AuthService, UserService) {
	$log.debug("AppController called.");
	
	$scope.genderOptions = [{value: 'MALE', label: 'BOY'}, {value: 'FEMALE', label: 'GIRL'}];
	$scope.userRegisterFromOptions = [{value: 'WEBSITE', label: 'WEBSITE'}, {value: 'OTHERS', label: 'OTHERS'}];
	$scope.roleOptions = [{value: 'PROJECT', label: '项目'}, {value: 'COMPANY', label: '公司'}, {value: 'OPERATOR', label: '操作员'}, {value: 'ADMIN', label: '管理员'}];
	$scope.supplyTypeOptions = [{value: 'FAN', label: '风机盘管'}, {value: 'FLOOR', label: '地板辐射'}, {value: 'RADIATOR', label: '暖气片'}];
	$scope.buildingTypeOptions = [{value: 'HIGHDEPARTMENT', label: '高层住宅'}, {value: 'MULTILEVELDEPARTMENT', label: '多层住宅'}, {value: 'HOUSE', label: '别墅'}, {value: 'HIGHOFFICE', label: '高层办公'}, {value: 'MULTILEVELOFFICE', label: '多层办公'}, {value: 'HIGHBUSINESS', label: '高层商业'}, {value: 'ELSE', label: '其他'}];
	$scope.boilingWorkStatusOptions = [{value: 'COMPLETE', label: '完成'}, {value: 'INPROGRESS', label: '执行中'}, {value: 'INTERUPTED', label: '中断执行'},{value: 'SCHEDULED', label: '预排'},{value: 'UNSCHEDULED', label: '撤销'}];
	$scope.closeConditionTypeOptions = [{value: 'GOOD', label: '好'}, {value: 'BAD', label: '差'},{value: 'NORMAL', label: '一般'}];
	
	$scope.instructionStatusOptions = [{value: 'READY', label: '准备中'}, {value: 'INPROGRESS', label: '执行中'}, {value: 'INPROGRESS', label: '执行中'}, {value: 'SUCCESS', label: '执行成功'}, {value: 'ERROR', label: '执行失败'}, {value: 'CANCLED', label: '撤销'}];
	$scope.instructionTypeOptions = [{value: 'DISPATCH', label: '下发'}, {value: 'COMPASATE', label: '补偿调节'}];
	$scope.keepConditionTypeOptions = [{value: 'GOOD', label: '好'}, {value: 'BAD', label: '差'},{value: 'NORMAL', label: '一般'}];
	
	$scope.isInsideOptions = [{value: 'INSIDE', label: '是'}, {value: 'OUTSIDE', label: '否'}];
	$scope.isTowardSunOptions = [{value: 'TOWARD', label: '是'}, {value: 'BACKWORD', label: '否'}];
	$scope.obvSiteStatusOptions = [{value: 'OFFLINE', label: '离线'}, {value: 'READY', label: '就绪'}, {value: 'ERROR', label: '异常'}];
	$scope.obvSiteLocationOptions = [{value: 'LIVINGROOM', label: '客厅'}, {value: 'DNINNINGROOM', label: '厨房'}, {value: 'BEDROOM', label: '卧室'}];
	
	$scope.monitorDataStatusOptions = [{value: 'NORMAL', label: '正常'}, {value: 'ABNOMAL', label: '异常'}];
	
	$scope.windSpeedOptions = [{value: 'LESSTHREE', label: '<3'}, {value: 'THREE', label: '3'}, {value: 'THREETOFOUR', label: '3-4'},
	                           {value: 'FOUR', label: '4'},
	                           {value: 'FOURTOFIVE', label: '4-5'},
	                           {value: 'FIVE', label: '5'},
	                           {value: 'FIVETOSIX', label: '5-6'},
	                           {value: 'SIX', label: '6'},
	                           {value: 'SIXTOSEVEN', label: '6-7'},
	                           {value: 'SEVEN', label: '7'},
	                           {value: 'SEVENTOEIGHT', label: '7-8'},
	                           {value: 'EIGHT', label: '8'},
	                           {value: 'MORETHANEIGHT', label: '.3'}
								];
	
	$scope.weatherTypeOptions = [{value: 'SUNNY', label: '晴'},
	                             {value: 'CLOUDY', label: '多云'},
	                             {value: 'OVERCASE', label: '阴天'},
	                             {value: 'SHOWER', label: '阵雨'},
	                             {value: 'SHOWERWITHICE', label: '阵雨夹冰雹'},
	                             {value: 'SHOWERWITHSNOW', label: '阵雨夹雪'},
	                             {value: 'LIGHTRAINY', label: '小雨'},
	                             {value: 'HEAVYRAINY', label: '大雨'},
	                             {value: 'STORM', label: '暴雨'},
	                             {value: 'HEAVYSTORM', label: '大暴雨'},
	                             {value: 'SNOWSHOWER', label: '大暴雨'},
	                             {value: 'SNOWSHOWER', label: '阵雪'},
	                             {value: 'LIGHTSNOW', label: '小雪'},
	                             {value: 'SNOW', label: '中雪'},
	                             {value: 'HEAVYSNOW', label: '大雪'},
	                             {value: 'BLIZZARD', label: '暴雪'},
	                             {value: 'FOG', label: '雾'},
	                             {value: 'ICERAIN', label: '冰雨'},
	                             {value: 'LIGHTRAINTORAIN', label: '小雨转中雨'},
	                             {value: 'RAINTOHEAVYRAIN', label: '中雨转大雨'},
	                             {value: 'HEAVYRAINTOSTORM', label: '大雨转暴雨'},
	                             {value: 'STORMTOHEAVYSTORM', label: '暴雨转大暴雨'},
	                             {value: 'LIGHTSNOWTOSNOW', label: '小雪转中雪'},
	                             {value: 'SNOWTOHEAVYSNOW', label: '中雪转大雪'},
	                             {value: 'HEAVYSNOWTOBLIZZARD', label: '大雪转暴雪'}];
	
	$scope.lightConditionOptions = [{value: 'SUNNY', label: '晴'},
	                             {value: 'CLOUDY', label: '多云'},
	                             {value: 'OVERCASE', label: '阴天'}];
	$scope.rainConditionOptions = [{value: 'NONE', label: '无'},
	                               {value: 'SHOWER', label: '阵雨'},
	                             {value: 'SHOWERWITHICE', label: '阵雨夹冰雹'},
	                             {value: 'SHOWERWITHSNOW', label: '阵雨夹雪'},
	                             {value: 'LIGHTRAINY', label: '小雨'},
	                             {value: 'HEAVYRAINY', label: '大雨'},
	                             {value: 'STORM', label: '暴雨'},
	                             {value: 'HEAVYSTORM', label: '大暴雨'},
	                             {value: 'SNOWSHOWER', label: '大暴雨'},
	                             {value: 'SNOWSHOWER', label: '阵雪'},
	                             {value: 'LIGHTSNOW', label: '小雪'},
	                             {value: 'SNOW', label: '中雪'},
	                             {value: 'HEAVYSNOW', label: '大雪'},
	                             {value: 'BLIZZARD', label: '暴雪'},
	                             {value: 'FOG', label: '雾'},
	                             {value: 'ICERAIN', label: '冰雨'},
	                             {value: 'LIGHTRAINTORAIN', label: '小雨转中雨'},
	                             {value: 'RAINTOHEAVYRAIN', label: '中雨转大雨'},
	                             {value: 'HEAVYRAINTOSTORM', label: '大雨转暴雨'},
	                             {value: 'STORMTOHEAVYSTORM', label: '暴雨转大暴雨'},
	                             {value: 'LIGHTSNOWTOSNOW', label: '小雪转中雪'},
	                             {value: 'SNOWTOHEAVYSNOW', label: '中雪转大雪'},
	                             {value: 'HEAVYSNOWTOBLIZZARD', label: '大雪转暴雪'}];
	
	$scope.isActive = function(route) {
		if (route === '/') {
			return $location.path() === route;
		} else {
			return $location.path().indexOf(route) === 0;
		}
	};
	
	$scope.isLogin = function() {
		return $location.path() === '/login';
	};
	
	$scope.isAdmin = function(){
		return $rootScope.role == 'ADMIN';
	};
	
	$scope.isProject = function(){
		return $rootScope.role == 'PROJECT';
	};
	
	$scope.isCompany = function(){
		return $rootScope.role == 'COMPANY';
	};
	
	$scope.isOperator = function(){
		return $rootScope.role == 'OPERATOR';
	};
	
	$scope.isSignup = function() {
		return $location.path() === '/signup';
	};
	
	$scope.hasLogin = function() {
		return AuthService.hasLogin();
	};
	
	$scope.getUserName = function() {
		return $rootScope.userName;
	};
	
	$scope.getMode = function() {
		return $rootScope.mode;
	};
	
	$scope.doLogout = function() {
		if($rootScope.userId){
			UserService.logout($rootScope.userId).success(function(data, status, headers, config) {
				$rootScope.userId = null;
				$rootScope.userName = null;
				$rootScope.userToken = null;
				
				clearCookie();
				
				$location.path('/login');
			}).error(function(data, status, headers, config) {
				AlertService.error('Failed to logout, try again later.');
	    	});
		}
	};
	
	function clearCookie() {
		delete $cookies.userUsername;
		delete $cookies.userPassword;
	};
});