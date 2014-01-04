var app = angular.module('app', ['ui.bootstrap.tabs']);

app.controller('MainCtrl', ['$scope', function($scope){
	
	//
	$scope.tabs = [
    { title:"Default tab1", content:"Default content 1" },
    { title:"Default tab2", content:"Default content 2" },
  ];

	$scope.tab = {};
	
	$scope.add = function(){
		$scope.tabls.push( $scope.tab );
	}

}]);