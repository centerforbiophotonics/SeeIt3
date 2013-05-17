//All variables related to a touch event
//Event types:
//	"dataCorr","dataX","dataY","dataBothBottom","dataBothTop",
//	"ellipseMove","ellipseAdjust",
//	"udLineAdjust","udLineMove",
//	"sideCat","graphXCat","graphYCat"
function Touch(){
	this.dragType = undefined;						//all
	this.draggedObj = undefined;					//sideCat, graphXCat, graphYCat
	this.dragging = false;								//all
	this.dragCat = undefined;							//sideCat
	this.finalX = undefined;							//all
	this.finalY = undefined;							//all
	this.graphPanel = undefined;					//all
	this.graphIndex = undefined;  				//graphXCat, graphYCat
	this.dataObj = undefined;							//dataCorr, dataX, dataY, dataBothTop, dataBothBottom
	this.dragLabel = undefined;						//dataCorr, dataX, dataY
	this.udLineHandleIndex = undefined;		//udLineAdjust
	this.ellipseHandleIndex = undefined;	//ellipseAdjust
	this.topSubgraph = undefined;					//dataBothTop
	this.bottomSubgraph = undefined;			//dataBothBottom
}

Touch.prototype = {
	reset: function(){
		this.dragType = undefined;
		this.draggedObj = undefined;
		this.dragging = false;
		this.dragCat = undefined;
		this.finalX = undefined;
		this.finalY = undefined;
		this.graphPanel = undefined;
		this.graphIndex = undefined;
		this.dataObj = undefined;
		this.dragLabel = undefined;
		this.udLineHandleIndex = undefined;
		this.ellipseHandleIndex = undefined;
		this.topSubgraph = undefined;
		this.bottomSubgraph = undefined;
	},
}


// Represents the collection of graphs and the area where all graphs are drawn
function GraphCollection(){
	var graphCollection = this;
	
	this.data = {};
	this.worksheets = {};
	
	this.graphs = [];
	this.selectedGraphIndex = 0;
	this.datasetsMenuShowing = false;
	this.datasetsVisible = {};
	
	//Drawing Variables
	this.w = this.calcGraphWidth();
	this.h = this.calcGraphHeight();
	this.padBot = 40;
	this.padTop = 90;
	this.padLeft = 35;
	this.padRight = 50;
	
	this.numberOfCategories = 0;
	this.nextDefaultCategory = 0;
	this.editedCategories = {};
	this.editModeEnabled = false;
	this.advancedUser = false;
	
	//Colors
	this.labelColors = {};
	this.colorScale = pv.Colors.category20(0,20);
	this.numLabels = 0;
	this.defaultLabel = 0;
	
	//Display Options
	this.buttonIcon = true;
	this.buttonText = true;
	this.labelTextSize = "16";
	this.tickTextSize = "12";
	this.buckets = 30;
	this.dotSize = 5;
	
	this.numGraphs = 0;
	this.addGraph();
	this.updateMenuOptions();
	
	this.printMode = false;
}

GraphCollection.prototype = {
	addWorksheet: function(worksheet){
		graphCollection = this;
		console.log(worksheet);
		for (key in worksheet.data){
			this.data[key] = worksheet.data[key];
			this.worksheets[worksheet.title] = worksheet;
			this.labelColors[key] = this.colorScale(this.numberOfCategories);
			worksheet.data[key].forEach(function(w){
				if (graphCollection.labelColors[w.label] == undefined)
					graphCollection.labelColors[w.label] = graphCollection.colorScale(graphCollection.numLabels++); 
			});
			this.numberOfCategories++;
			this.editedCategories[key] = worksheet.edited[key];
			this.datasetsVisible[worksheet.title] = false;
		}
	},
	
	removeWorksheet: function(title){
		var worksheet = this.worksheets[title];
		
		for (var key in worksheet.data){
			this.graphs.forEach(function(g){
				if (key == g.xData) g.xData = null;
				if (key == g.yData) g.yData = null;
			});
		}
		
		for (key in worksheet.data){
			delete this.data[key];
			this.numberOfCategories--;
			delete this.editedCategories[key];
		}
		delete this.datasetsVisible[title];
		delete this.worksheets[title];
		
		exampleSpreadsheets.forEach(function(s){
			var ri = null;
			s.worksheets.forEach(function(w,i){
				if (w.title == title)
					ri = i;
			});
			if (ri != null)
				s.worksheets.splice(ri,1);
		});
	},
	
	calcGraphHeight: function (){		
		return	(window.innerHeight - jQuery('div#notGraph').height()) - 158							
	},
	
	calcGraphWidth: function(){
		if (this.datasetsMenuShowing)
			return window.innerWidth - $('#datasets').width() - 136;
		else
			return window.innerWidth - 115;
	},
	
	addGraph: function() {
		if(this.graphs.length < 2) {
			this.numGraphs++;
			this.graphs.push(new Graph(this));
			if (this.graphs.length == 2){
				jQuery('#divisionsValue').html(8);
				this.buckets = 8;
				this.graphs.forEach(function(g){
					g.xRadius = g.xRadius/2;
					g.yRadius = g.yRadius/2; 
				})
			}
			this.setChildGraphWidths();
			this.setH(this.calcGraphHeight());
		}
	},
	
	removeGraph: function(graph){
		this.numGraphs--;
		
		this.graphs.splice(this.graphs.indexOf(graph),1);
		
		this.setH(this.calcGraphHeight());
			
		this.selectedGraphIndex = 0;
			
		if (this.graphs.length == 0) this.addGraph();
		
		if (this.graphs.length == 1){
			jQuery('#divisionsValue').html(30);
			this.buckets = 30;
		}
		
		this.setChildGraphWidths();
	},
	
	setChildGraphHeights: function(){
		var graphCollection = this;
		graphCollection.graphs.forEach(function(g){
			var oldGH = g.h;
			g.h = graphCollection.h - 60;
			g.setYScale();
			g.ellipseCY *= g.h/oldGH;
		});
	},
	
	setChildGraphWidths: function(){
		var graphCollection = this;
		if (graphCollection.graphs.length > 1)
			graphCollection.graphs.forEach(function(g){
				var oldGW = g.w;
				g.w = (graphCollection.w-200)/2;
				g.setXScale();
				g.ellipseCX *= g.w/oldGW;
			});
		else
			graphCollection.graphs.forEach(function(g){
				var oldGW = g.w;
				g.w = graphCollection.w - 50;
				g.setXScale();
				g.ellipseCX *= g.w/oldGW; 
			});
	},
	
	setW: function(width){
		this.w = width;
		this.setChildGraphWidths();
	},
	
	setH: function(height){
		this.h = height;
		this.setChildGraphHeights();
	},
	
	updateMenuOptions: function(){
		$("#checkboxShowUserLine").attr('checked',this.graphs[this.selectedGraphIndex].udLine);
		$("#checkboxUDSquares").attr('checked',this.graphs[this.selectedGraphIndex].udSquares);
		$("#checkboxShowEllipse").attr('checked',this.graphs[this.selectedGraphIndex].udEllipse);
		$("#checkboxShowData").attr('checked',this.graphs[this.selectedGraphIndex].showData);
		$("#fitScalesToData").attr('checked',this.graphs[this.selectedGraphIndex].fitScaleToData);
		
		$("#checkboxShowMMDots").attr('checked',this.graphs[this.selectedGraphIndex].mmDots);
		$("#checkboxShowMMRects").attr('checked',this.graphs[this.selectedGraphIndex].mmDivs);
		$("#checkboxShowMMLine").attr('checked',this.graphs[this.selectedGraphIndex].mmLine);
		$("#checkboxShowMMEqn").attr('checked',this.graphs[this.selectedGraphIndex].mmEQ);
		
		$("#checkboxShowLeastSquaresLine").attr('checked',this.graphs[this.selectedGraphIndex].lsLine);
		$("#checkboxShowLeastSquaresSquares").attr('checked',this.graphs[this.selectedGraphIndex].lsSquares);
		$("#checkboxShowLeastSquaresEquation").attr('checked',this.graphs[this.selectedGraphIndex].lsEQ);
		$("#checkboxShowLeastSquaresRValue").attr('checked',this.graphs[this.selectedGraphIndex].lsR);
		$("#showBothDist").attr('checked',this.graphs[this.selectedGraphIndex].twoDistView);
		$("#promptForLabel").attr('checked',this.graphs[this.selectedGraphIndex].labelPrompt);
		
		if (this.graphs[this.selectedGraphIndex].xData != null){
			$('#textXMin').val(this.graphs[this.selectedGraphIndex].x.domain()[0]);
			$('#textXMax').val(this.graphs[this.selectedGraphIndex].x.domain()[1]);
		} else {
			$('#textXMin').val("NA");
			$('#textXMax').val("NA");
		}
		
		if (this.graphs[this.selectedGraphIndex].yData != null){
			$('#textYMin').val(this.graphs[this.selectedGraphIndex].y.domain()[0]);
			$('#textYMax').val(this.graphs[this.selectedGraphIndex].y.domain()[1]);
		} else {
			$('#textYMin').val("NA");
			$('#textYMax').val("NA");
		}
	},
	
	addData: function(title, data){
		this.worksheet.data[title] = data;
		
		this.numberOfCategories++;
		
		this.setH(this.calcGraphHeight());
		
		this.editedCategories[title] = true;
		
		for (var h = 0; h < exampleSpreadsheets.length; h++) {
			for (var i = 0; i < exampleSpreadsheets[h].worksheets.length; i++) {
				if (exampleSpreadsheets[h].worksheets[i].URL == this.worksheet.URL){
					exampleSpreadsheets[h].worksheets[i].edited[title] = true;
				}
			}
		}
		this.worksheet.edited[title] = true;	
		
	},
	
	editData: function(worksheet, oldTitle, title, data){
		
		if (oldTitle != title)
			delete this.worksheet.data[oldTitle];
		worksheet.data[title] = data;
		this.graphs.forEach(function(graph){
			graph.dataChanged = true;
			
			if (graph.xData != null && graph.yData != null){
				graph.xMax = pv.max(graph.getData(), function(d) { return d.x });
				graph.xMin = pv.min(graph.getData(), function(d) { return d.x });
				graph.yMax = pv.max(graph.getData(), function(d) { return d.y });
				graph.yMin = pv.min(graph.getData(), function(d) { return d.y });
				graph.n = (graph.getData()).length;
				graph.setupStats();
			} else if ( graph.xData != null ){
				graph.xMax = pv.max(worksheet.data[graph.xData], function(d) { return d.value });
				graph.xMin = pv.min(worksheet.data[graph.xData], function(d) { return d.value });
				graph.n = worksheet.data[graph.xData].length;
			} else if (graph.yData != null){
				graph.yMax = pv.max(worksheet.data[graph.yData], function(d) { return d.value });
				graph.yMin = pv.min(worksheet.data[graph.yData], function(d) { return d.value });
				graph.n = worksheet.data[graph.yData].length;
			}
				
			if (graph.xMax > graph.scaleMax)
				graph.setXScale(null, graph.xMax)
			
			if (graph.xMin < graph.scaleMin)
				graph.setXScale(graph.xMin, null)
		});
		
		if (oldTitle != title)
			delete this.editedCategories[oldTitle];
		this.editedCategories[title] = true;
		
		for (var h = 0; h < exampleSpreadsheets.length; h++) {
			for (var i = 0; i < exampleSpreadsheets[h].worksheets.length; i++) {
				if (exampleSpreadsheets[h].worksheets[i].URL == worksheet.URL){
					exampleSpreadsheets[h].worksheets[i].edited[title] = true;
				}
			}
		}
		worksheet.edited[title] = true;
	},
	
	editSinglePoint: function(worksheet, set, label, value){
		var graphCol = this;
		worksheet.data[set].forEach(function(data){
			if (data.label == label){
				data.value = value;
				graphCol.graphs.forEach(function(graph){
					graph.dataChanged = true;
					if (graph.xData != null && graph.yData != null){
						graph.xMax = pv.max(graph.getData(), function(d) { return d.x });
						graph.xMin = pv.min(graph.getData(), function(d) { return d.x });
						graph.yMax = pv.max(graph.getData(), function(d) { return d.y });
						graph.yMin = pv.min(graph.getData(), function(d) { return d.y });
						graph.setupStats();
					} else if ( graph.xData != null ){
						graph.xMax = pv.max(worksheet.data[graph.xData], function(d) { return d.value });
						graph.xMin = pv.min(worksheet.data[graph.xData], function(d) { return d.value });
					} else if (graph.yData != null){
						graph.yMax = pv.max(worksheet.data[graph.yData], function(d) { return d.value });
						graph.yMin = pv.min(worksheet.data[graph.yData], function(d) { return d.value });
					}
				});
				
				graphCol.editedCategories[set] = true;
				worksheet.edited[set] = true;
				
				
			}
		});
	},
	
	deleteData: function(title){
		delete this.worksheet.data[title];
		this.graphs.forEach(function(graph){
			if (graph.xData == title)
				graph.assignX(null);
				
			if (graph.yData == title)
				graph.assignY(null);
			
		});
		delete this.editedCategories[title];
		this.numberOfCategories--;
		
		this.setH(this.calcGraphHeight());
	},
}

/* Contains variables required for graphics */
function Graph(graphCollection){
	var graph = this;
	
	this.graphCollection = graphCollection;
	//this.worksheet = worksheet;
	this.data = this.graphCollection.data;	//Master list of all categories
	this.dataList;													//Filtered list of categories currently displayed if both axes not null
	
	this.yData = null;
	this.xData = null;
	this.assignY(null);
	this.assignX(null);

	if (this.graphCollection.numGraphs == 1){
		this.w = this.graphCollection.w - 60;
	} else
		this.w = (this.graphCollection.w-120)/2;
	
	this.h = this.graphCollection.h - 20;
	
	//Scaling Variables
	this.fitScaleToData = false;
	this.customScale = false;
	
	this.xAxisLog = false;
	this.yAxisLog = false;
	
	//Graph Options
	this.showData = true;
	this.udLine = false;
	this.udSquares = false;
	this.udEllipse = false;
	this.twoDistView = false;
	
	this.mmLine = false;
	this.mmDots = false;
	this.mmDivs = false;
	this.mmEQ = false;
	
	this.lsLine = false;
	this.lsSquares = false;
	this.lsEQ = false;
	this.lsR = false;
	
	this.labelPrompt = false;
	
	this.yAxisPanel = null;
	this.xAxisPanel = null;
	this.twoDistPanel = null;
	
	//Ellipse
	this.ellipseCX = this.w/2;
	this.ellipseCY = this.h/2;
	
	this.userDrawnLinePoints = null;
	this.pointsInEllipse = null;
	
	this.dataChanged = false;
}

Graph.prototype = {
	setW: function(wVal){		
		var oldW = this.w;
		this.w = wVal;
		this.setXScale();
	},
	
	setH: function(hVal){
		var oldH = this.h;
		this.h = hVal;
		this.setYScale();
	},
	
	toString: function(){
		var colHead = 'Label\tX Value\tY Value\t';
		var subHead = this.worksheet.labelType + '\t' +
									this.xData + '\t' +
									this.yData;
		var data = {};
		
		if (this.xData != null) {
			this.worksheet.data[this.xData].forEach(function(d){
				data[d.label] = d.label+'\t'+d.value.toFixed(1)+'\t';
			});
		}
		
		if (this.yData != null){
			this.worksheet.data[this.yData].forEach(function(d){
				if (data.hasOwnProperty(d.label)) 
					data[d.label] += d.value.toFixed(1)+'\t';
				else
					data[d.label] = d.label+'\t\t'+d.value.toFixed(1)+'\t';
			});
		}
		
		var string = colHead+'\n';
		string += subHead + '\n';
		for (var key in data){
			string += trim(data[key]) + '\n';
		}
		return string;
	},

	
	assignY: function(category){
		this.yData = category;
		this.dataChanged = true;
		this.userDrawnLinePoints = null;
		this.pointsInEllipse = null;
		if (this.yData != null){
			this.yMax = pv.max(this.data[this.yData], function(d) { return d.value });
			this.yMin = pv.min(this.data[this.yData], function(d) { return d.value });
			this.yScaleMin = 0;
			this.yScaleMax = Math.ceil(this.yMax);
			this.setYScale();
			this.n = this.data[this.yData].length;
		}
		
		if (this.yData != null && this.xData != null){
			this.setupStats();
		}
	},
	
	assignX: function(category){
		console.log(category);
		this.xData = category;
		this.userDrawnLinePoints = null;
		this.pointsInEllipse = null;
		this.dataChanged = true;
		if (this.xData != null){
			this.xMax = pv.max(this.data[this.xData], function(d) { return d.value });
			this.xMin = pv.min(this.data[this.xData], function(d) { return d.value });
			this.xScaleMin = 0;
			this.xScaleMax = Math.ceil(this.xMax);
			this.setXScale();
			this.n = this.data[this.xData].length;
		}
		
		if (this.yData != null && this.xData != null){
			this.setupStats();
		}
	},
	
	getData: function(){
		var graph = this;
		if (this.dataChanged){
			var data = [];
			if (this.xData != null && this.yData != null)
				this.data[this.xData].forEach(function(dx){
					var label = dx.label;
					graph.data[graph.yData].forEach(function(dy){
						if(dy.label == label)
							data.push({"label":label, "x":dx.value, "y":dy.value});
					});
					
				});
			this.graphCollection.updateMenuOptions();
			this.dataList = data;
			this.dataChanged = false;
		}
		return this.dataList;
	},
	
	getClonedData: function(){
		var graph = this;
	
		var data = [];
		if (this.xData != null && this.yData != null){
			this.dataList.forEach(function(d){
				data.push({"label":d.label, "x":d.x, "y":d.y});
			});
		}
		this.graphCollection.updateMenuOptions();
	
		return data;
		
	},
	
	setupStats: function(){
		var data = this.getData();
		this.xMax = pv.max(data, function(d) { return d.x });
		this.yMax = pv.max(data, function(d) { return d.y });
		this.xMin = pv.min(data, function(d) { return d.x });
		this.yMin = pv.min(data, function(d) { return d.y });
		this.setXScale();
		this.setYScale();
		this.n = data.length;
		
			
		/* Variables defined in normalized coordinates */
		/* median median crosses and squares */
		this.groups = divideDataInto3(data);
		if (this.groups != null && this.groups != undefined){
			this.medians = getMedianValuesFrom(this.groups);
			
			/* median-median line */ 
			this.mmSlope = findSlope(this.medians[0][0], this.medians[2][0], this.medians[0][1], this.medians[2][1]); 
			this.mmIntercept = findIntercept(this.medians[0][0], this.medians[0][1], this.mmSlope);
			this.medianYDelta = ((this.medians[1][1] - getYValue(this.medians[1][0], this.mmSlope, this.mmIntercept)) / 3); 
			this.adjustedIntercept = this.mmIntercept + this.medianYDelta; 
			this.mmFarLeftYVal = getYValue(this.xMin, this.mmSlope, this.adjustedIntercept); 
			this.mmFarRightYVal = getYValue(this.xMax, this.mmSlope, this.adjustedIntercept);
		}
		
		/* Least-Squares Regression Line */
		var xs = [];
		var ys = [];
		for (var i = 0; i < data.length; i++){
			xs.push(data[i].x);
			ys.push(data[i].y);
		}
		this.lsSlope = getR(data)*(getSD(ys)/getSD(xs));
		this.lsIntercept = getMean(ys) - this.lsSlope*getMean(xs);
		this.lsFarLeftYVal = getYValue(this.xMin, this.lsSlope, this.lsIntercept);
		this.lsFarRightYVal = getYValue(this.xMax, this.lsSlope, this.lsIntercept);
		
		/* User Drawn Line*/
		if (this.userDrawnLinePoints == null)
			this.userDrawnLinePoints = [{ x:this.xMin, y:this.yMin + (this.yMax - this.yMin)/2 }, 
								 { x:this.xMax, y:this.yMin + (this.yMax - this.yMin)/2 }];
								 
		/* User Ellipse */
		if (this.pointsInEllipse == null){
			this.angle = 0;
			this.xRadius = this.w/4;
			this.yRadius = this.h/4;
			this.fullRot = pv.range(0, 2 * Math.PI, 0.01);
			this.ellipseCX = this.w/2;
			this.ellipseCY = this.h/2;
			this.pointsInEllipse = numPointsInEllipse(this);
		}
	},
	
	setXScale: function(min, max){
		var newMin = min || this.xScaleMin;
		var newMax = max || this.xScaleMax;
		
		if (min == 0)
			newMin = min;
			
		if (max == 0)
			newMax = max;
		
		if (this.fitScaleToData) {
			this.x = (this.xAxisLog? 
									pv.Scale.log(Math.floor(this.xMin) + (Math.floor(this.xMin) == 0 ? 0.00001 : 0.0),
															 Math.ceil(this.xMax) + (Math.ceil(this.xMax) == 0 ? 0.00001 : 0.0)).range(0, this.w).base(Math.E):
									pv.Scale.linear(Math.floor(this.xMin), Math.ceil(this.xMax)).range(0, this.w));
									
			this.yHoriz = (this.yAxisLog?
											pv.Scale.log(Math.floor(this.yMin) + (Math.floor(this.yMin) == 0 ? 0.00001 : 0.0),
																	 Math.ceil(this.yMax) + (Math.ceil(this.yMax) == 0 ? 0.00001 : 0.0)).range(0, this.w).base(Math.E):
											pv.Scale.linear(Math.floor(this.yMin), Math.ceil(this.yMax)).range(0, this.w));
		}else{			
			this.x = (this.xAxisLog?
									pv.Scale.log(newMin + (newMin == 0.0 ? 0.00001 : 0.0),
															 newMax + (newMax == 0.0 ? 0.00001 : 0.0)).range(0, this.w).base(Math.E):
									pv.Scale.linear(newMin, newMax).range(0, this.w));
									
			this.yHoriz = (this.yAxisLog?
											pv.Scale.log(0.00001, Math.ceil(this.yMax) + (Math.ceil(this.yMax) == 0 ? 0.00001 : 0.0)).range(0, this.w).base(Math.E):
											pv.Scale.linear(0, Math.ceil(this.yMax)).range(0, this.w));
											
			this.xScaleMin = newMin;
			this.xScaleMax = newMax;
		}
	},
	
	setYScale: function(min, max){
		var newMin = min || this.yScaleMin;
		var newMax = max || this.yScaleMax;
		
		if (min == 0)
			newMin = min;
			
		if (max == 0)
			newMax = max;
		
		if (this.fitScaleToData) {
			this.y = (this.yAxisLog?
								pv.Scale.log(Math.floor(this.yMin) + (Math.floor(this.yMin) == 0 ? 0.00001 : 0.0),
														 Math.ceil(this.yMax) + (Math.ceil(this.yMax) == 0 ? 0.00001 : 0.0)).range(0, this.h).base(Math.E):
								pv.Scale.linear(Math.floor(this.yMin), Math.ceil(this.yMax)).range(0, this.h));	
								
			this.yHoriz = (this.yAxisLog? 
											pv.Scale.log(Math.floor(this.yMin) + (Math.floor(this.yMin) == 0 ? 0.00001 : 0.0),
																	 Math.ceil(this.yMax) + (Math.ceil(this.yMax) == 0 ? 0.00001 : 0.0)).range(0, this.w).base(Math.E):
											pv.Scale.linear(Math.floor(this.yMin), Math.ceil(this.yMax)).range(0, this.w));
		}else{
			this.y = (this.yAxisLog?
									pv.Scale.log(newMin + (newMin == 0.0 ? 0.00001 : 0.0),
															 newMax + (newMax == 0.0 ? 0.00001 : 0.0)).range(0, this.h).base(Math.E):
									pv.Scale.linear(newMin, newMax).range(0, this.h));
									
			this.yHoriz = (this.yAxisLog?
											pv.Scale.log(newMin + (newMin == 0.0 ? 0.00001 : 0.0),
																	 newMax + (newMax == 0.0 ? 0.00001 : 0.0)).range(0, this.w).base(Math.E):
											pv.Scale.linear(newMin,newMax).range(0, this.w));
			this.yScaleMin = newMin;
			this.yScaleMax = newMax;
		}			
	},
}



function getWorksheetByURL(URL) {
	for (var h = 0; h < exampleSpreadsheets.length; h++) {
		for (var i = 0; i < exampleSpreadsheets[h].worksheets.length; i++) {
			if (exampleSpreadsheets[h].worksheets[i].URL == URL){
			return exampleSpreadsheets[h].worksheets[i];
			}
		}
	}
}

function getWorksheet(){
	var URL = jQuery('#workSheetSelector').val();
	var worksheet = getWorksheetByURL(URL);
	return worksheet;
}

var userCreatedWorksheet;

var numWorksheets = 0;
var numDatasets = 0;
function Worksheet(param) {
	if (typeof param == 'string'){
		this.URL = param;
		this.local = false;
		this.userCreated = false;
		this.fetchWorksheetData();
		graphCollection.addWorksheet(this);
	} else {
	
		if (param.hasOwnProperty('userDefined')){
			this.URL = param.title;
			this.local = true;
			this.title = param.title;
			this.labelMasterList = param.labelMasterList;
			this.labelType = param.labelType;
			this.userCreated = true;
			this.data = param.data;
			this.edited = param.edited;
			userCreatedWorksheet = this;
			graphCollection.addWorksheet(this);		
		} else if (param.hasOwnProperty('name')){
			console.log("CHIDR");
			this.URL = "https://lgh.ohsu.edu/app/seeit/dataset/category/" + param.name;
			this.local = false;
			this.userCreate = false;
			this.fetchCHIDRData(param);
			graphCollection.addWorksheet(this);
			console.log(param);
		} else {
			this.URL = param.feed.link[1].href + "***";
			this.local = true;
			this.userCreated = false;
			this.fetchLocalData(param);
		}
	}
}


Worksheet.prototype = {
	fetchWorksheetData: function() {
		var worksheet = this;
		jQuery.jsonp({ url:this.URL + '?alt=json', callbackParameter: "callback", 
			success:function(feedData) {
				worksheet.dependentVar = null;
				worksheet.data = worksheet.transformFeedData(feedData);
				worksheet.labelType = feedData.feed.entry[0].content.$t;
				worksheet.labelMasterList = worksheet.getLabels(feedData);        
				worksheet.title = feedData.feed.title.$t;
				worksheet.edited = {}
				worksheet.description = worksheet.getDescription(feedData);
				for (var key in worksheet.data){
					worksheet.edited[key] = false;
				}
				jQuery('body').trigger({ type:'WorksheetLoaded', worksheet:worksheet, refresh:true  });
			},
			error:function() {
			alert("Could not retrieve worksheet. Is it published?");
			}
		});
	},
	
	fetchCHIDRData: function(params){
		var worksheet = this;
		worksheet.data = {};
		worksheet.edited = {};
		worksheet.chidr_id = {};
		
		console.log(params);
		params.datasets.forEach(function(d, index){
			console.log(d);
			$.ajax({
				type: "GET",
				contentType: "application/javascript",
				dataType: "jsonp",
				url: 'https://lgh.ohsu.edu/app/seeit/dataset/id/'+d.id,
				success: function(data, textStatus, jqXHR){ 
					console.log("fetch Dataset");
					d.data = data.dataPoints;
					worksheet.dependentVar = null;
					worksheet.data[d.name] = d.data;
					worksheet.chidr_id[d.name] = d.id;
					worksheet.labelType = "Individual"
					worksheet.labelMasterList = [];
					d.data.forEach(function(dat){
						worksheet.labelMasterList.push(dat.label);
					});
					worksheet.title = params.name;
					worksheet.description = params.description;
					//worksheet.chidr_id = d.id;
					for (var key in worksheet.data){
						worksheet.edited[key] = false;
					}
					
					if (index == params.datasets.length-1)
						jQuery('body').trigger({ type:'CHIDRDatasetLoaded', worksheet:worksheet, refresh:true});
					else
						jQuery('body').trigger({ type:'CHIDRDatasetLoaded', worksheet:worksheet, refresh:false});
				},
				error: function(jqXHR, textStatus, errorThrown){ 
					console.log(jqXHR); 
					console.log(textStatus); 
					console.log(errorThrown);
				}
			});
		
		});
		
	},
	
	fetchLocalData: function(feedData) {
		var worksheet = this;
		worksheet.dependentVar = null;
		worksheet.data = worksheet.transformFeedData(feedData);
		worksheet.labelType = feedData.feed.entry[0].content.$t;
		worksheet.labelMasterList = worksheet.getLabels(feedData);        
		worksheet.title = feedData.feed.title.$t;
		worksheet.edited = {}
		worksheet.description = worksheet.getDescription(feedData);
		for (var key in worksheet.data){
			worksheet.edited[key] = false;
		}
		jQuery('body').trigger({ type:'WorksheetLoaded', worksheet:worksheet, refresh:true  });
	},
	
	transformFeedData: function(feedData) {
		var data = {};
		var worksheet = this;
		
		//Creates of map of column letters to data categories; 
		//ALSO maps each category to an empty array of maps (in data obj)
		var columnToCategory = {};
		feedData.feed.entry.filter(function(e) { return parseInt(e.title.$t.replace(/[A-Z]/g,"")) == 1 })
			.slice(1)
			.forEach(function(e) {
				var cat = trim(e.content.$t.replace(new RegExp("dependent variable:","i"),"")
										.replace(new RegExp("\\n", "g" ),"")
										.replace(new RegExp("\'", "g"),"")
										.replace(new RegExp("\"", "g"),""));
				columnToCategory[e.title.$t.replace(/[0-9]/g,"")] = cat;
				data[cat] = [];
			});
												
		var rowToLabelVal = {};
		feedData.feed.entry.filter(function(e) { 
																return parseInt(e.title.$t.replace(/[A-Z]/g,"")) > 1 &&
																	e.title.$t.replace(/[0-9]/g,"") == "A"
															})
												.forEach(function(e){
													if (/(NOTE\:)|(SOURCE\:)|(\*)/.test(e.content.$t) == false)
														rowToLabelVal[parseInt(e.title.$t.replace(/[A-Z]/g,""))] = e.content.$t;
												});

		feedData.feed.entry.filter(function(e) { 
																return parseInt(e.title.$t.replace(/[A-Z]/g,"")) > 1 &&
																	e.title.$t.replace(/[0-9]/g,"") != "A" &&
																	/(NOTE\:)|(SOURCE\:)|(\*)/.test(e.content.$t) == false;
															})
												.forEach(function(e) {
													if (columnToCategory[e.title.$t.replace(/[0-9]/g,"")] != undefined &&
															rowToLabelVal[parseInt(e.title.$t.replace(/[A-Z]/g,""))] != undefined)
														data[columnToCategory[e.title.$t.replace(/[0-9]/g,"")]].push(
															{"label": trim(rowToLabelVal[parseInt(e.title.$t.replace(/[A-Z]/g,""))]),
															 "value": parseFloat(e.content.$t)
															}
														);													
												});	
		return data;
	},
	
	getDescription: function(feedData){
		//var lastCell = feedData.feed.entry.slice(-1)[0].content.$t;
		
		//if (lastCell[0] == '*')
			//return lastCell.slice(1)
		//else
			//return "";
		var description = "";
		
		feedData.feed.entry.forEach(function(e){
			if (/(NOTE\:)|(SOURCE\:)|(\*)/.test(e.content.$t)){
				description += e.content.$t.replace(/(NOTE\:)|(SOURCE\:)|(\*)/, ""); 
			}	
		});
		
		return description;
	},
	
	getLabels: function(feedData){
		var labels = [];
		feedData.feed.entry.filter(function(e) { 
						return parseInt(e.title.$t.replace(/[A-Z]/g,"")) > 1 &&
							e.title.$t.replace(/[0-9]/g,"") == "A"
					})
		.filter(function(e){
			return e.content.$t[0] != '*';
		})
		.forEach(function(e){
			labels.push(trim(e.content.$t));
		});
		return labels;
	},
	
	toString: function(){
		var heading = "";
		var dataStrings = [];
		var fullString = "";
		
		heading += this.labelType + "\t";
		this.labelMasterList.forEach(function(label){
			dataStrings.push(label+"\t");
		});
		data = this.data;
		for (var key in data){
			heading += key+"\t";
			
			this.labelMasterList.forEach(function(l,i){
				var val = "";
				data[key].forEach(function(d){
					if (l == d.label){
						val = d.value.toFixed(2);
					}
				});
				val += "\t";
				dataStrings[i] += val;
			});
		}
		fullString = heading + "\n";
		dataStrings.forEach(function(d){
			fullString += d + "\n";
		});
		
		return fullString;
	},
};


function Spreadsheet(key) {
	this.worksheets = [];	
	this.categories = [];
	
	if( typeof key == 'string'){
		if (key == 'ohsu-chidr'){
			this.key = 'ohsu-chidr';
			this.fetchCHIDRCategories();
			this.local = false;
		} else {
			this.key = key;
			this.fetchWorksheets();
			this.local = false;			
		}
		
	} else {
		if (key.hasOwnProperty('userDefined') == false){
			this.key = 'local'
			this.constructLocalWorksheets(key);
			this.local = true;
		} else {
			this.key = 'local';
			this.local = true;
			this.constructUserDefinedWorksheet(key);
		}
	}
}

Spreadsheet.prototype = {
	getWorksheetURLs: function(callback) {
		var spreadsheet = this;
		jQuery.jsonp({ url:'https://spreadsheets.google.com/feeds/worksheets/' + this.key + '/public/basic?alt=json',
			callbackParameter: "callback",
			success:callback,
			error:function() {
			alert("Could not retrieve worksheets from the spreadsheet. Is it published?");
		}});
	},
	
	fetchWorksheets: function() {
		var spreadsheet = this;
		this.getWorksheetURLs(function(feedData) {
			for (var i = 0; i < feedData.feed.entry.length; i++) {
				spreadsheet.worksheets.push(new Worksheet(feedData.feed.entry[i].link[1].href));
			}
			numWorksheets += feedData.feed.entry.length;
		});
	},
	
	fetchCHIDRCategories: function() {
		var categories = this.categories;
		var spreadsheet = this;
		
		$.ajax({
			type: "GET",
			contentType: "application/javascript",
			dataType: "jsonp",
			url: 'https://lgh.ohsu.edu/app/seeit/dataset/categories',
			success: function(data, textStatus, jqXHR){ 
				categories = data;		
				spreadsheet.fetchCHIDRNames(categories);
			},
			error: function(jqXHR, textStatus, errorThrown){ 
				console.log(jqXHR); 
				console.log(textStatus); 
				console.log(errorThrown);
			}
		});
	},
	
	fetchCHIDRNames: function(categories){	
		var spreadsheet = this;
		$.ajax({
			type: "GET",
			contentType: "application/javascript",
			dataType: "jsonp",
			url: 'https://lgh.ohsu.edu/app/seeit/dataset/names',
			success: function(data, textStatus, jqXHR){ 
				var names = data;
				numDatasets += names.length;
				
				console.log(categories);
				console.log(names);
				categories.forEach(function(c){
					c.datasets = [];
				});
				
				names.forEach(function(n){
					categories.forEach(function(c){
						if (c.name == n.categoryId){
							c.datasets.push({"id": n.id, "name": n.name});
							//spreadsheet.fetchCHIDRDataset(c.datasets[c.datasets.length-1])
						}
					});
				});
				
				categories.forEach(function(c){
					spreadsheet.worksheets.push(new Worksheet(c));
				});
				
				console.log(categories); 
			},
			error: function(jqXHR, textStatus, errorThrown){ 
				console.log(jqXHR); 
				console.log(textStatus); 
				console.log(errorThrown);
			}
		});
	},
	
	fetchCHIDRDataset: function (dataset){
		
	},
	
	constructLocalWorksheets: function(local) {
		for (var i = 0; i < local.length; i++){
			this.worksheets.push(new Worksheet(local[i]));
		}
		numWorksheets += local.length;  
	},
	
	constructUserDefinedWorksheet: function(attr){
		this.worksheets.push(new Worksheet(attr));
		numWorksheets++;
	},
};


