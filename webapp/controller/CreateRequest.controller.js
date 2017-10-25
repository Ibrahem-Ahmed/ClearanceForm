sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageToast",
	"ClearanceForm/model/models",
	"sap/ui/core/Fragment",
	'sap/ui/model/Filter',
	'sap/m/Dialog',
	'sap/m/List',
	'sap/m/StandardListItem',
	'sap/m/Button',
	'sap/m/MessageBox'
], function(Controller, History, MessageToast, models,Fragment,Filter,Dialog,List, StandardListItem,Button,MessageBox) {
	"use strict";
	return Controller.extend("ClearanceForm.controller.CreateRequest", {
		onInit: function() {
			var FormModel = this.getOwnerComponent().getModel("FormModel");
			this.getView().setModel(FormModel,"FormModel");
			this.oDataModel = this.getOwnerComponent().getModel("ClearanceRequestModel");
			this.getView().setModel(this.oDataModel,"ClearanceRequestModel");
		},
		
		navBackward: function() {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("", true);
			}
		},

		HandoverEmployeeF4: function(oEvent) {
			if (! this._oDialogEmployee) {
				this._oDialogEmployee = sap.ui.xmlfragment("ClearanceForm.view.HandoverEmployeeF4", this);
				this._oDialogEmployee.setModel(this.oDataModel,"ClearanceRequestModel");
			}
			this._oDialogEmployee.open();
		},
 
		handleSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Name", sap.ui.model.FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},
		
		handleClose: function(oEvent) {
			//remove error status from field if exists
			this.getView().byId("HandOverEmp").setValueState(sap.ui.core.ValueState.None);
			
			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts.length) {
				var _handOverEmp = aContexts.map(function(oContext) { return oContext.getObject().EmployeeNo; });
				this.getView().byId("HandOverEmp").setValue(_handOverEmp);
				var _handOverEmpDesc = aContexts.map(function(oContext) { return oContext.getObject().Name; });
				this.getView().byId("HandOverEmp").setDescription(_handOverEmpDesc);
			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		LeaveReqIdF4: function(oEvent) {
			var that = this;
			if(! this.dialog)
			{
				this.dialog = new Dialog({
					title: '{i18n>LeaveRequest}',
					content: new List({
						items: {
							path: 'ClearanceRequestModel>/LeaveRequestsSet',
							template: new StandardListItem({
								title: "{ClearanceRequestModel>From} - {ClearanceRequestModel>To}",
								description:"{ClearanceRequestModel>AttAbsDays}",
								sorter: "{ClearanceRequestModel>ReqID}",
								type:"Active",
								press : [this.SelectLeave, this]
							})
						}
					}),
					beginButton: new Button({
						text: 'Close',
						press: function () {
							that.dialog.close();
						}
					})
					// afterClose: function() {
					// }
				});
			}
			//to get access to the global model
			this.getView().addDependent(this.dialog);
			this.dialog.open();
		},
		
		SelectLeave: function(oEvent){
			//Set field status in case of error
			this.getView().byId("LeaveReqId").setValueState(sap.ui.core.ValueState.None);
			//get values
			this.selectedVersion = oEvent.getSource().getBindingContext("ClearanceRequestModel").getProperty("Version");
			this.selectedReqIDId = oEvent.getSource().getBindingContext("ClearanceRequestModel").getProperty("ReqID");
			this.selectedFrom = oEvent.getSource().getBindingContext("ClearanceRequestModel").getProperty("From");
			this.selectedTo = oEvent.getSource().getBindingContext("ClearanceRequestModel").getProperty("To");
			this.getView().byId("LeaveReqId").setValue(this.selectedReqIDId);
			this.getView().byId("LeaveReqId").setDescription(this.selectedFrom + " - " + this.selectedTo);
			this.dialog.close();
		},
		
		onExit: function() {
			if (this._oDialogEmployee) {
				this._oDialogEmployee.destroy();
			}
			if (this.dialog) {
				this.dialog.destroy();
			}
		},

		verifyInputs: function(){
			//Clear input fields status
			this.getView().byId("HandOverEmp").setValueState(sap.ui.core.ValueState.None);
			this.getView().byId("LeaveReqId").setValueState(sap.ui.core.ValueState.None);
			var err;
			//verify that handover employee has value
			if(this.getView().byId("HandOverEmp").getValue() === ""){
				this.getView().byId("HandOverEmp").setValueState(sap.ui.core.ValueState.Error);
			err = true;
			}
			
			//verify that request has value
			if(this.getView().byId("FormTypeSelect").getSelectedKey() === "01"){	//error if only annual leave
				if(this.getView().byId("LeaveReqId").getValue() === ""){
					this.getView().byId("LeaveReqId").setValueState(sap.ui.core.ValueState.Error);
				err = true;
				}
			}
			if( err === true ){
				return false;
			}else{
				return true;
				}
		},
		
		postData: function() {
			if(this.verifyInputs() === false){
				return;
			}
			var that=this;
			var oHeader = {};
			oHeader.HandOverEmp = this.getView().byId("HandOverEmp").getValue();
			this.oDataModel.setHeaders(oHeader);
			
			//display loading
			this.oDialog = sap.ui.xmlfragment("ClearanceForm.view.BusyDialog", this);
			this.oDialog.open();
			
			//create objects
			var oEntry = {};
			oEntry.ClNum = "$";
			oEntry.FormType = this.getView().byId("FormTypeSelect").getSelectedKey();
			oEntry.RequestId = this.selectedReqIDId;
			oEntry.VersionNo = this.selectedVersion;
			oEntry.Remarks = this.getView().byId("RemarksText").getValue();
			
	    	var _SuccessMessage = this.getView().getModel("i18n").getResourceBundle().getText("RequestCreated");
	    	var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			//post request
			this.oDataModel.create("/ClearanceFormHeaderSet", oEntry, {
			    method: "POST",
			    success: function(data) {
			    	//set message
					MessageBox.success(
						_SuccessMessage,
						{
							styleClass: bCompact? "sapUiSizeCompact" : "",
							onClose: function(){
								//Clear fields
								that.getView().byId("HandOverEmp").setValue("");
								that.getView().byId("HandOverEmp").setDescription("");
								that.getView().byId("LeaveReqId").setValue("");
								that.getView().byId("LeaveReqId").setDescription("");
								that.getView().byId("RemarksText").setValue("");
								// go to main view 
								that.getOwnerComponent().getRouter().navTo("", true);
							}
						}
					);
			    },
			    error: function(oError) {
			    	// MessageToast.show(oError.message);
			    	var _oJson = new sap.ui.model.json.JSONModel();
			    	_oJson.setJSON(oError.responseText);
			    	//set message
					MessageBox.error(
						_oJson.getProperty("/error/message/value"),
						{
							styleClass: bCompact? "sapUiSizeCompact" : ""
						});
					this.oDialog.close();
			    }
			});
			this.oDialog.destroy();
		}
		

	});

});