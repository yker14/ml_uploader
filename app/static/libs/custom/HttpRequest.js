sap.ui.define([
    "./Utilities"
], function (Utils) {
	"use strict";

	return {
        
        httpRequest: function (requestURL, requestType, requestHeaders) {

            /***
            * REQUEST HEADERS ARE EXPECTED TO COME WITH THE FORMAT
            * {'header1': 'header1 content',
            * 'header2': 'header2 content'} 
            ***/

            var resp = $.ajax({
                url: requestURL,
                datatype : "application/json",
                headers : requestHeaders,
                type: requestType,
                success: function(result) {
                    return result;
                },

                error: function(error) {
                    sap.m.MessageBox.warning("Ocurrio un error de conexion.\n"+JSON.stringify(error), {
                        actions: ["OK", sap.m.MessageBox.Action.CLOSE],
                        emphasizedAction: "OK"
                    });
                }
            });

            return resp;
        }
    };
});