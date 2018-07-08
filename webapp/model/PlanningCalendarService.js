sap.ui.define([
	"sap/ui/base/Object"
], function (Object) {
	"use strict";
	/*eslint-env es6*/

	return Object.extend("my.sap_coder_agro_delivery_manager.model.PlanningCalendarService", {
		constructor: function (oODataModel) {
			this._oODataModel = oODataModel;
		},
		convertTranportations: function (aTransportations) {
			let that = this;
			return {
				startDate: new Date("2018-01-01T00:00:00"),
				rows: aTransportations.sort((t1, t2) => t1.LoadStartDateTime > t2.LoadStartDateTime ? 1 : -1).map(oTransportation => that.convertTranportation(
						oTransportation)).reduce(
						(aCalendarTransportations, oCalendarTransportation) => {
							aCalendarTransportations.push(oCalendarTransportation);
							return aCalendarTransportations;
						}, [])
					/*people: [{
						pic: "sap-icon://shipping-status",
						name: "John Miller",
						role: "team member",
						appointments: [{
							start: new Date("2017", "0", "15", "8", "0"),
							end: new Date("2017", "0", "15", "9", "0"),
							title: "Team meeting",
							info: "room 1",
							type: "Type01",
							pic: "sap-icon://sap-ui5",
							tentative: false
						}, {
							start: new Date("2017-01-15T09:00:00"),
							end: new Date("2017-01-15T10:00:00"),
							title: "Team meeting",
							info: "room 1",
							type: "Type01",
							pic: "sap-icon://sap-ui5",
							tentative: false
						}]
					}]*/
			};
			/*return {
				startDate: new Date("2018", "0", "15", "8", "0"),
				people: {
					pic: "images/truck.png",
					name: "John Miller",
					role: "team member",
					appointments: aTransportations.map(oTransportation => that.convertTranportation(oTransportation)).reduce(
						(aCalendarTransportations, oGanttTransportation) => {
							aCalendarTransportations.push(oGanttTransportation);
							return aCalendarTransportations;
						}, [])
				}
				
			};*/
		},
		convertTranportation: function (oTransportation) {
			return {
				pic: "sap-icon://shipping-status",
				name: oTransportation.TransportationNum,
				role: "transportation",
				appointments: [{
					start: new Date(oTransportation.StartDateTime.toISOString().slice(0, -1)),
					end: new Date(oTransportation.LoadStartDateTime.toISOString().slice(0, -1)),
					title: "Load Queue",
					info: "Loc.: " + oTransportation.ShipFrom,
					type: "Type01",
					//pic: "sap-icon://sap-ui5",
					tentative: false
				}, {
					start: new Date(oTransportation.LoadStartDateTime.toISOString().slice(0, -1)),
					end: new Date(oTransportation.TravelStartDateTime.toISOString().slice(0, -1)),
					title: "Loading",
					info: "Loc.: " + oTransportation.ShipFrom,
					type: "Type02",
					//pic: "sap-icon://sap-ui5",
					tentative: false
				}, {
					start: new Date(oTransportation.TravelStartDateTime.toISOString().slice(0, -1)),
					end: new Date(oTransportation.UnloadQueueStartDateTime.toISOString().slice(0, -1)),
					title: "Travel",
					info: "Truck: " + oTransportation.Truck,
					type: "Type03",
					//pic: "sap-icon://sap-ui5",
					tentative: false
				}, {
					start: new Date(oTransportation.UnloadQueueStartDateTime.toISOString().slice(0, -1)),
					end: new Date(oTransportation.UnloadStartDateTime.toISOString().slice(0, -1)),
					title: "Unload Queue",
					info: "Loc.: " + oTransportation.ShipTo,
					type: "Type04",
					//pic: "sap-icon://sap-ui5",
					tentative: false
				}, {
					start: new Date(oTransportation.UnloadStartDateTime.toISOString().slice(0, -1)),
					end: new Date(oTransportation.EndDateTime.toISOString().slice(0, -1)),
					title: "Unloading",
					info: "Loc.: " + oTransportation.ShipTo,
					type: "Type05",
					//pic: "sap-icon://sap-ui5",
					tentative: false
				}].filter((a) => ((a.end - a.start) / (1000*60)) >= 1)
			};

		}

	});
});