sap.ui.define([
    "./Utilities"
], function (Utils) {
	"use strict";

	return {
        
        httpRequest: function (requestURL, requestType) {
            var resp = $.ajax({
                url: requestURL,
                datatype : "application/json",
                type: requestType,
                success: function(result) {
                    return result;
                },

                error: function(error) {
                    sap.m.MessageBox.warning("Ocurrio un error de conexion.\n"+error, {
                        actions: ["OK", sap.m.MessageBox.Action.CLOSE],
                        emphasizedAction: "OK"
                    });
                }
            });

            return resp;
        }
    };
});