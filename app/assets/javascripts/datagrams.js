//= require 'checklist-model.js'
//= require highlight.pack
//= require angular-highlightjs.js
var datagramsApp = angular.module('datagramsApp', ['restangular','ui.router','checklist-model', 'hljs']);


datagramsApp.config(function($stateProvider,$urlRouterProvider) {
  $urlRouterProvider.otherwise('/');

  $stateProvider.
    state('index',
	  {url: '/', templateUrl: "index.html"}
	 ).
    state('new',
	  {
	    url: '/new',
	    templateUrl: 'new.html'
	  }).
    state('show',
	  {
	    url: '/:id',
	    templateUrl: 'show.html'
	  }).
    state('edit',
	  {
	    url: '/:id/edit',
	    templateUrl: 'edit.html'
	  });

});

angular.module('datagramsApp').controller('datagramsCtrl',['$scope','Restangular','$stateParams', function($scope, Restangular,$stateParams) {
  Restangular.all('api/v1/datagrams').getList().then(function(r) {
    console.log(r);
    $scope.datagrams = r;
  });
}]);

angular.module('datagramsApp').controller('newDatagramCtrl',['$scope','Restangular','$stateParams', '$state', function($scope, Restangular, $stateParams, $state) {
  Restangular.all('api/v1/watches').getList().then(function(r) {
    $scope.watches = r;
  });
  Restangular.one('api/v1/datagrams/new').get().then(function(r) {
    $scope.datagram = r;
  });

  var baseDatagrams = Restangular.all('api/v1/datagrams');

  $scope.save = function() {
    baseDatagrams.post({datagram: $scope.datagram}).then(function(r) {
      $state.go('show',{id: $scope.watch.id});
    });
  };
}]);

angular.module('datagramsApp').controller('datagramCtrl',['$scope','Restangular','$stateParams', '$state', function($scope, Restangular, $stateParams, $state) {
  if ($stateParams.id) {
    Restangular.one('api/v1/datagrams',$stateParams.id).get().then(function(r) {
      $scope.datagram = r;
      $scope.preview_responses = JSON.stringify(r.responses, null, 2);
    });
  };
}]);
