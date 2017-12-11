'use strict';

app.controller('ObvsiteController', function ($log, $rootScope, $scope, $cookies, $location,$modal, $http, AlertService, AuthService, OBVSiteService, BuildingService) {
	$log.debug("ObvsiteController called.");
	$scope.obvsite = {};
	
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
		if ($scope.obvsite && $scope.obvsite.province) {
			return Object.keys($scope.geo[$scope.obvsite.province]);
		}
		return [];
	};

	$scope.getDistricts = function() {
		if ($scope.obvsite && $scope.obvsite.province && $scope.obvsite.city) {
			return $scope.geo[$scope.obvsite.province][$scope.obvsite.city];
		}
		return [];
	};
    
	
	// init search condition
	$scope.condition = {};
	$scope.selectedItems = [];
	
	// config grid
	$scope.pagingOptions = {
		pageSizes : [ 10, 25, 50 ],
		pageSize : 25,
		currentPage : 1
	};
   
	$scope.actions = 
		'<div class="vk-grid-actions">\
			<select data-ng-model="COL_FIELD" data-ng-change="doGotoActionForEntity(row.entity);COL_FIELD=\'\'">\
				<option value="">-选择操作-</option>\
				<option value="edit">编辑</option>\
				<option data-ng-if="showEnable(row.entity)" value="enable">启用</option>\
				<option data-ng-if="!showEnable(row.entity)" value="disable">停用</option>\
		    </select>\
		 </div>';
	
	$scope.doGotoActionForEntity = function (entity) {
		$log.debug("the entity is " + JSON.stringify(entity["undefined"]));
		var select = entity["undefined"];
		
		switch (select) {
			case 'edit':
				$scope.doOpenUpdateModal(entity);
				break;
			case 'enable':
				$scope.doEnable(entity);
				break;
			case 'disable':
				$scope.doDisable(entity);
				break;

		}};
		
		$scope.gridOptions = {
		        data: 'obvsites',
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
		            displayName: '序号'
		        }, {
		            field: 'block',
		            displayName: '小区名称'
		        }, {
		            field: 'building.buildingname',
		            displayName: '建筑名称'
		        }, {
		            field: 'project.address',
		            displayName: '地址'
		        }, {
		            field: 'unit',
		            displayName: '单元号'
		        }, {
		            field: 'room',
		            displayName: '房间号'
		        }, {
		            field: 'isInside',
		            displayName: '是否室内',
		            cellFilter: 'isInsideLocalize'
		        }, {
		            field: 'isTowardSun',
		            displayName: '是否朝阳',
		            cellFilter: 'isTowardSunLocalize'
		        }, {
		            field: 'sms',
		            displayName: '报警电话'
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
		        $scope.obvsites = data;
		        if (!$scope.$$phase) {
		            $scope.$apply();
		        }
		    };

			/** function to load data from server */
		    $scope.getPagedDataAsync = function(condition, currentPage, pageSize) {
		    	$scope.selectedItems = [];
		    	
		    	condition.start = (currentPage - 1) * pageSize;
		    	condition.length = pageSize;
		    	condition.projectId = $rootScope.project.id;
		    	
		    	$log.debug('search by condition: ' + JSON.stringify(condition));
		        
		        // get data count
		    	OBVSiteService.count(condition).success(function(data, status, headers, config) {
		    		$log.debug('total = ' + data.total);
		            $scope.totalServerItems = data.total;
		    	}).error(function(data, status, headers, config) {
		    		AlertService.error('Failed to load company number, try again later.');
		    	});
		    	
		    	// get data
		    	OBVSiteService.list(condition).success(function(data, status, headers, config) {
		    		$log.debug('obvsites = ' + JSON.stringify(data));
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
		    $scope.doOpenInsideEditModal = function(obvsite) {
		    	$scope.buildingOptions = [];
		    	BuildingService.findByProjectId($rootScope.project.id).success(function(data, status, headers, config) {
		    		$log.debug('buildings = ' + JSON.stringify(data));
		    		for(var i=0; i<data.length; i++){
		    			var option = {value: data[i].id, label: data[i].buildingname};
			    		$scope.buildingOptions.push(option);
		    		}
		    		$log.debug('options = ' + JSON.stringify($scope.buildingOptions));
		    		
		    	}).error(function(data, status, headers, config) {
		    		AlertService.error('Failed to load building list, try again later.');
		    	});
		    	if(obvsite == null) {
		    		$scope.obvsite = {};
		    		$scope.edit = false;
		    	}else {
		    		$scope.obvsite = obvsite;
		    		$scope.edit = true;
		    	}
		        $scope.obvsite.province = $rootScope.project.province;
		        $scope.obvsite.city = $rootScope.project.city;
		        $scope.obvsite.isInside = 'INSIDE';
		        
		        $scope.createModal = $modal({
		            scope: $scope,
		            template: 'partials/project/obvsite/insideObvSiteEditor.html',
		            backdrop: 'static'
		        });
		    };
		    
		    /** function to open editor */
		    $scope.doOpenEditModal = function(obvsite) {
		    	$scope.buildingOptions = [];
		    	BuildingService.findByProjectId($rootScope.project.id).success(function(data, status, headers, config) {
		    		$log.debug('buildings = ' + JSON.stringify(data));
		    		for(var i=0; i<data.length; i++){
		    			var option = {value: data[i].id, label: data[i].buildingname};
			    		$scope.buildingOptions.push(option);
		    		}
		    		$log.debug('options = ' + JSON.stringify($scope.buildingOptions));
		    		
		    	}).error(function(data, status, headers, config) {
		    		AlertService.error('Failed to load building list, try again later.');
		    	});
		    	if(obvsite == null) {
		    		$scope.obvsite = {};
		    		$scope.edit = false;
		    	}else {
		    		$scope.obvsite = obvsite;
		    		$scope.edit = true;
		    	}
		    	$scope.obvsite.province = $rootScope.project.province;
		        $scope.obvsite.city = $rootScope.project.city;
		        $scope.obvsite.isInside = 'OUTSIDE';
		        
		        $scope.createModal = $modal({
		            scope: $scope,
		            template: 'partials/project/obvsite/obvsiteEditor.html',
		            backdrop: 'static'
		        });
		    };
		    
		    /** function to open editor */
		    $scope.doOpenUpdateModal = function(obvsite) {
		    	
		    	$scope.buildingOptions = [];
		    	BuildingService.findByProjectId($rootScope.project.id).success(function(data, status, headers, config) {
		    		$log.debug('buildings = ' + JSON.stringify(data));
		    		for(var i=0; i<data.length; i++){
		    			var option = {value: data[i].id, label: data[i].buildingname};
			    		$scope.buildingOptions.push(option);
		    		}
		    		$log.debug('options = ' + JSON.stringify($scope.buildingOptions));
		    		
		    	}).error(function(data, status, headers, config) {
		    		AlertService.error('Failed to load building list, try again later.');
		    	});
		    	if(obvsite == null) {
		    		$scope.obvsite = {};
		    		$scope.edit = false;
		    	}else {
		    		$scope.obvsite = obvsite;
		    		$scope.edit = true;
		    	}
		    	if( $scope.obvsite.isInside == 'OUTSIDE'){
		    		$scope.createModal = $modal({
			            scope: $scope,
			            template: 'partials/project/obvsite/obvsiteEditor.html',
			            backdrop: 'static'
			        });
		    	}
		    	if( $scope.obvsite.isInside == 'INSIDE'){
		    		$scope.createModal = $modal({
			            scope: $scope,
			            template: 'partials/project/obvsite/insideObvSiteEditor.html',
			            backdrop: 'static'
			        });
		    	}
		        
		        
		    };
		    
		    $scope.showEnable = function (obvsite) {
		    	if (obvsite.status != "DEACTIVE") {
		    		return false;
		    	} else {
		    		return true;
		    	}
		    };
		    
		    $scope.doDisable = function (obvsite) {
		    	$scope.doDisableConfirm = function() {
			    	obvsite.status = "DEACTIVE";
					
			    	OBVSiteService.update(obvsite).success(function(data, status, headers, config) {
						$log.debug('deactive obvsite finished: ' + JSON.stringify(data));
						$scope.createModal.destroy();
						var obvsites = [];
						angular.copy($scope.obvsites, obvsites);
						for(var i=0; i<obvsites.length; i++){
							var obvsite = obvsites[i];
							if(obvsite.id == data.id){
								obvsites[i] = data;
								break;
							}
						}
						$scope.setPagingData(obvsites);
					}).error(function(data, status, headers, config) {
						$log.debug('error deactive obvsite finished: ' + JSON.stringify(data));
					});
		    	};
				
				$scope.createModal = $modal({
		    		scope: $scope,
		    		template: 'partials/common/userDisableConfirmer.html',
		    		backdrop: 'static'
		    	});
		    };
		    
		    $scope.doEnable = function (obvsite) {
		    	$scope.doDisableConfirm = function() {
			    	obvsite.status = "OFFLINE";
					
			    	OBVSiteService.update(obvsite).success(function(data, status, headers, config) {
						$log.debug('active obvsite finished: ' + JSON.stringify(data));
						$scope.createModal.destroy();
						var obvsites = [];
						angular.copy($scope.obvsites, obvsites);
						for(var i=0; i<obvsites.length; i++){
							var obvsite = obvsites[i];
							if(obvsite.id == data.id){
								obvsites[i] = data;
								break;
							}
						}
						$scope.setPagingData(obvsites);
					}).error(function(data, status, headers, config) {
						$log.debug('error active obvsite finished: ' + JSON.stringify(data));
					});
		    	};
				
				$scope.createModal = $modal({
		    		scope: $scope,
		    		template: 'partials/common/userEnableConfirmer.html',
		    		backdrop: 'static'
		    	});
		    };
});

app.controller('ObvsiteEditorController', function ($log, $rootScope, $scope, $cookies, $location, AlertService, AuthService,OBVSiteService, BuildingService) {
	$log.debug("ObvsiteEditorController called.");
	$scope.obvsite.project = $rootScope.project;
	$scope.doSave = function() {
    	
    	$scope.submitted = true;
    	if($scope.form.$valid) {
    		if($scope.obvsite.building && $scope.obvsite.building.id > 0){
    			BuildingService.find($scope.obvsite.building.id).success(function(data, status, headers, config) {
    	    		$log.debug('buildings = ' + JSON.stringify(data));
    	    		$scope.obvsite.builing = data;
    	    		if(data){
            			
            			$scope.obvsite.district = data.district;
            			$scope.obvsite.block = data.block;
            		}
    	    		$log.debug('call save obvsite method form '+ JSON.stringify($scope.obvsite));
    	        	if($scope.edit) {
    	        		$log.debug('prepare to update obvsite');
    	        		
    	        		OBVSiteService.update($scope.obvsite).success(function(data, status, headers, config) {
    	        			$log.debug('update obvsite finished: ' + JSON.stringify(data));
    	        			$scope.createModal.destroy();

    	        			var obvsites =[];
    	        			angular.copy($scope.obvsites, obvsites);
    	        			for(var i=0; i<obvsites.length; i++){
    	        				var obvsite = obvsites[i];
    	        				if(obvsite.id == data.id){
    	        					obvsites[i] = data;
    	        					break;
    	        				}
    	        			}
    	        			$scope.setPagingData(obvsites);
    	            	}).error(function(data, status, headers, config) {
    	            		AlertService.error('Failed to update obvsite, try again later.');
    	            	});
    	        	}
    	        	else {
    	        		$log.debug('prepare to create obvsite');
    	        		
    	        		OBVSiteService.create($scope.obvsite).success(function(data, status, headers, config) {
    	        			$log.debug('create building finished: ' + JSON.stringify(data));
    	        			$scope.createModal.destroy();
    	        			
    	    				var obvsites = [];
    	    				angular.copy($scope.obvsites, obvsites);
    	    				obvsites.unshift(data);
    	    				if (obvsites.length > $scope.pagingOptions.pageSize) {
    	    					obvsites.pop();
    	    				}
    	    				$scope.setPagingData(obvsites);
    	    				$scope.totalServerItems++;
    	    				
    	            	}).error(function(data, status, headers, config) {
    	            		if(status === 409) {
    		    				$scope.error = "obvsite already Exsits";
    		    			}else {
    		    				AlertService.error('Failed to create obvsite, try again later.');
    		    			}
    	            	});
    	        		
    	        	}
    	    		
    	    	}).error(function(data, status, headers, config) {
    	    		AlertService.error('Failed to load building list, try again later.');
    	    	});
    		}else{
    			$log.debug('call save obvsite method form '+ JSON.stringify($scope.obvsite));
            	if($scope.edit) {
            		$log.debug('prepare to update obvsite');
            		
            		OBVSiteService.update($scope.obvsite).success(function(data, status, headers, config) {
            			$log.debug('update obvsite finished: ' + JSON.stringify(data));
            			$scope.createModal.destroy();

            			var obvsites =[];
            			angular.copy($scope.obvsite, obvsites);
            			for(var i=0; i<obvsites.length; i++){
            				var obvsite = obvsites[i];
            				if(obvsite.id == data.id){
            					obvsites[i] = data;
            					break;
            				}
            			}
            			$scope.setPagingData(buildings);
                	}).error(function(data, status, headers, config) {
                		AlertService.error('Failed to update obvsite, try again later.');
                	});
            	}
            	else {
            		$log.debug('prepare to create obvsite');
            		
            		OBVSiteService.create($scope.obvsite).success(function(data, status, headers, config) {
            			$log.debug('create building finished: ' + JSON.stringify(data));
            			$scope.createModal.destroy();
            			
        				var obvsites = [];
        				angular.copy($scope.obvsites, obvsites);
        				obvsites.unshift(data);
        				if (obvsites.length > $scope.pagingOptions.pageSize) {
        					obvsites.pop();
        				}
        				$scope.setPagingData(obvsites);
        				$scope.totalServerItems++;
        				
                	}).error(function(data, status, headers, config) {
                		if(status === 409) {
    	    				$scope.error = "obvsite already Exsits";
    	    			}else {
    	    				AlertService.error('Failed to create obvsite, try again later.');
    	    			}
                	});
            		
            	}
    			
    		}
    		
    		

    	}
    };
});
