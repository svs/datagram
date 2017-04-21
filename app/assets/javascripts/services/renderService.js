angular.module('datagramsApp')
  .factory('renderService', ['$timeout', function($timeout) {
    var service = {
      renderedData: {},
      render: render
    };
    return service;

    function render(datagram,view) {
      console.log('renderClient',view);
      if ( view.transform === 'jmespath') {
	if (view.render != 'pivot') {
	  service.renderedData[view.name] = jmespath.search(datagram,view.template);
	  service.renderedData[view.name].options = service.renderedData[view.name].options || {a: 'foo'}; //weird new bug
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
          }, 500);
	}
      };
      if (view.transform === 'mustache') {
	service.renderedData[view.name] = Mustache.render(view.template, $scope.datagram);
      }
      if (view.transform == 'handlebars') {
	var template = Handlebars.compile(view.template);
	service.renderedData[view.name] = template($scope.datagram);
      }
      if (view.transform === 'liquid') {
	var tmpl = Liquid.parse(view.template);
	var t = tmpl.render($scope.datagram);
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
      }
      return service.renderedData[view.name];
    };

  }]);
