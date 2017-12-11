'use strict';

app.controller('StatusSummaryController', function ($log, $rootScope, $scope, $cookies, $q, $location,$modal, $interval, AlertService, AuthService, ProjectService, BoilingService, WMonitorDatasService, MonitorDatasService, BoilingWorkService, MetaMonitorDataService, MetaWMonitorDataService, RunningDataService, ControllerService, DayDataService) {
	$log.debug("StatusSummaryController called.");
	
	//室外监控数据
	$scope.wMonitorData = {};
	
	//室内监控数据
	$scope.monitorData = {};
	
	//今日能耗详细
	$scope.runningDatas = [];
	
	//控制器数据
	$scope.boilingWorks = [];
	
	//锅炉数据
	$scope.boilings = [];
	
	//日数据
	$scope.dayDatas = [];
	$scope.controllers = [];
	
	$scope.condition = {};
	
	//加载数据
	$scope.loadDatas = function(){
		$log.debug('load summary datas...');
		loadMonitorData();
		loadRunningData();
		loadControllers();
		loadBoiling();
		loadDayDatas();
	};
	
	$scope.loadDatas();
	
	function loadMonitorData(){
		$log.debug('start load monitor datas...');
		$scope.condition.projectId = $rootScope.project.id;
		MetaMonitorDataService.findCurrentMonitorData($scope.condition).success(function(data, status, headers, config) {
			$log.debug('load monitor data:' + JSON.stringify(data));
			$scope.monitorData = data;
		}).error(function(data, status,headers, config){
			$log.debug('load monitor data error:' + JSON.stringify(data));
		});
		MetaWMonitorDataService.findCurrentMonitorData($scope.condition).success(function(data, status, headers, config) {
			$log.debug('load wmonitor data:' + JSON.stringify(data));
			$scope.wMonitorData = data;
		}).error(function(data, status,headers, config){
			$log.debug('load wMonitorData error:' + JSON.stringify(data));
		});
		$log.debug('end load monitor datas...');
	};
	
	function loadRunningData(){
		$log.debug('start load running datas...');
		var time = new Date();
		RunningDataService.listCurrentDayRunningDatas($rootScope.project.id).success(function(data, status, headers, config) {
			$log.debug("load running datas:" + JSON.stringify(data));
			$scope.runningDatas = data;
		}).error(function(data, status,headers, config){
			$log.debug('load running datas error:' + JSON.stringify(data));
		});
		$log.debug('end load running datas');
	};
	
	function loadControllers(){
		$log.debug('start load boiling works...');
		ControllerService.findByProjectId($rootScope.project.id).success(function(data, status, headers, config) {
			$log.debug('load controller data:' + JSON.stringify(data));
			$scope.controllers = data;
		}).error(function(data, status,headers, config){
			$log.debug('load controller error:' + JSON.stringify(data));
		});
		$log.debug('end load boiling work.');
	};
	
	function loadBoiling(){
		$log.debug('start load boiling...');
		BoilingService.listBoilingWorkStatus($rootScope.project.id).success(function(data, status, headers, config) {
			$log.debug("load boilings:" + JSON.stringify(data));
			$scope.boilings = data;
		}).error(function(data, status,headers, config){
			$log.debug('load boiling error:' + JSON.stringify(data));
		});
		$log.debug('end load boiling');
	};
	
	function loadDayDatas(){
		$log.debug('start load day datas...');
		var timeTo = moment().format('YYYY-MM-DD');
		var timeFrom = moment().add('days', -5);
		moment().format('YYYY-MM-DD');
		var condition = {projectId : $rootScope.project.id,
						 timeFrom : timeFrom,
						 timeTo : timeTo};
		DayDataService.listByProject(condition).success(function(data, status, headers, config) {
			$log.debug('load day datas:' + JSON.stringify(data));
			$scope.dayDatas = data;
			
		}).error(function(data, status,headers, config){
			$log.debug('load day datas error:' + JSON.stringify(data));
		});
		$log.debug('end load day datas');
	};
	
	var timer = $interval(function(){
		loadMonitorData();
		loadRunningData();
		loadControllers();
		loadBoiling();
		loadDayDatas();
	},180000, -1);
	timer.then(success, error, notify);
	function success(){
		console.log("done");
	}
	
	function error(){
		console.log("error");
	}
	function notify(){
		console.log("每次都更新");
	}
	
	$scope.doOpenAddConfirmer = function(project) {
		$scope.project = project;
		
		$scope.createModal = $modal({
			scope: $scope,
			template: 'partials/project/statussummary/addConfirmer.html',
	    	backdrop: 'static'
	    });
	};
	
});

app.controller('InterventionEditorController', function ($log, $rootScope, $scope, $cookies, $location, AlertService, AuthService,InterventionService) {
	$log.debug("InterventionEditorController called.");
	$scope.boiling.project = $rootScope.project;
	$scope.doSave = function() {
    	$log.debug('call save intervention method form '+ JSON.stringify($scope.intervention));
    	$scope.submitted = true;
    	if($scope.form.$valid) {
        	
        	$log.debug('prepare to create intervention');
        		
        	InterventionService.set($scope.intervention).success(function(data, status, headers, config) {
        		$log.debug('create intervention finished: ' + JSON.stringify(data));
        		$scope.createModal.destroy();
        		AlertService.info("设置成功!");
    				
            }).error(function(data, status, headers, config) {
            	if(status === 409) {
	    			$scope.error = "boiling already Exsits";
	    		}else {
	    			AlertService.error('Failed to create intervention, try again later.');
	    		}
           	});	
    	}
    };
});