sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
    'rshub/ui/libs/custom/Utilities',
    'sap/ui/core/UIComponent',
	'sap/base/security/encodeURL',
	'rshub/ui/libs/custom/RouterContentHelper',
	'sap/ui/core/Fragment',
	'rshub/ui/libs/custom/ImageRequest',
	'rshub/ui/libs/custom/HttpRequest'
], function (Controller, JSONModel, Utils, UIComponent, EncodeURL, RouterContentHelper, Fragment, ImageRequestor, HttpRequestor) {
	"use strict";

	var CController = Controller.extend(Utils.nameSpaceHandler("view.Publicacion"), {

		viewData : {},
		viewType : "Display",
		publData : {},
		publicId : null,
		publImg : {},
		imgModel: null,
		uploadCounter: 0,
		mainFolder : null,
		headerFileName: null,
		headerFileOrder: null,
		deleteImgContainer: [],
		addImgContainer: [],
		orderCount: 0,

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
				
				//Delete images that were uploaded but not saved.
				this.deleteImages(this.addImgContainer);
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
			var imgResp = ImageRequestor.getImages(publId);

			imgResp.then(function() {
				this.publImg = Object.assign({},JSON.parse(imgResp.responseText));
				this.imgModel = new JSONModel(this.publImg);
				this.imgModel.attachPropertyChange(function (ev) {

					if (ev.getParameter("path") == "filename") {
						//OLD NAME
						var oldName = this.changedNameItem.name,
						//NEW NAME
							nName = ev.getParameter("value"),
						//ORDER
							oldOrder = this.publImg.orderlist[oldName];

						//ADD NEW NAME TO THE ORDER LIST
						this.publImg.orderlist[nName] = oldOrder;

						//DELETE OLD NAME FORM THE ORDER LIST
						delete this.publImg.orderlist[oldName];						
					}
				}.bind(this));

				var oCarousel = this.getView().byId("idcarousel");
				oCarousel.setModel(this.imgModel);
				oCarousel.updateBindings(true);

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
		
		handlePublishPress: function() {
			var publId = this.publicId;

			var resp = $.ajax({
				url: '/publicaciones/'+publId+'/publicar',
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
				sap.m.MessageBox.success("Publicacion en MercadoLibre exitoso.\n"+resp.responseText);

			});
		},

        handleEditPress: function () {

			//Clone the data
			this.viewData = JSON.parse(JSON.stringify(this.getView().getModel().getData()));

			this._toggleButtonsAndView(true);
							
			//Set up image uploader config
			if (this.viewType == "Change") {
				this.imageUploaderInit();
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

		deleteImages: function (imgListURL) {

			for (var i=0; i < imgListURL.length; i++) {
				var filePath = encodeURIComponent(encodeURIComponent(url));	
				
				var resp = HttpRequestor.httpRequest('/publicaciones/images/delete/'+ filePath,"POST");

				resp.then(function() {
					return true;
				});
			}
		},

		handleSavePress : function () {
			
			var saveChecklist = {
				deleteImages: false,
				addImages: false,
				fieldValues: false,
			}

			try {
				//DELETE IMAGES REQUESTED TO BE DELETED
				
				if (this.deleteImages(this.deleteImgContainer)) {
					saveChecklist.deleteImages = true;
				}

				saveChecklist.addImages = true;

				//FIELD VALUES SAVE
				this.publData = JSON.parse(JSON.stringify(this.viewData))
				this._toggleButtonsAndView(false);
				saveChecklist.fieldValues = true;
			}
			catch(e) {
				sap.m.MessageBox.error("No se ha podido guardar los datos.\n" + JSON.stringify(e), {
					actions: [sap.m.MessageBox.Action.CLOSE],
					emphasizedAction: sap.m.MessageBox.Action.CLOSE
				});
			}
				

			//Final actions
			console.log("Saved");
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
				this.getView().addDependent(this._formFragments[sFragmentName]);

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
		imageUploaderInit: function (update=false) {
			console.log('imgupload init');
			console.log(this.publImg);
			
			var uploadController = this.getView().byId("uploadset"),
				orderController = this.getView().byId("imgorderlist");
				
			//Create order Select List based on number of pictures available
			this.publImg["orderlist"] = {};

			var picturesCount = this.publImg["pictures"].length,
				selectArray = [];

			selectArray.push({"key": 0, "text": ""}) ;

			for (var i = 0; i < picturesCount; i++) {
				selectArray.push({"key": i+1, "text": (i+1).toString()});
				this.publImg.pictures[i].orderselect = selectArray;

				//Fill the order object to query by image name
				this.publImg.orderlist[this.publImg.pictures[i].filename] = this.publImg.pictures[i].orden;
			}

			this.orderCount = selectArray.length - 1;
			
			if (update) {
				
				uploadController.updateBindings(true);
				orderController.updateBindings(true);
				uploadController.getModel().refresh();
				orderController.getModel().refresh();

			} else {
				
				if(!uploadController.getModel() && !orderController.getModel()) {

					//this.imgModel.getModel().getData().pictures = this.publImg.pictures;
	
					uploadController.setModel(this.imgModel);
					orderController.setModel(this.imgModel);

					this.mainFolder = this.publImg["mainfolder"];
					uploadController.setUploadUrl("/publicaciones/images/"+encodeURIComponent(encodeURIComponent(this.mainFolder)));
					uploadController.getDefaultFileUploader().setMultiple(true);
				}
				
				this.deleteImgContainer = [];
				this.addImgContainer = [];

/*************************
* 	TO BE IMPLEMENTED. 
*	CODE PULLS THE BASE 64 BLOB FROM THE IMAGES UPLOADED TO THE CONTROL.
*	MISSING TO SET THE THUMBNAIL, RESIZE AND OTHER ACTIONS THAT MIGHT BE REQUIRED.
**************************
*				uploadController.getDefaultFileUploader().attachChange(function(ev) {
*					var aFiles= ev.getParameters().files;
*
*					for (var i = 0; i < aFiles.length; i++) {					
*						var fileContent = [];
*
*						fileContent.push(ImageRequestor.getReader(aFiles[i]));
*					}
*
*				}.bind(this));
**************************/

			//Attach event handler functions
				uploadController.attachAfterItemAdded(function(ev) {

					//VALIDATE IF THE FILE UPLOADED HAS A DUPLICATED NAME FROM THE LIST
					orderController = this.getView().byId("imgorderlist");
					orderController.getModel().getData();
					
					this.addImgContainer.push(ev.getParameter("item"));

					//CHeck if file name or path has "_" in it and request to remove	

				}.bind(this));
				
				uploadController.attachBeforeItemEdited(function(ev) {
					console.log(ev);

					this.changedNameItem = {
						name: ev.getParameter("item").getFileName(),
						item: ev.getParameter("item")
					};

				}.bind(this));
				
				uploadController.attachBeforeItemRemoved(function(ev) {
					console.log("item bout to be removed");
					this.deleteImgContainer.push(ev.getParameter("item").getUrl());
					
				}.bind(this));

				uploadController.attachBeforeItemAdded(function(ev) {
					console.log("iTEM BOUT TO BE ADDED");
				}.bind(this));

				uploadController.attachBeforeUploadStarts(function(ev) {
					var oUploader = ev.getSource(),
						oItemName = ev.getParameter("item").getFileName();

					
						if (!oUploader.getHeaderFields().length > 0) {
							this.headerFileName = new sap.ui.core.Item({id:"idFileNameHeader",key:"File-Name-Header",text:oItemName});
							oUploader.addHeaderField(this.headerFileName);

							this.headerFileOrder = new sap.ui.core.Item({id:"idFileOrderHeader",key:"File-Order-Header",text:this.orderCount+1});
							oUploader.addHeaderField(this.headerFileOrder);
							this.orderCount += 1;

						} else {
							//oUploader.getHeaderFields()[oUploader.indexOfHeaderField(this.headerFileName)].setText(oItemName)
							this.headerFileName.setText(oItemName);

							this.headerFileOrder.setText(this.orderCount);
							this.orderCount += 1;

						}

					console.log(oUploader.getUploadUrl());
					console.log(oItemName);

				}.bind(this));

				uploadController.attachUploadCompleted(function(ev) {
					console.log("completed");
					
					this.uploadCounter += 1

					//Request images again if no items pending to be uploaded
					if (ev.getSource().getIncompleteItems().length==this.uploadCounter) {
						uploadController.removeAllIncompleteItems();

						this.uploadCounter = 0;

						var p = ImageRequestor.getImages(this.publicId);

						p.then(function() {
								this.publImg.pictures = JSON.parse(p.responseText).pictures;
								this.imageUploaderInit(true);
							}.bind(this));
					}
				}.bind(this));
			}
			
		},

		onOrderChg: function(ev) {
			console.log("order changed");
			
			
			//Get changing item filename from the Label control of the aggregation
			var chgImgName = ev.getSource().getParent().getContent()[1].getText();
			
			//NEW ORDER
			var nOrder = ev.getParameter("selectedItem").getText();

			//PREV ORDER
			var prevOrder = this.publImg.orderlist[chgImgName];

			//GET ALL ITEMS OF THE ORDER CONTROLLER
			var orderContollerItems = this.byId("imgorderlist").getItems();
			
			//FIND THE ITEM WITH SAME nOrder VALUE AND UPDATE IT TO prevOrder
			for (var i=0; i < orderContollerItems.length; i++) {
				var srchName = orderContollerItems[i].getContent()[1].getText(),
					srchOrder = orderContollerItems[i].getContent()[4].getSelectedItem().getText();
				
				if (srchOrder == nOrder && srchName != chgImgName) {
					
					prevOrder = (prevOrder == '') ? 0 : prevOrder;

					orderContollerItems[i].getContent()[4].setSelectedKey(prevOrder);
					break;
				}
			}
			
			//UPDATE THE IMAGE ORDER LIST TO THE NEW VALUES
			

			this.publImg.orderlist[chgImgName] = nOrder;
			this.publImg.orderlist[srchName] = prevOrder;
		},

		onExit: function() {
			console.log('exiting publicacion')
		}
        
	});

	return CController;

});
