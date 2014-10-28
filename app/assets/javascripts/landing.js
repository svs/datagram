// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require angular
//= require lodash
//= require restangular
//= require angular-ui-router
//= require ui-bs.js
//= require bootstrap.min
//= require datagrams
//= require_self

//= require angular-pusher
//= require highlight.pack.js
//= require angular-highlightjs.js
var landingApp = angular.module('landingApp', ['restangular','ui.router','checklist-model', 'hljs', 'doowb.angular-pusher','ui.bootstrap']).
config(['PusherServiceProvider',
  function(PusherServiceProvider) {
    PusherServiceProvider
      .setToken('44c0d19c3ef1598f3721')
      .setOptions({});
  }
]);


angular.module('landingApp').controller('landingCtrl',['$scope','Restangular', function($scope, Restangular) {
  $scope.slides = [
      {image: '/assets/screen3.png', text: 'AngularJS'},
      {image: '/assets/screen4.png', text: 'Google Sheets'},
      {image: '/assets/screen5.png', text: 'Command Line'}
  ];

}]);
