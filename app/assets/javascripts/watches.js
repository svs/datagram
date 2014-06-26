//= require angular-pusher
//= require highlight.pack
//= require angular-highlightjs.js
var watchesApp = angular.module('watchesApp', ['restangular','ui.router','doowb.angular-pusher', 'hljs']).
config(['PusherServiceProvider',
  function(PusherServiceProvider) {
    PusherServiceProvider
      .setToken('44c0d19c3ef1598f3721')
      .setOptions({});
  }
]);


watchesApp.config(function($stateProvider,$urlRouterProvider) {
  $urlRouterProvider.otherwise('/');

  $stateProvider.
    state('index',
	  {url: '/', templateUrl: "index.html"}
	 ).
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

angular.module('watchesApp').controller('watchesCtrl',['$scope','Restangular','$stateParams', function($scope, Restangular,$stateParams) {
  Restangular.all('api/v1/watches').getList().then(function(r) {
    $scope.watches = r;
    $scope.url_parser = document.createElement('a');
    $scope.url_parser.href = $scope.watches.url;
  });
}]);


angular.module('watchesApp').controller('watchCtrl',['$scope','Restangular','$stateParams', 'Pusher', function($scope, Restangular,$stateParams, Pusher) {
  Restangular.one('api/v1/watches',$stateParams.id).get().then(function(r) {
    $scope.watch = r;
    $scope.watch.data.toString = function(){
      return JSON.stringify(this);
    };
    console.log($scope.watch);
    $scope.showing = true;
  });

  $scope.preview_response = {};
  Pusher.subscribe('stats','data', function(item) {
    console.log(item);
    $scope.preview_response = JSON.stringify(item, null, 2);
  });


  $scope.state = $stateParams;

  $scope.save = function() {
    var url = document.createElement('a');
    url.href = $scope.watch.url;
    $scope.watch.protocol = url.protocol;
    $scope.watch.put().then(function(r,s) {
      $scope.showing = true;
    });
  };

  $scope.toggleEdit = function() {
    $scope.showing = !$scope.showing;
  };

  $scope.preview = function() {
    console.log('preview',$scope.watch);
    var url = document.createElement('a');
    url.href = $scope.watch.url;
    protocol = url.protocol.split(':')[0];
    $scope.watch.protocol = protocol;
    $scope.watch.customPUT($scope.watch,'preview').then(function(r,s) {
    });
  };

}]);
