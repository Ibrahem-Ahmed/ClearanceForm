sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("ClearanceForm.controller.Master", {
		
		onInit: function() {
			this.oDataModel = this.getOwnerComponent().getModel("ClearanceRequestModel");
			this.getView().setModel(this.oDataModel);
			
		},
		
		CreateRequest: function(oEvent){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("CreateRequest");
		},
		
		GoToLineItem: function(oEvent){	
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var SelectedClNum = oEvent.getSource().getBindingContext().getProperty("ClNum");
			
			
			oRouter.navTo("Details",{ClNum: SelectedClNum});
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf ClearanceForm.view.Master
		 */
			// onBeforeRendering: function() {
				
			// }

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf ClearanceForm.view.Master
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf ClearanceForm.view.Master
		 */
		//	onExit: function() {
		//
		//	}

	});

});