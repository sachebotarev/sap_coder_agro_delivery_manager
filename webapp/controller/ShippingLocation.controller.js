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
], function(Controller, ODataModel, CameraFunctions, FileSystemFunctions, FileReaderFunctions, JSONModel, YandexMap,
	TransportationMapViewBuilder, formatter, planningCalendarFunctions, MapPlacemark, PlacemarkDetail) {
	"use strict";

	return Controller.extend("my.sap_coder_agro_delivery_manager.controller.ShippingLocation", {
		formatter: formatter,
		onInit: function() {
			this._oODataModel = this.getOwnerComponent().getModel();

			this._sShippingLocationPath = undefined;
			this._oScreenModel = new JSONModel({
				ShippingLocation: {

				},
				Timeline: {

				}
			});
			this.getView().setModel(this._oScreenModel);
			this.getOwnerComponent().getRouter().getRoute("ShippingLocation").attachPatternMatched(this.onRouterObjectMatched, this);

			/*this._oYandexMapApiInitialized = $.Deferred();
			this._oYandexMap = new YandexMap(this.byId("yandexMapShippingLocationId").getId());
			this._oYandexMap.createMapControl()
				.then(() => {
					this.buildMap();
					this._oYandexMapApiInitialized.resolve(this._oYandexMap);
				});*/
		},
		buildMap: function() {
			this._oYandexMap.init({
				oParams: {
					sCenterProperty: "GeoLocation",
					aPlacemarks: [
						new MapPlacemark({
							oMapControl: this._oYandexMap,
							oParams: {
								sGeoLocationProperty: "GeoLocation",
								sIcon: "images/warehouse.png",
								aRightDetails: [new PlacemarkDetail({
									oParams: {
										sIcon: "images/checked.png",
										sIconWidth: "10px",
										sIconHeight: "10px"
									}
								})]
							}
						})
					]
				}
			});
		},
		onNavBack: function() {
			history.go(-1);
		},
		onRouterObjectMatched: function(oEvent) {
			let sObjectPath = oEvent.getParameter("arguments").sObjectPath;
			if (sObjectPath && sObjectPath !== "") {
				this._sShippingLocationPath = "/" + sObjectPath;
				/*this._oYandexMapApiInitialized
					.done(() => this._oYandexMap.bindElement(new sap.ui.model.Context(this._oScreenModel, "/ShippingLocation")));*/
				this.refreshScreenModel();
			}
		},
		refreshScreenModel: function() {
			this._oODataModel.readPromise(this._sShippingLocationPath, {
					urlParameters: {
						'$expand': `TransportationDetails,TransportationDetails/TruckDetails,TransportationDetails/TruckDetails/CarrierDetails,TransportationDetails/ShippingLocationDetails,TransportationDetails/ShippingLocationDetails1,
									TransportationDetails1,TransportationDetails1/TruckDetails,TransportationDetails1/TruckDetails/CarrierDetails,TransportationDetails1/ShippingLocationDetails,TransportationDetails1/ShippingLocationDetails1,
									RoadEventDetails`
					}
				})
				.then(oShippingLocation => {
					let oTimeline = {};
					if (oShippingLocation.LocationType === 'STORAGE') {
						oShippingLocation.Transportations = oShippingLocation.TransportationDetails1.results;
						oTimeline = planningCalendarFunctions.convertTranportations(oShippingLocation.TransportationDetails1.results);
						oTimeline.rows.forEach(row => row.appointments = row.appointments.filter(appointment => appointment.type === 'Type07'));
					} else {
						oShippingLocation.Transportations = oShippingLocation.TransportationDetails.results;
						oTimeline = planningCalendarFunctions.convertTranportations(oShippingLocation.TransportationDetails.results);
						oTimeline.rows.forEach(row => row.appointments = row.appointments.filter(appointment => appointment.type === 'Type04'));
					}
					this._oScreenModel.setProperty("/ShippingLocation", oShippingLocation);
					this._oScreenModel.setProperty("/Timeline", oTimeline);
					this._oODataModel.readPromise("/RoadEvents", {
							urlParameters: {
								'$filter': "ShippingLocation eq '" + oShippingLocation.ShippingLocationKey + "'"
							}
						})
						.then(oRoadEventDetails => {
							this._oScreenModel.setProperty("/ShippingLocation/RoadEventDetails", oRoadEventDetails.results);
							this._oScreenModel.setProperty("/ShippingLocation/RoadEventCount", oRoadEventDetails.results.length);
							oRoadEventDetails.results.forEach((oRoadEvent, iIndex) =>
								this._oODataModel.readPromise("/MediaResources", {
									urlParameters: {
										'$filter': "MediaResourceUuid eq '" + oRoadEvent.MediaResource + "'"
									}
								})
								.then(oMediaResourceDetails => {
									debugger;
									this._oScreenModel.setProperty("/ShippingLocation/RoadEventDetails/" + iIndex + "/MediaResourceDetails",
										oMediaResourceDetails.results[0])
									this._oScreenModel.setProperty("/ShippingLocation/RoadEventDetails/" + iIndex + "/MediaResourceDetails/__metadata/media_src",
										"/odata/" +
										oMediaResourceDetails.results[0].__metadata.media_src.split("/").reverse()[1] + "/" +
										oMediaResourceDetails.results[0].__metadata.media_src.split("/").reverse()[0]
									)
								}
								)
							);
						});
				});
		}
	});
});