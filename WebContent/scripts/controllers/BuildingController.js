'use strict';

app.controller('BuildingController', function ($log, $rootScope, $scope, $cookies, $location,$modal,$http, AlertService, AuthService, ProjectService, BuildingService) {
	$log.debug("BuildingController called.");
	
	$scope.building = {};
	
	
	$scope.geo = {};
	$http.get('location1.json').success(function(data) {
	    $scope.geo = data;
	}); 
	
	$scope.geo = {};
	$http.get('location1.json').success(function(data) {
	    $scope.geo = data;
	}); 
	
	if(!$scope.geo){
		$scope.geo = {
		    	'北京' : {
		    		'北京市' : [ '东城区', '西城区', '崇文区', '宣武区', '朝阳区', '丰台区', '石景山区', '海淀区', '门头沟区', '房山区', '通州区',
		    	                '顺义区', '昌平区', '大兴区', '怀柔区', '平谷区', '密云县', '延庆县' ]
		    	},
		    	'上海' : {
		    		'上海市' : [ '浦东新区', '静安区' ]
		    	}
		    };
	}
	
	$scope.hours = ['00', '01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24'];
	
	$scope.getProvinces = function() {
		return Object.keys($scope.geo);
	};

	$scope.getCities = function() {
		if ($scope.building && $scope.building.province) {
			return Object.keys($scope.geo[$scope.building.province]);
		}
		return [];
	};

	$scope.getDistricts = function() {
		if ($scope.building && $scope.building.province && $scope.building.city) {
			return $scope.geo[$scope.building.province][$scope.building.city];
		}
		return [];
	};
    
	
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
		        data: 'buildings',
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
		            field: 'buildingname',
		            displayName: '建筑名称'
		        }, {
		            field: 'block',
		            displayName: '所属小区'
		        }, {
		            field: 'project.projectname',
		            displayName: '项目名称'
		        }, {
		            field: 'project.address',
		            displayName: '地址',
		        }]
		    };
			
		    /** function to assign data to scope */
		    $scope.setPagingData = function(data) {
		        $scope.buildings = data;
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
		    	BuildingService.count(condition).success(function(data, status, headers, config) {
		    		$log.debug('total = ' + data.total);
		            $scope.totalServerItems = data.total;
		    	}).error(function(data, status, headers, config) {
		    		AlertService.error('Failed to load company number, try again later.');
		    	});
		    	
		    	// get data
		    	BuildingService.list(condition).success(function(data, status, headers, config) {
		    		$log.debug('buildings = ' + JSON.stringify(data));
		    		$scope.setPagingData(data);
		    	}).error(function(data, status, headers, config) {
		    		AlertService.error('Failed to load building list, try again later.');
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
		    $scope.doOpenEditModal = function(building) {
		    	if(building == null) {
		    		$scope.building = {};
		    		$scope.edit = false;
		    	}else {
		    		$scope.building = building;
		    		$scope.edit = true;
		    	}
		    	$scope.building.province = $rootScope.project.province;
		    	$scope.building.city = $rootScope.project.city;
		    	$log.debug('prepare create building : ' + JSON.stringify($scope.building));
		        $scope.createModal = $modal({
		            scope: $scope,
		            template: 'partials/project/building/buildingEditor.html',
		            backdrop: 'static'
		        });
		    };
});

app.controller('BuildingEditorController', function ($log, $rootScope, $scope, $cookies, $location, AlertService, AuthService,BuildingService) {
	$log.debug("BuildingEditorController called.");
	$scope.building.project = $rootScope.project;
	$scope.building.province = $rootScope.project.province;
	$scope.building.city = $rootScope.project.city;
	
	$scope.doSave = function() {
    	$log.debug('call save building method form '+ JSON.stringify($scope.building));
    	$scope.submitted = true;
    	if($scope.form.$valid) {
        	if($scope.edit) {
        		$log.debug('prepare to update building');
        		BuildingService.update($scope.building).success(function(data, status, headers, config) {
        			$log.debug('update operator finished: ' + JSON.stringify(data));
        			$scope.createModal.destroy();

        			var buildings =[];
        			angular.copy($scope.building, buildings);
        			for(var i=0; i<buildings.length; i++){
        				var building = buildings[i];
        				if(building.id == data.id){
        					buildings[i] = data;
        					break;
        				}
        			}
        			$scope.setPagingData(buildings);
            	}).error(function(data, status, headers, config) {
            		AlertService.error('Failed to update building, try again later.');
            	});
        	}
        	else {
        		$log.debug('prepare to create building');
        		
        		BuildingService.create($scope.building).success(function(data, status, headers, config) {
        			$log.debug('create building finished: ' + JSON.stringify(data));
        			$scope.createModal.destroy();
        			
    				var buildings = [];
    				angular.copy($scope.buildings, buildings);
    				buildings.unshift(data);
    				if (buildings.length > $scope.pagingOptions.pageSize) {
    					buildings.pop();
    				}
    				$scope.setPagingData(buildings);
    				$scope.totalServerItems++;
    				
            	}).error(function(data, status, headers, config) {
            		if(status === 409) {
	    				$scope.error = "building already Exsits";
	    			}else {
	    				AlertService.error('Failed to create building, try again later.');
	    			}
            	});
        		
        	}
    	}
    };
});