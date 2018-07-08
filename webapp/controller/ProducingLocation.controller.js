sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"my/sap_coder_agro_delivery_manager/model/formatter",
	"my/sap_coder_agro_delivery_manager/control/YandexMap",
	"my/sap_coder_agro_delivery_manager/model/PlanningCalendarService"
], function(Controller, JSONModel, formatter, YandexMap, PlanningCalendarService) {
	"use strict";
	/*eslint-env es6*/

	return Controller.extend("my.sap_coder_agro_delivery_manager.controller.ProducingLocation", {
		formatter: formatter,

		onInit: function() {
			this.getOwnerComponent().getRouter().getRoute("ProducingLocation").attachPatternMatched(this.onRouterObjectMatched, this);
			
			this._oCalendarModel = new JSONModel();
			this._oPlanningCalendarService = new PlanningCalendarService();
			this.getView().setModel(this._oCalendarModel, "Calendar");
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
								expand: `TransportationDetails`
									//		ShippingLocationDetails,ShippingLocationDetails1,TransportationMessageLogDetails,
									//		TransportationLocationAssignmentDetails/ShippingLocationDetails`
							}
						});
						that.getOwnerComponent().getModel().readExt("/" + sObjectPath + "/TransportationDetails").then(oData =>
							that._oCalendarModel.setData(that._oPlanningCalendarService.convertTranportations(oData.results))
						);
					});
			}
		}
	});
});