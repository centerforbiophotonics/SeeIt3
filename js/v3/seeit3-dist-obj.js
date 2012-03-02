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
	this.touch = false;
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
		this.touch = false;
	},
}

// Represents the collection of graphs and the area where all graphs are drawn
function GraphCollection(){
	this.data = {};
	this.worksheets = {};
	
	this.graphs = [];
	this.selectedGraphIndex = 0;
	this.datasetsMenuShowing = false;
	this.datasetsVisible = {};
	
	//Drawing Variables
	this.w = this.calcGraphWidth();
	this.h = this.calcGraphHeight();
	this.padBot = 0;
	this.padTop = 32;
	this.padLeft = 35;
	this.padRight = 25;
	this.defaultGraphHeight = 300;
	this.labelTextSize = "16";
	this.tickTextSize = "12";
	this.buckets = 30;
	this.bucketDotSize = 5;
	this.numberOfCategories = 0;
	
	//Colors
	this.categoryColors = {};
	this.colorScale = pv.Colors.category20(0,20);
	
	this.numberOfAddedCategories = this.numberOfCategories;
	
	//Used to draw edited category titles in red
	this.editedCategories = {};

	//Increments a value added to end of default labels
	this.nextDefaultLabel = {};

	//Mode flags
	this.editModeEnabled = false;
	this.advancedUser = false;
	this.buttonIcon = true;
	this.buttonText = true;
	
	//for highlighting points with the same label
	this.selectedLabel = null;
	
	//Add an empty graph and initialize menu
	this.addGraph();
	this.updateMenuOptions();
	
	this.nextSampleSetNumber = 0;
}

GraphCollection.prototype = {
	
	addWorksheet: function(worksheet){
		for (key in worksheet.data){
			this.data[key] = worksheet.data[key];
			this.worksheets[worksheet.title] = worksheet;
			this.categoryColors[key] = this.colorScale(this.numberOfCategories);
			this.numberOfCategories++;
			this.editedCategories[key] = worksheet.edited[key];
			this.nextDefaultLabel[key] = 0;
			this.datasetsVisible[worksheet.title] = false;
		}
	},
	
	removeWorksheet: function(title){
		var worksheet = this.worksheets[title];
		
		for (var key in worksheet.data){
			this.graphs.forEach(function(g){
				var rInd = null;
				g.includedCategories.forEach(function(c,i){
					if (c == key){
						rInd = i;
					}
				});
				if (rInd != null)
					g.includedCategories.splice(rInd,1);
			});
		}
		
		for (key in worksheet.data){
			delete this.data[key];
			delete this.categoryColors[key];
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
	
	calcGraphWidth: function(){
		if (this.datasetsMenuShowing)
			return window.innerWidth - $('#datasets').width() - 111;
		else
			return window.innerWidth - 90;
	},
	
	calcGraphHeight: function (){
		if (this.graphs.length > 4)
			return Math.max(this.defaultGraphHeight*this.graphs.length,
											(window.innerHeight - jQuery('div#notGraph').height()) - 60
										 );
		else
			return (window.innerHeight - jQuery('div#notGraph').height()) - 60;
	},
	
	addGraph: function() {
		this.graphs.push(new Graph(this));
		this.setH(this.calcGraphHeight());
	},
	
	addSamplingGraph: function(index){
		this.graphs.splice(index+1,0,new Graph(this));
		
		//set variables to distinguish sample graph as special type
		this.graphs[index+1].isSamplingGraph = true;
		this.graphs[index+1].samplingFrom = this.graphs[index];
		this.graphs[index].samplingTo = this.graphs[index+1];
		this.graphs[index].sampleSet = "***sampleSet-"+graphCollection.nextSampleSetNumber++;
		this.graphs[index+1].sampleSet = this.graphs[index].sampleSet;
		this.data[this.graphs[index].sampleSet] = [];
		this.graphs[index+1].addSampleCategory(this.graphs[index].sampleSet);
		
		this.setH(this.calcGraphHeight());
	},
	
	addResamplingGraph: function(index){
		this.graphs.splice(index+1,0,new Graph(this));
		
		//set variables to distinguish sample graph as special type
		//set variables to distinguish sample graph as special type
		this.graphs[index+1].isResamplingGraph = true;
		this.graphs[index+1].resamplingFrom = this.graphs[index];
		this.graphs[index].resamplingTo = this.graphs[index+1];
		this.graphs[index].resampleSet = "***resampleSet-"+graphCollection.nextResampleSetNumber++;
		this.graphs[index+1].resampleSet = this.graphs[index].resampleSet;
		this.data[this.graphs[index].resampleSet] = [];
		this.graphs[index+1].addResampleCategory(this.graphs[index].resampleSet);
		
		this.setH(this.calcGraphHeight());
	},
	
	removeGraph: function(graph){
		if (graph.testMode != "noTest"){
			this.graphs.splice(this.graphs.indexOf(graph)+1,1);
			
			if (graph.testMode == "sampling")
				delete graphCollection.data[graph.sampleSet];
		}
			
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
		graphCollection.graphs.forEach(function(g,i){
			g.w = graphCollection.w;
			g.setXScale();
			positionAndSizeLegendPanel(g,i);
			positionAndSizeSampleOptions(g,i);
		});
	},
	
	setW: function(width){
		this.w = width;
		this.setChildGraphWidths();
	},
	
	setH: function(height){
		this.h = height;
		this.setChildGraphHeights();
		if (this.graphs.length <= 4)
			$("#datasets").css("max-height", height+12+"px");
		else
			$("#datasets").css("max-height", "90%");
	},
	
	updateMenuOptions: function(){
		$('#radio'+this.graphs[this.selectedGraphIndex].groupingMode).attr('checked',true);
		$("#sampling").attr('checked', this.graphs[this.selectedGraphIndex].testMode == "sampling");
		$('#checkboxHistogram').attr('checked',this.graphs[this.selectedGraphIndex].histogram);
		$('#checkboxAdvBP').attr('checked',this.graphs[this.selectedGraphIndex].advBoxPlot);
		$('#checkboxSDLine').attr('checked',this.graphs[this.selectedGraphIndex].sdLine);
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
	
	editData: function(worksheet,oldTitle, title, data){
		
		if (oldTitle != title)
			delete this.worksheets[worksheet].data[oldTitle];
		this.worksheets[worksheet].data[title] = data;
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
				if (exampleSpreadsheets[h].worksheets[i].URL == this.worksheets[worksheet].URL){
					exampleSpreadsheets[h].worksheets[i].edited[title] = true;
				}
			}
		}
		this.worksheets[worksheet].edited[title] = true;
		
		if (oldTitle != title){
			this.categoryColors[title] = this.categoryColors[oldTitle];
			delete this.categoryColors[oldTitle];
			
		}
		this.scaleAllGraphsToFit();
	},
	
	editSinglePoint: function(worksheet, set, label, value){
		var graphCol = this;
		this.worksheets[worksheet].data[set].forEach(function(data){
			if (data.label == label){
				data.value = value;
				graphCol.graphs.forEach(function(graph){
					graph.xMax = pv.max(graph.dataVals(), function(d) { return d });
					graph.xMin = pv.min(graph.dataVals(), function(d) { return d });
					graph.editedCategories[set] = true;
				});
				
				graphCol.editedCategories[set] = true;
				graphCol.worksheets[worksheet].edited[set] = true;
				$('#'+convertToID(set)).css('color','red');
				
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

function Graph(graphCollection){
	this.graphCollection = graphCollection;
	this.data = graphCollection.data;
	this.includedCategories = [];
	this.selectedCategory = null;
	this.editedCategories = this.graphCollection.editedCategories;
	
	this.w = graphCollection.calcGraphWidth();
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
	this.baseLine = 54;
	
	this.twoLineLegend = false;
	
	//Testing variables
	this.testMode = "noTest";
	
	this.isSamplingGraph = false;
	this.samplingFrom = null;			//Graph Object
	this.samplingTo = null;				//Graph Object
	this.sampleSet = null;				//String sample set name
	this.samplingHowMany = 10;
	
	
	this.isResamplingGraph = false;
	this.resamplingFrom = null;
	this.resamplingTo = null;
	this.resampleSet = null;
	this.resamplingHowMany = 1000;
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
		if (this.includedCategories.indexOf(category) == -1 && 
				this.includedCategories.length < 4 &&
				!this.isSamplingGraph && !this.isResamplingGraph){
			
			this.includedCategories.push(category);
			
			if (this.includedCategories.length > 2){
				this.twoLineLegend = true;
				this.baseLine = 89;
			} else {
				this.twoLineLegend = false;
				this.baseLine = 54;
			}
			
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
			
			this.updateInsufDataFlags();
			
			return true;
		} else {
			return false;
		}
	},
	
	addSampleCategory: function(category){
		this.includedCategories.push(category);
		this.xMax = this.samplingFrom.xMax;//pv.max(this.samplingFrom.dataVals(), function(d) { return d });
		this.xMin = this.samplingFrom.xMin;//pv.min(this.samplingFrom.dataVals(), function(d) { return d });
		this.n = this.dataVals().length;
		
		this.graphCollection.scaleAllGraphsToFit();
		
		this.updateInsufDataFlags();
		
	},
	
	updateSample: function(size){
		graphCollection.data[this.sampleSet] = [];
		
		var populationSize = 0;
		this.samplingFrom.includedCategories.forEach(function(cat){
			populationSize += graphCollection.data[cat].length;
		});
		
		if (size >= populationSize){  //sample all
			var graph = this;
			this.samplingFrom.includedCategories.forEach(function(cat){
				graphCollection.data[cat].forEach(function(d){
					d.set = cat;
					graphCollection.data[graph.sampleSet].push(d);
				});
			});
			this.samplingHowMany = populationSize;
			this.updateInsufDataFlags();
			return populationSize;
		} else {											//sample randomly
			var i = 0;
			while(i<size){
				var catInd = 0;
				var index = rand(0,populationSize);
				for (var j=0;j< this.samplingFrom.includedCategories.length; j++){
					index -= graphCollection.data[this.samplingFrom.includedCategories[j]].length;
					if (index < 0){
						index += graphCollection.data[this.samplingFrom.includedCategories[j]].length;
						break;
					}
					catInd++;
				}
				
				var dat = graphCollection.data[this.samplingFrom.includedCategories[catInd]][index];
				
				dat.set = this.samplingFrom.includedCategories[catInd];
				if (!sampleContainsData(graphCollection.data[this.sampleSet],dat,this.samplingFrom)){
					graphCollection.data[this.sampleSet].push(dat);
					i++;
				}
			}
			this.samplingHowMany = size;
			this.updateInsufDataFlags();
			return size;
		}
	},
	
	updateInsufDataFlags: function(){
		this.insufDataForFour = this.dataVals().length < 4;
		this.insufDataForTwo = this.dataVals().length < 2;
	},
	
	removeCategory: function(name){
		this.includedCategories.splice(this.includedCategories.indexOf(name),1);
		this.xMax = pv.max(this.dataVals(), function(d) { return d });
		this.xMin = pv.min(this.dataVals(), function(d) { return d });
		this.n = this.dataVals().length;
		
		if (this.includedCategories.length > 2){
			this.twoLineLegend = true;
			this.baseLine = 89;
		} else {
			this.twoLineLegend = false;
			this.baseLine = 54;
		}
		
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
				if (d.hasOwnProperty("set"))
					subset.push({"object":d, "set":d.set});
				else
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
	
	//getSamplingDataDrawObjects: function() {
		//var xDomain = graphCollection.graphs[this.samplingFrom].x.domain();
		//var bucketSize = (xDomain[1]-xDomain[0])/this.graphCollection.buckets;
		//var points = [];
		//var data = graphCollection.graphs[this.samplingFrom].samplingData;
		//var drawMode = jQuery("#drawMode option:selected").val();
		
		//for (var i = 0; i < this.graphCollection.buckets; i++){
			//var bucketMin = xDomain[0] + (bucketSize * i);
			//var bucketMax = xDomain[0] + (bucketSize * (i+1));
			//var pointsInBucket = [];
			
			//for (var j = 0; j < data.length; j++){
				////var dataObj = data[j],
				//var xVal = data[j].xReal,
						//label = data[j].label;
						//set = data[j].set;
					
				//if ((xVal >= bucketMin && xVal < bucketMax) 
						//|| drawMode == "gravity")
				//{
					//pointsInBucket.push([xVal, label, set, 0]);
				//}
			//}
			//randomIndex = 20;
			//pointsInBucket = shuffle(pointsInBucket);
			
			//switch (drawMode)
			//{
			//case "floating":
				//for (var j = 0; j < pointsInBucket.length; j++){
					//points.push({"x":pointsInBucket[j][0],
											 //"xReal":pointsInBucket[j][0],
											 //"y":this.graphCollection.bucketDotSize + j*2*this.graphCollection.bucketDotSize,
											 //"label":pointsInBucket[j][1],
											 //"set":pointsInBucket[j][2]
										 //});
				//}
				//break;
			//case "center":
				//for (var j = 0; j < pointsInBucket.length; j++){
					//points.push({"x":(this.x(bucketMin)+this.x(bucketMax))/2,
											 //"xReal":pointsInBucket[j][0],
											 //"y":this.graphCollection.bucketDotSize + j*2*this.graphCollection.bucketDotSize,
											 //"label":pointsInBucket[j][1],
											 //"set":pointsInBucket[j][2]
										 //});
				//}
				//break;
			//case "gravity":
				//if ( i == 0 ) {
					//for (var j = 0; j < pointsInBucket.length; j++){
						//var candidatePoint = {
							//"x":pointsInBucket[j][0],
							//"xReal":pointsInBucket[j][0],
							//"y":graphCollection.bucketDotSize,
							//"label":pointsInBucket[j][1],
							//"set":pointsInBucket[j][2]
							//};
							
						//var collisionPoints = [];
						//for (var k = 0; k < points.length; k++){
							//if (Math.abs(points[k].x-candidatePoint.x) < graphCollection.bucketDotSize*2) {
								//collisionPoints.push(points[k]);
							//}
						//}
						
						//if (collisionPoints.length > 0)
							//candidatePoint.y = fitPointInGraph(candidatePoint, collisionPoints, graphCollection.bucketDotSize);
						
						//points.push(candidatePoint);
					//}
				//}
				
				//break;
			//}
		//}
		//return points;
	//},
	
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
		if (param.hasOwnProperty('userDefined') == false){
			this.URL = param.feed.link[1].href + "***";
			this.local = true;
			this.userCreated = false;
			this.fetchLocalData(param);
		} else {
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
				jQuery('body').trigger({ type:'WorksheetLoaded', worksheet:worksheet, refresh:true });
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
													if (e.content.$t[0] != '*')
														rowToLabelVal[parseInt(e.title.$t.replace(/[A-Z]/g,""))] = e.content.$t;
												});

		feedData.feed.entry.filter(function(e) { 
																return parseInt(e.title.$t.replace(/[A-Z]/g,"")) > 1 &&
																	e.title.$t.replace(/[0-9]/g,"") != "A";
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
	if( typeof key == 'string'){
		this.key = key;
		this.fetchWorksheets();
		this.local = false;
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



