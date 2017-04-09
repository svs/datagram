var reverse = function(expr, options) {
  expr = Mustache.resolve(expr);
  if (!!expr && expr.length) {
    var result = [];
    for (var i = expr.length - 1; i >= 0; i--) {
      result.push(options.fn(expr[i]));
    }
    console.log('reverse', result);
    return result.join('');
  }
}
