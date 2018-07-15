sap.ui.define([
	"sap/ui/base/Object",
	"my/sapui5_components_library/yandex/maps/YandexMap",
	"my/sapui5_components_library/yandex/maps/MapPlacemark",
	"my/sapui5_components_library/yandex/maps/PlacemarkDetail",
	"my/sapui5_components_library/yandex/maps/PlacemarkAction",
	"my/sapui5_components_library/yandex/maps/MapPlacemarkCollection",
	"my/sapui5_components_library/yandex/maps/MapRoute"
], function (Object, YandexMap, MapPlacemark, PlacemarkDetail, PlacemarkAction, MapPlacemarkCollection, MapRoute) {
	"use strict";
	/*eslint-env es6*/
	/*global ymaps*/

	// https://tech.yandex.ru/maps/jsbox/2.1/object_manager_spatial
	return Object.extend("my.sap_coder_agro_delivery_manager.view.TransportationMapViewBuilder", {
		constructor: function (oYandexMap, oController) {
			Object.apply(this);
			this._oYandexMap = oYandexMap;
			this._oController = oController;
		},
		buildMapView: function () {
			this._oYandexMap.init({
				//oContext: new sap.ui.model.Context(this._oODataModel, this._sTransportationPath),
				//sMapControlId: this._sMapControlId,
				oParams: {
					sCenterProperty: "ShippingLocationDetails/GeoLocation",
					aPlacemarks: [this.createShipFromPlacemark()],
					aPlacemarkCollections: [
						this.createTruckPlacemarkCollection(),
						this.createShipToPlacemarkCollection()
					],
					aRoutes: this.createRoutes()
				}
			});
		},
		createRoutes: function () {
			return [
				new MapRoute({
					oMapControl: this._oYandexMap,
					//oContext: new sap.ui.model.Context(this._oODataModel, this._sTransportationPath),
					oParams: {
						sFromProperty: "TruckDetails/GeoLocation",
						sToProperty: "ShippingLocationDetails/GeoLocation",
						sColor: "#696969",
						sActiveColor: "#696969"
					}
				}),
				new MapRoute({
					oMapControl: this._oYandexMap,
					//oContext: new sap.ui.model.Context(this._oODataModel, this._sTransportationPath),
					oParams: {
						sFromProperty: "ShippingLocationDetails/GeoLocation",
						sToProperty: "ShippingLocationDetails1/GeoLocation",
						sColor: "#00008B",
						sActiveColor: "#00008B"
					}
				})
			];
		},
		createShipFromPlacemark: function () {
			return new MapPlacemark({
				oMapControl: this._oYandexMap,
				//oContext: new sap.ui.model.Context(this._oODataModel, this._sTransportationPath),
				oParams: {
					sGeoLocationProperty: "ShippingLocationDetails/GeoLocation",
					sIcon: "images/farm.png",
					aBottomDetails: [new PlacemarkDetail({
						//oContext: new sap.ui.model.Context(this._oODataModel, this._sTransportationPath),
						oParams: {
							sIcon: "images/status_3_of_5.png",
							sIconWidth: "12px",
							sIconHeight: "12px"
						}
					})],
					aRightDetails: [new PlacemarkDetail({
						//oContext: new sap.ui.model.Context(this._oODataModel, this._sTransportationPath),
						oParams: {
							sIcon: "images/checked.png",
							sIconWidth: "10px",
							sIconHeight: "10px"
						}
					})],
					aHintDetails: [new PlacemarkDetail({
						//oContext: new sap.ui.model.Context(this._oODataModel, this._sTransportationPath),
						oParams: {
							fnText: (oContext) => "Ship From: " + oContext.getProperty("ShipFrom")
						}
					})],
					aPlacemarkActions: [new PlacemarkAction({
						//oContext: new sap.ui.model.Context(this._oODataModel, this._sTransportationPath),
						oParams: {
							fnText: (oContext) => "Details",
							fnOnPress: (
									oContext
								) =>
								this._oController.onNavigateToProducingLocationDetails(oContext.getProperty("").ShippingLocationDetails.__ref)
						}
					})]
				}
			});
		},
		createTruckPlacemarkCollection: function () {
			return new MapPlacemarkCollection({
				oMapControl: this._oYandexMap,
				//oContext: new sap.ui.model.Context(this._oODataModel, this._sTransportationPath),
				oParams: {
					sItemsPath: "TransportationAssignmentDetails",
					fnPlacemarkConstructor: (oMapControl, sItemPath) => {
						return new MapPlacemark({
							oMapControl: oMapControl,
							//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
							oParams: {
								sGeoLocationProperty: "TruckDetails/GeoLocation",
								sSelectedProperty: "Selected",
								sIcon: "images/truck_257_136.png",
								fnIsActive: (oContext) => oContext.getProperty("Status") !== "INACTIVE",
								aBottomDetails: [
									/*new PlacemarkDetail({
										oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
										oParams: {
											sIconWidth: "8px",
											sIconHeight: "8px",
											fnIcon: (oContext) =>
												(oContext.getProperty("TruckDetails/Status") === "READY") ?
												"images/checked.png" :
												(oContext.getProperty("TruckDetails/Status") === "BUSY") ?
												"images/busy.png" :
												(oContext.getProperty("TruckDetails/Status") === "STOPPED") ?
												"images/stopped.png" : "images/unknown.png"
										}
									}),*/
									new PlacemarkDetail({
										//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
										oParams: {
											fnIcon: (oContext) =>
												(oContext.getProperty("Preferred")) ? "images/star.png" : "",
											sIconWidth: "12px",
											sIconHeight: "12px"
										}
									}),
									new PlacemarkDetail({
										//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
										oParams: {
											fnIcon: (oContext) =>
												(oContext.getProperty("ArrivalTimeScore") === 1) ? "images/status_1_of_5.png" :
												(oContext.getProperty("ArrivalTimeScore") === 2) ? "images/status_2_of_5.png" :
												(oContext.getProperty("ArrivalTimeScore") === 3) ? "images/status_3_of_5.png" :
												(oContext.getProperty("ArrivalTimeScore") === 4) ? "images/status_4_of_5.png" :
												(oContext.getProperty("ArrivalTimeScore") === 5) ? "images/status_5_of_5.png" : "images/unknown.png",
											sIconWidth: "12px",
											sIconHeight: "12px"
										}
									}),
									new PlacemarkDetail({
										//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
										oParams: {
											fnIcon: (oContext) =>
												(oContext.getProperty("Status") === "REQUEST_SEND") ? "images/message_sent.png" : "",
											sIcon: "images/checked.png",
											sIconWidth: "12px",
											sIconHeight: "6px"
										}
									})
								],
								aRightDetails: [],
								oCenterDetails: new PlacemarkDetail({
									//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
									oParams: {
										fnText: (oContext) => oContext.getProperty("AssignmentIndex")
									}
								}),
								aHintDetails: [
									new PlacemarkDetail({
										//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
										oParams: {
											fnText: (oContext) => "<b>Truck:</b> " + oContext.getProperty("Truck") +
												" (" + oContext.getProperty("TruckDetails/Description") + ")"
										}
									}),
									new PlacemarkDetail({
										//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
										oParams: {
											fnText: (oContext) => "<b>Carrier:</b> " + oContext.getProperty("TruckDetails/Carrier") +
												" (" + oContext.getProperty("TruckDetails/CarrierDetails/Name") + ")"
										}
									}),
									new PlacemarkDetail({
										//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
										oParams: {
											fnText: (oContext) => "<b>Arrival Time:</b> " + oContext.getProperty("ArrivalTimeMinutes") + " min"
										}
									}),
									new PlacemarkDetail({
										oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
										oParams: {
											fnText: (oContext) => "<b>Max Capacity:</b> " + oContext.getProperty("TruckDetails/MaxWeight") + " ton"
										}
									})
								],
								oTopRightDetails: new PlacemarkDetail({
									//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
									oParams: {
										sIcon: "images/checked.png",
										sIconWidth: "10px",
										sIconHeight: "10px",
										fnIsVisible: (oContext) => oContext.getProperty("Status") === "ACCEPTED"
									}
								}),
								aPlacemarkActions: [new PlacemarkAction({
										//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
										oParams: {
											fnText: (oContext) => "Assign Truck",
											fnOnPress: (
													oContext
												) =>
												this._oController.onAcceptTruck(oContext.getProperty("Transportation"), oContext.getProperty("Truck"))
										}
									}),
									new PlacemarkAction({
										//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
										oParams: {
											fnText: (oContext) => "Details",
											fnOnPress: (
													oContext
												) =>
												this._oController.onNavigateToTruckDetails(oContext.getProperty("").TruckDetails.__ref)
										}
									})
								]
							}
						});
					}
				}
			});
		},
		createShipToPlacemarkCollection: function () {
			return new MapPlacemarkCollection({
				oMapControl: this._oYandexMap,
				//oContext: new sap.ui.model.Context(this._oODataModel, this._sTransportationPath),
				oParams: {
					sItemsPath: "TransportationLocationAssignmentDetails",
					fnPlacemarkConstructor: (oMapControl, sItemPath) => {
						return new MapPlacemark({
							oMapControl: oMapControl,
							//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
							oParams: {
								sGeoLocationProperty: "ShippingLocationDetails/GeoLocation",
								sSelectedProperty: "Selected",
								sIcon: "images/warehouse.png",
								fnIsActive: (oContext) => oContext.getProperty("Status") !== "INACTIVE",
								aBottomDetails: [new PlacemarkDetail({
									//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
									oParams: {
										fnIcon: (oContext) =>
											(oContext.getProperty("ProcessingTimeScore") === 1) ? "images/status_1_of_5.png" :
											(oContext.getProperty("ProcessingTimeScore") === 2) ? "images/status_2_of_5.png" :
											(oContext.getProperty("ProcessingTimeScore") === 3) ? "images/status_3_of_5.png" :
											(oContext.getProperty("ProcessingTimeScore") === 4) ? "images/status_4_of_5.png" :
											(oContext.getProperty("ProcessingTimeScore") === 5) ? "images/status_5_of_5.png" : "images/unknown.png",
										sIconWidth: "12px",
										sIconHeight: "12px"
									}
								})],
								aRightDetails: [new PlacemarkDetail({
									//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
									oParams: {
										sIcon: "images/checked.png",
										sIconWidth: "10px",
										sIconHeight: "10px",
										fnIsVisible: (oContext) => oContext.getProperty("Status") === "ACCEPTED"
									}
								})],
								oTopLeftDetails: new PlacemarkDetail({
									//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
									oParams: {
										fnText: (oContext) => oContext.getProperty("AssignmentIndex")
									}
								}),
								aHintDetails: [
									new PlacemarkDetail({
										//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
										oParams: {
											fnText: (oContext) => "<b>Shipping Location</b>: " + oContext.getProperty("ShipToLocation") +
												" (" + oContext.getProperty("ShippingLocationDetails/Description") + ")"
										}
									}),
									new PlacemarkDetail({
										//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
										oParams: {
											fnText: (oContext) => "<b>Processing Time</b>: " + oContext.getProperty("ProcessingTimeMinutes") + " min"
										}
									}),
									new PlacemarkDetail({
										//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
										oParams: {
											fnText: (oContext) => "<b>Travel Time</b>: " + oContext.getProperty("TravelTimeMinutes") + " min"
										}
									}),
									new PlacemarkDetail({
										//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
										oParams: {
											fnText: (oContext) => "<b>Queue Time</b>: " + oContext.getProperty("UnloadQueueTimeMinutes") + " min"
										}
									}),
									new PlacemarkDetail({
										//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
										oParams: {
											fnText: (oContext) => "<b>Unload Time</b>: " + oContext.getProperty("UnloadTimeMinutes") + " min"
										}
									})
								],
								aPlacemarkActions: [new PlacemarkAction({
									//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
									oParams: {
										fnText: (oContext) => "Details",
										fnOnPress: (
												oContext
											) =>
											this._oController.onNavigateToStorageLocationDetails(oContext.getProperty("").ShippingLocationDetails.__ref)
									}
								})]
							}
						});
					}
				}
			});
		}
	});
});