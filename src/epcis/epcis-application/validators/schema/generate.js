var deref = require('json-schema-deref');
var myschema = require('./allepcis.json');

deref(myschema, function(err, fullSchema) {
    console.log(fullSchema); // has the full expanded $refs
  });