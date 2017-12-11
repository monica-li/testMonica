'use strict';

app.controller('CompanyController', function ($log, $rootScope, $scope, $cookies, $location, AlertService, AuthService, CompanyService) {
	$log.debug("CompanyController called.");
	$scope.company = {};
	
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
		        data: 'companys',
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
		            field: 'username',
		            displayName: 'User Name'
		        }, {
		            field: 'name',
		            displayName: 'Name'
		        }, {
		            field: 'mobile',
		            displayName: 'Mobile',
		        }, {
		            field: 'registerFrom',
		            displayName: 'Register From',
		            cellFilter: 'userRegisterFromLocalize'
		        }, {
		            field: 'registerDateTime',
		            displayName: 'Register Time',
		            cellFilter: 'date: \'yyyy-MM-dd\''
		        }, {
		            field: 'status',
		            displayName: 'Status',
		            cellFilter: 'userStatusLocalize'
		        }]
		    };
			
		    /** function to assign data to scope */
		    $scope.setPagingData = function(data) {
		        $scope.companys = data;
		        if (!$scope.$$phase) {
		            $scope.$apply();
		        }
		    };

			/** function to load data from server */
		    $scope.getPagedDataAsync = function(condition, currentPage, pageSize) {
		    	$scope.selectedItems = [];
		    	
		    	condition.start = (currentPage - 1) * pageSize;
		    	condition.length = pageSize;
		    	condition.role = 'COMPANY';
		    	
		    	$log.debug('search by condition: ' + JSON.stringify(condition));
		        
		        // get data count
		    	CompanyService.count(condition).success(function(data, status, headers, config) {
		    		$log.debug('total = ' + data.total);
		            $scope.totalServerItems = data.total;
		    	}).error(function(data, status, headers, config) {
		    		AlertService.error('Failed to load company number, try again later.');
		    	});
		    	
		    	// get data
		    	CompanyService.list(condition).success(function(data, status, headers, config) {
		    		$log.debug('companys = ' + JSON.stringify(data));
		    		$scope.setPagingData(data);
		    	}).error(function(data, status, headers, config) {
		    		AlertService.error('Failed to load parent list, try again later.');
		    	});
		    };
		    
			// load data from server
		    if(AuthService.hasLogin()) {
		    	$scope.condition.role = 'COMPANY';
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
});