//= require angular-pusher
//= require 'checklist-model.js'
//= require highlight.pack.js
//= require angular-highlightjs.js
var datagramsApp = angular.module('datagramsApp', ['restangular','ui.router','checklist-model', 'hljs', 'doowb.angular-pusher']).
config(['PusherServiceProvider',
  function(PusherServiceProvider) {
    PusherServiceProvider
      .setToken('44c0d19c3ef1598f3721')
      .setOptions({});
  }
]);




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

angular.module('datagramsApp').controller('datagramCtrl',['$scope','Restangular','$stateParams', '$state', 'Pusher', function($scope, Restangular, $stateParams, $state, Pusher) {

  var subscribed = false;

  $scope.setActiveTab = function(field) {
    $scope.activeTab = field;
    $scope.preview_response = JSON.stringify($scope.activeResponse[field], null, 2);
  };

  $scope.setActiveResponse = function(json) {
    $scope.activeResponse = json;
    $scope.preview_response = JSON.stringify($scope.activeResponse['data'], null, 2);
  };

  $scope.refresh = function() {
    console.log('PUT', $scope.datagram);
    $scope.datagram.customPUT({id:$scope.datagram.id}, 'refresh' ).then(function(r) {
      if (!subscribed) {
	subscribed = true;
	Pusher.subscribe($scope.datagram.token,'data', function(item) {
	  console.log('Pusher received', item);
	  $scope.getDatagram($scope.datagram.id);
	});
      }
    });
  };

  $scope.getDatagram = function(id) {
    $scope.activeResponse = {};
    Restangular.one('api/v1/datagrams',id).get().then(function(r) {
      $scope.datagram = r;
      console.log(r);
      $scope.activeResponse = r.responses[0];
      $scope.setActiveTab('data');
      if (!subscribed) {
	subscribed = true;
	Pusher.subscribe($scope.datagram.token,'data', function(item) {
	  console.log('Pusher received', item);
	  $scope.getDatagram($scope.datagram.id);
	});
      };
    });
  };

  var refreshWatchResponses = function() {
    _.each($scope.datagram.watches, function(w,i) {
      console.log('subscribing to ', w.token);

    });
  };

  if ($stateParams.id) {
    $scope.getDatagram($stateParams.id);
  };


}]);
