sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"my/sap_coder_agro_delivery_manager/model/formatter",
	"my/sap_coder_agro_delivery_manager/control/YandexMap",
	"my/sap_coder_agro_delivery_manager/control/gantt/GanttDiagramControl",
	"my/sap_coder_agro_delivery_manager/model/GanttDiagramService"
], function(Controller, JSONModel, formatter, YandexMap, GanttDiagramControl, GanttDiagramService) {
	"use strict";
	/*eslint-env es6*/

	return Controller.extend("my.sap_coder_agro_delivery_manager.controller.GanttDiagram", {
		formatter: formatter,

		onInit: function() {
			this.getOwnerComponent().getRouter().getRoute("GanttDiagram").attachPatternMatched(this.onRouterObjectMatched, this);
			let that = this;
		},
		onAfterRendering: function() {
			/*var that = this;
			setTimeout(function() {
				var oGanttChartContainer = that.getView().byId("GanttChartContainerId");
				var oGanttChartWithTable = oGanttChartContainer.getGanttCharts()[0];
				oGanttChartWithTable.jumpToPosition(new Date("2015-01-01"));
			}, 1000);*/
		},
		getDataJson: function() {
			let oGanttService = new GanttDiagramService();
			let oTransportation = {
				TransportationNum: "1000"
			};
			return oGanttService.convertTranportationsToGantt([oTransportation]);

			/*{
				"root": {
					"id": "root",
					"level": "root",
					"children": [ oGanttService.convertTranportationToGantt(oTransportation) ]
				}
			};*/
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
			let oGanttService = new GanttDiagramService();
			if (sObjectPath && sObjectPath !== "") {
				that.getOwnerComponent().getModel().readExt("/" + sObjectPath + "/TransportationDetails1").then(oData =>
					new GanttDiagramControl(that.getView().byId("GanttChartContainerId"), oGanttService.convertTranportationsToGantt(oData.results))
				);
			}
		}
	});
});