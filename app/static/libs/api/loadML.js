sap.ui.define([
	"./loadML"
], function () {
	"use strict";

	// class providing static utility methods.

	return {

        getCategories: function () {

            try {
                    // URL to get Colombia category
                    var url = 'https://api.mercadolibre.com/sites/MCO/categories';

                    return $.ajax({
	                    url: url,
	                    type: "GET",
	                    success: function(result) {
	                        return result;
	                    },

	                    error: function(error) {
	                        console.log(error);
	                        return error;
	                    }
                    });
                    
            } catch(e) {
                console.log(e);
            }
        },

        getChildCategory: function (categoryId='') {

            try {
                var url = 'https://api.mercadolibre.com/categories/' + categoryId;

                return $.ajax({
                    url: url,
                    type: "GET",
                    success: function(result) {
                        return result;
                    },

                    error: function(error) {
                        console.log(error);
                        return error;
                    }
                });
                
            } catch(e) {
                console.log(e);
            }
        }
    }
});
