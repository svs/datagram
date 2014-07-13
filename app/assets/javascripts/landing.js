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
//= require restangular.min
//= require angular-ui-router
//= require bootstrap.min
//= require datagrams
//= require_self

//= require angular-pusher
//= require highlight.pack
//= require angular-highlightjs.js
var landingApp = angular.module('landingApp', ['restangular','ui.router','checklist-model', 'hljs', 'doowb.angular-pusher']).
config(['PusherServiceProvider',
  function(PusherServiceProvider) {
    PusherServiceProvider
      .setToken('44c0d19c3ef1598f3721')
      .setOptions({});
  }
]);


angular.module('landingApp').controller('landingCtrl',['$scope','Restangular', function($scope, Restangular) {
  Restangular.one('api/v1/datagrams/z6c1m2UrkY/t').get().then(function(r) {
    console.log(r);
    $scope.datagram = r;
  });
}]);