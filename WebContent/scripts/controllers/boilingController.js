'use strict';

app.controller('BoilingController', function ($log, $rootScope, $scope, $cookies, $location,$modal, AlertService, AuthService, ProjectService, BoilingService) {
	$log.debug("BoilingController called.");
	
	$scope.boiling = {};
	
	// init search condition
	$scope.condition = {};
	$scope.selectedItems = [];
	
	// config grid
	$scope.pagingOptions = {
		pageSizes : [ 10, 25, 50 ],
		pageSize : 10,
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
		        data: 'boilings',
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
		            field: 'NO',
		            displayName: '编号'
		        }, {
		            field: 'project.projectname',
		            displayName: '项目名称'
		        }, {
		            field: 'brand',
		            displayName: '锅炉品牌',
		        }, {
		            field: 'type',
		            displayName: '锅炉型号',
		        }, {
		            field: 'capacity',
		            displayName: '锅炉容量',
		        }, {
		            field: 'energy_consumption_high',
		            displayName: '标定能耗-高火',
		        }, {
		            field: 'energy_consumption_low',
		            displayName: '标定能耗-低火',
		        }, {
		            field: 'load_setting',
		            displayName: '负载比例',
		        }]
		    };
			
		    /** function to assign data to scope */
		    $scope.setPagingData = function(data) {
		        $scope.boilings = data;
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
		    	BoilingService.count(condition).success(function(data, status, headers, config) {
		    		$log.debug('total = ' + data.total);
		            $scope.totalServerItems = data.total;
		    	}).error(function(data, status, headers, config) {
		    		AlertService.error('Failed to load boiling number, try again later.');
		    	});
		    	
		    	// get data
		    	BoilingService.list(condition).success(function(data, status, headers, config) {
		    		$log.debug('boilings = ' + JSON.stringify(data));
		    		$scope.setPagingData(data);
		    	}).error(function(data, status, headers, config) {
		    		AlertService.error('Failed to load boilings list, try again later.');
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
		        if($scope.condition.registerDateTimeFrom)
		        	$scope.condition.registerDateTimeFrom = moment($scope.condition.registerDateTimeFrom).format('YYYY-MM-DD');
		        if($scope.condition.registerDateTimeTo)
		        	$scope.condition.registerDateTimeTo = moment($scope.condition.registerDateTimeTo).format('YYYY-MM-DD');
		        $scope.getPagedDataAsync($scope.condition, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
		    };

		    /** function to reset search condition and load data */
		    $scope.doReset = function() {
		    	$scope.condition = {};
		    	
		        $scope.getPagedDataAsync($scope.condition, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
		    };
		    
		    /** function to open editor */
		    $scope.doOpenEditModal = function(boiling) {
		    	if(boiling == null) {
		    		$scope.boling = {};
		    		$scope.edit = false;
		    	}else {
		    		$scope.boiling = boiling;
		    		$scope.edit = true;
		    	}
		        
		        $scope.createModal = $modal({
		            scope: $scope,
		            template: 'partials/project/boiling/boilingEditor.html',
		            backdrop: 'static'
		        });
		    };
});

app.controller('BoilingEditorController', function ($log, $rootScope, $scope, $cookies, $location, AlertService, AuthService,BoilingService) {
	$log.debug("BoilingEditorController called.");
	$scope.boiling.project = $rootScope.project;
	$scope.doSave = function() {
    	$log.debug('call save boiling method form '+ JSON.stringify($scope.boiling));
    	$scope.submitted = true;
    	if($scope.form.$valid) {
        	if($scope.edit) {
        		$log.debug('prepare to update boiling');
        		BoilingService.update($scope.boiling).success(function(data, status, headers, config) {
        			$log.debug('update boiling finished: ' + JSON.stringify(data));
        			$scope.createModal.destroy();

        			var boilings =[];
        			angular.copy($scope.boilings, boilings);
        			for(var i=0; i<boilings.length; i++){
        				var boiling = boilings[i];
        				if(boiling.id == data.id){
        					boilings[i] = data;
        					break;
        				}
        			}
        			$scope.setPagingData(boilings);
            	}).error(function(data, status, headers, config) {
            		AlertService.error('Failed to update boiling, try again later.');
            	});
        	}
        	else {
        		$log.debug('prepare to create boiling');
        		
        		BoilingService.create($scope.boiling).success(function(data, status, headers, config) {
        			$log.debug('create boiling finished: ' + JSON.stringify(data));
        			$scope.createModal.destroy();
        			
    				var boilings = [];
    				angular.copy($scope.boilings, boilings);
    				boilings.unshift(data);
    				if (boilings.length > $scope.pagingOptions.pageSize) {
    					boilings.pop();
    				}
    				$scope.setPagingData(boilings);
    				$scope.totalServerItems++;
    				
            	}).error(function(data, status, headers, config) {
            		if(status === 409) {
	    				$scope.error = "boiling already Exsits";
	    			}else {
	    				AlertService.error('Failed to create boiling, try again later.');
	    			}
            	});
        		
        	}
    	}
    };
});