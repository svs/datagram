//= require highcharts/highcharts.js
//= require highcharts/modules/funnel.js
//= require jquery
//= require lodash

$(document).ready(function() {
  var url = $('meta[name="url"]')[0].getAttribute('content');
  console.log(url);
  $.get(url, function(a,b,c) {
      console.log(a,b,c);
      Highcharts.chart('highchart',a);
  });
});
