var app = angular.module('app', ['ui.bootstrap.tabs']);

app.controller('MainCtrl', ['$scope', function($scope){
	
	//
	$scope.tabs = [
    { title:"Default tab1", content:"Default content 1" },
    { title:"Default tab2", content:"Default content 2" },
    { title:"Default tab3", content:"Default content 3" },
    { title:"Default tab4", content:"Default content 4" },
    { title:"Default tab5", content:"Default content 5" }
  ];

	$scope.tab = {};
	
	$scope.add = function(){
		$scope.tabs.push( $scope.tab );
	}

}]);