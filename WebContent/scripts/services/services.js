'use strict';

var contextURL = "http://47.92.123.34:8080/api";

app.factory('AlertService', function($alert) {
	return {
		info : function(message) {
			$alert({title: message, placement: 'top-right', type: 'info', show: true, duration: 3});
		},
		
		error : function(message) {
			$alert({title: message, placement: 'top-right', type: 'danger', show: true, duration: 5});
		}
	};
});

app.factory('AuthService', function($log, $http, $rootScope) {
	var serviceURL = contextURL + "/public/management/auth";
	
	return {
		login : function(credential) {
			return  $http.post(serviceURL + "/login", credential);
		},
		hasLogin : function() {
			if($rootScope.userId) {
				return true;
			}else{
				return false;
			}
		}
	};
});

app.factory('UserService', function($log, $http) {
	var serviceURL = contextURL + "/private/users";
	
	return {
		logout : function(id) {
			return $http({ url: serviceURL + "/logout", method: "GET", params: {id : id}});
		},
		
		count : function(condition) {
			return $http({ url: serviceURL + "/count", method: "GET", params: condition});
		},
		
		list : function(condition) {
			return $http({ url: serviceURL + "/list", method: "GET", params: condition});
		},
		
		find : function(id) {
			return $http({ url: serviceURL + "/find", method: "GET", params: {id: id}});
		},
		
		create : function(user) {
			return $http.post(serviceURL, user);
		},
		
		update : function(user) {
			return $http.put(serviceURL, user);
		},
		
		archive : function(user) {
			return $http.put(serviceURL + "/archive", user);
		},
		
		resetPassword : function(resetter) {
			return $http.post(serviceURL + "/restPassword", resetter);
		}
	};
});

app.factory('CompanyService', function($log, $http) {
	var serviceURL = contextURL + "/private/ry/companys";
	
	return {
		count : function(condition) {
			return $http({ url: serviceURL + "/count", method: "GET", params: condition});
		},
		
		list : function(condition) {
			return $http({ url: serviceURL + "/list", method: "GET", params: condition});
		},
		
		find : function(id) {
			return $http({ url: serviceURL + "/find", method: "GET", params: {id: id}});
		},
		
		create : function(company) {
			return $http.post(serviceURL, company);
		},
		
		update : function(company) {
			return $http.put(serviceURL, company);
		},
		
		archive : function(company) {
			return $http.put(serviceURL + "/archive", company);
		},
		
		resetPassword : function(resetter) {
			return $http.post(serviceURL + "/restPassword", resetter);
		}
	};
});


app.factory('OperatorService', function($log, $http) {
	var serviceURL = contextURL + "/private/operators";
	
	return {
		count : function(condition) {
			return $http({ url: serviceURL + "/count", method: "GET", params: condition});
		},
		
		list : function(condition) {
			return $http({ url: serviceURL + "/list", method: "GET", params: condition});
		},
		
		find : function(id) {
			return $http({ url: serviceURL + "/find", method: "GET", params: {id: id}});
		},
		
		create : function(operator) {
			return $http.post(serviceURL, operator);
		},
		
		update : function(operator) {
			return $http.put(serviceURL, operator);
		},
		
		archive : function(operator) {
			return $http.put(serviceURL + "/archive", user);
		},
		
		resetPassword : function(resetter) {
			return $http.post(serviceURL + "/restPassword", resetter);
		}
	};
});

app.factory('ProjectService', function($log, $http) {
	var serviceURL = contextURL + "/private/ry/project";
	
	return {
		count : function(condition) {
			return $http({ url: serviceURL + "/count", method: "GET", params: condition});
		},
		
		list : function(condition) {
			return $http({ url: serviceURL + "/list", method: "GET", params: condition});
		},
		
		find : function(id) {
			return $http({ url: serviceURL + "/find", method: "GET", params: {id: id}});
		},
		findByUserId : function(userId){
			return $http({url: serviceURL + "/findByUserId", method: "GET", params: {userId: userId}});
		},
		create : function(project) {
			return $http.post(serviceURL, project);
		},
		
		update : function(project) {
			return $http.put(serviceURL, project);
		},
		
		archive : function(project) {
			return $http.put(serviceURL + "/archive", project);
		}
	};
});

app.factory('BuildingService', function($log, $http) {
	var serviceURL = contextURL + "/private/ry/building";
	
	return {
		count : function(condition) {
			return $http({ url: serviceURL + "/count", method: "GET", params: condition});
		},
		
		list : function(condition) {
			return $http({ url: serviceURL + "/list", method: "GET", params: condition});
		},
		
		find : function(id) {
			return $http({ url: serviceURL + "/find", method: "GET", params: {id: id}});
		},
		findByProjectId : function(projectId){
			return $http({url: serviceURL + "/findByProjectId", method: "GET", params: {projectId: projectId}});
		},
		create : function(building) {
			return $http.post(serviceURL, building);
		},
		
		update : function(building) {
			return $http.put(serviceURL, building);
		},
		
		archive : function(building) {
			return $http.put(serviceURL + "/archive", building);
		}
	};
});

app.factory('SessionService', function($log, $http) {
	var serviceURL = contextURL + "/private/ry/session";
	
	return {
		count : function(condition) {
			return $http({ url: serviceURL + "/count", method: "GET", params: condition});
		},
		
		list : function(condition) {
			return $http({ url: serviceURL + "/list", method: "GET", params: condition});
		},
		
		find : function(id) {
			return $http({ url: serviceURL + "/find", method: "GET", params: {id: id}});
		},
		findByProjectId : function(projectId){
			return $http({url: serviceURL + "/findByProjectId", method: "GET", params: {projectId: projectId}});
		},
		create : function(session) {
			return $http.post(serviceURL, session);
		},
		
		update : function(session) {
			return $http.put(serviceURL, session);
		},
		
		archive : function(session) {
			return $http.put(serviceURL + "/archive", session);
		}
	};
});

app.factory('OBVSiteService', function($log, $http) {
	var serviceURL = contextURL + "/private/ry/obvsite";
	
	return {
		count : function(condition) {
			return $http({ url: serviceURL + "/count", method: "GET", params: condition});
		},
		
		list : function(condition) {
			return $http({ url: serviceURL + "/list", method: "GET", params: condition});
		},
		
		find : function(id) {
			return $http({ url: serviceURL + "/find", method: "GET", params: {id: id}});
		},
		findByProjectId : function(projectId){
			return $http({url: serviceURL + "/findByProjectId", method: "GET", params: {projectId: projectId}});
		},
		create : function(obvsite) {
			return $http.post(serviceURL, obvsite);
		},
		
		update : function(obvsite) {
			return $http.put(serviceURL, obvsite);
		},
		
		archive : function(obvsite) {
			return $http.put(serviceURL + "/archive", obvsite);
		},
		disable : function(obvsite) {
			return $http.put(serviceURL + "/disable", obvsite);
		}
	};
});

app.factory('BoilingService', function($log, $http) {
	var serviceURL = contextURL + "/private/ry/boiling";
	
	return {
		count : function(condition) {
			return $http({ url: serviceURL + "/count", method: "GET", params: condition});
		},
		
		list : function(condition) {
			return $http({ url: serviceURL + "/list", method: "GET", params: condition});
		},
		listBoilingWorkStatus : function(projectId){
			return $http({url: serviceURL + "/listBoilingWorkStatus", method: "GET", params: {projectId: projectId}});
		},
		
		find : function(id) {
			return $http({ url: serviceURL + "/find", method: "GET", params: {Id: id}});
		},
		findByProjectId : function(projectId){
			return $http({url: serviceURL + "/findByProjectId", method: "GET", params: {projectId: projectId}});
		},
		listBoilingWorkStatus: function(projectId){
			return $http({url: serviceURL + "/listBoilingWorkStatus", method: "GET", params: {projectId: projectId}});
		},
		create : function(boiling) {
			return $http.post(serviceURL, boiling);
		},
		
		update : function(boiling) {
			return $http.put(serviceURL, boiling);
		},
		
		archive : function(boiling) {
			return $http.put(serviceURL + "/archive", boiling);
		}
	};
});

app.factory('BoilingGroupService', function($log, $http) {
	var serviceURL = contextURL + "/private/ry/boilinggroup";
	
	return {
		count : function(condition) {
			return $http({ url: serviceURL + "/count", method: "GET", params: condition});
		},
		
		list : function(condition) {
			return $http({ url: serviceURL + "/list", method: "GET", params: condition});
		},
		listBoilingWorkStatus : function(projectId){
			return $http({url: serviceURL + "/listBoilingWorkStatus", method: "GET", params: {projectId: projectId}});
		},
		
		find : function(id) {
			return $http({ url: serviceURL + "/find", method: "GET", params: {id: id}});
		},
		findByProjectId : function(projectId){
			return $http({url: serviceURL + "/findByProjectId", method: "GET", params: {projectId: projectId}});
		},
		listBoilingWorkStatus: function(projectId){
			return $http({url: serviceURL + "/listBoilingWorkStatus", method: "GET", params: {projectId: projectId}});
		},
		create : function(boilingGroup) {
			return $http.post(serviceURL, boilingGroup);
		},
		
		update : function(boilingGroup) {
			return $http.put(serviceURL, boilingGroup);
		},
		
		archive : function(boilingGroup) {
			return $http.put(serviceURL + "/archive", boilingGroup);
		}
	};
});

app.factory('BoilingWorkService', function($log, $http) {
	var serviceURL = contextURL + "/private/ry/boiling";
	
	return {
		count : function(condition) {
			return $http({ url: serviceURL + "/count", method: "GET", params: condition});
		},
		
		list : function(condition) {
			return $http({ url: serviceURL + "/list", method: "GET", params: condition});
		},
		
		find : function(id) {
			return $http({ url: serviceURL + "/find", method: "GET", params: {id: id}});
		},
		findByProjectId : function(projectId){
			return $http({url: serviceURL + "/findByProjectId", method: "GET", params: {projectId: projectId}});
		},
		create : function(boilingWork) {
			return $http.post(serviceURL, boilingWork);
		},
		
		update : function(boilingWork) {
			return $http.put(serviceURL, boilingWork);
		},
		
		archive : function(boilingWork) {
			return $http.put(serviceURL + "/archive", boilingWork);
		}
	};
});

app.factory('MonitorDatasService', function($log, $http) {
	var serviceURL = contextURL + "/private/ry/monitordata";
	
	return {
		count : function(condition) {
			return $http({ url: serviceURL + "/count", method: "GET", params: condition});
		},
		
		list : function(condition) {
			return $http({ url: serviceURL + "/list", method: "GET", params: condition});
		},
		
		find : function(id) {
			return $http({ url: serviceURL + "/find", method: "GET", params: {id: id}});
		},
		findByProjectId : function(projectId){
			return $http({url: serviceURL + "/findByProjectId", method: "GET", params: {projectId: projectId}});
		},
		create : function(monitorData) {
			return $http.post(serviceURL, monitorData);
		},
		
		update : function(monitorData) {
			return $http.put(serviceURL, monitorData);
		},
		
		archive : function(monitorData) {
			return $http.put(serviceURL + "/archive", monitorData);
		},
		doExport : function(condition) {
			return $http({ url: serviceURL + "/export", method: "GET", params: condition});
		}
	};
});

app.factory('WMonitorDatasService', function($log, $http) {
	var serviceURL = contextURL + "/private/ry/wmonitordata";
	
	return {
		count : function(condition) {
			return $http({ url: serviceURL + "/count", method: "GET", params: condition});
		},
		
		list : function(condition) {
			return $http({ url: serviceURL + "/list", method: "GET", params: condition});
		},
		
		find : function(id) {
			return $http({ url: serviceURL + "/find", method: "GET", params: {id: id}});
		},
		findByProjectId : function(projectId){
			return $http({url: serviceURL + "/findByProjectId", method: "GET", params: {projectId: projectId}});
		},
		create : function(wMonitorData) {
			return $http.post(serviceURL, wMonitorData);
		},
		
		update : function(wMonitorData) {
			return $http.put(serviceURL, wMonitorData);
		},
		
		archive : function(wMonitorData) {
			return $http.put(serviceURL + "/archive", wMonitorData);
		}
	};
});

app.factory('InstructionService', function($log, $http) {
	var serviceURL = contextURL + "/private/ry/instruction";
	
	return {
		count : function(condition) {
			return $http({ url: serviceURL + "/count", method: "GET", params: condition});
		},
		
		list : function(condition) {
			return $http({ url: serviceURL + "/list", method: "GET", params: condition});
		},
		
		find : function(id) {
			return $http({ url: serviceURL + "/find", method: "GET", params: {id: id}});
		},
		findByProjectId : function(projectId){
			return $http({url: serviceURL + "/findByProjectId", method: "GET", params: {projectId: projectId}});
		},
		archive : function(instruction) {
			return $http.put(serviceURL + "/archive", instruction);
		}
	};
});

app.factory('ControllerService', function($log, $http) {
	var serviceURL = contextURL + "/private/ry/dispatchcontroller";
	
	return {
		count : function(condition) {
			return $http({ url: serviceURL + "/count", method: "GET", params: condition});
		},
		
		list : function(condition) {
			return $http({ url: serviceURL + "/list", method: "GET", params: condition});
		},
		
		find : function(id) {
			return $http({ url: serviceURL + "/find", method: "GET", params: {id: id}});
		},
		findByProjectId : function(projectId){
			return $http({url: serviceURL + "/findByProjectId", method: "GET", params: {projectId: projectId}});
		},
		create : function(boiling) {
			return $http.post(serviceURL, boiling);
		},
		
		update : function(boiling) {
			return $http.put(serviceURL, boiling);
		},
		
		archive : function(boiling) {
			return $http.put(serviceURL + "/archive", boiling);
		}
	};
});

app.factory('RunningDataService', function($log, $http) {
	var serviceURL = contextURL + "/private/ry/runningdatas";
	
	return {
		count : function(condition) {
			return $http({ url: serviceURL + "/count", method: "GET", params: condition});
		},
		
		list : function(condition) {
			return $http({ url: serviceURL + "/list", method: "GET", params: condition});
		},
		
		find : function(id) {
			return $http({ url: serviceURL + "/find", method: "GET", params: {id: id}});
		},
		findByProjectId : function(projectId){
			return $http({url: serviceURL + "/findByProjectId", method: "GET", params: {projectId: projectId}});
		},
		listCurrentDayRunningDatas : function(projectId){
			return $http({url:serviceURL + "/listCurrentDayRunningDatas", method: "GET", params: {projectId: projectId}});
		},
		create : function(boiling) {
			return $http.post(serviceURL, boiling);
		},
		
		update : function(boiling) {
			return $http.put(serviceURL, boiling);
		},
		
		archive : function(boiling) {
			return $http.put(serviceURL + "/archive", boiling);
		}
	};
});

app.factory('DayDataService', function($log, $http) {
	var serviceURL = contextURL + "/private/ry/daydata";
	
	return {
		count : function(condition) {
			return $http({ url: serviceURL + "/count", method: "GET", params: condition});
		},
		
		list : function(condition) {
			return $http({ url: serviceURL + "/list", method: "GET", params: condition});
		},
		
		find : function(id) {
			return $http({ url: serviceURL + "/find", method: "GET", params: {id: id}});
		},
		findByProjectId : function(projectId){
			return $http({url: serviceURL + "/findByProjectId", method: "GET", params: {projectId: projectId}});
		},
		listByProject: function(condition) {
			return $http({ url: serviceURL + "/listByProject", method: "GET", params: condition});
		},
		uploadHistoryData : function(fileType, file, projectId) {
			var formData = new FormData();
			formData.append('fileType', fileType);
			formData.append('file', file);
			formData.append('projectId', projectId);
	        return $http.post(serviceURL + "/uploadHistoryData", formData, { transformRequest: angular.identity, headers: {'Content-Type': undefined} });
		},
		create : function(daydata) {
			return $http.post(serviceURL, daydata);
		},
		
		update : function(daydata) {
			return $http.put(serviceURL, daydata);
		},
		
		archive : function(daydata) {
			return $http.put(serviceURL + "/archive", daydata);
		}
	};
});

app.factory('WeekDataService', function($log, $http) {
	var serviceURL = contextURL + "/private/ry/weekdata";
	
	return {
		count : function(condition) {
			return $http({ url: serviceURL + "/count", method: "GET", params: condition});
		},
		
		list : function(condition) {
			return $http({ url: serviceURL + "/list", method: "GET", params: condition});
		},
		
		find : function(id) {
			return $http({ url: serviceURL + "/find", method: "GET", params: {id: id}});
		},
		findByProjectId : function(projectId){
			return $http({url: serviceURL + "/findByProjectId", method: "GET", params: {projectId: projectId}});
		},
		create : function(weekdata) {
			return $http.post(serviceURL, weekdata);
		},
		
		update : function(weekdata) {
			return $http.put(serviceURL, weekdata);
		},
		
		archive : function(weekdata) {
			return $http.put(serviceURL + "/archive", weekdata);
		}
	};
});

app.factory('MonthDataService', function($log, $http) {
	var serviceURL = contextURL + "/private/ry/monthdata";
	
	return {
		count : function(condition) {
			return $http({ url: serviceURL + "/count", method: "GET", params: condition});
		},
		
		list : function(condition) {
			return $http({ url: serviceURL + "/list", method: "GET", params: condition});
		},
		
		find : function(id) {
			return $http({ url: serviceURL + "/find", method: "GET", params: {id: id}});
		},
		findByProjectId : function(projectId){
			return $http({url: serviceURL + "/findByProjectId", method: "GET", params: {projectId: projectId}});
		},
		create : function(monthdata) {
			return $http.post(serviceURL, monthdata);
		},
		
		update : function(monthdata) {
			return $http.put(serviceURL, monthdata);
		},
		
		archive : function(monthdata) {
			return $http.put(serviceURL + "/archive", monthdata);
		}
	};
});

app.factory('SessionDataService', function($log, $http) {
	var serviceURL = contextURL + "/private/ry/sessiondatas";
	
	return {
		count : function(condition) {
			return $http({ url: serviceURL + "/count", method: "GET", params: condition});
		},
		
		list : function(condition) {
			return $http({ url: serviceURL + "/list", method: "GET", params: condition});
		},
		
		find : function(id) {
			return $http({ url: serviceURL + "/find", method: "GET", params: {id: id}});
		},
		findByProjectId : function(projectId){
			return $http({url: serviceURL + "/findByProjectId", method: "GET", params: {projectId: projectId}});
		},
		create : function(sessiondata) {
			return $http.post(serviceURL, sessiondata);
		},
		
		update : function(sessiondata) {
			return $http.put(serviceURL, sessiondata);
		},
		
		archive : function(sessiondata) {
			return $http.put(serviceURL + "/archive", sessiondata);
		}
	};
});

app.factory('InterventionService', function($log, $http) {
	var serviceURL = contextURL + "/private/ry/intervention";
	
	return {
		set : function(intervention) {
			return $http.post(serviceURL, intervention);
		}
	};
});
	
app.factory('MetaMonitorDataService', function($log, $http) {
	var serviceURL = contextURL + "/private/ry/metamonitordata";
	
	return {
		findCurrentMonitorData : function(condition) {
			return $http({ url: serviceURL + "/findCurrentMonitorData", method: "GET", params: condition});
		}
	};
});

app.factory('MetaWMonitorDataService', function($log, $http) {
	var serviceURL = contextURL + "/private/ry/metawmonitordata";
	
	return {
		findCurrentMonitorData : function(condition) {
			return $http({ url: serviceURL + "/findCurrentWMonitorData", method: "GET", params: condition});
		}
	};
});

app.factory('WeatherService', function($log, $http) {
	var serviceURL = contextURL + "/private/ry/weather";
	
	return {
		count : function(condition) {
			return $http({ url: serviceURL + "/count", method: "GET", params: condition});
		},
		
		list : function(condition) {
			return $http({ url: serviceURL + "/list", method: "GET", params: condition});
		},
		
		find : function(id) {
			return $http({ url: serviceURL + "/find", method: "GET", params: {id: id}});
		},
		findByProjectId : function(projectId){
			return $http({url: serviceURL + "/findByProjectId", method: "GET", params: {projectId: projectId}});
		},
		create : function(weather) {
			return $http.post(serviceURL, weather);
		},
		
		update : function(weather) {
			return $http.put(serviceURL, weather);
		},
		
		del : function(weather) {
			return $http.put(serviceURL + "/delete", weather);
		}
	};
});

app.factory('PredictDataService', function($log, $http) {
	var serviceURL = contextURL + "/private/ry/predict";
	
	return {
		count : function(condition) {
			return $http({ url: serviceURL + "/count", method: "GET", params: condition});
		},
		
		list : function(condition) {
			return $http({ url: serviceURL + "/list", method: "GET", params: condition});
		},
		
		find : function(id) {
			return $http({ url: serviceURL + "/find", method: "GET", params: {id: id}});
		},
		findByProjectId : function(projectId){
			return $http({url: serviceURL + "/findByProjectId", method: "GET", params: {projectId: projectId}});
		}
	};
});

app.factory('FileService', function($log, $http) {
	var serviceURL = contextURL + "/private/file";
	return {
		upload : function(fileType, file) {
			var formData = new FormData();
			formData.append('fileType', fileType);
			formData.append('file', file);
	        return $http.post(serviceURL + "/upload", formData, { transformRequest: angular.identity, headers: {'Content-Type': undefined} });
		}
	};
});
