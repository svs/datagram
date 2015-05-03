//= require directives.js

var watchesApp = angular.module('watchesApp', ['restangular','ui.router','doowb.angular-pusher',
					       'hljs', 'checklist-model','directives.json','ui.bootstrap', 'ui.ace']).
config(['PusherServiceProvider',
  function(PusherServiceProvider) {
    PusherServiceProvider
      .setToken('ab5d78a0ff96a4179917')
      .setOptions({});
  }
]);


watchesApp.config(function($stateProvider,$urlRouterProvider) {
  $urlRouterProvider.otherwise('/');

  $stateProvider.
    state('watches',
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



angular.module('watchesApp').controller('watchesCtrl',['$scope','Restangular','$stateParams', function($scope, Restangular,$stateParams) {
  Restangular.all('api/v1/watches').getList().then(function(r) {
    $scope.watches = _.sortBy(r, function(_r) { return _r.name });
    $scope.url_parser = document.createElement('a');
    $scope.url_parser.href = $scope.watches.url;
  });
}]);

angular.module('watchesApp').controller('watchCtrl',['$scope','Restangular','$stateParams', 'Pusher','$state', function($scope, Restangular,$stateParams, Pusher, $state) {
  console.log($stateParams);
  var baseWatches = Restangular.all('api/v1/watches');

  if ($stateParams.id) {
    Restangular.one('api/v1/watches',$stateParams.id).get().then(function(r) {
      $scope.watch = r;
      $scope.showing = true;
      $scope.checkSql();
      getPreview(r.token);
    });
  } else {
    Restangular.one('api/v1/watches/new').get().then(function(r) {
      $scope.watch = r;
      subscribe();
    });
  };

  var subscribe = function() {
    console.log('#Pusher subscribe to', $scope.watch.token);
    Pusher.subscribe($scope.watch.token,'data', function(item) {
      console.log("pusher sent",item);
      Restangular.one('api/v1/watch_responses',item.watch_response_token).get().then(function(r) {
	$scope.loading = false;
	console.log(r);
	$scope.watch_response = r;
      });
    });
  };

  $scope.state = $stateParams;

  // gets the protocol (mysql|http|) etc from the URL provided
  var getProtocol = function() {
    var url = document.createElement('a');
    url.href = $scope.watch.url;
    return url.protocol.replace(":","");
  };


  var beforeSave = function() {
    $scope.watch.protocol = getProtocol();
  };

  $scope.update = function() {
    beforeSave();
    console.log($scope.watch);
    $scope.watch.put().then(function(r,s) {
      $state.go('show',{id: $scope.watch.id});
    });
  };

  $scope.save = function() {
    beforeSave();
    baseWatches.post($scope.watch).then(function(r) {
      $state.go('show',{id: $scope.watch.id});
    });
  };


  $scope.toggleEdit = function() {
    $scope.showing = !$scope.showing;
  };

  $scope.preview = function() {
    $scope.loading = true;
    console.log('loading', $scope.loading);
    beforeSave();
    $scope.watch.customPUT($scope.watch,'preview').then(function(r,s) {
	console.log('preview',r);
	Pusher.subscribe(r, 'data', function(item) {
	    console.log(item);
	    Restangular.one('api/v1/watch_responses',item.watch_response_token).get().then(function(r) {
		$scope.loading = false;
		console.log(r);
		$scope.watch_response = r;
	    });
	});
    });
  };

  $scope.checkSql = function() {
    if ($scope.watch.url) {
      $scope.isSql = $scope.watch.url.match(/^[mysql|postgres]/);
    }
  };

  var getPreview = function(token) {
    Restangular.one('api/v1/watches', token).get().then(function(r) {
      $scope.watch_response = r;
	console.log(r);
    });
  };

    $scope.aceLoaded = function(_editor) {
	// Options
	_editor.setHighlightActiveLine(false);
    };

}]);
