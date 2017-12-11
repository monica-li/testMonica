'use strict';

app.controller('SessionDatasController', function ($log, $rootScope, $scope, $cookies, $location,$modal, AlertService, AuthService, ProjectService, SessionService) {
	$log.debug("SessionDatasController called.");
	
	$scope.sessionData = {};
	
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
		        data: 'sessionDatas',
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
		            field: 'project.projectname',
		            displayName: '项目名称'
		        }, {
		            field: 'session_start_time',
		            displayName: '开始时间',
		            cellFilter: 'date: \'yyyy-MM-dd HH:mm:ss\''
		        }, {
		            field: 'session_end_time',
		            displayName: '结束时间',
		            cellFilter: 'date: \'yyyy-MM-dd HH:mm:ss\''
		        }, {
		            field: 'session_cost',
		            displayName: '燃气用量',
		        }]
		    };
			
		    /** function to assign data to scope */
		    $scope.setPagingData = function(data) {
		        $scope.sessionDatas = data;
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
		    	SessionService.count(condition).success(function(data, status, headers, config) {
		    		$log.debug('total = ' + data.total);
		            $scope.totalServerItems = data.total;
		    	}).error(function(data, status, headers, config) {
		    		AlertService.error('Failed to load session datas number, try again later.');
		    	});
		    	
		    	// get data
		    	SessionService.list(condition).success(function(data, status, headers, config) {
		    		$log.debug('sessionDatas = ' + JSON.stringify(data));
		    		$scope.setPagingData(data);
		    	}).error(function(data, status, headers, config) {
		    		AlertService.error('Failed to load session datas list, try again later.');
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
		        if($scope.condition.dateTimeTo)
		        	$scope.condition.dateTimeTo = moment($scope.condition.dateTimeTo).format('YYYY-MM-DD');
		        $scope.getPagedDataAsync($scope.condition, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
		    };

		    /** function to reset search condition and load data */
		    $scope.doReset = function() {
		    	$scope.condition = {};
		    	
		        $scope.getPagedDataAsync($scope.condition, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
		    };
		    
		    /** function to open editor */
		    $scope.doOpenEditModal = function(session) {
		    	if(session == null) {
		    		$scope.session = {};
		    		$scope.edit = false;
		    	}else {
		    		$scope.session = session;
		    		$scope.edit = true;
		    	}
		        
		        $scope.createModal = $modal({
		            scope: $scope,
		            template: 'partials/operate/sessiondata/sessionEditor.html',
		            backdrop: 'static'
		        });
		    };
	
});

app.controller('SessionEditorController', function ($log, $rootScope, $scope, $cookies, $location, AlertService, AuthService,ProjectService, SessionService) {
	$log.debug("ProjectEditorController called.");
	
	
    
	$scope.isNew = function(){
		if($scope.edit) 
			return false;
		else
			return true;
	};
	
	$scope.doSave = function() {
    	$log.debug('call save session method form '+ JSON.stringify($scope.session));
    	$scope.submitted = true;
    	$scope.session.project = $rootScope.project;
    	
    	if ($scope.session.session_start_time && ($scope.session.session_start_time instanceof Date)) {
    		$scope.session.session_start_time = $scope.session.session_start_time.getTime();
    	}
    	if ($scope.session.session_end_time && ($scope.session.session_end_time instanceof Date)) {
    		$scope.session.session_end_time = $scope.session.session_end_time.getTime();
    	}
    	if($scope.form.$valid) {
        	if($scope.edit) {
        		$log.debug('prepare to update project');
        		SessionService.update($scope.session).success(function(data, status, headers, config) {
        			$log.debug('update session finished: ' + JSON.stringify(data));
        			$scope.createModal.destroy();

        			var sessions =[];
        			angular.copy($scope.sessionDatas, sessions);
        			for(var i=0; i<sessions.length; i++){
        				var session = sessions[i];
        				if(session.id == data.id){
        					sessions[i] = data;
        					break;
        				}
        			}
        			$scope.setPagingData(sessions);
            	}).error(function(data, status, headers, config) {
            		AlertService.error('Failed to update session, try again later.');
            	});
        	}
        	else {
        		$log.debug('prepare to create session');
        		SessionService.create($scope.session).success(function(data, status, headers, config) {
        			$log.debug('create session finished: ' + JSON.stringify(data));
        			$scope.createModal.destroy();
        			
    				var sessions = [];
    				angular.copy($scope.sessionDatas, sessions);
    				sessions.unshift(data);
    				if (sessions.length > $scope.pagingOptions.pageSize) {
    					sessions.pop();
    				}
    				$scope.setPagingData(sessions);
    				$scope.totalServerItems++;
    				
            	}).error(function(data, status, headers, config) {
            		if(status === 409) {
	    				$scope.error = "session already Exsits";
	    			}else {
	    				AlertService.error('Failed to create session, try again later.');
	    			}
            	});
        		
        	}
    	}
    };
});
