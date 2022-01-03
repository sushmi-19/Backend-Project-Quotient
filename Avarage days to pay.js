/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
 define(['N/search','N/record'], function(search,record) {

    function afterSubmit(context) {
        try{
            var rec = context.newRecord;
            var cus = rec.getValue('entity');
            var status = rec.getValue('status');
            log.debug(cus,status);
            if(status == 'Paid In Full'){
                createInvSearch(cus)
            }
            else{
                return false;
            }
            
        }catch(e){
            log.error('e',e);
        }
    }

    function createInvSearch(cus){
        try{
            var invoiceSearchObj = search.create({
                type: "invoice",
                filters:
                [   
                    ["type","anyof","CustInvc"], 
                    "AND", 
                    ["mainline","is","T"], 
                    "AND",
                    ["trandate","within","previousoneyear"],
                    "AND",
                    ["amount","notequalto","0.00"], 
                    "AND",
                    ["status","anyof","CustInvc:B"], 
                    "AND",
                    ["daysopen","greaterthan","0"],
                    "AND",
                    ["name","anyof",cus]
                ],
                columns:
                [
                    search.createColumn({
                        name: "entity",
                        summary: "GROUP",
                        sort: search.Sort.ASC,
                        label: "Name"
                    }),
                     
                    search.createColumn({
                      name: "formulacurrency",
                      summary: "SUM",
                      formula: "({closedate}-{datecreated})*{amount}",
                      label: "Formula (Numeric)"
                    }),

                    search.createColumn({
                        name: "amount",
                        summary: "SUM"
                    })
                ]
            });
            var sum = 0, avg = 0,id = '';
            var invoiceSearchObjc = invoiceSearchObj.runPaged().count;
            log.debug("invoice result count",invoiceSearchObjc);
            if(invoiceSearchObjc>0){
                sum = 0, avg = 0,id = '';
                invoiceSearchObj.run().each(function(result){

                    id = result.getValue({
                        name: "entity",
                        summary: "GROUP"
                    });
                    
                    avg = result.getValue({
                        name: "formulacurrency",
                        summary: "SUM",
                        formula: "({closedate}-{datecreated})*{amount}"
                    });

                    sum = result.getValue({
                        name: "amount",
                        summary: "SUM"
                    });
                    var crData = createCRSearch(id);
                    var cmData = createCMSearch(id);
                    log.debug(crData,cmData);

                    var total = sum -(crData.cr_amt+cmData.cm_amt);
                    var adp = avg -(crData.cr_avg+cmData.cm_avg);
                    log.debug(total,adp);
                    var avgDaysTopay = Number((Number(adp)/Number(total)).toFixed(3));
            
                    var custID = record.submitFields({
                        type: 'customer',
                        id: id,
                        values: {
                            'custentity_avg_days_to_pay': avgDaysTopay
                        }
                    });
                    log.debug(custID,avgDaysTopay)
                    return true;
                });
            }
        }catch(e){
            log.error('ERROR: In createInvSearch ',e);
        }
    }

    function createCRSearch(cus){
        try{
            var transactionSearchObj = search.create({
                type: "transaction",
                filters:
                [
                    ["type","anyof","CustRfnd"], 
                    "AND", 
                    ["mainline","is","T"], 
                    "AND", 
                    ["trandate","within","previousoneyear"], 
                    "AND", 
                    ["name","anyof",cus], 
                    "AND", 
                    ["status","noneof","CustRfnd:R","CustRfnd:V"], 
                    "AND", 
                    ["amount","notequalto","0.00"]
              
                ],
                columns:
                [
                   search.createColumn({
                      name: "entity",
                      summary: "GROUP",
                      label: "Name"
                   }),
                   search.createColumn({
                      name: "formulacurrency",
                      summary: "SUM",
                      formula: "({closedate}-{datecreated})*{amount}",
                      label: "Formula (Currency)"
                   }),
                   search.createColumn({
                    name: "amount",
                    summary: "SUM"
                   })
                ]
            });
            var searchResultCount = transactionSearchObj.runPaged().count;
            log.debug("CR result count",searchResultCount);

            var cravg = 0,cramt = 0;

            if(searchResultCount>0){

                transactionSearchObj.run().each(function(res){
    
                    cravg = res.getValue({
                        name: "formulacurrency",
                        summary: "SUM",
                        formula: "({closedate}-{datecreated})*{amount}",
                    });
    
                    cramt = res.getValue({
                        name: "amount",
                        summary: "SUM"
                    });
                    
                    return true;
                });
    
                cramt = Number(cramt);
                cravg = Number(cravg);
    
            }else{
                cramt = 0;
                cravg = 0;
            }
            var crObj = {
                "cr_amt":cramt,
                "cr_avg":cravg
            }
            return crObj;
            
        }catch(e){
            log.error('E: createCRSearch',e);
        }   
    }
    function createCMSearch(cus){
        try{
            var transactionSearchObj = search.create({
                type: "transaction",
                filters:
                [
                    ["type","anyof","CustCred"], 
                    "AND", 
                    ["mainline","is","T"], 
                    "AND", 
                    ["trandate","within","previousoneyear"], 
                    "AND", 
                    ["name","anyof",cus], 
                    "AND", 
                    ["status","noneof","CustCred:A","CustCred:V"], 
                    "AND", 
                    ["amount","notequalto","0.00"],
                    "AND",
                    ["daysopen","greaterthan","0"]
                ],
                columns:
                [
                   search.createColumn({
                      name: "entity",
                      summary: "GROUP",
                      label: "Name"
                   }),
                   search.createColumn({
                      name: "formulacurrency",
                      summary: "SUM",
                      formula: "({closedate}-{datecreated})*{amount}",
                      label: "Formula (Currency)"
                   }),
                   search.createColumn({
                    name: "amount",
                    summary: "SUM"
                   })
                ]
            });
            var searchResultCount = transactionSearchObj.runPaged().count;
            log.debug("CM result count",searchResultCount);

            var cmavg = 0,cmamt = 0;

            if(searchResultCount>0){

                transactionSearchObj.run().each(function(res){
    
                    cmavg = res.getValue({
                        name: "formulacurrency",
                        summary: "SUM",
                        formula: "({closedate}-{datecreated})*{amount}",
                    });
    
                    cmamt = res.getValue({
                        name: "amount",
                        summary: "SUM"
                    });
                    
                    return true;
                });
    
                cmamt = Number(cmamt);
                cmavg = Number(cmavg);
    
            }else{
                cmamt = Number(0);
                cmavg = Number(0);
            }
            var cmObj = {
                'cm_amt':cmamt,
                'cm_avg':cmavg
            }
            return cmObj;

        }catch(e){
            log.error('E:',e);
        }
    }

    return {
        beforeLoad: afterSubmit
    }
});