sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"my/sapui5_components_library/utils/ResourceLoader"
], function(Controller, ResourceLoader) {
	"use strict";

	return Controller.extend("my.sap_coder_agro_delivery_manager.controller.MainView", {
		onInit: function() {
			// https://tech.yandex.ru/maps/jsbox/2.1/object_manager_spatial
			// https://www.flaticon.com/free-icon/truck_171257#term=truck&page=2&position=11
			var oResourceLoader = new ResourceLoader();
			var myMap;
			var that = this;
			oResourceLoader.getScript("https://api-maps.yandex.ru/2.1/?lang=ru_RU").then(() => ymaps.ready(function() {
				var myMap = new ymaps.Map(that.byId("map").getId(), {
					center: [55.751574, 37.573856],
					zoom: 9
				}, {
					searchControlProvider: 'yandex#search'
				});
				// Создаём макет содержимого.
				var MyIconContentLayout = ymaps.templateLayoutFactory.createClass(
					'<div style="color: #FFFFFF; font-weight: bold;">$[properties.iconContent]</div>'
				);
				var myPlacemark = new ymaps.Placemark(myMap.getCenter(), {
						hintContent: 'Собственный значок метки',
						balloonContent: 'Это красивая метка',
						iconContent: '12'
					}, {
						// Опции.
						// Необходимо указать данный тип макета.
						iconLayout: 'default#imageWithContent',
						// Своё изображение иконки метки.
						iconImageHref: 'images/truck.png',
						// Размеры метки.
						iconImageSize: [30, 42],
						// Смещение левого верхнего угла иконки относительно
						// её "ножки" (точки привязки).
						iconImageOffset: [-5, -38],
						// Макет содержимого.
            			iconContentLayout: MyIconContentLayout
					});
				myMap.geoObjects
        			.add(myPlacemark);
				that._myPlacemark = myPlacemark;
				that._myMap = myMap;
			}));
			/*var myMap = new ymaps.Map('map', {
				center: [55.751574, 37.573856],
				zoom: 9
			}, {
				searchControlProvider: 'yandex#search'
			});*/
		},
		onTest: function() {
			debugger;
			this._myPlacemark.geometry.setCoordinates([55.761574, 37.563856]);
			//this._myPlacemark.setCoordinates([55.761574, 37.563856]);
		}
	});
});