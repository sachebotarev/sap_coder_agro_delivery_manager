sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/pepsico/core/sap/ui/model/odata/v2/ODataModel",
	"com/pepsico/core/cordova/camera/CameraFunctions",
	"com/pepsico/core/cordova/file/FileSystemFunctions",
	"com/pepsico/core/web/file/FileReader/FileReaderFunctions",
	"sap/ui/model/json/JSONModel",
	"my/sapui5_components_library/yandex/maps/YandexMap",
	"my/sap_coder_agro_delivery_manager/view/TransportationMapViewBuilder",
	"my/sap_coder_agro_delivery_manager/model/formatter",
	"my/sap_coder_agro_delivery_manager/model/PlanningCalendarFunctions",
	"my/sapui5_components_library/yandex/maps/MapPlacemark",
	"my/sapui5_components_library/yandex/maps/PlacemarkDetail",
], function (Controller, ODataModel, CameraFunctions, FileSystemFunctions, FileReaderFunctions, JSONModel, YandexMap,
	TransportationMapViewBuilder, formatter, planningCalendarFunctions, MapPlacemark, PlacemarkDetail) {
	"use strict";
	/*eslint-env es6*/

	return Controller.extend("my.sap_coder_agro_delivery_manager.controller.Truck", {
		formatter: formatter,

		onInit: function () {
			this._oODataModel = this.getOwnerComponent().getModel();
			this._sTruckPath = undefined;
			this._oScreenModel = new JSONModel({
				Truck: {
				},
				Timeline: {
				}
			});
			this.getView().setModel(this._oScreenModel);
			this.getOwnerComponent().getRouter().getRoute("Truck").attachPatternMatched(this.onRouterObjectMatched, this);
		},
		onNavBack: function() {
			history.go(-1);
		},
		onRouterObjectMatched: function (oEvent) {
			let sObjectPath = oEvent.getParameter("arguments").sObjectPath;
			if (sObjectPath && sObjectPath !== "") {
				this._sTruckPath = "/" + sObjectPath;
				this.refreshScreenModel();
			}
		},
		refreshScreenModel: function() {
			this._oODataModel.readPromise(this._sTruckPath, {
					urlParameters: {
						'$expand': `CarrierDetails,TransportationDetails,TransportationDetails/TruckDetails,TransportationDetails/TruckDetails/CarrierDetails,TransportationDetails/ShippingLocationDetails,TransportationDetails/ShippingLocationDetails1`
					}
				})
				.then(oTruck => {
					this._oScreenModel.setProperty("/Truck", oTruck);
					let oTimeline = planningCalendarFunctions.convertTranportations(oTruck.TransportationDetails.results);
					this._oScreenModel.setProperty("/Timeline", oTimeline);
				});
		}
	});
});