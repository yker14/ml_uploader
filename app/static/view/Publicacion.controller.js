sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
    'rshub/ui/libs/custom/Utilities',
    'sap/ui/core/UIComponent',
	'sap/base/security/encodeURL',
	'rshub/ui/libs/custom/RouterContentHelper',
	'sap/ui/core/Fragment',
	'rshub/ui/libs/custom/ImageRequest',
	'rshub/ui/libs/custom/HttpRequest',
	'sap/m/MessageStrip'
], function (Controller, JSONModel, Utils, UIComponent, EncodeURL, RouterContentHelper, Fragment, ImageRequestor, HttpRequestor, MessageStrip) {
	"use strict";

	var CController = Controller.extend(Utils.nameSpaceHandler("view.Publicacion"), {

		viewData : {},
		viewType : "Display",
		publData : {},
		publicId : null,
		publImg : {mainfolder:null, pictures: [], idnamematch: {}},
		imgModel: null,
		uploadCounter: 0,
		mainFolder : null,
		headerFileName: null,
		headerFileOrder: null,
		headerFileId: null,
		deleteImgContainer: [],
		addImgContainer: [],
		orderCount: 0,
		uploadController: null,
		orderController: null,
		formController : null,
		simpleformPublData: null,
		displaySimpleformPublData: null,

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
				this.publicId = publId;

			var resp = HttpRequestor.httpRequest('/publicaciones/'+publId, "GET", null);

            resp.then(function() {
                this.publData = JSON.parse(resp.responseText);
				this.oModel = new JSONModel(this.publData, true);
				var imgResp = ImageRequestor.getImages(publId);
                //Set the model data to display
                Promise.all([this.oModel, imgResp]).then(function(values) {
					var model = values[0];
					var images = values[1];

                    this.getView().setModel(model);
					this.getView().bindElement("/publicacion");
					
					// Set the initial form to be the display one
					this.viewType = "Display";
					this._toggleButtonsAndView(false);
					
					this.getView().getModel().updateBindings(true);
					
					// Set images model
					this.setImgData(Object.assign({},images));

					this.imgModel = new JSONModel(this.publImg);

					this.imgModel.attachPropertyChange(function (ev) {
						//REFRESH IMAGE ORDER CONTROLLER ITEMS					
						this.orderController.getModel().refresh();

					}.bind(this));

					var oCarousel = this.getView().byId("idcarousel");
					oCarousel.setModel(this.imgModel);
					oCarousel.updateBindings(true);

                }.bind(this))
    
			  }.bind(this));
			  
			// Request publication images
			/*
			var imgResp = ImageRequestor.getImages(publId);

			imgResp.then(function() {

				this.setImgData(Object.assign({},JSON.parse(imgResp.responseText)));

				this.imgModel = new JSONModel(this.publImg);

				this.imgModel.attachPropertyChange(function (ev) {
					//REFRESH IMAGE ORDER CONTROLLER ITEMS					
					this.orderController.getModel().refresh();

				}.bind(this));

				var oCarousel = this.getView().byId("idcarousel");
				oCarousel.setModel(this.imgModel);
				oCarousel.updateBindings(true);

			}.bind(this));
			*/			
		},
		
		onBeforeRendering: function() {
			sap.ui.core.BusyIndicator.show()
		},
		

		onAfterRendering: function() {
			sap.ui.core.BusyIndicator.hide()
		},


		messageStripTypeFormat: function(val) {
			

			switch (val.id) {
				// paused publ
				case 11:
					return "Warning"

				// active/published
				case 10:				
					return "Success"

				// deleted
				case 12:
					return "Error"

				// pending
				case 1000:
					return "Information"

				// manually paused
				case 1001:
					return "Warning"

				// manually deleted
				case 1002:
					return "Error"

				default:
					return "None"
			}
		},

		messageStripTextFormat: function(val) {
			return val.status
		},

		handlePublishPress: function() {
			var publId = this.publicId;
			var resp = HttpRequestor.httpRequest('/publicaciones/'+publId+'/publicar', "POST", null);
	
			resp.then(function() {
				sap.m.MessageBox.success("Publicacion en MercadoLibre exitoso.\n"+resp.responseText);

			});
		},

		handleStockUpdatePress: function() {
			var publId = this.publicId;
			var resp = HttpRequestor.httpRequest('/publicaciones/'+publId+'/sync', "POST", null);
	
			resp.then(function() {
				sap.m.MessageBox.success("Inventario actualizado.\n"+resp.responseText);

			});
		},

		handlePausePress: function() {
			var publId = this.publicId;
			var resp = HttpRequestor.httpRequest('/publicaciones/'+publId+'/pause', "POST", null);
	
			resp.then(function() {
				sap.m.MessageBox.success("Pausado en MercadoLibre exitoso.\n"+resp.responseText);

			});
		},

		handleManualPublishPress: function() {
			var publId = this.publicId;
			var resp = HttpRequestor.httpRequest('/publicaciones/'+publId+'/manual', "POST", null);
	
			resp.then(function() {
				sap.m.MessageBox.success("Publicacion en modo manual.\n"+resp.responseText);

			});
		},

        handleEditPress: function () {

			//Clone the data
			this.viewData = JSON.parse(JSON.stringify(this.getView().getModel().getData()));

			this._toggleButtonsAndView(true);
							
			//Set up image uploader config
			if (this.viewType == "Change") {

				this.deleteImgContainer = [];
				this.addImgContainer = [];

				this.imageUploaderInit();
			}
		},

		handleDeletePress: function () {
			var publId = this.publicId;

			sap.m.MessageBox.warning("Se eliminara esta publicacion de la base de datos y de Mercadolibre. ¿Desea continuar?", {
				actions: ["Aceptar", sap.m.MessageBox.Action.CLOSE],
				emphasizedAction: sap.m.MessageBox.Action.CLOSE,
				onClose: function (oAction) {
						if (oAction=="Aceptar") {
							var resp = HttpRequestor.httpRequest(`/publicaciones/${publId}/delete`,"POST");
								resp.then(function () {
									sap.m.MessageBox.success("La publicacion fue eliminada.\n"+resp.responseText);
									this.handleBackPress();
								}.bind(this))
						}
					}.bind(this)
			});

			

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

		deleteImages: function (fileName) {
			var url = this.mainFolder,
			filePath = encodeURIComponent(encodeURIComponent(url));
			
			var headers = {'File-Name-Header': fileName, 'File-ID-Header' : this.publImg.idnamematch[fileName]},

			resp = HttpRequestor.httpRequest(`/publicaciones/images/delete/${filePath}`,"POST", headers);

			resp.then(function() {				
				console.log('success');

				//LOOP THORUGH publImg's pictures and idnamematch and delete the properties
				var oItemId = this.publImg.idnamematch[fileName];

				for (var i = 0; i < this.publImg.pictures.length; i++) {
					if (this.publImg.pictures[i].id == oItemId) {
						this.publImg.pictures.splice(i, 1);
						delete this.publImg.idnamematch[fileName];							
						break;							
					} else {
						continue;
					}
				}		

				this.reloadUploaderItems();

			}.bind(this));		
		},

		handleSavePress : function () {
			
			var saveChecklist = {
				deleteImages: false,
				addImages: false,
				fieldValues: false,
			}

			try {
				//DELETE IMAGES REQUESTED TO BE DELETED
				
				// if (this.deleteImages(this.deleteImgContainer)) {
				// 	saveChecklist.deleteImages = true;
				// }

				saveChecklist.deleteImages = true;
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

		getFormControl : function () {
			var formControl;

			if (this.viewType == "Display") {				
				formControl = this.getView().byId("display_simpleformPublData");
				return formControl;
			} else if (this.viewType == "Change") {
				formControl = this.getView().byId("simpleformPublData");
				return formControl;
			}
		},

		_toggleButtonsAndView : function (bEdit) {
			var oView = this.getView();

			// Show the appropriate action buttons
			oView.byId("edit").setVisible(!bEdit);
			oView.byId("save").setVisible(bEdit);
			oView.byId("cancel").setVisible(bEdit);
			oView.byId("del").setVisible(!bEdit);
			oView.byId("publish").setVisible(!bEdit);
			oView.byId("stock").setVisible(!bEdit);
			oView.byId("manualStop").setVisible(!bEdit);
			oView.byId("manualPublish").setVisible(!bEdit);

			// Set the right form type
			this.viewType = bEdit ? "Change" : "Display"
			this._showFormFragment(this.viewType);
			
		},

		_formFragments: {},
		
		_getFormFragment: function (sFragmentName) {

			if (this._formFragments[sFragmentName]) {
				
				var oPage = this.byId("page");
				oPage.insertContent(this._formFragments[sFragmentName]);

				return this._formFragments[sFragmentName];
			}

			Fragment.load({
				id: this.getView().getId(),
				name: Utils.nameSpaceHandler("view.publicacion.") + sFragmentName,
				controller: this
			}).then(function(oFragment){
				this._formFragments[sFragmentName] = oFragment;
				this.getView().addDependent(this._formFragments[sFragmentName]);

				var oPage = this.byId("page");
				
				if (this.viewType == "Change") {
					this._setPublicationData();

					oPage.insertContent(this._formFragments[sFragmentName]);

					this.uploadController = this.getView().byId("uploadset");
					this.orderController = this.getView().byId("imgorderlist");

				} else if (this.viewType == "Display") {
					this._setPublicationData();
					oPage.insertContent(this._formFragments[sFragmentName]);
				}

			}.bind(this))
		},

		_showFormFragment : function (sFragmentName) {
			var oPage = this.byId("page");

			oPage.removeAllContent();

			this._getFormFragment(sFragmentName);
		},

		_setFormTitlePublicacion : function(side, view) {

			if (side == "sideA") {
				//Title containing the fields for the publication in the simpleform			
				var oTitle = new sap.ui.core.Title({text:"Origen"});
				view.addContent(oTitle);

//				if (this.viewType == "Display") {
//					this.displaySimpleformPublData.addContent(oTitle);
//				} else if (this.viewType == "Change") {
//					this.simpleformPublData.addContent(oTitle);
//				}

			} else if (side == "sideB") {
				//Title containing the fields for the publication in the simpleform			
				var oTitle = new sap.ui.core.Title({text:"Mercadolibre"});
				view.addContent(oTitle);

//				if (this.viewType == "Display") {
//					this.displaySimpleformPublData.addContent(oTitle);
//				} else if (this.viewType == "Change") {
//					this.simpleformPublData.addContent(oTitle);
//				}
			}

		},

		_applyPublicationField : function (data, side) {

			//Display view setup
			if (this.viewType == "Display") {

				//Create and insert label of the field
				var oLabel = new sap.m.Label({text:data.label});
				this.formController.addContent(oLabel);

				//If view is display 
				if (data.type == "link") {
					var oLink = new sap.m.Link({text:this.getView().getModel().getProperty("/")[data.dbName],href:this.getView().getModel().getProperty("/")[data.dbName],target:"_blank"});				
					this.formController.addContent(oLink);
				} else {
					var oText = new sap.m.Text({text:this.getView().getModel().getProperty("/")[data.dbName]});				
					this.formController.addContent(oText);
				}

			} else if (this.viewType == "Change") {

				//Create and insert label of the field					
				var oLabel = new sap.m.Label({text:data.label});
				this.formController.addContent(oLabel);

				//If view is change
				var oText = new sap.m.Text({text:this.getView().getModel().getProperty("/")[data.dbName]});				
				this.formController.addContent(oText);
			}
		},

		_setPublicationData : function () {
			this.formController = this.getFormControl();

			var oFieldList =  new JSONModel();
			oFieldList.loadData(sap.ui.require.toUrl("rshub/ui/model/") + "publicacionfields.json", null, false);
			var oFieldList = oFieldList.getData(); 
			//var sideAData = oFieldList.getData().sideA;
			//var sideBData = oFieldList.getData().sideB;		
			
			Object.keys(oFieldList).forEach(function(key0, index0) {
				var side = key0;
				this._setFormTitlePublicacion(side,this.formController);
				
				//Data for side A of the simpleform
				Object.keys(oFieldList[side]).forEach(function(key1, index1) {
					
					var fieldData = { 
						dbName : oFieldList[side][key1].dbName,
						label : oFieldList[side][key1].label,
						editable : oFieldList[side][key1].editable,
						type : oFieldList[side][key1].type,
						format : oFieldList[side][key1].format,
						items : oFieldList[side][key1].items
					}

					//Create and insert field
					this._applyPublicationField(fieldData, side);

				}.bind(this))
			}.bind(this))
		},

		setOrderData: function () {
			//Create order Select List based on number of pictures available
			this.publImg["orderlist"] = {};

			var picturesCount = this.publImg["pictures"].length,
				selectArray = [];

			selectArray.push({"key": 0, "text": ""}) ;

			for (var i = 0; i < picturesCount; i++) {
				selectArray.push({"key": i+1, "text": (i+1).toString()});
				this.publImg.pictures[i].orderselect = selectArray;

				//Fill the orderlist object to query by image name
				this.publImg.orderlist[this.publImg.pictures[i].filename] = this.publImg.pictures[i].orden;
			}

			this.orderCount = selectArray.length - 1;
		},

		setImgData: function(p) {

			//Adjust Order of images
			var orderedPics = p.pictures.sort(Utils.predicateBy("orden"));

			for (var i = 0; i < orderedPics.length; i++) {
				orderedPics[i].orden = i+1;
			}

			//Assign 
			this.publImg.mainfolder = p.mainfolder;
			this.publImg.pictures = orderedPics;
			this.publImg.idnamematch = {};

		},

		imageUploaderUpdate: function() {
			var uploadController = this.getView().byId("uploadset"),
			orderController = this.getView().byId("imgorderlist");

			//uploadController.removeAllIncompleteItems();

			uploadController.updateBindings(true);
			orderController.updateBindings(true);
			uploadController.getModel().refresh();
			orderController.getModel().refresh();
		},

		//IMG UPLOAD FUNCTIONS
		imageUploaderInit: function () {
			
			var uploadController = this.getView().byId("uploadset"),
				orderController = this.getView().byId("imgorderlist");

			//Reload Upload Controller Items
			this.reloadUploaderItems();

			this.mainFolder = this.publImg["mainfolder"];
			uploadController.setUploadUrl("/publicaciones/images/"+encodeURIComponent(encodeURIComponent(this.mainFolder)));
			uploadController.getDefaultFileUploader().setMultiple(true);

			this.deleteImgContainer = [];
			this.addImgContainer = [];

/*************************
* 	TO BE IMPLEMENTED. 
*	CODE PULLS THE BASE 64 BLOB FROM THE IMAGES UPLOADED TO THE CONTROL.
*	MISSING TO SET THE THUMBNAIL, RESIZE AND OTHER ACTIONS THAT MIGHT BE REQUIRED.
*	THIS IS TO CHANGE THE CURRENT IMPLEMENTATION WHICH HITS THE SERVER EVERY TIME 
*	AN IMAGE IS ADDED TO THE CONTROL AND ONLY DO A SINGLE HIT WITH ALL IMAGES.
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
					orderController = this.getView().byId("imgorderlist");
					orderController.getModel().getData();
					this.addImgContainer.push(`${this.mainFolder}/${ev.getParameter("item").getFileName()}`);
				}.bind(this));
				
				uploadController.attachBeforeItemRemoved(function(ev) {
					console.log("item bout to be removed");
					console.log(ev.getParameter("item").getUrl());														

					//RELOAD ordercontroller and uploadcontroller and delete props
					this.deleteImages(ev.getParameter("item").getFileName())		

				}.bind(this));

				uploadController.attachBeforeItemAdded(function(ev) {
					console.log("iTEM BOUT TO BE ADDED");
					
					for (var i=0; i < this.publImg.pictures.length; i++) {
						
						if (this.publImg.pictures[i].filename == ev.getParameter("item").getFileName()) {
							
							sap.m.MessageBox.warning(`Otra imagen con este nombre ya existe: ${ev.getParameter("item").getFileName()}`, {
								actions: [sap.m.MessageBox.Action.CLOSE]
							});

							//Throws new error so the attachment of the file never occurs.
							throw new Error("Upload terminated due to duplicated name");
						}
					}

				}.bind(this));

				uploadController.attachBeforeUploadStarts(function(ev) {
					var oUploader = ev.getSource(),
						oItemName = ev.getParameter("item").getFileName(),
						oItemId = this.publImg.idnamematch[oItemName];

					
						if (!oUploader.getHeaderFields().length > 0) {
							this.headerFileName = new sap.ui.core.Item({id:"idFileNameHeader",key:"File-Name-Header",text:oItemName});
							oUploader.addHeaderField(this.headerFileName);

							this.headerFileOrder = new sap.ui.core.Item({id:"idFileOrderHeader",key:"File-Order-Header",text:this.orderCount+1});
							oUploader.addHeaderField(this.headerFileOrder);

							this.headerFileId = new sap.ui.core.Item({id:"idFileIDHeader",key:"File-ID-Header",text:oItemId});
							oUploader.addHeaderField(this.headerFileId);

							this.orderCount += 1;

						} else {
							this.headerFileName.setText(oItemName);

							this.headerFileOrder.setText(this.orderCount);
							this.orderCount += 1;

						}

					console.log(oUploader.getUploadUrl());
					console.log(oItemName);

				}.bind(this));
				
				uploadController.attachFileNameLengthExceeded(function(ev) {
					sap.m.MessageBox.warning("El nombre del archivo es demasiado largo.", {
						actions: [sap.m.MessageBox.Action.CLOSE]
					});
					
					var n = ev.getParameter("item").getFileName().split(".").splice(-1,1),
						newName = n.substring(0, 40);

					ev.getParameter("item").setFileName(newName);

				}.bind(this));
				
				uploadController.attachUploadCompleted(function(ev) {
					console.log("completed");
					
					this.uploadCounter += 1

					//Request images again if no items pending to be uploaded
					if (ev.getSource().getIncompleteItems().length==this.uploadCounter) {
						uploadController.removeAllIncompleteItems();

						this.uploadCounter = 0;

						var p = ImageRequestor.getImages(this.publicId);
						
						console.log("uploaded image");

						p.then(function() {
								this.setImgData(Object.assign({},JSON.parse(p.responseText)));
								
								//this.imageUploaderUpdate();
								this.reloadUploaderItems();	
								orderController.getModel().refresh();

								console.log("updated images");
							}.bind(this));
					}
				}.bind(this));
			
			
		},

		reloadUploaderItems : function() {
			//Reload the contents of the upload set controller

			var uploadController = this.getView().byId("uploadset"),
				orderController = this.getView().byId("imgorderlist"),
				itemSettings = {},
				uploadItem;

			this.currentImgItems = {};
			uploadController.destroyItems();
			uploadController.destroyIncompleteItems();

			for (var i = 0; i < this.publImg.pictures.length; i++) {
				itemSettings = {
					fileName: this.publImg.pictures[i].filename,
					mediaType: `image/${this.publImg.pictures[i].filetype}`,
					url: this.publImg.pictures[i].source,
					thumbnailUrl: this.publImg.pictures[i].source,
					uploadState: "Complete",
					enabledEdit: false,
					visibleEdit: false
				};
				
				uploadItem = new sap.m.upload.UploadSetItem(itemSettings);

				uploadController.addItem(uploadItem);
				this.publImg.idnamematch[this.publImg.pictures[i].filename] = this.publImg.pictures[i].id;				
			}

			//Reload Order Controller
			this.setOrderData();
			(orderController.getModel()) ? orderController.getModel().refresh() : orderController.setModel(this.imgModel);

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
		}

	});

	return CController;

});
