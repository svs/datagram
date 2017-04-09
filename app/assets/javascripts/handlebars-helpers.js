Handlebars.registerHelper("last_value", function(array, key, foo) {
  console.log('HANDLEBARS 1', arguments);
  var el =  array[array.length-1];
  console.log('HANDLEBARS', key, this, el);
  return el[key.hash.key];
});
