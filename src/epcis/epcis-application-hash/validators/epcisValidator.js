const AJV = require('ajv').default;
const addFormats = require('ajv-formats').default;


const epcisSchema = require("./epcisSchema");
const validator = new AJV();
addFormats(validator);

exports.sometest = function() {
    return 2;
}

exports.epcValidate = function(data) {
    //console.log(data);
    //console.log(JSON.stringify(data, null, 4));
    var valStatus=false;
    const validateScheme = validator.validateSchema(epcisSchema);
    //console.log('validateScheme', validateScheme)
    if(validateScheme){
        let validatedData= validator.validate(epcisSchema, data); 
        //console.log('ValidateData', validatedData)
        if(validatedData){
            valStatus=true;
        }else{
            //console.log(validator.errors)  
        }
    }
    return [valStatus, validator.errors];
}

