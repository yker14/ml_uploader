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
		onInit : function() {
			//this.urlContainer = {"urls":[{"url":"google.com","source":"Amazon","status":"Not Scraped"}]};
			this.urlContainer = {"urls":[]};
			this.oModel = new JSONModel(this.urlContainer,true);
			this.getView().byId("urltable").setModel(this.oModel);

			//get sources for lsit
			this.oSourceList =  new JSONModel();
			this.oSourceList.loadData(sap.ui.require.toUrl("rshub/ui/model/") + "homedata.json", null, false);
			this.getView().byId("sourcelist").setModel(this.oSourceList);

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

			var items = {"urls": this.getView().byId("urltable").getModel().getData().urls};
			console.log("Scrapping initiated");

            items = JSON.stringify(items);
            
			var resp = $.ajax({
					url: '/test',
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

			resp.then(function() {console.log(resp.responseText)});

		},

		scrapSelectedInit : function() {

			var items = {"urls": []};
			console.log("Scrapping initiated");

			var indexList = this.getView().byId("urltable").getSelectedIndices();

			if (indexList.length == 0) {
				sap.m.MessageBox.alert("Selecciona URLs para iniciar el scrap.");

			} else {

				indexList.forEach((item, i) => {
					items['urls'].push(this.getView().byId("urltable").getModel().getData().urls[item]);
				});

                items = JSON.stringify(items);
                
				var resp = $.ajax({
						url: '/test',
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

				resp.then(function() {console.log(resp.responseText)});

			}
		}
	});

	return CController;
});
