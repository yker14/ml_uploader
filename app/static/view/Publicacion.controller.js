sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
    'rshub/ui/libs/custom/Utilities',
    'sap/ui/core/UIComponent',
	'sap/base/security/encodeURL',
    'rshub/ui/libs/custom/RouterContentHelper'
], function (Controller, JSONModel, Utils, UIComponent, EncodeURL, RouterContentHelper) {
	"use strict";

	var CController = Controller.extend("rshub.ui.view.Publicacion", {
		onInit : function() {
			this.publicId = null;
			this.publData = null;
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
			sap.ui.core.BusyIndicator.show();
			
			setTimeout(function() {sap.ui.core.BusyIndicator.hide()}, 3000);

            var currentURL = new URL(window.location.href.replace("/#","")),
            urlParams = new URLSearchParams(currentURL.search),
            publId = urlParams.get("publId");
			this.publicId = publId;

            var resp = $.ajax({
				url: '/publicaciones/'+publId,
				datatype : "application/json",
                type: "GET",
                success: function(result) {
                    return result;
                },

                error: function(error) {
					sap.m.MessageBox.warning("Ocurrio un error de conexion.\n"+JSON.stringify(error), {
						actions: ["OK", sap.m.MessageBox.Action.CLOSE],
						emphasizedAction: "OK"
					});
                }
            });
            
            resp.then(function() {
                this.publData = JSON.parse(resp.responseText);
				this.oModel = new JSONModel(this.publData, true);
				
				//Set up image uploader config
				this.imageUploaderInit(this.publData);
				
                //Set the model data to display
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
			sap.ui.core.BusyIndicator.hide()
		},
		
        handleEditPress: function () {

			//Clone the data
			this._oSupplier = this.getView().getModel().getData();
			this._toggleButtonsAndView(true);

		},

		handleDeletePress: function () {
			var publId = this.publicId;

			sap.m.MessageBox.warning("Se eliminara esta publicacion de la base de datos y de Mercadolibre. ¿Desea continuar?", {
				actions: ["Aceptar", sap.m.MessageBox.Action.CLOSE],
				emphasizedAction: sap.m.MessageBox.Action.CLOSE,
				onClose: function (sAction) {
					
					if (sAction=="Aceptar") {

						var resp = $.ajax({
							url: '/publicaciones/'+publId+'/delete',
							datatype : "application/json",
							type: "POST",
							success: function(result) {
								return result;
							},
			
							error: function(error) {
								sap.m.MessageBox.warning("Ocurrio un error de conexion.\n"+error, {
									actions: ["OK", sap.m.MessageBox.Action.CLOSE],
									emphasizedAction: "OK"
								});
							}
						});
						
						resp.then(function() {
							sap.m.MessageBox.success("La publicacion fue eliminada.\n"+resp.responseText);

						}.bind(this));
					}
				}.bind(this)
			});

			
		},

		handleBackPress: function () {

			var sPreviousRouteName = UIComponent.getRouterFor(this.getView()).getRouteInfoByHash("publicaciones").name;
			RouterContentHelper.navigateTo(this, sPreviousRouteName);

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

		_toggleButtonsAndView : function (bEdit) {
			var oView = this.getView();

			// Show the appropriate action buttons
			oView.byId("edit").setVisible(!bEdit);
			oView.byId("save").setVisible(bEdit);
			oView.byId("cancel").setVisible(bEdit);
			oView.byId("del").setVisible(!bEdit);

			// Set the right form type
			this._showFormFragment(bEdit ? "Change" : "Display");
			
		},

		_formFragments: {},
		
		_getFormFragment: function (sFragmentName) {
			var oFormFragment = this._formFragments[sFragmentName];

			if (!oFormFragment) {
				var oChangeFragment = sap.ui.xmlfragment(this.getView().getId(), Utils.nameSpaceHandler("view.publicacion.") + "Change");
				this._formFragments["Change"] = oChangeFragment;
				this.getView().addDependent(oChangeFragment);

				var oDisplayFragment = sap.ui.xmlfragment(this.getView().getId(), Utils.nameSpaceHandler("view.publicacion.") + "Display");
				this._formFragments["Display"] = oDisplayFragment;
				this.getView().addDependent(oDisplayFragment);

				return this._formFragments[sFragmentName];

			} else {
				return oFormFragment;
			}

			//oFormFragment = sap.ui.xmlfragment(this.getView().getId(), Utils.nameSpaceHandler("view.publicacion.") + sFragmentName);
		},

		_showFormFragment : function (sFragmentName) {
			var oPage = this.byId("page");

			oPage.removeAllContent();
			oPage.insertContent(this._getFormFragment(sFragmentName));
		},

		//IMG UPLOAD FUNCTIONS
		imageUploaderInit: function (data) {
			console.log('initiated thiiis');

			console.log(data);
			var uploadController = this.getView().byId("uploadset"),
				imagesList = data["publicacion"]["pictures"],
				firstImagePath = imagesList[0].source,
				imagesPath = '';

			//Get path to put image on	
			if (firstImagePath==null || firstImagePath==undefined || firstImagePath=='') {
				
				//If no image path or image available for first image, set NoFolderImg as default
				imagesPath = 'static/media/images/NoFolderImg';

			} else {

				//Set the new path based on the first images path
				var listItems = firstImagePath.split("/");
					
				listItems.pop();
				imagesPath = listItems.join("/");
			}

			uploadController.setUploadUrl(imagesPath);
		},

		onExit: function() {
			console.log('exiting publicacion')
		}
        
	});

	return CController;

});
