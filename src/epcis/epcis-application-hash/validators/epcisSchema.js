module.exports = epcisSchema = 
{
    "$id": "https://ref.gs1.org/standards/epcis/2.0.0/epcis-json-schema.json",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "required": [
      "type"
    ],
    "properties": {
      "type": {
        "type": "string"
      }
    },
    "allOf": [
      {
        "if": {
          "type": "object",
          "properties": {
            "type": {
              "enum": [
                "EPCISDocument"
              ]
            }
          }
        },
        "then": {
          "$ref": "#/definitions/epcisDocument"
        }
      },
      {
        "if": {
          "type": "object",
          "properties": {
            "type": {
              "enum": [
                "EPCISQueryDocument"
              ]
            }
          }
        },
        "then": {
          "$ref": "#/definitions/epcisQueryDocument"
        }
      },
      {
        "if": {
          "type": "object",
          "properties": {
            "type": {
              "enum": [
                "ObjectEvent"
              ]
            }
          }
        },
        "then": {
          "allOf": [
            {
              "$ref": "#/definitions/ObjectEvent"
            },
            {
              "$ref": "#/definitions/required-ld-context"
            }
          ]
        }
      },
      {
        "if": {
          "type": "object",
          "properties": {
            "type": {
              "enum": [
                "AggregationEvent"
              ]
            }
          }
        },
        "then": {
          "allOf": [
            {
              "$ref": "#/definitions/AggregationEvent"
            },
            {
              "$ref": "#/definitions/required-ld-context"
            }
          ]
        }
      },
      {
        "if": {
          "type": "object",
          "properties": {
            "type": {
              "enum": [
                "AssociationEvent"
              ]
            }
          }
        },
        "then": {
          "allOf": [
            {
              "$ref": "#/definitions/AssociationEvent"
            },
            {
              "$ref": "#/definitions/required-ld-context"
            }
          ]
        }
      },
      {
        "if": {
          "type": "object",
          "properties": {
            "type": {
              "enum": [
                "TransformationEvent"
              ]
            }
          }
        },
        "then": {
          "allOf": [
            {
              "$ref": "#/definitions/TransformationEvent"
            },
            {
              "$ref": "#/definitions/required-ld-context"
            }
          ]
        }
      },
      {
        "if": {
          "type": "object",
          "properties": {
            "type": {
              "enum": [
                "TransactionEvent"
              ]
            }
          }
        },
        "then": {
          "allOf": [
            {
              "$ref": "#/definitions/TransactionEvent"
            },
            {
              "$ref": "#/definitions/required-ld-context"
            }
          ]
        }
      },
      {
        "if": {
          "not": {
            "type": "object",
            "properties": {
              "type": {
                "enum": [
                  "AssociationEvent",
                  "ObjectEvent",
                  "AggregationEvent",
                  "TransactionEvent",
                  "TransformationEvent",
                  "EPCISQueryDocument",
                  "EPCISDocument"
                ]
              }
            }
          }
        },
        "then": {
          "allOf": [
            {
              "$ref": "#/definitions/Extended-Event"
            },
            {
              "$ref": "#/definitions/required-ld-context"
            }
          ]
        }
      }
    ],
    "definitions": {
      "vocabulary": {
        "type": "object",
        "properties": {
          "type": {
            "$ref": "#/definitions/uri"
          },
          "vocabularyElementList": {
            "type": "array",
            "items": {
              "$ref": "#/definitions/vocabularyElement"
            }
          }
        },
        "required": [
          "type"
        ]
      },
      "vocabularyElement": {
        "type": "object",
        "properties": {
          "id": {
            "$ref": "#/definitions/uri"
          },
          "attributes": {
            "type": "array",
            "items": {
              "$ref": "#/definitions/attribute"
            }
          },
          "children": {
            "type": "array",
            "items": {
              "$ref": "#/definitions/uri"
            }
          }
        },
        "required": [
          "id"
        ]
      },
      "attribute": {
        "type": "object",
        "properties": {
          "id": {
            "$ref": "#/definitions/uri"
          },
          "attribute": {
            "anyOf": [
              {
                "type": "number"
              },
              {
                "type": "string"
              },
              {
                "type": "object"
              }
            ]
          }
        },
        "required": [
          "id"
        ]
      },
      "eventList": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/EPCIS-Document-Event"
        }
      },
      "vocabularyList": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/vocabulary"
        }
      },
      "resultsBody": {
        "type": "object",
        "properties": {
          "eventList": {
            "$ref": "#/definitions/eventList"
          },
          "vocabularyList": {
            "$ref": "#/definitions/vocabularyList"
          }
        },
        "required": [
          "eventList"
        ],
        "propertyNames": {
          "anyOf": [
            {
              "type": "string",
              "enum": [
                "eventList",
                "vocabularyList"
              ]
            },
            {
              "$ref": "#/definitions/vocab-uri"
            }
          ]
        }
      },
      "queryResults": {
        "type": "object",
        "properties": {
          "queryName": {
            "type": "string"
          },
          "subscriptionID": {
            "type": "string"
          },
          "resultsBody": {
            "$ref": "#/definitions/resultsBody"
          }
        },
        "required": [
          "queryName",
          "resultsBody"
        ],
        "propertyNames": {
          "anyOf": [
            {
              "type": "string",
              "enum": [
                "queryName",
                "subscriptionID",
                "resultsBody"
              ]
            },
            {
              "$ref": "#/definitions/vocab-uri"
            }
          ]
        }
      },
      "epcisQueryDocumentBody": {
        "type": "object",
        "properties": {
          "queryResults": {
            "$ref": "#/definitions/queryResults"
          }
        },
        "required": [
          "queryResults"
        ],
        "propertyNames": {
          "anyOf": [
            {
              "type": "string",
              "enum": [
                "queryResults"
              ]
            },
            {
              "$ref": "#/definitions/vocab-uri"
            }
          ]
        }
      },
      "epcisHeader": {
        "type": "object",
        "properties": {
          "epcisMasterData": {
            "type": "object",
            "properties": {
              "vocabularyList": {
                "type": "array",
                "items": {
                  "$ref": "#/definitions/vocabulary"
                }
              }
            }
          }
        },
        "propertyNames": {
          "anyOf": [
            {
              "type": "string",
              "enum": [
                "epcisMasterData"
              ]
            },
            {
              "$ref": "#/definitions/vocab-uri"
            }
          ]
        }
      },
      "epcisDocument": {
        "type": "object",
        "properties": {
          "id": {
            "$ref": "#/definitions/id"
          },
          "type": {
            "type": "string",
            "enum": [
              "EPCISDocument"
            ]
          },
          "@context": {
            "$ref": "#/definitions/@context"
          },
          "schemaVersion": {
            "$ref": "#/definitions/version"
          },
          "creationDate": {
            "$ref": "#/definitions/time"
          },
          "instanceIdentifier": {
            "type": "string"
          },
          "sender": {
            "type": "string"
          },
          "receiver": {
            "type": "string"
          },
          "epcisHeader": {
            "$ref": "#/definitions/epcisHeader"
          },
          "epcisBody": {
            "type": "object",
            "properties": {
              "eventList": {
                "$ref": "#/definitions/eventList"
              }
            },
            "required": [
              "eventList"
            ]
          }
        },
        "required": [
          "@context",
          "type",
          "schemaVersion",
          "creationDate",
          "epcisBody"
        ],
        "propertyNames": {
          "anyOf": [
            {
              "type": "string",
              "enum": [
                "@context",
                "id",
                "type",
                "schemaVersion",
                "creationDate",
                "instanceIdentifier",
                "sender",
                "receiver",
                "epcisHeader",
                "epcisBody"
              ]
            },
            {
              "$ref": "#/definitions/vocab-uri"
            }
          ]
        }
      },
      "epcisQueryDocument": {
        "type": "object",
        "properties": {
          "@context": {
            "$ref": "#/definitions/@context"
          },
          "id": {
            "$ref": "#/definitions/id"
          },
          "type": {
            "type": "string",
            "enum": [
              "EPCISQueryDocument"
            ]
          },
          "schemaVersion": {
            "$ref": "#/definitions/version"
          },
          "creationDate": {
            "$ref": "#/definitions/time"
          },
          "epcisBody": {
            "$ref": "#/definitions/epcisQueryDocumentBody"
          }
        },
        "required": [
          "@context",
          "type",
          "epcisBody"
        ],
        "propertyNames": {
          "anyOf": [
            {
              "type": "string",
              "enum": [
                "@context",
                "id",
                "type",
                "schemaVersion",
                "creationDate",
                "epcisBody"
              ]
            },
            {
              "$ref": "#/definitions/vocab-uri"
            }
          ]
        }
      },
      "EPCIS-Document": {
        "oneOf": [
          {
            "$ref": "#/definitions/epcisDocument"
          },
          {
            "$ref": "#/definitions/epcisQueryDocument"
          }
        ]
      },
      "uri": {
        "type": "string",
        "format": "uri"
      },
      "time": {
        "type": "string",
        "format": "date-time"
      },
      "decimal": {
        "type": "number"
      },
      "boolean": {
        "type": "boolean"
      },
      "hexBinary": {
        "type": "string",
        "pattern": "^[A-Fa-f0-9]+$"
      },
      "string": {
        "type": "string"
      },
      "action": {
        "type": "string",
        "enum": [
          "OBSERVE",
          "ADD",
          "DELETE"
        ]
      },
      "eventType": {
        "anyOf": [
          {
            "type": "string",
            "enum": [
              "ObjectEvent",
              "AggregationEvent",
              "AssociationEvent",
              "TransformationEvent",
              "TransactionEvent"
            ]
          },
          {
            "type": "string",
            "format": "uri"
          }
        ]
      },
      "persistentDisposition": {
        "allOf": [
          {
            "type": "object",
            "properties": {
              "set": {
                "type": "array",
                "items": {
                  "$ref": "#/definitions/disposition"
                },
                "minItems": 1,
                "uniqueItems": true
              },
              "unset": {
                "type": "array",
                "items": {
                  "$ref": "#/definitions/disposition"
                },
                "minItems": 1,
                "uniqueItems": true
              }
            },
            "additionalProperties": false
          },
          {
            "anyOf": [
              {
                "type": "object",
                "required": [
                  "set"
                ]
              },
              {
                "type": "object",
                "required": [
                  "unset"
                ]
              }
            ]
          }
        ]
      },
      "epcList": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/uri"
        },
        "uniqueItems": true
      },
      "quantityList": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/quantityElement"
        }
      },
      "uom": {
        "type": "string",
        "pattern": "^[A-Z0-9]{2,3}$"
      },
      "eventID": {
        "$ref": "#/definitions/uri"
      },
      "certificationInfo": {
        "anyOf": [
          {
            "type": "array",
            "items": {
              "$ref": "#/definitions/uri"
            }
          },
          {
            "$ref": "#/definitions/uri"
          }
        ]
      },
      "errorDeclaration": {
        "type": "object",
        "properties": {
          "declarationTime": {
            "$ref": "#/definitions/time"
          },
          "reason": {
            "$ref": "#/definitions/error-reason"
          },
          "correctiveEventIDs": {
            "type": "array",
            "items": {
              "$ref": "#/definitions/eventID"
            }
          }
        },
        "required": [
          "declarationTime"
        ],
        "propertyNames": {
          "anyOf": [
            {
              "$ref": "#/definitions/vocab-uri"
            },
            {
              "type": "string",
              "enum": [
                "declarationTime",
                "reason",
                "correctiveEventIDs"
              ]
            }
          ]
        }
      },
      "quantityElement": {
        "type": "object",
        "properties": {
          "epcClass": {
            "$ref": "#/definitions/uri"
          },
          "quantity": {
            "$ref": "#/definitions/decimal"
          },
          "uom": {
            "$ref": "#/definitions/uom"
          }
        },
        "required": [
          "epcClass"
        ],
        "additionalProperties": false
      },
      "bizTransaction": {
        "type": "object",
        "properties": {
          "type": {
            "$ref": "#/definitions/bizTransaction-type"
          },
          "bizTransaction": {
            "$ref": "#/definitions/uri"
          }
        },
        "required": [
          "bizTransaction"
        ],
        "additionalProperties": false
      },
      "readPoint": {
        "type": "object",
        "properties": {
          "id": {
            "$ref": "#/definitions/uri"
          }
        },
        "required": [
          "id"
        ]
      },
      "bizLocation": {
        "type": "object",
        "properties": {
          "id": {
            "$ref": "#/definitions/uri"
          }
        },
        "required": [
          "id"
        ]
      },
      "source": {
        "type": "object",
        "properties": {
          "type": {
            "$ref": "#/definitions/source-dest-type"
          },
          "source": {
            "$ref": "#/definitions/uri"
          }
        },
        "required": [
          "type",
          "source"
        ],
        "additionalProperties": false
      },
      "destination": {
        "type": "object",
        "properties": {
          "type": {
            "$ref": "#/definitions/source-dest-type"
          },
          "destination": {
            "$ref": "#/definitions/uri"
          }
        },
        "required": [
          "type",
          "destination"
        ],
        "additionalProperties": false
      },
      "sensorElement": {
        "type": "object",
        "properties": {
          "sensorMetadata": {
            "$ref": "#/definitions/sensorMetadata"
          },
          "sensorReport": {
            "$ref": "#/definitions/sensorReportList"
          }
        },
        "required": [
          "sensorReport"
        ],
        "propertyNames": {
          "anyOf": [
            {
              "$ref": "#/definitions/vocab-uri"
            },
            {
              "type": "string",
              "enum": [
                "sensorMetadata",
                "sensorReport"
              ]
            }
          ]
        }
      },
      "sensorReportList": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/sensorReport"
        },
        "minItems": 1
      },
      "sensorReport": {
        "type": "object",
        "properties": {
          "type": {
            "$ref": "#/definitions/measurementType"
          },
          "exception": {
            "$ref": "#/definitions/sensorAlertType"
          },
          "deviceID": {
            "$ref": "#/definitions/uri"
          },
          "deviceMetadata": {
            "$ref": "#/definitions/uri"
          },
          "rawData": {
            "$ref": "#/definitions/uri"
          },
          "dataProcessingMethod": {
            "$ref": "#/definitions/uri"
          },
          "bizRules": {
            "$ref": "#/definitions/uri"
          },
          "time": {
            "$ref": "#/definitions/time"
          },
          "microorganism": {
            "$ref": "#/definitions/uri"
          },
          "chemicalSubstance": {
            "$ref": "#/definitions/uri"
          },
          "coordinateReferenceSystem": {
            "$ref": "#/definitions/uri"
          },
          "value": {
            "$ref": "#/definitions/decimal"
          },
          "component": {
            "$ref": "#/definitions/component"
          },
          "stringValue": {
            "$ref": "#/definitions/string"
          },
          "booleanValue": {
            "$ref": "#/definitions/boolean"
          },
          "hexBinaryValue": {
            "$ref": "#/definitions/hexBinary"
          },
          "uriValue": {
            "$ref": "#/definitions/uri"
          },
          "minValue": {
            "$ref": "#/definitions/decimal"
          },
          "maxValue": {
            "$ref": "#/definitions/decimal"
          },
          "meanValue": {
            "$ref": "#/definitions/decimal"
          },
          "sDev": {
            "$ref": "#/definitions/decimal"
          },
          "percRank": {
            "$ref": "#/definitions/decimal"
          },
          "percValue": {
            "$ref": "#/definitions/decimal"
          },
          "uom": {
            "$ref": "#/definitions/string"
          }
        },
        "required": [
          "type"
        ],
        "propertyNames": {
          "anyOf": [
            {
              "$ref": "#/definitions/vocab-uri"
            },
            {
              "type": "string",
              "enum": [
                "type",
                "exception",
                "deviceID",
                "deviceMetadata",
                "rawData",
                "dataProcessingMethod",
                "bizRules",
                "time",
                "microorganism",
                "chemicalSubstance",
                "coordinateReferenceSystem",
                "value",
                "component",
                "stringValue",
                "booleanValue",
                "hexBinaryValue",
                "uriValue",
                "minValue",
                "maxValue",
                "meanValue",
                "sDev",
                "percRank",
                "percValue",
                "uom"
              ]
            }
          ]
        }
      },
      "sensorMetadata": {
        "type": "object",
        "properties": {
          "time": {
            "$ref": "#/definitions/time"
          },
          "deviceID": {
            "$ref": "#/definitions/uri"
          },
          "deviceMetadata": {
            "$ref": "#/definitions/uri"
          },
          "rawData": {
            "$ref": "#/definitions/uri"
          },
          "startTime": {
            "$ref": "#/definitions/time"
          },
          "endTime": {
            "$ref": "#/definitions/time"
          },
          "dataProcessingMethod": {
            "$ref": "#/definitions/uri"
          },
          "bizRules": {
            "$ref": "#/definitions/uri"
          }
        },
        "propertyNames": {
          "anyOf": [
            {
              "$ref": "#/definitions/vocab-uri"
            },
            {
              "type": "string",
              "enum": [
                "time",
                "deviceID",
                "deviceMetadata",
                "rawData",
                "startTime",
                "endTime",
                "dataProcessingMethod",
                "bizRules"
              ]
            }
          ]
        }
      },
      "ilmd": {
        "type": "object",
        "propertyNames": {
          "type": "string",
          "format": "uri"
        }
      },
      "Event": {
        "type": "object",
        "properties": {
          "@context": {
            "$ref": "#/definitions/@context"
          },
          "eventTime": {
            "$ref": "#/definitions/time"
          },
          "recordTime": {
            "$ref": "#/definitions/time"
          },
          "eventTimeZoneOffset": {
            "type": "string",
            "pattern": "^([+]|[-])((0[0-9]|1[0-3]):([0-5][0-9])|14:00)$"
          },
          "eventID": {
            "$ref": "#/definitions/eventID"
          },
          "certificationInfo": {
            "$ref": "#/definitions/certificationInfo"
          },
          "errorDeclaration": {
            "$ref": "#/definitions/errorDeclaration"
          }
        },
        "required": [
          "eventTime",
          "eventTimeZoneOffset"
        ]
      },
      "common-event-properties": {
        "anyOf": [
          {
            "type": "string",
            "enum": [
              "@context",
              "type",
              "eventTime",
              "recordTime",
              "eventTimeZoneOffset",
              "eventID",
              "certificationInfo",
              "errorDeclaration"
            ]
          },
          {
            "$ref": "#/definitions/vocab-uri"
          }
        ]
      },
      "Extended-Event": {
        "allOf": [
          {
            "$ref": "#/definitions/Event"
          },
          {
            "type": "object",
            "properties": {
              "type": {
                "$ref": "#/definitions/vocab-uri"
              }
            },
            "required": [
              "type"
            ]
          }
        ]
      },
      "disposition": {
        "anyOf": [
          {
            "$ref": "#/definitions/vocab-other-uri"
          },
          {
            "type": "string",
            "enum": [
              "active",
              "container_closed",
              "damaged",
              "destroyed",
              "dispensed",
              "disposed",
              "encoded",
              "expired",
              "in_progress",
              "in_transit",
              "inactive",
              "no_pedigree_match",
              "non_sellable_other",
              "partially_dispensed",
              "recalled",
              "reserved",
              "retail_sold",
              "returned",
              "sellable_accessible",
              "sellable_not_accessible",
              "stolen",
              "unknown",
              "available",
              "completeness_verified",
              "completeness_inferred",
              "conformant",
              "container_open",
              "mismatch_instance",
              "mismatch_class",
              "mismatch_quantity",
              "needs_replacement",
              "non_conformant",
              "unavailable"
            ]
          }
        ]
      },
      "@context": {
        "anyOf": [
          {
            "type": "string",
            "format": "uri"
          },
          {
            "type": "object"
          },
          {
            "type": "array",
            "uniqueItems": true,
            "items": {
              "anyOf": [
                {
                  "type": "string",
                  "format": "uri"
                },
                {
                  "type": "object"
                }
              ]
            }
          }
        ]
      },
      "vocab-uri": {
        "type": "string",
        "format": "uri"
      },
      "vocab-other-uri": {
        "type": "string",
        "format": "uri",
        "pattern": "^(?!(urn:epcglobal:cbv|https?:\\/\\/ns\\.gs1\\.org/cbv\\/))"
      },
      "vocab-nonGS1WebVoc-uri": {
        "type": "string",
        "format": "uri",
        "pattern": "^(?!(https?:\\/\\/gs1\\.org\\/voc\\/|https?:\\/\\/www\\.gs1\\.org\\/voc\\/))"
      },
      "required-ld-context": {
        "type": "object",
        "required": [
          "@context"
        ]
      },
      "version": {
        "type": "string",
        "pattern": "^\\d+(\\.\\d+)*$"
      },
      "id": {
        "type": "string",
        "format": "uri"
      },
      "error-reason": {
        "anyOf": [
          {
            "$ref": "#/definitions/vocab-other-uri"
          },
          {
            "type": "string",
            "enum": [
              "did_not_occur",
              "incorrect_data"
            ]
          }
        ]
      },
      "bizTransaction-type": {
        "anyOf": [
          {
            "$ref": "#/definitions/vocab-other-uri"
          },
          {
            "type": "string",
            "enum": [
              "bol",
              "cert",
              "desadv",
              "inv",
              "pedigree",
              "po",
              "poc",
              "prodorder",
              "recadv",
              "rma",
              "testprd",
              "testres",
              "upevt"
            ]
          }
        ]
      },
      "source-dest-type": {
        "anyOf": [
          {
            "$ref": "#/definitions/vocab-other-uri"
          },
          {
            "type": "string",
            "enum": [
              "owning_party",
              "possessing_party",
              "location"
            ]
          }
        ]
      },
      "measurementType": {
        "anyOf": [
          {
            "$ref": "#/definitions/vocab-nonGS1WebVoc-uri"
          },
          {
            "type": "string",
            "enum": [
              "AbsoluteHumidity",
              "AbsorbedDose",
              "AbsorbedDoseRate",
              "Acceleration",
              "Radioactivity",
              "Altitude",
              "AmountOfSubstance",
              "AmountOfSubstancePerUnitVolume",
              "Angle",
              "AngularAcceleration",
              "AngularMomentum",
              "AngularVelocity",
              "Area",
              "Capacitance",
              "Conductance",
              "Conductivity",
              "Count",
              "Density",
              "Dimensionless",
              "DoseEquivalent",
              "DoseEquivalentRate",
              "DynamicViscosity",
              "ElectricCharge",
              "ElectricCurrent",
              "ElectricCurrentDensity",
              "ElectricFieldStrength",
              "Energy",
              "Exposure",
              "Force",
              "Frequency",
              "Illuminance",
              "Inductance",
              "Irradiance",
              "KinematicViscosity",
              "Length",
              "LinearMomentum",
              "Luminance",
              "LuminousFlux",
              "LuminousIntensity",
              "MagneticFlux",
              "MagneticFluxDensity",
              "MagneticVectorPotential",
              "Mass",
              "MassConcentration",
              "MassFlowRate",
              "MassPerAreaTime",
              "MemoryCapacity",
              "MolalityOfSolute",
              "MolarEnergy",
              "MolarMass",
              "MolarVolume",
              "Power",
              "Pressure",
              "RadiantFlux",
              "RadiantIntensity",
              "RelativeHumidity",
              "Resistance",
              "Resistivity",
              "SolidAngle",
              "SpecificVolume",
              "Speed",
              "SurfaceDensity",
              "SurfaceTension",
              "Temperature",
              "Time",
              "Torque",
              "Voltage",
              "Volume",
              "VolumeFlowRate",
              "VolumeFraction",
              "VolumetricFlux",
              "Wavenumber"
            ]
          }
        ]
      },
      "sensorAlertType": {
        "anyOf": [
          {
            "$ref": "#/definitions/vocab-nonGS1WebVoc-uri"
          },
          {
            "type": "string",
            "enum": [
              "ALARM_CONDITION",
              "ERROR_CONDITION"
            ]
          }
        ]
      },
      "component": {
        "anyOf": [
          {
            "$ref": "#/definitions/vocab-other-uri"
          },
          {
            "type": "string",
            "enum": [
              "x",
              "y",
              "z",
              "axial_distance",
              "azimuth",
              "height",
              "spherical_radius",
              "polar_angle",
              "elevation_angle",
              "easting",
              "northing",
              "latitude",
              "longitude",
              "altitude"
            ]
          }
        ]
      },
      "EPCIS-Document-Event": {
        "type": "object",
        "required": [
          "type"
        ],
        "allOf": [
          {
            "if": {
              "type": "object",
              "properties": {
                "type": {
                  "enum": [
                    "ObjectEvent"
                  ]
                }
              }
            },
            "then": {
              "$ref": "#/definitions/ObjectEvent"
            }
          },
          {
            "if": {
              "type": "object",
              "properties": {
                "type": {
                  "enum": [
                    "AggregationEvent"
                  ]
                }
              }
            },
            "then": {
              "$ref": "#/definitions/AggregationEvent"
            }
          },
          {
            "if": {
              "type": "object",
              "properties": {
                "type": {
                  "enum": [
                    "TransactionEvent"
                  ]
                }
              }
            },
            "then": {
              "$ref": "#/definitions/TransactionEvent"
            }
          },
          {
            "if": {
              "properties": {
                "type": {
                  "enum": [
                    "TransformationEvent"
                  ]
                }
              }
            },
            "then": {
              "$ref": "#/definitions/TransformationEvent"
            }
          },
          {
            "if": {
              "type": "object",
              "properties": {
                "type": {
                  "enum": [
                    "AssociationEvent"
                  ]
                }
              }
            },
            "then": {
              "$ref": "#/definitions/AssociationEvent"
            }
          },
          {
            "if": {
              "not": {
                "type": "object",
                "properties": {
                  "type": {
                    "enum": [
                      "AssociationEvent",
                      "ObjectEvent",
                      "AggregationEvent",
                      "TransactionEvent",
                      "TransformationEvent"
                    ]
                  }
                }
              }
            },
            "then": {
              "$ref": "#/definitions/Extended-Event"
            }
          }
        ],
        "properties": {
          "type": {
            "type": "string"
          }
        }
      },
      "ObjectEvent": {
        "allOf": [
          {
            "$ref": "#/definitions/Event"
          },
          {
            "type": "object",
            "properties": {
              "type": {
                "type": "string",
                "enum": [
                  "ObjectEvent"
                ]
              },
              "epcList": {
                "$ref": "#/definitions/epcList"
              },
              "quantityList": {
                "$ref": "#/definitions/quantityList"
              },
              "action": {
                "$ref": "#/definitions/action"
              },
              "bizStep": {
                "$ref": "#/definitions/bizStep"
              },
              "disposition": {
                "$ref": "#/definitions/disposition"
              },
              "persistentDisposition": {
                "$ref": "#/definitions/persistentDisposition"
              },
              "readPoint": {
                "$ref": "#/definitions/readPoint"
              },
              "bizLocation": {
                "$ref": "#/definitions/bizLocation"
              },
              "bizTransactionList": {
                "type": "array",
                "items": {
                  "$ref": "#/definitions/bizTransaction"
                }
              },
              "sourceList": {
                "type": "array",
                "items": {
                  "$ref": "#/definitions/source"
                }
              },
              "destinationList": {
                "type": "array",
                "items": {
                  "$ref": "#/definitions/destination"
                }
              },
              "sensorElementList": {
                "type": "array",
                "items": {
                  "$ref": "#/definitions/sensorElement"
                }
              },
              "ilmd": {
                "$ref": "#/definitions/ilmd"
              }
            },
            "required": [
              "type",
              "action"
            ],
            "propertyNames": {
              "anyOf": [
                {
                  "$ref": "#/definitions/common-event-properties"
                },
                {
                  "type": "string",
                  "enum": [
                    "action",
                    "epcList",
                    "quantityList",
                    "bizStep",
                    "disposition",
                    "persistentDisposition",
                    "readPoint",
                    "bizLocation",
                    "bizTransactionList",
                    "sourceList",
                    "destinationList",
                    "sensorElementList",
                    "ilmd"
                  ]
                }
              ]
            }
          },
          {
            "anyOf": [
              {
                "type": "object",
                "properties": {
                  "epcList": {
                    "type": "array",
                    "minItems": 0,
                    "items": {
                      "$ref": "#/definitions/id"
                    }
                  }
                },
                "required": [
                  "epcList"
                ]
              },
              {
                "type": "object",
                "properties": {
                  "quantityList": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                      "$ref": "#/definitions/quantityElement"
                    }
                  }
                },
                "required": [
                  "quantityList"
                ]
              },
              {
                "allOf": [
                  {
                    "type": "object",
                    "properties": {
                      "sensorElementList": {
                        "type": "array",
                        "items": {
                          "$ref": "#/definitions/sensorElement"
                        },
                        "minItems": 1
                      }
                    },
                    "required": [
                      "sensorElementList"
                    ]
                  },
                  {
                    "type": "object",
                    "properties": {
                      "readPoint": {
                        "$ref": "#/definitions/readPoint"
                      }
                    },
                    "required": [
                      "readPoint"
                    ]
                  }
                ]
              }
            ]
          },
          {
            "anyOf": [
              {
                "type": "object",
                "properties": {
                  "ilmd": {
                    "not": {}
                  },
                  "action": {
                    "type": "string",
                    "pattern": "^OBSERVE$"
                  }
                }
              },
              {
                "type": "object",
                "properties": {
                  "ilmd": {
                    "not": {}
                  },
                  "action": {
                    "type": "string",
                    "pattern": "^DELETE$"
                  }
                }
              },
              {
                "type": "object",
                "properties": {
                  "action": {
                    "type": "string",
                    "pattern": "^ADD$"
                  }
                }
              }
            ]
          }
        ]
      },
      "bizStep": {
        "anyOf": [
          {
            "$ref": "#/definitions/vocab-other-uri"
          },
          {
            "type": "string",
            "enum": [
              "accepting",
              "arriving",
              "assembling",
              "collecting",
              "commissioning",
              "consigning",
              "creating_class_instance",
              "cycle_counting",
              "decommissioning",
              "departing",
              "destroying",
              "disassembling",
              "dispensing",
              "encoding",
              "entering_exiting",
              "holding",
              "inspecting",
              "installing",
              "killing",
              "loading",
              "other",
              "packing",
              "picking",
              "receiving",
              "removing",
              "repackaging",
              "repairing",
              "replacing",
              "reserving",
              "retail_selling",
              "shipping",
              "staging_outbound",
              "stock_taking",
              "stocking",
              "storing",
              "transporting",
              "unloading",
              "unpacking",
              "void_shipping",
              "sensor_reporting",
              "sampling"
            ]
          }
        ]
      },
      "AggregationEvent": {
        "allOf": [
          {
            "$ref": "#/definitions/Event"
          },
          {
            "type": "object",
            "properties": {
              "type": {
                "type": "string",
                "enum": [
                  "AggregationEvent"
                ]
              },
              "parentID": {
                "$ref": "#/definitions/uri"
              },
              "childEPCs": {
                "type": "array",
                "items": {
                  "$ref": "#/definitions/uri"
                }
              },
              "childQuantityList": {
                "type": "array",
                "items": {
                  "$ref": "#/definitions/quantityElement"
                }
              },
              "action": {
                "$ref": "#/definitions/action"
              },
              "bizStep": {
                "$ref": "#/definitions/bizStep"
              },
              "disposition": {
                "$ref": "#/definitions/disposition"
              },
              "readPoint": {
                "$ref": "#/definitions/readPoint"
              },
              "bizLocation": {
                "$ref": "#/definitions/bizLocation"
              },
              "bizTransactionList": {
                "type": "array",
                "items": {
                  "$ref": "#/definitions/bizTransaction"
                }
              },
              "sourceList": {
                "type": "array",
                "items": {
                  "$ref": "#/definitions/source"
                }
              },
              "destinationList": {
                "type": "array",
                "items": {
                  "$ref": "#/definitions/destination"
                }
              },
              "sensorElementList": {
                "type": "array",
                "items": {
                  "$ref": "#/definitions/sensorElement"
                }
              }
            },
            "required": [
              "type",
              "action"
            ],
            "propertyNames": {
              "anyOf": [
                {
                  "$ref": "#/definitions/common-event-properties"
                },
                {
                  "type": "string",
                  "enum": [
                    "parentID",
                    "childEPCs",
                    "childQuantityList",
                    "action",
                    "bizStep",
                    "disposition",
                    "persistentDisposition",
                    "readPoint",
                    "bizLocation",
                    "bizTransactionList",
                    "sourceList",
                    "destinationList",
                    "sensorElementList"
                  ]
                }
              ]
            }
          },
          {
            "anyOf": [
              {
                "type": "object",
                "properties": {
                  "childEPCs": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                      "$ref": "#/definitions/id"
                    }
                  }
                },
                "required": [
                  "childEPCs"
                ]
              },
              {
                "type": "object",
                "properties": {
                  "childQuantityList": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                      "$ref": "#/definitions/quantityElement"
                    }
                  }
                },
                "required": [
                  "childQuantityList"
                ]
              },
              {
                "type": "object",
                "properties": {
                  "action": {
                    "type": "string",
                    "pattern": "^DELETE$"
                  }
                }
              }
            ]
          }
        ]
      },
      "TransactionEvent": {
        "allOf": [
          {
            "$ref": "#/definitions/Event"
          },
          {
            "type": "object",
            "properties": {
              "type": {
                "type": "string",
                "enum": [
                  "TransactionEvent"
                ]
              },
              "bizTransactionList": {
                "type": "array",
                "items": {
                  "$ref": "#/definitions/bizTransaction"
                },
                "minItems": 1
              },
              "parentID": {
                "$ref": "#/definitions/uri"
              },
              "epcList": {
                "type": "array",
                "items": {
                  "$ref": "#/definitions/uri"
                }
              },
              "quantityList": {
                "type": "array",
                "items": {
                  "$ref": "#/definitions/quantityElement"
                }
              },
              "action": {
                "$ref": "#/definitions/action"
              },
              "bizStep": {
                "$ref": "#/definitions/bizStep"
              },
              "disposition": {
                "$ref": "#/definitions/disposition"
              },
              "readPoint": {
                "$ref": "#/definitions/readPoint"
              },
              "bizLocation": {
                "$ref": "#/definitions/bizLocation"
              },
              "sourceList": {
                "type": "array",
                "items": {
                  "$ref": "#/definitions/source"
                }
              },
              "destinationList": {
                "type": "array",
                "items": {
                  "$ref": "#/definitions/destination"
                }
              },
              "sensorElementList": {
                "type": "array",
                "items": {
                  "$ref": "#/definitions/sensorElement"
                }
              }
            },
            "required": [
              "type",
              "bizTransactionList",
              "action"
            ],
            "propertyNames": {
              "anyOf": [
                {
                  "$ref": "#/definitions/common-event-properties"
                },
                {
                  "type": "string",
                  "enum": [
                    "bizTransactionList",
                    "parentID",
                    "epcList",
                    "quantityList",
                    "action",
                    "bizStep",
                    "disposition",
                    "persistentDisposition",
                    "readPoint",
                    "bizLocation",
                    "sourceList",
                    "destinationList",
                    "sensorElementList"
                  ]
                }
              ]
            }
          },
          {
            "anyOf": [
              {
                "type": "object",
                "properties": {
                  "epcList": {
                    "type": "array",
                    "minItems": 0,
                    "items": {
                      "$ref": "#/definitions/id"
                    }
                  }
                },
                "required": [
                  "epcList"
                ]
              },
              {
                "type": "object",
                "properties": {
                  "quantityList": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                      "$ref": "#/definitions/quantityElement"
                    }
                  }
                },
                "required": [
                  "quantityList"
                ]
              },
              {
                "type": "object",
                "properties": {
                  "action": {
                    "type": "string",
                    "pattern": "^DELETE$"
                  }
                }
              }
            ]
          }
        ]
      },
      "TransformationEvent": {
        "allOf": [
          {
            "$ref": "#/definitions/Event"
          },
          {
            "type": "object",
            "properties": {
              "type": {
                "type": "string",
                "enum": [
                  "TransformationEvent"
                ]
              },
              "inputEPCList": {
                "$ref": "#/definitions/epcList"
              },
              "inputQuantityList": {
                "$ref": "#/definitions/quantityList"
              },
              "outputEPCList": {
                "$ref": "#/definitions/epcList"
              },
              "outputQuantityList": {
                "$ref": "#/definitions/quantityList"
              },
              "transformationID": {
                "$ref": "#/definitions/uri"
              },
              "bizStep": {
                "$ref": "#/definitions/bizStep"
              },
              "disposition": {
                "$ref": "#/definitions/disposition"
              },
              "persistentDisposition": {
                "$ref": "#/definitions/persistentDisposition"
              },
              "readPoint": {
                "$ref": "#/definitions/readPoint"
              },
              "bizLocation": {
                "$ref": "#/definitions/bizLocation"
              },
              "bizTransactionList": {
                "type": "array",
                "items": {
                  "$ref": "#/definitions/bizTransaction"
                }
              },
              "sourceList": {
                "type": "array",
                "items": {
                  "$ref": "#/definitions/source"
                }
              },
              "destinationList": {
                "type": "array",
                "items": {
                  "$ref": "#/definitions/destination"
                }
              },
              "sensorElementList": {
                "type": "array",
                "items": {
                  "$ref": "#/definitions/sensorElement"
                }
              },
              "ilmd": {
                "$ref": "#/definitions/ilmd"
              }
            },
            "required": [
              "type"
            ],
            "propertyNames": {
              "anyOf": [
                {
                  "$ref": "#/definitions/common-event-properties"
                },
                {
                  "type": "string",
                  "enum": [
                    "inputEPCList",
                    "inputQuantityList",
                    "outputEPCList",
                    "outputQuantityList",
                    "transformationID",
                    "bizStep",
                    "disposition",
                    "persistentDisposition",
                    "readPoint",
                    "bizLocation",
                    "bizTransactionList",
                    "sourceList",
                    "destinationList",
                    "sensorElementList",
                    "ilmd"
                  ]
                }
              ]
            }
          },
          {
            "anyOf": [
              {
                "allOf": [
                  {
                    "anyOf": [
                      {
                        "type": "object",
                        "properties": {
                          "inputEPCList": {
                            "type": "array",
                            "minItems": 1,
                            "items": {
                              "type": "string"
                            }
                          }
                        },
                        "required": [
                          "inputEPCList"
                        ]
                      },
                      {
                        "type": "object",
                        "properties": {
                          "inputQuantityList": {
                            "type": "array",
                            "minItems": 1,
                            "items": {
                              "type": "object"
                            }
                          }
                        },
                        "required": [
                          "inputQuantityList"
                        ]
                      }
                    ]
                  },
                  {
                    "anyOf": [
                      {
                        "type": "object",
                        "properties": {
                          "outputEPCList": {
                            "type": "array",
                            "minItems": 1,
                            "items": {
                              "type": "string"
                            }
                          }
                        },
                        "required": [
                          "outputEPCList"
                        ]
                      },
                      {
                        "type": "object",
                        "properties": {
                          "outputQuantityList": {
                            "type": "array",
                            "minItems": 1,
                            "items": {
                              "type": "object"
                            }
                          }
                        },
                        "required": [
                          "outputQuantityList"
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                "anyOf": [
                  {
                    "type": "object",
                    "properties": {
                      "inputEPCList": {
                        "type": "array",
                        "minItems": 1,
                        "items": {
                          "type": "string"
                        }
                      }
                    },
                    "required": [
                      "inputEPCList"
                    ]
                  },
                  {
                    "type": "object",
                    "properties": {
                      "inputQuantityList": {
                        "type": "array",
                        "minItems": 1,
                        "items": {
                          "type": "object"
                        }
                      }
                    },
                    "required": [
                      "inputQuantityList"
                    ]
                  },
                  {
                    "type": "object",
                    "properties": {
                      "outputEPCList": {
                        "type": "array",
                        "minItems": 1,
                        "items": {
                          "type": "string"
                        }
                      }
                    },
                    "required": [
                      "outputEPCList"
                    ]
                  },
                  {
                    "type": "object",
                    "properties": {
                      "outputQuantityList": {
                        "type": "array",
                        "minItems": 1,
                        "items": {
                          "type": "object"
                        }
                      }
                    },
                    "required": [
                      "outputQuantityList"
                    ]
                  }
                ],
                "type": "object",
                "required": [
                  "transformationID"
                ]
              }
            ]
          }
        ]
      },
      "AssociationEvent": {
        "allOf": [
          {
            "$ref": "#/definitions/Event"
          },
          {
            "type": "object",
            "properties": {
              "type": {
                "type": "string",
                "enum": [
                  "AssociationEvent"
                ]
              },
              "parentID": {
                "$ref": "#/definitions/uri"
              },
              "childEPCs": {
                "type": "array",
                "items": {
                  "$ref": "#/definitions/uri"
                }
              },
              "childQuantityList": {
                "type": "array",
                "items": {
                  "$ref": "#/definitions/quantityElement"
                }
              },
              "action": {
                "$ref": "#/definitions/action"
              },
              "bizStep": {
                "$ref": "#/definitions/bizStep"
              },
              "disposition": {
                "$ref": "#/definitions/disposition"
              },
              "readPoint": {
                "$ref": "#/definitions/readPoint"
              },
              "bizLocation": {
                "$ref": "#/definitions/bizLocation"
              },
              "bizTransactionList": {
                "type": "array",
                "items": {
                  "$ref": "#/definitions/bizTransaction"
                }
              },
              "sourceList": {
                "type": "array",
                "items": {
                  "$ref": "#/definitions/source"
                }
              },
              "destinationList": {
                "type": "array",
                "items": {
                  "$ref": "#/definitions/destination"
                }
              },
              "sensorElementList": {
                "type": "array",
                "items": {
                  "$ref": "#/definitions/sensorElement"
                }
              }
            },
            "required": [
              "type",
              "action",
              "parentID"
            ],
            "propertyNames": {
              "anyOf": [
                {
                  "$ref": "#/definitions/common-event-properties"
                },
                {
                  "type": "string",
                  "enum": [
                    "parentID",
                    "childEPCs",
                    "childQuantityList",
                    "action",
                    "bizStep",
                    "disposition",
                    "persistentDisposition",
                    "readPoint",
                    "bizLocation",
                    "bizTransactionList",
                    "sourceList",
                    "destinationList",
                    "sensorElementList"
                  ]
                }
              ]
            }
          },
          {
            "anyOf": [
              {
                "type": "object",
                "properties": {
                  "childEPCs": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                      "$ref": "#/definitions/id"
                    }
                  }
                },
                "required": [
                  "childEPCs"
                ]
              },
              {
                "type": "object",
                "properties": {
                  "childQuantityList": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                      "$ref": "#/definitions/quantityElement"
                    }
                  }
                },
                "required": [
                  "childQuantityList"
                ]
              },
              {
                "type": "object",
                "properties": {
                  "action": {
                    "type": "string",
                    "pattern": "^DELETE$"
                  }
                }
              }
            ]
          }
        ]
      }
    }
  };
  