/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
 define(
    [
        'N/ui/serverWidget', 
        'N/runtime', 
        'N/redirect',
        'N/search',
        'N/record'
    ], function(serverWidget, runtime, redirect,search,record) {

    function onRequest(context) {
        try{
            
            if(context.request.method === 'GET'){
                
                userRole= runtime.getCurrentUser().role;
                user = runtime.getCurrentUser().id;
                log.debug(userRole,user)
                if(userRole == 3 || userRole == 1032){
                    var loadSearch = search.create({
                        type: "customrecord_adj_bill_rec",
                        filters:
                        [
                            ["custrecord_next_approver","anyof",user]
                        ],
                        columns:
                        [
                            search.createColumn({name: "name"}),
                            search.createColumn({name: "id"})
                           // search.createColumn({name: "custrecord_invoice"}),
                            // search.createColumn({name: "custrecord_io"}),
                            // search.createColumn({name: "custrecord_total"}),
                            // search.createColumn({name: "custrecord_adj_amt"}),
                            // search.createColumn({name: "custrecord_request_type"}),
                            // search.createColumn({name: "custrecord_approval_status"}),
                            // search.createColumn({name: "custrecord_next_approver"})
                           // search.createColumn({name: "custrecord19", label: "Approver Role"})
                        ]
                    });
                    var searchObj = loadSearch.run();
                    var	seacrhData = searchObj.getRange({
                        start: 0,
                        end: 1000
                    });
                    var length = seacrhData.length;
                    log.debug(length)
                    if (length > 0){
                        var batRec = serverWidget.createForm({
                            title: 'BILLING ADJUSTMENT TOOL RECORD'
                         });		
        
                         var batlist = batRec.addSublist({
                             id : 'custpage_solist',
                             type : serverWidget.SublistType.LIST,
                             label : 'BILLING ADJUSTMENT TOOL RECORD List'
                         });
         
                         batlist.addField({
                             id: 'custpage_view',
                             type: serverWidget.FieldType.TEXT,
                             label: 'View | Edit'
                         });
         
                         batlist.addField({
                             id: 'custpage_name',
                             type: serverWidget.FieldType.TEXT,
                             label: 'Record Name'
                         });
                    
                        for (var k = 0; k < length; k++){
                            var results = seacrhData[k];
                            var line_3 = results.getValue(loadSearch.columns[0]);
                            var line_1 = results.getValue(loadSearch.columns[1]);

                            var accountID = runtime.accountId;
                            var accountId = accountID.replace("_", "-");
                            var url = "https://"+accountId+".app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=528&id="+line_1;
                            var urlEdit = "https://"+accountId+".app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=528&id="+line_1+"&e=T"
                            var viewRec = "</html><a href="+url+">View</a></html>"
                            var editRec = "</html><a href="+urlEdit+">Edit</a></html>"
                            batlist.setSublistValue({
                                id: 'custpage_name',
                                line: k,
                                value: line_3                            
                            });

                            batlist.setSublistValue({
                                id: 'custpage_view',
                                line: k,
                                value: viewRec//+" | "+editRec
                            });
                        }
                        context.response.writePage(batRec);
                    }else{
                        var batRec = serverWidget.createForm({
                            title: 'BILLING ADJUSTMENT TOOL RECORD'
                        });
                        var a = batRec.addField({
                            id: 'custpage_message',
                            label: 'Message',
                            type: 'text'
                        });
                        a.defaultValue = 'No recent Record to Approve/Reject';
                        a.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.INLINE
                        });
                        context.response.writePage(batRec);
                    }
                    
                }
                if(userRole != 1084 && userRole != 1032){
                    var loadSearch = search.create({
                        type: "customrecord_adj_bill_rec",
                        filters:
                        [
                            ["user.internalid","anyof",user]
                        ],
                        columns:
                        [
                            search.createColumn({name: "name"}),
                            search.createColumn({name: "id"}),
                            // search.createColumn({name: "custrecord_invoice"}),
                            // search.createColumn({name: "custrecord_io"}),
                            // search.createColumn({name: "custrecord_total"}),
                            // search.createColumn({name: "custrecord_adj_amt"}),
                            // search.createColumn({name: "custrecord_request_type"}),
                            // search.createColumn({name: "custrecord_approval_status"}),
                            // search.createColumn({name: "custrecord_next_approver"})
                           // search.createColumn({name: "custrecord19", label: "Approver Role"})
                        ]
                    });
                    var searchObj = loadSearch.run();
                    var	seacrhData = searchObj.getRange({
                        start: 0,
                        end: 1000
                    });
                    var length = seacrhData.length;

                    if (length > 0){

                        var batRec = serverWidget.createForm({
                            title: 'BILLING ADJUSTMENT TOOL RECORD'
                         });
                         var button = batRec.addSubmitButton({
                            label : 'Create BA Record'
                        });

         
                         var batlist = batRec.addSublist({
                             id : 'custpage_solist',
                             type : serverWidget.SublistType.LIST,
                             label : 'BILLING ADJUSTMENT TOOL RECORD List'
                         });
         
                         batlist.addField({
                             id: 'custpage_view',
                             type: serverWidget.FieldType.TEXT,
                             label: 'View | Edit'
                         });
         
                         batlist.addField({
                             id: 'custpage_name',
                             type: serverWidget.FieldType.TEXT,
                             label: 'Record Name'
                         });
                    
                        for (var k = 0; k < length; k++){
                            var results = seacrhData[k];
                            var line_3 = results.getValue(loadSearch.columns[0]);
                            var line_1 = results.getValue(loadSearch.columns[1]);

                            var accountID = runtime.accountId;
                            var accountId = accountID.replace("_", "-");
                            var url = "https://"+accountId+".app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=530&id="+line_1;
                            var urlEdit = "https://"+accountId+".app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=530&id="+line_1+"&e=T"
                            var viewRec = "</html><a href="+url+">View</a></html>"
                            var editRec = "</html><a href="+urlEdit+">Edit</a></html>"
                            batlist.setSublistValue({
                                id: 'custpage_name',
                                line: k,
                                value: line_3                            
                            });

                            batlist.setSublistValue({
                                id: 'custpage_view',
                                line: k,
                                value: viewRec+" | "+editRec
                            });
                        }
                        context.response.writePage(batRec);
                    }
                    else{
                        
                        var batRec = serverWidget.createForm({
                            title: 'BILLING ADJUSTMENT TOOL RECORD'
                        });
                        var a = batRec.addField({
                            id: 'custpage_message',
                            label: 'Message',
                            type: 'text'
                        });
                        
                        a.defaultValue = 'No Recent Record to Approve/Reject';
                        a.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.INLINE
                        });
                        var button = batRec.addSubmitButton({
                            label : 'Create BA Record'
                        });
                        context.response.writePage(batRec);
                    }
                }
            } 
            else if(context.request.method === 'POST'){
                var accountID = runtime.accountId;
                var accountId = accountID.replace("_", "-");
                var a = "https://"+accountId+".app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=530";
                redirect.redirect({
                    url: a
                });
            }
        }catch(e){
            log.debug('Main Exception',e);
            context.response.write(JSON.stringify(e));
        }
    }
   
    return {
        onRequest: onRequest
    }
});