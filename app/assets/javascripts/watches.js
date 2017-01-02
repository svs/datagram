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

angular.module('watchesApp').controller('watchCtrl',['$scope','Restangular','$stateParams', 'Pusher','$state', '$http', '$location',
						     function($scope, Restangular,$stateParams, Pusher, $state, $http, $location) {
  console.log($stateParams);
  var baseWatches = Restangular.all('api/v1/watches');
    var subscribed = false;
    var previewSubscribed = false;
    var loadSources = function() {
	Restangular.all('api/v1/sources').getList().then(function(r) {
	    $scope.sources = r;
	    $scope.checkSql();
	});
    };

  if ($stateParams.id) {
    $http.get('api/v1/watches/' + $stateParams.id).then(function(r) {
      $scope.watch = r.data;
      console.log($scope.watch);
      $scope.showing = true;
      loadSources();
      console.log('r',r);
	getPreview(r.data.token);
    });
  } else {
    $http.get('api/v1/watches/new').then(function(r) {
      $scope.watch = r.data;
      loadSources();
      subscribe();
    });
  };

  var subscribe = function() {
    if (!subscribed) {
	console.log('#Pusher subscribe to', $scope.watch.token);
	subscribed = true;
	Pusher.subscribe($scope.watch.token,'data', function(item) {
	    console.log("pusher sent",item);
	    Restangular.one('api/v1/watch_responses',item.watch_response_token).get().then(function(r) {
		$scope.loading = false;
		$scope.watch_response = r;
	    });
	});
    }
  };

  $scope.state = $stateParams;

  $scope.update = function() {
    console.log($scope.watch);
    $http.put('/api/v1/watches/'+$scope.watch.id, {watch: _.clone($scope.watch)}).then(function(r) {

      $state.go('show',{id: $scope.watch.id});
    });
  };

  $scope.save = function(asDatagram) {
    $http.post('/api/v1/watches',{watch: _.clone($scope.watch), asDatagram: asDatagram}).then(function(r) {
      console.log(r);
      if (asDatagram) {
	window.location = "/datagrams#/" + r.data.datagram.id;
      } else {
	$scope.watch.id = r.data.watch.id;
	$state.go('show',{id: $scope.watch.id});
      }
    });
  };


  $scope.toggleEdit = function() {
    $scope.showing = !$scope.showing;
  };

  $scope.preview = function() {
    $scope.loading = true;
    console.log('loading', $scope.watch);
    $http.put('/api/v1/watches/'+$scope.watch.id + '/preview', {watch: _.clone($scope.watch)}).then(function(r,s) {
      console.log(r,s);
	if (!previewSubscribed) {
	    previewSubscribed = true;
	    console.log('subscribing to previews on ',r.data.token);
	    Pusher.subscribe(r.data.token, 'data', function(item) {
		console.log(item);
		Restangular.one('api/v1/watch_responses',item.watch_response_token).get().then(function(r) {
		    $scope.loading = false;
		    $scope.watch_response = r;
		});
	    });
	}
    });
  };


  var getPreview = function(token) {
    console.log('getPreview', token);
    Restangular.one('api/v1/watches', token).get().then(function(r) {
      $scope.watch_response = r;
	console.log(r);
    });
  };

    $scope.aceLoaded = function(_editor) {
	// Options
	_editor.setHighlightActiveLine(false);
    };

    $scope.checkSql = function() {
	var source = _.find($scope.sources, function(i) { return i.id == $scope.watch.source_id;});
	console.log("source",source);
	$scope.watch.protocol = source.protocol;
	$scope.isSql =  $scope.watch.protocol == "mysql" || $scope.watch.protocol == "postgres" || $scope.watch.protocol == "redshift";
    };

}]);
