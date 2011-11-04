//All variables related to a touch event
function Touch(){
	this.dragType = undefined;						//types are "sideCat","graphCat","data","partitionCreate","partitionMove"
	this.draggedObj = undefined;					//sideCat, graphCat
	this.dragging = false;								//all
	this.dragCat = undefined;							//sideCat, graphCat
	this.graphIndex = undefined;  				//graphCat
	this.finalX = undefined;							//all
	this.finalY = undefined;							//all
	this.partitionIndex = undefined;			//partitionMove
	this.dataObj = undefined;							//data
	this.graphPanel = undefined;					//partitionMove, partitionCreate
	this.dragLabel = undefined;						//data
}

Touch.prototype = {
	reset: function(){
		this.dragType = undefined;
		this.draggedObj = undefined;
		this.dragging = false;
		this.dragCat = undefined;
		this.graphIndex = undefined;  
		this.finalX = undefined;
		this.finalY = undefined;
		this.partitionIndex = undefined;
		this.dataObj = undefined;
		this.graphPanel = undefined;
		this.dragLabel = undefined;
	},
}

// Represents the collection of graphs and the area where all graphs are drawn
function GraphCollection(){
	this.worksheet = getWorksheet();
	
	this.graphs = [];
	this.selectedGraphIndex = 0;
	
	//Drawing Variables
	this.w = calcGraphWidth();
	this.padBot = 0;
	this.padTop = 60;
	this.padLeft = 235;
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
	this.h = this.calcGraphHeight();

	
	this.nextDefaultCategory = 0;
	
	//Colors
	this.categoryColors = {};
	this.colorScale = pv.Colors.category20(0,20);
	var counter = 0;
	for (var key in this.worksheet.data){
		this.categoryColors[key] = this.colorScale(counter);
		counter++;
	}
	this.numberOfAddedCategories = this.numberOfCategories;
	
	this.editedCategories = {};
	for (var key in this.worksheet.data){
		this.editedCategories[key] = this.worksheet.edited[key];
	}
	
	this.editModeEnabled = false;
	this.advancedUser = false;
	
	this.buttonIcon = true;
	this.buttonText = true;
	
	this.selectedLabel = null;
	
	this.addGraph();
	this.updateMenuOptions();
}

GraphCollection.prototype = {
	calcGraphHeight: function (){
		if (this.graphs.length > 4)
			return Math.max(this.defaultGraphHeight*this.graphs.length,
											this.numberOfCategories*40,
											(window.innerHeight - jQuery('div#notGraph').height()) - 105
										 );
		else
			return Math.max(this.numberOfCategories*40,
											(window.innerHeight - jQuery('div#notGraph').height()) - 105
										 );
	},
	
	addGraph: function() {
		this.graphs.push(new Graph(this.worksheet, this));
		
		this.setH(this.calcGraphHeight());
	},
	
	removeGraph: function(graph){
		this.graphs.splice(this.graphs.indexOf(graph),1);
		
		this.setH(this.calcGraphHeight());
			
		this.selectedGraphIndex = 0;
			
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
		$('#checkboxAdvBP').attr('checked',this.graphs[this.selectedGraphIndex].advBoxPlot);
		$('#checkboxSDLine').attr('checked',this.graphs[this.selectedGraphIndex].sdLine);
		$('#fixedIntervalWidth').val(this.graphs[this.selectedGraphIndex].partitionIntervalWidth);
		$('#fixedGroupSize').val(this.graphs[this.selectedGraphIndex].partitionGroupSize);
		
		if (this.graphs[this.selectedGraphIndex].includedCategories.length > 0){
			var xDom = this.graphs[this.selectedGraphIndex].x.domain();
			$('#textXMin').val(xDom[0]);
			$('#textXMax').val(xDom[1]);
		} else {
			$('#textXMin').val("NA");
			$('#textXMax').val("NA");
		}
		
		$('#fitScaleToData').attr('checked', this.graphs[this.selectedGraphIndex].fitScaleToData);
		
		$('#checkboxMMM').attr('checked', this.graphs[this.selectedGraphIndex].showMMM);
		$('#checkboxMean').attr('checked', this.graphs[this.selectedGraphIndex].showMean);
		$('#checkboxMedian').attr('checked', this.graphs[this.selectedGraphIndex].showMedian);
		$('#checkboxMode').attr('checked', this.graphs[this.selectedGraphIndex].showMode);
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
			//var mag = magnitude(max-min);
			//min = Math.floor(min/Math.pow(10,mag))*Math.pow(10,mag);
			if (min > 1000)
				min = Math.floor(min/1000)*1000;
				
			if (!graph.customScale || graph.xMin < graph.scaleMin || graph.xMax > graph.scaleMax)
				graph.setXScale(Math.floor(min), Math.ceil(max)+0.1);
		});
	},
	
	addData: function(title, data){
		this.worksheet.data[title] = data;
		this.graphs.forEach(function(graph){
			graph.data[title] = data;
			graph.xMax = pv.max(graph.dataVals(), function(d) { return d });
			graph.xMin = pv.min(graph.dataVals(), function(d) { return d });
			graph.editedCategories[title] = true;
			graph.nextDefaultLabel[title] = 0;
			if (graph.dataVals().length < 4)
				graph.insufDataForFour = true;
			else 
				graph.insufDataForFour = false;
			
			if (graph.dataVals().length < 2)
				graph.insufDataForTwo = true;
			else 
				graph.insufDataForTwo = false;
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
		this.categoryColors[title] = this.colorScale(this.numberOfAddedCategories);
		this.scaleAllGraphsToFit();
	},
	
	editData: function(oldTitle, title, data){
		
		if (oldTitle != title)
			delete this.worksheet.data[oldTitle];
		this.worksheet.data[title] = data;
		this.graphs.forEach(function(graph){
			if (oldTitle != title)
				delete graph.data[oldTitle];
			
			var oldMax = graph.xMax;
			var oldMin = graph.xMin;
			
			graph.data[title] = data;
			graph.xMax = pv.max(graph.dataVals(), function(d) { return d });
			graph.xMin = pv.min(graph.dataVals(), function(d) { return d });
			graph.editedCategories[title] = true;
			graph.n = (graph.dataVals()).length;
			
			if (graph.includedCategories.indexOf(oldTitle) != -1)
				graph.includedCategories[graph.includedCategories.indexOf(oldTitle)] = title;
				
			if (graph.dataVals().length < 4)
				graph.insufDataForFour = true;
			else 
				graph.insufDataForFour = false;
			
			if (graph.dataVals().length < 2)
				graph.insufDataForTwo = true;
			else 
				graph.insufDataForTwo = false;
				
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
		
		if (oldTitle != title){
			this.categoryColors[title] = this.categoryColors[oldTitle];
			delete this.categoryColors[oldTitle];
			
		}
		this.scaleAllGraphsToFit();
	},
	
	editSinglePoint: function(set, label, value){
		var graphCol = this;
		this.worksheet.data[set].forEach(function(data){
			if (data.label == label){
				data.value = value;
				graphCol.graphs.forEach(function(graph){
					graph.xMax = pv.max(graph.dataVals(), function(d) { return d });
					graph.xMin = pv.min(graph.dataVals(), function(d) { return d });
					graph.editedCategories[set] = true;
				});
				
				graphCol.editedCategories[set] = true;
				graphCol.worksheet.edited[set] = true;
				
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
		
		//
		this.scaleAllGraphsToFit();
		//
		
	},
}

function Graph(worksheet, graphCollection){
	this.graphCollection = graphCollection;
	this.worksheet = worksheet;
	this.data = worksheet.data;
	this.includedCategories = [];
	this.selectedCategory = null;
	this.editedCategories = this.graphCollection.editedCategories;
	
	this.nextDefaultLabel = {};
	for (var key in this.editedCategories){
		this.nextDefaultLabel[key] = 0;
	}
	
	this.w = calcGraphWidth();
	this.h = 200;
	this.xMax = pv.max(this.dataVals(), function(d) { return d });
	this.xMin = pv.min(this.dataVals(), function(d) { return d });
	this.x = pv.Scale.linear(0, Math.ceil(this.xMax)).range(0, this.w);
	this.n = this.dataVals().length
	
	// Scaling Variables
	this.scaleMin = 0;
	this.scaleMax = Math.ceil(this.xMax);
	this.fitScaleToData = false;
	this.customScale = false;
	
	/* Partition Params */
	this.partitionGroupSize = 4;
	this.partitionIntervalWidth = 10;
	
	this.histogram = false;
	//this.boxPlot = false;
	this.advBoxPlot = false;
	this.sdLine = false;
	
	
	this.selectedUDPart = null;
	this.udPartitions = [];
	
	this.groupingMode = "NoGroups";
	
	this.showMMM = false;
	this.showMean = false;
	this.showMedian = false;
	this.showMode = false;
	
	this.MMMLabelVis = [];
	
	/* Graph Overflow */
	this.insufDataForFour = true;
	this.insufDataForTwo = true;
	
	this.panel = {};
	this.baseLine = 20;
	
	this.legendHidden = false;
}

Graph.prototype = {	
	setXScale: function(min, max){
		var newMin = min || this.scaleMin;
		var newMax = max || this.scaleMax;
		
		if (min == 0)
			newMin = min;
		
		if (this.fitScaleToData) {
			this.x = pv.Scale.linear(Math.floor(this.xMin), Math.ceil(this.xMax)).range(0, this.w);	
		} else {
			this.x = pv.Scale.linear(newMin, newMax).range(0, this.w);
			this.scaleMin = newMin;
			this.scaleMax = newMax;
		}
	},
	
	addCategory: function(category){
		if (this.includedCategories.indexOf(category) == -1 && this.includedCategories.length < 4){
			this.includedCategories.push(category);
			
			this.xMax = pv.max(this.dataVals(), function(d) { return d });
			this.xMin = pv.min(this.dataVals(), function(d) { return d });
			this.n = this.dataVals().length;
			
			this.graphCollection.scaleAllGraphsToFit();
			
			//Adjust fixed interval partition width to avoid hanging on large domains
			this.graphCollection.graphs.forEach(function(g){
				var mag = magnitude(g.scaleMax - g.scaleMin);
				if (Math.pow(10, mag)*4 < g.scaleMax)
					g.partitionIntervalWidth = Math.pow(10, mag);
				else
					g.partitionIntervalWidth = Math.pow(10, mag-1);
			});
			
			this.legendHidden = false;
			
			if (this.dataVals().length < 4)
				this.insufDataForFour = true;
			else 
				this.insufDataForFour = false;
			
			if (this.dataVals().length < 2)
				this.insufDataForTwo = true;
			else 
				this.insufDataForTwo = false;
			
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
		this.graphCollection.graphs.forEach(function(g){
			var mag = magnitude(g.scaleMax - g.scaleMin);
			if (Math.pow(10, mag)*4 < g.scaleMax)
				g.partitionIntervalWidth = Math.pow(10, mag);
			else
				g.partitionIntervalWidth = Math.pow(10, mag-1);
		});
		
		if (this.dataVals().length < 4)
			this.insufDataForFour = true;
		else 
			this.insufDataForFour = false;
		
		if (this.dataVals().length < 2)
			this.insufDataForTwo = true;
		else 
			this.insufDataForTwo = false;
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
	
	toString: function(){
		var heading = "";
		var data = [];
		var fullData = this.data;
		
		this.includedCategories.forEach(function(cat){
			fullData[cat].forEach(function(d, i){
				data[i] = "";
			});
		});
		
		heading += this.worksheet.labelType;
		
		this.includedCategories.forEach(function(cat){
			heading += '\t'+cat;
			
			
			fullData[cat].forEach(function(d, i){
				data[i] += d.label+'\t'+d.value.toFixed(1)+'\t';
			});
		});
		
		var string = heading+'\n';
		data.forEach(function(d){string += trim(d) + '\n';});
		return string;
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
				
				break;
			}
		}
		return points;
		
	},
	
	getMeanMedianMode: function(){
		var data = this.dataVals();
		var mean = 0;
		var median;
		var mode = [];
		
		data.forEach(function(d){
			mean += d;
		});
		mean = mean/data.length;
		
		if (data.length % 2 == 0)
			median = (data[data.length/2-1]+data[data.length/2])/2;
		else
			median = data[Math.floor(data.length/2)];
			
		var counts = {};
		data.forEach(function(d){
			if (counts.hasOwnProperty(d))
				counts[d]++;
			else
				counts[d] = 1;
		});
		var max = 0;
		for (var key in counts){
			if (counts[key] == max)
				mode.push(key);
			else if (counts[key] > max){
				mode = [key];
				max = counts[key]
			}
		}
		
		var retVal = [mean, median];
		if(max != 1)
			mode.forEach(function(m){
				retVal.push(parseFloat(m))
			});
		
		return retVal;
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
				columnToCategory[e.title.$t.replace(/[0-9]/g,"")] = cat;
				data[cat] = []
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
														{"label": trim(rowToLabelVal[parseInt(e.title.$t.replace(/[A-Z]/g,""))]),
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
			labels.push(trim(e.content.$t));
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



