//= require jquery
//= require jquery-ui.min.js
//= require highcharts/highcharts.js
//= require lodash
//= require moment.min.js
//= require chroma.min.js
//= require c3.min.js
//= require d3.min.js
//= require numbro.min.js
//= require pikaday.js
//= require ZeroClipboard.min.js
//= require handsontable.min.js
//= require pivot.js
//= require c3_renderers.min.js
//= require d3_renderers.min.js
//= require hightchart_renderers.js
//= require novix.pivot.renderer.js





$(document).ready(function() {
  var renderers = $.extend($.pivotUtilities.renderers,
			   $.pivotUtilities.novix_renderers,
			   $.pivotUtilities.highchart_renderers);

  var a = JSON.parse(unescape($('meta[name="data"]')[0].getAttribute('content')));
  console.log(a);
  $('#pivot').pivotUI(a.data, _.merge(a.config,{renderers: renderers}));

});
