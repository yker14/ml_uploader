sap.ui.define([
    "./Utilities"
], function (Utils) {
	"use strict";

	return {

        //REturns a promise that resolves into the images list
        getImages : function(publId) {
            // Request publication images

            var imgResp = $.ajax({
                url: '/publicaciones/images/request/'+publId,
                datatype : "application/json",
                type: "GET",
                success: function(result) {
                    return result;
                },

                error: function(error) {
                    sap.m.MessageBox.warning("Ocurrio un error de conexion.\n" + JSON.stringify(error), {
                        actions: ["OK", sap.m.MessageBox.Action.CLOSE],
                        emphasizedAction: "OK"
                    });
                }
            });

            return imgResp;
        }
    };
});
