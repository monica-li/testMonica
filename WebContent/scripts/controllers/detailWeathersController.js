'use strict';

app.controller('DetailWeathersController', function ($log, $rootScope, $scope, $cookies, $location, $modal, $http, AlertService, AuthService, WeatherService) {
	$log.debug("DetailWeathersController called.");
	$scope.weather = {};
	
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
		if ($scope.weather && $scope.weather.province) {
			return Object.keys($scope.geo[$scope.weather.province]);
		}
		return [];
	};

	$scope.getDistricts = function() {
		if ($scope.weather && $scope.weather.province && $scope.weather.city) {
			return $scope.geo[$scope.weather.province][$scope.weather.city];
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
				<option value="edit">删除</option>\
		    </select>\
		 </div>';
	
	$scope.doGotoActionForEntity = function (entity) {
		$log.debug("the entity is " + JSON.stringify(entity["undefined"]));
		var select = entity["undefined"];
		
		switch (select) {
			case 'edit':
				$scope.doOpenDeleteModal(entity);
				break;

		}};
		
		$scope.gridOptions = {
		        data: 'weatherDatas',
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
		            field: 'time',
		            displayName: '时间',
		            cellFilter: 'date: \'yyyy-MM-dd HH:mm:ss\''
		        },{
		            field: 'province',
		            displayName: '省'
		        },{
		            field: 'city',
		            displayName: '城市'
		        },{
		            field: 'district',
		            displayName: '区'
		        },{
		            field: 'street',
		            displayName: '街道'
		        }, {
		            field: 'temprature',
		            displayName: '温度'
		        }, {
		            field: 'humidity',
		            displayName: '湿度',
		        }, {
		            displayName: '操作',
		            cellTemplate: $scope.actions,
		            width: 150,
		            sortable: false
		        }]
		    };
			
		    /** function to assign data to scope */
		    $scope.setPagingData = function(data) {
		        $scope.weatherDatas = data;
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
		    	condition.type = 'RAW';
		    	condition.projectId = 0;
		    	
		    	$log.debug('search detail by condition: ' + JSON.stringify(condition));
		        
		        // get data count
		    	WeatherService.count(condition).success(function(data, status, headers, config) {
		    		$log.debug('total = ' + data.total);
		            $scope.totalServerItems = data.total;
		    	}).error(function(data, status, headers, config) {
		    		AlertService.error('Failed to load datas number, try again later.');
		    	});
		    	
		    	// get data
		    	WeatherService.list(condition).success(function(data, status, headers, config) {
		    		$log.debug('wMonitorDatas = ' + JSON.stringify(data));
		    		$scope.setPagingData(data);
		    	}).error(function(data, status, headers, config) {
		    		AlertService.error('Failed to load weather list, try again later.');
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
		    
		    $scope.doOpenDeleteModal = function (weather) {
		    	$scope.doDelete = function() {
					
			    	WeatherService.del(weather).success(function(data, status, headers, config) {
						$log.debug('deactive obvsite finished: ' + JSON.stringify(data));
						$scope.createModal.destroy();
						var obvsites = [];
						for(var i=0; i<$scope.weatherDatas.length; i++){
							var obvsite = $scope.weatherDatas[i];
							if(obvsite.id == data.id){
								continue;
							}else{
								obvsites.unshift(obvsite);
							}
						}
						$scope.setPagingData(obvsites);
					}).error(function(data, status, headers, config) {
						$log.debug('error deactive obvsite finished: ' + JSON.stringify(data));
					});
		    	};
				
				$scope.createModal = $modal({
		    		scope: $scope,
		    		template: 'partials/common/deleteConfirmer.html',
		    		backdrop: 'static'
		    	});
		    };
		    
		    /** function to open editor */
		    $scope.doOpenEditModal = function(weather) {
		    	if(weather == null) {
		    		$scope.weather = {};
		    		$scope.edit = false;
		    	}else {
		    		$scope.weather = weather;
		    		$scope.edit = true;
		    	}
		        
		        $scope.createModal = $modal({
		            scope: $scope,
		            template: 'partials/monitor/weather/detailWeatherEditor.html',
		            backdrop: 'static'
		        });
		    };
});

app.controller('DetailWeatherEditorController', function ($log, $rootScope, $scope, $cookies, $location, AlertService, AuthService,WeatherService) {
	$log.debug("DetailWeatherEditorController called.");
	
	
	$scope.doSave = function() {
		if($scope.weather && $scope.weather.day){
			var dayStr = moment($scope.weather.day).format('YYYY-MM-DD');
			var hourStr = $scope.weather.hour;
			var timeStr = dayStr + ' ' + hourStr + ':00:00';
			$log.debug("timeStr = "+ timeStr);
			//$scope.weather.time = moment(timeStr, "YYYY-MM-DD HH:mm:ss").date();
			$scope.weather.time = new Date(timeStr).getTime();
			$scope.weather.dataType = 'RAW';
		}
    	$log.debug('call save building method form '+ JSON.stringify($scope.weather));
    	$scope.submitted = true;
    	if($scope.form.$valid) {
        	if($scope.edit) {
        		$log.debug('prepare to update building');
        		WeatherService.update($scope.weather).success(function(data, status, headers, config) {
        			$log.debug('update weather finished: ' + JSON.stringify(data));
        			$scope.createModal.destroy();

        			var buildings =[];
        			angular.copy($scope.weatherDatas, buildings);
        			for(var i=0; i<buildings.length; i++){
        				var building = buildings[i];
        				if(building.id == data.id){
        					buildings[i] = data;
        					break;
        				}
        			}
        			$scope.setPagingData(buildings);
            	}).error(function(data, status, headers, config) {
            		AlertService.error('Failed to update weather, try again later.');
            	});
        	}
        	else {
        		$log.debug('prepare to create weather');
        		
        		WeatherService.create($scope.weather).success(function(data, status, headers, config) {
        			$log.debug('create weather finished: ' + JSON.stringify(data));
        			$scope.createModal.destroy();
        			
    				var buildings = [];
    				angular.copy($scope.weatherDatas, buildings);
    				buildings.unshift(data);
    				if (buildings.length > $scope.pagingOptions.pageSize) {
    					buildings.pop();
    				}
    				$scope.setPagingData(buildings);
    				$scope.totalServerItems++;
    				
            	}).error(function(data, status, headers, config) {
            		if(status === 409) {
	    				$scope.error = "weather already Exsits";
	    			}else {
	    				AlertService.error('Failed to create weather, try again later.');
	    			}
            	});
        		
        	}
    	}
    };
});