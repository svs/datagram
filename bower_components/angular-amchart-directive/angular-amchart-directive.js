/* global angular, AmCharts */
'use strict';
angular.module('AngularAmChart', []).directive('amchart', function () {
    // Gerador de UUID para o id obrigatório do elemento do AmCharts
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
    }
    function guid() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
    }
    return {
        replace: true, // TODO Um dia eu vou tirar isso
        scope: {
            options: '=ngModel',
            returnChart: '='
        },
        template: "<div class='amchart' style='width: 100%; height: 100%;'></div>",
        link: function (scope, element) {
            var id = guid();
            element.attr('id', id);

            //Função que renderiza o gráfico na tela
            var _renderChart = function (amChartOptions) {
                var option = amChartOptions || scope.options;

                if (option) {

                    //verificando qual tipo é o gráfico
                    switch (option.type) {
                        case "serial":
                            scope.chart = new AmCharts.AmSerialChart();
                            break;
                        case "pie":
                            scope.chart = new AmCharts.AmPieChart();
                            break;
                        case "funnel":
                            scope.chart = new AmCharts.AmFunnelChart();
                            break;
                        case "gauge":
                            scope.chart = new AmCharts.AmAngularGauge();
                            break;
                        case "radar":
                            scope.chart = new AmCharts.AmRadarChart();
                            break;
                        case "xy":
                            scope.chart = new AmCharts.AmXYChart();
                            break;
                        default:
                            scope.chart = new AmCharts.AmSerialChart();
                            break;
                    }

                    scope.chart.dataProvider = option.data || option.dataProvider;

                    //Colocando no objeto chart todos as propriedades que vierem no option
                    var chartKeys = Object.keys(option);
                    for (var i = 0; i < chartKeys.length; i++) {
                        if (typeof option[chartKeys[i]] !== 'object' && typeof option[chartKeys[i]] !== 'function') {
                            scope.chart[chartKeys[i]] = option[chartKeys[i]];
                        } else {
                            scope.chart[chartKeys[i]] = angular.copy(option[chartKeys[i]]);
                        }
                    }
                    //Método do objeto Amchart para rendererizar o gráfico
                    scope.chart.write(id);

                    //Caso você queira utilizar o objeto de chart para criar algum evento
                    if (scope.returnChart) {
                        scope.$parent.setChart(scope.chart);
                    }
                } else {
                    //Instanciando o chart de serial
                    scope.chart = new AmCharts.AmSerialChart();
                }
            };

            scope.$watch('options', function (newValue) {
                if (id === element[0].id || !id) {
                    _renderChart(newValue);
                }
            }, true);

            _renderChart(scope.options);
        }
    };
});
