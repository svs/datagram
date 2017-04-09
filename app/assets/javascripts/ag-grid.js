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
//= require jquery
//= require lodash
//= require moment.min.js
//= require chroma.min.js
//= require ag-grid-ent.min.js

agGrid.LicenseManager.setLicenseKey("ag-Grid_Evaluation_License_Not_for_Production_100Devs24_May_2017__MTQ5NTU4MDQwMDAwMA==16be8f8f82a5e4b5fa39766944c69a32");

var gridOptions = {enableSorting: true, enableFilter: true, rowData: null, showToolPanel: true, enableStatusBar: true };

var exportDataAsExcel = function() {
  console.log('Excel!');
  gridOptions.api.exportDataAsCsv();
};

var doGridOp = function(data, opData,opName, col) {
  console.log('doGridOp',arguments);
  if (opName == 'gradient') {
    if (_.isArray(opData[0])) {
      var colors = opData[0];
      var domain = opData[1];
    } else {
      var colors = opData;
      var data = _.map(data.rowData, col.field);
      var max = _.max(data);
      var min = _.min(data);
      var domain = [min,max];
    }
    console.log('colors',colors);
    console.log('domain',domain);
    var scale = chroma.scale(colors).domain(domain).mode('lab');
    var r = {cellStyle: function(p) {
      return {background: scale(p.value), color: "white"};
    }};
    return r;
  }
};

var renderAgGrid = function(data) {
  console.log('renderAgGrid', data);
  var keys = _.keys(data.rowData[0]);
  var cols = _.map(keys, function(a) { return {headerName: a, field: a};});
  var reservedWords = ['gradient'];
  _.map(data.columnDefs, function(v,k,x) {
    var col = _.find(cols, {field: k});
    col = _.merge(col, _.omit(v, reservedWords));
    var ops = _.pick(v, reservedWords);
    console.log('ops',ops);
    console.log('col',col);
    _.map(ops, function(opData,opName) {
      var r = doGridOp(data,opData,opName,col);
      console.log('r',r);
      col = _.merge(col, r);
    });
  });
  console.log(cols);
  gridOptions.api.setColumnDefs(cols);
  gridOptions.api.setRowData(data.rowData);
  gridOptions.api.sizeColumnsToFit();
  gridOptions.api.enableStatusBar(true);
  gridOptions.columnApi.setPivotMode(data.pivotMode);
};

$(document).ready(function() {

  var eGridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(eGridDiv, gridOptions);

  var data = ($('meta[name="data"]')[0].getAttribute('content'));
  console.log(data);
  renderAgGrid(data);
});
