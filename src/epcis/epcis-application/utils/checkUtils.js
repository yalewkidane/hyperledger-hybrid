const extensions= require("../config/extensions.js");

exports.checkQueryParameter=(parameters)=>{
    if(parameters.hasOwnProperty('gs1-epcis-max')){
        try{
            const vals=parameters['gs1-epcis-max'].split('.');
            if(Number(vals[0])>2 || Number(vals[0])<2)
                return [false, "GS1-EPCIS-Max support is 2.0"]
        }catch(error){
            return [false, "GS1-EPCIS-Max" +String(error)]
        }
    }
    if(parameters.hasOwnProperty('gs1-epcis-min')){
        try{
            const vals=parameters['gs1-epcis-min'].split('.');
            if(Number(vals[0])<2 || Number(vals[0])>2)
                return [false, "GS1-EPCIS-Min support is 2.0"]
        }catch(error){
            return [false, "GS1-EPCIS-Min" +String(error)]
        }
    }

    if(parameters.hasOwnProperty('gs1-cbv-max')){
        try{
            const vals=parameters['gs1-cbv-max'].split('.');
            if(Number(vals[0])>2 || Number(vals[0])<2)
                return [false, "GS1-CBV-Max support is 2.0"]
        }catch(error){
            return [false, "GS1-CBV-Max" +String(error)]
        }
    }
    if(parameters.hasOwnProperty('gs1-cbv-min')){
        try{
            const vals=parameters['gs1-cbv-min'].split('.');
            if(Number(vals[0])<2 || Number(vals[0])>2)
                return [false, "GS1-CBV-Min support is 2.0"]
        }catch(error){
            return [false, "GS1-CBV-Min" +String(error)]
        }
    }

    if(parameters.hasOwnProperty('gs1-epcis-version')){
        if(parameters['gs1-epcis-version']!=='2.0.0'){
            return [false, "Only Version 2.0.0 is supported"];
        }
    }


    //if(parameters.hasOwnProperty('gs1-extensions')){
        //console.log(parameters['gs1-extensions'])
        //return [false, "GS1-Extensions ["+ parameters['gs1-extensions']+ " ] ARE NOT SUPPORTED"]
    //}

    return [true, "all checked"]
    
  }