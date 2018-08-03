angular.module('datagramsApp')
  .factory('renderService', ['$timeout', '$http',function($timeout, $http) {
    var renderers = $.extend($.pivotUtilities.renderers,
			     $.pivotUtilities.novix_renderers,
			     $.pivotUtilities.highchart_renderers);


    var service = {
      renderedData: {},
      render: render,
      pivotOptions: {renderers: renderers},
      gridOptions: {enableSorting: true, enableFilter: true, rowData: null, showToolPanel: true }
    };
    return service;

    function render(datagram,view, params) {
      console.log('renderClient',view);
      if ( view.transform === 'jmespath') {
	if (view.render != 'pivot') {
	  service.renderedData[view.name] = jmespath.search(datagram,view.template);
	  service.renderedData[view.name].options = service.renderedData[view.name].options || {a: 'foo'}; //weird new bug
	}
	  if (view.render === 'flexmonster') {
	      console.log(service.renderedData[view.name]);
	      view.report = view.report || {dataSource: {data: null}};
	      console.log(service.renderedData);
	      view.report.dataSource.data = service.renderedData[view.name];
	      console.log(view);
	      $timeout(function() {
		  var pivot = new Flexmonster({
		      container: "flexmonster",
		      toolbar: true,
		      report: view.report,
		      licenseKey: "Z77C-XAH84A-2P3E5X-2O1Z2W"
		  });
	      });
	  }
	if (view.render == 'pivot') {
	  console.log('view.pivotOptions',view.pivotOptions);
	  view.pivotOptions = _.pick(view.pivotOptions, ["aggregatorName","cols","rows","vals","rendererName","viewName"]);
	  console.log('view.pivotOptions',view.pivotOptions);
	  var o = _.merge(service.pivotOptions, view.pivotOptions);
	  o.viewName = view.name;
	  o.rows = (o.rows === null) ? [] : o.rows;
	  o.cols = (o.cols === null) ? [] : o.cols;
	  o.vals = (o.vals === null) ? [] : o.vals;
	  console.log('o',o);
	  service.renderedData[view.name] = jmespath.search(datagram,view.template);
	  $('#pivot').pivotUI(service.renderedData[view.name], o);
	  console.log('rendering pivot');
	  $timeout(function() {
	    $(window).trigger('resize');
	  },1000);
	};
	if (view.render === 'ag-grid') {
	  $timeout(function() {
            renderAgGrid(view);
          }, 200);
	}
      };
      if (view.transform === 'jq') {
	service.renderedData[view.name] = renderJq(datagram, view, params);
      };
      if (view.transform === 'mustache') {
	service.renderedData[view.name] = Mustache.render(view.template, datagram);
      }
      if (view.transform == 'handlebars') {
	var template = Handlebars.compile(view.template);
	service.renderedData[view.name] = template(datagram);
      }
      if (view.transform === 'liquid') {
	var tmpl = Liquid.parse(view.template);
	var t = tmpl.render(datagram);
	service.renderedData[view.name] = $sce.trustAsHtml(t);
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
	view.tauChartsOptions.keys = _.keys(service.renderedData[view.name][0]);
	var tco = _.merge(_.merge(tcDefaults, view.tauChartsOptions.tco),{data: service.renderedData[view.name]});
	console.log('TAUCHART!',tco);
	service.renderedData[view.name] = tco;
	var chart = new tauCharts.Chart(tco);
	$($('#tauchart')[0]).html('');
	$timeout(function() {
	  chart.renderTo('#tauchart');
	}, 200);

      }
      return service.renderedData[view.name];
    };

  function renderAgGrid(view) {
    console.log('renderAgGrid', view);
    var keys = _.keys(service.renderedData[view.name].rowData[0]);
    var cols = _.map(keys, function(a) { return {headerName: a, field: a};});
    var reservedWords = ['gradient'];
    _.map(service.renderedData[view.name].columnDefs, function(v,k,x) {
      var col = _.find(cols, {field: k});
      col = _.merge(col, _.omit(v, reservedWords));
      var ops = _.pick(v, reservedWords);
      _.map(ops, function(opData,opName) {
        var r = doGridOp(view.name,opData,opName,col);
        col = _.merge(col, r);
      });
    });
    $($('#aggrid')[0]).html('');
    var eGridDiv = document.querySelector('#aggrid');
    new agGrid.Grid(eGridDiv, service.gridOptions);
    service.gridOptions.api.setColumnDefs(cols);
    if (view.gridOptions && view.gridOptions.columnState) {
      service.gridOptions.columnApi.setColumnState(view.gridOptions.columnState);
      service.gridOptions.columnApi.setPivotMode(view.gridOptions.pivotMode);
    }
    service.gridOptions.api.setRowData(service.renderedData[view.name].rowData);
    service.gridOptions.api.sizeColumnsToFit();
    service.gridOptions.api.sizeColumnsToFit();
    $timeout(function() {
      _.each(['columnPivotModeChanged','columnRowGroupChanged','columnPivotChanged'], function(a) {
	service.gridOptions.api.addEventListener(a, function() {
	  if (!view.gridOptions) {
	    view.gridOptions = {columnState: {}, pivotMode: false};
	  }
	  view.gridOptions.columnState = service.gridOptions.columnApi.getColumnState();
	  view.gridOptions.pivotMode = service.gridOptions.columnApi.isPivotMode();
	  service.viewsChanged = true;
	});
      });
    }, 1000);

  };

  function doGridOp(view, opData,opName, col) {
    console.log('doGridOp',arguments);
    if (opName == 'gradient') {
      var data = _.map(service.renderedData[view].rowData, col.field);
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

    function renderJq(datagram, view, params) {
      console.log('renderJq',params);
      $http({
	url: datagram.public_url,
	paramSerializer: '$httpParamSerializerJQLike',
	method: 'GET',
	params: _.merge(_.clone({params: params}),{"views[]": view.name})
    }).then(function(r) {
      service.renderedData[view.name] = r.data;
    });

    }

  }]);
