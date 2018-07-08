//jQuery.sap.registerModulePath("my.sapui5_components_library", "https://rawgit.com/ysokol/my_sapui5_components_library/master/src/");
jQuery.sap.registerModulePath("my.sapui5_components_library", "https://raw.githubusercontent.com/ysokol/my_sapui5_components_library/master/src/");
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"my/sap_coder_agro_delivery_manager/model/models",
	"my/sapui5_components_library/exception/MyException"
], function(UIComponent, Device, models, MyException) {
	"use strict";

	return UIComponent.extend("my.sap_coder_agro_delivery_manager.Component", {

		metadata: {
			manifest: "json"
		},

		init: function() {
			
			window.onerror = function(msg, url, line, col, error) {
				alert(msg);
			};
			window.addEventListener('unhandledrejection', function(event) {
				throw new MyException("Unhandled Rejection", "N/A", event);
			});
			
			UIComponent.prototype.init.apply(this, arguments);

			this.setModel(models.createDeviceModel(), "device");
			this.setModel(models.createODataModel(false));
			
			this.getRouter().initialize();
		}
	});
});