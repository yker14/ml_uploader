sap.ui.define([
	'sap/ui/Device',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/Popover',
	'sap/m/Button',
	'sap/m/library'
], function (Device, Controller, JSONModel, Popover, Button, mobileLibrary) {
	"use strict";

	var CController = Controller.extend("rshub.ui.controller.Home", {
		
		storeUserConfig: null,
		
		onInit : function() {

			var routeName = this.getOwnerComponent().getCurrentRoute();
            this.getOwnerComponent().getRouter().getRoute(routeName).attachMatched(this._onRouteMatched, this);

			this.urlContainer = {"urls":[]};
			this.oModel = new JSONModel(this.urlContainer,true);
			this.getView().byId("urltable").setModel(this.oModel);

			//get sources for list
			this.oSourceList =  new JSONModel();
			this.oSourceList.loadData(sap.ui.require.toUrl("rshub/ui/model/") + "homedata.json", null, false);
			this.getView().byId("sourcelist").setModel(this.oSourceList);

		},

		_onRouteMatched: function() {
			let oStoreUsrConfig =  new JSONModel();
			oStoreUsrConfig.loadData(sap.ui.require.toUrl("rshub/ui/model/") + "storesettings.json", null, false);
			
			this.storeUserConfig = oStoreUsrConfig.getData(); 
		},
		
		onURLSave : function(ev) {

			var inputUrl = this.getView().byId("urlsinput"),
				newUrl = inputUrl.getValue();

			var sourceList = this.getView().byId("sourcelist"),
				sourceName = sourceList.getSelectedItem().getProperty("text");

			(newUrl!='' && newUrl.includes("http")) ? this.urlContainer["urls"].push({"url":newUrl,"source":sourceName, "status":"Not Scraped"}) : sap.m.MessageBox.alert("Inserta una URL valida.");
			this.getView().byId("urltable").getModel().updateBindings(true);
			inputUrl.setValue("");

		},

		removeSelection :  function(ev) {
			var urlTable = this.getView().byId("urltable"),
			selectedIndices = urlTable.getSelectedIndices(),
			itemRmvCount = 0;

			for (var i=0; i < selectedIndices.length; i++) {
				this.urlContainer["urls"].splice(selectedIndices[i]-itemRmvCount,1);
				itemRmvCount += 1;
			}
			this.getView().byId("urltable").getModel().updateBindings(true);
			urlTable.clearSelection();
		},


		scrapAllInit : function() {

			
			sap.m.MessageBox.warning("Se extraera la informacion de todas las URLs de la tabla. ¿Desea continuar?", {
				actions: ["Aceptar", sap.m.MessageBox.Action.CLOSE],
				emphasizedAction: sap.m.MessageBox.Action.CLOSE,
				onClose: function (sAction) {
					
					if (sAction=="Aceptar") {
						var urlTable = this.getView().byId("urltable");

						var items = {"urls": urlTable.getModel().getData().urls},
							items = JSON.stringify(items);
						
						var resp = $.ajax({
							url: '/urlload',
							type: "POST",
							datatype : "application/json",
							data: items,
							success: function(result) {
									return result;
							},

							error: function(error) {
								//CONNECTION ERROR HANDLING
								sap.m.MessageBox.warning("Ocurrio un error de conexion.\n"+JSON.stringify(error), {
									actions: [sap.m.MessageBox.Action.CLOSE]
								});
							}
						});

						resp.then(function() {
								sap.m.MessageBox.success("URLs procesadas correctamente.\n"+resp.responseText);

								var data = JSON.parse(resp.responseText);
								this.urlContainer["urls"] = data["urls"];
								urlTable.getModel().updateBindings(true);
						}.bind(this));
					}

				}.bind(this)
			})
		},
/*
		scrapSelectedInit : function() {

			var items = {"urls": []},
				urlTable = this.getView().byId("urltable"),
				indexList = urlTable.getSelectedIndices();

			console.log("Scrapping initiated");

			if (indexList.length == 0) {
				sap.m.MessageBox.alert("Selecciona URLs para iniciar el scrap.");

			} else {

				indexList.forEach((item, i) => {
					items['urls'].push(urlTable.getModel().getData().urls[item]);
				});

                items = JSON.stringify(items);
                
				var resp = $.ajax({
						url: '/urlload',
						type: "POST",
						data: items,
						success: function(result) {
								return result;
						},

						error: function(error) {
								console.log(error);
								return error;
						}
				});

				resp.then(function() {
					console.log(resp.responseText);
					data = JSON.parse(resp.responseText);
					this.urlContainer =
					this.oModel = new JSONModel(data, true);

					Promise.all([this.oModel]).then(function(values){
						urlTable.setModel(values[0]);
						urlTable.getModel().updateBindings(true);
					}.bind(this))

				}.bind(this));
			}
		}
*/

	onConfigPress: function() {

		if (!this.oSettingDialog) {
					
			this.oSettingDialog = new Dialog({
				title: "Categorias",
				contentWidth: "90%",
				contentHeight: "50%",
				buttons: [
					new sap.m.Button("settingSave", {
						enabled: false,
						text: "Guardar",
						press: this.goPrevCategory.bind(this)
					}),
					new sap.m.Button("catClose", {
						text: "Cerrar",
						press: function () {
							this.oSettingDialogs.getSubHeader().destroyContent()
							this.oSettingDialog.close();
						}.bind(this)
					}),
					new sap.m.Button("catSave", {
						text: "Guardar Categoria", 
						press: this.onSaveCategoryPress.bind(this), 
						enabled: false
					})]
				});

			//to get access to the controller's model
			this.getView().addDependent(this.oSettingDialog);
			this.oSettingDialog.addContent(categoryList);
			this.oSettingDialog.open();
		} else {

			this.oSettingDialog.destroyContent();
			this.oSettingDialog.addContent(categoryList);

			if (!skipReCreation) {
				this.oSettingDialog.open();	
			}

			sap.ui.getCore().byId("catBack").setVisible(false);
		}
	}

	});

	return CController;
});
