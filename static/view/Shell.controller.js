sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
  'sap/m/MessageBox',
  'rshub/ui/libs/custom/Utilities',
  'sap/m/Popover',
  'sap/m/Button',
	'sap/m/library',
  'sap/ui/core/Popup',
  'sap/ui/core/Fragment',
	'sap/ui/core/routing/History',
	'sap/ui/core/UIComponent'
], function (Controller, JSONModel, MessageBox, Utils, Popover, Button, Library, Popup, Fragment, History, UIComponent) {
	"use strict";

	var CController = Controller.extend(Utils.nameSpaceHandler("controller.Shell"), {

    onInit : function () {
	    //Global variables for Controller
	    this.oModel = new JSONModel();
        this.oModel.loadData(sap.ui.require.toUrl("rshub/ui/model/") + "/pages.json", null, false);
	    this.getView().setModel(this.oModel);
		},

    getRouter : function () {
			return UIComponent.getRouterFor(this);
		},

    onNavBack: function () {
        var oHistory, sPreviousHash;

        oHistory = History.getInstance();
        sPreviousHash = oHistory.getPreviousHash();

        if (sPreviousHash !== undefined) {
            window.history.go(-1);
        } else {
            this.getRouter().navTo("Homeview", {}, true /*leave no history for browser*/);
        }
    },

    onMenuItemSelect : function(ev) {
			if (this.getOwnerComponent().getCurrentRoute() != ev.getParameter("item").getProperty("key")) {
				this.byId("mainCont").removeAllContent();
				this.getRouter().navTo(ev.getParameter("item").getProperty("key"));
			}
		},

    handleNamePress: function (event) {
					var oPopover = new Popover({
						showHeader: false,
						placement: Library.PlacementType.Bottom,
						content: [
							new Button({
								text: 'Feedback',
								type: Library.ButtonType.Transparent
							}),
							new Button({
								text: 'Help',
								type: Library.ButtonType.Transparent
							}),
							new Button({
								text: 'Logout',
								type: Library.ButtonType.Transparent
							})
						]
					}).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');

					oPopover.openBy(event.getSource());
		},

		onSideNavButtonPress: function () {
			var oToolPage = this.byId("toolPage");
			var bSideExpanded = oToolPage.getSideExpanded();
            var oToggleButton = this.byId('sideNavigationToggleButton');

            (bSideExpanded) ?   oToggleButton.setTooltip('Expandir') :
                                oToggleButton.setTooltip('Colapsar');

			oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
		}


	});


	return CController;

});
