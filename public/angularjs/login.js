

var login = angular.module('login',  ['ui.router','ngRoute','ngResource']);
login.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
		$locationProvider.html5Mode(true);
		$stateProvider.state('index', {	
			url : '/',
			views: {
	            'header': {
	                templateUrl : 'templates/header.html',
	            },
	            'content': {
	                templateUrl : 'templates/login.html',
	            },
			}
		}).state('register', {	
			url : '/register',
			views: {
	            'header': {
	                templateUrl : 'templates/header.html',
	            },
	            'content': {
	                templateUrl : 'templates/register.html',
	            },
			}
		}).state('homepage', {	
			url : '/homepage',
			views: {
	            'header': {
	                templateUrl : 'templates/header1.html',
	            },
	            'content': {
	                templateUrl : 'templates/homepage.html',
	            },
			}
		})
		$urlRouterProvider.otherwise('/');
	});

login.controller('login', function($scope, $http,$state) {
	$scope.invalid_login=true;
	$scope.valid_login=true;
	$scope.invalid_data=true;
	$scope.valid_data=true;
	$scope.server_error=true;
	$scope.ind_mgmt=false;
	$scope.user={};
	$scope.Instance_Latest={};
	$scope.Instance_Table=[];
	$scope.Instance_Manage={};
	$scope.email="";
	
	
	$scope.register = function() {
		if($scope.first_name!=null && $scope.last_name!=null && $scope.email!=null && $scope.password!=null){
		$http({
			method : "POST",
			url : '/register_user',
			data : {
				"first_name" : $scope.first_name,
				"last_name" : $scope.last_name,
				"email":$scope.email,
				"password" : $scope.password,
			}
		}).success(function(data) {
			if (data.statusCode == 401) {
				$scope.server_error = false;
			}
			else{
				$scope.valid_data = false;
				$state.go('login');
			} 
		}).error(function(error) {
			$scope.validlogin = true;
			$scope.invalid_login = true;
		});
		}
		else{
			$scope.invalid_data=false;
		}
	};
	
	
	
	$scope.submit = function() {
		$http({
			method : "POST",
			url : '/check_login',
			data : {
				"username" : $scope.username,
				"password" : $scope.password
			}
		}).success(function(data) {
			//checking the response data for statusCode
			if (data.statusCode != 200) {
				$scope.invalid_login = false;
				$scope.validlogin = true;
			}
			else{
				$scope.validlogin = false;
				$scope.invalid_login = true;
				$scope.display_name=data.user.cx_firstname;
				$state.go('homepage');
			} 
		}).error(function(error) {
			$scope.validlogin = true;
			$scope.invalid_login = true;
		});
	};
	
	
	$scope.get_user=function(){
		$http({
			method : "POST",
			url : '/get_user',
			data : {}
		}).success(function(data) {
			if (data.statusCode != 200) {

			}
			else{
				$scope.display_name=data.user.cx_firstname;
				$scope.email=data.user.cx_email;
				$scope.user=data.user;
				$scope.get_Instance_Latest($scope.user.instances[$scope.user.instances.length-1].id);
				for(var i=0;i<$scope.user.instances.length;i++){
					$scope.get_Instance_Table($scope.user.instances[i].id);
				}
			} 
		}).error(function(error) {
			$scope.validlogin = true;
			$scope.invalid_login = true;
		});
	}
	
	
	$scope.get_Instance_Latest=function(id){
		console.log(id);
		$http({
			method : "POST",
			url : '/monitor_instance',
			data : {
				"id":id
			}
		}).then(function(data) {
			if (data.data.statusCode != 200) {
				
			}
			else{
				$scope.Instance_Latest=data.data.instances[0];
			} 
		});
	};
	
	
	$scope.get_Instance_Table=function(id){
		$http({
			method : "POST",
			url : '/monitor_instance',
			data : {
				"id":id
			}
		}).then(function(data) {
			if (data.data.statusCode != 200) {
				
			}
			else{
				$scope.Instance_Table.push(data.data.instances[0]);
			} 
		});
	};
	
	
	$scope.manage_Instance=function(id){
		$http({
			method : "POST",
			url : '/monitor_instance',
			data : {
				"id":id
			}
		}).then(function(data) {
			if (data.data.statusCode != 200) {
				
			}
			else{
				$scope.ind_mgmt=true;
				$scope.Instance_Manage=data.data.instances[0];
			} 
		});
	};
	
	$scope.create_instance=function(p1,p2,p3){
		$http({
			method : "POST",
			url : '/create_Instance',
			data : {
				"email":$scope.email,
				"link":p1,
				"name":p2,
				"path":p3
			}
		}).then(function(data) {
			if (data.statusCode != 200) {
				
			}
			else{
				$scope.Instance=data.instance;
			} 
		});
	};

	
	 


$scope.start_instance=function(id){
	$scope.name="";
	$scope.path="";
	for(var i=0;i<$scope.user.instances.length;i++){
		if($scope.user.instances[i].id==id){
			$scope.name=$scope.user.instances[i].name;
			$scope.path=$scope.user.instances[i].path;
		}
	}
	$http({
		method : "POST",
		url : '/start_instance',
		data : {
			"id":id,
			"name":$scope.name,
			"path":$scope.path
		}
	}).then(function(data) {
		if (data.data.statusCode != 200) {
			
		}
		else{
			
		} 
	});
};


$scope.stop_instance=function(id){
	$http({
		method : "POST",
		url : '/stop_instance',
		data : {
			"id":id
		}
	}).then(function(data) {
		if (data.data.statusCode != 200) {
			
		}
		else{
			
		} 
	});
};


$scope.reboot_instance=function(id){
	$http({
		method : "POST",
		url : '/reboot_instance',
		data : {
			"id":id
		}
	}).then(function(data) {
		if (data.data.statusCode != 200) {
			
		}
		else{
			
		} 
	});
};


$scope.terminate_instance=function(id){
	$http({
		method : "POST",
		url : '/terminate_instance',
		data : {
			"email":$scope.email,
			"id":id
		}
	}).then(function(data) {
		if (data.data.statusCode != 200) {
			
		}
		else{
			
		} 
	});
};
		
	
});
