//= require angular-pusher
//= require 'checklist-model.js'
//= require highlight.pack.js
//= require angular-highlightjs.js
//= require directives.js
//= require ui-grid.min.js


var datagramsApp = angular.module('datagramsApp', ['restangular','ui.router','checklist-model', 'hljs', 'doowb.angular-pusher', 'directives.json','ui.bootstrap', "pascalprecht.translate", "humanSeconds","ui.ace","highcharts-ng","ngSanitize","ui.grid"]).
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
      $scope.datagrams = _.sortBy(r, function(s) { return s.name});
      $scope.groupedDatagrams = _.groupBy($scope.datagrams, function(d) { return d.name.match(":") ? d.name.split(":")[0] : "Z";});
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
          $scope.datagram.publish_params = _.reduce(_.map(selected_watches,function(w) { return w.params}), function(a,b) { return _.merge(a,b)});

	} else {
	    if (!(_.isUndefined(n))) {
		loaded = true;
	    }
	}

  });

}]);

angular.module('datagramsApp').controller('datagramCtrl',['$scope','Restangular','$stateParams', '$state', 'Pusher', '$http','$sce', function($scope, Restangular, $stateParams, $state, Pusher, $http, $sce) {

  $scope.renderedData = {};
  $scope.selected = {streamSink: {}, streamSinkId: null, frequency: null};


  $scope.selectParamSet = function(name) {
    if (name) {
      $scope.selectedParamSet =  $scope.datagram.param_sets[name];
    } else {
      $scope.selectedParamSet =  $scope.datagram.param_sets["__default"];
    }
    getDatagram($scope.selectedParamSet.params);
  };


  $scope.gridData = [];



  var loadDatagram = function() {
    $http.get('api/v1/datagrams/' + $stateParams.id).then(function(r) {
      $scope.datagram = r.data;
    });
  };

  $scope.setStreamSink = function(view, paramSet) {
    //console.log(view, paramSet);
    //console.log($scope.datagram.stream_sinks, $scope.selected.streamSink);
    var d = [{stream_sink_id: $scope.selected.streamSink.id, view_name: view.name, param_set: (paramSet.name || '__default'), format: "png", frequency: $scope.selected.frequency}];
    $http({method: 'PATCH', url: '/api/v1/datagrams/' + $scope.datagram.id, data:{ datagram: {streamers_attributes: d}}}).then(function(r) {
      loadDatagram();
    });
  };

  $scope.deleteStreamer = function(id) {
    //console.log('deleteStreamer',id);
    $http.delete('/api/v1/streamers/' + id).then(function (r) {
      loadDatagram();
    });
  }

  var getDatagram = function(params) {
    console.log('getDatagram', params);
    var p = params.param_set ? params : {params: _.zipObject(_.map(params, function(v,k) { return ["params[" + k + "]", v]}))};
    $http(_.merge({
      url: $scope.datagram.public_url,
      paramSerializer: '$httpParamSerializerJQLike',
      method: 'GET'},p)
    ).then(function(d) {
      $scope.datagram.responses = d.data.responses;
      _.each($scope.datagram.views, function(v,k) {
	//console.log('rendering ', v);
	$scope.render(v, true);
      });
    });
  };

  $scope.archive = function() {
    //console.log($scope.datagram);
    $http({method: 'PATCH', url: 'api/v1/datagrams/' + $scope.datagram.id, data:{ datagram: {archived: true}}}).then(function(r) {
      //console.log('saved datagram');
      $state.go('index');
    });
  };


    var subscribed = false;

    $scope.refresh = function(name) {
      console.log(name);
      $scope.selectedParamSet = $scope.datagram.param_sets[name];
      console.log('refresh with ',$scope.datagram.param_sets[name]);
      $http.put('/api/v1/datagrams/' + $scope.datagram.id + '/refresh', {params: $scope.datagram.param_sets[name].params} ).then(function(r) {
	console.log('subscribed ',r.data.token);
	Pusher.subscribe(r.data.token,'data', function(item) {
	  console.log('Pusher received', item);
	  getDatagram($scope.datagram.param_sets[name].params);
	});
      });
    };


  $scope.addView = function() {
    if (!$scope.datagram.views) {
      $scope.datagram.views = [];
    };
    $scope.viewsChanged = true;
    $scope.datagram.views.push({name: 'New View', type: null, template: null});
    //console.log($scope.datagram.views);
  };

  var renderServer = function(view) {
    console.log(view);
    $scope.save();
    $http({
      url: $scope.datagram.public_url,
      paramSerializer: '$httpParamSerializerJQLike',
      method: 'GET',
      params: _.merge(_.clone({params: ($scope.selectedParamSet.params || {})}),{"views[]": view.name})
    }).then(function(r) {
      $scope.renderedData[view.name] = r.data;
      if (view.render == "liquid") {
	$scope.renderedData[view.name] = $sce.trustAsHtml(r.data.html);
      }

    });

  };

  $scope.render = function(view, button) {
    if ((view.transform == 'jq' && button) || (view.render == 'liquid' && button)){
      renderServer(view);
    } else {
      renderClient(view);
    }
  };

  var renderClient = function(view) {
    if ( view.transform === 'jmespath') {
      $scope.renderedData[view.name] = jmespath.search($scope.datagram,view.template);
    };
    if (view.render === 'mustache') {
      $scope.renderedData[view.name] = Mustache.render(view.template, $scope.datagram);
      console.log($scope.renderedData[view.name]);
    } else if (view.render === 'liquid') {
      console.log('liquid!');
      var tmpl = Liquid.parse(view.template);
      var t = tmpl.render($scope.datagram);
      console.log(t);
      $scope.renderedData[view.name] = $sce.trustAsHtml(t);
    };
    if (view.render=="chart") {
      console.log($scope.renderedData.getHighcharts());
    }
    if (view.render=="ag-grid") {
      $scope.gridData = $scope.renderedData[view.name];
      //$scope.gridApi.core.refresh();
      console.log($scope.renderedData[view.name]);
    }
  };


  $scope.addParamSet = function() {
    $scope.datagram.param_sets["__new"] = {name: "new", params: _.clone($scope.datagram.publish_params), frequency: null, at: null};
  };
  // var refreshWatchResponses = function() {
  //   _.each($scope.datagram.watches, function(w,i) {
  //     //console.log('subscribing to ', w.token);

  //   });
  // };

  if ($stateParams.id) {
    $http.get('api/v1/datagrams/' + $stateParams.id).then(function(r) {
      $scope.datagram = r.data;
      $scope.datagram.param_sets = $scope.datagram.param_sets || {'__default': {}};
      $scope.selectParamSet("__default");
    });
    $http.get('/api/v1/stream_sinks').then(function(r) {
      $scope.streamSinks = _.map(r.data, function(a) { return _.merge(a, {id: a.id + ''});});;
    });

  };

  $scope.save = function(callback) {
    //console.log($scope.datagram);
    var newSet = $scope.datagram.param_sets["__new"];
    if (newSet) {
      //console.log(newSet);
      $scope.datagram.param_sets[newSet.name] = _.clone(newSet);
      delete $scope.datagram.param_sets["__new"];
    }
    var d = {views: $scope.datagram.views, param_sets: $scope.datagram.param_sets, publish_params: $scope.datagram.param_sets["__default"]["params"]};
    $http({method: 'PATCH', url: '/api/v1/datagrams/' + $scope.datagram.id, data:{ datagram: d}}).then(callback || function(r) {
    });
  };



}]);

angular.module('datagramsApp').controller('editDatagramCtrl',['$scope','$http','$stateParams', '$state', 'Pusher', function($scope, $http, $stateParams, $state, Pusher) {
  var loaded = false;
    $scope.getDatagram = function(id) {
      $http.get('api/v1/datagrams/' + id).then(function(r) {
	//console.log(r);
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
    //console.log(o,n);
    //console.log(loaded);
    if (loaded) {
      var selected_watches = _.filter($scope.watches, function(w) {
	return _.contains($scope.datagram.watch_ids, w.id) && !(_.isEmpty(w.params));
      });
      var selected_params = _.map(selected_watches,function(w) { return w.params});
      //console.log('selected_watches', selected_watches);
      $scope.datagram.publish_params = _.reduce(selected_params, function(r,o) { return _.merge(r,o)}, {});

    } else {
      if (!(_.isUndefined(n))) {
		loaded = true;
      }
    }
  });

  $scope.save = function() {
    //console.log($scope.datagram);
    $http({method: 'PATCH', url: 'api/v1/datagrams/' + $scope.datagram.id, data:{ datagram: $scope.datagram}}).then(function(r) {
      //console.log('saved datagram');
      $state.go('show',{id: $scope.datagram.id});
    });
  };

}]);
