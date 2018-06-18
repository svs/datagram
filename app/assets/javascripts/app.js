//= require tauCharts.min.js
//= require angular-pusher
//= require 'checklist-model.js'
//= require highlight.pack.js
//= require angular-highlightjs.js
//= require directives.js
//= require ui-grid.min.js
//= require ag-grid-ent.min.js
//= require numbro.min.js
//= require pikaday.js
//= require ZeroClipboard.min.js
//= require handsontable.min.js
//= require hightchart_renderers.js
//= require novix.pivot.renderer.js


agGrid.LicenseManager.setLicenseKey("ag-Grid_Evaluation_License_Not_for_Production_100Devs24_May_2017__MTQ5NTU4MDQwMDAwMA==16be8f8f82a5e4b5fa39766944c69a32");
agGrid.initialiseAgGridWithAngular1(angular);
var datagramsApp = angular.module('datagramsApp', ['restangular','ui.router','checklist-model', 'hljs', 'doowb.angular-pusher', 'directives.json','ui.bootstrap', "pascalprecht.translate", "humanSeconds","ui.ace","highcharts-ng","ngSanitize","agGrid",'ngCsv','angular-pivottable']).
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
	state('streams',
	      {url: '/streams',
	       templateUrl: 'streams_index.html'
	      }).
	state('index',
	      {url: '/?g', templateUrl: "index.html", reloadOnSearch: false}
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
