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
//= require angular
//= require lodash
//= require restangular
//= require angular-ui-router
//= require angular-pusher
//= require highlight.pack.js
//= require angular-highlightjs.js
//= require ui-ace.js
//= require ui-bs.js
//= require highcharts.js
//= require highcharts-ng.min.js
//= require checklist-model.js
//= require moment.min.js
//= require angular-translate.min.js
//= require angular-humanSeconds.min.js
//= require angular-animate.min.js
//= require angular-aria.min.js
//= require angular-messages.min.js
//= require angular-material.min.js
//= require md-data-table.min.js
//= require angular-wizard.min.js
//= require jmespath.js
//= require bootstrap.min


$(document).ready(function() {
  $('a[href="' + window.location.pathname + '"]').parent().addClass('active');
});
