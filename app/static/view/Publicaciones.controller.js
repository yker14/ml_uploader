sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
    'sap/ui/core/UIComponent',
    'sap/m/library',
    'rshub/ui/libs/custom/Utilities',
    'rshub/ui/libs/custom/RouterContentHelper',
    'rshub/ui/libs/custom/BusyIndicator',
], function (Controller, JSONModel, UIComponent, sapMLib, Utils, RouterContentHelper,BusyIndicator) {
	"use strict";

	var CController = Controller.extend(Utils.nameSpaceHandler("view.Publicaciones"), {
		onInit : function() {
            this.facetFilter = this.getView().byId("idFacetFilter");

            var routeName = this.getOwnerComponent().getCurrentRoute();
            this.getOwnerComponent().getRouter().getRoute(routeName).attachMatched(this._onRouteMatched, this);

            // Enable busy indicator to indicate loading
            BusyIndicator.showBusyIndicator(this);
            this.refreshPublData();   
        },

        _onRouteMatched: function() {
            
        },

        onAfterRendering: function() {
            sap.ui.core.BusyIndicator.hide();
        },

        refreshPublData: function () {
            this.oModel = null;
            var publData = null;
            var publDataPath = null;
     
          //Get published items from database   
          var resp = $.ajax({
              url: '/getpubl',
              datatype : "application/json",
              type: "GET",
              success: function(result) {
                  return result;
              },

              error: function(error) {
                sap.m.MessageBox.warning("Ocurrio un error de conexion.\n"+JSON.stringify(error), {
                    actions: [sap.m.MessageBox.Action.CLOSE],
                });
              }
          });
          
          resp.then(function() {
            publData = JSON.parse(resp.responseText);
            this.oModel = new JSONModel(publData, true);

            //Set the tables data to display
            Promise.all([this.oModel]).then(function(values){
                this.getView().byId("urltable").setModel(values[0]);
                this.getView().byId("urltable").getModel().updateBindings(true);
            }.bind(this))

          }.bind(this));
        },


        onDetailViewPress: function(ev) {
            
            var publId = ev.getSource().getParent().getCells()[0].getText();
            var parameters = 
                {
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
