'use strict';

app.controller('BoilingGroupController', function ($log, $rootScope, $scope, $cookies, $location,$modal, AlertService, AuthService, ProjectService,BoilingService, BoilingGroupService) {
	$log.debug("BoilingGroupController called.");
	
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
	/**
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
		            field: 'size',
		            displayName: "锅炉数量"
		        }, {
		            field: 'sns',
		            displayName: "锅炉编号"
		        }, {
		            field: '',
		            displayName: "状态"
		        }]
		    };
			
		    /** function to assign data to scope */
		    $scope.setPagingData = function(data) {
		    	if(data){
		    		
		    		for(var i=0; i<data.length; i++){
		    			
        				var boilinggroup = data[i];
        				$log.debug('here, ' + boilinggroup.bolings);
        				if(boilinggroup.bolings){
        					$log.debug(JSON.stringify(boilinggroup.bolings));
        					boilinggroup.size = boilinggroup.bolings.length;
        					var sns = '';
            				for(var j = 0; j < boilinggroup.bolings.length; j++){
            					sns = sns + ',' + boilinggroup.bolings[j].NO;
            				}
            				boilinggroup.sns = sns.substring(1,sns.length);
        				}
        				data[i] = boilinggroup;
        			}
		    	}
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
		    	BoilingGroupService.count(condition).success(function(data, status, headers, config) {
		    		$log.debug('total = ' + data.total);
		            $scope.totalServerItems = data.total;
		    	}).error(function(data, status, headers, config) {
		    		AlertService.error('Failed to load boilingGroup number, try again later.');
		    	});
		    	
		    	// get data
		    	BoilingGroupService.list(condition).success(function(data, status, headers, config) {
		    		$log.debug('boilings = ' + JSON.stringify(data));
		    		$scope.setPagingData(data);
		    	}).error(function(data, status, headers, config) {
		    		AlertService.error('Failed to load boiling groups list, try again later.');
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
		    $scope.doOpenEditModal = function(boilingGroup) {
		    	$scope.boilingOptions = [];
		    	BoilingService.findByProjectId($scope.project.id).success(function(data, status, headers, config) {
		    		$log.debug('boilings = ' + JSON.stringify(data));
		    		if(data && data.length > 0){
		    			BoilingGroupService.findByProjectId($scope.project.id).success(function(data1, status, headers, config){
		    				
		    				if(data1 && data1.length > 0){
			    				var occupied = [];
			    				for(var i = 0; i < data1.length; i++){
			    					$log.debug('boilinggroups = ' + JSON.stringify(data1[i]));
			    					var boilings = data1[i].bolings;
			    					if(boilings && boilings.length > 0){
			    						for(var j = 0; j < boilings.length; j++){
			    							occupied.unshift(boilings[j].id);
			    						}
			    					}
			    				}
			    				$log.debug("occupied id =" + occupied);
			    				var boilingOptions = [];
					    		for(var i = 0; i < data.length; i++){
					    			var isOcuppied = false;
					    			for(var j = 0; j < occupied.length; j++){
					    				$log.debug("dataid=" + data[i].id + " occupieid=" + occupied[j]);
					    				if(data[i].id == occupied[j]){
					    					isOcuppied = true;
					    					continue;
					    				}
					    			}
					    			if(!isOcuppied){
					    				var options = {
						    					value:data[i].id,
						    					label:data[i].NO
						    			};
						    			boilingOptions.unshift(options);
					    			}
					    		}
					    		$scope.boilingOptions = boilingOptions;

					    		$log.debug("options =" + JSON.stringify($scope.boilingOptions));
			    			}
			    		});
		    		}
		    	}).error(function(data, status, headers, config) {
		    	});
		    	if(boilingGroup == null) {
		    		$scope.bolingGroup = {};
		    		$scope.edit = false;
		    	}else {
		    		$scope.boilingGroup = boilingGroup;
		    		$scope.edit = true;
		    	}
		        
		        $scope.createModal = $modal({
		            scope: $scope,
		            template: 'partials/project/boiling/boilingGroupEditor.html',
		            backdrop: 'static'
		        });
		    };
});

app.controller('BoilingGroupEditorController', function ($log, $rootScope, $scope, $cookies, $location, AlertService, AuthService,BoilingService, BoilingGroupService) {
	$log.debug("BoilingGroupEditorController called.");
	
	$scope.doSave = function() {
    	$log.debug('call save boilingGroup method form '+ JSON.stringify($scope.boilingGroup));
    	$scope.submitted = true;
    	$scope.boilingGroup.project = $rootScope.project;
    	var boilings = [];
    	if($scope.boilingGroup.boilings_id && $scope.boilingGroup.boilings_id.length > 0){
    		for(var i = 0; i <  $scope.boilingGroup.boilings_id.length; i++){
    			var boiling = {
    					id: $scope.boilingGroup.boilings_id[i]
    			};
    			boilings[i] = boiling;
    		}
    		$scope.boilingGroup.bolings = boilings;
    	}
    	
    	if($scope.form.$valid) {
        	if($scope.edit) {
        		$log.debug('prepare to update boiling group');
        		BoilingGroupService.update($scope.boilingGroup).success(function(data, status, headers, config) {
        			$log.debug('update boiling group finished: ' + JSON.stringify(data));
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
            		AlertService.error('Failed to update boiling group, try again later.');
            	});
        	}
        	else {
        		$log.debug('prepare to create boiling group：' + JSON.stringify($scope.boilingGroup));
        		
        		BoilingGroupService.create($scope.boilingGroup).success(function(data, status, headers, config) {
        			$log.debug('create boiling group finished: ' + JSON.stringify(data));
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
	    				$scope.error = "boiling group already Exsits";
	    			}else {
	    				AlertService.error('Failed to create boiling group, try again later.');
	    			}
            	});
        		
        	}
    	}
    };
});