sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"my/sap_coder_agro_delivery_manager/model/formatter",
	"my/sapui5_components_library/yandex/maps/YandexMap",
	"my/sap_coder_agro_delivery_manager/control/gantt/GanttDiagramControl"
], function(Controller, JSONModel, formatter, YandexMap, GanttDiagramControl) {
	"use strict";
	/*eslint-env es6*/

	return Controller.extend("my.sap_coder_agro_delivery_manager.controller.StorageLocation", {
		formatter: formatter,

		onInit: function() {
			this.getOwnerComponent().getRouter().getRoute("StorageLocation").attachPatternMatched(this.onRouterObjectMatched, this);
			this._oODataModel = this.getOwnerComponent().getModel();
			this._oYandexMap = new YandexMap();

			this._oYandexMapApiInitialized = $.Deferred();
			this._oViewBinded = $.Deferred();
			$.when(this._oViewBinded, this._oYandexMapApiInitialized)
				.done((sTransporationPath, oYmaps) => this.onMapInit(sTransporationPath));

			this._oYandexMap.initYandexMapsApi().then((oYmaps) => this._oYandexMapApiInitialized.resolve(oYmaps));
			
			let that = this;
			setTimeout(() => {
				let oGanttDiagram = new GanttDiagramControl(that.getView().byId("GanttChartContainerId"), that.getDataJson());
			}, 0);
		},
		onAfterRendering: function() {
			var that = this;
			setTimeout(function() {
				var oGanttChartContainer = that.getView().byId("GanttChartContainerId");
				var oGanttChartWithTable = oGanttChartContainer.getGanttCharts()[0];
				oGanttChartWithTable.jumpToPosition(new Date("2015-01-01"));
			}, 1000);
		},
		getDataJson: function() {
			return {
				"root": {
					"id": "root",
					"level": "root",
					"children": [{
						"id": "01",
						"level": "01",
						"name": "Concept Phase",
						"order": [{
							"startTime": "20150101000000",
							"endTime": "20150102000000",
							"level": "1"
						}],
						"nwtForWeekends": [{
							"id": "nwtForWeekends"
						}],
						"nwt": [{
							"id": "nwtForAWeek"
						}],
						"children": [{
							"id": "0101",
							"level": "01",
							"name": "Detailed Project Planning",
							"order": [{
								"startTime": "20150101000000",
								"endTime": "20150102000000",
								"level": "2"
							}]
						}, {
							"id": "0102",
							"level": "01",
							"name": "Kick Off Concept Phase",
							"order": [{
								"startTime": "20150102000000",
								"endTime": "20150103000000",
								"level": "2"
							}]
						}]
					}],
					"calendar": [{
						"id": "nwtForAWeek",
						"data": [{
							"startTime": "20150501141533",
							"endTime": "20150507141533"
						}]
					}, {
						"id": "nwtForWeekends",
						"data": [{
							"startTime": "20150103141533",
							"endTime": "20150104141533"
						}]
					}]
				}
			};
		},
		onMapInit: function(sTransporationPath) {},
		onTest: function() {},
		onTransporationRelease: function() {

		},
		onTransporationCancel: function() {

		},
		onRouterObjectMatched: function(oEvent) {
			let sObjectPath = oEvent.getParameter("arguments").sObjectPath;
			let that = this;
			if (sObjectPath && sObjectPath !== "") {
				that.getOwnerComponent().getModel().metadataLoaded()
					.then(() => {
						that.getView().bindElement({
							path: "/" + sObjectPath,
							parameters: {
								expand: `TransportationDetails1`
									//		ShippingLocationDetails,ShippingLocationDetails1,TransportationMessageLogDetails,
									//		TransportationLocationAssignmentDetails/ShippingLocationDetails`
							}
						});
						that._oViewBinded.resolve("/" + sObjectPath);
					});
			}
		}
	});
});