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
	  licenseKey: "Z7V7-XH585M-6K3V1K-092Q18-1K4M5B-0X2W1K-1T550Z-1Y013C-0Z620F-3D2D62",
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
