//= require angular-pusher
//= require 'checklist-model.js'
//= require highlight.pack.js
//= require angular-highlightjs.js
//= require directives.js
var streamsApp = angular.module('streamsApp', ['restangular','ui.router','checklist-model', 'hljs', 'doowb.angular-pusher', 'directives.json','ui.bootstrap', "pascalprecht.translate", "humanSeconds","ui.ace","highcharts-ng"]).
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

angular.module('streamsApp').controller('streamsCtrl',['$scope','$http','$stateParams','$timeout', '$modal',function($scope, $http,$stateParams, $timeout, $modal) {

  $scope.streams = {};
  $scope.selectedTab = null;
  $scope.load = function() {
    $scope.loading = true;
      $http.get('api/v1/streams').then(function(r) {
	  console.log(r);
      if ($scope.selectedTab === null) {
	$scope.selectedTab = r.data[5].name;
      }
      $scope.streams = r.data;
      $scope.loading = false;
      $timeout($scope.load, 60000);
    });
  };

  var loadStream = function(token) {
    $http.get('api/v1/streams/' + token).then(function(r) {
      $scope.streams[token] = r.data;
    });
  };
  $scope.load();

  $scope.setActiveTab = function(name) {
    $scope.selectedTab = name;
  }

  $scope.openNewModal = function(){
    var modalInstance = $modal.open({
      templateUrl: 'new.html',
      controller: 'newStreamCtrl',
      resolve: {
	data: {}
      }
    });
    modalInstance.result.then(function(n) {
      $scope.selectedTab = n;
      console.log('n',n);
      $scope.load();
    });
  };
}]);


angular.module('streamsApp').controller('streamCtrl',['$scope','$http','$stateParams','$timeout', function($scope, $http,$stateParams, $timeout) {
  if ($stateParams.id) {
    alert('foo');
  };

}]);

angular.module('streamsApp').controller('newStreamCtrl',['$scope','$modalInstance','data','$http', function($scope, $modalInstance, data, $http) {
  $scope.stream_sink = {name: null, stream_type: null};

  $scope.save = function() {
    $http.post('/api/v1/stream_sinks',{stream_sink: $scope.stream_sink}).then(function(r) {
      $modalInstance.close($scope.stream_sink.name);
    });
  };


}]);
