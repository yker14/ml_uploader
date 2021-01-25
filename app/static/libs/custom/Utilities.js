sap.ui.define([
	"./Utilities"
], function () {
	"use strict";

	// class providing static utility methods.

	return {
		
		openURLInNewTab: function openInNewTab(url) {
			var win = window.open(url, '_blank');
			window.focus();
		},

		predicateBy: function (prop){
			return function(a,b){
			   if (a[prop] > b[prop]){
				   return 1;
			   } else if(a[prop] < b[prop]){
				   return -1;
			   }
			   return 0;
			}
		 },

        nameSpaceHandler: function (objname, formAs="method") {

            if (formAs == "method") {

                return "rshub.ui." + objname;

            } else if (formAs == "url") {

                return "rshub/ui/" + objname;
            }
        },

        emptyCheck: function (input) {

          var output = null;

          (input == undefined ||
          input == null) ? output = true : output = false;

          return output;
		},

		miscCount: function (maxResult, nameOfProp, minResult=0, finalText='', charAppend='', desc=false) {

				try {
					var num, name, count, data;

					//(typeof(maxResult) != "number"
					//|| maxResult == undefined) ? new Error("Input 'maxResult' is not a number.") : num = maxResult,

					if (typeof(maxResult) != "number" || maxResult == undefined) {
						throw new Error("Input 'maxResult' is not a number.");
					} else {
						num = maxResult;
					}


					if (nameOfProp == undefined || nameOfProp == null || nameOfProp == '' ) {
						throw new Error("Input 'nameOfProp' is not vallid.");
					} else {
						name = nameOfProp;
					}

					data = {};
					data[nameOfProp] = [];
					count = 0;

					for (var i = minResult; i < maxResult; i++) {
						count += 1;
						var val = desc ? maxResult - count : i;

						val += (i+1 >= maxResult) ? (' '+charAppend+' '+finalText) : (' '+charAppend);
						data[nameOfProp].push({"id": count,"value": val.trim()});
					}

					return data

				} catch(e) {
					console.log("Error at Utils.miscCount");
					console.log(e);
					return null
				}
		}
    };
});
