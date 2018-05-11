//= require jquery
//= require lodash
//= require handlebars.js

$(document).ready(function() {
    var url = $('meta[name="url"]')[0].getAttribute('content');
    var template = $('meta[name="template"]')[0].getAttribute('content');
    var h = Handlebars.compile(template);

  console.log(url);
    $.get(url, function(a,b,c) {
	console.log(h(a));
	$('#content').html(h(a));
  });
});
