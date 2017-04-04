angular.module('datagramsApp')
  .factory('datagramService', function($q, $http, $window, $state) {
    var service = {
      datagrams: [],
      refreshDatagrams: refreshDatagrams
    }
    return service;

    function refreshDatagrams() {
      var q = $q.defer();
      $http.get('api/v1/datagrams').success(function(data) {
	service.datagrams = data;
	q.resolve(service.datagrams);
      })
	.error(function(data, status) {
          console.log('Error loading datagrams:' + angular.toJson({status: status, data: data}) );
          q.reject(status);
	});
      return q.promise;
    }
  });
