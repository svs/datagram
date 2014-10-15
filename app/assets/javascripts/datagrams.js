//= require angular-pusher
//= require 'checklist-model.js'
//= require highlight.pack.js
//= require angular-highlightjs.js
//= require directives.js
var datagramsApp = angular.module('datagramsApp', ['restangular','ui.router','checklist-model', 'hljs', 'doowb.angular-pusher', 'directives.json','ui.bootstrap']).
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
    $scope.datagrams = _.sortBy(r, function(s) { return s.name});
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
  var loaded = false;
  $scope.save = function() {
    baseDatagrams.post({datagram: $scope.datagram}).then(function(r) {
      $state.go('show',{id: $scope.watch.id});
    });
  };

  $scope.$watch('datagram.watch_ids.length', function(n,o) {
        if (loaded) {
            var selected_watches = _.filter($scope.watches, function(w) {
		return _.contains($scope.datagram.watch_ids, w.id) && !(_.isEmpty(w.params));
              });
            console.log('selected_watches', selected_watches);
            $scope.datagram.publish_params = _.zipObject(_.map(selected_watches,function(w) { return [w.id, w.params]}));

	} else {
	    if (!(_.isUndefined(n))) {
		loaded = true;
	    }
	}

  });

}]);

angular.module('datagramsApp').controller('datagramCtrl',['$scope','Restangular','$stateParams', '$state', 'Pusher', function($scope, Restangular, $stateParams, $state, Pusher) {

  $scope.getDatagram = function(id) {
    Restangular.one('api/v1/datagrams',id).get().then(function(r) {
      $scope.datagram = r;
    });
  };

    $scope.refresh = function() {
    console.log('PUT', $scope.datagram);
    $scope.datagram.customPUT({id:$scope.datagram.id, params: $scope.datagram.publish_params}, 'refresh' ).then(function(r) {
      console.log(r);
      Pusher.subscribe(r,'data', function(item) {
       console.log('Pusher received', item);
       $scope.getDatagram($scope.datagram.id);
      });
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

angular.module('datagramsApp').controller('editDatagramCtrl',['$scope','Restangular','$stateParams', '$state', 'Pusher', function($scope, Restangular, $stateParams, $state, Pusher) {
  var loaded = false;
    $scope.getDatagram = function(id) {
      Restangular.one('api/v1/datagrams',id).get().then(function(r) {
	$scope.datagram = r;
    });
  };

  if ($stateParams.id) {
    $scope.getDatagram($stateParams.id);
  };
  Restangular.all('api/v1/watches').getList().then(function(r) {
    $scope.watches = r;
  });

    $scope.$watch('datagram.watch_ids.length', function(n,o) {
	console.log(o,n);
	console.log(loaded);
        if (loaded) {
            var selected_watches = _.filter($scope.watches, function(w) {
		return _.contains($scope.datagram.watch_ids, w.id) && !(_.isEmpty(w.params));
              });
            console.log('selected_watches', selected_watches);
            $scope.datagram.publish_params = _.zipObject(_.map(selected_watches,function(w) { return [w.id, w.params]}));

	} else {
	    if (!(_.isUndefined(n))) {
		loaded = true;
	    }
	}
    });

  $scope.save = function() {
    $scope.datagram.save().then(function(r) {
      $state.go('show',{id: $scope.watch.id});
    });
  };



}]);
