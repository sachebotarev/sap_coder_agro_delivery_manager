sap.ui.define([
], function(Object) {
	"use strict";

	return {
		convertTranportations: function(aTransportations) {
			let that = this;
			return {
				startDate: aTransportations.sort((t1, t2) => t1.LoadStartDateTime > t2.LoadStartDateTime ? 1 : -1)[0].KickOffDate,
				//new Date("2018-01-01T00:00:00") ,
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
			let convertDate = (oDate) => oDate;// ? new Date(oDate.toISOString().slice(0, -1)) : null;
			return {
				Uuid: oTransportation.Uuid + "-P",
				pic: "sap-icon://shipping-status",
				name: oTransportation.TransportationNum,
				role: "Транспорт. (план)",
				appointments: [{
						Uuid: 1,
						start: convertDate(oTransportation.KickOffDate),
						end: convertDate(oTransportation.TruckAssignedDateTime),
						title: "Поиск",
						info: "Loc.: " + oTransportation.ShipFrom,
						type: "Type01",
						//pic: "sap-icon://sap-ui5",
						tentative: true
					}, {
						Uuid: 2,
						start: convertDate(oTransportation.TruckAssignedDateTime),
						end: convertDate(oTransportation.StartDateTime),
						title: "Прибытие",
						info: "Loc.: " + oTransportation.ShipFrom,
						type: "Type02",
						//pic: "sap-icon://sap-ui5",
						tentative: true
					}, {
						Uuid: 3,
						start: convertDate(oTransportation.StartDateTime),
						end: convertDate(oTransportation.LoadStartDateTime),
						title: "Очередь Загрузки",
						info: "Loc.: " + oTransportation.ShipFrom,
						type: "Type03",
						//pic: "sap-icon://sap-ui5",
						tentative: true
					}, {
						Uuid: 4,
						start: convertDate(oTransportation.LoadStartDateTime),
						end: convertDate(oTransportation.TravelStartDateTime),
						title: "Загрузка",
						info: "Loc.: " + oTransportation.ShipFrom,
						type: "Type04",
						//pic: "sap-icon://sap-ui5",
						tentative: true
					}, {
						Uuid: 5,
						start: convertDate(oTransportation.TravelStartDateTime),
						end: convertDate(oTransportation.UnloadQueueStartDateTime),
						title: "Перевозка",
						info: "Truck: " + oTransportation.Truck,
						type: "Type05",
						//pic: "sap-icon://sap-ui5",
						tentative: true
					}, {
						Uuid: 6,
						start: convertDate(oTransportation.UnloadQueueStartDateTime),
						end: convertDate(oTransportation.UnloadStartDateTime),
						title: "Очередь Разгрузки",
						info: "Loc.: " + oTransportation.ShipTo,
						type: "Type06",
						//pic: "sap-icon://sap-ui5",
						tentative: true
					}, {
						Uuid: 7,
						start: convertDate(oTransportation.UnloadStartDateTime),
						end: convertDate(oTransportation.EndDateTime),
						title: "Разгрузка",
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
			let convertDate = (oDate) => oDate;
			return {
				Uuid: oTransportation.Uuid + "-A",
				pic: "sap-icon://shipping-status",
				name: oTransportation.TransportationNum,
				role: "Транспорт. (факт)",
				appointments: [{
						Uuid: 1,
						start: convertDate(oTransportation.KickOffDate),
						end: convertDate(oTransportation.TruckAssignedActualDateTime),
						title: "Поиск",
						info: "Loc.: " + oTransportation.ShipFrom,
						type: "Type01",
						//pic: "sap-icon://sap-ui5",
						tentative: false
					}, {
						Uuid: 2,
						start: convertDate(oTransportation.TruckAssignedActualDateTime),
						end: convertDate(oTransportation.StartActualDateTime),
						title: "Прибытие",
						info: "Loc.: " + oTransportation.ShipFrom,
						type: "Type02",
						//pic: "sap-icon://sap-ui5",
						tentative: false
					}, {
						Uuid: 3,
						start: convertDate(oTransportation.StartActualDateTime),
						end: convertDate(oTransportation.LoadStartActualDateTime),
						title: "Очередь Загрузки",
						info: "Loc.: " + oTransportation.ShipFrom,
						type: "Type03",
						//pic: "sap-icon://sap-ui5",
						tentative: false
					}, {
						Uuid: 4,
						start: convertDate(oTransportation.LoadStartActualDateTime),
						end: convertDate(oTransportation.TravelStartActualDateTime),
						title: "Загрузка",
						info: "Loc.: " + oTransportation.ShipFrom,
						type: "Type04",
						//pic: "sap-icon://sap-ui5",
						tentative: false
					}, {
						Uuid: 5,
						start: convertDate(oTransportation.TravelStartActualDateTime),
						end: convertDate(oTransportation.UnloadQueueStartActualDateTime),
						title: "Перевозка",
						info: "Truck: " + oTransportation.Truck,
						type: "Type05",
						//pic: "sap-icon://sap-ui5",
						tentative: false
					}, {
						Uuid: 6,
						start: convertDate(oTransportation.UnloadQueueStartActualDateTime),
						end: convertDate(oTransportation.UnloadStartActualDateTime),
						title: "Очередь Разгрузки",
						info: "Loc.: " + oTransportation.ShipTo,
						type: "Type06",
						//pic: "sap-icon://sap-ui5",
						tentative: false
					}, {
						Uuid: 7,
						start: convertDate(oTransportation.UnloadStartActualDateTime),
						end: convertDate(oTransportation.EndActualDateTime),
						title: "Разгрузка",
						info: "Loc.: " + oTransportation.ShipTo,
						type: "Type07",
						//pic: "sap-icon://sap-ui5",
						tentative: false
					}]
					.filter((a) => a.start && a.end)
					.filter((a) => ((a.end - a.start) / (1000 * 60)) >= 5)
			};
		}

	};
});