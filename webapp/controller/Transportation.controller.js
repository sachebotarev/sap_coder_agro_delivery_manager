sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"my/sap_coder_agro_delivery_manager/model/formatter",
	"my/sapui5_components_library/yandex/maps/YandexMap",
	"my/sap_coder_agro_delivery_manager/view/TransportationMapViewBuilder",
	"my/sap_coder_agro_delivery_manager/model/PlanningCalendarService"
], function (Controller, JSONModel, formatter, YandexMap, TransportationMapViewBuilder, PlanningCalendarService) {
	"use strict";
	/*eslint-env es6*/

	return Controller.extend("my.sap_coder_agro_delivery_manager.controller.Transportation", {
			formatter: formatter,

			onInit: function () {
				this.getOwnerComponent().getRouter().getRoute("Transportation").attachPatternMatched(this.onRouterObjectMatched, this);
				this._oODataModel = this.getOwnerComponent().getModel();
				this._oYandexMap = new YandexMap();

				this._oYandexMapApiInitialized = $.Deferred();
				this._oViewBinded = $.Deferred();
				$.when(this._oViewBinded, this._oYandexMapApiInitialized)
					.done((sTransporationPath, oYmaps) => this.onMapInit(sTransporationPath));

				this._oYandexMap.initYandexMapsApi().then((oYmaps) => this._oYandexMapApiInitialized.resolve(oYmaps));

				this._oCalendarModel = new JSONModel();
				this._oPlanningCalendarService = new PlanningCalendarService();
				this.getView().setModel(this._oCalendarModel, "Calendar");
			},
			onMapInit: function (sTransporationPath) {
				let oTransportationMapViewBuilder = new TransportationMapViewBuilder(this._oYandexMap, this.byId("map").getId(), this._oODataModel,
					sTransporationPath, this);
				oTransportationMapViewBuilder.buildMapView();
			},
			onTest: function () {},
			onTransporationRelease: function () {
				let sTransportationPath = this.getView().getBindingContext().getPath();
				this.getOwnerComponent().getModel()
					.callFunctionExt("/ReleaseTransportation", "POST", {
						TransportationNum: this.getOwnerComponent().getModel().getProperty(sTransportationPath + "/TransportationNum")
					}).then(() => this.getOwnerComponent().getModel().refresh(true));
			},
			onTransporationCancel: function () {
				let sTransportationPath = this.getView().getBindingContext().getPath();
				this.getOwnerComponent().getModel()
					.callFunctionExt("/CancelTransportation", "POST", {
						TransportationNum: this.getOwnerComponent().getModel().getProperty(sTransportationPath + "/TransportationNum")
					}).then(() => this.getOwnerComponent().getModel().refresh(true));
			},
			onTransporationSendRequests: function () {
				let sTransportationPath = this.getView().getBindingContext().getPath();
				this.getOwnerComponent().getModel()
					.callFunctionExt("/SendRequests", "POST", {
						TransportationNum: this.getOwnerComponent().getModel().getProperty(sTransportationPath + "/TransportationNum")
					}).then(() => this.getOwnerComponent().getModel().refresh(true));
			},
			onTransporationSave: function () {
				this.getOwnerComponent().getModel().submitChanges();
			},
			onAcceptTruck: function (sTransportation, sTruck) {
				this.getOwnerComponent().getModel()
					.callFunctionExt("/AcceptTransportation", "POST", {
						TransportationNum: sTransportation,
						TruckNum: sTruck
					}).then(() => this.getOwnerComponent().getModel().refresh(true));
			},
			onNavigateToProducingLocationDetails: function (sShippingLocationPath) {
				this.getOwnerComponent().getRouter().navTo("ProducingLocation", {
					sObjectPath: sShippingLocationPath
				});
			},
			onNavigateToTruckDetails: function (sTruckPath) {
				this.getOwnerComponent().getRouter().navTo("Truck", {
					sObjectPath: sTruckPath
				});
			},
			onNavigateToStorageLocationDetails: function (sShippingLocationPath) {
				this.getOwnerComponent().getRouter().navTo("GanttDiagram", {
					sObjectPath: sShippingLocationPath
				});
			},
			onRouterObjectMatched: function (oEvent) {
				let sObjectPath = oEvent.getParameter("arguments").sObjectPath;
				let that = this;
				if (sObjectPath && sObjectPath !== "") {
					that.getOwnerComponent().getModel().metadataLoaded()
						.then(() => {
								that.getView().bindElement({
									path: "/" + sObjectPath,
									parameters: {
										expand: `TransportationAssignmentDetails/TruckDetails/CarrierDetails,
										ShippingLocationDetails,ShippingLocationDetails1,TransportationMessageLogDetails,
										TransportationLocationAssignmentDetails/ShippingLocationDetails,TruckDetails`
									}
								});
								that.getOwnerComponent().getModel().readExt("/" + sObjectPath).then(oData => {
									that._oCalendarModel.setData(that._oPlanningCalendarService.convertTranportations([oData]));
									that._oViewBinded.resolve("/" + sObjectPath);
								});
						});
			}
		},
		onTransportationAssignmentTableRawSelected: function (oEvent) {
			if (oEvent.getSource().getSelectedIndices().includes(oEvent.getParameter("rowIndex"))) {
				this._oODataModel.setProperty(oEvent.getParameter("rowContext").getPath() + "/Selected", true);
			} else {
				this._oODataModel.setProperty(oEvent.getParameter("rowContext").getPath() + "/Selected", false);
			}
		}
	});
});