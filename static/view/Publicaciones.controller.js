sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
    'sap/ui/core/UIComponent',
    'sap/m/library',
    'rshub/ui/libs/custom/Utilities',
    'rshub/ui/libs/custom/RouterContentHelper'
], function (Controller, JSONModel, UIComponent, sapMLib, Utils, RouterContentHelper) {
	"use strict";

	var CController = Controller.extend(Utils.nameSpaceHandler("view.Publicaciones"), {
		onInit : function() {
          
            var routeName = this.getOwnerComponent().getCurrentRoute();
            this.getOwnerComponent().getRouter().getRoute(routeName).attachMatched(this._onRouteMatched, this);

            this.refreshPublData();
        },

        _onRouteMatched: function() {
            
        },

        refreshPublData: function () {
            this.oModel = null;
            var publData = null;
            var publDataPath = null;
        
          //Get published items from database   
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

            
            //Set the tables data to display
            Promise.all([this.oModel]).then(function(values){
                this.getView().byId("urltable").setModel(values[0]);
                this.getView().byId("urltable").getModel().updateBindings(true);
            }.bind(this))

          }.bind(this));


/*
            //MOCK DATA
            publDataPath= sap.ui.require.toUrl("rshub/ui/model/publicacionesdata.json");
            this.oModel = new JSONModel(publDataPath, true);

            Promise.all([this.oModel]).then(function(values){
                this.getView().byId("urltable").setModel(values[0]);
                this.getView().byId("urltable").getModel().updateBindings(true);
            }.bind(this))
            //
*/
        },

        onDetailViewPress: function(ev) {
    
            var publId = ev.getSource().getParent().getCells()[0].getText();
            var parameters = 
                {
                    "parameterName1": "parameterValue1",
                    "?search": {"publId": publId}
                };

            RouterContentHelper.navigateTo(this, "Publicacion", parameters)            
        },
        
        onSave: function(ev) {
            console.log("Info Saved")
        }
        
	});

	return CController;

});
