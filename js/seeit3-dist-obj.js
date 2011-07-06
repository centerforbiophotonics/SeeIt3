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
	this.worksheet = getWorksheet();
	
	this.graphs = [];
	this.selectedGraphIndex = 0;
	
	//Drawing Variables
	this.w = calcGraphWidth();
	this.h = calcGraphHeight();
	this.padBot = 20;
	this.padTop = 30;
	this.padLeft = 200;
	this.padRight = 25;
	this.defaultGraphHeight = 300;
	this.labelTextSize = "16";
	this.tickTextSize = "12";
	this.buckets = 30;
	this.bucketDotSize = 5;
	this.numberOfCategories = 0;
	for (var key in this.worksheet.data){
		this.numberOfCategories++;
	}
	
	//Colors
	this.categoryColors = {};
	var colorScale = pv.Colors.category20(0,this.numberOfCategories);
	var counter = 0;
	for (var key in this.worksheet.data){
		this.categoryColors[key] = colorScale(counter);
		counter++;
	}
	
	this.addGraph();
	this.updateMenuOptions();
}

GraphCollection.prototype = {
	addGraph: function() {
		this.graphs.push(new Graph(this.worksheet, this));
		
		if (this.graphs.length > 4)
			this.setH(this.defaultGraphHeight*this.graphs.length);
		else 
			this.setH(calcGraphHeight());
	},
	
	removeGraph: function(graph){
		this.graphs.splice(this.graphs.indexOf(graph),1);
		
		if (this.graphs.length > 4)
			this.setH(this.defaultGraphHeight*this.graphs.length);
		else 
			this.setH(calcGraphHeight());
			
		this.selectedGraphIndex = -1;
			
		if (this.graphs.length == 0) this.addGraph();
	},
	
	setChildGraphHeights: function(){
		var graphCollection = this;
		if (graphCollection.graphs.length > 4)
			graphCollection.graphs.forEach(function(g){
				g.h = graphCollection.defaultGraphHeight;
			});
		else
			graphCollection.graphs.forEach(function(g){
				g.h = graphCollection.h/graphCollection.graphs.length;
			});
	},
	
	setChildGraphWidths: function(){
		var graphCollection = this;
		graphCollection.graphs.forEach(function(g){
			g.w = graphCollection.w;
			g.setXScale();
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
		$('#radio'+this.graphs[this.selectedGraphIndex].groupingMode).attr('checked',true);
		$('#checkboxHistogram').attr('checked',this.graphs[this.selectedGraphIndex].histogram);
		$('#checkboxBoxPlot').attr('checked',this.graphs[this.selectedGraphIndex].boxPlot);
		$('#fixedIntervalWidth').val(this.graphs[this.selectedGraphIndex].partitionIntervalWidth);
		$('#fixedGroupSize').val(this.graphs[this.selectedGraphIndex].partitionGroupSize);
		
		if (this.graphs[this.selectedGraphIndex].includedCategories.length > 0){
			$('#textXMin').val(this.graphs[this.selectedGraphIndex].x.domain()[0]);
			$('#textXMax').val(this.graphs[this.selectedGraphIndex].x.domain()[1]);
		} else {
			$('#textXMin').val("NA");
			$('#textXMax').val("NA");
		}
		
		$('#fitScaleToData').attr('checked', this.graphs[this.selectedGraphIndex].fitScaleToData);
	},
	
	selectAUserDefPartition: function(graphIndex, partIndex){
		this.graphs.forEach(function(g){
			g.selectedUDPart = null;
		})
		if (graphIndex != null)
			this.graphs[graphIndex].selectedUDPart = partIndex;
	},
	
	scaleAllGraphsToFit: function(){
		var max = -Infinity, 
				min = Infinity;
		this.graphs.forEach(function(graph){
			if (graph.xMax > max) max = graph.xMax
			if (graph.xMin < min) min = graph.xMin
		});
		this.graphs.forEach(function(graph){
			graph.setXScale(min, Math.ceil(max));
		});
	},
}

function Graph(worksheet, graphCollection){
	this.graphCollection = graphCollection;
	this.worksheet = worksheet;
	this.data = worksheet.data;
	this.includedCategories = [];
	
	this.w = calcGraphWidth();
	this.h = 200;
	this.xMax = pv.max(this.dataVals(), function(d) { return d });
	this.xMin = pv.min(this.dataVals(), function(d) { return d });
	this.x = pv.Scale.linear(0, Math.ceil(this.xMax)).range(0, this.w);
	this.n = this.dataVals().length
	this.scaleMin = 0;
	this.scaleMax = Math.ceil(this.xMax);
	
	/* Partition Params */
	this.partitionGroupSize = 4;
	this.partitionIntervalWidth = 10;
	
	this.histogram = false;
	this.boxPlot = false;
	this.fitScaleToData = false;
	
	this.selectedUDPart = null;
	this.udPartitions = [];
	
	this.groupingMode = "NoGroups";
	
	/* Graph Overflow */
	this.overflowFlag = false;
	
	this.panel = {};
	this.baseLine = 20;
	
	this.legendHidden = false;
	
}

Graph.prototype = {	
	setXScale: function(min, max){
		var newMin = min || this.scaleMin;
		var newMax = max || this.scaleMax;
		
		if (this.fitScaleToData) {
			this.x = pv.Scale.linear(Math.floor(this.xMin), Math.ceil(this.xMax)).range(0, this.w);	
		} else {
			this.x = pv.Scale.linear(newMin, newMax).range(0, this.w);
			this.scaleMin = newMin;
			this.scaleMax = newMax;
		}
	},
	
	addCategory: function(name){
		if (this.includedCategories.indexOf(name) == -1 && this.includedCategories.length < 4){
			this.includedCategories.push(name);
			this.xMax = pv.max(this.dataVals(), function(d) { return d });
			this.xMin = pv.min(this.dataVals(), function(d) { return d });
			this.n = this.dataVals().length;
			this.graphCollection.scaleAllGraphsToFit();
			this.legendHidden = false;
			return true;
		} else {
			return false;
		}
	},
	
	removeCategory: function(name){
		this.includedCategories.splice(this.includedCategories.indexOf(name),1);
		this.xMax = pv.max(this.dataVals(), function(d) { return d });
		this.xMin = pv.min(this.dataVals(), function(d) { return d });
		this.n = this.dataVals().length;
		this.graphCollection.scaleAllGraphsToFit();
	},
	
	dataVals: function(){
		var simpleData = [];
		var complexData = this.data;
		this.includedCategories.forEach(function(cat){
			complexData[cat].forEach(function(d){
				simpleData.push(d.value);
			});
		});
		simpleData.sort(function(a,b){return a - b})
		return simpleData;
	},
	
	dataObjects: function(){
		var subset = [];
		var fullData = this.data;
		this.includedCategories.forEach(function(cat){
			fullData[cat].forEach(function(d){
				subset.push({"object":d, "set":cat});
			});
		});
		return subset;
	},
	
	getDataDrawObjects: function(){
		var xDomain = this.x.domain();
		var bucketSize = (xDomain[1]-xDomain[0])/this.graphCollection.buckets;
		var points = [];
		var data = this.dataObjects();
		var drawMode = jQuery("#drawMode option:selected").val();
		
		for (var i = 0; i < this.graphCollection.buckets; i++){
			var bucketMin = xDomain[0] + (bucketSize * i);
			var bucketMax = xDomain[0] + (bucketSize * (i+1));
			var pointsInBucket = [];
			
			for (var j = 0; j < data.length; j++){
				var dataObj = data[j],
					xVal = parseFloat(dataObj.object.value),
					label = dataObj.object.label;
					set = dataObj.set;
					
				if ((xVal >= bucketMin && xVal < bucketMax) 
						|| drawMode == "gravity")
				{
					pointsInBucket.push([this.x(xVal), label, set, 0]);
				}
			}
			randomIndex = 20;
			pointsInBucket = shuffle(pointsInBucket);
			
			switch (drawMode)
			{
			case "floating":
				for (var j = 0; j < pointsInBucket.length; j++){
					points.push({"x":pointsInBucket[j][0],
											 "xReal":pointsInBucket[j][0],
											 "y":this.graphCollection.bucketDotSize + j*2*this.graphCollection.bucketDotSize,
											 "label":pointsInBucket[j][1],
											 "set":pointsInBucket[j][2]
										 });
				}
				break;
			case "center":
				for (var j = 0; j < pointsInBucket.length; j++){
					points.push({"x":(this.x(bucketMin)+this.x(bucketMax))/2,
											 "xReal":pointsInBucket[j][0],
											 "y":this.graphCollection.bucketDotSize + j*2*this.graphCollection.bucketDotSize,
											 "label":pointsInBucket[j][1],
											 "set":pointsInBucket[j][2]
										 });
				}
				break;
			case "gravity":
				if ( i == 0 ) {
					for (var j = 0; j < pointsInBucket.length; j++){
						var candidatePoint = {
							"x":pointsInBucket[j][0],
							"xReal":pointsInBucket[j][0],
							"y":graphCollection.bucketDotSize,
							"label":pointsInBucket[j][1],
							"set":pointsInBucket[j][2]
							};
							
						var collisionPoints = [];
						for (var k = 0; k < points.length; k++){
							if (Math.abs(points[k].x-candidatePoint.x) < graphCollection.bucketDotSize*2) {
								collisionPoints.push(points[k]);
							}
						}
						
						if (collisionPoints.length > 0)
							candidatePoint.y = fitPointInGraph(candidatePoint, collisionPoints, graphCollection.bucketDotSize);
						
						points.push(candidatePoint);
					}
				}
				
				//THE OLD WAY
				//for (var j = 0; j < pointsInBucket.length; j++){
				//	var comparePoint = pointsInBucket[j];
				//	//for (var k = (j-1); k > 0; k--){
				//	var changed = true;
				//	while(changed){
				//		changed = false;
				//		for (var k = 0; k < pointsInBucket.length; k++){
				//			var otherPoint = pointsInBucket[k];
				//			if (Math.abs(comparePoint[0]-otherPoint[0]) < this.graphCollection.bucketDotSize*2 && 
				//					otherPoint[3] == comparePoint[3] &&
				//					k != j)
				//			{
				//				
				//				comparePoint[3] = otherPoint[3] + 1;
				//				changed = true;
				//			}
				//		}
				//	}
				//	if (i == 0){
				//		points.push({"x":pointsInBucket[j][0],
				//							 "xReal":pointsInBucket[j][0],
				//							 "y":this.graphCollection.bucketDotSize + comparePoint[3]*2*this.graphCollection.bucketDotSize,
				//							 "label":pointsInBucket[j][1],
				//							 "set":pointsInBucket[j][2]
				//						 });
				//	}
				//}
				
				break;
			}
		}
		return points;
		
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

var numWorksheets = 0;
function Worksheet(param) {
	if (typeof param == 'string'){
		this.URL = param;
		this.local = false;
		this.fetchWorksheetData();
	} else {
		this.URL = param.feed.link[1].href + "***";
		this.local = true;
		this.fetchLocalData(param);
	}
}

var globalData;

Worksheet.prototype = {
	fetchWorksheetData: function() {
		var worksheet = this;
		jQuery.jsonp({ url:this.URL + '?alt=json', callbackParameter: "callback", 
			success:function(feedData) {
				worksheet.data = worksheet.transformFeedData(feedData);
				worksheet.labelType = feedData.feed.entry[0].content.$t;        
				worksheet.title = feedData.feed.title.$t;
				jQuery('body').trigger({ type:'WorksheetLoaded', worksheet:worksheet });
			},
			error:function() {
			alert("Could not retrieve worksheet. Is it published?");
			}
		});
	},
	
	fetchLocalData: function(feedData) {
		var worksheet = this;
		worksheet.data = worksheet.transformFeedData(feedData);
		worksheet.labelType = feedData.feed.entry[0].content.$t;        
		worksheet.title = feedData.feed.title.$t;
		jQuery('body').trigger({ type:'WorksheetLoaded', worksheet:worksheet });
	},
	
	transformFeedData: function(feedData) {
		var data = {};
		
		//Creates of map of column letters to data categories; 
		//ALSO maps each category to an empty array of maps (in data obj)
		var columnToCategory = {};
		feedData.feed.entry.filter(function(e) { return parseInt(e.title.$t.replace(/[A-Z]/g,"")) == 1 })
			.slice(1)
			.forEach(function(e) { 
				columnToCategory[e.title.$t.replace(/[0-9]/g,"")] = e.content.$t;
				data[e.content.$t] = []
			});
												
		var rowToLabelVal = {};
		feedData.feed.entry.filter(function(e) { 
																return parseInt(e.title.$t.replace(/[A-Z]/g,"")) > 1 &&
																	e.title.$t.replace(/[0-9]/g,"") == "A"
															})
												.forEach(function(e){
													rowToLabelVal[parseInt(e.title.$t.replace(/[A-Z]/g,""))] = e.content.$t;
												});

		feedData.feed.entry.filter(function(e) { 
																return parseInt(e.title.$t.replace(/[A-Z]/g,"")) > 1 &&
																	e.title.$t.replace(/[0-9]/g,"") != "A";
															})
												.forEach(function(e) {
													data[columnToCategory[e.title.$t.replace(/[0-9]/g,"")]].push(
														{"label": rowToLabelVal[parseInt(e.title.$t.replace(/[A-Z]/g,""))],
														 "value": parseFloat(e.content.$t)});
												});
		globalData = data;		
		return data;
	},
};


function Spreadsheet(key) {
	this.worksheets = [];
	if( typeof key == 'string'){
		this.key = key;
		this.fetchWorksheets();
		this.local = false;
	} else {
		this.key == 'local'
		this.constructLocalWorksheets(key);
		this.local = true;
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
			//globalFeedData = feedData;
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
	
};

var exampleSpreadsheets = [
	//new Spreadsheet('0AuGPdilGXQlBdHlYdkZ0a0tlZ1F4N1FQc2luOTNtZUE'),  //Old Format
	new Spreadsheet('0AuGPdilGXQlBdEd4SU44cVI5TXJxLXd3a0JqS3lHTUE'),		//Combined Format
];

