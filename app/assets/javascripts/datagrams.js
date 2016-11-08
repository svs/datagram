//= require angular-pusher
//= require 'checklist-model.js'
//= require highlight.pack.js
//= require angular-highlightjs.js
//= require directives.js
var datagramsApp = angular.module('datagramsApp', ['restangular','ui.router','checklist-model', 'hljs', 'doowb.angular-pusher', 'directives.json','ui.bootstrap', "pascalprecht.translate", "humanSeconds","ui.ace","highcharts-ng"]).
config(['PusherServiceProvider',
  function(PusherServiceProvider) {
    PusherServiceProvider
      .setToken('ab5d78a0ff96a4179917')
      .setOptions({});
  }
]);

angular.module('datagramsApp').filter('fromNow', function() {
  return function(date) {
    return moment(date).fromNow();
  };
});


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

angular.module('datagramsApp').controller('datagramsCtrl',['$scope','Restangular','$stateParams','$timeout', function($scope, Restangular,$stateParams, $timeout) {
  var load = function() {
    $('#loading').show();
    Restangular.all('api/v1/datagrams').getList().then(function(r) {
      console.log(r);
      $scope.datagrams = _.sortBy(r, function(s) { return s.name});
      $('#loading').hide();
      $timeout(load, 60000);

    });
  };
  load();
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
          $scope.datagram.publish_params = _.reduce(_.map(selected_watches,function(w) { return w.params}), function(a,b) { return _.merge(a,b)});

	} else {
	    if (!(_.isUndefined(n))) {
		loaded = true;
	    }
	}

  });

}]);

angular.module('datagramsApp').controller('datagramCtrl',['$scope','Restangular','$stateParams', '$state', 'Pusher', '$http', function($scope, Restangular, $stateParams, $state, Pusher, $http) {


  var getDatagram = function() {
    var p = _.zipObject(_.map($scope.datagram.publish_params, function(v,k) { return ["params[" + k + "]", v]}));
    console.log(p);
    $http({
      url: $scope.datagram.public_url,
      paramSerializer: '$httpParamSerializerJQLike',
      method: 'GET',
      params: p
    }).then(function(d) {
      console.log(d);
      $scope.datagram.responses = d.data.responses;
      _.each($scope.datagram.views, function(v,k) { $scope.render(v)});
    });
  };

  $scope.archive = function() {
    console.log($scope.datagram);
    $http({method: 'PATCH', url: 'api/v1/datagrams/' + $scope.datagram.id, data:{ datagram: {archived: true}}}).then(function(r) {
      console.log('saved datagram');
      $state.go('index');
    });
  };


    var subscribed = false;

    $scope.refresh = function() {
      console.log('PUT', $scope.datagram);
      $scope.datagram.customPUT({id:$scope.datagram.id, params: $scope.datagram.publish_params}, 'refresh' ).then(function(r) {
	console.log(r);
	Pusher.subscribe(r,'data', function(item) {
	  console.log('Pusher received', item);
	  getDatagram();
	});
      });
    };

  $scope.addView = function() {
    if (!$scope.datagram.views) {
      $scope.datagram.views = [];
    };
    $scope.viewsChanged = true;
    $scope.datagram.views.push({name: 'New View', type: null, template: null});
    console.log($scope.datagram.views);
  };

  $scope.renderedData = {};
  $scope.render = function(view) {
    console.log($scope.datagram);
    if (view.type === 'json' || view.type === 'chart') {
      $scope.renderedData[view.name] = jmespath.search($scope.datagram,view.template);
    } else if (view.type === 'mustache') {
      $scope.renderedData[view.name] = Mustache.render(view.template, $scope.datagram)
    } else if (view.type === 'liquid') {
      var tmpl = Liquid.parse(view.template);
      $scope.renderedData[view.name] = $sce.trustAsHtml(tmpl.render($scope.datagram));
    }
    console.log($scope.renderedData[view.name]);
  };

  var refreshWatchResponses = function() {
    _.each($scope.datagram.watches, function(w,i) {
      console.log('subscribing to ', w.token);

    });
  };

  if ($stateParams.id) {
    Restangular.one('api/v1/datagrams',$stateParams.id).get().then(function(r) {
      $scope.datagram = r;
      console.log(r);
      getDatagram();
    });
  };

  $scope.save = function() {
    console.log($scope.datagram);
    var d = {views: $scope.datagram.views};
    $http({method: 'PATCH', url: '/api/v1/datagrams/' + $scope.datagram.id, data:{ datagram: d}}).then(function(r) {
    });
  };



}]);

angular.module('datagramsApp').controller('editDatagramCtrl',['$scope','$http','$stateParams', '$state', 'Pusher', function($scope, $http, $stateParams, $state, Pusher) {
  var loaded = false;
    $scope.getDatagram = function(id) {
      $http.get('api/v1/datagrams/' + id).then(function(r) {
	console.log(r);
	$scope.datagram = r.data;
    });
  };

  $scope.aceLoaded = function(_editor) {
    // Options
    _editor.setHighlightActiveLine(false);
  };

  if ($stateParams.id) {
    $scope.getDatagram($stateParams.id);
  };
  $http.get('api/v1/watches').then(function(r) {
    $scope.watches = r.data;
  });

  $scope.$watch('datagram.watch_ids.length', function(n,o) {
    console.log(o,n);
    console.log(loaded);
    if (loaded) {
      var selected_watches = _.filter($scope.watches, function(w) {
	return _.contains($scope.datagram.watch_ids, w.id) && !(_.isEmpty(w.params));
      });
      var selected_params = _.map(selected_watches,function(w) { return w.params});
      console.log('selected_watches', selected_watches);
      $scope.datagram.publish_params = _.reduce(selected_params, function(r,o) { return _.merge(r,o)}, {});

    } else {
      if (!(_.isUndefined(n))) {
		loaded = true;
      }
    }
  });

  $scope.save = function() {
    console.log($scope.datagram);
    $http({method: 'PATCH', url: 'api/v1/datagrams/' + $scope.datagram.id, data:{ datagram: $scope.datagram}}).then(function(r) {
      console.log('saved datagram');
      $state.go('show',{id: $scope.datagram.id});
    });
  };

}]);
