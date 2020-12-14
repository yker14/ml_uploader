sap.ui.define([
	'sap/ui/core/mvc/Controller',
    'sap/m/library',
    'rshub/ui/libs/custom/Utilities'
], function (Controller, sapMLib, Utils) {
	"use strict";

	var CController = Controller.extend(Utils.nameSpaceHandler("view.dialogs.BusyIndicator"), {
		onInit : function() {

        },
	});

	return CController;

});
