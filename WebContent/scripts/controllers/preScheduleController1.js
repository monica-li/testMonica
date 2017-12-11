'use strict';

app.controller('PreScheduleController', function($rootScope, $scope, $log, $modal, $filter, AuthService, AlertService, LessonHistoryService, StudentService, TeacherService, TableData) {
	    $scope.filter = {};
	    $scope.condition = {};
	    var condition = {};
	    /** function to assign data to scope */
	    $scope.setPagingData = function(data) {
	        $scope.teachers = data;
	        if (!$scope.$$phase) {
	            $scope.$apply();
	        }
	    };
       
// StudentService.list({
// id: 'list',
// filter: {
// role: 'teacher'
// }
// }, function(data) {
// $scope.teachers = data;
// });
         // get data
            TeacherService.list(condition).success(function(data, status, headers, config) {
        		$log.debug('teachers = ' + JSON.stringify(data));
        		$scope.setPagingData(data);
        	}).error(function(data, status, headers, config) {
        		AlertService.error('Failed to upload teachers list, please try later.');
        	});
       

        $scope.status = {
            tableDataVersion: 0
        };
        

// $scope.getTeachers();

            function init(){
            // 下下周
            var nextNextMonday = moment()
                .day(15)
                .format('YYYYMMDD');
            var nextNextSunday = moment()
                .day(21)
                .format('YYYYMMDD');
            $scope.timeFrom = '09:00';
            $scope.timeTo = '21:00';
            $scope.dateFrom = nextNextMonday;
            $scope.dateTo = nextNextSunday;
           // $scope.condition.fromDate = moment(nextNextMonday +
			// $scope.timeFrom, 'YYYYMMDDHH:mm').local().toDate();
            $scope.condition.lessonScheduleFrom = moment(nextNextMonday + $scope.timeFrom, 'YYYYMMDDHH:mm').format('YYYY-MM-DD HH:mm:ss');
           // $scope.condition.toDate = moment(nextNextSunday + $scope.timeTo,
			// 'YYYYMMDDHH:mm').local().toDate();
            $scope.condition.lessonScheduleTo = moment(nextNextSunday + $scope.timeTo, 'YYYYMMDDHH:mm').format('YYYY-MM-DD HH:mm:ss');
            $scope.condition.statuses = ['ARRANGED'];  //预排课
            // $scope.condition.pageSize = 10000;
            $log.debug('######### '+JSON.stringify($scope.condition));
            LessonHistoryService.list($scope.condition).success(function(data, status, headers, config) {
            	if(data){
            		$log.debug('data = ' + JSON.stringify(data));
            	}
        		  angular.forEach(data, function(history) {
                  var teacher_id = history.teacher.id;
                  $scope.teacherId = teacher_id;
                 // var date = $filter('date')(history.scheduledDateTime, "yyyyMMdd");
                  //var time = $filter('date')(history.scheduledDateTime, "yyyyMMddHHmm");
              	var orginDate  = $filter('date')(history.scheduledDateTime,'yyyy-MM-dd');
              	var orginTime = $filter('date')(history.scheduledDateTime,'HH:mm');
              	var momentDate = moment(moment(orginDate).format('YYYYMMDD'),'YYYYMMDD');
              	var momentTime = moment('19700101'+moment(orginTime,'HH:mm').format('HH:mm'),'YYYYMMDDHH:mm');
              //	var dateObj = new Date(time);
              	var time = new Date(momentTime);
              	var date = new Date(momentDate);
              //	var date = new Date(dateObj);
              	$log.debug('date = '+date);
              	$log.debug('time = '+time);
                 // var date = moment(moment(history.scheduledDateTime).format('YYYYMMDD'), 'YYYYMMDD').toDate();
                  //var time = moment('19700101' + moment(history.scheduledDateTime).format('HH:mm'), 'YYYYMMDDHH:mm').toDate();
                  var tableData = TableData.getData(teacher_id);
                  $log.debug('t data'+tableData);
                  if(!tableData){
                	  return;
                  }
                  var tableTimeData =  TableData.getData(teacher_id)[time];
                  $log.debug('tableTimeData'+tableTimeData);
                  TableData.getData(teacher_id)[time][date].content = 'true';
                
        		  });
        	}).error(function(data, status, headers, config) {
        		AlertService.error('Failed to upload lesson history, please try later.');
        	});
        		  caculateOverview();
            
            var newQuery = angular.copy($scope.condition);
            newQuery.statuses = ['ARRANGED'];
            
            LessonHistoryService.list(newQuery).success(function(data, status, headers, config) {
            	if(data){
            		$log.debug('lessonHistory***** = ' + JSON.stringify(data));
            	}
        		if (data && data.length === 1) {
                    $scope.already_delivered = true;
                } else {
                    $scope.already_delivered = false;
                }
        	}).error(function(data, status, headers, config) {
        		AlertService.error('Failed to upload lesson history, please try later.');
        	});
            };
            $log.debug('init 1');
            init();
//            $log.debug('init 2');
//            init();
//            $log.debug('init 3');
//            init();
//            if(!initSuccessFlag){
//            	  init();
//            	  init();
//            }
            
//            function doInit(){
//            	while(!initSuccessFlag){
//               	 init();
//               }
//            };
        
//            doInit();
            
        function caculateOverview() {
            var overViewData = TableData.getData('overview');
            angular.forEach(overViewData, function(rowData, rowKey) {
                angular.forEach(rowData, function(cellData, colKey) {
                    overViewData[rowKey][colKey].content = 0;
                });
            });
            angular.forEach($scope.teachers, function(teacher) {
                var tableData = TableData.getData(teacher.id);
                angular.forEach(tableData, function(rowData, rowKey) {
                    angular.forEach(rowData, function(cellData, colKey) {
                        if (cellData.content) {
                            overViewData[rowKey][colKey].content = (overViewData[rowKey][colKey].content || 0) + 1;
                        }
                    });
                });
            });
        }

        $scope.deliver = function(form) {
            $log.debug('Deliver');
//            var newQuery = {};
//            newQuery.fromDate =  $scope.condition.fromDate;
//            newQuery.toDate =  $scope.condition.toDate;
            LessonHistoryService.deliver().success(function(data, status, headers, config) {
        		$log.debug('lessonHistory***** = ' + JSON.stringify(data));
        		AlertService.info('Deliver successfully!');
        		
        	}).error(function(data, status, headers, config) {
        		AlertService.error('Failed to deliver LessonHistory, pleast try later.');
        	});
        };

        $scope.copyLastWeek = function(id) {
//            LessonHistoryService.save({
//                id: 'copy'
//            }, {teacher_id: id}).$promise.then(function() {
//                $alert({title: 'Copy successfully!', placement: 'top-right', type: 'info', show: true, duration: 3});
//                // TODO only load the data selected teacher
//                init();
//            }, function(err) {
//                $alert({title: 'Copy failed!', placement: 'top-right', type: 'danger', show: true, duration: 3});
//                $log.error(err);
//            });
        	var newQuery = {};
        	var fromDate = $scope.condition.lessonScheduleFrom;
        	var toDate = $scope.condition.lessonScheduleTo;
            newQuery.lessonScheduleFrom = fromDate;
            newQuery.lessonScheduleTo = toDate;
            //newQuery.teacherId =  $scope.teacherId ;
            newQuery.teacherId = id;
            $log.debug('copy last week ***** = ' + JSON.stringify(newQuery));
        	 LessonHistoryService.copyLastWeek(newQuery).success(function(data, status, headers, config) {
         		$log.debug('copy last week return = ' + JSON.stringify(data));
         		AlertService.info('Copy successfully!');
         		
         	}).error(function(data, status, headers, config) {
         		AlertService.error('Copy failed, please try later.');
         	});
        };

      
    });