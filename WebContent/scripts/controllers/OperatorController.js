'use strict';

app.controller('OperatorController', function ($log, $rootScope, $scope, $cookies, $location,$modal, AlertService, AuthService, OperatorService) {
	$log.debug("OperatorController called.");
	$scope.operator = {};
	
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
		        data: 'operators',
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
		            field: 'user.username',
		            displayName: '用户名'
		        }, {
		            field: 'user.name',
		            displayName: '姓名'
		        }, {
		            field: 'phone.username_number',
		            displayName: '电话号码',
		        }, {
		            field: 'registerFrom',
		            displayName: 'Register From',
		            cellFilter: 'userRegisterFromLocalize'
		        }, {
		            field: 'registerDateTime',
		            displayName: 'Register Time',
		            cellFilter: 'date: \'yyyy-MM-dd\''
		        }, {
		            field: 'user.status',
		            displayName: '状态',
		            cellFilter: 'userStatusLocalize'
		        }]
		    };
			
		    /** function to assign data to scope */
		    $scope.setPagingData = function(data) {
		        $scope.operators = data;
		        if (!$scope.$$phase) {
		            $scope.$apply();
		        }
		    };

			/** function to load data from server */
		    $scope.getPagedDataAsync = function(condition, currentPage, pageSize) {
		    	$scope.selectedItems = [];
		    	
		    	condition.start = (currentPage - 1) * pageSize;
		    	condition.length = pageSize;
		    	
		    	$log.debug('search by condition: ' + JSON.stringify(condition));
		        
		        // get data count
		    	OperatorService.count(condition).success(function(data, status, headers, config) {
		    		$log.debug('total = ' + data.total);
		            $scope.totalServerItems = data.total;
		    	}).error(function(data, status, headers, config) {
		    		AlertService.error('Failed to load company number, try again later.');
		    	});
		    	
		    	// get data
		    	OperatorService.list(condition).success(function(data, status, headers, config) {
		    		$log.debug('operators = ' + JSON.stringify(data));
		    		$scope.setPagingData(data);
		    	}).error(function(data, status, headers, config) {
		    		AlertService.error('Failed to load parent list, try again later.');
		    	});
		    };
		    
			// load data from server
		    if(AuthService.hasLogin()) {
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
		    $scope.doOpenEditModal = function(operator) {
		    	if(operator == null) {
		    		$scope.operator = {};
		    		$scope.edit = false;
		    	}else {
		    		$scope.operator = operator;
		    		$scope.edit = true;
		    	}
		        
		        $scope.createModal = $modal({
		            scope: $scope,
		            template: 'partials/user/operator/operatorEditor.html',
		            backdrop: 'static'
		        });
		    };
});

app.controller('OperatorEditorController', function ($log, $rootScope, $scope, $cookies, $location, AlertService, AuthService,OperatorService) {
	$log.debug("OperatorEditorController called.");
	$scope.doSave = function() {
    	$log.debug('call save operator method form '+ JSON.stringify($scope.parent));
    	$scope.submitted = true;
    	if($scope.form.$valid) {
        	if($scope.edit) {
        		$log.debug('prepare to update operator');
        		OperatorService.update($scope.operator).success(function(data, status, headers, config) {
        			$log.debug('update operator finished: ' + JSON.stringify(data));
        			$scope.createModal.destroy();

        			var operators =[];
        			angular.copy($scope.operators, operators);
        			for(var i=0; i<operators.length; i++){
        				var operator = operators[i];
        				if(operator.id == data.id){
        					operators[i] = data;
        					break;
        				}
        			}
        			$scope.setPagingData(operators);
            	}).error(function(data, status, headers, config) {
            		AlertService.error('Failed to update parent, try again later.');
            	});
        	}
        	else {
        		$log.debug('prepare to create operator');
        		
        		$scope.operator.user.registerFrom = 'OTHERS';
        		OperatorService.create($scope.operator).success(function(data, status, headers, config) {
        			$log.debug('create operator finished: ' + JSON.stringify(data));
        			$scope.createModal.destroy();
        			
    				var operators = [];
    				angular.copy($scope.operators, operators);
    				operators.unshift(data);
    				if (operators.length > $scope.pagingOptions.pageSize) {
    					operators.pop();
    				}
    				$scope.setPagingData(operators);
    				$scope.totalServerItems++;
    				
            	}).error(function(data, status, headers, config) {
            		if(status === 409) {
	    				$scope.error = "User already Exsits";
	    			}else {
	    				AlertService.error('Failed to create operator, try again later.');
	    			}
            	});
        		
        	}
    	}
    };
});