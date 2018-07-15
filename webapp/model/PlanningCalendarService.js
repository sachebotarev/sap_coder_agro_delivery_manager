sap.ui.define([
	"sap/ui/base/Object"
], function(Object) {
	"use strict";
	/*eslint-env es6*/

	return Object.extend("my.sap_coder_agro_delivery_manager.model.PlanningCalendarService", {
		constructor: function(oODataModel) {
			this._oODataModel = oODataModel;
		},
		convertTranportations: function(aTransportations) {
			let that = this;
			return {
				startDate: new Date("2018-01-01T00:00:00"),
				rows: aTransportations.sort((t1, t2) => t1.LoadStartDateTime > t2.LoadStartDateTime ? 1 : -1).map(oTransportation => {
						return {
							oPlannedTimeline: that.convertTranportationPlanned(oTransportation),
							oActualTimeline: that.convertTranportationActual(oTransportation)
						};
					}).reduce(
						(aCalendarTransportations, oCalendarTransportation) => {
							aCalendarTransportations.push(oCalendarTransportation.oPlannedTimeline);
							aCalendarTransportations.push(oCalendarTransportation.oActualTimeline);
							return aCalendarTransportations;
						}, [])
			};
		},
		convertTranportationPlanned: function(oTransportation) {
			let convertDate = (oDate) => oDate ? new Date(oDate.toISOString().slice(0, -1)) : null;
			return {
				pic: "sap-icon://shipping-status",
				name: oTransportation.TransportationNum,
				role: "transportation (planned)",
				appointments: [{
						start: convertDate(oTransportation.KickOffDate),
						end: convertDate(oTransportation.TruckAssignedDateTime),
						title: "Assignment",
						info: "Loc.: " + oTransportation.ShipFrom,
						type: "Type01",
						//pic: "sap-icon://sap-ui5",
						tentative: true
					}, {
						start: convertDate(oTransportation.TruckAssignedDateTime),
						end: convertDate(oTransportation.StartDateTime),
						title: "Arrival",
						info: "Loc.: " + oTransportation.ShipFrom,
						type: "Type02",
						//pic: "sap-icon://sap-ui5",
						tentative: true
					}, {
						start: convertDate(oTransportation.StartDateTime),
						end: convertDate(oTransportation.LoadStartDateTime),
						title: "Load Queue",
						info: "Loc.: " + oTransportation.ShipFrom,
						type: "Type03",
						//pic: "sap-icon://sap-ui5",
						tentative: true
					}, {
						start: convertDate(oTransportation.LoadStartDateTime),
						end: convertDate(oTransportation.TravelStartDateTime),
						title: "Loading",
						info: "Loc.: " + oTransportation.ShipFrom,
						type: "Type04",
						//pic: "sap-icon://sap-ui5",
						tentative: true
					}, {
						start: convertDate(oTransportation.TravelStartDateTime),
						end: convertDate(oTransportation.UnloadQueueStartDateTime),
						title: "Travel",
						info: "Truck: " + oTransportation.Truck,
						type: "Type05",
						//pic: "sap-icon://sap-ui5",
						tentative: true
					}, {
						start: convertDate(oTransportation.UnloadQueueStartDateTime),
						end: convertDate(oTransportation.UnloadStartDateTime),
						title: "Unload Queue",
						info: "Loc.: " + oTransportation.ShipTo,
						type: "Type06",
						//pic: "sap-icon://sap-ui5",
						tentative: true
					}, {
						start: convertDate(oTransportation.UnloadStartDateTime),
						end: convertDate(oTransportation.EndDateTime),
						title: "Unloading",
						info: "Loc.: " + oTransportation.ShipTo,
						type: "Type07",
						//pic: "sap-icon://sap-ui5",
						tentative: true
					}]
					.filter((a) => a.start && a.end)
					.filter((a) => ((a.end - a.start) / (1000 * 60)) >= 5)
			};
		},
		convertTranportationActual: function(oTransportation) {
			let convertDate = (oDate) => oDate ? new Date(oDate.toISOString().slice(0, -1)) : null;
			return {
				pic: "sap-icon://shipping-status",
				name: oTransportation.TransportationNum,
				role: "transportation (actual)",
				appointments: [{
						start: convertDate(oTransportation.KickOffDate),
						end: convertDate(oTransportation.TruckAssignedActualDateTime),
						title: "Assignment",
						info: "Loc.: " + oTransportation.ShipFrom,
						type: "Type01",
						//pic: "sap-icon://sap-ui5",
						tentative: false
					}, {
						start: convertDate(oTransportation.TruckAssignedActualDateTime),
						end: convertDate(oTransportation.StartActualDateTime),
						title: "Arrival",
						info: "Loc.: " + oTransportation.ShipFrom,
						type: "Type02",
						//pic: "sap-icon://sap-ui5",
						tentative: false
					}, {
						start: convertDate(oTransportation.StartActualDateTime),
						end: convertDate(oTransportation.LoadStartActualDateTime),
						title: "Load Queue",
						info: "Loc.: " + oTransportation.ShipFrom,
						type: "Type03",
						//pic: "sap-icon://sap-ui5",
						tentative: false
					}, {
						start: convertDate(oTransportation.LoadStartActualDateTime),
						end: convertDate(oTransportation.TravelStartActualDateTime),
						title: "Loading",
						info: "Loc.: " + oTransportation.ShipFrom,
						type: "Type04",
						//pic: "sap-icon://sap-ui5",
						tentative: false
					}, {
						start: convertDate(oTransportation.TravelStartActualDateTime),
						end: convertDate(oTransportation.UnloadQueueStartActualDateTime),
						title: "Travel",
						info: "Truck: " + oTransportation.Truck,
						type: "Type05",
						//pic: "sap-icon://sap-ui5",
						tentative: false
					}, {
						start: convertDate(oTransportation.UnloadQueueStartActualDateTime),
						end: convertDate(oTransportation.UnloadStartActualDateTime),
						title: "Unload Queue",
						info: "Loc.: " + oTransportation.ShipTo,
						type: "Type06",
						//pic: "sap-icon://sap-ui5",
						tentative: false
					}, {
						start: convertDate(oTransportation.UnloadStartActualDateTime),
						end: convertDate(oTransportation.EndActualDateTime),
						title: "Unloading",
						info: "Loc.: " + oTransportation.ShipTo,
						type: "Type07",
						//pic: "sap-icon://sap-ui5",
						tentative: false
					}]
					.filter((a) => a.start && a.end)
					.filter((a) => ((a.end - a.start) / (1000 * 60)) >= 5)
			};
		}

	});
});