angular.module('liquidApp', ['ngMaterial', 'md.data.table'])

.config(['$mdThemingProvider', function ($mdThemingProvider) {
    'use strict';

    $mdThemingProvider.theme('default')
      .primaryPalette('blue');
}]).service('datagramService', ['$http', '$location',function($http, $location) {
  var get = function() {
    var url = "http://localhost:4000/api/v1/d/Xit9Mg3rqEq8LEvE1gTVdg.json?views[]=table.jq";//$location.absUrl().replace(".html",".json");
    var p = $http.get(url).then(function(d) {
      console.log(d.data);
      return d.data;
    });;
    return p;
  }

  return {get: get};
}])

  .controller('tableController', ['$http', '$location', '$scope', 'datagramService', function ($http, $location, $scope, datagramService) {
    datagramService.get().then(function(d) { $scope.data = d});;
}]);
