sap.ui.define(['sap/ui/core/UIComponent',
               './libs/custom/Utilities'],
function (UIComponent, Utils) {
	"use strict";

  return UIComponent.extend(Utils.nameSpaceHandler("Component"), {
		metadata: {
			manifest: "json",
      properties: {
        "currentRouteName": {} // default type == "string"
      }
		},

    init: function () {
        // call the init function of the parent
        UIComponent.prototype.init.apply(this, arguments);
        this.getRouter().attachBeforeRouteMatched(this.onBeforeRouteMatched, this);

        // create the views based on the url/hash
        this.getRouter().initialize();
    },

    onBeforeRouteMatched: function(event) { // beforeRouteMatched available since 1.46.1
      this.setCurrentRouteName(event.getParameter("name"));
    },

    getCurrentRoute: function() {
      //return this.getRouter().getRoute(this.getCurrentRouteName());
      return this.getCurrentRouteName();
    },
	});
});
