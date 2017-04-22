angular.module('datagramsApp')
  .factory('datagramService', function($q, $http, $window, $state, Pusher, renderService) {
    var defaults = {
      datagrams: [],
      groupedDatagrams: {},
      refresh: refresh,
      refreshDatagrams: refreshDatagrams,
      setCurrentDatagram: setCurrentDatagram,
      getDatagramData: getDatagramData,
      selectParamSet: selectParamSet,
      datagram: null,
      selectedParamSetName: '__default',
      options: {truncate: true},
      log: null,
      reset: reset,
      loadNext: loadNext,
      loadPrevious: loadPrevious
    };

    var service = defaults;

    var lastLoaded = {datagram: null, params: null};

    function reset() {
      service = defaults;
    }

    function setCurrentDatagram(datagram) {
      console.log('setCurrentDatagram', datagram);
      service.datagram = datagram;
      service.group = datagram.group;
      getDatagramData(datagram);
    }

    function selectParamSet(name) {
      service.selectedParamSetName = name || '__default';
      service.datagram.responses = null;
      getDatagramData(service.datagram, params()).then(function() {

      });
    };

    function params() {
      console.log('datagramService#params', service.datagram);
      return service.datagram.paramSets[service.selectedParamSetName].params;
    }

    function loadNext() {
      var g = service.groupedDatagrams[service.datagram.group];
      var i = _.findIndex(g, service.datagram);
      setCurrentDatagram(i == 0 ? g[g.length-1] : g[i-1]);
    };

    function loadPrevious() {
      var g = service.groupedDatagrams[service.datagram.group];
      var i = _.findIndex(g, service.datagram);
      setCurrentDatagram(i == g.length - 1 ? g[0] : g[i+1]);
    };


    function refresh() {
      var q = $q.defer();
      console.log('#DatagramService refreshing with ',service.selectedParamSetName);
      service.log = {};
      service.refreshing = true;
      $http.put('/api/v1/datagrams/' + service.datagram.id + '/refresh', {params: params} ).then(function(r) {
	console.log('subscribed ',r.data.token);
	Pusher.subscribe(r.data.token,'data', function(item) {
	  console.log('Pusher received', item);
	  service.refreshing = false;
	  getDatagramData(service.datagram, name).then(function() {
	    service.refreshing = false;
	    q.resolve(service.datagram);
	  });
	});
	Pusher.subscribe(r.data.token,'log', function(item) {
	  console.log('log',item);
	  service.log = item;
	});
      });
      return q.promise;
    };


    function refreshDatagrams() {
      var q = $q.defer();
      $http.get('api/v1/datagrams').success(function(data) {
	service.datagrams = data;
	service.groupedDatagrams = _.groupBy(service.datagrams, function(d) { return d.group});
	q.resolve(service.datagrams);
      })
	.error(function(data, status) {
          console.log('Error loading datagrams:' + angular.toJson({status: status, data: data}) );
          q.reject(status);
	});
      return q.promise;
    }

    function getDatagramData(datagram, params) {
      var q = $q.defer();
      console.log('lastLoaded', lastLoaded);
      if (datagram.id === lastLoaded.datagram && params === lastLoaded.params) {
	console.log('lastLoaded is same. no need to load anything');
	_.each(service.datagram.views, function(v) {
	  console.log('rendering',v.name,renderService.render(service.datagram,v, params));
	});
	q.resolve(service.datagram);
      } else {
	lastLoaded = {datagram: datagram.id, params: params};
	console.log(datagram);
	service.datagram = datagram;
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
	       _.each(service.datagram.views, function(v) {
		 console.log('rendering',v.name,renderService.render(service.datagram,v, params));
	       });
	       q.resolve(service.datagram);

	     });
      }

      return q.promise;
    }

    return service;


  });
