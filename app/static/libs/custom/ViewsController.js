sap.ui.define([
	"./Utilities",
    "./ViewsController"
], function (Utils) {
	"use strict";

	// class providing static utility methods.

	return {

        viewCreate: function (viewName, oController=null) { //controller should contain the constructor
                
            var oModel = new sap.ui.model.json.JSONModel();
            
                oModel.loadData(sap.ui.require.toUrl(Utils.nameSpaceHandler("model/","url")) + "/pages.json", null, false);
            
            var data = oModel.getData().views[viewName],
                viewType = data.viewtype,
                viewId = data.id;
            
            //checks if controller was passed
            if (oController == null) {
                oController= sap.ui.controller(Utils.nameSpaceHandler(data.controllerName));
            }
            
            if (viewType == "fragment") {
                    
                var viewPath = Utils.nameSpaceHandler(data.viewName),
                oView = sap.ui.core.Fragment.load({ name: viewPath,
                                        controller: oController,
                                        type: data.type});
                
                return oView;
                
            } else if (viewType == "view") {
                
            }
        }
    };
});