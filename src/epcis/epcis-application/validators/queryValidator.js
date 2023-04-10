const AJV = require('ajv').default;
const addFormats = require('ajv-formats').default;


const querySchema = require("./schema/querySchema");
const validator = new AJV();
addFormats(validator);


exports.queryValidate = function(data) {
    //console.log(data);
    //console.log(JSON.stringify(data, null, 4));
    var valStatus=false;
    const validateScheme = validator.validateSchema(querySchema);
    //console.log('validateScheme', validateScheme)
    if(validateScheme){
        let validatedData= validator.validate(querySchema, data); 
        //console.log('ValidateData', validatedData)
        if(validatedData){
            valStatus=true;
        }else{
            //console.log(validator.errors)  
        }
    }
    return [valStatus, validator.errors];
}

