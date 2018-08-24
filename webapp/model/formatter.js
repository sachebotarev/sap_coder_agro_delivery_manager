sap.ui.define([], function() {
	"use strict";
	return {
		
		transportationStatusIcon: function(sValue) {
			switch (sValue) {
				case "010.DRAFT":
					return "sap-icon://pending";
				case "030.RELEASED":
					return "sap-icon://pending";
				case "041.SHIP_TO_DETERMINED":
					return "sap-icon://pending";
				case "042.TRUCKS_FOUND":
					return "sap-icon://pending";
				case "043.REQUESTS_SENT":
					return "sap-icon://email";
				case "044.TRUCKS_NOT_FOUND":
					return "sap-icon://message-error";
				case "049.ASSIGNED":
					return "sap-icon://status-in-process";
				case "050.ARRIVED_FOR_LOAD":
					return "sap-icon://status-in-process";
				case "060.LOADED":
					return "sap-icon://status-in-process";
				case "070.ARRIVED_FOR_UNLOAD":
					return "sap-icon://status-in-process";
				case "080.CLOSED":	
					return "sap-icon://favorite";
				case "090.COMPLETED":	
					return "sap-icon://complete";
				default:
					return "sap-icon://question-mark";
			}
		},
		transportationStatusState: function(sValue) {
			switch (sValue) {
				case "010.DRAFT":
					return sap.ui.core.ValueState.Error;
				case "030.RELEASED":
					return sap.ui.core.ValueState.Warning;
				case "041.SHIP_TO_DETERMINED":
					return sap.ui.core.ValueState.Warning;
				case "042.TRUCKS_FOUND":
					return sap.ui.core.ValueState.Warning;
				case "043.REQUESTS_SENT":
					return sap.ui.core.ValueState.Warning;
				case "044.TRUCKS_NOT_FOUND":
					return sap.ui.core.ValueState.Error;
				case "049.ASSIGNED":
					return sap.ui.core.ValueState.Warning;
				case "050.ARRIVED_FOR_LOAD":
					return sap.ui.core.ValueState.Warning;
				case "060.LOADED":
					return sap.ui.core.ValueState.Warning;
				case "070.ARRIVED_FOR_UNLOAD":
					return sap.ui.core.ValueState.Warning;
				case "080.CLOSED":	
					return sap.ui.core.ValueState.Warning;
				case "090.COMPLETED":	
					return sap.ui.core.ValueState.Success;
				default:
					return sap.ui.core.ValueState.Error;
			}
		},
		transportationStatusText: function(sValue) {
			switch (sValue) {
				case "010.DRAFT":
					return "Ожидает Обработки";
				case "030.RELEASED":
					return "Выбор Базы Хранения";
				case "041.SHIP_TO_DETERMINED":
					return "Выбор Водителя";
				case "042.TRUCKS_FOUND":
					return "Выбор Водителя";
				case "043.REQUESTS_SENT":
					return "Ожидает Подтверждения";
				case "044.TRUCKS_NOT_FOUND":
					return "Водители не Найдены";
				case "049.ASSIGNED":
					return "Прибытие";
				case "050.ARRIVED_FOR_LOAD":
					return "Загрузка";
				case "060.LOADED":
					return "Перевозка";
				case "070.ARRIVED_FOR_UNLOAD":
					return "Разгрузка";
				case "080.CLOSED":	
					return "Выполнен, Оцените!";
				case "090.COMPLETED":	
					return "Закрыт";
				default:
					return sValue;
			}
		},
		truckStatusIcon: function(sValue) {
			switch (sValue) {
				case "READY":
					return "sap-icon://accept";
				case "BUSY":
					return "sap-icon://status-in-process";
				case "STOPPED":
					return "sap-icon://stop";
				case "UNCKNOWN":
					return "cancel";
				default:
					return "sap-icon://question-mark";
			}
		},
		truckStatusState: function(sValue) {
			switch (sValue) {
				case "READY":
					return sap.ui.core.ValueState.Success;
				case "BUSY":
					return sap.ui.core.ValueState.Warning;
				case "STOPPED":
					return sap.ui.core.ValueState.Error;
				case "UNCKNOWN":
					return sap.ui.core.ValueState.Error;
				default:
					return sap.ui.core.ValueState.Error;
			}
		},
		truckStatusText: function(sValue) {
			switch (sValue) {
				case "READY":
					return "Готов";
				case "BUSY":
					return "На Заказе";
				case "STOPPED":
					return "Недоступен";
				case "UNCKNOWN":
					return "Нет Данных";
				default:
					return sValue;
			}
		}

	};

});