'use strict';

app.controller('DispatchCtrlController', function ($log, $rootScope, $scope, $cookies, $location,$modal, AlertService, AuthService, ProjectService, BoilingService, ControllerService,BoilingGroupService) {
	$log.debug("DispatchCtrlController called.");
	
	$scope.dispatchController = {};
	
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

		}};
		
		$scope.gridOptions = {
		        data: 'dispatchCtrls',
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
		            field: 'SN',
		            displayName: '编号'
		        }, {
		            field: 'project.projectname',
		            displayName: '项目名称'
		        },{
		        	field: 'size',
		        	displayName: '分组数量'
		        },{
		        	field: 'sns',
		        	displayName: '锅炉分组'
		        },{
		        	field: 'sms',
		        	displayName: '短信报警'
		        }, {
		            field: 'status',
		            displayName: '状态',
		            cellFilter: 'obvSiteStatusLocalize'
		        }, {
		            displayName: '操作',
		            cellTemplate: $scope.actions,
		            width: 150,
		            sortable: false
		        }]
		    };
			
		    /** function to assign data to scope */
		    $scope.setPagingData = function(data) {
		    	if(data){
		    		for(var i=0; i<data.length; i++){
	    				var controller = data[i];
	    				$log.debug('here, ' + controller.bolings);
	    				if(controller.bolings){
	    					$log.debug(JSON.stringify(controller.bolings));
	    					controller.size = controller.bolings.length;
	    					var sns = '';
	        				for(var j = 0; j < controller.bolings.length; j++){
	        					sns = sns + ',' + controller.bolings[j].NO;
	        				}
	        				controller.sns = sns.substring(1,sns.length);
	    				}
	    				data[i] = controller;
	    			}
		    	}
		        $scope.dispatchCtrls = data;
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
		    	ControllerService.count(condition).success(function(data, status, headers, config) {
		    		$log.debug('total = ' + data.total);
		            $scope.totalServerItems = data.total;
		    	}).error(function(data, status, headers, config) {
		    		AlertService.error('Failed to load controller number, try again later.');
		    	});
		    	
		    	// get dataControllerService
		    	ControllerService.list(condition).success(function(data, status, headers, config) {
		    		$log.debug('Controllers = ' + JSON.stringify(data));
		    		$scope.setPagingData(data);
		    	}).error(function(data, status, headers, config) {
		    		AlertService.error('Failed to load controller list, try again later.');
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
		    $scope.doOpenEditModal = function(dispatchController) {
		    	$scope.boilingOptions = [];
		    	BoilingGroupService.findByProjectId($scope.project.id).success(function(data, status, headers, config) {
		    		$log.debug('boilings = ' + JSON.stringify(data));
		    		
		    		if(data && data.length > 0){
		    			ControllerService.findByProjectId($scope.project.id).success(function(data1, status, headers, config){
		    				
		    				if(data1 && data1.length > 0){
			    				var occupied = [];
			    				for(var i = 0; i < data1.length; i++){
			    					$log.debug('boilinggroups = ' + JSON.stringify(data1[i]));
			    					var boilings = data1[i].bolings;
			    					if(dispatchController && data1[i].id == dispatchController){
			    						continue;
			    					}else{
			    						if(boilings && boilings.length > 0){
				    						for(var j = 0; j < boilings.length; j++){
				    							occupied.unshift(boilings[j].id);
				    						}
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
		    	
		    	if(dispatchController == null) {
		    		$scope.dispatchController = {};
		    		$scope.edit = false;
		    	}else {
		    		$scope.dispatchController = dispatchController;
		    		if($scope.dispatchController && $scope.dispatchController.bolings){
		    			var boils = [];
		    			for(var i = 0; i < $scope.dispatchController.bolings.length; i++){
		    				boils.unshift($scope.dispatchController.bolings[i].id);
		    			}
		    			$scope.dispatchController.boilings_id = boils;
		    		}
		    		$scope.edit = true;
		    	}
		        
		        $scope.createModal = $modal({
		            scope: $scope,
		            template: 'partials/project/controller/controllerEditor.html',
		            backdrop: 'static'
		        });
		    };
		    
		    $scope.showEnable = function (controller) {
		    	if (controller.status != "DEACTIVE") {
		    		return false;
		    	} else {
		    		return true;
		    	}
		    };
		    
		    $scope.doDisable = function (controller) {
		    	$scope.doDisableConfirm = function() {
			    	controller.status = "DEACTIVE";
					
			    	ControllerService.update(controller).success(function(data, status, headers, config) {
						$log.debug('deactive controller finished: ' + JSON.stringify(data));
						$scope.createModal.destroy();
						var controllers = [];
						angular.copy($scope.dispatchCtrls, controllers);
						for(var i=0; i< controllers.length; i++){
							var controller = controllers[i];
							if(controller.id == data.id){
								controllers[i] = data;
								break;
							}
						}
						$scope.setPagingData(controllers);
					}).error(function(data, status, headers, config) {
						$log.debug('error deactive controller finished: ' + JSON.stringify(data));
					});
		    	};
				
				$scope.createModal = $modal({
		    		scope: $scope,
		    		template: 'partials/common/userDisableConfirmer.html',
		    		backdrop: 'static'
		    	});
		    };
		    
		    $scope.doEnable = function (controller) {
		    	$scope.doDisableConfirm = function() {
			    	controller.status = "OFFLINE";
					
			    	OBVSiteService.update(controller).success(function(data, status, headers, config) {
						$log.debug('active controller finished: ' + JSON.stringify(data));
						$scope.createModal.destroy();
						var controllers = [];
						angular.copy($scope.dispatchCtrls, controllers);
						for(var i=0; i< controllers.length; i++){
							var controller = controllers[i];
							if(controller.id == data.id){
								controllers[i] = data;
								break;
							}
						}
						$scope.setPagingData(controllers);
					}).error(function(data, status, headers, config) {
						$log.debug('error active controller finished: ' + JSON.stringify(data));
					});
		    	};
				
				$scope.createModal = $modal({
		    		scope: $scope,
		    		template: 'partials/common/userEnableConfirmer.html',
		    		backdrop: 'static'
		    	});
		    };
});

app.controller('DisControllerEditorController', function ($log, $rootScope, $scope, $cookies, $location, AlertService, AuthService,BoilingService, ControllerService) {
	$log.debug("DisControllerEditorController called.");
	$scope.dispatchController.project = $rootScope.project;
	var boilings = [];
		
	if($scope.dispatchController.boilings_id && $scope.boilingGroup.boilings_id.length > 0){
		for(var i = 0; i <  $scope.dispatchController.boilings_id.length; i++){
			var boiling = {
					id: $scope.dispatchController.boilings_id[i]
			};
			boilings[i] = boiling;
		}
		$scope.dispatchController.bolings = boilings;
	}
	
	
	$scope.doSave = function() {
    	$log.debug('call save dispatch controller method form '+ JSON.stringify($scope.boiling));
    	$scope.submitted = true;
    	if($scope.form.$valid) {
        	if($scope.edit) {
        		$log.debug('prepare to update dispatch controller');
        		ControllerService.update($scope.dispatchController).success(function(data, status, headers, config) {
        			$log.debug('update dispatch controller finished: ' + JSON.stringify(data));
        			$scope.createModal.destroy();
        			
        			var dispatchCtrls =[];
        			angular.copy($scope.dispatchCtrls, dispatchCtrls);
        			for(var i=0; i<dispatchCtrls.length; i++){
        				var dispatchCtrl = dispatchCtrls[i];
        				if(dispatchCtrl.id == data.id){
        					dispatchCtrls[i] = data;
        					break;
        				}
        			}
        			$scope.setPagingData(dispatchCtrls);
            	}).error(function(data, status, headers, config) {
            		AlertService.error('Failed to update dispatch controller, try again later.');
            	});
        	}
        	else {
        		$log.debug('prepare to create dispatch controller');
        		
        		ControllerService.create($scope.dispatchController).success(function(data, status, headers, config) {
        			$log.debug('create dispatch controller finished: ' + JSON.stringify(data));
        			$scope.createModal.destroy();
        			
    				var dispatchCtrls = [];
    				angular.copy($scope.dispatchCtrls, dispatchCtrls);
    				dispatchCtrls.unshift(data);
    				if (dispatchCtrls.length > $scope.pagingOptions.pageSize) {
    					dispatchCtrls.pop();
    				}
    				$scope.setPagingData(dispatchCtrls);
    				$scope.totalServerItems++;
    				
            	}).error(function(data, status, headers, config) {
            		if(status === 409) {
	    				$scope.error = "dispatch controller already Exsits";
	    			}else {
	    				AlertService.error('Failed to create dispatch controller, try again later.');
	    			}
            	});
        		
        	}
    	}
    };
});

