//= require angular-pusher
//= require 'checklist-model.js'
//= require highlight.pack.js
//= require angular-highlightjs.js
//= require directives.js
var wizardApp = angular.module('wizardApp', ['restangular','ui.router','checklist-model', 'hljs', 'doowb.angular-pusher', 'directives.json','ui.bootstrap', "pascalprecht.translate", "humanSeconds","ngMaterial","ui.ace","md.data.table","mgo-angular-wizard","highcharts-ng","ngSanitize"]).
config(['PusherServiceProvider',
  function(PusherServiceProvider) {
    PusherServiceProvider
      .setToken('ab5d78a0ff96a4179917')
      .setOptions({});
  }
       ]).config(['$mdThemingProvider',function($mdThemingProvider) {
  $mdThemingProvider.setDefaultTheme('');
}]);;

angular.module('wizardApp').filter('fromNow', function() {
  return function(date) {
    return moment(date).fromNow();
  };
});


wizardApp.config(function($stateProvider,$urlRouterProvider) {
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


angular.module('wizardApp').controller('wizardCtrl',['$scope','$http','$stateParams', '$state', 'Pusher',function($scope, $http, $stateParams, $state, Pusher) {
  $scope.watch = {};
  $scope.source = {};
  $scope.datagram = {};

  $http.get('/api/v1/watches').then(function(r) {
    $scope.watches = r.data;
  });
  $http.get('/api/v1/datagrams/new').then(function(r) {
    $scope.datagram = r.data;
  });
  $http.get('/api/v1/sources').then(function(r) {
    console.log('sources',r);
    $scope.sources = r.data;
  });
  $http.get('/api/v1/sources/new').then(function(r) {
    $scope.source = r.data;
    $scope.setSource();
  });

  $scope.newSource = {url: null};

  $scope.setSource = function() {
    console.log('sourceId',$scope.watch.source_id);
    if ($scope.watch.source_id) {
      $scope.source = _.find($scope.sources, function(s) { return s.id = $scope.watch.source_id});
      console.log('source selected', $scope.watch.source_id, $scope.source);
    } else {
      $scope.source = $scope.newSource;
    }
    $scope.checkSql();

  }

  $scope.checkSql = function() {
    console.log($scope.newSource);
    console.log($scope.source);
    $scope.source.protocol = ($scope.source._id ? $scope.source.protocol : $scope.source.url.split(":")[0]);
    $scope.isSql =  $scope.source.protocol == "mysql" || $scope.source.protocol == "postgres" || $scope.source.protocol == "redshift";
    console.log('isSql', $scope.isSql);
  };

  $scope.saveAndProceed = function() {
    $http.post('api/v1/wizard',{wizard: {watch: $scope.watch, source: $scope.source}}).then(function(r) {
      console.log(r);
    }, function(e) { console.log(e)});
  };


  $scope.preview = function() {
    $scope.loading = true;
    console.log('loading', $scope.loading);
    $scope.watch.url=$scope.source.url;
    $http.put('/api/v1/w/preview', {watch: $scope.watch}).then(function(r,s) {
      console.log(r);
      console.log('subscribing to previews on ',r.data.refresh_channel);
      Pusher.subscribe(r.data.refresh_channel, 'data', function(item) {
	console.log('wr token',item.watch_response_token);
	$http.get('/api/v1/watch_responses/' + item.watch_response_token).then(function(r) {
	  $scope.loading = false;
	  $scope.watch_response = r.data;
	});
      });
    });
  };

  $scope.$watch('watch',function(o,n,s) {
    console.log(n);
  });

  var loaded = false;
  $scope.selectedWatches = [];

}]);
