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
	this.defaultGraphHeight = 200;
	this.labelTextSize = "16";
	this.allOtherTextSize = "14";
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
	this.nextResampleSetNumber = 0;
	this.nextIntermedResampleSetNumber = 0;
	
	this.resamplingEnabled = false;
	
	this.bwMode = false;
	this.lineMode = false;
	
	this.nextDefaultCategoryNumber = 0;
	
	this.printMode = false;
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
	
	addSamplingGraph: function(index, number){
		this.graphs.splice(index+number,0,new Graph(this));
		
		//set variables to distinguish sample graph as special type
		this.graphs[index+number].isSamplingGraph = true;
		this.graphs[index+number].samplingFrom = this.graphs[index];
		
		this.graphs[index].samplingTo[number-1] = this.graphs[index+number];
		this.graphs[index].sampleSet[number-1] = "***sampleSet-"+graphCollection.nextSampleSetNumber++;
		this.graphs[index+number].sampleSet = this.graphs[index].sampleSet[number-1];
		this.data[this.graphs[index].sampleSet[number-1]] = [];
		
		this.graphs[index+number].sampleNumber = number;
		this.graphs[index+number].baseLine = 45;
		
		if (number == this.graphs[index].samplingToHowMany)
			for (var i = number; i>0; i--){
				this.graphs[index+i].includedCategories = [];
				this.graphs[index+i].addSampleCategory(this.graphs[index].sampleSet[i-1]);
			}
		
		this.setH(this.calcGraphHeight());
	},
	
	addResamplingGraph: function(){
		////Add a graph to display intermediate resampling results.
		//this.graphs.splice(0,0,new Graph(this));
		
		//this.graphs[0].testMode = "intermedResampling";
		//this.graphs[0].isIntermedResamplingGraph = true;
		//this.graphs[0].intermedResampleSet = "***intermedResampleSet-"+graphCollection.nextIntermedResampleSetNumber++;
		//this.data[this.graphs[0].intermedResampleSet] = [];
		//this.graphs[0].addCategory(this.graphs[0].intermedResampleSet);
		//this.graphs[0].fitScalesToData = true;
		//this.graphs[0].baseLine = 60;	
		
		////Add a graph to display intermediate resampling results.
		//this.graphs.splice(0,0,new Graph(this));
		
		//this.graphs[0].testMode = "intermedResampling";
		//this.graphs[0].isIntermedResamplingGraph = true;
		//this.graphs[0].intermedResampleSet = "***intermedResampleSet-"+graphCollection.nextIntermedResampleSetNumber++;
		//this.data[this.graphs[0].intermedResampleSet] = [];
		//this.graphs[0].addCategory(this.graphs[0].intermedResampleSet);
		//this.graphs[0].fitScalesToData = true;
		//this.graphs[0].baseLine = 60;
	
		//Add a graph to display the overall resampling results.
		this.graphs.splice(0,0,new Graph(this));
			
		//set variables to distinguish resampling graph as special type
		this.graphs[0].testMode = "resampling";
		this.graphs[0].isResamplingGraph = true;
		this.graphs[0].resampleSet = "***resampleSet-"+graphCollection.nextResampleSetNumber++;
		this.data[this.graphs[0].resampleSet] = [];
		this.graphs[0].addCategory(this.graphs[0].resampleSet);
		this.graphs[0].fitScalesToData = true;
		this.graphs[0].baseLine = 60;
		
		this.setH(this.calcGraphHeight());
	},
	
	removeGraph: function(graph){
		if (graph.testMode == "sampling"){
			if (this.resamplingEnabled){
				if (this.graphs.indexOf(graph)+1 == this.graphs.indexOf(this.graphs[0].population1))
					this.graphs[0].population1 = this.graphs[0];
				if (this.graphs.indexOf(graph)+1 == this.graphs.indexOf(this.graphs[0].population2))
					this.graphs[0].population2 = this.graphs[0];
			}
			
			for (i=0; i<graph.sampleSet.length; i++)
				delete graphCollection.data[graph.sampleSet[i]];
			
			for (var i=1; i<=graph.samplingToHowMany; i++)
				this.graphs.splice(this.graphs.indexOf(graph)+1,1);
			
				
		} else if (graph.testMode == "resampling") {
			delete graphCollection.data[graph.resampleSet];
		}
		
		//reassign population for resampling if graph being removed was assigned as a population
		if (this.resamplingEnabled){
			if (this.graphs.indexOf(graph) == this.graphs.indexOf(this.graphs[0].population1))
				this.graphs[0].population1 = this.graphs[0];
			if (this.graphs.indexOf(graph) == this.graphs.indexOf(this.graphs[0].population2))
				this.graphs[0].population2 = this.graphs[0];
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
			positionPopulationLabels();
			positionSampleOptions(g,i);
			positionSampleButton(g,i);
			positionResampleControlPanel(g,i);
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
		
		$('#sampling').attr('checked', this.graphs[this.selectedGraphIndex].testMode == "sampling");
		$('#numSamples').val(this.graphs[this.selectedGraphIndex].samplingToHowMany+"");
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
			if(!graph.isResamplingGraph){
				if (graph.xMax > max) max = graph.xMax
				if (graph.xMin < min) min = graph.xMin
			}
		});
		this.graphs.forEach(function(graph){
			if(!graph.isResamplingGraph){
				if (min > 1000)
					min = Math.floor(min/1000)*1000;
				
				if (!graph.customScale || graph.xMin < graph.scaleMin || graph.xMax > graph.scaleMax)
					graph.setXScale(Math.floor(min), Math.ceil(max)+0.1);
			}
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
	this.baseLine = 40;
	
	this.twoLineLegend = false;
	
	//Testing variables
	this.testMode = "noTest";
	
	this.isSamplingGraph = false;
	this.samplingFrom = null;			//Graph Object, used by sample graph
	this.samplingTo = [];				//Graph Object Array, used by source graph
	this.samplingToHowMany = 1;		//Used by source graph
	this.sampleSet = [];					//String Array in source graph, String in sample graph
	this.samplingHowMany = 10;		//Used by sample graph
	this.sampleNumber = 1;
	this.selectedSample  = null;
	this.selectedSampleNumber = 1;
	
	
	
	this.isResamplingGraph = false;
	this.population1 = this;			//Graph Object
	this.population2 = this;			//Graph Object
	this.resampleSet = null;
	this.resamplingIterations = 1000;
	this.resampleHistogram = false;
	this.resampleDisplayMode = "dot";  //"dot", "line", "histogram", "pgraph"
	this.resamplingPVals = [];					//P Vals at significant number of iterations
	this.resamplingMaxPVal = -1;
	this.resamplingReplacement = false;
}

Graph.prototype = {
	setXScale: function(min, max){
		var newMin = min || this.scaleMin;
		var newMax = max || this.scaleMax;
		
		if (min == 0)
			newMin = min;
		
		if (this.fitScaleToData) {
			if (this.isSamplingGraph == false)
				this.x = pv.Scale.linear(Math.floor(this.xMin), Math.ceil(this.xMax)).range(0, this.w);	
			else 
				this.x = pv.Scale.linear(Math.floor(this.samplingFrom.xMin), Math.ceil(this.samplingFrom.xMax)).range(0, this.w);	
		} else {
			this.x = pv.Scale.linear(newMin, newMax).range(0, this.w);
			this.scaleMin = newMin;
			this.scaleMax = newMax;
		}
		
		if (this.testMode == "sampling"){
			for (var i=0; i<this.samplingToHowMany; i++){
				this.samplingTo[i].fitScaleToData = this.fitScaleToData;
				this.samplingTo[i].setXScale(min,max);
				
			}
		}
	},
	
	addCategory: function(category){
		if (this.includedCategories.indexOf(category) == -1 && 
				this.includedCategories.length < 4 &&
				!this.isSamplingGraph &&
				!this.isIntermedResamplingGraph){
			
			if ((this.isResamplingGraph && this.includedCategories.length < 1) || !this.isResamplingGraph){
				this.includedCategories.push(category);
				
				this.selectedCategory = category;
				
				if (this.includedCategories.length > 2){
					this.twoLineLegend = true;
					this.baseLine = 89;
				} else {
					this.twoLineLegend = false;
					this.baseLine = 54;
				}
				var dataVals = this.dataVals();
				
				if (dataVals.length > 1){
					this.xMax = pv.max(dataVals, function(d) { return d });
					this.xMin = pv.min(dataVals, function(d) { return d });
				} else {
					this.xMax = 100.0;
					this.xMin = 0.0;
				}
				this.n = dataVals.length;
				
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
				
				if (this.testMode == "sampling")
					for (var i=0; i<this.samplingTo.length; i++)
						this.samplingTo[i].updateSample(this.samplingTo[i].samplingHowMany);
						
				if (this.graphCollection.resamplingEnabled)
					if (this.graphCollection.graphs[0].population1 == this ||
							this.graphCollection.graphs[0].population2 == this)
						resetResampling(0);
						
				return true;
			} else {
				return false;
			}
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
			
		if (this.testMode == "sampling")
			for (var i=0; i<this.samplingTo.length; i++){
				if (this.n < this.samplingTo[i].samplingHowMany)
					this.samplingTo[i].samplingHowMany = this.n;
				this.samplingTo[i].updateSample(this.samplingTo[i].samplingHowMany);
			}
			
		if (this.graphCollection.resamplingEnabled)
			if (this.graphCollection.graphs[0].population1 == this ||
					this.graphCollection.graphs[0].population2 == this)
				resetResampling(0);
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
		
		var dotSize = this.isResamplingGraph ? 2 : graphCollection.bucketDotSize;
		
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
											 "y":this.graphCollection.bucketDotSize + j*2*dotSize,
											 "label":pointsInBucket[j][1],
											 "set":pointsInBucket[j][2]
										 });
				}
				break;
			case "center":
				for (var j = 0; j < pointsInBucket.length; j++){
					points.push({"x":(this.x(bucketMin)+this.x(bucketMax))/2,
											 "xReal":pointsInBucket[j][0],
											 "y":this.graphCollection.bucketDotSize + j*2*dotSize,
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
							"y":dotSize,
							"label":pointsInBucket[j][1],
							"set":pointsInBucket[j][2]
							};
							
						var collisionPoints = [];
						for (var k = 0; k < points.length; k++){
							if (Math.abs(points[k].x-candidatePoint.x) < dotSize*2) {
								collisionPoints.push(points[k]);
							}
						}
						
						if (collisionPoints.length > 0)
							candidatePoint.y = fitPointInGraph(candidatePoint, collisionPoints, dotSize);
						
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
	if (typeof param == 'string'){  //URL of google spreadsheet containing datasets
		this.URL = param;
		this.local = false;
		this.userCreated = false;
		this.fetchWorksheetData();
	} else {
		if (param.hasOwnProperty('userDefined')){  //User created datasets
			this.URL = param.title;
			this.local = true;
			this.title = param.title;
			this.labelMasterList = param.labelMasterList;
			this.labelType = param.labelType;
			this.userCreated = true;
			this.storedLocally = false;
			this.data = param.data;
			this.edited = param.edited;
			userCreatedWorksheet = this;
			graphCollection.addWorksheet(this);
				
		} else if (param.hasOwnProperty('fromLocalStorage')){  //User created and stored in localStorage
			this.URL = param.title;
			this.local = true;
			this.title = param.title;
			this.labelMasterList = param.labelMasterList;
			this.labelType = param.labelType;
			this.userCreated = true;
			this.storedLocally = true;
			this.data = param.data;
			this.edited = param.edited;
			
			for (var setName in this.edited)
				this.edited[setName] = false;
			 
			//userCreatedWorksheet = this;
			graphCollection.addWorksheet(this);
			
		} else {  //For hardcoded datasets
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
		worksheet.edited = {}
		worksheet.description = worksheet.getDescription(feedData);
		for (var key in worksheet.data){
			worksheet.edited[key] = false;
		}
		jQuery('body').trigger({ type:'WorksheetLoaded', worksheet:worksheet, refresh:true });
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
	if( typeof key == 'string'){
		this.key = key;
		this.fetchWorksheets();
		this.local = false;
	
	} else {
		if (key.hasOwnProperty('userDefined')){  //User defined and just created
			this.key = 'local';
			this.local = true;
			this.constructUserDefinedWorksheet(key);

		} else if (key.hasOwnProperty('fromLocalStorage')){  //User defined and from localStorage
			this.worksheets.push(new Worksheet(key));

		} else {  //hardcoded json from google spreadsheets
			this.key = 'local'
			this.constructLocalWorksheets(key);
			this.local = true;
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



