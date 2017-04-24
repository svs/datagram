angular.module('datagramsApp')
  .factory('userService', function($q, $http, $window, $state, Pusher, renderService) {
    var service = {
      user: null,
      load: load
    };
    return service;

    function load() {
      var q = $q.defer();
      $http.get('/api/v1/profile').then(function(a) {
	service.user = a.data;
	q.resolve(service.user);
      });
      return q.promise;
    }
  });
