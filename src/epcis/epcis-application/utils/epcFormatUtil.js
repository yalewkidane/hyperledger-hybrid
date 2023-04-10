require('dotenv').config({ path: "./config/.env" })

exports.getDigitalLinkFormat = (epc) => {
    try {
        if (epc.startsWith('urn')) {
            const values = epc.split(':')
            if (values[3] == 'sscc') { return process.env.GS1_DIGITAL_LINK + '00/' + values[4]; }
            if (values[3] == 'gtin') { return process.env.GS1_DIGITAL_LINK + '01/' + values[4]; }
            if (values[3] == 'sgtin') {
                const gtin = values[4].split('.')[0];
                const ser = values[4].replace(gtin + '.', '');
                return process.env.GS1_DIGITAL_LINK + '01/' + gtin + '/21/' + ser;
            }
            if (values[3] == 'grai') { return process.env.GS1_DIGITAL_LINK + '8003/' + values[4]; }
            if (values[3] == 'giai') { return process.env.GS1_DIGITAL_LINK + '8004/' + values[4]; }
            if (values[3] == 'gsrn') { return process.env.GS1_DIGITAL_LINK + '8018/' + values[4]; }
            if (values[3] == 'gsrnp') { return process.env.GS1_DIGITAL_LINK + '8017/' + values[4]; }
            if (values[3] == 'gdti') { return process.env.GS1_DIGITAL_LINK + '253/' + values[4]; }
            if (values[3] == 'cpi') { return process.env.GS1_DIGITAL_LINK + '8010/' + values[4]; }
            if (values[3] == 'gcn') { return process.env.GS1_DIGITAL_LINK + '255/' + values[4]; }
            if (values[3] == 'ginc') { return process.env.GS1_DIGITAL_LINK + '401/' + values[4]; }
            if (values[3] == 'gsin') { return process.env.GS1_DIGITAL_LINK + '402/' + values[4]; }
            if (values[3] == 'itip') {
                const itip = values[4].split('.')[0];
                const ser = values[4].replace(itip + '.', '');
                return process.env.GS1_DIGITAL_LINK + '8006/' + gln + '/21/' + ser;
            }
            //  upui ? if(values[3]=='gtin'){ return process.env.GS1_DIGITAL_LINK + '01/'+ values[4];}
            if (values[3] == 'gln') { return process.env.GS1_DIGITAL_LINK + '414/' + values[4]; }
            if (values[3] == 'sgln') {
                const gln = values[4].split('.')[0];
                const ser = values[4].replace(gln + '.', '');
                return process.env.GS1_DIGITAL_LINK + '414/' + gln + '/254/' + ser;
            }
            if (values[3] == 'pgln') { return process.env.GS1_DIGITAL_LINK + '417/' + values[4]; }
            else { return epc; }
        }
    } catch {
        return epc;
    }

};


//==================================================================================================================================================================================================================
// EPC Scheme supported by                  || Corresponding GS1 Application        ||  GS1 Digital Link URI structure prefixed by:                 || GS1 Digital Link URI example prefixed by
// GS1 Digital Link URI                     || Identifier(s)                        ||  canonical prefix: https://id.gs1.org   or                   || canonical prefix: https://id.gs1.org     or 
//                                          ||                                      ||  non-canonical prefix: https://example.com/some/path/info    || non-canonical prefix: https://example.com/some/path/info
//====================================================================================================================================================================================================================
//      SGTIN                                | (01) + (21)                           | /(01)/{gtin}/(21)/{ser}                                       | /01/09521321123459/21/10X8GGUP08
//      SSCC                                 | (00)                                  | /00/{sscc}                                                    | /00/395213212345678909
//      GRAI                                 | (8003)                                | /8003/{grai}                                                  | /8003/95213218900091234AX01
//      GIAI                                 | (8004)                                | /8004/{giai}                                                  | /8004/9521321481cd14225
//      GSRN                                 | (8018)                                | /8018/{gsrn}                                                  | /8018/952132153123456784
//      GSRNP                                | (8017)                                | /8017/{gsrnp}                                                 | /8017/952132160000000039
//      GDTI                                 | (253)                                 | /253/{gdti}                                                   | /253/95213214000170003555480001000
//      CPI                                  | (8010) + (8011)                       | /8010/{cpi}                                                   | /8011/{cpiserial} /8010/95213215PQ7%2FZ43/8011/12345
//      SGCN                                 | (255)                                 | /255/{gcn}                                                    | /255/952132167890404711
//      GINC                                 | (401)                                 | /401/{ginc}                                                   | /401/9521321xyz47%2F11
//      GSIN                                 | (402)                                 | /402/{gsin}                                                   | /402/95213211234567897
//      ITIP                                 | (8006) + (21)                         | /8006/{itip}/21/{ser}                                         | /8006/095213211234590102/21/mw133
//      UPUI                                 | (01) + (235)                          | /01/{gtin}/235/{tpx}                                          | /01/09521321543219/235/5vs%2A%29%3Ek85Jp3%2Aj
//      SGLN                                 | (414) + (254)                         | /414/{gln}/254/{glnx}                                         | /414/9521321123459/254/5678
//      PGLN                                 | (417)                                 | /417/{pgln}                                                   | /417/9521321543211

// Example   (01) 09521141123455 (21) 4711  ==> canonical https://id.gs1.org/01/09521141123455/21/4711  ==>  non-canonical https://example.com/some/path/info/01/09521141123455/21/4711

// reference https://digital-link.evrythng.com/generator.html

https://www.gs1.org/services/epc-encoderdecoder


exports.getURNFormat = (epc) => {

    try {
        if (epc.startsWith('http')) {
            const values = epc.split('/');
            //SSCC
            if (values[3] == '00') {
                var ser = '';
                var count = 4;
                while (count < values.length - 2) {
                    ser = ser + values[count] + '.';
                    count++;
                }
                return "urn:epc:id:sscc:" + ser + values[values.length - 1];
            }
            //GTIN
            if (values[3] == '01') {
                console.log("here 01");
                if (values[5] == '22') {
                    var ser = '';
                    var count = 7;
                    while (count < values.length - 1) {
                        ser
                    }
                }
                if (values[6] == '21' || values[6] == '21' || values[6] == '21') {
                    while (i < dessertList.length - 1) {

                    }
                }
                else {
                    var count = 7;
                    var ser = '';
                    while (count < values.length - 1) {
                        ser
                    }
                }
            }
            //GDTI 253
            if (values[3] == '253') {
                var ser = '';
                var count = 4;
                while (count < values.length - 2) {
                    ser = ser + values[count] + '.';
                    count++;
                }
                return "urn:epc:id:gdti:" + ser + values[values.length - 1];
            }
            //GCN 255
            if (values[3] == '255') {
                var ser = '';
                var count = 4;
                while (count < values.length - 2) {
                    ser = ser + values[count] + '.';
                    count++;
                }
                return "urn:epc:id:gcn:" + ser + values[values.length - 1];
            }
            //GINC
            if (values[3] == '401') {
                var ser = '';
                var count = 4;
                while (count < values.length - 2) {
                    ser = ser + values[count] + '.';
                    count++;
                }
                return "urn:epc:id:ginc:" + ser + values[values.length - 1];
            }
            //GSIN
            if (values[3] == '402') {
                var ser = '';
                var count = 4;
                while (count < values.length - 2) {
                    ser = ser + values[count] + '.';
                    count++;
                }
                return "urn:epc:id:gsin:" + ser + values[values.length - 1];
            }
            //GLN
            if (values[3] == '414') {
                if (typeof values[5] !== 'undefined') {
                    if (values[5] == '254') {
                        var ser = '.';
                        var count = 6;
                        while (count < values.length - 2) {
                            ser = ser + values[count] + '.';
                            count++;
                        }
                        return "urn:epc:id:sgln:" + values[4] + ser + values[values.length - 1];
                    } else {
                        var ser = '';
                        var count = 4;
                        while (count < values.length - 2) {
                            ser = ser + values[count] + '.';
                            count++;
                        }
                        return "urn:epc:id:gln:" + ser + values[values.length - 1];
                    }
                } else {
                    return "urn:epc:id:gln:" + values[4];
                }
            }
            //Party GLN
            if (values[3] == '417') {
                if (typeof values[5] !== 'undefined') {
                    if (values[5] == '214') {
                        var ser = '.';
                        var count = 6;
                        while (count < values.length - 2) {
                            ser = ser + values[count] + '.';
                            count++;
                        }
                        return "urn:epc:id:sgln:" + values[4] + ser + values[values.length - 1];
                    } else {
                        var ser = '';
                        var count = 4;
                        while (count < values.length - 2) {
                            ser = ser + values[count] + '.';
                            count++;
                        }
                        return "urn:epc:id:gln:" + ser + values[values.length - 1];
                    }
                } else {
                    return "urn:epc:id:gln:" + values[4];
                }
            }
            //GRI
            if (values[3] == '8003') {
                var ser = '';
                var count = 4;
                while (count < values.length - 2) {
                    ser = ser + values[count] + '.';
                    count++;
                }
                return "urn:epc:id:grai:" + ser + values[values.length - 1];
            }
            //GIAI
            if (values[3] == '8004') {
                var ser = '';
                var count = 4;
                while (count < values.length - 2) {
                    ser = ser + values[count] + '.';
                    count++;
                }
                return "urn:epc:id:giai:" + ser + values[values.length - 1];
            }
            //ITIP  Similar to GTIN
            if (values[3] == '8006') {
                var ser = '';
                var count = 4;
                while (count < values.length - 2) {
                    ser = ser + values[count] + '.';
                    count++;
                }
                return "urn:epc:id:itip:" + ser + values[values.length - 1];
            }
            //CPID
            if (values[3] == '8010') {
                var ser = '';
                var count = 4;
                while (count < values.length - 2) {
                    ser = ser + values[count] + '.';
                    count++;
                }
                return "urn:epc:id:cpi:" + ser + values[values.length - 1];
            }
            //GMN
            if (values[3] == '8013') {
                var ser = '';
                var count = 4;
                while (count < values.length - 2) {
                    ser = ser + values[count] + '.';
                    count++;
                }
                return "urn:epc:id:gmn:" + ser + values[values.length - 1];
            }
            //GSRN
            if (values[3] == '8017') {
                var ser = '';
                var count = 4;
                while (count < values.length - 2) {
                    ser = ser + values[count] + '.';
                    count++;
                }
                return "urn:epc:id:gsrn:" + ser + values[values.length - 1];
            }
            //GSRN
            if (values[3] == '8018') {
                var ser = '';
                var count = 4;
                while (count < values.length - 2) {
                    ser = ser + values[count] + '.';
                    count++;
                }
                return "urn:epc:id:gsrn:" + ser + values[values.length - 1];
            }
            else { return epc; }
        }
        else {
            return epc;
        }

    } catch {
        return epc;
    }


};

