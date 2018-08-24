jQuery.sap.registerModulePath("my.sapui5_components_library", "https://rawgit.com/ysokol/my_sapui5_components_library/master/src/");
jQuery.sap.registerModulePath("com.pepsico.core", "https://rawgit.com/ysokol/pepsico_core_library/master/src/");
//jQuery.sap.registerModulePath("my.sapui5_components_library", "/ext-resources/my_sapui5_components_library/src/");
//jQuery.sap.registerModulePath("com.pepsico.core", "/ext-resources/pepsico_core_library/src/");
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"my/sap_coder_agro_delivery_manager/model/models",
	"my/sapui5_components_library/exception/MyException",
	"com/pepsico/core/sap/ui/model/json/JSONModel",
	"com/pepsico/core/sap/ui/base/RuntimeException",
	"com/pepsico/core/sap/ui/base/GlobalErrorHandler",
	"sap/m/MessageBox",
	"com/pepsico/core/sap/mobile/kapsel/push/PushNotificationService"
], function(UIComponent, Device, models, MyException, JSONModel, RuntimeException, GlobalErrorHandler, MessageBox, PushNotificationService) {
	"use strict";

	return UIComponent.extend("my.sap_coder_agro_delivery_manager.Component", {

		metadata: {
			manifest: "json"
		},

		init: function() {
			this._oGlobalErrorHandler = new GlobalErrorHandler();
			this._oGlobalErrorHandler.attachError({
				fnHandler: (oEvent) => MessageBox.error((new RuntimeException({
					sMessage: "Unhalded Exception",
					oCausedBy: oEvent.oException
				})).toString())
			});

			UIComponent.prototype.init.apply(this, arguments);

			this.setModel(models.createDeviceModel(), "device");
			this.setModel(models.createODataModel(false));
			this.setModel(new JSONModel({
				Transportations: [],
				Timeline: {},
				AutoRefresh: false,
				AutoRefreshTransportation: false,
				Region: "",
				Regions: [
					{Region: "46", Name: "Курская область"},
					{Region: "50", Name: "Московская область"},
					{Region: "77", Name: "г. Москва"},
					{Region: "", Name: ""}
				]
			}), "viewModel");
			
			const tokenProvider = new Chatkit.TokenProvider({
				url: "https://us1.pusherplatform.io/services/chatkit_token_provider/v1/581182a8-e5bc-46db-95f9-0fa82fa3974d/token"
			});
			this._oChatManager = new Chatkit.ChatManager({
				instanceLocator: "v1:us1:581182a8-e5bc-46db-95f9-0fa82fa3974d",
				userId: "dispatcher",
				tokenProvider: tokenProvider
			});
			this._oChatCurrentUserConnected = $.Deferred();
			this._oChatManager
				.connect()
				.then(currentUser => {
					this._oChatCurrentUser = currentUser;
					this._oChatCurrentUserConnected.resolve();
				})
				.catch(error => {
					alert("error:", error);
				});
			
			this._oPushNotificationService = new PushNotificationService({
				sSmpApplicationId: "my.agro.transportation.management.driver.app",
				sRestNotificationServiceUrl: "/hcp_mobile_services/restnotification"
			});
			
			this.getRouter().initialize();
		}
	});
});