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
  $mdThemingProvider.setDefaultTheme('amber');
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
  $http.get('api/v1/watches').then(function(r) {
    $scope.watches = r.data;
  });
  $http.get('api/v1/datagrams/new').then(function(r) {
    $scope.datagram = r.data;
  });
  $http.get('api/v1/sources').then(function(r) {
    $scope.sources = r.data;
  });
  $http.get('api/v1/sources/new').then(function(r) {
    $scope.source = r.data;
    $scope.source.url="postgres://api:api@localhost/api_development";
    $scope.checkSql();
  });

  $scope.watch = {};
  $scope.source = {};
  $scope.datagram = {};

  $scope.checkSql = function() {
    $scope.source.protocol = $scope.source.url.split(":")[0];
    $scope.isSql =  $scope.source.protocol == "mysql" || $scope.source.protocol == "postgres" || $scope.source.protocol == "redshift";
  };


  $scope.preview = function() {
    $scope.loading = true;
    console.log('loading', $scope.loading);
    $scope.watch.url=$scope.source.url;
    $http.put('api/v1/watches/preview', {watch: $scope.watch}).then(function(r,s) {
      console.log(r);
      console.log('subscribing to previews on ',r.data.token);
      Pusher.subscribe(r.data.token, 'data', function(item) {
	console.log(item);
	$http.get('api/v1/watch_responses',item.watch_response_token).then(function(r) {
	  $scope.loading = false;
	  $scope.watch_response = r.data;
	});
      });
    });
  };



  var loaded = false;
  $scope.save = function() {
    baseDatagrams.post({datagram: $scope.datagram}).then(function(r) {
      $state.go('show',{id: r.id});
    });
  };
  $scope.selectedWatches = [];
  $scope.onSelect = function(a) {
    $scope.datagram.watch_ids = _.map($scope.selectedWatches, function(w) { return w.id;});
    console.log($scope.datagram.watch_ids);
    var ps = _.map($scope.selectedWatches,function(w) { return w.params});
    console.log(ps);
    $scope.datagram.publish_params = _.reduce(ps, function(sum, n) {
      console.log('n',n);
      console.log('sum',sum);
      if (!sum) { sum = {}};
      return _.merge(sum,n);
    });

  };

}]);
