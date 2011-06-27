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
	this.padLeft = 150;
	this.padRight = 20;
	this.defaultGraphHeight = 300;
	this.labelTextSize = "16";
	this.tickTextSize = "12";
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
		this.graphs.push(new Graph(this.worksheet));
		
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
}

/* MODIFY ATTRIBUTES WITH GREAT CAUTION */
function Graph(worksheet){
	this.worksheet = worksheet;
	this.data = worksheet.data;
	this.includedCategories = [];
	
	this.w = calcGraphWidth();
	this.h = 200;
	this.xMax = pv.max(this.dataVals(), function(d) { return d });
	this.xMin = pv.min(this.dataVals(), function(d) { return d });
	this.x = pv.Scale.linear(0, Math.ceil(this.xMax)).range(0, this.w);
	this.n = this.dataVals().length
	
	/* X Distribution Variables */
	this.buckets = 40;
	this.bucketDotSize = 5;
	
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
	this.graphOverflowFlag = false;
	
	this.panel = {};
	this.baseLine = 20;
	
}

Graph.prototype = {	
	setXScale: function(min, max){
		var newMin = min || 0;
		var newMax = max || Math.ceil(this.xMax);
		
		if (this.fitScaleToData) {
			this.x = pv.Scale.linear(Math.floor(this.xMin), Math.ceil(this.xMax)).range(0, this.w);	
		} else {
			this.x = pv.Scale.linear(newMin, newMax).range(0, this.w);
		}
	},
	
	addCategory: function(name){
		if (this.includedCategories.indexOf(name) == -1){
			this.includedCategories.push(name);
			this.xMax = pv.max(this.dataVals(), function(d) { return d });
			this.xMin = pv.min(this.dataVals(), function(d) { return d });
			this.n = this.dataVals().length;
			this.setXScale();
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
		this.setXScale();
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
		var bucketSize = (xDomain[1]-xDomain[0])/this.buckets;
		var points = [];
		var data = this.dataObjects();
		var drawMode = jQuery("#drawMode option:selected").val();
		
		for (var i = 0; i < this.buckets; i++){
			var bucketMin = xDomain[0] + (bucketSize * i);
			var bucketMax = xDomain[0] + (bucketSize * (i+1));
			var pointsInBucket = [];
			
			switch (drawMode)
			{
			case "floating":
				for (var j = 0; j < data.length; j++){
					var dataObj = data[j],
						xVal = parseFloat(dataObj.object.value),
						label = dataObj.object.label;
						set = dataObj.set;
						
					if (xVal >= bucketMin 
						&& xVal < bucketMax)
					{
						pointsInBucket.push([this.x(xVal), label, set]);
					}
				}
				
				randomIndex = 20;
				pointsInBucket = shuffle(pointsInBucket);
				
				for (var j = 0; j < pointsInBucket.length; j++){
					points.push({"x":pointsInBucket[j][0],
											 "y":this.bucketDotSize + j*2*this.bucketDotSize,
											 "label":pointsInBucket[j][1],
											 "set":pointsInBucket[j][2]
										 });
				}
				break;
			case "center":
				
				break;
			case "gravity":
				
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

