sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";
	/*eslint-env es6*/

	return Controller.extend("my.sap_coder_agro_delivery_manager.controller.TransportationList", {
		onInit: function() {
		},
		
		onTransportationDetailsNav: function(oEvent) {
			let sObjectPath = oEvent.getSource().getBindingContext().getPath().substring(1);
			this.getOwnerComponent().getRouter().navTo("Transportation", {
				sObjectPath: sObjectPath
			});
		}
	});
});