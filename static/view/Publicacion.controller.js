sap.ui.define([
	'sap/ui/Device',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/Popover',
	'sap/m/Button',
	'sap/m/library',
    'sap/ui/core/Fragment'
], function (Device, Controller, JSONModel, Popover, Button, mobileLibrary, Fragment) {
	"use strict";

	var CController = Controller.extend("rshub.ui.view.Publicacion", {
		onInit : function() {
            console.log("publicacion initiated");
        },
        
        onDialogClose: function(ev) {
            this.getView().byId("publDialog").close();
        },
        
        onPublClose: function(ev) {
            ev.getSource().destroy(); 
        },
        
        onSave: function(ev) {
            console.log("Info Saved")
        }
        
	});

	return CController;

});
