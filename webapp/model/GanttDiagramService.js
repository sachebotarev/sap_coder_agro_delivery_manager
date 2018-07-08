sap.ui.define([
	"sap/ui/base/Object"
], function(Object) {
	"use strict";
	/*eslint-env es6*/

	return Object.extend("my.sap_coder_agro_delivery_manager.model.GanttDiagramService", {
		constructor: function(oODataModel) {
			this._oODataModel = oODataModel;
		},
		convertTranportationsToGantt: function(aTransportations) {
			let that = this;
			return {
				root: {
					id: "root",
					level: "root",
					children: aTransportations.map(oTransportation => that.convertTranportationToGantt(oTransportation)).reduce(
						(aGanttTransportations, oGanttTransportation) => {
							aGanttTransportations.push(oGanttTransportation);
							return aGanttTransportations;
						}, [])
				}
			};
		},
		convertTranportationToGantt: function(oTransportation) {
			debugger;
			return {
				id: oTransportation.TransportationNum,
				level: "01",
				name: oTransportation.TransportationNum,
				order: [{
					startTime: oTransportation.LoadStartDateTime.toISOString().slice(0, -1),
					endTime: oTransportation.TravelStartDateTime.toISOString().slice(0, -1),
					level: "1"
				}],
				children: [{
					id: oTransportation.TransportationNum + ".01",
					level: "01",
					name: "Load Queue",
					order: [{
						startTime: oTransportation.StartDateTime.toISOString().slice(0, -1),
						endTime: oTransportation.LoadStartDateTime.toISOString().slice(0, -1),
						level: "2"
					}]
				}, {
					id: oTransportation.TransportationNum + ".02",
					level: "01",
					name: "Loading",
					order: [{
						startTime: oTransportation.LoadStartDateTime.toISOString().slice(0, -1),
						endTime: oTransportation.TravelStartDateTime.toISOString().slice(0, -1),
						level: "2"
					}]
				}, {
					id: oTransportation.TransportationNum + ".03",
					level: "01",
					name: "Travel",
					order: [{
						startTime: oTransportation.TravelStartDateTime.toISOString().slice(0, -1),
						endTime: oTransportation.UnloadQueueStartDateTime.toISOString().slice(0, -1),
						level: "2"
					}]
				}, {
					id: oTransportation.TransportationNum + ".04",
					level: "01",
					name: "Unload Queue",
					order: [{
						startTime: oTransportation.UnloadQueueStartDateTime.toISOString().slice(0, -1),
						endTime: oTransportation.UnloadStartDateTime.toISOString().slice(0, -1),
						level: "2"
					}]
				}, {
					id: oTransportation.TransportationNum + ".04",
					level: "01",
					name: "Unload Time",
					order: [{
						startTime: oTransportation.UnloadStartDateTime.toISOString().slice(0, -1),
						endTime: oTransportation.EndDateTime.toISOString().slice(0, -1),
						level: "2"
					}]
				}]
			};
		}

	});
});