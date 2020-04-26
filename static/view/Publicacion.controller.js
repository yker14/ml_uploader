sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
    'rshub/ui/libs/custom/Utilities',
    'sap/ui/core/UIComponent',
    'sap/base/security/encodeURL'
], function (Controller, JSONModel, Utils, UIComponent, EncodeURL) {
	"use strict";

	var CController = Controller.extend("rshub.ui.view.Publicacion", {
		onInit : function() {

            console.log("publicacion initiated");
            
            var routeName = this.getOwnerComponent().getCurrentRoute();
            this.getOwnerComponent().getRouter().getRoute(routeName).attachMatched(this._onRouteMatched, this);
        },
        
        _onRouteMatched: function(ev) {
            console.log("publicacion pattern matched")

            var currentURL = new URL(window.location.href.replace("/#","")),
            urlParams = new URLSearchParams(currentURL.search),
            publId = urlParams.get("publId");
        
            console.log(publId);

            var resp = $.ajax({
                url: '/getpubl',
                type: "GET",
                success: function(result) {
                    return result;
                },

                error: function(error) {
                    console.log({"error": error});
                    return error;
                }
            });
            
            resp.then(function() {
                publData = JSON.parse(resp.responseText);
            }.bind(this));
        },
        
        onSave: function(ev) {
            console.log("Info Saved")
        }
        
	});

	return CController;

});
