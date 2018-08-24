sap.ui.define([
	"sap/ui/base/Object",
	"my/sapui5_components_library/yandex/maps/YandexMap",
	"my/sapui5_components_library/yandex/maps/MapPlacemark",
	"my/sapui5_components_library/yandex/maps/PlacemarkDetail",
	"my/sapui5_components_library/yandex/maps/PlacemarkAction",
	"my/sapui5_components_library/yandex/maps/MapPlacemarkCollection",
	"my/sapui5_components_library/yandex/maps/MapRoute"
], function(Object, YandexMap, MapPlacemark, PlacemarkDetail, PlacemarkAction, MapPlacemarkCollection, MapRoute) {
	"use strict";
	/*eslint-env es6*/
	/*global ymaps*/

	// https://tech.yandex.ru/maps/jsbox/2.1/object_manager_spatial
	return Object.extend("my.sap_coder_agro_delivery_manager.view.TransportationMapViewBuilder", {
		constructor: function(oYandexMap, oController) {
			Object.apply(this);
			this._oYandexMap = oYandexMap;
			this._oController = oController;
		},
		buildMapView: function() {
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
		createRoutes: function() {
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
		createShipFromPlacemark: function() {
			return new MapPlacemark({
				oMapControl: this._oYandexMap,
				//oContext: new sap.ui.model.Context(this._oODataModel, this._sTransportationPath),
				oParams: {
					sGeoLocationProperty: "ShippingLocationDetails/GeoLocation",
					sIcon: "images/farm.png",
					aBottomDetails: [
						new PlacemarkDetail({
							oParams: {
								sIcon: "images/status_3_of_5.png",
								sIconWidth: "12px",
								sIconHeight: "12px"
							}
						}),
						new PlacemarkDetail({
							oParams: {
								fnIcon: (oContext) => (oContext.getProperty("ShippingLocationDetails/RoadEventCount") > 0) ? "images/alert.png" : "",
								sIconWidth: "12px",
								sIconHeight: "12px"
							}
						})
					],
					aRightDetails: [new PlacemarkDetail({
						oParams: {
							sIcon: "images/request_accepted.png",
							sIconWidth: "10px",
							sIconHeight: "10px"
						}
					})],
					aHintDetails: [new PlacemarkDetail({
							oParams: {
								fnText: (oContext) => "<b>Ферма</b>: " + oContext.getProperty("ShippingLocationDetails/Description")
							}
						}),
						new PlacemarkDetail({
							oParams: {
								fnText: (oContext) => "<b>Адрес</b>: " +
									oContext.getProperty("ShippingLocationDetails/RegionName") + "," +
									oContext.getProperty("ShippingLocationDetails/City") + "," +
									oContext.getProperty("ShippingLocationDetails/Street") + "," +
									oContext.getProperty("ShippingLocationDetails/AddressLine")
							}
						})
					],
					aPlacemarkActions: [new PlacemarkAction({
						//oContext: new sap.ui.model.Context(this._oODataModel, this._sTransportationPath),
						oParams: {
							fnText: (oContext) => "Подробнее",
							fnOnPress: (
									oContext
								) =>
								this._oController.onNavigateToShippingLocation(oContext.getProperty("ShippingLocationDetails"))
						}
					})]
				}
			});
		},
		createTruckPlacemarkCollection: function() {
			return new MapPlacemarkCollection({
				oMapControl: this._oYandexMap,
				oParams: {
					sItemsPath: "TransportationAssignmentDetails/results",
					fnPlacemarkConstructor: (oMapControl, sItemPath) => {
						return new MapPlacemark({
							oMapControl: oMapControl,
							oParams: {
								sGeoLocationProperty: "TruckDetails/GeoLocation",
								sSelectedProperty: "IsSelected",
								sIcon: "images/truck_257_136.png",
								fnIsActive: (oContext) => {
									debugger;
									return oContext.getProperty("Status") !== "INACTIVE";
								},
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
												(oContext.getProperty("TruckDetails/Status") === "STOPPED") ? "images/stopped.png" :
												(oContext.getProperty("Status") === "REQUEST_SEND") ? "images/message_sent.png" :
												(oContext.getProperty("Status") === "REQUEST_DELIVERED") ? "images/request_received.png" :
												(oContext.getProperty("Status") === "REQUEST_READ") ? "images/request_read2.png" :
												(oContext.getProperty("Status") === "ACCEPTED") ? "images/request_accepted.png" :
												(oContext.getProperty("Status") === "REJECTED") ? "images/request_rejected.png" :
												(oContext.getProperty("TruckDetails/Status") === "READY") ? "images/ready.png" :
												(oContext.getProperty("TruckDetails/Status") === "BUSY") ? "images/busy.png" : "",
											sIconWidth: "12px",
											sIconHeight: "12px"
										}
									}),
									new PlacemarkDetail({
										//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
										oParams: {
											fnIcon: (oContext) =>
												(oContext.getProperty("TruckDetails/CarrierDetails/ReputationIndex") === 1) ? "images/index_1.png" :
												(oContext.getProperty("TruckDetails/CarrierDetails/ReputationIndex") === 2) ? "images/index_2.png" :
												(oContext.getProperty("TruckDetails/CarrierDetails/ReputationIndex") === 3) ? "images/index_3.png" :
												(oContext.getProperty("TruckDetails/CarrierDetails/ReputationIndex") === 4) ? "images/index_4.png" :
												(oContext.getProperty("TruckDetails/CarrierDetails/ReputationIndex") === 5) ? "images/index_5.png" : "images/unknown.png",
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
									})
								],
								aRightDetails: [],
								oCenterDetails: new PlacemarkDetail({
									oParams: {
										fnText: (oContext) => Number(oContext.getProperty("TruckDetails/MaxWeight")) + "т"
									}
								}),
								aHintDetails: [
									new PlacemarkDetail({
										oParams: {
											fnText: (oContext) => "<b>Водитель:</b> " + oContext.getProperty("TruckDetails/DriverName")
										}
									}),
									new PlacemarkDetail({
										oParams: {
											fnText: (oContext) => "<b>Грузовик:</b> " + oContext.getProperty("TruckDetails/Description") + " (" + oContext.getProperty(
												"TruckDetails/LicensePlateNum") + ")"
										}
									}),
									new PlacemarkDetail({
										oParams: {
											fnText: (oContext) => "<b>Перевозчик:</b> " + oContext.getProperty("TruckDetails/CarrierDetails/Name")
										}
									}),
									new PlacemarkDetail({
										oParams: {
											fnText: (oContext) => "<b>Приоритет по региону:</b> " + ((oContext.getProperty("Preferred")) ? "да" : "нет")
										}
									}),
									new PlacemarkDetail({
										oParams: {
											fnText: (oContext) => "<b>Репутация:</b> " + oContext.getProperty("TruckDetails/CarrierDetails/ReputationIndex") +
												" из 5"
										}
									}),
									new PlacemarkDetail({
										oParams: {
											fnText: (oContext) => "<b>Время Прибытия:</b> " + oContext.getProperty("ArrivalTimeMinutes") + " мин"
										}
									}),
									new PlacemarkDetail({
										oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
										oParams: {
											fnText: (oContext) => "<b>Грузоподъемность:</b> " + oContext.getProperty("TruckDetails/MaxWeight") + " т"
										}
									}),
									new PlacemarkDetail({
										oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
										oParams: {
											fnText: (oContext) => "<b>Объем:</b> " + oContext.getProperty("TruckDetails/MaxVolume") + " м3"
										}
									})
								],
								/*oTopRightDetails: new PlacemarkDetail({
									//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
									oParams: {
										sIcon: "images/checked.png",
										sIconWidth: "10px",
										sIconHeight: "10px",
										fnIsVisible: (oContext) => oContext.getProperty("Status") === "ACCEPTED"
									}
								}),*/
								oTopRightDetails: new PlacemarkDetail({
									//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
									oParams: {
										fnText: (oContext) => oContext.getProperty("AssignmentIndex")
									}
								}),
								aPlacemarkActions: [
									new PlacemarkAction({
										//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
										oParams: {
											fnText: (oContext) => "Дополнительно",
											fnOnPress: (
													oContext
												) =>
												this._oController.onNavigateToTruckDetails(oContext.getProperty("TruckDetails"))
										}
									})
								]
							}
						});
					}
				}
			});
		},
		createShipToPlacemarkCollection: function() {
			return new MapPlacemarkCollection({
				oMapControl: this._oYandexMap,
				//oContext: new sap.ui.model.Context(this._oODataModel, this._sTransportationPath),
				oParams: {
					sItemsPath: "TransportationLocationAssignmentDetails/results",
					fnPlacemarkConstructor: (oMapControl, sItemPath) => {
						return new MapPlacemark({
							oMapControl: oMapControl,
							oParams: {
								sGeoLocationProperty: "ShippingLocationDetails/GeoLocation",
								sSelectedProperty: "IsSelected",
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
								aRightDetails: [
									new PlacemarkDetail({
										//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
										oParams: {
											sIcon: "images/request_accepted.png",
											sIconWidth: "10px",
											sIconHeight: "10px",
											fnIsVisible: (oContext) => oContext.getProperty("Status") === "ACCEPTED"
										}
									})
								],
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
											fnText: (oContext) => "<b>База Хранения</b>: " + oContext.getProperty("ShipToLocation") +
												" (" + oContext.getProperty("ShippingLocationDetails/Description") + ")"
										}
									}),
									new PlacemarkDetail({
										oParams: {
											fnText: (oContext) => "<b>Адрес</b>: " +
												oContext.getProperty("ShippingLocationDetails/RegionName") + "," +
												oContext.getProperty("ShippingLocationDetails/City") + "," +
												oContext.getProperty("ShippingLocationDetails/Street") + "," +
												oContext.getProperty("ShippingLocationDetails/AddressLine")
										}
									}),
									new PlacemarkDetail({
										oParams: {
											fnText: (oContext) => "<b>Время Обработки</b>: " + oContext.getProperty("ProcessingTimeMinutes") + " мин"
										}
									}),
									new PlacemarkDetail({
										oParams: {
											fnText: (oContext) => "<b>Время в Пути</b>: " + oContext.getProperty("TravelTimeMinutes") + " мин"
										}
									}),
									new PlacemarkDetail({
										oParams: {
											fnText: (oContext) => "<b>Время Ожидания</b>: " + oContext.getProperty("UnloadQueueTimeMinutes") + " мин"
										}
									}),
									new PlacemarkDetail({
										oParams: {
											fnText: (oContext) => "<b>Время Ращгрузки</b>: " + oContext.getProperty("UnloadTimeMinutes") + " мин"
										}
									}),
									new PlacemarkDetail({
										oParams: {
											fnText: (oContext) => "<b>Расстояние</b>: " + oContext.getProperty("TravelMileageKm") + " км"
										}
									})
								],
								aPlacemarkActions: [new PlacemarkAction({
									//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
									oParams: {
										fnText: (oContext) => "Подробнее",
										fnOnPress: (
												oContext
											) =>
											this._oController.onNavigateToShippingLocation(oContext.getProperty("ShippingLocationDetails"))
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