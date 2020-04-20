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

	var CController = Controller.extend("rshub.ui.view.Publicaciones", {
		onInit : function() {
          
          this.oModel = null;
          var publData = null;
          var publDataPath = null;
        
          //Get published items from database
/*    
          var resp = $.ajax({
              url: '/getpubl',
              type: "GET",
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
            publData = JSON.parse(resp.responseText);
            this.oModel = new JSONModel(publData, true);
          }.bind(this));
*/
            
          //MOCK DATA
          publDataPath= sap.ui.require.toUrl("rshub/ui/model/publicacionesdata.json");
          this.oModel = new JSONModel(publDataPath, true);
          //

          //Set the tables data to display
          Promise.all([this.oModel]).then(function(values){
            this.getView().byId("urltable").setModel(values[0]);
            this.getView().byId("urltable").getModel().updateBindings(true);
          }.bind(this))

        },
        
        onDetailViewPress: function() {
            var oView = this.getView(),
                oController = this.getView().getController();
            
            Fragment.load({
                id: oView.getId(),
                controller: oController,
                name: "rshub.ui.view.dialogs.Publicacion"
            }).then(function (oDialog) {
                // connect dialog to the root view of this component (models, lifecycle)
                oView.addDependent(oDialog);
                oDialog.open();
            });
        },
        
        onDialogClose: function(ev) {
            this.getView().byId("publDialog").close()
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
