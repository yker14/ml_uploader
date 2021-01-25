sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
    'sap/ui/core/UIComponent',
    'sap/m/library',
    'rshub/ui/libs/custom/Utilities',
    'rshub/ui/libs/custom/RouterContentHelper',
    'sap/ui/model/Filter',
	"sap/ui/model/FilterOperator"
], function (Controller, JSONModel, UIComponent, sapMLib, Utils, RouterContentHelper, Filter, FilterOperator) {
	"use strict";

	var CController = Controller.extend(Utils.nameSpaceHandler("view.Publicaciones"), {
        // Objects
        oPublTable: null,

        onInit : function() {
          
            var routeName = this.getOwnerComponent().getCurrentRoute();
            this.getOwnerComponent().getRouter().getRoute(routeName).attachMatched(this._onRouteMatched, this);

            this.oPublTable = this.getView().byId("urltable");

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
            
            /*
            var parameters = 
                {
                    "?search": {"publId": publId}
                };
            
            RouterContentHelper.navigateTo(this, "Publicacion", parameters)            
            */
            
            // To Open in a new tab            
            var url = window.location.origin + "#/publicacion/search?publId=" + publId;
            Utils.openURLInNewTab(url);
            
        },
        
        onSave: function(ev) {
            console.log("Info Saved")
        },

        filterPubl: function(ev) {
            
			// build filter array
            var aFilter = [];
            var oColumn = ev.getParameter("column");
            var sQuery = ev.getParameter("value");
            var sType = oColumn.getFilterType().getName();
            var sOperator = null;

            // set the operator based on the key
            if (sType == 'String') {
                sOperator = FilterOperator.Contains
            } else {
                sOperator = FilterOperator.EQ
            };

			if (sQuery) {
				aFilter.push(new Filter(sType, sOperator, sQuery));
			}
            
			// filter binding
			var oBinding = this.oPublTable.getBinding("rows");
            oBinding.filter(aFilter);
        },

		clearAllFilters : function(ev) {
            var aFilter = null;
            
            // Reset binding filter
            var oBinding = this.oPublTable.getBinding("rows");
            oBinding.filter(aFilter);

            // Reset every column filter
            var tableColumns = this.oPublTable.getColumns();

            for (var col=0; col < tableColumns.length; col++) {
                tableColumns[col].setFilterValue("");
                tableColumns[col].setFiltered(false);
            };
        }
    });
	return CController;

});
