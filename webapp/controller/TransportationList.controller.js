sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"my/sap_coder_agro_delivery_manager/model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"my/sap_coder_agro_delivery_manager/model/PlanningCalendarFunctions"
], function(Controller, formatter, JSONModel, MessageToast, planningCalendarFunctions) {
	"use strict";

	return Controller.extend("my.sap_coder_agro_delivery_manager.controller.TransportationList", {
		formatter: formatter,

		onInit: function() {
			this._oODataModel = this.getOwnerComponent().getModel();
			this._oViewModel = this.getOwnerComponent().getModel("viewModel");
			this.getView().setModel(this._oViewModel);
			setInterval(() => (this._oViewModel.getProperty("/AutoRefresh")) ? this.onRefresh() : {}, 1000);
			this.getOwnerComponent().getRouter().getRoute("TransportationList").attachPatternMatched(this.onRouterObjectMatched, this);
			let sLastRegionVal = "";
			this._oViewModel.attachChange("/Region", () => {
				if (sLastRegionVal !== this._oViewModel.getProperty("/Region")) {
					sap.ui.core.BusyIndicator.show(0);
					this.onRefresh().then(() => sap.ui.core.BusyIndicator.hide());
				}
				sLastRegionVal = this._oViewModel.getProperty("/Region");
			});
		},
		onRouterObjectMatched: function() {
			sap.ui.core.BusyIndicator.show(0);
			this.onRefresh().then(() => sap.ui.core.BusyIndicator.hide());
		},
		onRefresh: function() {
			//sap.ui.core.BusyIndicator.show(1);
			return new Promise((fnResolve, fnReject) => {
				Promise.all([
						this._oODataModel.readPromise("/Transportations", {
							urlParameters: {
								"$expand": "TruckDetails,TruckDetails/CarrierDetails,ShippingLocationDetails,ShippingLocationDetails1",
								"$filter": (this._oViewModel.getProperty("/Region")) ? "ShippingLocationDetails/Region eq '" + this._oViewModel.getProperty("/Region") + "'" : "",
								'$orderby': 'TransportationNum'
							}
						}),
						this._oODataModel.readPromise("/Trucks", {
							urlParameters: {
								"$expand": "CarrierDetails,CarrierDetails/CarrierRegionDetails"
							}
						}),
						this._oODataModel.readPromise("/ShippingLocations", {
							urlParameters: {
								"$expand": "RoadEventDetails",
								"$filter": (this._oViewModel.getProperty("/Region")) ? "Region eq '" + this._oViewModel.getProperty("/Region") + "'" : ""
							}
						})
					])
					.then(aResults => {
						debugger;
						let aTransportations = aResults[0].results;
						let aTrucks = aResults[1].results;
						let aShippingLocations = aResults[2].results;
						let aOldTransportations = this._oViewModel.getProperty("/Transportations");
						this.mergeArray(aOldTransportations, aTransportations, "Uuid");
						this._oViewModel.setProperty("/Transportations", aOldTransportations);
						aOldTransportations.filter((oTransportation) => oTransportation.TransportationNum)
							.forEach((oTransportation, iIndex) =>
								this._oODataModel.readPromise("/RoadEvents", {
									urlParameters: {
										"$filter": "Transportation eq '" + oTransportation.TransportationNum + "'"
									}
								})
								.then((aRoadEvents) => aRoadEvents.results && this._oViewModel.setProperty(`/Transportations/${iIndex}/RoadEventCount`,  aRoadEvents.results.length + 1 - 1))
								.catch(() => {})
							);
						aTrucks.forEach(oTruck => oTruck.CarrierDetails.Regions = oTruck.CarrierDetails.CarrierRegionDetails.results.reduce(
							(sAccumulator, oRegionDetail) => sAccumulator + ((sAccumulator) ? ", " : "") + oRegionDetail.Region,
							""));
						aTrucks = aTrucks.filter(t => t.CarrierDetails.Regions.indexOf(this._oViewModel.getProperty("/Region")) !== -1);
						this._oViewModel.setProperty("/Trucks", aTrucks);
						this._oViewModel.setProperty("/ShippingLocations", aShippingLocations);
						aShippingLocations.filter((oLocation) => oLocation.ShippingLocationKey)
							.forEach((oLocation, iIndex) =>
								this._oODataModel.readPromise("/RoadEvents", {
									urlParameters: {
										"$filter": "ShippingLocation eq '" + oLocation.ShippingLocationKey + "'"
									}
								})
								.then((aRoadEvents) => aRoadEvents.results && this._oViewModel.setProperty(`/ShippingLocations/${iIndex}/RoadEventCount`, aRoadEvents.results.length + 1 - 1))
								.catch(() => {})
							);
						this._oViewModel.setProperty("/Timeline", planningCalendarFunctions.convertTranportations(aTransportations));
						//sap.ui.core.BusyIndicator.hide();
						this.getOwnerComponent()._oChatCurrentUserConnected.done(() => {
							aOldTransportations
								.forEach((oTransportation, iIndex) => {
									debugger;
									if (oTransportation.PusherRoomId && !this._oViewModel.getProperty(
											`/Transportations/${iIndex}/Chat/IsConnected`)) {
										let oChatProperty = {
											IsConnected: true,
											IsInFocus: false,
											UnreadMessageCount: 0,
											NewMessage: "",
											Messages: []
										};
										this._oViewModel.setProperty(`/Transportations/${iIndex}/Chat`, oChatProperty);
										this.getOwnerComponent()._oChatCurrentUser.subscribeToRoom({
											roomId: parseInt(oTransportation.PusherRoomId),
											hooks: {
												onNewMessage: message => {
													//alert(iIndex);
													let aMessages = this._oViewModel.getObject(`/Transportations/${iIndex}/Chat/Messages`) || [];
													aMessages.push({
														MessageDateTime: Date.parse(message.createdAt),
														MessageText: message.text,
														UserName: message.sender ? message.sender.name : message.senderId
													});
													if (aMessages.length > 7) {
														aMessages.shift();
													}
													this._oViewModel.setProperty(`/Transportations/${iIndex}/Chat/Messages`, aMessages);
													if (!this._oViewModel.getProperty(`/Transportations/${iIndex}/Chat/IsInFocus`)) {
														this._oViewModel.setProperty(`/Transportations/${iIndex}/Chat/UnreadMessageCount`,
															this._oViewModel.getProperty(`/Transportations/${iIndex}/Chat/UnreadMessageCount`) + 1);
														if (message.senderId !== "dispatcher") {
															MessageToast.show("Поступило новое сообщение к заказу №" + this._oViewModel.getProperty(
																`/Transportations/${iIndex}` + "/TransportationNum") + " от " + ((message.sender) ? message.sender.name :
																message.senderId));
														}
													}
												}
											}
										});
									}
								});
						});
						fnResolve();
					});
			});
		},
		mergeArray: function(aTarget, aSource, sKeyProperty) {
			for (let i = 0; i < aSource.length; i++) {
				let oFoundTargetElementIndex = -1;
				for (let j = 0; j < aTarget.length; j++) {
					if (aTarget[j][sKeyProperty] === aSource[i][sKeyProperty]) {
						oFoundTargetElementIndex = j;
					}
				}
				if (oFoundTargetElementIndex !== -1) {
					this.mergeObject(aTarget[oFoundTargetElementIndex], aSource[i]);
				} else {
					aTarget.push(aSource[i]);
				}
			}

			let aTargetCleaned = aTarget.filter(oTargetElement => !!aSource.find(oSourceElement => oSourceElement[sKeyProperty] ===
				oTargetElement[sKeyProperty]));
			aTarget.length = 0;
			for (let i = 0; i < aTargetCleaned.length; i++) {
				aTarget.push(aTargetCleaned[i]);
			}

		},
		mergeObject: function(target, source) {
			if (!(target && source)) {
				return;
			};
			// Iterate through `source` properties and if an `Object` set property to merge of `target` and `source` properties
			for (let key of Object.keys(source)) {
				if (Array.isArray(source[key])) {
					target[key] = target[key] || [];
					if (key === "Messages") {
						this.mergeArray(target[key], source[key], "id");
					} else {
						this.mergeArray(target[key], source[key], "Uuid");
					}
				} else if (source[key] instanceof Object) {
					this.mergeObject(target[key], source[key]);
				} else {
					target[key] = source[key];
				}
			}
			// Join `target` and modified `source`
			Object.assign(target || {}, source);
			return target;
		},
		onNavBack: function() {
			history.go(-1);
		},

		onTransportationDetailsNav: function(oEvent) {
			let sObjectPath = oEvent.getSource().getBindingContext().getPath().replace(/\//g, ".");
			this.getOwnerComponent().getRouter().navTo("Transportation", {
				sObjectPath: sObjectPath //"Transportations('" + this._oViewModel.getProperty("/" + sObjectPath + "/TransportationNum") + "')"
			});
		},
		onNavigateToShippingLocation: function(oEvent) {
			this.getOwnerComponent().getRouter().navTo("ShippingLocation", {
				sObjectPath: this._oViewModel.getProperty(oEvent.getSource().getBindingContext().getPath()).__metadata.uri.split("/").pop()
			});
		},
		onTruckDetailsNav: function(oEvent) {
			this.getOwnerComponent().getRouter().navTo("Truck", {
				sObjectPath: this._oViewModel.getProperty(oEvent.getSource().getBindingContext().getPath()).__metadata.uri.split("/").pop()
			});
		}
	});
});