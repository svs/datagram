angular.module('datagramsApp').controller('datagramsCtrl',['$scope','Restangular','$stateParams','$timeout', '$location','$modal','datagramService', 'userService', function($scope, Restangular,$stateParams, $timeout, $location,$modal,datagramService, userService) {

  var init = function() {
    $scope.datagrams = _.sortBy(datagramService.datagrams,function(s) { return s.name});
    $scope.groupedDatagrams = _.groupBy($scope.datagrams, function(d) { return d.name.match(":") ? d.name.split(":")[0] : "Z";});
    var groupName = $location.search().g;
    $scope.groupName=(groupName || 0);
  };
  init();

  $scope.openShowModal = function(datagram){
    //console.log('openRoModal',datagram);
    var modalInstance = $modal.open({
      templateUrl: 'show_ro.html',
      controller: 'roCtrl',
      size: 'lg',
      windowClass: 'big-modal',
      resolve: {
	dg: function() { return datagram}
      }
    });
    modalInstance.result.then(function(n) {
    });
  };
  var load = function() {
    $('#loading').show();
    userService.load().then(function(r) {
      $scope.user = userService.user;
    });
    datagramService.refreshDatagrams().then(function(r) {
      init();
      $('#loading').hide();
      $timeout(load, 60000);
    });
  };

  $scope.setActiveTab = function(groupName) {
    //console.log(groupName);
    $scope.groupName = groupName;
    $location.search({g: groupName, s: $scope.selectedParamSetName});
  }
  load();

}]);


angular.module('datagramsApp').controller('roCtrl',['$scope', '$modalInstance','dg', 'renderService','datagramService','$http','$timeout','$window', '$state', function($scope, $modalInstance, dg, renderService, datagramService, $http, $timeout, $window, $state) {
  $scope.renderedData = renderService.renderedData;

  $scope.d = datagramService;
  datagramService.setCurrentDatagram(dg).then(function() {
    //console.log('setCurrentDatagram done');
    reflow();
  });

  $scope.next = function() {
    datagramService.loadNext();
  };
  $scope.previous = function() {
    datagramService.loadPrevious();
  };
  $scope.edit = function() {
    $state.go('show',{id: datagramService.datagram.id});
    $modalInstance.close();
  }
  var reflow = function() {
    $timeout(function() {
      $scope.$broadcast('highchartsng.reflow');
      $window.dispatchEvent(new Event('resize'));
    },100);
    if ($scope.gridOptions && $scope.gridOptions.api) {
      $timeout(function() {
        $scope.gridOptions.api.sizeColumnsToFit(true);
      }, 500);
    }
  };
  $scope.selectView = function(view) {
    reflow();
  };

  $scope.selectParamSet = function(name) {
    datagramService.selectParamSet(name);
  };

  $scope.updateCurrentParams = function(k) {
  };

  $scope.refresh = function() {
    $scope.refreshing = true;
    datagramService.refresh().then(function() {
      $scope.refreshing = false;
    });
  };

}]);

angular.module('datagramsApp').controller('datagramCtrl',['$scope','Restangular','$stateParams', '$state', 'Pusher', '$http','$sce', '$httpParamSerializerJQLike', '$timeout','$window','$location','$modal', 'renderService', function($scope, Restangular, $stateParams, $state, Pusher, $http, $sce, $httpParamSerializerJQLike, $timeout, $window, $location, $modal, renderService) {

  $scope.renderedData = {};
  $scope.renderedUrls = {};
  $scope.selected = {streamSink: {}, streamSinkId: null, frequency: null};
  $scope.options = {truncate: true};
  $scope.viewsChanged = false;
  $scope.chartOpts = {};

  $scope.log = {};

  var init = function() {
    var groupName = $location.search().g;
    $scope.activeTabName=(groupName || null);
    $scope.selectedParamSetName = $location.search().s;
  };

  $scope.openShowModal = function(datagram){
    //console.log('openRoModal',datagram);
    var modalInstance = $modal.open({
      templateUrl: 'show_ro.html',
      controller: 'roCtrl',
      size: 'lg',
      windowClass: 'big-modal',
      resolve: {
	dg: function() { return datagram}
      }
    });
  };

  $scope.selectParamSet = function(name) {
    //console.log('name', name);
    //console.log($scope.paramSets);
    $scope.selectedParamSetName = name;
    $location.search({s: name, g: $scope.activeTabName});
    if (name) {
      $scope.selectedParamSet =  $scope.datagram.param_sets[name];
    } else {
      $scope.selectedParamSet =  $scope.datagram.param_sets["__default"];
    }
    getDatagram($scope.selectedParamSet.params);
  };


  init();


  $scope.gridData = [];

  $scope.updateCurrentParams = function(k) {
  };

  var loadDatagram = function() {
    $http.get('api/v1/datagrams/' + $stateParams.id).then(function(r) {
      $scope.datagram = r.data;
      $scope.datagram.param_sets = $scope.datagram.param_sets || {'__default': {}};
      $scope.selectParamSet("__default");
      $scope.currentParams = $scope.datagram.params;
      $scope.datagram.urls = _.map(['csv','json'], function(a) {
	var p = $httpParamSerializerJQLike($scope.selectedParamSet.params);
	return {href: "/api/v1/d/" + $scope.datagram.token + "." + a + '?' + p, l: '.' + a + '?' + decodeURIComponent(p) };
      });
      var d = $scope.datagram;
      $scope.groupName = d.name.match(":") ? d.name.split(":")[0] : null;
      $scope.datagram.name = d.name.match(":") ? d.name.split(":")[1] : d.name.split(":")[0];
      //console.log('activeTabName', $scope.activeTabName);
      if (!$scope.activeTabName) {
	$scope.activeTabName = $scope.datagram.views[0].name || $scope.datagram.responses[0].slug;
	//console.log('activeTabName', $scope.activeTabName);
      }
      //console.log('loadDatagram', $scope.datagram);
    });
  };

  $scope.setStreamSink = function(view, paramSet) {
    ////console.log(view, paramSet);
    ////console.log($scope.datagram.stream_sinks, $scope.selected.streamSink);
    var d = [{stream_sink_id: $scope.selected.streamSink.id, view_name: view.name, param_set: (paramSet.name || '__default'), format: "png", frequency: $scope.selected.frequency}];
    $http({method: 'PATCH', url: '/api/v1/datagrams/' + $scope.datagram.id, data:{ datagram: {streamers_attributes: d}}}).then(function(r) {
      loadDatagram();
    });
  };

  $scope.streamOnce = function(sink) {
    //console.log(sink);
    $http.put('/api/v1/streamers/' + sink.id + '/refresh').then(function(a) {
      //console.log(a);
      Pusher.subscribe(a.data.token, 'data', function(d) {
	//console.log('Pusher',d);
	getDatagram($scope.datagram.param_sets[sink.param_set].params);
      });
    });
  };

  $scope.deleteStreamer = function(id) {
    ////console.log('deleteStreamer',id);
    $http.delete('/api/v1/streamers/' + id).then(function (r) {
      loadDatagram();
    });
  }

  var getDatagram = function(params) {
    var p;
    var max_size = $scope.options.truncate ? 1000 : 10000000;
    //console.log('getDatagram', params, $scope.options.truncate);
    if (params) {
      p = params.param_set ? params : {params: _.zipObject(_.map(params, function(v,k) { return ["params[" + k + "]", v]})), max_size: max_size};
    } else {
      p = {params: {}, max_size: max_size};
    }
    p.params = _.merge(p.params, {max_size: max_size});
    $http(_.merge({
      url: $scope.datagram.public_url,
      paramSerializer: '$httpParamSerializerJQLike',
      method: 'GET'},p)
    ).then(function(d) {
      $scope.datagram.responses = d.data.responses;
      $scope.metadata = _.map(d.data.responses, function(v,k) { return v.metadata });
      $scope.warnings = _.compact(_.map(d.data.responses, function(v,k) { return v.warnings }));
      //console.log('warnings',$scope.warnings.length);
      $scope.truncated = $scope.warnings.length > 0;
      $scope.options.truncate = $scope.truncated;
      _.each($scope.datagram.views, function(v,k) {
	$scope.render(v, true);
      });
    });
  };

  $scope.archive = function() {
    ////console.log($scope.datagram);
    $http({method: 'PATCH', url: 'api/v1/datagrams/' + $scope.datagram.id, data:{ datagram: {archived: true}}}).then(function(r) {
      ////console.log('saved datagram');
      $state.go('index');
    });
  };


    var subscribed = false;

    $scope.refresh = function(name) {
      $scope.selectedParamSet = $scope.datagram.param_sets[name];
      //console.log('refresh with ',$scope.datagram.param_sets[name]);
      $scope.log = {};
      $scope.refreshing = true;
      $http.put('/api/v1/datagrams/' + $scope.datagram.id + '/refresh', {params: $scope.datagram.param_sets[name].params} ).then(function(r) {
	//console.log('subscribed ',r.data.token);
	Pusher.subscribe(r.data.token,'data', function(item) {
	  //console.log('Pusher received', item);
	  $scope.refreshing = false;
	  getDatagram($scope.datagram.param_sets[name].params);
	});
	Pusher.subscribe(r.data.token,'log', function(item) {
	  //console.log('log',item);
	  $scope.log = item;
	});
      });
    };

  $scope.reload = function(name) {
    getDatagram($scope.selectedParamSet.params);
    pivotLoaded = 0;
  }

  $scope.addView = function() {
    if (!$scope.datagram.views) {
      $scope.datagram.views = [];
    };
    $scope.viewsChanged = true;
    $scope.viewEditor = true;
    //console.log('addView', _.keys($scope.datagram.responses)[0]);
    var newTemplate = "responses." + _.keys($scope.datagram.responses)[0] + ".data[]";
    var v = {name: 'New View', transform: 'jmespath', template: newTemplate, render: 'json'};
    $scope.datagram.views.push(v);
    $scope.activeTabName = 'New View';
    renderClient(v);
  };

    var makeRenderedUrls = function(view) {
	$scope.renderedUrls[view.name] = renderService.renderedUrls;
    //console.log('renderedUrls', view, dynamicUrl, $scope.selectedParams);
  };

  var renderServer = function(view) {
    $scope.save();
    var url;
    if (view.render == 'html' && $scope.renderedUrls[view.name]) {
      url = $scope.renderedUrls[view.name].replace('.json','.html');
    } else {
      url =  $scope.datagram.public_url;
    }
    $http({
      url: url,
      paramSerializer: '$httpParamSerializerJQLike',
      method: 'GET',
      params: _.merge(_.clone({params: ($scope.selectedParamSet.params || {})}),{"views[]": view.name})
    }).then(function(r) {
      $scope.renderedData[view.name] = r.data;
      if (view.transform == "liquid") {
	//console.log('liquid', r.data);
	$scope.renderedData[view.name] = $sce.trustAsHtml(r.data.html);
      }
      makeRenderedUrls(view);

    });

  };

  $scope.render = function(view, button, markChanged) {
    $scope.viewsChanged = markChanged;
    if ((view.transform == 'jq' && button) || (view.transform == 'liquid' && button)){
      //console.log('renderServer',view);
      renderServer(view);
    } else {
      renderClient(view);
    }
  };


  $scope.big = true;
  $scope.switchTab = function(name) {
    $scope.activeTabName = name;
    $location.search({g: name});

    //console.log('switchTab',name);
    //$scope.big = !($scope.big);
    //var hc = angular.element( document.querySelector( '.pvtRendererArea' ) );
    //hc.addClass('hcbig');
    $timeout(function() {
      $scope.$broadcast('highchartsng.reflow');
      $window.dispatchEvent(new Event('resize'));
    },100);
    if ($scope.gridOptions.api) {
      $timeout(function() {
        $scope.gridOptions.api.sizeColumnsToFit(true);
      }, 500);
    }
  };

  $scope.gridOptions = {enableSorting: true, enableFilter: true, rowData: null, showToolPanel: true };

  var pivotLoaded = 0;
  var refreshPivotConf = function(conf) {
    var v = _.find($scope.datagram.views, {name: conf.viewName});
    //console.log('refreshPivotConf',conf, v.pivotOptions);
    //console.log('v',v);
    v.pivotOptions = conf;
    if (pivotLoaded > 0) {
      $scope.viewsChanged = true;
    }
    pivotLoaded += 1;

    //$scope.pivotOptions = _.merge(conf,v.pivotOptions);

  };

  $scope.pivotOptions = { onRefresh: refreshPivotConf };
  var renderClient = function(view) {
      renderService.render($scope.datagram, view, $scope.currentParams);
      $scope.renderedData[view.name] = renderService.renderedData;
      renderService.renderUrls(view, $scope.currentParams, $scope.datagram);
      $scope.renderedUrls = renderService.renderedUrls;
  };


  $scope.renameView = function(name) {
    $scope.activeTabName = name;
    $scope.viewsChanged = true;
    $location.search({g: name, s: $location.search.s});
  };


  $scope.addParamSet = function() {
    $scope.datagram.param_sets["__new"] = {name: "__new", params: _.clone($scope.datagram.publish_params), frequency: null, at: null};
    $scope.selectParamSet("__new");
  };
  // var refreshWatchResponses = function() {
  //   _.each($scope.datagram.watches, function(w,i) {
  //     ////console.log('subscribing to ', w.token);

  //   });
  // };

  if ($stateParams.id) {
    // $http.get('api/v1/datagrams/' + $stateParams.id).then(function(r) {
    //   $scope.datagram = r.data;
    // });
    loadDatagram();
    $http.get('/api/v1/stream_sinks').then(function(r) {
      $scope.streamSinks = _.map(r.data, function(a) { return _.merge(a, {id: a.id + ''});});;
    });

  };

  $scope.save = function(callback) {
    var newSet = $scope.datagram.param_sets["__new"];
    if (newSet) {
      ////console.log(newSet);
      $scope.datagram.param_sets[newSet.name] = _.clone(newSet);
      delete $scope.datagram.param_sets["__new"];
    }
    var d = {views: $scope.datagram.views, param_sets: $scope.datagram.param_sets, publish_params: $scope.datagram.param_sets["__default"]["params"]};
    $http({method: 'PATCH', url: '/api/v1/datagrams/' + $scope.datagram.id, data:{ datagram: d}}).then(function(r) {
      $scope.viewsChanged = false;
    });
  };



}]);

angular.module('datagramsApp').controller('editDatagramCtrl',['$scope','$http','$stateParams', '$state', 'Pusher', function($scope, $http, $stateParams, $state, Pusher) {
  var loaded = false;
    $scope.getDatagram = function(id) {
      $http.get('api/v1/datagrams/' + id).then(function(r) {
	////console.log(r);
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
    ////console.log(o,n);
    ////console.log(loaded);
    if (loaded) {
      var selected_watches = _.filter($scope.watches, function(w) {
	return _.contains($scope.datagram.watch_ids, w.id) && !(_.isEmpty(w.params));
      });
      var selected_params = _.map(selected_watches,function(w) { return w.params});
      ////console.log('selected_watches', selected_watches);
      $scope.datagram.publish_params = _.reduce(selected_params, function(r,o) { return _.merge(r,o)}, {});

    } else {
      if (!(_.isUndefined(n))) {
		loaded = true;
      }
    }
  });

  $scope.save = function() {
    ////console.log($scope.datagram);
    $http({method: 'PATCH', url: 'api/v1/datagrams/' + $scope.datagram.id, data:{ datagram: $scope.datagram}}).then(function(r) {
      ////console.log('saved datagram');
      $state.go('show',{id: $scope.datagram.id});
    });
  };

}]);

angular.module('datagramsApp').controller('newDatagramCtrl',['$scope','Restangular','$stateParams', '$state', function($scope, Restangular, $stateParams, $state) {
  Restangular.all('api/v1/watches').getList().then(function(r) {
    $scope.watches = r;
  });
  Restangular.one('api/v1/datagrams/new').get().then(function(r) {
    //console.log(r);
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
