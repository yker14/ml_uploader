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
                    sap.m.MessageBox.error("Ocurrio un error.\n"+JSON.stringify(error), {
                        actions: ["OK", sap.m.MessageBox.Action.CLOSE],
                        emphasizedAction: "OK"
                    });
                }
            });

            return resp;
        },

        httpSubmitData: function (requestURL, requestType, requestHeaders, parameters) {

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
                data: {user: "yuseff"},
                success: function(result) {
                    return result;
                },

                error: function(error) {
                    sap.m.MessageBox.error("Ocurrio un error.\n"+JSON.stringify(error), {
                        actions: ["OK", sap.m.MessageBox.Action.CLOSE],
                        emphasizedAction: "OK"
                    });
                }
            });

            return resp;
        }
    };
});