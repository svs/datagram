var sourcesApp = angular.module('sourcesApp', ['restangular','ui.router']);

sourcesApp.config(function($stateProvider,$urlRouterProvider) {
  $urlRouterProvider.otherwise('/');

  $stateProvider.
    state('index',
	  {url: '/', templateUrl: "index.html"}
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

angular.module('sourcesApp').controller('sourcesCtrl',['$scope','Restangular','$stateParams', function($scope, Restangular,$stateParams) {
  Restangular.all('api/v1/sources').getList().then(function(r) {
    console.log(r);
    $scope.sources = _.sortBy(r, function(s) { return s.name});
  });
}]);

angular.module('sourcesApp').controller('sourceCtrl',['$scope','Restangular','$stateParams', function($scope, Restangular,$stateParams) {
    $scope.id = $stateParams.id;
    Restangular.one('api/v1/sources',$scope.id).get().then(function(r) {
    $scope.source = r;
  });
}]);

angular.module('sourcesApp').controller('editSourceCtrl',['$scope','Restangular','$stateParams', '$state',function($scope, Restangular,$stateParams, $state) {

    $scope.id = $stateParams.id;
    Restangular.one('api/v1/sources',$scope.id).get().then(function(r) {
	$scope.source = r;
    });
    $scope.save = function() {
	$scope.source.save().then(function(d) {
	    $state.go('show',{id: $scope.watch.id});
	});
    };
}]);


angular.module('sourcesApp').controller('newSourceCtrl',['$scope','Restangular','$stateParams', '$state',function($scope, Restangular,$stateParams, $state) {
    var baseSources = Restangular.all('api/v1/sources');

    $scope.id = $stateParams.id;
    Restangular.one('api/v1/sources/new').get().then(function(r) {
	$scope.source = r;
    });
    $scope.save = function() {
	baseSources.post($scope.source).then(function(d) {
	    $state.go('index');
	});
    };
}]);
