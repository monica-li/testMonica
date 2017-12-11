'use strict';

app.filter('userStatusLocalize', function() {
	return function(input) {
		if (input === 'ENABLED') {
			return 'enabled';
		};

		if (input == 'DISABLED') {
			return 'disabled';
		};
	};
});

app.filter('isInsideLocalize', function() {
	return function(input) {
		if (input == 'INSIDE') {
			return "室内";
		};
		if (input == 'OUTSIDE') {
			return '室外';
		};
	};
});

app.filter('isTowardSunLocalize', function() {
	return function(input) {
		if (input == 'TOWARD') {
			return "是";
		};
		if (input == 'BACKWORD') {
			return '否';
		};
	};
});

app.filter('obvSiteStatusLocalize', function() {
	return function(input) {
		if (input == 'READY') {
			return "正常";
		};
		if (input == 'ERROR') {
			return '错误';
		};
		if (input == 'OFFLINE') {
			return '掉线';
		};
		if (input == 'DEACTIVE') {
			return '禁用';
		};
	};
});



app.filter('monitorDataStatus', function() {
	return function(input) {
		if (input == 'NORMAL') {
			return '正常';
		};
		if (input == 'ABNORMAL') {
			return '异常';
		};
	};
});

app.filter('instructionStatus', function() {
	return function(input) {
		if (input == 'READY') {
			return "就绪";
		};
		if (input == 'INPROGRESS') {
			return '下发中';
		};
		if (input == 'SUCCESS') {
			return '下发成功';
		};
		if (input == 'CANCLED') {
			return '取消';
		};
		if (input == 'ERROR') {
			return '错误';
		};
	};
});

app.filter('ControllerStatusLocalize', function() {
	return function(input) {
		if (input == 'READY') {
			return "正常";
		};
		if (input == 'ERROR') {
			return '异常';
		};
		if (input == 'OFFLINE') {
			return '不在线';
		};
	};
});

app.filter('OBVLocationLocalize', function() {
	return function(input) {
		if (input == 'LIVINGROOM') {
			return '客厅';
		};
		if (input == 'DINNINGROOM') {
			return '餐厅';
		};
		if (input == 'BEDROOM') {
			return '卧室';
		};
	};
});
