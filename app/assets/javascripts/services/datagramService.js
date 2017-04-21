angular.module('datagramsApp')
  .factory('datagramService', function($q, $http, $window, $state) {
    var service = {
      datagrams: [],
      refreshDatagrams: refreshDatagrams,
      getDatagramData: getDatagramData,
      datagram: null,
      options: {truncate: true}
    };
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

    function getDatagramData(datagram, params) {
      console.log(datagram);
      service.datagram = datagram;
      var q = $q.defer();
      var p;
      var max_size = service.options.truncate ? 1000 : 10000000;
      console.log('getDatagram', params, service.options.truncate);
      if (params) {
	p = params.param_set ? params : {params: _.zipObject(_.map(params, function(v,k) { return ["params[" + k + "]", v]})), max_size: max_size};
      } else {
	p = {params: {}, max_size: max_size};
      }
      p.params = _.merge(p.params, {max_size: max_size});
      $http(_.merge({
	url: datagram.public_url,
	paramSerializer: '$httpParamSerializerJQLike',
	method: 'GET'},p)
	   ).success(function(d) {
	     console.log(d);
	     service.datagram = _.merge(service.datagram, d);
	     q.resolve(service.datagram);
	   });
      return q.promise;
    }

  });
