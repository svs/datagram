angular.module('liquidApp', ['ngMaterial', 'md.data.table'])

.config(['$mdThemingProvider', function ($mdThemingProvider) {
    'use strict';

    $mdThemingProvider.theme('default')
      .primaryPalette('blue');
}]).service('datagramService', ['$http', '$location',function($http, $location) {
  var datagramData = {};
  var url = $location.absUrl().replace(".html",".json");
  $http.get(url).then(function(d) {
    console.log(d);
    datagramData.data = d;
  });;
  return datagramData;
}])

  .controller('tableController', ['$http', '$location', '$scope', 'datagramService', function ($http, $location, $scope, datagramService) {
    $scope.data = datagramService.data;
}]);
