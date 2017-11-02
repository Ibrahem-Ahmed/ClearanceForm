sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/m/MessageBox',
	'sap/m/Dialog'
], function(Controller,MessageBox,Dialog) {
	"use strict";

	return Controller.extend("ClearanceForm.controller.Details", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ClearanceForm.view.Details
		 */
		onInit: function() {
			
			this.oDataModel = this.getOwnerComponent().getModel("ClearanceRequestModel");
			this.getView().setModel(this.oDataModel);
			
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this); 
			oRouter.getRoute("Details").attachMatched(this._onRouteMatched, this);
		},
		_onRouteMatched: function(oEvent) 
		{ 			
			var oTable = this.getView().byId("idProductsTable");
			// build same structure of table column in xml view
			var oTemplate = new sap.m.ColumnListItem({
			    cells : [
			        new sap.m.ObjectIdentifier({
			        	title:"{ApproverEmployee}",
			            text : "{EmployeeName}"
			        }),
			        new sap.m.Text({
			            text : "{Phone}"
			        }),
			        new sap.m.Text({
			            text : "{Email}"
			        }),
			        new sap.m.Text({
			            text : "{Remarks}"
			        }),
			        new sap.m.ObjectStatus({
			            text : "{State}",
			            state: "{path: 'State', formatter: 'ClearanceForm.formatter.Formatter.status'}" 
			        })
			    ]
			});
			
			this.oArgs = oEvent.getParameter("arguments"); 
			oTable.bindItems("/ClearanceFormHeaderSet('" + this.oArgs.ClNum + "')/ClearanceFormItemsSet",oTemplate);
			
		},
		
		WithdrawRequest:function(oEvent){
			var that = this;
			
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			sap.m.MessageBox.confirm(this.getView().getModel("i18n").getResourceBundle().getText("WithdrawConfirm"), 
			{
			    title: "Confirm",                                   
			    onClose: function(oAction){
			    	if (oAction === "OK"){
						var _SuccessMessage = that.getView().getModel("i18n").getResourceBundle().getText("WithdrawRequest");
						that.oDataModel.callFunction("/Withdraw",
			                {method:"POST",
			                urlParameters:{"ClNum" : that.oArgs.ClNum},
			                success: function(oData, response) {
									MessageBox.success(_SuccessMessage);
			                    },
			                error: function(oError){
									var _oJson = new sap.ui.model.json.JSONModel();
									_oJson.setJSON(oError.responseText);
									// set message
									MessageBox.error(
										_oJson.getProperty("/error/message/value"),
										{ styleClass: bCompact? "sapUiSizeCompact" : "" }
									);
								}
							});
					}
			    },                                     
				styleClass: bCompact? "sapUiSizeCompact" : "",
				initialFocus: null,
				textDirection: sap.ui.core.TextDirection.Inherit
				}
			);
		}
		
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf ClearanceForm.view.Details
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf ClearanceForm.view.Details
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf ClearanceForm.view.Details
		 */
		//	onExit: function() {
		//
		//	}

	});

});