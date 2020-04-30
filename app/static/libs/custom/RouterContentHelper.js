sap.ui.define([
    "./Utilities",
    "./RouterContentHelper",
    "sap/ui/core/UIComponent",
    "sap/ui/core/routing/History"
], function (Utils, RouterContentHelper, UIComponent, History) {
	"use strict";

	// class providing navigation standardization methods.

	return {

        navigateTo : function(context=this, routeName='NoPage', urlParams=null, componentTargetParam=null, bReplace=false) {
            
            var contextRouter = UIComponent.getRouterFor(context);

            if (urlParams == null ) {
                sap.ui.getCore().byId(context.getOwnerComponent().getORootView()).removeAllContent();
                contextRouter.navTo(routeName, urlParams, componentTargetParam, bReplace);
            } else {
                sap.ui.getCore().byId(context.getOwnerComponent().getORootView()).removeAllContent();
                contextRouter.navTo(routeName, urlParams, componentTargetParam, bReplace);
            }
        }
    };
});
