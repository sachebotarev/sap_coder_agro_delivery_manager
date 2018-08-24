sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"my/sap_coder_agro_delivery_manager/model/formatter",
	"my/sapui5_components_library/yandex/maps/YandexMap",
	"my/sap_coder_agro_delivery_manager/view/TransportationMapViewBuilder",
	"my/sap_coder_agro_delivery_manager/model/PlanningCalendarFunctions",
	"sap/m/MessageToast"
], function(Controller, JSONModel, formatter, YandexMap, TransportationMapViewBuilder, PlanningCalendarFunctions, MessageToast) {
	"use strict";
	/*eslint-env es6*/

	return Controller.extend("my.sap_coder_agro_delivery_manager.controller.Transportation", {
		formatter: formatter,

		onInit: function() {
			//this._oGlobalOdataModel = this.getOwnerComponent().getModel();
			this._oODataModel = this.getOwnerComponent().getModel();
			this._oViewModel = this.getOwnerComponent().getModel("viewModel");
			this.getView().setModel(this._oViewModel);
			this._sTransportationPath = undefined;

			this._oYandexMap = new YandexMap(this.byId("map").getId());
			this._oYandexMapApiInitialized = $.Deferred();
			this._oYandexMap.createMapControl().then((oYmaps) => {
				let oTransportationMapViewBuilder = new TransportationMapViewBuilder(this._oYandexMap, this);
				oTransportationMapViewBuilder.buildMapView();
				this._oYandexMapApiInitialized.resolve(this._oYandexMap);
			});

			this._oChatCurrentUser = this.getOwnerComponent()._oChatCurrentUser;
			this.byId("chatIconTabFilterId").addEventDelegate({
				onfocusout: () => {
					this._oViewModel.setProperty(this._sTransportationPath + "/Chat/IsInFocus", false);
				}
			});
			this.byId("chatIconTabFilterId").addEventDelegate({
				onfocusin: () => {
					this._oViewModel.setProperty(this._sTransportationPath + "/Chat/IsInFocus", true);
					this._oViewModel.setProperty(this._sTransportationPath + "/Chat/UnreadMessageCount", 0);
				}
			});

			setInterval(() => (this._oViewModel.getProperty("/AutoRefreshTransportation")) ? this.refreshScreenModel() : {}, 500);

			let bBlockOnChange = false;
			this._oViewModel.attachChange("/", () => {
				if (bBlockOnChange) {
					return;
				}
				bBlockOnChange = true;
				if (this._sTransportationPath) {
					this._oViewModel.setProperty(this._sTransportationPath + "/IsTruckAssignmentSelected", false);
					if (this._oViewModel.getProperty(this._sTransportationPath + "/TransportationAssignmentDetails/results") && 
						this._oViewModel.getProperty(this._sTransportationPath + "/TransportationAssignmentDetails/results")
							.filter(oAssignment => oAssignment.IsSelected).length !== 0) {
						this._oViewModel.setProperty(this._sTransportationPath + "/IsTruckAssignmentSelected", true)
					}
				}
				bBlockOnChange = false;
			});

			this.getOwnerComponent().getRouter().getRoute("Transportation").attachPatternMatched(this.onRouterObjectMatched, this);
		},
		onTransportationSubmitRating: function() {
			debugger;
			sap.ui.core.BusyIndicator.show(0);
			this._oODataModel.setProperty("/" + this._oViewModel.getProperty(this._sTransportationPath).__metadata.uri.split("/").pop() +
				"/RatingMark",
				this._oViewModel.getProperty(this._sTransportationPath + "/RatingMark")
			);
			this._oODataModel.submitChangesPromise()
				.then(() => this._oODataModel.callFunctionExt("/ProcessStatusChange", "POST", {
					TransportationNum: this._oViewModel.getProperty(this._sTransportationPath + "/TransportationNum"),
					NewStatus: "090.COMPLETED"
				}))
				.then(() => this.refreshScreenModel())
				.then(() => sap.ui.core.BusyIndicator.hide());
		},
		onTruckAssignmentDeleteSelected: function(oTruckAssignment) {
			sap.ui.core.BusyIndicator.show(0);
			let aPromises = [];
			let aAssignmentsToDelete = this._oViewModel.getProperty(this._sTransportationPath + "/TransportationAssignmentDetails/results")
				.filter(oAssignment => oAssignment.IsSelected);
			for (let oAssignment of aAssignmentsToDelete) {
				aPromises.push(this._oODataModel.callFunctionExt("/RemoveTransportationAssignment", "POST", {
					TransportationNum: oAssignment.Transportation,
					TruckNum: oAssignment.Truck
				}));
			}

			Promise.all(aPromises)
				.then(() => this.refreshScreenModel())
				.then(() => sap.ui.core.BusyIndicator.hide());
		},
		onNavigateToShippingLocation: function(oShippingLocation) {
			this.getOwnerComponent().getRouter().navTo("ShippingLocation", {
				sObjectPath: oShippingLocation.__metadata.uri.split("/").pop()
			});
		},
		onNavigateToTruckDetails: function(oTruck) {
			this.getOwnerComponent().getRouter().navTo("Truck", {
				sObjectPath: oTruck.__metadata.uri.split("/").pop()
			});
		},
		onChatSendMessage: function() {
			if (!this._oViewModel.getProperty(this._sTransportationPath + "/Chat/NewMessage")) {
				return;
			}
			this._oChatCurrentUser.sendMessage({
				text: this._oViewModel.getProperty(this._sTransportationPath + "/Chat/NewMessage"),
				roomId: parseInt(this._oViewModel.getProperty(this._sTransportationPath + "/PusherRoomId"))
			});
			this._oViewModel.setProperty(this._sTransportationPath + "/Chat/NewMessage", "");

		},
		onRefreshAssignments: function() {
			sap.ui.core.BusyIndicator.show(0);
			this._oODataModel.callFunctionExt("/CancelTransportation", "POST", {
					TransportationNum: this._oViewModel.getProperty(this._sTransportationPath + "/TransportationNum")
				})
				.then(() => this._oODataModel.callFunctionExt("/ReleaseTransportation", "POST", {
					TransportationNum: this._oViewModel.getProperty(this._sTransportationPath + "/TransportationNum")
				}))
				.then(() => this.refreshScreenModel())
				.then(() => sap.ui.core.BusyIndicator.hide());
		},
		onTransporationCancel: function() {
			sap.ui.core.BusyIndicator.show(0);
			this._oODataModel.callFunctionExt("/CancelTransportation", "POST", {
				TransportationNum: this._oViewModel.getProperty(this._sTransportationPath + "/TransportationNum")
			})
			.then(() => this.refreshScreenModel())
			.then(() => sap.ui.core.BusyIndicator.hide());;
		},
		onTransporationSendRequests: function() {
			sap.ui.core.BusyIndicator.show(0);
			let sTransportationPath = this.getView().getBindingContext().getPath();
			this.getOwnerComponent().getModel()
				.callFunctionExt("/SendRequests", "POST", {
					TransportationNum: this._oViewModel.getProperty(this._sTransportationPath + "/TransportationNum")
				})
				.then(() => this.refreshScreenModel())
				.then(() => this.getOwnerComponent()._oPushNotificationService.sendNotificationAll(
					"Появился новый заказ на транспортировку №" + this._oViewModel.getProperty(this._sTransportationPath + "/TransportationNum"),
					JSON.stringify({
						sNotificationType: "TRANSPORTATION_REQUEST",
						sTransportationNum: this._oViewModel.getProperty(this._sTransportationPath + "/TransportationNum")
					})))
				.then(() => sap.ui.core.BusyIndicator.hide());
		},
		onTransporationRelease: function() {
			sap.ui.core.BusyIndicator.show(0);
			setTimeout(() => sap.ui.core.BusyIndicator.hide(), 1000);
			/*let sTransportationPath = this.getView().getBindingContext().getPath();
			this.getOwnerComponent().getModel()
				.callFunctionExt("/ReleaseTransportation", "POST", {
					TransportationNum: this.getOwnerComponent().getModel().getProperty(sTransportationPath + "/TransportationNum")
				}).then(() => this.getOwnerComponent().getModel().refresh(true));*/
		},

		refreshScreenModel: function() {
			return new Promise((fnResolve, fnReject) => {
				this._oODataModel.readPromise("/" + this._oViewModel.getProperty(this._sTransportationPath).__metadata.uri.split("/").pop(), {
						urlParameters: {
							'$expand': `ShippingLocationDetails,
										ShippingLocationDetails1,
										TransportationMessageLogDetails,
										TruckDetails,
										TruckDetails/CarrierDetails,
										MediaResourceDetails,
										TransportationItemDetails,
										TransportationAssignmentDetails,TransportationAssignmentDetails/TruckDetails,TransportationAssignmentDetails/TruckDetails/CarrierDetails,
										TransportationLocationAssignmentDetails,TransportationLocationAssignmentDetails/ShippingLocationDetails`
						}
					})
					.then(oTransportation => {
						debugger;
						oTransportation.TransportationAssignmentDetails.results.sort((oElem1, oElem2) => oElem1.AssignmentIndex - oElem2.AssignmentIndex);
						oTransportation.TransportationLocationAssignmentDetails.results.sort((oElem1, oElem2) => oElem1.AssignmentIndex - oElem2.AssignmentIndex);
						let oOldTransportation = this._oViewModel.getProperty(this._sTransportationPath);
						this.mergeObject(oOldTransportation, oTransportation);
						oOldTransportation.ShippingLocationDetails1 = oTransportation.ShippingLocationDetails1;
						this._oViewModel.setProperty(this._sTransportationPath, oOldTransportation);
						this._oViewModel.setProperty(this._sTransportationPath + "/Timeline", PlanningCalendarFunctions.convertTranportations([
							this._oViewModel.getObject(this._sTransportationPath)
						]));
						this._oViewModel.setProperty(this._sTransportationPath + "/ProcessFlow", this.getProcessFlowModelData(oTransportation));

						this._oODataModel.readPromise("/RoadEvents", {
								urlParameters: {
										"$filter": "ShippingLocation eq '" + oTransportation.ShipFrom + "'"
								}
							})
							.then((aRoadEvents) => aRoadEvents.results && this._oViewModel.setProperty(this._sTransportationPath + `/ShippingLocationDetails/RoadEventCount`, 
								aRoadEvents.results.length + 1 - 1))
							.catch(() => {});
						
						this._oODataModel.readPromise("/MediaResources", {
								urlParameters: {
										"$filter": "MediaResourceUuid eq '" + oTransportation.WayBillPdfMediaResource + "'"
								}
							})
							.then((aMediaResources) => aMediaResources.results && aMediaResources.results[0] && 
								this._oViewModel.setProperty(this._sTransportationPath + `/MediaResourceDetails`, aMediaResources.results[0]))
							.catch(() => {});
							
						fnResolve();
					});
			});
		},
		onRouterObjectMatched: function(oEvent) {
			sap.ui.core.BusyIndicator.show(0);
			this._sTransportationPath = oEvent.getParameter("arguments").sObjectPath.replace(/\./g, "/");
			this.getView().bindElement({
				path: this._sTransportationPath,
			});
			this._oYandexMapApiInitialized.done((oYmaps) => this.bindMap(this._sTransportationPath));
			this.refreshScreenModel().then(() => sap.ui.core.BusyIndicator.hide());
		},
		bindMap: function(sTransporationPath) {
			this._oYandexMap.bindElement(new sap.ui.model.Context(this._oViewModel, sTransporationPath));
		},
		onNavBack: function() {
			history.go(-1);
		},
		onTest: function() {},
		/*onTransporationRelease: function() {
			let sTransportationPath = this.getView().getBindingContext().getPath();
			this.getOwnerComponent().getModel()
				.callFunctionExt("/ReleaseTransportation", "POST", {
					TransportationNum: this.getOwnerComponent().getModel().getProperty(sTransportationPath + "/TransportationNum")
				}).then(() => this.getOwnerComponent().getModel().refresh(true));
		},*/
		onTransporationSave: function() {
			this.getOwnerComponent().getModel().submitChanges();
		},
		onAcceptTruck: function(sTransportation, sTruck) {
			this.getOwnerComponent().getModel()
				.callFunctionExt("/AcceptTransportation", "POST", {
					TransportationNum: sTransportation,
					TruckNum: sTruck
				}).then(() => this.getOwnerComponent().getModel().refresh(true));
		},
		/*onTransportationAssignmentTableRawSelected: function(oEvent) {
			if (oEvent.getSource().getSelectedIndices().includes(oEvent.getParameter("rowIndex"))) {
				this._oGlobalOdataModel.setProperty(oEvent.getParameter("rowContext").getPath() + "/Selected", true);
			} else {
				this._oGlobalOdataModel.setProperty(oEvent.getParameter("rowContext").getPath() + "/Selected", false);
			}
		},*/
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
		getProcessFlowModelData: function(oTransportation) {
			let oProcessFlowData = {
				nodes: [],
				lanes: [{
					"id": "0",
					"icon": "sap-icon://request",
					"label": "Черновик",
					"position": 0
				}, {
					"id": "1",
					"icon": "sap-icon://create",
					"label": "Создан",
					"position": 1
				}, {
					"id": "2",
					"icon": "sap-icon://accept",
					"label": "Деблокирован",
					"position": 2
				}, {
					"id": "3",
					"icon": "sap-icon://building",
					"label": "Определена База Хранения",
					"position": 3
				}, {
					"id": "4",
					"icon": "sap-icon://employee",
					"label": "Список Водителей Определен",
					"position": 4
				}, {
					"id": "5",
					"icon": "sap-icon://email",
					"label": "Запросы отправлены",
					"position": 5
				}, {
					"id": "6",
					"icon": "sap-icon://employee",
					"label": "Водитель Найден",
					"position": 6
				}, {
					"id": "7",
					"icon": "sap-icon://shipping-status",
					"label": "Прибыл на Загрузку",
					"position": 7
				}, {
					"id": "8",
					"icon": "sap-icon://shipping-status",
					"label": "Загрузка Выполнена",
					"position": 8
				}, {
					"id": "9",
					"icon": "sap-icon://shipping-status",
					"label": "Прибыл на Разгрузку",
					"position": 9
				}, {
					"id": "10",
					"icon": "sap-icon://favorite",
					"label": "Выполнен и Ожидает Оценки",
					"position": 10
				}, {
					"id": "11",
					"icon": "sap-icon://complete",
					"label": "Закрыт",
					"position": 11
				}]
			};
			if (oTransportation.Status >= '010.DRAFT') {
				oProcessFlowData.nodes.push({
					"id": "00",
					"lane": "0",
					"title": "Заказ на Транспортировку № " + oTransportation.TransportationNum,
					"titleAbbreviation": "Зкз № " + oTransportation.TransportationNum,
					"children": [],
					"isTitleClickable": true,
					"state": "Positive",
					"stateText": "Черновик",
					"focused": true //,
						//"texts": ["Sales Order Document Overdue long text for the wrap up all the aspects", "Not cleared"]
				});
			}
			if (oTransportation.Status >= '020.CREATED') {
				oProcessFlowData.nodes.push({
					"id": "10",
					"lane": "1",
					"title": "Заказ на Транспортировку № " + oTransportation.TransportationNum,
					"titleAbbreviation": "Зкз № " + oTransportation.TransportationNum,
					"children": [],
					"state": "Positive",
					"stateText": "Создан" //,
						//"texts": ["text 1", "text 2"]
				});
			}
			if (oTransportation.Status >= '030.RELEASED') {
				oProcessFlowData.nodes.push({
					"id": "20",
					"lane": "2",
					"title": "Заказ на Транспортировку № " + oTransportation.TransportationNum,
					"titleAbbreviation": "Зкз № " + oTransportation.TransportationNum,
					"children": [],
					"state": "Positive",
					"stateText": "Деблокирован" //,
						//"texts": ["text 1", "text 2"]
				});
			}
			if (oTransportation.Status >= '041.SHIP_TO_DETERMINED') {
				oProcessFlowData.nodes.push({
					"id": "30",
					"lane": "3",
					"title": "База Хранения '" + oTransportation.ShippingLocationDetails.Description + "'",
					//"titleAbbreviation": "Зкз № " + oTransportation.TransportationNum,
					"children": [],
					"state": "Positive",
					"stateText": "Найдена" //,
						//"texts": ["text 1", "text 2"]
				});
			}
			if (oTransportation.Status >= '042.TRUCKS_FOUND') {
				oProcessFlowData.nodes.push({
					"id": "40",
					"lane": "4",
					"title": "Список Водителей Определен",
					//"titleAbbreviation": "Зкз № " + oTransportation.TransportationNum,
					"children": [],
					"state": "Positive",
					"stateText": "Водители Найдены" //,
						//"texts": ["text 1", "text 2"]
				});
			}
			if (oTransportation.Status >= '043.REQUESTS_SENT') {
				oProcessFlowData.nodes.push({
					"id": "50",
					"lane": "5",
					"title": "Запросы отправлены",
					//"titleAbbreviation": "Зкз № " + oTransportation.TransportationNum,
					"children": [],
					"state": "Positive",
					"stateText": "Запросы Отправлены" //,
						//"texts": ["text 1", "text 2"]
				});
			}
			if (oTransportation.Status >= '049.ASSIGNED') {
				oProcessFlowData.nodes.push({
					"id": "60",
					"lane": "6",
					"title": "Водитель Найден '" + oTransportation.TruckDetails.DriverName + "'",
					//"titleAbbreviation": "Зкз № " + oTransportation.TransportationNum,
					"children": [],
					"state": "Positive",
					"stateText": "Водитель Найден" //,
						//"texts": ["text 1", "text 2"]
				});
			}
			for (let i = 1; i < oProcessFlowData.nodes.length; i++) {
				oProcessFlowData.nodes[i - 1].children.push(oProcessFlowData.nodes[i].id);
			}
			return oProcessFlowData;
		}
	});
});