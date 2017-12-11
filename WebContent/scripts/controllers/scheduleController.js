'use strict';

app.controller('ScheduleController', function($rootScope, $scope, $log, $modal, $alert,  $filter, $q, AuthService, AlertService, LessonHistoryService, StudentService,TeacherService,$locale) {
        $scope.students = [];
        $scope.teachers = [];
        $scope.teacher = {};
        $scope.condition = {};
        $scope.calendarCondition = {};
    	$scope.selectedItems = [];
        $scope.history = {
            time: new Date().setMinutes(0)
        };
//        $locale.id = 'zh-CN';
        //教务选择的学生
        $scope.selectStudent = {};
        $scope.selectStudents = [];
        
        var now = new Date();                                                //当前日期
        var nowDayOfWeek = (now.getDay() == 0) ? 7 : now.getDay() - 1;       //今天是本周的第几天。周一=0，周日=6
        var nowDay = now.getDate();                  
     //日期+天
        function AddDays(d, n) {
           var t = new Date(d);//复制并操作新对象，避免改动原对象
           t.setDate(t.getDate() + n);
           return t;
       }
       
       //日期+月。日对日，若目标月份不存在该日期，则置为最后一日
       function AddMonths(d, n) {
           var t = new Date(d);
           t.setMonth(t.getMonth() + n);
          if (t.getDate() != d.getDate()) { t.setDate(0); }
           return t;
       }
      
       //日期+年。月对月日对日，若目标年月不存在该日期，则置为最后一日
       function AddYears(d, n) {
          var t = new Date(d);
           t.setFullYear(t.getFullYear() + n);
           if (t.getDate() != d.getDate()) { t.setDate(0); }
           return t;
       }
     
       //获得本季度的开始月份
       function getQuarterStartMonth() {
           if (nowMonth <= 2) { return 0; }
           else if (nowMonth <= 5) { return 3; }
           else if (nowMonth <= 8) { return 6; }
           else { return 9; }
       }
       
       //周一
       function getWeekStartDate() {
           return AddDays(now, -nowDayOfWeek);
       }
       
       //周日。本周一+6天
       function getWeekEndDate() {
           return AddDays(getWeekStartDate(), 6);
       }


      
       // 下下周
       var nextNextMonday = moment().day(15).format('YYYYMMDD');
       var nextNextSunday = moment().day(21).format('YYYYMMDD');
//       var nextMonday = moment().day(8).format('YYYYMMDD');
//       var nextSunday = moment().day(14).format('YYYYMMDD');
       var lastMonday = moment().day(-8).format('YYYYMMDD');
       var lastSunday = moment().day(-14).format('YYYYMMDD');
       var calendarStartTime = new Date();
       calendarStartTime.setDate(calendarStartTime.getDate()+8 -nowDayOfWeek); //  
       var calendarEndTime = new Date();
       calendarEndTime.setDate(calendarEndTime.getDate()+15 - nowDayOfWeek); //  
        $scope.nextMonday = moment().day(8).format('L');
        $scope.nextSunday = moment().day(14).format('L');
        //日历专用
//        var calendarStartTime = new Date();
//        calendarStartTime.setDate(calendarStartTime.getDate()+8 - calendarStartTime.getDay()); //  
//        var calendarEndTime = new Date();
//        calendarEndTime.setDate(calendarEndTime.getDate()+21 - calendarEndTime.getDay()); //  
    $scope.pagingOptions = {
        pageSizes: [10, 25, 50],
        pageSize: 10,
        currentPage: 1
    };
        $scope.selectedRows = [];
  
        $scope.actions = '<div class="vk-grid-actions">\
	        	<select data-ng-model="COL_FIELD" data-ng-change="doGotoActionForEntity(row.entity);COL_FIELD=\'\'">\
		   			<option value="">-Select Actions-</option>\
		   			<option data-ng-if="isEnabledOccupiedButton(row.entity)" value="arrange">Arrange</option>\
		   			<option data-ng-if="isEnabledCancelButton(row.entity)" value="cancel">Cancel</option>\
		   			<option data-ng-if="isEnabledFinishButton(row.entity)" value="finish">Finish</option>\
		    		<option data-ng-if="isEnabledWXTButton(row.entity)" value="create_wxt_teacher">Create WXT Classroom</option>\
		    		<option value="edit_wxt_id">Edit WXT Classroom ID</option>\
	        	</select>\
            </div>';
        
        $scope.doGotoActionForEntity = function (entity) {
    		$log.debug("the entity is " + JSON.stringify(entity["undefined"]));
    		var select = entity["undefined"];
    		
    		switch (select) {
    			case 'arrange':
    				$scope.doOccupiedConfirm(entity);
    				break;
    			case 'cancel':
    				$scope.cancel(entity.id);
    				break;
    			case 'finish':
    				$scope.openfinishLessonHistoryWindow(entity);
    				break;
    			case 'create_wxt_teacher':
    				$scope.doOpenWXTOperConfirm(entity);
    				break;
    			case 'edit_wxt_id':
    				$scope.doEditWXTID(entity);
    				break;
    		}
    	};
        var mobileTemplate = '<div class="ngCellText"><a ng-href="admin/user/detail/{{row.entity.user_id}}">{{row.entity.mobile}}</a></div>';
        var studentTemplate = '<div class="ngCellText"><a ng-href="admin/user/detail/{{row.entity.user_id}}">{{row.entity.nickName}}</a></div>';
        var lessonScheduleTemplate = '<div class="ngCellText" ng-class="{\'vk-warn\': timeToClassDate(row.entity.lessonSchedule) <= 24*60}">{{row.entity.lessonSchedule | date: \'short\'}}</div>';
        $scope.gridOptions = {
            data: 'myData',
            enablePaging: true,
            showFooter: true,
            totalServerItems: 'totalServerItems',
            pagingOptions: $scope.pagingOptions,
            sortInfo: { fields: ['scheduledDateTime'], directions: ['desc'] },
            // filterOptions: $scope.filterOptions,
            selectedItems: $scope.selectedRows,
            maintainColumnRatios: false,
            showSelectionCheckbox: true,
            selectWithCheckboxOnly: true,
            enableColumnResize : true,
            plugins: [new ngGridFlexibleHeightPlugin({ minHeight: $rootScope.gridMinHeight })],
            footerTemplate: $rootScope.gridFooterTemplate,
            i18n: $rootScope.gridLocale,
            enableCellSelection: true,
            beforeSelectionChange:  $scope.beforeGridEdit,
            afterSelectionChange:  $scope.afterGridEdit,
            columnDefs: [{
                field: 'type',
                displayName: 'Type',
                cellFilter: 'lessonHistoryTypeLocalize'
            }, {
                field: 'lesson.serialNumber',
                displayName: 'Lesson SN'
            }, {
                field: 'lesson.name',
                displayName: 'Lesson Name'
            }, {
                field: 'scheduledDateTime',
                displayName: 'Class Time',
                cellFilter: 'date: \'EEEE, yyyy-MM-dd HH:mm:ss\'',
    			width: 150
            }, {
                field: 'teacher.user.name',
                displayName: 'Teacher Name',
                enableCellEdit: true
            }, {
            	field: 'student.parent.user.name',
                displayName: 'Parent Name'
            }, {
            	field: 'student.user.name',
                displayName: 'Student Name'
            }, {
                field: 'status',
                displayName: 'Status',
                cellFilter: 'lessonHistoryStatusLocalize'
            },{
            	field: 'finishType',
            	displayName: 'Finish Type',
            	cellFilter : 'lessonHistoryFinishTypeLocalize'
            }, {
                field: 'wxtCourseId',
                displayName: 'WXT CourseID'
            }, {
                displayName: 'Actions',
                cellTemplate: $scope.actions,
                width : 180
            }]
        };
                
        $scope.beforeGridEdit = function (rowItem, event) {
        	$log.debug('beforeGridEdit');
        	return true;
        };
        
        $scope.afterGridEdit = function (rowItem, event) {
        	$log.debug('afterGridEdit');
        };
        
        
        // 下周
        var nextMonday = moment()
            .day(8)
            .format('YYYYMMDD');
        var nextSunday = moment()
            .day(14)
            .format('YYYYMMDD');
        $scope.timeFrom = '09:00';
        $scope.timeTo = '23:59';
        $scope.dateFrom = nextMonday;
        $scope.dateTo = nextSunday;
        $scope.calendarCondition.lessonScheduleFrom = moment(nextMonday + $scope.timeFrom, 'YYYYMMDDHH:mm').format('YYYY-MM-DD HH:mm:ss');
        $scope.calendarCondition.lessonScheduleTo = moment(nextSunday + $scope.timeTo, 'YYYYMMDDHH:mm').format('YYYY-MM-DD HH:mm:ss');
//        $scope.calendarCondition.lessonScheduleFrom = $filter('date')($('#myCalendar').fullCalendar('getView').start,'yyyy-MM-dd HH:mm:ss');
//        $scope.calendarCondition.lessonScheduleTo = $filter('date')($('#myCalendar').fullCalendar('getView').end,'yyyy-MM-dd HH:mm:ss');
        $scope.calendarCondition.statuses = ['ARRANGED'];  //可排课
      
        
       
         
       
         
    
    $log.debug('UIScheduleController call');
	$scope.uiConfig = {
      calendar:{
        height: 800,
        wigth: 800,
        editable: true,
        header:{
          //left: 'month basicWeek basicDay agendaWeek agendaDay',
        	//left: 'agendaWeek',
        	left :'',
          center: 'title',
//           right:''
          right: 'today prev,next'
          //right: 'today'
        },
        defaultView: 'agendaWeek',
        eventClick: function(event, allDay, jsEvent, view ) {
        	 if(event.backgroundColor=='green'){
        	$scope.currentEvent = event;
        	 $scope.doOpenConfirmWindow();
        	 }
        },
        
//        viewDisplay: function (view) {
//            //========= Hide Next/ Prev Buttons based on academic year date range
//            if (view.end > calendarEndTime) {
//                $("#myCalendar .fc-button-next").hide();
//            }
//            else {
//                $("#myCalendar .fc-button-next").show();
//            }
//
//            if (view.start < calendarStartTime) {
//                $("#myCalendar .fc-button-prev").hide();
//            }
//            else {
//                $("#myCalendar .fc-button-prev").show();
//            }
//
//        },
        
        monthNames: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],  
        monthNamesShort: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],  
        dayNames: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],  
        dayNamesShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],  
        today: ["今天"],  
        titleFormat:{
            month: 'MMMM yyyy',                             // September 2009
            week: "MMM d[ yyyy]{ '&#8212;'[ MMM] d   yyyy年}", // Sep 7 - 13 2009
            day: 'dddd, MMM d, yyyy'                  // Tuesday, Sep 8, 2009
        },
	
	    eventDurationEditable :false,
	   disableDragging: true,

//        dayClick: function(date,calEvent, jsEvent, view) {
//        	$log.debug("dayCLick");
//            // change the border color just for fun
//            $(this).css('backgroundColor', 'red');
//           // $scope.alertEventOnClick
//        },
//	   eventRender: function(event, element) {         
//			var text =  element.find('.fc-event-time').context.textContent;
//			if(text!=event.title){
//				$(element).find(".fc-event-time").text(' ');
//				$(element).find(".fc-event-time").append("<div align='center'>" + event.title +"</div>"); 
////				$(element).find(".fc-event-time").text(event.title);
//			}
//		},
        eventDrop: $scope.alertOnDrop,
        eventResize: $scope.alertOnResize
      }
    };
        
        
        $scope.totalServerItems = 0;
        /** function to assign data to scope */
        $scope.setPagingData = function(data) {
            $scope.myData = data;
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        };

    	/** function to load data from server */
        $scope.getPagedDataAsync = function(condition, currentPage, pageSize) {
        	$scope.selectedItems = [];
        	if(!pageSize){
        		pageSize = 10;
        	}
        	if(pageSize){
        	condition.start = (currentPage - 1) * pageSize;
        	condition.length = pageSize;
        	}
        	$log.debug('search by condition: ' + JSON.stringify(condition));
        	
        	var countCondition ={};
   			angular.copy(condition, countCondition);
        	if(countCondition.lessonScheduleFrom){
      		     var scheduleFromTime  = $filter('date')(countCondition.lessonScheduleFrom,'yyyy-MM-dd');
      		   countCondition.fromDate = scheduleFromTime;
                } 
      			if(countCondition.lessonScheduleTo){
      		     var scheduleToTime  = $filter('date')(countCondition.lessonScheduleTo,'yyyy-MM-dd');
      		   countCondition.toDate = scheduleToTime;
      			 }
      			countCondition.lessonType = 'NORMAL';
      			countCondition.teacherType = ['TEACH_ONLY|BOTH'];
        	
        	 LessonHistoryService.countLessonHistory(countCondition).success(function(data, status, headers, config) {
         		$log.debug('count = ' + JSON.stringify(data));
         		 $scope.totalServerItems = data.total;
         	}).error(function(data, status, headers, config) {
         		AlertService.error('Failed to calculate lesson history number, please try later.');
         	});
        	 var searchCondition ={};
        	
   			angular.copy(condition, searchCondition);
   			 if(searchCondition.lessonScheduleFrom){
   		     var scheduleFromTime  = $filter('date')(searchCondition.lessonScheduleFrom,'yyyy-MM-dd HH:mm:ss');
   		     searchCondition.lessonScheduleFrom = scheduleFromTime;
             } 
   			if(searchCondition.lessonScheduleTo){
   		     var scheduleToTime  = $filter('date')(searchCondition.lessonScheduleTo,'yyyy-MM-dd HH:mm:ss');
   			 searchCondition.lessonScheduleTo = scheduleToTime;
   			 }
   		    searchCondition.lessonType = 'NORMAL';
    	    searchCondition.teacherType = ['TEACH_ONLY|BOTH'];
             $log.debug('schedule History condition = ' + JSON.stringify($scope.condition));
             LessonHistoryService.list(searchCondition).success(function(data, status, headers, config) {
         		$log.debug('schedule History LessonHistory return = ' + JSON.stringify(data));
         		  $scope.setPagingData(data);
                   $scope.progress = '';
         	}).error(function(data, status, headers, config) {
         		AlertService.error('Failed to upload lesson history, please try later.');
         	});
        };
        
    	// load data from server
    	if(AuthService.hasLogin()) {
    		$scope.getPagedDataAsync($scope.condition, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
    	}

        /** function to watch paging changes */
        $scope.$watch('pagingOptions', function(newVal, oldVal) {
            if (newVal !== oldVal && (newVal.currentPage !== oldVal.currentPage || newVal.pageSize !== oldVal.pageSize)) {
            	$scope.getPagedDataAsync($scope.condition, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
            }
        }, true);
        
        /** function to load data from server base on the search condition */
        $scope.doSearch = function() {
            $scope.getPagedDataAsync($scope.condition, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
        };

        /** function to reset search condition and load data */
        $scope.doReset = function() {
        	$scope.datepicker = null;
        	$scope.condition = {};
            $scope.getPagedDataAsync($scope.condition, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
        };
       
       
//        $scope.filterToArrange = function() {
//            var arrangedSearch = {
//                'status': '已预约'
//            };
//            angular.extend($scope.search, arrangedSearch);
//            $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
//        };
//        $scope.resetFilterToArrange = function() {
//            delete $scope.search.status;
//            $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
//        };

        $scope.doSearchTeacher = function(teacherName){
        	 moment.lang('en', {
        		    week : {
        		        dow : 1 // Monday is the first day of the week
        		    }
        		});
        	 
        	var nextMonday = moment()
        	.weekday(0)
            .day(7)
            .format('YYYYMMDD');
            var nextNextSunday = moment()
            .weekday(0)
            .day(14)
            .format('YYYYMMDD');
        	 var teacherCondition = {};
        	 angular.copy($scope.calendarCondition, teacherCondition);
        	 teacherCondition.teacherName = teacherName;
        	 teacherCondition.lessonScheduleFrom = moment(nextMonday + $scope.timeFrom, 'YYYYMMDDHH:mm').format('YYYY-MM-DD HH:mm:ss');
             teacherCondition.lessonScheduleTo = moment(nextNextSunday + $scope.timeTo, 'YYYYMMDDHH:mm').format('YYYY-MM-DD HH:mm:ss');
        	 LessonHistoryService.getIdleTeacherList(teacherCondition).success(function(data, status, headers, config) {
           		if(data){
           		$scope.teachers = data;
           		}
           	}).error(function(data, status, headers, config) {
           		AlertService.error('Failed to upload teachers list, please try later.');
           	});
        };

        var handleError = function(errIn, form) {
            var err = errIn.data;
            $scope.errors = {};

            // Update validity of form fields that match the mongoose errors
            angular.forEach(err.errors, function(error, field) {
                form[field].$setValidity('mongoose', false);
                console.log(form);
                $scope.errors[field] = error.type;
            });
        };

        //点击创建按钮的响应方法
        $scope.create = function() {
        	 // get teachers  TODO
        	 moment.lang('en', {
     		    week : {
     		        dow : 1 // Monday is the first day of the week
     		    }
     		});
        	var nextMonday = moment()
        	.weekday(0)
            .format('YYYYMMDD');
          var nextNextSunday = moment()
            .weekday(0)
            .day(14)
            .format('YYYYMMDD');
        var teacherCondition = {};
   	    angular.copy($scope.calendarCondition, teacherCondition);
   	 teacherCondition.lessonScheduleFrom = moment(nextMonday + $scope.timeFrom, 'YYYYMMDDHH:mm').format('YYYY-MM-DD HH:mm:ss');
     teacherCondition.lessonScheduleTo = moment(nextNextSunday + $scope.timeTo, 'YYYYMMDDHH:mm').format('YYYY-MM-DD HH:mm:ss');
   	    
            LessonHistoryService.getIdleTeacherList(teacherCondition).success(function(data, status, headers, config) {
          		$log.debug('teacher = ' + JSON.stringify(data));
          		if(data){
          		 if(data.length>0){
          		$scope.teachers = data;
          		 $scope.createScheduleModal = $modal({
                     scope: $scope,
                     template: 'partials/history/schedule/createSchedule.html',
                     size: 'lg',
                     windowClass: 'app-modal-window',
                     backdrop: 'static'
                  });
          		}else{
          			AlertService.error('There is no teacher on arrangement, please try later or call the  Consultant.');
          		}
          		}
                else{
                	AlertService.error('There is no teacher on arrangement, please try later or call the  Consultant.');
                }
          	}).error(function(data, status, headers, config) {
          		AlertService.error('Failed to upload teachers list, please try later.');
          	});
           
           
        };
        
        //点击日历事件的响应方法
        $scope.doOpenConfirmWindow = function() {
        	//把学生列表置空
			 $scope.selectStudents = [];
			 $scope.selectStudent = {};
        	 // get teachers  TODO
          		 $scope.createLessonHistoryModal = $modal({
                     scope: $scope,
                     template: 'partials/history/schedule/createLessonHistory.html',
                     size: 'lg',
                     windowClass: 'app-modal-window',
                     backdrop: 'static'
                 });
          
           
        };
        
        
        $scope.doEditWXTID = function(lessonHistory) {
        	if(lessonHistory){
        		$scope.lessonHistory = lessonHistory;
        	}else{
        		$scope.lessonHistory = {};
        	}
        	 $scope.createWXTModal = $modal({
                 scope: $scope,
                 template: 'partials/history/schedule/lessonHistoryWXTEditor.html',
                 size: 'lg',
                 windowClass: 'app-modal-window',
                 backdrop: 'static'
             });
        };
        
        
        $scope.confirmCancelLessonHistory = function(){
        	$scope.createCancelLessonHistoryModal.destroy();
        	 $log.debug('cancel LessonHistory  id = ' + JSON.stringify($scope.lessonHistoryId));
          	var lessonHistory = {id:$scope.lessonHistoryId};
              LessonHistoryService.cancel(lessonHistory).success(function(data, status, headers, config) {
          		$log.debug('LessonHistory = ' + JSON.stringify(data));
          		if(data){
          			if(data==''){
          				AlertService.error('Failed to cancel lesson, please try later.');
          			}else{
          				//TODO Need to Update page file
                  		//刷新页面
                  		var lessonHistories =[];
              			angular.copy($scope.myData, lessonHistories);
              			for(var i=0; i<lessonHistories.length; i++){
              				var lessonHistory = lessonHistories[i];
              				if(lessonHistory.id == data.id){
              					lessonHistories[i] = data;
              					break;
              				}
              			}
              			$scope.setPagingData(lessonHistories);
                            $scope.progress = '';
//          				$scope.getPagedDataAsync($scope.condition, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
          			}
          		}else{
          			AlertService.error('Failed to cancel lesson, please try later.');
          		}
          		
          	}).error(function(data, status, headers, config) {
          		AlertService.error('Failed to cancel lesson, please try later.');
          	});
        };

        $scope.cancel = function(lessonHistoryId) {
        	if(lessonHistoryId){
        		$scope.lessonHistoryId = lessonHistoryId;
        	}
        	  $scope.createCancelLessonHistoryModal = $modal({
                  scope: $scope,
                  template: 'partials/history/schedule/cancelArrangementConfirmer.html',
                  backdrop: 'static'
              });
        };
        
        $scope.getScheduleEvent = function(teacher){
        	$scope.calendarCondition.teacherIds = teacher.id;
        	
        	$scope.teacher = teacher;
        	$scope.teacherName = teacher.user.name;
        	var copyCondition ={};
    		angular.copy($scope.calendarCondition, copyCondition);
    		var startTime = $('#myCalendar').fullCalendar('getView').start;
    		var endTime = $('#myCalendar').fullCalendar('getView').end;
    		copyCondition.lessonScheduleFrom = moment(startTime).format('YYYY-MM-DD HH:mm:ss');
    		copyCondition.lessonScheduleTo = moment(endTime).format('YYYY-MM-DD HH:mm:ss');
    		if($scope.selectStudent.id){
    		copyCondition.studentIds = $scope.selectStudent.id;
    		}
            	 LessonHistoryService.getTeacherViewEvents(copyCondition).success(function(data, status, headers, config) {
              		$log.debug('getTeacherViewEvents***** = ' + JSON.stringify(data));
              		 $('#myCalendar').fullCalendar('removeEvents');
               		  angular.forEach(data, function(object) {
                         $log.debug('scheduledDateTime data = ' + JSON.stringify(object.start));
                         var orginDate  = $filter('date')(object.start,'yyyy-MM-dd HH:mm');
                       	  var date = new Date(orginDate);
                         $log.debug('date= ' + JSON.stringify(date));
                         var title = 'IDLE';
                         if(object.title){
                         	title = object.title;
                         }
                         var id = 0;
                         if(object.id){
                         	id = object.id;
                         }
                         var backgroundColor = 'blue';
                         if(object.backgroundColor){
                         	backgroundColor = object.backgroundColor;
                         }
                         //TODO
                 	    var d = date.getDate();
                 	    var m = date.getMonth();
                 	    var y = date.getFullYear();
                 	  var hour =  orginDate.substring(11,13);
                 	  var min = orginDate.substring(14,17);
                 	  var startDate = new Date(y, m, d , hour, min);
                 	  var endDate = new Date();
                 	   //开始时间的30分钟后
                 	   endDate.setTime(startDate.getTime()+1000*60*30);
                       var newEvent =  {title: title,id:id, start: startDate,end: endDate,allDay: false,backgroundColor:backgroundColor};
                      // $scope.events.push(event);
                       $('#myCalendar').fullCalendar( 'renderEvent', newEvent);
               		  });
              	}).error(function(data, status, headers, config) {
              		AlertService.error('Failed to get teacher lesson data, please try later.');
              	});
            
//    		 LessonHistoryService.getTeacherViewEvents(copyCondition).success(function(data, status, headers, config) {
//               	if(data){
//               		$log.debug('history data = ' + JSON.stringify(data));
//               	}
//                $('#myCalendar').fullCalendar('removeEvents');
//           		  angular.forEach(data, function(history) {
//                     var teacher_id = history.teacher.id;
//                     $scope.teacherId = teacher_id;
//                     var scheduledDateTime = history.scheduledDateTime; 
//                     $log.debug('scheduledDateTime data = ' + JSON.stringify(scheduledDateTime));
//                     var orginDate  = $filter('date')(history.scheduledDateTime,'yyyy-MM-dd HH:mm');
//                   	  var date = new Date(orginDate);
//                     $log.debug('date= ' + JSON.stringify(date));
//                     //TODO
//             	    var d = date.getDate();
//             	    var m = date.getMonth();
//             	    var y = date.getFullYear();
//             	  var hour =  orginDate.substring(11,13);
//             	  var min = orginDate.substring(14,17);
//             	  var startDate = new Date(y, m, d , hour, min);
//             	  var endDate = new Date();
//             	   //开始时间的30分钟后
//             	   endDate.setTime(startDate.getTime()+1000*60*30);
//                   var event =  {title: 'IDEL TIME',start: startDate,end: endDate,allDay: false,backgroundColor:'blue'};
//                  // $scope.events.push(event);
//                   $('#myCalendar').fullCalendar( 'renderEvent', event );
//           		  });
//           	}).error(function(data, status, headers, config) {
//           		AlertService.error('Failed to get lesson history, please try later.');
//           	});
        };
        
        $scope.openfinishLessonHistoryWindow = function(lessonHistory) {
        	$scope.updateLessonHistory = lessonHistory;
        	$log.debug('openfinishLessonHistoryWindow LessonHistory  id = ' + JSON.stringify(lessonHistory.id));
        	  $scope.createModal = $modal({
                  scope: $scope,
                  template: 'partials/history/schedule/finishLessonHistory.html',
                  backdrop: 'static'
              });
        };
        
        $scope.doOccupiedConfirm =  function(lessonHistory) {
        	$scope.updateLessonHistory = lessonHistory;
        	$log.debug('doOccupiedConfirm LessonHistory  id = ' + JSON.stringify(lessonHistory.id));
        	  $scope.createOccupiedLessonHistoryModal = $modal({
                  scope: $scope,
                  template: 'partials/history/schedule/occupiedLessonHistory.html',
                  backdrop: 'static'
              });
        };
        
        $scope.finishLessonHistory = function(finishType) {
        	$scope.submitted = true;
        	
        	if ($scope.form.$valid) {
        		$scope.updateLessonHistory.status = 'FINISHED';
            	$scope.updateLessonHistory.finishType = finishType;
            	
            	LessonHistoryService.schedule($scope.updateLessonHistory).success(function(data, status, headers, config) {
        		    AlertService.info('Lesson history updated successfully!');
        		    var lessonHistories =[];
        			angular.copy($scope.myData, lessonHistories);
        			for(var i=0; i<lessonHistories.length; i++){
        				var lessonHistory = lessonHistories[i];
        				if(lessonHistory.id == data.id){
        					lessonHistories[i] = data;
        					break;
        				}
        			}
        			$scope.setPagingData(lessonHistories);
        			
        			$scope.createModal.destroy();
            	}).error(function(data, status, headers, config) {
            		AlertService.error('Failed to update lesson history, pleast try later.');
            		
            		$scope.createModal.destroy();
            	});
        	}
        };
        
        $scope.isEnabledFinishButton = function(lessonHistory){
        	/*var scheduleDateStr  = $filter('date')(lessonHistory.scheduledDateTime,'yyyy-MM-dd');
        	var scheduleDate = new Date(scheduleDateStr);
        	var scheduleDateTime = scheduleDate.getTime()+1000*60*30;
        	// var dayBeforeScheduleDate = new Date(tempDate);
        	var nowDate = new Date();
        	var nowDateTime = nowDate.getTime();
        	if(nowDateTime>scheduleDateTime){
        		if(lessonHistory.status=='READY'){
        			return true;
        		}else{
        			return false;
        		}
        		
        	}*/
//        	var nowStr = $filter('date')(nowDate,'yyyy-MM-dd');
//        	var dayBeforeScheduleDateStr =  $filter('date')(dayBeforeScheduleDate,'yyyy-MM-dd');
//        	if(nowStr==dayBeforeScheduleDateStr){
//        		return false;
//        	}
        	
        	if(parseInt(lessonHistory.scheduledDateTime) < new Date().getTime() && lessonHistory.status == 'READY'){
        		return true;
        	}else{
        		return false;
        	}
        	
        };
        
        //完成新建LessonHistory功能
        $scope.doCreateLessonHistory = function(){
    		$log.debug('save lessonHistory');
    		var event = $scope.currentEvent;
    		var dateTime = $filter('date')(event.start,'yyyy-MM-dd HH:mm:ss');
    		var date = new Date(dateTime);
    		var newLessonHistory = {};
    		newLessonHistory.teacher = $scope.teacher;
    		newLessonHistory.id = event.id;
    		newLessonHistory.student = $scope.condition.student;
    		newLessonHistory.scheduledDateTime  = date.valueOf();
    		//状态置为已预约
    		newLessonHistory.status = "OCCUPIED";
    		newLessonHistory.type = "NORMAL";
    		$log.debug('save lessonHistory = ' + JSON.stringify($scope.lessonHistory));
    		LessonHistoryService.schedule(newLessonHistory).success(function(data, status, headers, config) {
    			$log.debug('create lessonHistory response = ' + JSON.stringify(data));
    				AlertService.info('Lesson history created successfully!');
    				$scope.createScheduleModal.destroy();
    				if($scope.createLessonHistoryModal){
    				$scope.createLessonHistoryModal.destroy();
    				}
    				//把学生列表置空
    				 $scope.selectStudents = [];
    				 $scope.selectStudent = {};
    				//克隆原对象来完成刷新功能
        			var lessonHistories =[];
        			angular.copy($scope.myData, lessonHistories);
        			for(var i=0; i<lessonHistories.length; i++){
        				var lessonHistory = lessonHistories[i];
        				if(lessonHistory.id == data.id){
        					lessonHistories[i] = data;
        					break;
        				}
        			}
        			$scope.setPagingData(lessonHistories);
    		}).error(function(data, status, headers, config) {
    			//把学生列表置空
				 $scope.selectStudents = [];
				 $scope.selectStudent = {};
    			if(!data){
    				AlertService.error('Failed to create lesson history, please try later.');
    			}else{
    				AlertService.error(data);
    			}
    			$scope.getPagedDataAsync($scope.condition, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
    		});
    	};
        
    	 $scope.doOccupiedLessonHistory = function(){
    		 $scope.updateLessonHistory.student = $scope.selectStudent.student;
    		 LessonHistoryService.schedule( $scope.updateLessonHistory).success(function(data, status, headers, config) {
     			$log.debug('create lessonHistory response = ' + JSON.stringify(data));
     				AlertService.info('Lesson history created successfully!');
     				 $scope.createOccupiedLessonHistoryModal.destroy();
     				//把学生列表置空
     				 $scope.selectStudents = [];
     				 $scope.selectStudent = {};
     				//克隆原对象来完成刷新功能
         			var lessonHistories =[];
         			angular.copy($scope.myData, lessonHistories);
         			for(var i=0; i<lessonHistories.length; i++){
         				var lessonHistory = lessonHistories[i];
         				if(lessonHistory.id == data.id){
         					lessonHistories[i] = data;
         					break;
         				}
         			}
         			$scope.setPagingData(lessonHistories);
     		}).error(function(data, status, headers, config) {
     			//把学生列表置空
 				 $scope.selectStudents = [];
 				 $scope.selectStudent = {};
     			if(!data){
     				AlertService.error('Failed to create lesson history, please try later.');
     			}else{
     				AlertService.error(data);
     			}
     			$scope.getPagedDataAsync($scope.condition, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
     		});
    		
    	 };
      

        $scope.getTeachers = function() {
        	TeacherService.list({}).success(function(data, status, headers, config) {
    			$log.debug('teachers = ' + JSON.stringify(data));
    			if(data&&data.length>0){
    				 $scope.teachers = data;
    			}else{
    				AlertService.error('Failed to upload teachers list, please try later.');
    			}
    			
    		}).error(function(data, status, headers, config) {
    			AlertService.error('Failed to upload teachers list, please try later.');
    		});
            
        };

        $scope.getTeachers();

        $scope.getStudentsFromServer = function(searchText){
        	//FIXME 能多条件否
    		var condition = {search:searchText};
    		StudentService.list(condition).success(function(studentViews, status, headers, config) {
    			$log.debug('student views = ' + JSON.stringify(studentViews));
    			$scope.selectStudents = [];
    			var data = [];
    			angular.forEach(studentViews, function(view) {
    				data.push(view.student);
    			});
    			if(data && data.length>0){
    				for(var i=0; i<data.length; i++){
    					var student = data[i];
    					if(student.stage!='LEARNING'){
    						continue;
    					}
    					$scope.selectStudents.push(student);
    				}
//    				$scope.selectStudent =  $scope.selectStudents[0];
    				//$scope.selectStudents = data;
    			}else{
    				AlertService.error('Can not find student with the search item, please try again.');
    			}
    			
    		}).error(function(data, status, headers, config) {
    			AlertService.error('Failed to search student, please try later.');
    		});
    	};

        

        // 距离上课时间 单位为分钟
        $scope.timeToClassDate = function(lessonSchedule) {
            return (moment(lessonSchedule) - moment()) / 1000 / 60;
        };
        
        $scope.isEnabledOccupiedButton = function(lessonHistory){
        	//课程还没有学生预约
        	if(!lessonHistory.student&&lessonHistory.status=='ARRANGED'){
        		return true;
        	}
        		return false;
        	
        };
        
        //是否显示创建按钮， 已到时间，但是还没有正确排课
        $scope.isEnabledWXTButton = function(lessonHistory){        	
        	if(lessonHistory.status === 'OCCUPIED' && !lessonHistory.wxtCourseId) {
        		return true;
        	}else{
        		return false;
        	}
        };
        
        $scope.isEnabledCancelButton = function(lessonHistory){
        	if(lessonHistory.status == 'FINISHED' || lessonHistory.status == 'CANCELED'){
        		return false;
        	}
        	return true;
        };
        
        $scope.doOpenWXTOperConfirm = function(lessonHistory){
        	$scope.lessonHistory = angular.copy(lessonHistory);
        	$scope.createModal = $modal({
                    scope: $scope,
                    template: 'partials/history/histories/doWXTOperConfirmer.html',
                    backdrop: 'static'
           });
        };
        
        $scope.doSave = function(form) {
        	$log.debug('call save lessonHistory method form '+ JSON.stringify($scope.lessonHistory));

        	$scope.submitted = true;

        	if($scope.form.$valid) {
        			$log.debug('prepare to update lessonHistory');
        			LessonHistoryService.update($scope.lessonHistory).success(function(data, status, headers, config) {
        				$log.debug('update lessonHistory finished: ' + JSON.stringify(data));
        				if($scope.createWXTModal){
        				$scope.createWXTModal.destroy();
        				}
        				//克隆原对象来完成刷新功能
        				var lessonHistories =[];
            			angular.copy($scope.myData, lessonHistories);
            			for(var i=0; i<lessonHistories.length; i++){
            				var lessonHistory = lessonHistories[i];
            				if(lessonHistory.id == data.id){
            					lessonHistories[i] = data;
            					break;
            				}
            			}
            			$scope.setPagingData(lessonHistories);
        			}).error(function(data, status, headers, config) {
        				if(!data){
        				AlertService.error('Failed to update WXT ID, please try later.');
        				}else{
        					AlertService.error('Failed to update WXT ID, the reason is:'+data+' please try later.');
        				}
        			});
        		}
        };
    });


app.controller('ScheduleCreateController', function($rootScope, $scope, LessonHistoryService, StudentService,TeacherService, $log, $modal, $alert, $q, $filter,AlertService) {
	var condition = {};
	$scope.teachers = {};
	$scope.student = {};
	$scope.lessonHistory = {};
	// get data
	$log.debug('ScheduleCreateController-----------------');
		TeacherService.list(condition).success(function(data, status, headers, config) {
			$log.debug('teachers = ' + JSON.stringify(data));
			$scope.teachers = data;
		}).error(function(data, status, headers, config) {
			AlertService.error('Failed to upload teachers list, please try later.');
		});

	
	$scope.getStudentsFromServer = function(mobile){
		condition = {mobile:mobile};
		StudentService.list(condition).success(function(studentViews, status, headers, config) {
			$log.debug('student views = ' + JSON.stringify(studentViews));
			var data = [];
			angular.forEach(studentViews, function(view) {
				data.push(view.student);
			});
			if(data && data.length>0){
				$scope.lessonHistory.student = data[0];
				$scope.students = data;
			}else{
				AlertService.error('No student is match with the phone number, please try again.');
			}
			
		}).error(function(data, status, headers, config) {
			AlertService.error('Failed to upload student, please try later.');
		});
	};
	
	
});

app.controller('WXTCourseController', function($log, $rootScope, $scope, $modal, $routeParams, AuthService, AlertService, WXTService, LessonHistoryService) {
	$scope.doCreateCourse = function(){
		if(!$scope.lessonHistory){
			$scope.createModal.destroy();
			return;
		}
		
		//去网校通创建教室并排课
		WXTService.createRoom($scope.lessonHistory).success(function(data, status, header, config){
			$log.debug("create wxt course with return:" + JSON.stringify(data));
			
			var lessonHistories =[];
			angular.copy($scope.myData, lessonHistories);
			for(var i=0; i<lessonHistories.length; i++){
				var lessonHistory = lessonHistories[i];
				if(lessonHistory.id == data.id){
					lessonHistories[i] = data;
					break;
				}
			}
			$scope.setPagingData(lessonHistories);
			
			$scope.createModal.destroy();
		}).error(function(error, status, header, config){
			AlertService.error('Failed to create lesson in WXT, please try later: ' + error);
			$scope.createModal.destroy();
		});
	};
});
	



