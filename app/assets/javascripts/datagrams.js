angular.module('datagramsApp').controller('datagramsCtrl',['$scope','Restangular','$stateParams','$timeout', '$location','$modal','datagramService', function($scope, Restangular,$stateParams, $timeout, $location,$modal,datagramService) {

  var init = function() {
    $scope.datagrams = _.sortBy(datagramService.datagrams,function(s) { return s.name});
    $scope.groupedDatagrams = _.groupBy($scope.datagrams, function(d) { return d.name.match(":") ? d.name.split(":")[0] : "Z";});
    var groupName = $location.search().g;
    $scope.groupName=(groupName || 0);
  };
  init();

  $scope.openShowModal = function(datagram){
    console.log('openRoModal',datagram);
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
    datagramService.refreshDatagrams().then(function(r) {
      init();
      $('#loading').hide();
      $timeout(load, 60000);
    });
  };

  $scope.setActiveTab = function(groupName) {
    console.log(groupName);
    $scope.groupName = groupName;
    $location.search({g: groupName, s: $scope.selectedParamSetName});
  }
  load();

}]);


angular.module('datagramsApp').controller('roCtrl',['$scope', '$modalInstance','dg', 'renderService','datagramService','$http','$timeout', function($scope, $modalInstance, dg, renderService, datagramService, $http, $timeout) {
  $scope.datagram = dg;
  $scope.renderedData = renderService.renderedData;
  console.log(dg);
  console.log(datagramService);
  datagramService.getDatagramData(dg).then(function() {
    console.log('dg responses',dg);
    _.each(dg.views, function(v) {
      console.log('rendering',v.name,renderService.render(dg,v));
    });
    $timeout(function() {
      $scope.$broadcast('highchartsng.reflow');
    },100);

    console.log('RD',renderService.renderedData);

  });
}]);

angular.module('datagramsApp').controller('datagramCtrl',['$scope','Restangular','$stateParams', '$state', 'Pusher', '$http','$sce', '$httpParamSerializerJQLike', '$timeout','$window','$location',function($scope, Restangular, $stateParams, $state, Pusher, $http, $sce, $httpParamSerializerJQLike, $timeout, $window, $location) {

  $scope.renderedData = {};
  var renderers = $.extend($.pivotUtilities.renderers,
			   $.pivotUtilities.novix_renderers,
			   $.pivotUtilities.highchart_renderers);


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

  $scope.selectParamSet = function(name) {
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
      console.log('activeTabName', $scope.activeTabName);
      if (!$scope.activeTabName) {
	$scope.activeTabName = $scope.datagram.views[0].name || $scope.datagram.responses[0].slug;
	console.log('activeTabName', $scope.activeTabName);
      }
      console.log('loadDatagram', $scope.datagram);
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

  $scope.streamOnce = function(sink) {
    console.log(sink);
    $http.put('/api/v1/streamers/' + sink.id + '/refresh').then(function(a) {
      console.log(a);
      Pusher.subscribe(a.data.token, 'data', function(d) {
	console.log('Pusher',d);
	getDatagram($scope.datagram.param_sets[sink.param_set].params);
      });
    });
  };

  $scope.deleteStreamer = function(id) {
    //console.log('deleteStreamer',id);
    $http.delete('/api/v1/streamers/' + id).then(function (r) {
      loadDatagram();
    });
  }

  var getDatagram = function(params) {
    var p;
    var max_size = $scope.options.truncate ? 1000 : 10000000;
    console.log('getDatagram', params, $scope.options.truncate);
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
      console.log('warnings',$scope.warnings.length);
      $scope.truncated = $scope.warnings.length > 0;
      $scope.options.truncate = $scope.truncated;
      _.each($scope.datagram.views, function(v,k) {
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
      $scope.selectedParamSet = $scope.datagram.param_sets[name];
      console.log('refresh with ',$scope.datagram.param_sets[name]);
      $scope.log = {};
      $scope.refreshing = true;
      $http.put('/api/v1/datagrams/' + $scope.datagram.id + '/refresh', {params: $scope.datagram.param_sets[name].params} ).then(function(r) {
	console.log('subscribed ',r.data.token);
	Pusher.subscribe(r.data.token,'data', function(item) {
	  console.log('Pusher received', item);
	  $scope.refreshing = false;
	  getDatagram($scope.datagram.param_sets[name].params);
	});
	Pusher.subscribe(r.data.token,'log', function(item) {
	  console.log('log',item);
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
    console.log('addView', _.keys($scope.datagram.responses)[0]);
    var newTemplate = "responses." + _.keys($scope.datagram.responses)[0] + ".data[]";
    var v = {name: 'New View', transform: 'jmespath', template: newTemplate, render: 'json'};
    $scope.datagram.views.push(v);
    $scope.activeTabName = 'New View';
    renderClient(v);
  };

  var makeRenderedUrls = function(view) {
    var staticParams = {params: _.merge.apply(_.merge,_.map($scope.datagram.responses,'params'))};
    var dynamicParams = {params: $scope.selectedParamSet};
    staticParams = $httpParamSerializerJQLike(staticParams);
    dynamicParams = $httpParamSerializerJQLike(dynamicParams);
    var render = view.render == 'highcharts' ? 'png' : view.render;
    render = render == "ag-grid" ? "html" : render;
    render = render == "pivot" ? "html" : render;
    render = render == "taucharts" ? "html" : render;
    var staticUrl =  "/api/v1/d/" + $scope.datagram.token + "." + render + '?' + staticParams + '&views[]=' + view.name;
    var dynamicUrl =  "/api/v1/d/" + $scope.datagram.token + "." + render + '?' + dynamicParams + '&views[]=' + view.name;
    $scope.renderedUrls[view.name] = {static: staticUrl, dynamic: dynamicUrl};
    console.log('renderedUrls', view, dynamicUrl, $scope.selectedParams);
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
	console.log('liquid', r.data);
	$scope.renderedData[view.name] = $sce.trustAsHtml(r.data.html);
      }
      makeRenderedUrls(view);

    });

  };

  $scope.render = function(view, button, markChanged) {
    $scope.viewsChanged = markChanged;
    if ((view.transform == 'jq' && button) || (view.transform == 'liquid' && button)){
      console.log('renderServer',view);
      renderServer(view);
    } else {
      renderClient(view);
    }
  };


  $scope.big = true;
  $scope.switchTab = function(name) {
    $scope.activeTabName = name;
    $location.search({g: name});

    console.log('switchTab',name);
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

  var doGridOp = function(view, opData,opName, col) {
    console.log('doGridOp',arguments);
    if (opName == 'gradient') {
      var data = _.map($scope.renderedData[view].rowData, col.field);
      console.log('data',data);
      if (_.isArray(opData[0])) {
	var colors = opData[0];
	var domain = opData[1];
      } else {
	var colors = opData;
	var max = _.max(data);
	var min = _.min(data);
	var domain = [min,max];
      }
      console.log('colors',colors);
      console.log('domain',domain);
      var scale = chroma.scale(colors).domain(domain).mode('lab');
      var r = {cellStyle: function(p) {
        return {background: scale(p.value), color: "white"};
      }};
      return r;
    }
  };

  var renderAgGrid = function(view) {
    console.log('renderAgGrid', view);
    var keys = _.keys($scope.renderedData[view.name].rowData[0]);
    var cols = _.map(keys, function(a) { return {headerName: a, field: a};});
    var reservedWords = ['gradient'];
    _.map($scope.renderedData[view.name].columnDefs, function(v,k,x) {
      var col = _.find(cols, {field: k});
      col = _.merge(col, _.omit(v, reservedWords));
      var ops = _.pick(v, reservedWords);
      console.log('ops',ops);
      _.map(ops, function(opData,opName) {
        var r = doGridOp(view.name,opData,opName,col);
        console.log('r',r);
        col = _.merge(col, r);
      });
    });
    console.log(cols);
    $scope.gridOptions.api.setColumnDefs(cols);
    if (view.gridOptions && view.gridOptions.columnState) {
      $scope.gridOptions.columnApi.setColumnState(view.gridOptions.columnState);
      $scope.gridOptions.columnApi.setPivotMode(view.gridOptions.pivotMode);
    }
    $scope.gridOptions.api.setRowData($scope.renderedData[view.name].rowData);
    $scope.gridOptions.api.sizeColumnsToFit();
    $scope.gridOptions.api.sizeColumnsToFit();
    $timeout(function() {
      _.each(['columnPivotModeChanged','columnRowGroupChanged','columnPivotChanged'], function(a) {
	$scope.gridOptions.api.addEventListener(a, function() {
	  if (!view.gridOptions) {
	    view.gridOptions = {columnState: {}, pivotMode: false};
	  }
	  view.gridOptions.columnState = $scope.gridOptions.columnApi.getColumnState();
	  view.gridOptions.pivotMode = $scope.gridOptions.columnApi.isPivotMode();
	  $scope.viewsChanged = true;
	  console.log(view);
	});
      });
    }, 1000);

  };

  var pivotLoaded = 0;
  var refreshPivotConf = function(conf) {
    var v = _.find($scope.datagram.views, {name: conf.viewName});
    console.log('refreshPivotConf',conf, v.pivotOptions);
    console.log('v',v);
    v.pivotOptions = conf;
    if (pivotLoaded > 0) {
      $scope.viewsChanged = true;
    }
    pivotLoaded += 1;

    //$scope.pivotOptions = _.merge(conf,v.pivotOptions);

  };

  $scope.pivotOptions = {renderers: renderers, onRefresh: refreshPivotConf };

  var renderClient = function(view) {
    console.log('renderClient',view);
    if ( view.transform === 'jmespath') {
      if (view.render != 'pivot') {
	$scope.renderedData[view.name] = jmespath.search($scope.datagram,view.template);
	$scope.renderedData[view.name].options = $scope.renderedData[view.name].options || {a: 'foo'}; //weird new bug
      }
      if (view.render == 'pivot') {
	console.log('view.pivotOptions',view.pivotOptions);
	view.pivotOptions = _.pick(view.pivotOptions, ["aggregatorName","cols","rows","vals","rendererName","viewName"]);
	console.log('view.pivotOptions',view.pivotOptions);
	var o = _.merge($scope.pivotOptions, view.pivotOptions);
	o.viewName = view.name;
	o.rows = (o.rows === null) ? [] : o.rows;
	o.cols = (o.cols === null) ? [] : o.cols;
	o.vals = (o.vals === null) ? [] : o.vals;
	console.log('o',o);
	$scope.renderedData[view.name] = jmespath.search($scope.datagram,view.template);
	$('#pivot').pivotUI($scope.renderedData[view.name], o);
	console.log('rendering pivot');
	$timeout(function() {
	  $(window).trigger('resize');
	},1000);
      };
      if (view.render === 'ag-grid') {
	$timeout(function() {
          renderAgGrid(view);
        }, 500);
      }
    };
    if (view.render === 'png') {
      $scope.$broadcast('highchartsng.reflow');
    }
    if (view.transform === 'mustache') {
      $scope.renderedData[view.name] = Mustache.render(view.template, $scope.datagram);
      console.log($scope.renderedData[view.name]);
    }
    if (view.transform == 'handlebars') {
      var template = Handlebars.compile(view.template);
      $scope.renderedData[view.name] = template($scope.datagram);
    }
    if (view.transform === 'liquid') {
      console.log('liquid!');
      var tmpl = Liquid.parse(view.template);
      var t = tmpl.render($scope.datagram);
      console.log(t);
      $scope.renderedData[view.name] = $sce.trustAsHtml(t);
    };
    if (view.render == 'taucharts') {
      var tcDefaults = {
	plugins: [
          tauCharts.api.plugins.get('tooltip')(),
          tauCharts.api.plugins.get('legend')()
	]
      };
      console.log('tauChartsOptions',view.tauChartsOptions);
      if (!view.tauChartsOptions) {
	view.tauChartsOptions = {tco: {x: null, y: null, type: null, handleRenderingErrors: false}};
      }
      view.tauChartsOptions.keys = _.keys($scope.renderedData[view.name][0]);
      var tco = _.merge(_.merge(tcDefaults, view.tauChartsOptions.tco),{data: $scope.renderedData[view.name]});
      console.log('TAUCHART!',tco);
      var chart = new tauCharts.Chart(tco);
      $($('#tauchart')[0]).html('');
      chart.renderTo('#tauchart');
    }
    makeRenderedUrls(view);
  };


  $scope.renameView = function(name) {
    $scope.activeTabName = name;
    $scope.viewsChanged = true;
    $location.search({g: name, s: $location.search.s});
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
    // $http.get('api/v1/datagrams/' + $stateParams.id).then(function(r) {
    //   $scope.datagram = r.data;
    // });
    loadDatagram();
    $http.get('/api/v1/stream_sinks').then(function(r) {
      $scope.streamSinks = _.map(r.data, function(a) { return _.merge(a, {id: a.id + ''});});;
    });

  };

  $scope.save = function(callback) {
    console.log('save views',$scope.datagram.views);
    var newSet = $scope.datagram.param_sets["__new"];
    if (newSet) {
      //console.log(newSet);
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

angular.module('datagramsApp').controller('newDatagramCtrl',['$scope','Restangular','$stateParams', '$state', function($scope, Restangular, $stateParams, $state) {
  Restangular.all('api/v1/watches').getList().then(function(r) {
    $scope.watches = r;
  });
  Restangular.one('api/v1/datagrams/new').get().then(function(r) {
    console.log(r);
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
