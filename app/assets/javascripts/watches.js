//= require angular-pusher
//= require highlight.pack
//= require angular-highlightjs.js
//= require ace.js
//= require ui-ace.js
//= require json-tree.js
var watchesApp = angular.module('watchesApp', ['restangular','ui.router','doowb.angular-pusher', 'hljs','ui.ace','json-tree']).
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
    // $scope.watch.data.toString = function(){
    //   return JSON.stringify(this);
    // };
    $scope.watchDataStr = JSON.stringify($scope.watch.data);
    $scope.showing = true;
    $scope.checkSql();
  });

  $scope.preview_response = {};
  Pusher.subscribe('stats','data', function(item) {
    console.log(item);
    if (item.status == "push failed") {
      Restangular.one('api/v1/watch_responses',item.token).get().then(function(r) {
	$scope.preview_response = JSON.stringify(r, null, 2);
      });
    } else {
	$scope.preview_response = JSON.stringify(item, null, 2);
    }
  });


  $scope.state = $stateParams;

  // gets the protocol (mysql|http|) etc from the URL provided
  var getProtocol = function() {
    var url = document.createElement('a');
    url.href = $scope.watch.url;
    return url.protocol.replace(":","");
  };

  $scope.save = function() {
    $scope.watch.protocol = getProtocol();
    $scope.watch.put().then(function(r,s) {
      $scope.showing = true;
    });
  };

  $scope.toggleEdit = function() {
    $scope.showing = !$scope.showing;
  };

  $scope.preview = function() {
    console.log('preview',$scope.watch);
    $scope.watch.protocol = getProtocol();
    $scope.watch.customPUT($scope.watch,'preview').then(function(r,s) {
    });
  };

  $scope.checkSql = function() {
    $scope.isSql = $scope.watch.url.match(/^[mysql|postgres]/);
  };

}]);
