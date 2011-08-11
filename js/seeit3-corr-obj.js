//All variables related to a touch event
function Touch(){
	this.draggedObj = undefined;
	this.dragging = false;
	this.dragCat = undefined;
	this.dragGraphIndex = undefined;  // -1 means side panel, all others are graph index
	this.finalX = undefined;
	this.finalY = undefined;
}

Touch.prototype = {
	reset: function(){
		this.draggedObj = undefined;
		this.dragging = false;
		this.dragCat = undefined;
		this.dragGraphIndex = undefined;  // -1 means side panel, all others are graph index
		this.finalX = undefined;
		this.finalY = undefined;
	},
}


// Represents the collection of graphs and the area where all graphs are drawn
function GraphCollection(){
	var graphCollection = this;
	this.worksheet = getWorksheet();
	
	this.graphs = [];
	this.selectedGraphIndex = 0;
	
	//Drawing Variables
	this.w = calcGraphWidth();
	this.h = this.calcGraphHeight();
	this.padBot = 60;
	this.padTop = 60;
	this.padLeft = 235;
	this.padRight = 25;
	
	this.numberOfCategories = 0;
	
	for (var key in this.worksheet.data){
		this.numberOfCategories++;
	}
	
	this.nextDefaultCategory = 0;

	this.editedCategories = {};
	for (var key in this.worksheet.data){
		this.editedCategories[key] = this.worksheet.edited[key];
	}
	
	this.editModeEnabled = false;
	
	//Colors
	this.labelColors = {};
	this.colorScale = pv.Colors.category20(0,20);
	this.worksheet.labelMasterList.forEach(function(label, index){
		graphCollection.labelColors[label] = graphCollection.colorScale(index);
	});
	
	
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
}

GraphCollection.prototype = {
	calcGraphHeight: function (){
		return Math.max(this.numberOfCategories*40,
										(window.innerHeight - jQuery('div#notGraph').height()) - 150
									 );
	},
	
	addGraph: function() {
		if(this.graphs.length < 2) {
			this.numGraphs++;
			this.graphs.push(new Graph(this.worksheet, this));
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
		
		this.setChildGraphWidths();
	},
	
	setChildGraphHeights: function(){
		var graphCollection = this;
		graphCollection.graphs.forEach(function(g){
			var oldGH = g.h;
			g.h = graphCollection.h - 40;
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
		
//		$('#radio'+this.graphs[this.selectedGraphIndex].groupingMode).attr('checked',true);
//		$('#checkboxHistogram').attr('checked',this.graphs[this.selectedGraphIndex].histogram);
//		$('#checkboxBoxPlot').attr('checked',this.graphs[this.selectedGraphIndex].boxPlot);
//		$('#fixedIntervalWidth').val(this.graphs[this.selectedGraphIndex].partitionIntervalWidth);
//		$('#fixedGroupSize').val(this.graphs[this.selectedGraphIndex].partitionGroupSize);
//		
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
//		
//		$('#fitScaleToData').attr('checked', this.graphs[this.selectedGraphIndex].fitScaleToData);
//		
//		$('#checkboxMMM').attr('checked', this.graphs[this.selectedGraphIndex].showMMM);
	},
	
	scaleAllGraphsToFit: function(){
//		var max = -Infinity, 
//				min = Infinity;
//		this.graphs.forEach(function(graph){
//			if (graph.xMax > max) max = graph.xMax
//			if (graph.xMin < min) min = graph.xMin
//		});
//		this.graphs.forEach(function(graph){
//			if (!graph.customScale || graph.xMin < graph.scaleMin || graph.xMax > graph.scaleMax)
//				graph.setXScale(min, Math.ceil(max)+0.1);
//		});
	},
	
	addData: function(title, data){
		this.worksheet.data[title] = data;
		this.graphs.forEach(function(graph){
			graph.data[title] = data;
			graph.setupData();
			graph.editedCategories[title] = true;
			graph.nextDefaultLabel[title] = 0;
			
		});
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
		
		this.numberOfAddedCategories++;
		//this.categoryColors[title] = this.colorScale(this.numberOfAddedCategories);
		//this.scaleAllGraphsToFit();
	},
	
	editData: function(oldTitle, title, data){
		
		if (oldTitle != title)
			delete this.worksheet.data[oldTitle];
		this.worksheet.data[title] = data;
		this.graphs.forEach(function(graph){
		//	if (oldTitle != title)
		//		delete graph.data[oldTitle];
		//	graph.data[title] = data;
		//	
		//	var oldMax = graph.xMax;
		//	var oldMin = graph.xMin;
			
			
			graph.xMax = pv.max(graph.getData(), function(d) { return d.x });
			graph.xMin = pv.min(graph.getData(), function(d) { return d.x });
			graph.yMax = pv.max(graph.getData(), function(d) { return d.y });
			graph.yMin = pv.min(graph.getData(), function(d) { return d.y });
		//	graph.setupData();
			
		//	graph.editedCategories[title] = true;
			//graph.n = (graph.dataVals()).length;
			
			//if (graph.includedCategories.indexOf(oldTitle) != -1)
			//	graph.includedCategories[graph.includedCategories.indexOf(oldTitle)] = title;
				
				
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
				if (exampleSpreadsheets[h].worksheets[i].URL == this.worksheet.URL){
					exampleSpreadsheets[h].worksheets[i].edited[title] = true;
				}
			}
		}
		this.worksheet.edited[title] = true;
		
		//if (oldTitle != title){
		//	this.categoryColors[title] = this.categoryColors[oldTitle];
		//	delete this.categoryColors[oldTitle];
		//	
		//}
		//this.scaleAllGraphsToFit();
	},
	
	editSinglePoint: function(set, label, value){
		var graphCol = this;
		this.worksheet.data[set].forEach(function(data){
			if (data.label == label){
				data.value = value;
				graphCol.graphs.forEach(function(graph){
					graph.xMax = pv.max(graph.getData(), function(d) { return d.x });
					graph.xMin = pv.min(graph.getData(), function(d) { return d.x });
					graph.yMax = pv.max(graph.getData(), function(d) { return d.y });
					graph.yMin = pv.min(graph.getData(), function(d) { return d.y });
					//graph.editedCategories[set] = true;
				});
				
				graphCol.editedCategories[set] = true;
				graphCol.worksheet.edited[set] = true;
				
				//graphCol.scaleAllGraphsToFit();
			}
		});
	},
	
	deleteData: function(title){
		delete this.worksheet.data[title];
		this.graphs.forEach(function(graph){
			delete graph.data[title];
			if (graph.includedCategories.indexOf(title) != -1)
				graph.includedCategories.splice(graph.includedCategories.indexOf(title), 1);
			graph.xMax = pv.max(graph.dataVals(), function(d) { return d });
			graph.xMin = pv.min(graph.dataVals(), function(d) { return d });
			
			if (graph.dataVals().length < 4)
				graph.insufDataForFour = true;
			else 
				graph.insufDataForFour = false;
			
			if (graph.dataVals().length < 2)
				graph.insufDataForTwo = true;
			else 
				graph.insufDataForTwo = false;
				
			graph.n = (graph.dataVals()).length;
			
		});
		delete this.editedCategories[title];
		delete this.categoryColors[title];
		this.numberOfCategories--;
		
		this.setH(this.calcGraphHeight());
		
		this.scaleAllGraphsToFit();
		
	},
}

/* Contains variables required for graphics */
function Graph(worksheet, graphCollection){
	var graph = this;
	
	this.graphCollection = graphCollection;
	this.worksheet = worksheet;
	this.data = null;
	
	this.yData = null;
	this.xData = null;
	this.assignY(this.worksheet.dependentVar);
	this.assignX(null);

	if (this.graphCollection.numGraphs == 1){
		this.w = this.graphCollection.w - 60;
	} else
		this.w = (this.graphCollection.w-120)/2;
	
	this.h = this.graphCollection.h - 20;
	
	//Scaling Variables
	this.fitScaleToData = false;
	this.customScale = false;
	
	//Graph Options
	this.showData = true;
	this.udLine = false;
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
	
	this.yAxisPanel = null;
	this.xAxisPanel = null;
	this.twoDistPanel = null;
	
	//Ellipse
	this.ellipseCX = this.w/2;
	this.ellipseCY = this.h/2;
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
	
	assignY: function(category){
		this.yData = category;
		
		if (this.yData != null){
			this.yMax = pv.max(this.worksheet.data[this.yData], function(d) { return d.value });
			this.yMin = pv.min(this.worksheet.data[this.yData], function(d) { return d.value });
			this.yScaleMin = 0;
			this.yScaleMax = Math.ceil(this.yMax);
			//this.y = pv.Scale.linear(0, Math.ceil(this.yMax)).range(0, this.h);
			//this.yHoriz = pv.Scale.linear(0, Math.ceil(this.yMax)).range(0, this.w);
			this.setYScale();
			this.n = this.worksheet.data[this.yData].length;
			//this.graphCollection.updateMenuOptions();
		}
		
		if (this.yData != null && this.xData != null){
			this.setupStats();
		}
	},
	
	assignX: function(category){
		this.xData = category;
		
		if (this.xData != null){
			this.xMax = pv.max(this.worksheet.data[this.xData], function(d) { return d.value });
			this.xMin = pv.min(this.worksheet.data[this.xData], function(d) { return d.value });
			this.xScaleMin = 0;
			this.xScaleMax = Math.ceil(this.xMax);
			//this.x = pv.Scale.linear(0, Math.ceil(this.xMax)).range(0, this.w);
			this.setXScale();
			this.n = this.worksheet.data[this.xData].length;
			//this.graphCollection.updateMenuOptions();
		}
		
		if (this.yData != null && this.xData != null){
			this.setupStats();
		}
	},
	
	getData: function(){
		var graph = this;
		
		var data = [];
		if (this.xData != null && this.yData != null)
			this.worksheet.data[this.xData].forEach(function(dx){
				var label = dx.label;
				graph.worksheet.data[graph.yData].forEach(function(dy){
					if(dy.label == label)
						data.push({"label":label, "x":dx.value, "y":dy.value});
				});
				
			});
		this.graphCollection.updateMenuOptions();
		//this.data = data;
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
		//this.x = pv.Scale.linear(0, Math.ceil(this.xMax)).range(0, this.w);
		//this.y = pv.Scale.linear(0, Math.ceil(this.yMax)).range(0, this.h);
		//this.yHoriz = pv.Scale.linear(0, Math.ceil(this.yMax)).range(0, this.w);
		this.n = data.length;
		
			
		/* Variables defined in normalized coordinates */
		/* median median crosses and squares */
		this.groups = divideDataInto3(data);
		this.medians = getMedianValuesFrom(this.groups);
		
		/* median-median line */ 
		this.mmSlope = findSlope(this.medians[0][0], this.medians[2][0], this.medians[0][1], this.medians[2][1]); 
		this.mmIntercept = findIntercept(this.medians[0][0], this.medians[0][1], this.mmSlope);
		this.medianYDelta = ((this.medians[1][1] - getYValue(this.medians[1][0], this.mmSlope, this.mmIntercept)) / 3); 
		this.adjustedIntercept = this.mmIntercept + this.medianYDelta; 
		this.mmFarLeftYVal = getYValue(this.xMin, this.mmSlope, this.adjustedIntercept); 
		this.mmFarRightYVal = getYValue(this.xMax, this.mmSlope, this.adjustedIntercept);
		
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
		this.userDrawnLinePoints = [{ x:this.xMin, y:this.yMin + (this.yMax - this.yMin)/2 }, 
								 { x:this.xMax, y:this.yMin + (this.yMax - this.yMin)/2 }];
								 
		/* User Ellipse */
		this.angle = 0;
		this.xRadius = this.w/4;
		this.yRadius = this.h/4;
		this.fullRot = pv.range(0, 2 * Math.PI, 0.01);
		this.ellipseCX = this.w/2;
		this.ellipseCY = this.h/2;
		this.pointsInEllipse = numPointsInEllipse(this);
		
		//this.graphCollection.updateMenuOptions();
	},
	
	setXScale: function(min, max){
		var newMin = min || this.xScaleMin;
		var newMax = max || this.xScaleMax;
		
		if (this.fitScaleToData) {
			this.x = pv.Scale.linear(Math.floor(this.xMin), Math.ceil(this.xMax)).range(0, this.w);
			this.yHoriz = pv.Scale.linear(Math.floor(this.yMin), Math.ceil(this.yMax)).range(0, this.w);
		}else{			
			this.x = pv.Scale.linear(newMin, newMax).range(0, this.w);
			this.yHoriz = pv.Scale.linear(0, Math.ceil(this.yMax)).range(0, this.w);
			this.xScaleMin = newMin;
			this.xScaleMax = newMax;
		}
		//this.graphCollection.updateMenuOptions();
	},
	
	setYScale: function(min, max){
		var newMin = min || this.yScaleMin;
		var newMax = max || this.yScaleMax;
		
		if (this.fitScaleToData) {
			this.y = pv.Scale.linear(Math.floor(this.yMin), Math.ceil(this.yMax)).range(0, this.h);	
		}else{
			this.y = pv.Scale.linear(newMin, newMax).range(0, this.h);
			this.yScaleMin = newMin;
			this.yScaleMax = newMax;
		}			
		//this.graphCollection.updateMenuOptions();
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
function Worksheet(param) {
	if (typeof param == 'string'){
		this.URL = param;
		this.local = false;
		this.userCreated = false;
		this.fetchWorksheetData();
	} else {
		if (param.hasOwnProperty('labelMasterlist') == false){
			this.URL = param.feed.link[1].href + "***";
			this.local = true;
			this.userCreated = false;
			this.fetchLocalData(param);
		} else {
			this.URL = param.title;
			this.local = true;
			this.title = param.title;
			this.labelMasterList = param.labelMasterlist;
			this.labelType = param.labelType;
			this.userCreated = true;
			this.data = {};
			this.edited = {};
			userCreatedWorksheet = this;
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
				jQuery('body').trigger({ type:'WorksheetLoaded', worksheet:worksheet });
			},
			error:function() {
			alert("Could not retrieve worksheet. Is it published?");
			}
		});
	},
	
	fetchLocalData: function(feedData) {
		var worksheet = this;
		worksheet.dependentVar = null;
		worksheet.data = worksheet.transformFeedData(feedData);
		worksheet.labelType = feedData.feed.entry[0].content.$t;
		worksheet.labelMasterList = worksheet.getLabels(feedData);        
		worksheet.title = feedData.feed.title.$t;
		worksheet.description = worksheet.getDescription(feedData);
		jQuery('body').trigger({ type:'WorksheetLoaded', worksheet:worksheet });
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
				var re = new RegExp("dependent variable:","i");
				var cat = trim(e.content.$t.replace(re,""));
				if (e.content.$t.search(re) != -1)
					worksheet.dependentVar = cat;
				columnToCategory[e.title.$t.replace(/[0-9]/g,"")] = cat;//e.content.$t;
				data[cat] = [];
			});
												
		var rowToLabelVal = {};
		feedData.feed.entry.filter(function(e) { 
																return parseInt(e.title.$t.replace(/[A-Z]/g,"")) > 1 &&
																	e.title.$t.replace(/[0-9]/g,"") == "A"
															})
												.forEach(function(e){
													if (e.content.$t[0] != '*')
														rowToLabelVal[parseInt(e.title.$t.replace(/[A-Z]/g,""))] = e.content.$t;
												});

		feedData.feed.entry.filter(function(e) { 
																return parseInt(e.title.$t.replace(/[A-Z]/g,"")) > 1 &&
																	e.title.$t.replace(/[0-9]/g,"") != "A";
															})
												.forEach(function(e) {
													data[columnToCategory[e.title.$t.replace(/[0-9]/g,"")]].push(
														{"label": rowToLabelVal[parseInt(e.title.$t.replace(/[A-Z]/g,""))],
														 "value": parseFloat(e.content.$t)
														}
													);													
												});		
		return data;
	},
	
	getDescription: function(feedData){
		var lastCell = feedData.feed.entry.slice(-1)[0].content.$t;
		
		if (lastCell[0] == '*')
			return lastCell.slice(1)
		else
			return "";
	},
	
	getLabels: function(feedData){
		var labels = [];
		feedData.feed.entry.filter(function(e) { 
						return parseInt(e.title.$t.replace(/[A-Z]/g,"")) > 1 &&
							e.title.$t.replace(/[0-9]/g,"") == "A"
					})
		.forEach(function(e){
			labels.push(e.content.$t);
		});
		return labels;
	},
};


function Spreadsheet(key) {
	this.worksheets = [];
	if( typeof key == 'string'){
		this.key = key;
		this.fetchWorksheets();
		this.local = false;
	} else {
		if (key.hasOwnProperty('labelMasterlist') == false){
			this.key = 'local'
			this.constructLocalWorksheets(key);
			this.local = true;
		} else {
			this.key = 'local';
			this.local = true;
			this.constructBlankWorksheet(key);
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
	
	constructLocalWorksheets: function(local) {
		for (var i = 0; i < local.length; i++){
			this.worksheets.push(new Worksheet(local[i]));
		}
		numWorksheets += local.length;  
	},
	
	constructBlankWorksheet: function(attr){
		this.worksheets.push(new Worksheet(attr));
		numWorksheets++;
	},
};


