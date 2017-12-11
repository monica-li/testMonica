'use strict';

app.controller('ProjectInfoController', function ($log, $rootScope, $scope, $cookies,$http, $location,$modal, AlertService, AuthService, ProjectService) {
	$log.debug("ProjectController called.");
	$scope.operator = {};
	
	// init search condition
	$scope.condition = {};
	$scope.selectedItems = [];
	
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
	
	$scope.getProvinces = function() {
		return Object.keys($scope.geo);
	};

	$scope.getCities = function() {
		if ($scope.project && $scope.project.province) {
			return Object.keys($scope.geo[$scope.project.province]);
		}
		return [];
	};

	$scope.getDistricts = function() {
		if ($scope.project && $scope.project.province && $scope.project.city) {
			return $scope.geo[$scope.project.province][$scope.project.city];
		}
		return [];
	};
	
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
		        data: 'projects',
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
		            field: 'projectname',
		            displayName: '项目名'
		        }, {
		            field: 'user.name',
		            displayName: '所属公司'
		        },{
		            field: 'address',
		            displayName: '项目地址'
		        }, {
		            field: 'operator.user.name',
		            displayName: '操作员',
		        }, {
		            field: 'user.status',
		            displayName: '状态',
		            cellFilter: 'userStatusLocalize'
		        }]
		    };
			
		    /** function to assign data to scope */
		    $scope.setPagingData = function(data) {
		    	var projects = [];
		    	if(data){
		    		for(var i = 0; i < data.length; i++){
		    			if(data[i].id == $rootScope.project.id)
		    				projects.unshift(data[i]);
		    		}
		    	}
		        $scope.projects = projects;
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
//		    	ProjectService.count(condition).success(function(data, status, headers, config) {
//		    		$log.debug('total = ' + data.total);
//		            $scope.totalServerItems = data.total;
//		    	}).error(function(data, status, headers, config) {
//		    		AlertService.error('Failed to load company number, try again later.');
//		    	});
		    	
		    	 $scope.totalServerItems = 1;
		    	// get data
		    	ProjectService.list(condition).success(function(data, status, headers, config) {
		    		$log.debug('projects = ' + JSON.stringify(data));
		    		$scope.setPagingData(data);
//		    		$scope.project = data[0];
		    	}).error(function(data, status, headers, config) {
		    		AlertService.error('Failed to load project list, try again later.');
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
		    $scope.doOpenEditModal = function(project) {
		    	if($scope.project == null) {
		    		$scope.project = {};
		    		$scope.edit = false;
		    	}
		    	$scope.edit = true;
		        $scope.createModal = $modal({
		            scope: $scope,
		            template: 'partials/project/project/projectEditor.html',
		            backdrop: 'static'
		        });
		    };
});

app.controller('ProjectEditorController', function ($log, $rootScope, $scope, $cookies, $location, AlertService, AuthService,ProjectService) {
	$log.debug("ProjectEditorController called.");
	$scope.doSave = function() {
    	$log.debug('call save project method form '+ JSON.stringify($scope.parent));
    	$scope.submitted = true;
    	if($scope.form.$valid) {
        	if($scope.edit) {
        		$log.debug('prepare to update project');
        		ProjectService.update($scope.project).success(function(data, status, headers, config) {
        			$log.debug('update project finished: ' + JSON.stringify(data));
        			$scope.createModal.destroy();

        			var projects =[];
        			angular.copy($scope.projects, projects);
        			for(var i=0; i<projects.length; i++){
        				var project = projects[i];
        				if(project.id == data.id){
        					projects[i] = data;
        					break;
        				}
        			}
        			$scope.setPagingData(projects);
            	}).error(function(data, status, headers, config) {
            		AlertService.error('Failed to update project, try again later.');
            	});
        	}
    	}
    };
});