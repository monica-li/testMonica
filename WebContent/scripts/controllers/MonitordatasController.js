'use strict';

app.controller('MonitordatasController', function ($log, $rootScope, $scope,$http, $cookies, $location, AlertService, AuthService, MonitorDatasService) {
	$log.debug("MonitordatasController called.");
	$scope.wMonitorData = {};
	
	// init search condition
	$scope.condition = {};
	$scope.selectedItems = [];
	
	// config grid
	$scope.pagingOptions = {
		pageSizes : [ 10, 25, 50 ],
		pageSize : 25,
		currentPage : 1
	};
    /**
	$scope.actions = 
		'<div class="vk-grid-actions">\
			<select data-ng-model="COL_FIELD" data-ng-change="doGotoActionForEntity(row.entity);COL_FIELD=\'\'">\
				<option value="">-Select Actions-</option>\
				<option value="edit">Edit</option>\
				<option data-ng-if="showEnable(row.entity)" value="enable">Enable</option>\
				<option data-ng-if="!showEnable(row.entity)" value="disable">Disable</option>\
				<option data-ng-if="!showEnable(row.entity)" value="purchase">Purchase</option>\
				<option value="reset_passwd">Reset Password</option>\
		    </select>\
		 </div>';
	
	$scope.doGotoActionForEntity = function (entity) {
		$log.debug("the entity is " + JSON.stringify(entity["undefined"]));
		var select = entity["undefined"];
		
		switch (select) {
			case 'edit':
				$scope.doOpenEditModal(entity);
				break;
			case 'enable':
				$scope.doEnable(entity);
				break;
			case 'disable':
				$scope.doDisable(entity);
				break;

		}};*/
		
		$scope.gridOptions = {
		        data: 'monitorDatas',
		        enablePaging: true,
		        showFooter: true,
		        totalServerItems: 'totalServerItems',
		        pagingOptions: $scope.pagingOptions,
		        selectedItems: $scope.selectedItems,
		        maintainColumnRatios: false,
		        showSelectionCheckbox: true,
		        selectWithCheckboxOnly: true,
		        enableColumnResize : true,
		        plugins: [new ngGridFlexibleHeightPlugin({ minHeight: $rootScope.gridMinHeight })],
		        footerTemplate: $rootScope.gridFooterTemplate,
		        i18n: $rootScope.gridLocale,
		        columnDefs: [{
		            field: 'rec_time',
		            displayName: '时间',
		            cellFilter: 'date: \'yyyy-MM-dd HH:mm:ss\''
		        },{
		            field: 'obvSite.SN',
		            displayName: '监控点编号'
		        },{
		            field: 'obvSite.block',
		            displayName: '小区'
		        },{
		            field: 'obvSite.building.buildingname',
		            displayName: '楼号'
		        },{
		            field: 'obvSite.unit',
		            displayName: '单元号'
		        },{
		            field: 'obvSite.room',
		            displayName: '房间号'
		        },{
		            field: 'obvSite.location',
		            displayName: '位置',
		            cellFilter:'OBVLocationLocalize'
		        }, {
		            field: 'temprature',
		            displayName: '温度'
		        }, {
		            field: 'humidity',
		            displayName: '湿度',
		        }, {
		            field: 'light',
		            displayName: '光照',
		        }, {
		            field: 'status',
		            displayName: '状态',
		            cellFilter:'monitorDataStatus'
		        }]
		    };
			
		    /** function to assign data to scope */
		    $scope.setPagingData = function(data) {
		        $scope.monitorDatas = data;
		        if (!$scope.$$phase) {
		            $scope.$apply();
		        }
		    };

			/** function to load data from server */
		    $scope.getPagedDataAsync = function(condition, currentPage, pageSize) {
		    	$scope.selectedItems = [];
		    	
		    	$log.debug('current project = ' + JSON.stringify($rootScope.project));
		    	condition.start = (currentPage - 1) * pageSize;
		    	condition.length = pageSize;
		    	condition.projectId = $rootScope.project.id;
		    	
		    	$log.debug('search by condition: ' + JSON.stringify(condition));
		        
		        // get data count
		    	MonitorDatasService.count(condition).success(function(data, status, headers, config) {
		    		$log.debug('total = ' + data.total);
		            $scope.totalServerItems = data.total;
		    	}).error(function(data, status, headers, config) {
		    		AlertService.error('Failed to load datas number, try again later.');
		    	});
		    	
		    	// get data
		    	MonitorDatasService.list(condition).success(function(data, status, headers, config) {
		    		$log.debug('wMonitorDatas = ' + JSON.stringify(data));
		    		$scope.setPagingData(data);
		    	}).error(function(data, status, headers, config) {
		    		AlertService.error('Failed to load wMonitorDatas list, try again later.');
		    	});
		    };
		    
			// load data from server
		    if(AuthService.hasLogin()) {
		    	$scope.condition.projectId = $rootScope.project.id;
		    	$scope.getPagedDataAsync($scope.condition, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
		    };
		    
		    /** function to watch paging changes */
		    $scope.$watch('pagingOptions', function(newVal, oldVal) {
		        if (newVal !== oldVal && (newVal.currentPage !== oldVal.currentPage || newVal.pageSize !== oldVal.pageSize)) {
		        	$scope.getPagedDataAsync($scope.condition, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
		        }
		    }, true);
		    
		    /** function to load data from server base on the search condition */
		    $scope.doSearch = function() {
		        $log.debug('search with filter: ' + JSON.stringify($scope.condition));
		        if($scope.condition.dateTimeFrom)
		        	$scope.condition.dateTimeFrom = moment($scope.condition.dateTimeFrom).format('YYYY-MM-DD');
		        if($scope.condition.dateTimeTo){
		        	$scope.condition.dateTimeTo = moment($scope.condition.dateTimeTo).format('YYYY-MM-DD');
		        }
		        	
		        $scope.getPagedDataAsync($scope.condition, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
		    };

		    /** function to reset search condition and load data */
		    $scope.doReset = function() {
		    	$scope.condition = {};
		    	
		        $scope.getPagedDataAsync($scope.condition, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
		    };
		    
		    $scope.doExport = function () {
		    	 $log.debug('search with filter: ' + JSON.stringify($scope.condition));
			        if($scope.condition.dateTimeFrom)
			        	$scope.condition.dateTimeFrom = moment($scope.condition.dateTimeFrom).format('YYYY-MM-DD');
			        if($scope.condition.dateTimeTo){
			        	$scope.condition.dateTimeTo = moment($scope.condition.dateTimeTo).format('YYYY-MM-DD');
			        }
	            $http.post("http://47.92.123.34:8080/api/private/ry/monitordata/export", 
	            	$scope.condition, 
	            	{responseType: 'arraybuffer'}).success(function (data) {  
	                var blob = new Blob([data], {type: "application/vnd.ms-excel"});  
	                var fileName = "monitorData.xls";  
	                var a = document.createElement("a");
	                document.body.appendChild(a);  
	                a.download = fileName;  
	                a.href = URL.createObjectURL(blob);  
	                a.click();  
	            });  
	        };
});