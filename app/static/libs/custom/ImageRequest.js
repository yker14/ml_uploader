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
                datatype :'application/json',
                type: 'GET',
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
        },

        getReader : function(file) {

            var reader = new FileReader();
					
            reader.onerror = function (e) {
                sap.m.MessageBox.warning("Error al leer la imagen.\n" + JSON.stringify(e), {
                    actions: [sap.m.MessageBox.Action.CLOSE]
                });
            };

            reader.onloadend = function() {
                var tempImg = new Image();
                tempImg.src = reader.result;
                tempImg.onload = function() {
                    
                    var dataURL = tempImg.src;
                    var BASE64_MARKER = 'data:' + file.type + ';base64,';
                    var base64Index = dataURL.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
                    var base64string = dataURL.split(",")[1];

                    console.log(base64string);
                    return base64string;
                }
            };

            reader.readAsDataURL(file);

            return reader;
        },


    };
});
