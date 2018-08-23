//= require jquery
//= require flexmonster
//= require moment.min.js
$(document).ready(function() {
  var url = $('meta[name="url"]')[0].getAttribute('content');
  console.log(url);
  $.get(url, function(a,b,c) {
      console.log(a.data);
      var report = a.report;
      report.dataSource =  {data: a.data};
      var pivot = new Flexmonster({
	  container: "flexmonster",
	  toolbar: true,
	  report: a.report,
	  dataSource: {data:a.data},
	  licenseKey: "Z77C-XAH84A-2P3E5X-2O1Z2W",
	  componentFolder: '/flexmonster/',
	  width: '100%',
	  height: '100%',
	  grandTotalsPosition: 'top'
      });
      $('#luts').html(moment(a.metadata.updated_at*1000).fromNow());

  });
});
