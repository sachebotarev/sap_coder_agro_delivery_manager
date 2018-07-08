sap.ui.define([], function() {
	"use strict";
	return {
		transportationStatusIcon: function(sValue) {
			switch (sValue) {
				case "SUBMITTED":
					return "sap-icon://accept";
				case "DRAFT":
					return "sap-icon://status-in-process";
				case "RELEASED":
					return "sap-icon://approvals";
				default:
					return "sap-icon://question-mark";
			}
		},
		
		transportationStatusState: function(sValue) {
			switch (sValue) {
				case "SUBMITTED":
					return sap.ui.core.ValueState.Success;
				case "DRAFT":
					return sap.ui.core.ValueState.Warning;
				case "RELEASED":
					return sap.ui.core.ValueState.Success;
				default:
					return sap.ui.core.ValueState.Error;
			}
		}

	};

});