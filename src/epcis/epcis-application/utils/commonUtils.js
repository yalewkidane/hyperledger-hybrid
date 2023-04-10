
function checkQueryParameter(parameters){
    if(parameters.hasOwnProperty('GS1-EPCIS-Version')){
        if(parameters['GS1-EPCIS-Version'] != 2.0){
            return [false, "Only GS1-EPCIS-Version = 2.0 is supported"]
        }
    }
    if(parameters.hasOwnProperty('GS1-CBV-Version')){
        if(parameters['GS1-CBV-Version'] != 2.0){
            return [false, "Only GS1-CBV-Version = 2.0 is supported"]
        }
    }

    return [true, "all checked"]
    
  }


  module.exports = { checkQueryParameter }