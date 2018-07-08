sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"my/sapui5_components_library/sap/ui5/ODataModelExt",
	"sap/ui/Device"
], function(JSONModel, ODataModelExt, Device) {
	"use strict";

	return {

		createDeviceModel: function() {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createODataModel: function(bIsMobileDevice) {
			if (bIsMobileDevice) {
				return null;
			} else {
				return new ODataModelExt(
					"/odata", {
						json: true,
						useBatch: false,
						defaultBindingMode: sap.ui.model.BindingMode.TwoWay,
						defaultUpdateMethod: sap.ui.model.odata.UpdateMethod.Put,
						loadMetadataAsync: true,
						tokenHandling: true
					}
				);
			}
		}

	};
});