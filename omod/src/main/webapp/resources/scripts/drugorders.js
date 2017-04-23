/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global diagnosis, jq, emr, Event */

var removeFromGroupDialog = null;
var saveDraftOrderDialog = null;

$(document).ready( function() {
    
    highlight();
    
    $("#planSaveButton").prop("disabled", true);
    $("#addOrderButton").prop("disabled", true);
    $("#planDefineButton").prop("disabled", true);
    
    $('#definePlanName').autocomplete({
        select: function () { 
            $("#planDefineButton").prop("disabled", false); 
        }
    });
    
    $('#definePlanName').change(function (){ 
        if($('#definePlanName').val() !== ""){
            $("#planDefineButton").prop("disabled", false); 
        } else {
            $("#planDefineButton").prop("disabled", true); 
        }
    });
    
    if($('#groupAction').val() === "DISCARD ORDER GROUP" || $('#groupAction').val() === "DISCARD MED PLAN" || $('#groupAction').val() === "DISCONTINUE ORDER"){
        $("#orderActionButton").prop("disabled", true);
        jq("#discontinueReasonSelect").show();
        document.getElementById("discontinueReasonSelect").style.display = 'block';
    }
    
    $("#discontinueReasonCoded, #discontinueReasonNonCoded").change(function(){
        enableOrderDiscard();
    });
    
    $("#adminPlan, #adminDrug, #adminRoute, #adminDose, #adminDoseUnits, #adminQuantity, #adminQuantityUnits, #adminDuration, #adminDurationUnits, #adminFrequency").change(function(){
        adminRecord();
        if($("#adminPlan").val() !== "" || $("#adminDrug").val() !== ""){
            checkAdminFields();
        }
    });
    
    $("#drugNameEntered, #route, #dose, #doseUnits, #quantity, #quantityUnits, #duration, #durationUnits, #frequency, #diagnosis").change(function(){
        validate();
        if($("#drugNameEntered").val() !== ""){
            checkFormFields();
        }
    });
    
    $('.planDrugName .groupCheckBox').on('change', function() {
        var selected = false;
        $('.planDrugName .groupCheckBox').each(function() {
            if(this.checked) {
                selected = true;               
            }
        });
        if(selected){
            $('#selectPlanButton').removeAttr('disabled');
        } else {
            $("#selectPlanButton").prop("disabled", true);
        }        
    });
    
    $('.allergicPlanItemOrderReason').each(function(){
        this.style.borderColor = "orangered";
    });
    
    $('.allergicPlanItemOrderReason').each(function(){
        $(this).on('change', function(){
            if($(this).val() === "")
                this.style.borderColor = "orangered";
            else
                this.style.borderColor = "";
        });
    });
      
    saveDraftOrderDialog = emr.setupConfirmationDialog({
        selector: '#saveDraftPlan',
        actions: {
            cancel: function() {
            	saveDraftOrderDialog.close();
            }
        }
    });
    
    $(document).mouseup(function (e){
        if(document.getElementById("draftPlanList")){
            if (!$("#draftPlanRow").is(e.target) && $("#draftPlanRow").has(e.target).length === 0 && !$("#createOrderWindow").is(e.target) && $("#createOrderWindow").has(e.target).length === 0 && !$("#showGroupOrderWindow").is(e.target) && $("#showGroupOrderWindow").has(e.target).length === 0 && e.target.nodeName !== "TD"){
                saveDraftOrderDialog.show();
            }
        }
    });
    
    removeFromGroupDialog = emr.setupConfirmationDialog({
        selector: '#removeFromGroupWindow',
        actions: {
            cancel: function() {
            	removeFromGroupDialog.close();
            },
            confirm: function() {
            	$("#removeFromGroupForm").submit();
            }
        }
    });       
});

function highlight(){
    
    var selectedPlan = $("#discardPlan").text();
    if(selectedPlan !== ""){
        var $rowsNo = $('#medPlansTable tbody tr .planDetails').filter(function () {
            if($.trim($(this).find('.fields').find('.planName').text()) === selectedPlan.toUpperCase()){
                $(this).find('.fields').find('.icon-plus-sign').hide();
                $(this).find('.fields').find('.icon-minus-sign').show();
                $(this).find('.plansDetailsView').show();
                
                var selectedDrug = $(".discardDrug");
                if(selectedDrug.size() === 1){
                    $(this).find('.plansDetailsView').find('.planBlock').find('.planBlockDetails').find('.planItem').each(function(){
                        if($(this).text() === selectedDrug.text().toUpperCase()){
                            $(this).parent().parent().css({"background": "#75b2f0","color": "white"});
                        }
                    });
                } else {
                    $(this).find('.plansDetailsView').find('.planBlock').each(function(){
                        $(this).find('.planBlockDetails').css({"background": "#75b2f0","color": "white"});
                    });
                }
            }
        });
    }
    
    var planActioned = $("#recordedMedPlan").val();
    
    if(planActioned !== null || planActioned !== undefined){
        var $rowsNo = $('#medPlansTable tbody tr .planDetails').filter(function () {
            if($.trim($(this).find('.fields').find('.planName').text()) === planActioned.toUpperCase()){
                $(this).find('.fields').find('.icon-plus-sign').hide();
                $(this).find('.fields').find('.icon-minus-sign').show();
                $(this).find('.plansDetailsView').show();
            }
        });
    }
    
    var selectedAction = $("#groupOrderAction").text();
    if(selectedAction !== ""){
        var selectedOrder = $("#groupOrderID").val();
        
        if(selectedAction === "DISCONTINUE ORDER"){
            
            if($("#discardType").val() === "Active-Plan" || $("#discardType").val() === "Draft-Plan"){
                jq("#activeOrderWindow").hide();
            }
            
            var $rowsNo1 = $('#activeOrdersTable tbody .orderRow').filter(function () {
                if($.trim($(this).children('td').slice(1, 2).text()) === selectedOrder){
                    $(this).children('td').slice(1, 4).css({"background": "#75b2f0","color": "white"});
                }
            });
            
            var $rowsNo2 = $('#activeOrdersTable tbody .groupRow').filter(function () {
                $(this).children('td').slice(1, 2).find('.groupDrug').each(function(){
                    if($.trim($(this).find('.groupDrugDetails').find('#groupDrugID').text()) === selectedOrder){
                        $(this).find('.groupDrugDetails').css({"background": "#75b2f0","color": "white"});
                    }
                });
            });
            
            var $rowsNo3 = $('#activePlansTable tbody tr').filter(function () {
                $(this).children('td').slice(0, 1).find('.plansDetailsView').find('.planDrug').each(function(){
                    if($.trim($(this).find('.planDrugDetails').find('#planDrugId').text()) === selectedOrder){
                        $(this).parent().show();
                        $(this).parent().parent().find('.fields').find('.icon-plus-sign').hide();
                        $(this).parent().parent().find('.fields').find('.icon-minus-sign').show();
                        $(this).find('.planDrugDetails').css({"background": "#75b2f0","color": "white"});
                    }
                });
            });
        }
        
        else if(selectedAction === "DISCARD ORDER GROUP"){
            var $rowsNo = $('#activeOrdersTable tbody .groupRow').filter(function () {
                if($.trim($(this).children('td').slice(0, 1).find('#id').text()) === selectedOrder){
                    $(this).children('td').slice(1, 2).find('.groupDrug').each(function(){
                        $(this).find('.groupDrugDetails').css({"background": "#75b2f0","color": "white"});
                    });
                }
            });
        }
        
        else if(selectedAction === "DISCARD MED PLAN"){
            jq("#activeOrderWindow").hide();
            var $rowsNo = $('#activePlansTable tbody tr').filter(function () {
                if($.trim($(this).children('td').slice(0, 1).find('#id').text()) === selectedOrder){
                    $(this).children('td').slice(0, 1).find('.fields').find('.icon-plus-sign').hide();
                    $(this).children('td').slice(0, 1).find('.fields').find('.icon-minus-sign').show();
                    $(this).children('td').slice(0, 1).find('.plansDetailsView').find('.planDrug').each(function(){
                        $(this).find('.planDrugDetails').css({"background": "#75b2f0","color": "white"});
                    });  
                    $(this).find('.plansDetailsView').show();
                }
            });
        }
        
        else if(selectedAction === "RENEW MED PLAN"){
            jq("#activeOrderWindow").hide();
        }
    }    
}

function clearHighlights(){
    jq(".orderRow").each(function(){
        jq(this).children('td').slice(1, 4).css({'background-color':'','color':''});
    });
    jq(".groupDrugDetails").each(function(){
        jq(this).css({'background-color':'','color':''});
    });
    jq(".oldOrderRow").each(function(){
        jq(this).children('td').slice(0, 1).css({'background-color':'','color':''});
    });
    jq(".oldGroupDetails").each(function(){
        jq(this).css({'background-color':'','color':''});
    });
    jq(".planDrug").each(function(){
        jq(this).children('div').slice(0, 1).css({'background-color':'','color':''});
    });
    jq('.planBlock').each(function(){
        $(this).find('.planBlockDetails').css({'background-color':'','color':''});
    });
}

function validate(){
    if($("#drugNameEntered").val() !== "" && $("#route").val() !== "" && $("#dose").val() !== "" && $("#doseUnits").val() !== "" && $("#quantity").val() !== "" && $("#quantityUnits").val() !== "" && $("#duration").val() !== "" && $("#durationUnits").val() !== "" && $("#frequency").val() !== "" && $("#diagnosis").val() !== ""){
        $("#addOrderButton").prop("disabled", false);
    } else {
        $("#addOrderButton").prop("disabled", true);
    }
}

function adminRecord(){
    if($("#adminPlan").val() !== "" && $("#adminDrug").val() !== "" && $("#adminRoute").val() !== "" && $("#adminDose").val() !== "" && $("#adminDoseUnits").val() !== "" && $("#adminQuantity").val() !== "" && $("#adminQuantityUnits").val() !== "" && $("#adminDuration").val() !== "" && $("#adminDurationUnits").val() !== "" && $("#adminFrequency").val() !== ""){
        $("#planSaveButton").prop("disabled", false);
    } else {
        $("#planSaveButton").prop("disabled", true);
    }
}

function showMedicationPlanOrderWindow(){
    var dialogOpen = false;
    var objects = $('.dialog');
    $(objects).each(function(){
        if ($(this).is(':visible')){
            dialogOpen = true;
        }
    });
    if(!dialogOpen){
        jq("#medPlanWindow").show(); 
        document.getElementById("medPlanWindow").style.display = 'block';
        jq("#activeOrderWindow").hide();
    }
}

function hideMedicationPlanOrderWindow(){
    jq("#medPlanWindow").hide();
    jq("#activeOrderWindow").show();
}

function hideMedicationPlansWindow(){
    jq("#activeOrderWindow").show();
    jq("#medPlanDetailsWindow").hide();
}

function showIndividualOrderDetailsWindow(orderType){
    var dialogOpen = false;
    var objects = $('.dialog');
    $(objects).each(function(){
        if ($(this).is(':visible')){
            dialogOpen = true;
        }
    });
    if(!dialogOpen){
        $("#orderType").text(orderType);
        $("#orderAction").val(orderType);
        jq("#confirmOrderWindow").hide();
        jq("#createOrderWindow").show();
        document.getElementById("createOrderWindow").style.display = 'block';
    }
}

function hideIndividualOrderDetailsWindow(){
    jq("#createOrderWindow").hide();
    jq("#activeOrderWindow").show();
    jq("#allergicDrugOrderReasonField").hide();
    $("#orderType").text("");
    $("#orderAction").val("");
    $("#drugNameEntered").val("");
    $("#orderReason").val("");
    $("#route").val("");
    $("#dose").val("");
    $("#doseUnits").val("");
    $("#quantity").val("");
    $("#quantityUnits").val("");
    $("#duration").val("");
    $("#durationUnits").val("");
    $("#frequency").val("");
    $("#refill").val("0");
    $("#interval").val("0");
    $("#diagnosis").val("");
    $("#patientInstrn").val("");
    $("#pharmacistInstrn").val("");
    $("#addOrderButton").prop("disabled", true);
    
    $('#createOrderForm input, #createOrderForm select').each(function(){
        this.style.borderColor = "";
    });

    clearHighlights();
}

function checkFormFields(){
    if($("#orderReason").val() === "")
        document.getElementById("orderReason").style.borderColor = "orangered";
    else
        document.getElementById("orderReason").style.borderColor = "";
    
    if($("#route").val() === "")
        document.getElementById("route").style.borderColor = "orangered";
    else
        document.getElementById("route").style.borderColor = "";
    
    if($("#dose").val() === "")
        document.getElementById("dose").style.borderColor = "orangered";
    else
        document.getElementById("dose").style.borderColor = "";
    
    if($("#doseUnits").val() === "")
        document.getElementById("doseUnits").style.borderColor = "orangered";
    else
        document.getElementById("doseUnits").style.borderColor = "";
    
    if($("#quantity").val() === "")
        document.getElementById("quantity").style.borderColor = "orangered";
    else
        document.getElementById("quantity").style.borderColor = "";
    
    if($("#quantityUnits").val() === "")
        document.getElementById("quantityUnits").style.borderColor = "orangered";
    else
        document.getElementById("quantityUnits").style.borderColor = "";
    
    if($("#duration").val() === "")
        document.getElementById("duration").style.borderColor = "orangered";
    else
        document.getElementById("duration").style.borderColor = "";
    
    if($("#durationUnits").val() === "")
        document.getElementById("durationUnits").style.borderColor = "orangered";
    else
        document.getElementById("durationUnits").style.borderColor = "";
    
    if($("#frequency").val() === "")
        document.getElementById("frequency").style.borderColor = "orangered";
    else
        document.getElementById("frequency").style.borderColor = "";
    
    if($("#diagnosis").val() === "")
        document.getElementById("diagnosis").style.borderColor = "orangered";
    else
        document.getElementById("diagnosis").style.borderColor = "";
    
}

function checkAdminFields(){
    if($("#adminDrug").val() === "")
        document.getElementById("adminDrug").style.borderColor = "orangered";
    else
        document.getElementById("adminDrug").style.borderColor = "";
    
    if($("#adminPlan").val() === "")
        document.getElementById("adminPlan").style.borderColor = "orangered";
    else
        document.getElementById("adminPlan").style.borderColor = "";
    
    if($("#adminRoute").val() === "")
        document.getElementById("adminRoute").style.borderColor = "orangered";
    else
        document.getElementById("adminRoute").style.borderColor = "";
    
    if($("#adminDose").val() === "")
        document.getElementById("adminDose").style.borderColor = "orangered";
    else
        document.getElementById("adminDose").style.borderColor = "";
    
    if($("#adminDoseUnits").val() === "")
        document.getElementById("adminDoseUnits").style.borderColor = "orangered";
    else
        document.getElementById("adminDoseUnits").style.borderColor = "";
    
    if($("#adminQuantity").val() === "")
        document.getElementById("adminQuantity").style.borderColor = "orangered";
    else
        document.getElementById("adminQuantity").style.borderColor = "";
    
    if($("#adminQuantityUnits").val() === "")
        document.getElementById("adminQuantityUnits").style.borderColor = "orangered";
    else
        document.getElementById("adminQuantityUnits").style.borderColor = "";
    
    if($("#adminDuration").val() === "")
        document.getElementById("adminDuration").style.borderColor = "orangered";
    else
        document.getElementById("adminDuration").style.borderColor = "";
    
    if($("#adminDurationUnits").val() === "")
        document.getElementById("adminDurationUnits").style.borderColor = "orangered";
    else
        document.getElementById("adminDurationUnits").style.borderColor = "";
    
    if($("#adminFrequency").val() === "")
        document.getElementById("adminFrequency").style.borderColor = "orangered";
    else
        document.getElementById("adminFrequency").style.borderColor = "";
}

function showDrugOrderViewWindow(action, startdate, drugname, dose, doseUnits, route, duration, durationUnits, quantity, quantityUnits, frequency, numRefills, orderReason, priority, patientInstrn, pharmacistInstrn, pharmaComments, orderStatus){
    var dialogOpen = false;
    var objects = $('.dialog');
    $(objects).each(function(){
        if ($(this).is(':visible')){
            dialogOpen = true;
        }
    });
    if(!dialogOpen){
        if(orderStatus === "Active-Plan" || orderStatus === "Draft-Plan" || orderStatus === "Non-Active-Plan"){
            jq("#activeOrderWindow").hide();
        }
        
        $("#activeOrderAction").text(action);
        $("#start_date").text(startdate);
        $("#order_priority").text(priority);
        $("#order_refills").text(numRefills);
        $("#order_details").text(drugname +", "+dose+" "+doseUnits+", "+route+", "+duration+" "+durationUnits+", "+quantity+" "+quantityUnits+", "+frequency);

        if(orderReason !== "" && orderReason !== "null"){
            $("#order_reason").text(orderReason);
            jq("#allergicOrderReasonView").show();
            document.getElementById("allergicOrderReasonView").style.display = 'block';
        }

        $("#patient_instructions").text(patientInstrn);
        $("#pharmacist_instructions").text(pharmacistInstrn);

        if(pharmaComments !== "" && pharmaComments !== null && pharmaComments !== "null" && pharmaComments !== undefined){
            $("#pharma_comments").text(pharmaComments);
            jq("#pharmacistCommentsView").show();
            document.getElementById("pharmacistCommentsView").style.display = 'block';
        }

        jq("#showOrderWindow").show();
        document.getElementById("showOrderWindow").style.display = 'block';
    }
}

function hideDrugOrderViewWindow(){
    jq("#activeOrderWindow").show();
    jq("#showOrderWindow").hide();
    clearHighlights();
}

function showEditSingleOrderWindow(orderType, orderId, name, startDate, dose, doseUnits, route, duration, durationUnits, quantity, quantityUnits, frequency, numRefills, interval, diagnosis, orderReason, priority, patientInstrn, pharmacistInstrn, orderStatus){
    var dialogOpen = false;
    var objects = $('.dialog');
    $(objects).each(function(){
        if ($(this).is(':visible')){
            dialogOpen = true;
        }
    });
    if(!dialogOpen){
        if(orderStatus === "Active-Plan" || orderStatus === "Draft-Plan"){
            jq("#activeOrderWindow").hide();
        }
        
        $("#orderType").text(orderType);
        $("#orderAction").val(orderType);
        $("#order_id").val(orderId);
        $("#drugNameEntered").val(name);
        $("#route").val(route);
        $("#dose").val(dose);
        $("#doseUnits").val(doseUnits);
        $("#quantity").val(quantity);
        $("#quantityUnits").val(quantityUnits);
        $("#duration").val(duration);
        $("#durationUnits").val(durationUnits);
        $("#frequency").val(frequency);
        $("#refill").val(numRefills);
        $("#interval").val(interval);
        $("#priority").val(priority);
        $("#diagnosis").val(diagnosis);
        if(orderReason !== "" && orderReason !== "null"){
            $("#orderReason").val(orderReason);
            jq("#allergicDrugOrderReasonField").show();
            document.getElementById("allergicDrugOrderReasonField").style.display = 'block';
        }
        $("#patientInstrn").val(patientInstrn);
        $("#pharmacistInstrn").val(pharmacistInstrn);
        $("#addOrderButton").prop("disabled", false);
        jq("#createOrderWindow").show();
        document.getElementById("createOrderWindow").style.display = 'block';
    }
}

function showRenewOrderWindow(orderType, orderId, name, dose, doseUnits, route, duration, durationUnits, quantity, quantityUnits, frequency, refills, interval, diagnosis, priority, patientInstrn, pharmacistInstrn){
    var dialogOpen = false;
    var objects = $('.dialog');
    $(objects).each(function(){
        if ($(this).is(':visible')){
            dialogOpen = true;
        }
    });
    if(!dialogOpen){
        $("#orderType").text(orderType);
        $("#orderAction").val(orderType);
        $("#order_id").val(orderId);
        $("#drugNameEntered").val(name);
        $("#route").val(route);
        $("#dose").val(dose);
        $("#doseUnits").val(doseUnits);
        $("#quantity").val(quantity);
        $("#quantityUnits").val(quantityUnits);
        $("#duration").val(duration);
        $("#durationUnits").val(durationUnits);
        $("#frequency").val(frequency);
        $("#priority").val(priority);
        $("#refill").val(refills);
        $("#interval").val(interval);
        $("#diagnosis").val(diagnosis);
        $("#patientInstrn").val(patientInstrn);
        $("#pharmacistInstrn").val(pharmacistInstrn);
        $("#addOrderButton").prop("disabled", false);
        jq("#createOrderWindow").show();
        document.getElementById("createOrderWindow").style.display = 'block';
    }
}

function discardSingleOrder(order){
    $("#selectedActiveOrder").val(order);
    $("#activeGroupForm").submit();
}

function discardSingleItem(order){
    $("#selectedActiveItem").val(order);
    $("#activePlanForm").submit();
}

function discardMedPlanOrder(plan){
    $("#selectedActivePlan").val(plan);
    $("#activePlanForm").submit();
}

function createStandardPlan(){
    $("#createPlanForm").submit();
}

function discardMedPlan(){
    $("#discardPlanForm").submit();
}

function renewMedPlanWindow(plan){
    $("#selectedNonActivePlan").val(plan);
    $("#nonActivePlanForm").submit();
}

function saveMedPlanOrder(planId){
    $("#activatePlan").val(planId);
    $("#activePlanForm").submit();
}

function autoCompletePlan(){
    $("#planName").autocomplete({
        select : function(event, ui){
            $("#planName").val((ui.item.label).trim());
            $("#planForm").submit();
        }
    });
}

function autoCompleteDrug(allergies){
    var allergyList = allergies.split(",");
    
    $("#drugNameEntered").change(function(){
        var isAllergic = false;
        $.each(allergyList,function(index,value){
            var drugname = value.replace("[","").replace("]","").trim();
            var selectedDrug = $("#drugNameEntered").val().trim();
            if(selectedDrug === drugname){
                isAllergic = true;
            } 
        });
        if(isAllergic){
            jq("#allergicDrugOrderReasonField").show();
            document.getElementById("allergicDrugOrderReasonField").style.display = 'block';
        } else {
            jq("#allergicDrugOrderReasonField").hide();
        }
        validate();
    });
}

function displayPlanCreationWindow(){
    var dialogOpen = false;
    var objects = $('.dialog');
    $(objects).each(function(){
        if ($(this).is(':visible')){
            dialogOpen = true;
        }
    });
    if(!dialogOpen){
        $("#defineAction").val("definePlan");
        jq("#definePlanWindow").show();
        document.getElementById("definePlanWindow").style.display = 'block';
    }
}

function hideMedPlanDefineWindow(){
    jq("#definePlanWindow").hide();
    $("#definePlanName").val("");
    $("#definePlanDesc").val("");
    $("#defineAction").val("");
    $("#definePlanId").val("");
}

function addPlanItemWindow(planName){
    var dialogOpen = false;
    var objects = $('.dialog');
    $(objects).each(function(){
        if ($(this).is(':visible')){
            dialogOpen = true;
        }
    });
    if(!dialogOpen){
        jq("#createPlanWindow").show();
        document.getElementById("createPlanWindow").style.display = 'block';
        $("#adminActionType").text("ADD DRUG TO PLAN");
        $("#adminPlan").val(planName);
        checkAdminFields();
    }
}

function hideMedPlanCreateWindow(){
    jq("#createPlanWindow").hide();
    $("#planId").val("");
    $("#adminPlan").val("");
    $("#adminDrug").val("");
    $("#adminRoute").val("");
    $("#adminDose").val("");
    $("#adminDoseUnits").val("");
    $("#adminQuantity").val("");
    $("#adminQuantityUnits").val("");
    $("#adminDuration").val("");
    $("#adminDurationUnits").val("");
    $("#adminFrequency").val("");
    $("#planSaveButton").prop("disabled", true);
        
    $('#createPlanForm input, #createPlanForm select').each(function(){
        this.style.borderColor = "";
    });
    
    clearHighlights();
}

function editPlanItemDetails(planId, planName, drugName, dose, doseUnits, route, quantity, quantityUnits, duration, durationUnits, frequency){
    var dialogOpen = false;
    var objects = $('.dialog');
    $(objects).each(function(){
        if ($(this).is(':visible')){
            dialogOpen = true;
        }
    });
    if(!dialogOpen){
        jq("#createPlanWindow").show();
        document.getElementById("createPlanWindow").style.display = 'block';
        $("#adminActionType").text("EDIT PLAN");
        $("#planId").val(planId);
        $("#adminPlan").val(planName);
        $("#adminDrug").val(drugName);
        $("#adminDose").val(dose);
        $("#adminDoseUnits").val(doseUnits);
        $("#adminRoute").val(route);
        $("#adminQuantity").val(quantity);
        $("#adminQuantityUnits").val(quantityUnits);
        $("#adminDuration").val(duration);
        $("#adminDurationUnits").val(durationUnits);
        $("#adminFrequency").val(frequency);
        $("#planSaveButton").prop("disabled", false);
    }
}

function deleteMedPlan(planID){
    $("#selectedMedPlan").val(planID);
    $("#adminPageForm").submit();    
}

function renameMedPlan(id, planName, planDesc){
    var dialogOpen = false;
    var objects = $('.dialog');
    $(objects).each(function(){
        if ($(this).is(':visible')){
            dialogOpen = true;
        }
    });
    if(!dialogOpen){
        $("#definePlanId").val(id);
        $("#defineAction").val("renamePlan");
        $("#definePlanName").val(planName);
        $("#definePlanDesc").val(planDesc);
        jq("#definePlanWindow").show();
        document.getElementById("definePlanWindow").style.display = 'block';
    }
}

function deleteMedPlanItem(planID){
    $("#selectedPlanItem").val(planID);
    $("#adminPageForm").submit();  
}

function hideMedPlanDiscardWindow(){
    jq("#deletePlanWindow").hide();
    $("#selectedPlanItem").val("");
    $("#selectedMedPlan").val("");
    $("#planToDiscard").val("");
    $("#discardPlan").text("");
    clearHighlights();
}

function showRenewGroupOrderWindow(orderID){
    $("#selectedNonActiveGroup").val(orderID);
    $("#nonActiveGroupForm").submit();
}

function showDiscardGroupOrderWindow(orderID){
   $("#selectedActiveGroup").val(orderID);
   $("#activeGroupForm").submit();
}

function hideGroupOrderWindow(){
    clearHighlights();
    jq("#activeOrderWindow").show();
    jq("#showGroupOrderWindow").hide();
}

function showAddOrderToGroupWindow(orderType,groupID){
    var dialogOpen = false;
    var objects = $('.dialog');
    $(objects).each(function(){
        if ($(this).is(':visible')){
            dialogOpen = true;
        }
    });
    if(!dialogOpen){
        $("#order_id").val(groupID);
        $("#orderType").text(orderType);
        $("#orderAction").val(orderType);
        jq("#confirmOrderWindow").hide();
        jq("#createOrderWindow").show();
        document.getElementById("createOrderWindow").style.display = 'block';
    }
}

function discontinueReason(){
    if(document.getElementById("discontinueReasonCoded").value === "Other"){
        jq("#discontinueReasonText").show();
        document.getElementById("discontinueReasonText").style.display = 'block';
    } else {
        jq("#discontinueReasonText").hide();
    }
    if(document.getElementById("discontinueReasonCoded").value === ""){
        $("#orderActionButton").prop("disabled", true);
    } else {
        $("#orderActionButton").prop("disabled", false);
    }
}

function removeFromGroup(OrderId){
    $("#removeFromGroup").val(OrderId);
    removeFromGroupDialog.show();
}

function saveDraftOrders(){
    $("#saveDraft").val("saveDraft");
    $("#saveDraftPlanForm").submit();
}