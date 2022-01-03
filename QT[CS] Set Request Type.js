/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
 define(['N/runtime','N/record'], function(runtime,record) {
    function pageInit(context) {
            try{
                var currentRecord = context.currentRecord;
                var name = currentRecord.getField({
                    fieldId: 'name'
                });
                name.isDisabled=true;
                name.isDisplay=false;

                var status = currentRecord.getValue({
                    fieldId: 'custrecord_approval_status'
                });

                var reqType = currentRecord.getField({
                    fieldId: 'custrecord_request_type'
                });
                reqType.isDisplay=false;
                if(context.mode == 'create'|| context.mode == 'copy'){
                    var currentRecord = context.currentRecord;
                    currentRecord.setValue({
                        fieldId: 'custrecord_approval_status',
                        value: 1
                    });
                    //currentRecord.setValue({
                       // fieldId: 'custrecord_invoice',
                       // value: 'Invoice #'
                   // });
                }
                if((status == 1 || status == 2) && context.mode == 'edit'){
                    var reqType = currentRecord.getField({
                        fieldId: 'custrecord_request_type'
                    });
                    reqType.isDisabled=true;
                    var invoice = currentRecord.getField({
                        fieldId: 'custrecord_invoice'
                    });
                    invoice.isDisabled=true;
                    var amount = currentRecord.getField({
                        fieldId: 'custrecord_adj_amt'
                    });
                    amount.isDisabled=true;
                    var name = currentRecord.getField({
                        fieldId: 'name'
                    });
                    name.isDisabled=true;
                }

            }catch(e){
                alert(e)
            }
        }
        function saveRecord(context) {
            try{
                var suiteletObj = context.currentRecord;
                var user = runtime.getCurrentUser().id ;
                var reqTypeField = suiteletObj.getValue({
                    fieldId: 'custpage_request_type'
                });
                if(reqTypeField == '' || reqTypeField == 'A'){
                    alert('Please Select Request Type'); 
                    return false;
                }
                var reqType = suiteletObj.getValue({
                    fieldId: 'custrecord_request_type'
                });
                if(user == 4543800){
                    if(reqType != 1 && reqType != 2){
                        alert('Only you have permission to create Credit Memo & Credit and Rebill Request Type'); 
                        return false;
                    }
                }
                if(user == 3940829){
                    if(reqType != 3 || reqType != 4){
                        alert('Only you have permission to create Debit Memo & Write off Request Type');
                    }
                }
                if(user == 3940829){
                    if(reqType != 5 ){
                        alert('Only you have permission to create Offset & refund Request Type');
                    }
                }
                var suiteletObj = context.currentRecord;
                var isChecked = false;
                var qty = parseFloat(0),amount;
                var lineCount = suiteletObj.getLineCount('recmachcustrecord_parent_record');
                if (lineCount > 0) {
                    for (var line = 0; line < lineCount; line++) {
                        isChecked = suiteletObj.getSublistValue("recmachcustrecord_parent_record", "custrecord_sel_itm", line);
                        qty = suiteletObj.getSublistValue("recmachcustrecord_parent_record", "custrecord_refund_qty", line);
                        amount = suiteletObj.getSublistValue("recmachcustrecord_parent_record", "custrecord_refund_amt", line);
                        var itemName = suiteletObj.getSublistText("recmachcustrecord_parent_record", "custrecord_item", line);
                        if(isChecked == true && (qty == parseFloat(0) || amount == '')){
                            alert('Enter Quantity & Amount for: '+itemName);
                            return false;
                        }
    
                        if (isChecked == true && qty != parseFloat(0)) {
                            break;
                        }
                    }
                    for (var l = 0; l < lineCount; l++){
                        var isChecked1 = suiteletObj.getSublistValue("recmachcustrecord_parent_record", "custrecord_sel_itm", l);
                        var qty1 = suiteletObj.getSublistValue("recmachcustrecord_parent_record", "custrecord_refund_qty", l);
                        var amount1 = suiteletObj.getSublistValue("recmachcustrecord_parent_record", "custrecord_refund_amt", l);
                        var itemName = suiteletObj.getSublistText("recmachcustrecord_parent_record", "custrecord_item", l);
                        if(isChecked1 == true && (qty1 == parseFloat(0) || amount1 == '')){
                            alert('Enter Quantity for: '+itemName);
                            return false;
                        }
                    }
                    if (isChecked == false) {
                        alert("Please Select an Item.");
                        return false;
                    }
                }
                return true;
            }catch(e){
                alert(e)
            }
        }
        function fieldChanged(context) {
            try{
                var currentRecord = context.currentRecord;
                var recFieldName = context.fieldId;
                if(recFieldName === 'custpage_request_type'){
                        if(currentRecord.getValue('custpage_request_type') != 'A'){
                            currentRecord.setValue({
                                fieldId:'custrecord_request_type',
                                value: currentRecord.getValue('custpage_request_type')
                            });
                        }
                        else{
                            currentRecord.setValue({
                                fieldId:'custrecord_request_type',
                                value: ''
                            });
                        }
                }
                if(recFieldName === 'custrecord_invoice'){
                    var invoiceId = currentRecord.getValue({
                        fieldId: 'custrecord_invoice'
                    });
                    var lineCount = currentRecord.getLineCount({
                        sublistId: 'recmachcustrecord_parent_record'
                    });
                    if(lineCount>0){
                        for(var z=lineCount-1; z>=0; z--){
                            currentRecord.removeLine({
                                sublistId: 'recmachcustrecord_parent_record',
                                line: z,
                                ignoreRecalc: true
                            });
                        }
                    }
                    if(invoiceId){
                        var invRec = record.load({
                            type: 'invoice',
                            id: invoiceId,
                            isDynamic: true
                        });
                        var line = invRec.getLineCount({
                            sublistId: 'item'
                        });
                        alert('inv line'+line)
                        for(var i=0; i<line; i++){
                            var itemId = invRec.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'item',
                                line: i
                            });
                            //alert(itemId)
                            var qty = invRec.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'quantity',
                                line: i
                            });
                          //  alert(qty)
                            var rate = invRec.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'rate',
                                line: i
                            });
                           // alert(rate)
                            var amount = invRec.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'amount',
                                line: i
                            });
                           // alert(amount)
                            var lineUniqueKey = invRec.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'lineuniquekey',
                                line: i
                            });
                           // alert(lineUniqueKey)
                            currentRecord.selectLine({
                                sublistId: 'recmachcustrecord_parent_record',
                                line: i
                            });
                            currentRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_parent_record',
                                fieldId: 'custrecord_item',
                                value: itemId
                            });
                            currentRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_parent_record',
                                fieldId: 'custrecord_qty',
                                value: qty
                            });
                            currentRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_parent_record',
                                fieldId: 'custrecord_rate',
                                value: rate
                            });
                            currentRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_parent_record',
                                fieldId: 'custrecord_amount',
                                value: amount
                            });
                            currentRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_parent_record',
                                fieldId: 'custrecord_line_unic_key',
                                value: lineUniqueKey
                            });
                            currentRecord.commitLine({
                                sublistId: 'recmachcustrecord_parent_record',
                                ignoreRecalc: true
                            });
                        }
                    }
                }
                if(recFieldName === 'custrecord_invoice'){
                    currentRecord.setValue({
                        fieldId:'name',
                        value: currentRecord.getText('custrecord_invoice')
                    });
                }
            }catch(e){
                alert(e);
            }
        }
        return{
            pageInit:pageInit,
            saveRecord: saveRecord,
            fieldChanged: fieldChanged
        }
    });