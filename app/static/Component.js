sap.ui.define(['sap/ui/core/UIComponent',
               './libs/custom/Utilities'
              ],
function (UIComponent, Utils) {
	"use strict";

  return UIComponent.extend(Utils.nameSpaceHandler("Component"), {
		metadata: {
			manifest: "json",
      properties: {
        "currentRouteName": {}, // default type == "string"
        "rootView": {} 
      }
		},

    init: function () {
        // call the init function of the parent
        UIComponent.prototype.init.apply(this, arguments);
        this.getRouter().attachBeforeRouteMatched(this.onBeforeRouteMatched, this);
        this.getRouter().attachRouteMatched(this.onRouteMatched, this)

        // create the views based on the url/hash
        this.getRouter().initialize();
    },

    onBeforeRouteMatched: function(event) { // beforeRouteMatched available since 1.46.1
      this.setCurrentRouteName(event.getParameter("name"));
    },

    onRouteMatched: function (ev) {
      sap.ui.core.BusyIndicator.show()
      setTimeout(function(){console.log('waiting 3 secs')}, 3000)
      this.setRootView(ev.getParameters().targetControl.getId());
    },

    getCurrentRoute: function() {
      //getCurrentRouteName retrieves from metadata
      return this.getCurrentRouteName();
    },

    getORootView: function() {
      //getRootView retrieves from metadata
      return this.getRootView();
    }

	});
});
