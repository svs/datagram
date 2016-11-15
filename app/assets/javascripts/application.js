// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require ace.js
//= require jquery
//= require angular-1.5.8.min.js
//= require lodash
//= require restangular
//= require angular-ui-router
//= require angular-pusher
//= require highlight.pack.js
//= require angular-highlightjs.js
//= require ui-ace.js
//= require ui-bs.js
//= require checklist-model.js
//= require moment.min.js
//= require angular-translate.min.js
//= require angular-humanSeconds.min.js
//= require jmespath.js
//= require highcharts/highcharts.js
//= require highcharts-ng.min.js
//= require bootstrap.min
//= require liquid.min.js
//= require mustache.min.js
//= require angular-sanitize.min.js
$(document).ready(function() {
  $('a[href="' + window.location.pathname + '"]').parent().addClass('active');
});
