/*
*   Socrata SQL API handler
*   Custom functions to handle calls to Socrata API that contains Colombia Open Source data.
*
*   Socrata API Doc: https://dev.socrata.com/docs/endpoints.html
*   Colombia Dane Geo Structure Data: https://www.datos.gov.co/en/Mapas-Nacionales/Departamentos-y-municipios-de-Colombia/xdk5-pm3f/data
*
*/

sap.ui.define([
	"./SoSQLAPI"
], function () {
	"use strict";

	// class providing static utility methods.

	return {

        getStates: function (country='colombia') {

            try {
                if (country=='colombia') {

                    var uri='?$query=select departamento as state,c_digo_dane_del_departamento as id group by departamento,c_digo_dane_del_departamento order by departamento ASC'
                    var url='https://www.datos.gov.co/resource/xdk5-pm3f.json' + uri;

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
                }

            } catch(e) {
                console.log(e);
            }
        },

        getCities: function (stateId) {

            try {

                var uri='?$query= select municipio as city,c_digo_dane_del_municipio as id where c_digo_dane_del_departamento='+stateId+' order by municipio ASC';
                var url='https://www.datos.gov.co/resource/xdk5-pm3f.json' + uri;

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
