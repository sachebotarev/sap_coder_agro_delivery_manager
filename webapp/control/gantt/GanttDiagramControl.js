sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function(Object, JSONModel, MessageToast) {
	"use strict";
	jQuery.sap.require("sap.gantt.def.cal.Calendar");
	jQuery.sap.require("sap.gantt.def.cal.CalendarDefs");
	jQuery.sap.require("sap.gantt.def.cal.TimeInterval");
	return Object.extend("my.sap_coder_agro_delivery_manager.control.gantt.GanttDiagramControl", {
		constructor: function(oGanttChartContainer, oGanttData) {
			Object.apply(this);
			var oGanttChartWithTable = oGanttChartContainer.getGanttCharts()[0];
			this._oModel = new JSONModel();
			var that = this;

			that._oModel.setData(oGanttData);
			oGanttChartContainer.setModel(that._oModel, "test");
			// configuration of GanttChartWithTable
			oGanttChartWithTable.bindAggregation("rows", {
				path: "test>/root",
				parameters: {
					arrayNames: ["children"]
				}
			});
			oGanttChartWithTable.setCalendarDef(new sap.gantt.def.cal.CalendarDefs({
				defs: {
					path: "test>/root/calendar",
					template: new sap.gantt.def.cal.Calendar({
						key: "{test>id}",
						timeIntervals: {
							path: "test>data",
							templateShareable: true,
							template: new sap.gantt.def.cal.TimeInterval({
								startTime: "{test>startTime}",
								endTime: "{test>endTime}"
							})
						}
					})
				}
			}));
			oGanttChartWithTable.setTimeAxis(that._createTimeAxis());
			oGanttChartWithTable.setShapeDataNames(["top", "order", "milestone", "constraint", "relationship", "nwt", "nwtForWeekends"]);
			oGanttChartWithTable.setShapes(that._configShape());
		},
		onInit: function() {

		},

		/*
		 * Create CustomToolbar
		 * @private
		 * @returns {Object} oToolbar
		 */
		_createCustomToolbar: function() {
			var that = this;
			var oToolbar = new sap.m.Toolbar({
				content: [
					new sap.m.Link({
						text: "Create Task",
						press: function() {
							that.createTask();
						}
					}),
					new sap.m.ToolbarSpacer({
						width: "10px"
					}),
					new sap.m.Link({
						text: "Delete Task",
						press: function() {
							that.deleteTask();
						}
					}),
					new sap.m.ToolbarSpacer({
						width: "10px"
					}),
					new sap.m.ToolbarSeparator()
				]
			});

			return oToolbar;
		},

		/*
		 * Create ToolbarSchemes
		 * @private
		 * @returns {Array} aToolbarSchemes
		 */
		_createToolbarSchemes: function() {
			var aToolbarSchemes = [
				new sap.gantt.config.ToolbarScheme({
					key: "GLOBAL_TOOLBAR",
					customToolbarItems: new sap.gantt.config.ToolbarGroup({
						position: "R2",
						overflowPriority: sap.m.OverflowToolbarPriority.High
					}),
					timeZoom: new sap.gantt.config.ToolbarGroup({
						position: "R4",
						overflowPriority: sap.m.OverflowToolbarPriority.NeverOverflow
					}),
					legend: new sap.gantt.config.ToolbarGroup({
						position: "R3",
						overflowPriority: sap.m.OverflowToolbarPriority.Low
					}),
					settings: new sap.gantt.config.SettingGroup({
						position: "R1",
						overflowPriority: sap.m.OverflowToolbarPriority.Low,
						items: sap.gantt.config.DEFAULT_TOOLBAR_SETTING_ITEMS
					}),
					toolbarDesign: sap.m.ToolbarDesign.Transparent
				}),
				new sap.gantt.config.ToolbarScheme({
					key: "LOCAL_TOOLBAR"
				})
			];

			return aToolbarSchemes;
		},

		/*
		 * Create ContainerLayouts
		 * @private
		 * @returns {Array} aContainerLayouts
		 */
		_createContainerLayouts: function() {
			var aContainerLayouts = [
				new sap.gantt.config.ContainerLayout({
					key: "sap.test.gantt_layout",
					text: "Gantt Layout",
					toolbarSchemeKey: "GLOBAL_TOOLBAR"
				})
			];

			return aContainerLayouts;
		},

		/*
		 * Create Legend
		 * @private
		 * @returns {Object} oLegend
		 */
		_createLegendContainer: function() {
			var sSumTaskColor = "#FAC364";
			var sTasksColor = "#5CBAE5";
			var sRelColor = "#848F94";
			var sTextColor = sap.ui.getCore().getConfiguration().getTheme() === "sap_hcb" ? "white" : "";
			var oLegend = new sap.gantt.legend.LegendContainer({
				legendSections: [
					new sap.m.Page({
						title: "Tasks",
						content: [
							new sap.ui.core.HTML({
								content: "<div width='100%' height='50%' style='margin-top: 25px'><svg width='180px' height='60px'><g>" +
									"<g style='display: block;'>" +
									"<g><rect x='" + (sap.ui.getCore().getConfiguration().getRTL() ? "155" : "25") + "' y='2' width='20' height='20' fill=" +
									sSumTaskColor + " style='stroke: " + sSumTaskColor + "; stroke-width: 2px;'></rect>" +
									"<text x='" + (sap.ui.getCore().getConfiguration().getRTL() ? "125" : "55") + "' y='16' font-size='0.875rem' fill=" +
									sTextColor + ">Summary task</text></g>" +
									"<g><rect x='" + (sap.ui.getCore().getConfiguration().getRTL() ? "155" : "25") +
									"' y='32' width='20' height='20' fill=" + sTasksColor + " style='stroke: " + sTasksColor +
									"; stroke-width: 2px;'></rect>" +
									"<text x='" + (sap.ui.getCore().getConfiguration().getRTL() ? "125" : "55") + "' y='46' font-size='0.875rem' fill=" +
									sTextColor + ">Task</text></g>" +
									"</g></g></svg></div>"
							})
						]
					}),
					new sap.m.Page({
						title: "Relationships",
						content: [
							new sap.ui.core.HTML({
								content: "<div width='100%' height='50%' style='margin-top: 25px'><svg width='180px' height='25px'><g>" +
									"<g style='display: block;'>" +
									"<g><rect x='" + (sap.ui.getCore().getConfiguration().getRTL() ? "155" : "25") + "' y='8' width='20' height='1' fill=" +
									sRelColor + " style='stroke: " + sRelColor + "; stroke-width: 1px;'></rect>" +
									"<text x='" + (sap.ui.getCore().getConfiguration().getRTL() ? "125" : "55") + "' y='12.5' font-size='0.875rem' fill=" +
									sTextColor + ">Relationship</text></g>" +
									"</g></g></svg></div>"
							})
						]
					})
				]
			});

			return oLegend;
		},

		/*
		 * Configuration of Shape.
		 * @private
		 * @returns {Array} aShapes
		 */
		_configShape: function() {
			var aShapes = [];

			sap.ui.define(["sap/gantt/shape/Group"], function(Group) {
				var RectangleGroup = Group.extend("sap.test.RectangleGroup");

				RectangleGroup.prototype.getRLSAnchors = function(oRawData, oObjectInfo) {
					var shapes = this.getShapes();
					var rectangleShapeClass;
					var _x, _y;

					for (var i in shapes) {
						if (shapes[i] instanceof sap.gantt.shape.Rectangle) {
							rectangleShapeClass = shapes[i];
						}
					}

					_x = rectangleShapeClass.getX(oRawData);
					_y = rectangleShapeClass.getY(oRawData, oObjectInfo) + rectangleShapeClass.getHeight() / 2;

					return {
						startPoint: {
							x: _x,
							y: _y,
							height: rectangleShapeClass.getHeight(oRawData)
						},
						endPoint: {
							x: _x + rectangleShapeClass.getWidth(oRawData),
							y: _y,
							height: rectangleShapeClass.getHeight(oRawData)
						}
					};
				};

				return RectangleGroup;
			}, true);

			sap.ui.define(["sap/gantt/shape/Rectangle"], function(Rectangle) {
				var shapeRectangle = Rectangle.extend("sap.test.shapeRectangle");

				shapeRectangle.prototype.getFill = function(oRawData) {
					switch (oRawData.level) {
						case "1":
							return "#FAC364";
						default:
							return "#5CBAE5";
					}
				};

				return shapeRectangle;
			}, true);

			sap.ui.define(["sap/gantt/shape/SelectedShape"], function(SelectedShape) {
				var selectRectange = SelectedShape.extend("sap.test.selectRectange");

				selectRectange.prototype.getStroke = function(oRawData) {
					switch (oRawData.level) {
						case "1":
							return "#B57506";
						default:
							return "#156589";
					}
				};
				selectRectange.prototype.getStrokeWidth = function() {
					return 2;
				};

				return selectRectange;
			});

			// define a milestone (diamond)
			sap.ui.define(["sap/gantt/shape/ext/Diamond", "sap/ui/core/Core"], function(Diamond, Core) {
				var milestone = Diamond.extend("sap.test.Milestone");
				return milestone;
			}, true);

			// define a constraint (triangle)
			sap.ui.define(["sap/gantt/shape/ext/Triangle", "sap/ui/core/Core"], function(Triangle, Core) {
				var constraint = Triangle.extend("sap.test.Constraint");
				return constraint;
			}, true);

			var oTopShape = new sap.gantt.config.Shape({
				key: "top",
				shapeDataName: "order",
				shapeClassName: "sap.test.shapeRectangle",
				selectedClassName: "sap.test.selectRectange",
				level: 5,
				shapeProperties: {
					time: "{startTime}",
					endTime: "{endTime}",
					height: 20,
					isDuration: true,
					enableDnD: true
				}
			});

			var oOrderShape = new sap.gantt.config.Shape({
				key: "order",
				shapeDataName: "order",
				shapeClassName: "sap.test.RectangleGroup",
				selectedClassName: "sap.test.selectRectange",
				level: 5,
				shapeProperties: {
					time: "{startTime}",
					endTime: "{endTime}",
					height: 20,
					isDuration: true,
					enableDnD: true
				},
				groupAggregation: [
					new sap.gantt.config.Shape({
						shapeClassName: "sap.test.shapeRectangle",
						selectedClassName: "sap.test.selectRectange",
						shapeProperties: {
							time: "{startTime}",
							endTime: "{endTime}",
							title: "{tooltip}",
							height: 20,
							isDuration: true,
							enableDnD: true
						}
					})
				]
			});
			// define a milestone config
			var oDiamondConfig = new sap.gantt.config.Shape({
				key: "diamond",
				shapeClassName: "sap.test.Milestone",
				shapeDataName: "milestone",
				level: 5,
				shapeProperties: {
					time: "{endTime}",
					strokeWidth: 2,
					title: "{tooltip}",
					verticalDiagonal: 18,
					horizontalDiagonal: 18,
					yBias: -1,
					fill: "#666666"
				}
			});
			// define a constraint config
			var oTriangleConfig = new sap.gantt.config.Shape({
				key: "triangle",
				shapeClassName: "sap.test.Constraint",
				shapeDataName: "constraint",
				level: 5,
				shapeProperties: {
					time: "{time}",
					strokeWidth: 1,
					title: "{tooltip}",
					fill: "#666666",
					rotationAngle: "{ratationAngle}",
					base: 6,
					height: 6,
					distanceOfyAxisHeight: 3,
					yBias: 7
				}
			});

			var oRelShape = new sap.gantt.config.Shape({
				key: "relationship",
				shapeDataName: "relationship",
				level: 30,
				shapeClassName: "sap.gantt.shape.ext.rls.Relationship",
				shapeProperties: {
					isDuration: false,
					lShapeforTypeFS: true,
					showStart: false,
					showEnd: true,
					stroke: "#848F94",
					strokeWidth: 1,
					type: "{relation_type}",
					fromObjectPath: "{fromObjectPath}",
					toObjectPath: "{toObjectPath}",
					fromDataId: "{fromDataId}",
					toDataId: "{toDataId}",
					fromShapeId: "{fromShapeId}",
					toShapeId: "{toShapeId}",
					title: "{tooltip}",
					id: "{guid}"
				}
			});

			var oCalendarConfig = new sap.gantt.config.Shape({
				key: "nwt",
				shapeClassName: "sap.gantt.shape.cal.Calendar",
				shapeDataName: "nwt",
				level: 32,
				shapeProperties: {
					calendarName: "{id}"
				}
			});

			var oCalendarConfigForWeekends = new sap.gantt.config.Shape({
				key: "nwtForWeekends",
				shapeClassName: "sap.gantt.shape.cal.Calendar",
				shapeDataName: "nwtForWeekends",
				level: 32,
				shapeProperties: {
					calendarName: "{id}"
				}
			});

			aShapes = [oTopShape, oOrderShape, oDiamondConfig, oTriangleConfig, oRelShape, oCalendarConfig, oCalendarConfigForWeekends];

			return aShapes;
		},
		_createTimeAxis: function() {
			var oTimeAxis = new sap.gantt.config.TimeAxis({
				planHorizon: new sap.gantt.config.TimeHorizon({
					startTime: "20171231230000",
					endTime: "20180101040000"
				}),
				// specify initHorizon rather than the default one
				initHorizon: new sap.gantt.config.TimeHorizon({
					startTime: "20171231230000",
					endTime: "20180101040000"
				}),
				zoomStrategy: {
					"15min": {
						innerInterval: {
							unit: sap.gantt.config.TimeUnit.minute,
							span: 15,
							range: 90
						},
						largeInterval: {
							unit: sap.gantt.config.TimeUnit.hour,
							span: 1,
							pattern: "yyyy-MM-dd HH:mm"
						},
						smallInterval: {
							unit: sap.gantt.config.TimeUnit.minute,
							span: 15,
							pattern: "HH:mm"
						}
					},
					"1hour": {
						innerInterval: {
							unit: sap.gantt.config.TimeUnit.hour,
							span: 1,
							range: 90
						},
						largeInterval: {
							unit: sap.gantt.config.TimeUnit.day,
							span: 1,
							pattern: "yyyy-MM-dd"
						},
						smallInterval: {
							unit: sap.gantt.config.TimeUnit.hour,
							span: 1,
							pattern: "HH:mm"
						}
					},
					"8hour": {
						innerInterval: {
							unit: sap.gantt.config.TimeUnit.hour,
							span: 8,
							range: 90
						},
						largeInterval: {
							unit: sap.gantt.config.TimeUnit.day,
							span: 1,
							pattern: "yyyy-MM-dd"
						},
						smallInterval: {
							unit: sap.gantt.config.TimeUnit.hour,
							span: 8,
							pattern: "HH:mm"
						}
					}
				},
				granularity: "15min",
				finestGranularity: "15min",
				coarsestGranularity: "8hour",
				rate: 1
			});

			return oTimeAxis;
		}
	});
});