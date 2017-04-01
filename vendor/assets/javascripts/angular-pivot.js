(function(window, undefined) {

  var module = angular.module('angular-pivottable', []);
  module.directive('ngPivot', function(){
    return {
      restrict: 'A',
      scope: {
	ngPivot: '@',
	ngPivotOptions: '@'
      },
      link: function(scope, element, attrs) {
        // Get data
        var initialData = scope.$parent.$eval("view.name");
        // Get options
        var initialOptions = _.clone(scope.ngPivotOptions);

        // Pivot renderer
        var render = function(input){
          var data = input.data || initialData || [];
          var options = input.options || initialOptions || {};
	  console.log('angular pivot render', data, options, initialData, initialOptions, attrs);
          element.pivotUI(data, options);
        };

        //Attempt to load google charts
        if(typeof google != 'undefined') {
          google.load('visualization', '1.0', {
            packages: ['corechart','charteditor'],
            callback: function() {
              var derivers = $.pivotUtilities.derivers;
              var renderers = $.extend($.pivotUtilities.renderers, $.pivotUtilities.gchart_renderers);
              config.renderers = renderers;
              // First render
              render({ data : initialData, options : initialOptions });
            }
          });
        }else{
          // First render
	  console.log('INITIALDATA pivot', scope.ngPivot, scope.$eval("renderedData['" + initialData + "']"));
          render({ data : initialData, options : initialOptions });
        }

        // Data binding
        scope.$watch(attrs.ngPivot, function(value){
          // Reload pivot
	  console.log('ngPivot',value);
          render({ data : value, options: null });
        });
        scope.$watch(attrs.ngPivotOptions, function(value){
          // Reload pivot
	  console.log('ngPivotOptions',value);
          render({ data: null, options : value });
        });

      }
    }
  });
}(window));
