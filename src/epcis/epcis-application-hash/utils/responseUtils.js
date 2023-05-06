exports.response400 = (res, error)=>{
    return  res.status(400).json({
        "type": "epcisException:QueryValidationException",
        "title": "EPCIS query exception",
        "status": 400,
        "detail":error
    });
}

exports.response401 = (res, error)=>{
    return  res.status(401).json({
    "type": "epcisException:SecurityException",
    "title": "Unauthorised request",
    "status": 401,
    "detail":error
    });
  }

exports.response406 = (res, error)=>{
    return  res.status(406).json({
        "type": "epcisException:NotAcceptableException",
        "title": "Conflicting request and response headers",
        "status": 406,
        "detail":error
    });
}

exports.response500 = (res, error)=>{
    res.status(500).json({
        "type": "epcisException:ImplementationException",
        "title": "A server-side error occurred",
        "status": 500,
        "detail":String(error)
      });
}

exports.response413 = (res, error)=>{
    res.status(413).json({
        "type": "epcisException:QueryTooLargeException",
        "title": "An attempt to execute a query resulted in more data than the service was willing to provide.",
        "status": 413,
        "detail":String(error)
      });
}


exports.response404 = (res)=>{
    return  res.status(406).json({
        "type": "epcisException:NoSuchResourceException",
        "title": "Resource not found",
        "status": 404
    });
}