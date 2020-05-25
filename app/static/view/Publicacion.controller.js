sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
    'rshub/ui/libs/custom/Utilities',
    'sap/ui/core/UIComponent',
	'sap/base/security/encodeURL',
	'rshub/ui/libs/custom/RouterContentHelper',
	'sap/ui/core/Fragment'
], function (Controller, JSONModel, Utils, UIComponent, EncodeURL, RouterContentHelper, Fragment) {
	"use strict";

	var CController = Controller.extend(Utils.nameSpaceHandler("view.Publicacion"), {

		viewData : {},
		viewType : "Display",
		publData : {},
		publicId : null,
		publImg : {},
		mainFolder : null,
		headerFileName: null,

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
			//sap.ui.core.BusyIndicator.show();

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
					sap.m.MessageBox.warning("Ocurrio un error de conexion.\n" + JSON.stringify(error), {
						actions: ["OK", sap.m.MessageBox.Action.CLOSE],
						emphasizedAction: "OK"
					});
                }
            });
            
            resp.then(function() {
                this.publData = JSON.parse(resp.responseText);
				this.oModel = new JSONModel(this.publData, true);
				
                //Set the model data to display
                Promise.all([this.oModel]).then(function(values) {
                    this.getView().setModel(values[0]);
                    this.getView().bindElement("/publicacion");
					this.getView().getModel().updateBindings(true);
					
                }.bind(this))
    
			  }.bind(this));
			  
			// Request publication images

			var imgResp = $.ajax({
				url: '/publicaciones/images/request/'+publId,
				datatype : "application/json",
                type: "GET",
                success: function(result) {
                    return result;
                },

                error: function(error) {
					sap.m.MessageBox.warning("Ocurrio un error de conexion.\n" + JSON.stringify(error), {
						actions: ["OK", sap.m.MessageBox.Action.CLOSE],
						emphasizedAction: "OK"
					});
                }
            });
            
            imgResp.then(function() {
                this.publImg = JSON.parse(imgResp.responseText);
				this.oImgModel = new JSONModel(this.publImg, true);
				
                //Set the model data to display
                Promise.all([this.oImgModel]).then(function(values) {
					var oCarousel = this.getView().byId("idcarousel");
					oCarousel.setModel(values[0]);
					oCarousel.updateBindings(true);
					
                }.bind(this))
    
			  }.bind(this));

			// Set the initial form to be the display one
			this._showFormFragment(this.viewType);
			
		},
		
		onBeforeRendering: function() {
			sap.ui.core.BusyIndicator.show()
		},

		onAfterRendering: function() {
			sap.ui.core.BusyIndicator.hide()
		},
		
        handleEditPress: function () {

			//Clone the data
			this.viewData = JSON.parse(JSON.stringify(this.getView().getModel().getData()));

			this._toggleButtonsAndView(true);
							
			//Set up image uploader config
			if (this.viewType == "Change") {
				this.imageUploaderInit(this.publImg);
			}
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

			this.handleBackPress();
		},

		handleBackPress: function () {

			var sPreviousRouteName = UIComponent.getRouterFor(this.getView()).getRouteInfoByHash("publicaciones").name;
			this.onExit();
			RouterContentHelper.navigateTo(this, sPreviousRouteName);

		},

		handleCancelPress : function () {

			//Restore the data
			var oModel = this.getView().getModel();
			var oData = null;

			oData = this.viewData;

			oModel.setData(oData);
			this._toggleButtonsAndView(false);

		},

		handleSavePress : function () {
			this.publData = JSON.parse(JSON.stringify(this.viewData))
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
			this.viewType = bEdit ? "Change" : "Display"
			this._showFormFragment(this.viewType);
			
		},

		_formFragments: {},
		
		_getFormFragment: function (sFragmentName) {
			var oFormFragment = this._formFragments[sFragmentName];

			if (oFormFragment) {
				
				var oPage = this.byId("page");
				oPage.insertContent(this._formFragments[sFragmentName]);

				return oFormFragment;
			}

			Fragment.load({
				id: this.getView().getId(),
				name: Utils.nameSpaceHandler("view.publicacion.") + sFragmentName,
				controller: this
			}).then(function(oFragment){
				this._formFragments[sFragmentName] = oFragment;
				this._formFragments[sFragmentName];
				
				var oPage = this.byId("page");
				oPage.insertContent(this._formFragments[sFragmentName]);

			}.bind(this))
		},

		_showFormFragment : function (sFragmentName) {
			var oPage = this.byId("page");

			oPage.removeAllContent();

			this._getFormFragment(sFragmentName);
			//oPage.insertContent(this._getFormFragment(sFragmentName));
		},

		//IMG UPLOAD FUNCTIONS
		imageUploaderInit: function (data) {
			console.log('imgupload init');
			console.log(data);
			
			var uploadController = this.getView().byId("uploadset"),
				orderController = this.getView().byId("imgorderlist");
				
				this.mainFolder = data["mainfolder"];

			//Create order Select List based on number of pictures available
			var picturesCount = data["pictures"].length,
				selectArray = [];
				
			selectArray.push({"key": 0, "text": ""}) ;

			for (var i = 0; i < picturesCount; i++) {
				selectArray.push({"key": i+1, "text": (i+1).toString()});
				data["pictures"][i]["orderselect"] = selectArray;
			}

			var dataModel = new JSONModel(data["pictures"]);
			
			uploadController.setModel(dataModel)
			orderController.setModel(dataModel);
			uploadController.setUploadUrl("/publicaciones/images/"+encodeURIComponent(encodeURIComponent(this.mainFolder)));

			//Attach event handler functions
			uploadController.attachAfterItemAdded(function(ev) {
				// orderController = this.getView().byId("imgorderlist");
				// orderController.getModel().getData();

				//CHeck if file name or path has "_" in it and request to remove

			}.bind(this));
			
			uploadController.attachBeforeItemEdited(function() {

			}.bind(this));
			
			uploadController.attachBeforeItemRemoved(function() {

			}.bind(this));
			
			uploadController.attachBeforeUploadStarts(function(ev) {
				var oUploader = this.getView().byId("uploadset"),
					oItemName = ev.getParameter("item").getFileName();

				
					if (!oUploader.getHeaderFields().length > 0) {
						this.headerFileName = new sap.ui.core.Item({id:"idFileNameHeader",key:"File-Name-Header",text:oItemName});
						oUploader.addHeaderField(this.headerFileName);
					} else {
						//oUploader.getHeaderFields()[oUploader.indexOfHeaderField(this.headerFileName)].setText(oItemName)
						this.headerFileName.setText(oItemName);
					}

				console.log(oUploader.getUploadUrl());
				console.log(oItemName);

			}.bind(this));

			uploadController.attachUploadCompleted(function(ev) {
				console.log("completed");
			}.bind(this));
			
		},

		onpressupload: function() {
			console.log("Test button");
			var uploadController = this.getView().byId("uploadset");
			uploadController.upload();
		},

		onExit: function() {
			console.log('exiting publicacion')
		}
        
	});

	return CController;

});
