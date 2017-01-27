//= require angular-pusher
//= require 'checklist-model.js'
//= require highlight.pack.js
//= require angular-highlightjs.js
//= require directives.js
var streamsApp = angular.module('streamsApp', ['restangular','ui.router','checklist-model', 'hljs', 'doowb.angular-pusher', 'directives.json','ui.bootstrap', "pascalprecht.translate", "humanSeconds","ui.ace","highcharts-ng","ngSanitize"]).
config(['PusherServiceProvider',
  function(PusherServiceProvider) {
    PusherServiceProvider
      .setToken('ab5d78a0ff96a4179917')
      .setOptions({});
  }
]);

angular.module('streamsApp').filter('fromNow', function() {
  return function(date) {
    return moment(date).fromNow();
  };
});


streamsApp.config(function($stateProvider,$urlRouterProvider) {
  $urlRouterProvider.otherwise('/');

  $stateProvider.
    state('index',
	  {url: '/', templateUrl: "index.html"}
	 ).
    state('show',
	  {
	    url: '/:id', templateUrl: 'show.html'
	  });
});

angular.module('streamsApp').controller('streamsCtrl',['$scope','$http','$stateParams','$timeout', function($scope, $http,$stateParams, $timeout) {

  $scope.streams = {};
  $scope.load = function() {
    $scope.loading = true;
    $http.get('api/v1/streams').then(function(r) {
      console.log(r);
      if (_.keys($scope.streams).length == 0) {
	$scope.streams = r.data;
      } else {
	console.log('r exists');
	_.map(r.data, function(a) {
	  var s = _.find($scope.streams, function(_s) { return _s.token == a.token });
	  console.log(s, a);
	  s = a;
	});
      };
      $scope.loading = false;
      $timeout($scope.load, 6000);
    });
  };

  var loadStream = function(token) {
    $http.get('api/v1/streams/' + token).then(function(r) {
      $scope.streams[token] = r.data;
    });
  };
  $scope.load();
}]);


angular.module('streamsApp').controller('streamCtrl',['$scope','$http','$stateParams','$timeout', function($scope, $http,$stateParams, $timeout) {
  if ($stateParams.id) {
    alert('foo');
  };

}]);
