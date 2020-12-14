sap.ui.define([
    "./Utilities",
    "sap/ui/core/Fragment"
], function (Utils, Fragment) {
	"use strict";

	// class providing navigation standardization methods.

	return {

        showBusyIndicator: function(context) {

			if (!context._oBusyDialog) {
				
				// Create Controller
				var oController = { 
					mainContext: context,
					onDialogClosed: function() { 
						// do whatever should happen when the button in the fragment is pushed...
						this.mainContext._oBusyDialog.close();

						if (oEvent.getParameter("cancelPressed")) {
							MessageToast.show("The operation has been cancelled");
						} else {
							MessageToast.show("The operation has been completed");
						}
					} 
				};

				// Wait for promise to resolve for controller and create fragment view
				Fragment.load({
					name: "rshub.ui.view.dialogs.BusyIndicator",
					controller: oController
				}).then(function (oFragment) {
					context._oBusyDialog = oFragment;
					context.getView().addDependent(context._oBusyDialog);
					//syncStyleClass("sapUiSizeCompact", context.getView(), context._oBusyDialog);
					context._oBusyDialog.open();
					
					// Test with timeout function
					//iTimeoutId = this.simulateServerRequest(context);
				}.bind(context));
				
			} else {
				context._oBusyDialog.open();
				
				// Test with timeout function
				//iTimeoutId = this.simulateServerRequest(context);
			}	
		},

		simulateServerRequest: function(context){
			// simulate a longer running operation
			var timeout = setTimeout(function() {
				context._oBusyDialog.close();
			}.bind(context), 3000);

			return timeout;
		},
    };
});
