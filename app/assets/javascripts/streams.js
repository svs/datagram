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
	 );
});

angular.module('streamsApp').controller('streamsCtrl',['$scope','$http','$stateParams','$timeout', function($scope, $http,$stateParams, $timeout) {
  var load = function() {
    $('#loading').show();
    $http.get('api/v1/streams').then(function(r) {
      $scope.streams = _.sortBy(r.data, function(s) { return s.name});
      console.log($scope.streams);
      $('#loading').hide();
      $timeout(load, 60000);

    });
  };
  load();
}]);
