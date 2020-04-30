sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
    'rshub/ui/libs/custom/Utilities',
    'sap/ui/core/UIComponent',
	'sap/base/security/encodeURL'
], function (Controller, JSONModel, Utils, UIComponent, EncodeURL) {
	"use strict";

	var CController = Controller.extend("rshub.ui.view.Publicacion", {
		onInit : function() {
            
            var routeName = this.getOwnerComponent().getCurrentRoute();
            this.getOwnerComponent().getRouter().getRoute(routeName).attachMatched(this._onRouteMatched, this);

        },

        onExit : function () {
			for (var sPropertyName in this._formFragments) {
				if (!this._formFragments.hasOwnProperty(sPropertyName) || this._formFragments[sPropertyName] == null) {
					return;
				}

				this._formFragments[sPropertyName].destroy();
				this._formFragments[sPropertyName] = null;
			}
		},

        _onRouteMatched: function(ev) {

            var currentURL = new URL(window.location.href.replace("/#","")),
            urlParams = new URLSearchParams(currentURL.search),
            publId = urlParams.get("publId");


            var resp = $.ajax({
                url: '/publicaciones/'+publId,
                type: "GET",
                success: function(result) {
                    return result;
                },

                error: function(error) {
                    console.log({"error": error});
                    return error;
                }
            });
            
            resp.then(function() {
                var publData = JSON.parse(resp.responseText);
                this.oModel = new JSONModel(publData, true);
    
                
                //Set the tables data to display
                Promise.all([this.oModel]).then(function(values){
                    this.getView().setModel(values[0]);
                    this.getView().bindElement("/publicacion");
					this.getView().getModel().updateBindings(true);
                }.bind(this))
    
              }.bind(this));

			// Set the initial form to be the display one
			this._showFormFragment("Display");
		},
		

		onAfterRendering: function() {
			sap.ui.core.BusyIndicator.hide();
		},
		
        handleEditPress: function () {

			//Clone the data
			this._oSupplier = this.getView().getModel().getData();
			this._toggleButtonsAndView(true);

		},

		handleCancelPress : function () {

			//Restore the data
			var oModel = this.getView().getModel();
			var oData = oModel.getData();

			oData = this._oSupplier;

			oModel.setData(oData);
			this._toggleButtonsAndView(false);

		},

		handleSavePress : function () {

			this._toggleButtonsAndView(false);

		},

		_formFragments: {},

		_toggleButtonsAndView : function (bEdit) {
			var oView = this.getView();

			// Show the appropriate action buttons
			oView.byId("edit").setVisible(!bEdit);
			oView.byId("save").setVisible(bEdit);
			oView.byId("cancel").setVisible(bEdit);

			// Set the right form type
			this._showFormFragment(bEdit ? "Change" : "Display");
		},

		_getFormFragment: function (sFragmentName) {
			var oFormFragment = this._formFragments[sFragmentName];

			if (oFormFragment) {
				return oFormFragment;
			}

			oFormFragment = sap.ui.xmlfragment(this.getView().getId(), Utils.nameSpaceHandler("view.publicacion.") + sFragmentName);

			this._formFragments[sFragmentName] = oFormFragment;
			return this._formFragments[sFragmentName];
		},

		_showFormFragment : function (sFragmentName) {
			var oPage = this.byId("page");

			oPage.removeAllContent();
			oPage.insertContent(this._getFormFragment(sFragmentName));
		},

		onExit: function() {
			console.log('exiting publicacion')
		}
        
	});

	return CController;

});
