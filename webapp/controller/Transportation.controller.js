sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"my/sap_coder_agro_delivery_manager/model/formatter",
	"my/sapui5_components_library/yandex/maps/YandexMap",
	"my/sap_coder_agro_delivery_manager/view/TransportationMapViewBuilder",
	"my/sap_coder_agro_delivery_manager/model/PlanningCalendarService"
], function(Controller, JSONModel, formatter, YandexMap, TransportationMapViewBuilder, PlanningCalendarService) {
	"use strict";
	/*eslint-env es6*/

	return Controller.extend("my.sap_coder_agro_delivery_manager.controller.Transportation", {
		formatter: formatter,

		onInit: function() {
			this._oGlobalOdataModel = this.getOwnerComponent().getModel();
			this._oODataModel = this.getOwnerComponent().getModel();
			this._oYandexMap = new YandexMap(this.byId("map").getId());
			this._oCalendarModel = new JSONModel();
			this._oPlanningCalendarService = new PlanningCalendarService();
			this.getView().setModel(this._oCalendarModel, "Calendar");

			this.getOwnerComponent().getRouter().getRoute("Transportation").attachPatternMatched(this.onRouterObjectMatched, this);

			this._oYandexMapApiInitialized = $.Deferred();
			this._oYandexMap.createMapControl().then((oYmaps) => {
				let oTransportationMapViewBuilder = new TransportationMapViewBuilder(this._oYandexMap, this);
				oTransportationMapViewBuilder.buildMapView();
				this._oYandexMapApiInitialized.resolve(oYmaps)
			});

		},
		onTest: function() {},
		onTransporationRelease: function() {
			let sTransportationPath = this.getView().getBindingContext().getPath();
			this.getOwnerComponent().getModel()
				.callFunctionExt("/ReleaseTransportation", "POST", {
					TransportationNum: this.getOwnerComponent().getModel().getProperty(sTransportationPath + "/TransportationNum")
				}).then(() => this.getOwnerComponent().getModel().refresh(true));
		},
		onTransporationCancel: function() {
			let sTransportationPath = this.getView().getBindingContext().getPath();
			this.getOwnerComponent().getModel()
				.callFunctionExt("/CancelTransportation", "POST", {
					TransportationNum: this.getOwnerComponent().getModel().getProperty(sTransportationPath + "/TransportationNum")
				}).then(() => this.getOwnerComponent().getModel().refresh(true));
		},
		onTransporationSendRequests: function() {
			let sTransportationPath = this.getView().getBindingContext().getPath();
			this.getOwnerComponent().getModel()
				.callFunctionExt("/SendRequests", "POST", {
					TransportationNum: this.getOwnerComponent().getModel().getProperty(sTransportationPath + "/TransportationNum")
				}).then(() => this.getOwnerComponent().getModel().refresh(true));
		},
		onTransporationSave: function() {
			this.getOwnerComponent().getModel().submitChanges();
		},
		onAcceptTruck: function(sTransportation, sTruck) {
			this.getOwnerComponent().getModel()
				.callFunctionExt("/AcceptTransportation", "POST", {
					TransportationNum: sTransportation,
					TruckNum: sTruck
				}).then(() => this.getOwnerComponent().getModel().refresh(true));
		},
		onNavigateToProducingLocationDetails: function(sShippingLocationPath) {
			this.getOwnerComponent().getRouter().navTo("ProducingLocation", {
				sObjectPath: sShippingLocationPath
			});
		},
		onNavigateToTruckDetails: function(sTruckPath) {
			this.getOwnerComponent().getRouter().navTo("Truck", {
				sObjectPath: sTruckPath
			});
		},
		onNavigateToStorageLocationDetails: function(sShippingLocationPath) {
			this.getOwnerComponent().getRouter().navTo("GanttDiagram", {
				sObjectPath: sShippingLocationPath
			});
		},
		onTransportationAssignmentTableRawSelected: function(oEvent) {
			if (oEvent.getSource().getSelectedIndices().includes(oEvent.getParameter("rowIndex"))) {
				this._oGlobalOdataModel.setProperty(oEvent.getParameter("rowContext").getPath() + "/Selected", true);
			} else {
				this._oGlobalOdataModel.setProperty(oEvent.getParameter("rowContext").getPath() + "/Selected", false);
			}
		},
		onRouterObjectMatched: function(oEvent) {
			let sObjectPath = oEvent.getParameter("arguments").sObjectPath;
			if (sObjectPath && sObjectPath !== "") {
				this.getOwnerComponent().getModel().metadataLoaded()
					.then(() => {
						this.getView().bindElement({
							path: "/" + sObjectPath,
							parameters: {
								expand: `ShippingLocationDetails,
										ShippingLocationDetails1,
										TransportationMessageLogDetails,
										TransportationAssignmentDetails/TruckDetails/CarrierDetails,
										TransportationLocationAssignmentDetails/ShippingLocationDetails,
										TruckDetails,
										TruckDetails/CarrierDetails`
							}
						});
						$.when(this._oYandexMapApiInitialized)
							.done((oYmaps) => this.bindMap("/" + sObjectPath));
						this.bindCalendar("/" + sObjectPath);
					});
			}
		},
		bindMap: function(sTransporationPath) {
			this._oYandexMap.bindElement(new sap.ui.model.Context(this._oGlobalOdataModel, sTransporationPath));
		},
		bindCalendar: function(sTransporationPath) {
			this._oGlobalOdataModel.attachChange(sTransporationPath, (oEvent) =>
				this._oCalendarModel.setData(this._oPlanningCalendarService.convertTranportations([this._oGlobalOdataModel.getObject(
					sTransporationPath)])));
		}
	});
});