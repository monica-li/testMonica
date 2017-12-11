'use strict';

app.controller('PreScheduleController', function($rootScope, $scope, $log, $modal, $filter, AuthService, AlertService, LessonHistoryService, StudentService, TeacherService,$q) {
	    $scope.filter = {};
	    $scope.condition = {};
	    $scope.nextNextWeekFlag = true;
	    var condition = {};
	    $scope.overViewClicked = true;
	    $scope.createSuccessFlag = false;
	    $scope.teacherId = {};
	    $scope.teacherName = '';
	    /** function to assign data to scope */
	    $scope.setPagingData = function(data) {
	        $scope.teachers = data;
	        if (!$scope.$$phase) {
	            $scope.$apply();
	        }
	    };
 
	    
	    $log.debug('UIScheduleController call');
		$scope.uiOverViewConfig = {
			calendar:{
	        height: 800,
	        wigth: 800,
	        editable: true,
	        header:{
	          //left: 'month basicWeek basicDay agendaWeek agendaDay',
	        	//left: 'agendaWeek',
	        	left :'',
	          center: 'title',
	          //right:''
	          right: 'today prev,next'
	          //right: 'today'
	        },
	        defaultView: 'agendaWeek',
	        eventClick: function(event, allDay, jsEvent, view ) {
	        	event.teacher = $scope.teacher;
//	        	event.lessonHistory = $scope.changedLessonHistory;
	        	   if(event.backgroundColor=='green'){
	        		   $scope.currentEvent = event;
	        		   $scope.doOpenConfirmDeleteLessonHistoryWindow();
	        		   
	        	   }
	        		
	        },

//	        dayClick: function(date,calEvent, jsEvent, view) {
//	        	
//	        	$log.debug("dayCLick");
//	        },
	        eventDrop: $scope.alertOnDrop,
//	        viewDisplay: function (view) {
//                //========= Hide Next/ Prev Buttons based on academic year date range
//	        	 if (view.end > calendarEndTime) {
//	                    $("#overViewCalendar .fc-button-next").hide();
//	                }
//	                else {
//	                    $("#overViewCalendar .fc-button-next").show();
//	                }
//
//	                if (view.start < calendarStartTime) {
//	                    $("#overViewCalendar .fc-button-prev").hide();
//	                }
//	                else {
//	                    $("#overViewCalendar .fc-button-prev").show();
//	                }
//
//            },
           selectable: true,
			selectHelper: true,
			select: function(start, end) {
				if($scope.overViewClicked){
					return;
				}
				//TODO
//				if(!$scope.calendarSelectEnable($('#overViewCalendar').fullCalendar('getView').end)){
//					return;
//				}
				if(end.getTime()-start.getTime()>(30*1000*60)){
					return;
				}
//				var scheduleDateString = moment(start).subtract('days', 1).hour(0).minute(0).second(0).format('YYYY-MM-DD HH:mm:ss');
				var scheduleDateString = moment(start).format('YYYY-MM-DD HH:mm:ss');
				var scheduleDate = new Date(scheduleDateString);
				var nowDateString = moment().format('YYYY-MM-DD HH:mm:ss');
				var nowDate = new Date(nowDateString);
				if(nowDate>scheduleDate){
					AlertService.error('Only lessons in future time can be arranged!');
					return;
				}
//				var title = prompt('Event Title:');
				var title = 'ARRANGED';
				if (title) {
					
//					 $('#overViewCalendar').fullCalendar( 'renderEvent', event,true );
					
					//call 后台	
					 var lessonHistory = {};
					 var teacher = {id:$scope.teacherId};
//					 lessonHistory.scheduledDateTime = $filter('date')(event.start,'yyyy-MM-dd HH:mm:ss');
					 var scheduleDate = new Date($filter('date')(start,'yyyy-MM-dd HH:mm:ss'));
					 lessonHistory.scheduledDateTime =  scheduleDate.getTime();
					 lessonHistory.teacher = teacher;
					 lessonHistory.status = 'ARRANGED';
					 lessonHistory.type = 'NORMAL';
					 var result = $scope.save(lessonHistory);  
		                result.then(function (data) {  
//		                    $scope.result = data;  
//		                    event.lessonHistory = data;
//                   		 event.id = data.id;
		                	if(data){
		                var id = data.id;
                   		var event = {
    							id : id,
    							title: 'Arranged',
    							start: start,
    							end: end,
    							allDay: false,
    							status: 'ARRANGED',
    							backgroundColor: 'green'
    						};
                   		 $('#overViewCalendar').fullCalendar( 'updateEvent', event);
                   		 $('#overViewCalendar').fullCalendar( 'renderEvent', event);
		                }
		                });
//					 $scope.save(lessonHistory);
//					 if($scope.createSuccessFlag){
//						 $('#overViewCalendar').fullCalendar( 'renderEvent', event);
//						 AlertService.info('PreSchedule created successfully!');
//					 }else{
//						 AlertService.error('Failed to create preSchedule, please try later.');
//					 }
				}
				 $('#overViewCalendar').fullCalendar('unselect');
			},
			
			  monthNames: ["January ", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],  
	            monthNamesShort: ["Jan.", "Feb.", "Mar.", "Apr.", "may.", "Jun.", "Jul.", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."],  
	            dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],  
	            dayNamesShort: ["Sun.", "Mon.", "Tues.", "Wed.", "Thur.", "Fri.", "Sat."],  
	            today: ["Today"],  
	            titleFormat:{
	                month: 'MMMM yyyy',                             // September 2009
	                week: "MMM d[ yyyy]{ '&#8212;'[ MMM] d   yyyy年}", // Sep 7 - 13 2009
	                day: 'dddd, MMM d, yyyy'                  // Tuesday, Sep 8, 2009
	            },
			
			eventDurationEditable :false,
			disableDragging: true,
			
//			eventRender: function(event, element) {         
////				$(element).find(".fc-event-time").remove();
//				var text =  element.find('.fc-event-time').context.textContent;
//				if(text!=event.title){
////					$(element).find(".fc-event-time").text('     '+event.title);
//					$(element).find(".fc-event-time").text(' ');
////					$(element).find(".fc-event-time").append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + event.title); 
//					$(element).find(".fc-event-time").append("<div align='center'>" + event.title +"</div>"); 
//				}
//			
//			},

	        eventResize: $scope.alertOnResize
	      }
	    };

	    
	    
	    
	    
    // get teacher list 获取老师列表，默认只显示10个
	condition.start = 0;	
	condition.length = 10;
	TeacherService.list(condition).success(function(data, status, headers, config) {
		$log.debug('teachers = ' + JSON.stringify(data));
		$scope.setPagingData(data);
	}).error(function(data, status, headers, config) {
		AlertService.error('Failed to upload teachers list, please try later.');
	});
       
            
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
            var nextMonday = moment().day(8).format('YYYYMMDD');
            var nextSunday = moment().day(14).format('YYYYMMDD');
            var lastMonday = moment().day(-8).format('YYYYMMDD');
            var lastSunday = moment().day(-14).format('YYYYMMDD');
            var calendarStartTime = new Date();
            calendarStartTime.setDate(calendarStartTime.getDate()+8 -nowDayOfWeek); //  
            var calendarEndTime = new Date();
            calendarEndTime.setDate(calendarEndTime.getDate()+15 - nowDayOfWeek); //  
            $scope.timeFrom = '09:00';
            $scope.timeTo = '23:59';
            $scope.dateFrom = nextNextMonday;
            $scope.dateTo = nextNextSunday;
           // $scope.condition.fromDate = moment(nextNextMonday +
			// $scope.timeFrom, 'YYYYMMDDHH:mm').local().toDate();
            $scope.condition.lessonScheduleFrom = moment(nextNextMonday + $scope.timeFrom, 'YYYYMMDDHH:mm').format('YYYY-MM-DD HH:mm:ss');
           // $scope.condition.toDate = moment(nextNextSunday + $scope.timeTo,
			// 'YYYYMMDDHH:mm').local().toDate();
            $scope.condition.lessonScheduleTo = moment(nextNextSunday + $scope.timeTo, 'YYYYMMDDHH:mm').format('YYYY-MM-DD HH:mm:ss');
            $scope.condition.statuses = ['ARRANGED'];  //可排课
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
        		  });
        	}).error(function(data, status, headers, config) {
        		AlertService.error('Failed to upload lesson history, please try later.');
        	});
            
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
         
            

        $scope.copyLastWeek = function(id) {
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
         		
         	}).error(function(data, status, headers, config) {
         		AlertService.error('Failed to copy lastweek schedule, please try later.');
         	});
        };

        $scope.save = function(lessonHistory) {
        	   var deferred = $q.defer();  
                        LessonHistoryService.create(lessonHistory).success(function(data, status, headers, config) {
                        	   deferred.resolve(data);  
                    		$log.debug('create lessonHistory***** = ' + JSON.stringify(data));
                    		 if(data){
                    		 }else{
                    			 AlertService.error('Failed to create preSchedule, please try later.'); 
                    		 }
                    		 $scope.createSuccessFlag = true;
                    	}).error(function(data, status, headers, config) {
                    		 $scope.createSuccessFlag = false;
                    		 AlertService.error('Failed to create preSchedule, please try later.');
                    	});
                        return deferred.promise;  
            };
       
        
        $scope.getOverViewEvents = function(){
        	$scope.overViewClicked = true;
        	 $scope.teacherName = 'Entire Teachers';
        	var copyCondition ={};
			angular.copy($scope.copyCondition, copyCondition);
			copyCondition.lessonScheduleFrom = $filter('date')($('#overViewCalendar').fullCalendar('getView').start,'yyyy-MM-dd HH:mm:ss');
			copyCondition.lessonScheduleTo = $filter('date')($('#overViewCalendar').fullCalendar('getView').end,'yyyy-MM-dd HH:mm:ss');
        	 LessonHistoryService.getOverViewEvents(copyCondition).success(function(data, status, headers, config) {
         		$log.debug('getOverViewEvents***** = ' + JSON.stringify(data));
//         		$('#overViewCalendar').fullCalendar({
//         			 events:data
//         		});
         		 $('#overViewCalendar').fullCalendar('removeEvents');
          		  angular.forEach(data, function(event) {
                    $log.debug('scheduledDateTime data = ' + JSON.stringify(event.start));
                    var orginDate  = $filter('date')(event.start,'yyyy-MM-dd HH:mm');
                  	  var date = new Date(orginDate);
                    $log.debug('date= ' + JSON.stringify(date));
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
                  var newEvent =  {title: event.title,start: startDate,end: endDate,allDay: false,backgroundColor:'blue'};
                 // $scope.events.push(event);
                  $('#overViewCalendar').fullCalendar( 'updateEvent', newEvent );
                  $('#overViewCalendar').fullCalendar( 'renderEvent', newEvent );
          		  });
         	}).error(function(data, status, headers, config) {
         		AlertService.error('Failed to get lesson overview data, please try later.');
         	});
        };
        
        $scope.getTeacherViewEvents = function(teacher){
        	if(teacher){
        	$scope.teacherId = teacher.id;
        	 $scope.teacherName = teacher.user.name;
        	}
        	$scope.overViewClicked = false;
        	var copyCondition ={};
			angular.copy($scope.condition, copyCondition);
			copyCondition.lessonScheduleFrom = $filter('date')($('#overViewCalendar').fullCalendar('getView').start,'yyyy-MM-dd HH:mm:ss');
			copyCondition.lessonScheduleTo = $filter('date')($('#overViewCalendar').fullCalendar('getView').end,'yyyy-MM-dd HH:mm:ss');
			copyCondition.teacherIds = teacher.id;
			copyCondition.statuses = [];
//			var startDate = new Date(copyCondition.lessonScheduleFrom);
//			for(var i=0;i<7;i++){
//				var copyStartDate = moment(startDate).add(1000*60*60*9) ;
//				copyStartDate = moment(copyStartDate).add('days', i);   
//				for(var j=0; j<24; j++){
//					if(j!=0){
//					copyStartDate = moment(copyStartDate).add(1000*60*30);
//					}
//					var eventStartDate = new Date(copyStartDate);
//					var eventEndDate = new Date(moment(copyStartDate).add(1000*60*30));
//					 var newEvent =  {title:'IDLE',start: eventStartDate,end: eventEndDate,allDay: false,backgroundColor:'red'};
//					 $('#overViewCalendar').fullCalendar( 'renderEvent', newEvent );
//				}
//			}.
			 var  lastWeekQueryCondition = {};
			 angular.copy(copyCondition, lastWeekQueryCondition);
			 lastWeekQueryCondition.teacherId = teacher.id;
			 lastWeekQueryCondition.teacherIds = '';
			 $log.debug('getTeacherViewEvents copyCondition***** = ' + JSON.stringify(copyCondition));
             LessonHistoryService.copyLastWeek(lastWeekQueryCondition).success(function(data, status, headers, config){
            	 LessonHistoryService.getTeacherViewEvents(copyCondition).success(function(data, status, headers, config) {
              		$log.debug('getTeacherViewEvents***** = ' + JSON.stringify(data));
              		$scope.overViewClicked = false;
              		 $('#overViewCalendar').fullCalendar('removeEvents');
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
                       $('#overViewCalendar').fullCalendar( 'renderEvent', newEvent);
               		  });
              	}).error(function(data, status, headers, config) {
              		AlertService.error('Failed to get teacher lessons data, please try later.');
              	});
             }).error(function(data, status, headers, config) {
          		AlertService.error('Failed to copy lastweek schedule, please try later.');
          	});
        };
        
        $scope.displayCalendar = function(){
        	if($scope.overViewClicked){
        	    return true;
        	}else{
        		return false;
        	}
        };
        
        $scope.calendarSelectEnable = function(selectDate){
            var weekDay = moment().weekday(0);
            var isoWeekday = moment().isoWeekday(1);
        	 var nextNextMonday = moment(isoWeekday).day(15);
             var nextNextMondayDate = new Date(nextNextMonday);
        	if(selectDate>nextNextMondayDate){
        		//下下周
        		return true;
        	}else{
        		return false;
        	}
        };
        
        $scope.deliver = function(){
        	var events = $('#overViewCalendar').fullCalendar('clientEvents');
        	var lessonHistoryArray = [];
        	 angular.forEach(events, function(object) {
        		 var lessonHistory = {};
        	    if(object.status){
        	    	
        	    }else{
        	    	if(object.title=='ARRANGED'){
        	    		
        	    	}
        	    }
        	 });
        	$log.debug('111');
        };
        
        $scope.confirmDeleteLessonHistory = function(){
        	$scope.createDeleteLessonHistoryModal.destroy();
          	 //then update 后台
			   var deleteLessonHistoryId = $scope.currentEvent.id;
			   LessonHistoryService.deleteByLessonHistoryId(deleteLessonHistoryId).success(function(data, status, headers, config) {
		       		$('#overViewCalendar').fullCalendar('removeEvents', deleteLessonHistoryId);
		       		$('#overViewCalendar').fullCalendar("rerenderEvents");        
		       		AlertService.info('Lesson histroy deleted successfully!');
		       	}).error(function(data, status, headers, config) {
		       		AlertService.error('Failed to delete lesson history, please try later.');
		       	});
        };

        $scope.doOpenConfirmDeleteLessonHistoryWindow = function(lessonHistoryId) {
        	if(lessonHistoryId){
        		$scope.lessonHistoryId = lessonHistoryId;
        	}
        	  $scope.createDeleteLessonHistoryModal = $modal({
                  scope: $scope,
                  template: 'partials/history/schedule/deleteArrangementConfirmer.html',
                  backdrop: 'static'
              });
        };
        
        $scope.doSearchTeacher = function(teacherName){
        	 var teacherCondition = {};
        	 angular.copy($scope.condition, teacherCondition);
        	 teacherCondition.search = teacherName;
        	 TeacherService.list(teacherCondition).success(function(data, status, headers, config) {
           		if(data){
           		$scope.teachers = data;
           		}
           	}).error(function(data, status, headers, config) {
           		AlertService.error('Failed to upload teachers list, please try later.');
           	});
        };

});