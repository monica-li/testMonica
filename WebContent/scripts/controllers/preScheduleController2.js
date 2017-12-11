'use strict';

app.controller('PreScheduleController2', function($rootScope, $scope, $log, $modal, $alert, $filter, AlertService, LessonHistoryService, TeacherService, TableData) {
	
	// get teachers
	TeacherService.list({}).success(function(data, status, headers, config) {
		$log.debug('teacher = ' + JSON.stringify(data));
		$scope.teachers = data;
	}).error(function(data, status, headers, config) {
		AlertService.error('Failed to upload teachers list, please try later.');
	});
	
	$scope.scheduleTableOptions = {
		fromDate : "2014-04-21",
		toDate : "2014-04-27"
	};
});