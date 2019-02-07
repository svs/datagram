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
	  licenseKey: "Z7QZ-13JA4L-2R5730-5N0R48-5W593J-586F60-0O5X5R-1Z3B71-3K6U3T-2K625T-0Z4R4S-59013E-2G1S4N-35571Q",
	  componentFolder: '/flexmonster/',
	  width: '100%',
	  height: '100%',
	  options: {
	      grandTotalsPosition: 'top'
	  },
	  customizeCell: customizeCellFunction
      });
      $('#luts').html(moment(a.metadata.updated_at*1000).fromNow());

  });

    function customizeCellFunction(cell, data) {
    }
});
