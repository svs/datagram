//= require jquery
//= require lodash
//= require c3.min.js
//= require d3.min.js
//= require tauCharts.min.js

$(document).ready(function() {
  var url = $('meta[name="url"]')[0].getAttribute('content');
  console.log(url);
  $.get(url, function(a,b,c) {
    console.log(a,b,c);
    var ch = new tauCharts.Chart(_.merge({
      plugins: [
	tauCharts.api.plugins.get('tooltip')(),
        tauCharts.api.plugins.get('legend')()
      ]
    },a));
    ch.renderTo('#tauchart');
    if (typeof window.callPhantom === 'function') {
      window.callPhantom({ hello: 'world' });
    }
  });
});
