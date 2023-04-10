exports.responseOb={
    "@context": ["https://ref.gs1.org/standards/epcis/2.0.0/epcis-context.jsonld"],
    type: "EPCISQueryDocument",
    schemaVersion : "2.0",
    creationDate : new Date().toJSON(),
    epcisBody : {
        queryResults:{
            queryName : "SimpleEventQuery",
            resultBody : {
                eventList : Object
            }
        }
    }

}


exports.responseObMaster={
    "@context": [
        "https://ref.gs1.org/standards/epcis/2.0.0/epcis-context.jsonld"],
    type: "EPCISQueryDocument",
    schemaVersion : "2.0",
    creationDate : new Date().toJSON(),
    epcisBody : {
        queryResults:{
            queryName : "SimpleMasterDataQuery",
            resultBody : {
                vocList : Object
            }
        }
    }

}