//Entry Point
var exampleSpreadsheets = [
	//new Spreadsheet('0AuGPdilGXQlBdHlYdkZ0a0tlZ1F4N1FQc2luOTNtZUE'),  //Old Format
	new Spreadsheet('0AuGPdilGXQlBdEd4SU44cVI5TXJxLXd3a0JqS3lHTUE'),		//Combined Format
];

// Populate dataset drop down menu
var lastSelectedWorksheet; 
var numWorksheetsLoaded = 0;
jQuery('body').bind('WorksheetLoaded', function(event) {
  jQuery('#workSheetSelector').prepend(jQuery("<option value='" + event.worksheet.URL + "'>" + event.worksheet.title + " by " + event.worksheet.labelType + "</option>")).val(event.worksheet.URL);
  lastSelectedWorksheet = event.worksheet.URL;
  numWorksheetsLoaded++;
  if (numWorksheetsLoaded >= numWorksheets){
		jQuery('p#loadingMsg').hide();	
		graphCollection = new GraphCollection();
		constructVis();
		positionGroupingMenuOverGraph(0,graphCollection);
		positionDisplayMenu();
  }
});

var graphCollection = {};
var vis = {};
var touch = new Touch();

//var draggedObj = undefined;
//var dragging = false;
//var dragCat = undefined;
//var dragGraphIndex = undefined;  // -1 means side panel, all others are graph index
//var finalX = undefined;
//var finalY = undefined;

function constructVis(){
	jQuery('span').remove();
	
	vis = new pv.Panel()
		.width(graphCollection.w)
		.height(graphCollection.h)
		.bottom(graphCollection.padBot)
		.left(graphCollection.padLeft)
		.right(graphCollection.padRight)
		.top(graphCollection.padTop)
		//.fillStyle(function(){
		//	if (graphCollection.editModeEnabled)
		//		return pv.rgb(252,168,179,1);
		//	else
		//		return "clear";
		//})
	
	/* Divider Between Graphs and Data Sets */
	vis.add(pv.Rule)
		.left(-35)
		.bottom(0)
		.top(-30)
		
	/*Divider Between Top Graph and Title*/
	vis.add(pv.Rule)
		.top(-1)
		.right(-25)
		.left(-35)
	
	/*Graph Title*/		  
	vis.add(pv.Label)
		.left(graphCollection.w / 2)
		.top(-5)
		.textAlign("center")
		.textAngle(0)
		.text(graphCollection.worksheet.title + " by " +graphCollection.worksheet.labelType)
		.font("bold 20px sans-serif");
	
	/* Display Options Menu Button */
	vis.add(pv.Image)
		.url("http://centerforbiophotonics.github.com/SeeIt3/img/eye.png")  //fix this
		.width(30)
		.height(30)
		.top(-30)
		.left(-30)
		.cursor("pointer")
		.title("Show display option menu")
		.event("click", function(){
			$('#displayOptions').slideDown();
		})
		
	/* Add New Graph Button */
	vis.add(pv.Image)
		.url("http://centerforbiophotonics.github.com/SeeIt3/img/newGraph.png")  //fix this
		.width(30)
		.height(30)
		.top(-30)
		.left(100)
		.cursor("pointer")
		.title("Add new graph")
		.event("click", function(){
			graphCollection.addGraph();
			constructVis();
		})
		
	/* Toggle Edit Mode Button */
	vis.add(pv.Image)
		.url("http://centerforbiophotonics.github.com/SeeIt3/img/hand.png")  //fix this
		.width(30)
		.height(30)
		.top(-30)
		.left(200)
		.cursor("pointer")
		.title("Toggle edit mode")
		.event("click", function(){
			graphCollection.editModeEnabled = !(graphCollection.editModeEnabled);
			if (graphCollection.editModeEnabled)
				jQuery('body').css('background-color', "#FCA8B3")
			else
				jQuery('body').css('background-color', "#FFFFFF")
			vis.render();
		})
	
	constructCategoryPanel(vis);
	
	graphCollection.graphs.forEach(function(graph,index,graphs){
		constructGraphPanel(vis, graph, index, graphs.length);
	});
	vis.render();
	positionGroupingMenuOverGraph(graphCollection.selectedGraphIndex, graphCollection);
}
		  
function constructCategoryPanel(vis){
	var row = 0;
	var fontString = "bold 14px sans-serif";
	
	vis.add(pv.Label)
		.text("Data Sets:")
		.left(-197)
		.top(-10)
		.font(fontString);
	
	var dragFeedbackPanels = [];	
	for (var key in graphCollection.worksheet.data){
		var abbrevKey = key.slice(0,15);
		if (key.length > 15)
			abbrevKey += "...";
		
		//Copy of category panel which follows mouse as it is dragged
		dragFeedbackPanels[row] = vis.add(pv.Panel)
			.visible(false)
			.lineWidth(1)
			.strokeStyle("black")
			.height(30)
			.width(160)
			.left(0)
			.top(0)
			
		dragFeedbackPanels[row].add(pv.Dot)
			.left(15)
			.top(15)
			.shape("square")
			.size(80)
			.def("category", key)
			.fillStyle(function(d) {return pointFillStyle(this.category())})
			.strokeStyle(function(d) {return pointStrokeStyle(this.category())})
			.lineWidth(2)
			.anchor("right").add(pv.Label)
				.def("category", key)
				.text(abbrevKey)
				.font(fontString)
				.textStyle(function(){
					if (graphCollection.editedCategories[this.category()])
						return "red";
					else 
						return "black";
				})
		
		//Edit category button
		vis.add(pv.Image)
		.url("http://centerforbiophotonics.github.com/SeeIt3/img/edit.png")  //fix this
		.def("category", key)
		.def("row",row)
		.width(30)
		.height(30)
		.left(-232)
		.top(40*row - 5)
		.cursor("pointer")
		.title("Edit dataset")
		.event("click", function(){
			resetEditDataSetMenu();
			populateEditMenuFromExisting(this.category());
			$('#dataSetEdit').slideDown();
		})
		
		
		//Panel representing a data category/set
		var catPanel = vis.add(pv.Panel)
			.data([{"x":0,"y":0}])
			.def("category", key)
			.def("row",row)
			.events("all")
			.cursor("move")
			.title(key)
			.lineWidth(1)
			.height(30)
			.width(160)
			.left(-198)
			.top(40*row - 5)
			.event("mouseover", function(d){
				this.strokeStyle("black");
				this.render();
			})
			.event("mouseout", function(d){ 
				this.strokeStyle(pv.rgb(0,0,0,0));
				this.render();
			})
			.event("mousedown", pv.Behavior.drag())
			.event("dragstart", function(){
				var mouseY = vis.mouse().y;
				var mouseX = vis.mouse().x;
				dragFeedbackPanels[this.row()].left(mouseX);
				dragFeedbackPanels[this.row()].top(mouseY);
				dragFeedbackPanels[this.row()].visible(true);
				document.body.style.cursor="move";
				dragFeedbackPanels[this.row()].render();
			})
			.event("drag", function(event){
				var mouseY = vis.mouse().y;
				var mouseX = vis.mouse().x;
				dragFeedbackPanels[this.row()].left(mouseX);
				dragFeedbackPanels[this.row()].top(mouseY);
				dragFeedbackPanels[this.row()].render();
			})
			.event("dragend", function(){
				var mouseY = vis.mouse().y;
				var mouseX = vis.mouse().x;
				if(mouseX > 0 && mouseX < graphCollection.w && mouseY > 0 && mouseY < graphCollection.h){
					if (graphCollection.graphs.length > 4){
						var which = parseInt(mouseY/graphCollection.defaultGraphHeight);
						graphCollection.graphs[which].addCategory(this.category());
						graphCollection.updateMenuOptions();
					} else {
						var which = parseInt(mouseY/(graphCollection.h/graphCollection.graphs.length));
						graphCollection.graphs[which].addCategory(this.category());
						graphCollection.updateMenuOptions();
					}
				}
				dragFeedbackPanels[this.row()].visible(false);
				document.body.style.cursor="default";
				constructVis();
			})
			.event("touchstart", function(event){
				touch.draggedObj = dragFeedbackPanels[this.row()];
				touch.dragging = true;
				touch.dragCat = this.category();
				touch.dragGraphIndex = -1;
			})
			
			
			
		catPanel.add(pv.Dot)
			.left(15)
			.top(15)
			.def("category", key)
			.shape("square")
			.cursor("move")
			.size(80)
			.fillStyle(function(d) {return pointFillStyle(this.category())})
			.strokeStyle(function(d) {return pointStrokeStyle(this.category())})
			.lineWidth(2)
			.anchor("right").add(pv.Label)
				.text(abbrevKey)
				.font(fontString)
				.def("category", key)
				.textStyle(function(){
					if (graphCollection.editedCategories[this.category()])
						return "red";
					else 
						return "black";
				})

		row++;
	}
	
	//New Data Set Button
	var newDataPanel = vis.add(pv.Panel)
			.events("all")
			.cursor("pointer")
			.title("Add a Dataset")
			.lineWidth(1)
			.height(30)
			.width(160)
			.left(-198)
			.top(40*row - 5)
			.event("click", function(){
				resetAddDataSetMenu();
				populateAddMenuLabelsFromExisting();
				$('#dataSetAdd').slideDown();
			});
			
		newDataPanel.add(pv.Dot)
			.left(15)
			.top(15)
			.def("category", key)
			.shape("square")
			.cursor("pointer")
			.size(80)
			.strokeStyle("black")
			.lineWidth(2)
			.anchor("right").add(pv.Label)
				.text("Add a Dataset")
				.font(fontString)
		
		newDataPanel.add(pv.Dot)
			.left(15)
			.top(15)
			.angle(Math.PI/4)
			.shape("cross")
			.cursor("pointer")
			.events("all")
			.size(20)
			.lineWidth(2)
			.title("Add a Dataset")
			.strokeStyle("black")
}



function constructGraphPanel(vis, graph, index, numberOfGraphs){
	var fontString = "bold 14px sans-serif";
	graph.overflowFlag = false;
	
	var graphPanel = vis.add(pv.Panel)
		.top(function(){return graph.h*index})
		.height(graph.h)
		.width(graph.w)
		.events("all")
		.event("click", function(){
			var oldIndex = graphCollection.selectedGraphIndex;
			if (oldIndex != index)
				graphCollection.selectAUserDefPartition();
			graphCollection.selectedGraphIndex = index;
			graphCollection.updateMenuOptions();
			
			positionGroupingMenuOverGraph(index, graphCollection);
					
			if (oldIndex == index) $('#groupingOptions').slideUp();
			else $('#groupingOptions').hide();
			$('#displayOptions').slideUp();
			vis.render();
		});
		
	graph.panel = graphPanel;
	
	//Remove Graph Button
	graphPanel.add(pv.Panel)
		.right(-20)
		.top(5)
		.width(20)
		.height(20)
		.strokeStyle("black")
		.cursor("pointer")
		.events("all")
		.title("Remove graph")
		.event("click", function(){
			graphCollection.removeGraph(graph);
			constructVis();
		})
		.add(pv.Dot)
			.left(10)
			.top(10)
			.shape("cross")
			.cursor("pointer")
			.events("all")
			.size(20)
			.lineWidth(2)
			.title("Remove Graph")
			.strokeStyle("black")
			
	//Show Grouping Option Menu Button
	graphPanel.add(pv.Image)
		.url("http://centerforbiophotonics.github.com/SeeIt3/img/wrench.png")  //fix this
		.width(30)
		.height(30)
		.top(4)
		.left(-30)
		.cursor("pointer")
		.title("Show graph option menu")
		.event("click", function(){
			graphCollection.selectedGraphIndex = index;
			graphCollection.updateMenuOptions();
			positionGroupingMenuOverGraph(index, graphCollection);
			$('#groupingOptions').slideDown();
		})
				
	//Divider Line Between Graphs
	graphPanel.add(pv.Rule)
		.bottom(0)
		.left(-35)
		.right(-25)
	
	if (graph.includedCategories.length > 0){
		/* Number of datapoints N */
		graphPanel.add(pv.Label)
			.right(function() {return graph.w/2})
			.top(2)
			.textAlign("center")
			.textAngle(0)
			.textBaseline("top")
			.text("N = " + graph.n)
			.font(fontString);
			
		/* X-axis ticks */
		graphPanel.add(pv.Rule)
			.data(function() { return getXBuckets(graph) })
			.left(function(d) {return graph.x(d)})
			.bottom(graph.baseLine)
			.strokeStyle("#aaa")
			.height(5)
			.anchor("bottom").add(pv.Label)
				.text(function(d) {return d.toFixed(1)})
				.font(function(){return "bold "+graphCollection.tickTextSize+"px sans-serif"})
				.visible(function(d) {return this.index % 2 == 0})
			
		/* X-axis line */
		graphPanel.add(pv.Rule)
			.bottom(graph.baseLine)
			.strokeStyle("#000");
		
		
		
		/* UD Edge of the graph partition lines 
		 * Where new partitions come from 
		 */
		graphPanel.add(pv.Rule)
			.data([{"x":0,"y":0}])
			.left(0)
			.bottom(function(){return graph.baseLine})
			.height(function(){return graph.h * 0.75})
			.strokeStyle("green")
			.visible(function(){return graph.groupingMode == "UserDefGroups"})
			.anchor("top").add(pv.Dot)
				.left(9)
				.title("Drag to create a new partition.")
				.events("all")
				.cursor("move")
				.shape("square")
				.fillStyle("green")
				.strokeStyle("green")
				.radius(8)
				.event("mousedown", pv.Behavior.drag())
				.event("dragstart", function() {
					graphCollection.selectAUserDefPartition(index, graph.udPartitions.push(vis.mouse())-1)
					graphPanel.render();
				})
				.event("drag", function(){
					graph.udPartitions[graph.udPartitions.length-1] = vis.mouse();
					graphPanel.render();
				})
				.event("dragend",function(){
					graph.udPartitions[graph.udPartitions.length-1] = vis.mouse();
					graphPanel.render();
				}) 
				
		/* User Defined Partitions */
		graphPanel.add(pv.Rule)
			.data(function(){return graph.udPartitions})
			.left(function(d){return d.x})
			.bottom(function(){return graph.baseLine})
			.height(function(){return graph.h * 0.75})
			.strokeStyle("green")
			.visible(function(){return graph.groupingMode == "UserDefGroups"})
			.anchor("top").add(pv.Dot)
				.left(function(d){return d.x + 9})
				.title(function(d){return graph.x.invert(d.x)})
				.events("all")
				.cursor("move")
				.shape("square")
				.fillStyle(function() {
					if (graph.selectedUDPart == this.index)  return "yellow";
					else return "green";
				})
				.strokeStyle("green")
				.radius(8)
				.event("mousedown", pv.Behavior.drag())
				.event("dragstart", function() {
					graphCollection.selectAUserDefPartition(index, this.index);
				})
				.event("drag", vis)
			
		
		graphPanel.add(pv.Rule)
			.right(0)
			.bottom(function(){return graph.baseLine})
			.height(function(){return graph.h * 0.75})
			.strokeStyle("green")
			.visible(function(){return graph.groupingMode == "UserDefGroups"})
			
			
		/* UD Partition Data Count Label */
		graphPanel.add(pv.Label)
			.data(function(){return countDataInUserDefPartitions(graph)})
			.textAlign("center")
			.textStyle("green")
			.bottom(function(){return graph.h * 0.70 + graph.baseLine})
			.left(function(d){
				var udPartXVals = getSortedUDPartitionXVals(graph);
				if (this.index != udPartXVals.length-1){
					return graph.x((udPartXVals[this.index]+udPartXVals[this.index+1])/2);
				} else return 0;
			})
			.visible(function(){
				var udPartXVals = getSortedUDPartitionXVals(graph);
				return this.index != udPartXVals.length-1 &&
							 graph.groupingMode == "UserDefGroups";
			});


    /* Listeners for user defined partition deletion */
    pv.listen(window, "mousedown", function() {self.focus()});
		pv.listen(window, "keydown", function(e) {
			//code 8 is backspace, code 46 is delete
			if ((e.keyCode == 8 || e.keyCode == 46) && graph.selectedUDPart != null) {			
				graph.udPartitions.splice(graph.selectedUDPart, 1);
				graphCollection.selectAUserDefPartition();
				e.preventDefault();
				constructVis();
			}
		});
		
		/* Fixed Interval Width Partitions */
		var fiwPartitions = partitionDataByIntervalWidth(graph);
		graphPanel.add(pv.Rule)
			.data(fiwPartitions)
			.left(function(d){return graph.x(d)})
			.bottom(function(){return graph.baseLine})
			.height(function(){return graph.h * 0.75})
			.visible(function(){return graph.groupingMode == "FixedIntervalGroups"})
			.strokeStyle("green")
			.title(function(d){return d})
			.anchor("top").add(pv.Dot)
				.title(function(d){return d})
				.shape("square")
				.fillStyle("green")
				.strokeStyle("green")
				.size(4);
			
		/*Fixed Interval Width Partitions Size Labels*/
		graphPanel.add(pv.Label)
			.data(countDataInPartitions(graph,fiwPartitions))
			.textAlign("center")
			.textStyle("green")
			.bottom(function(){return graph.h * 0.70 + graph.baseLine})
			.left(function(){
				if (this.index != fiwPartitions.length-1){
					return graph.x((fiwPartitions[this.index]+fiwPartitions[this.index+1])/2);
				} else return 0;
			})
			.visible(function(){
				return this.index != fiwPartitions.length-1 &&
							 graph.groupingMode == "FixedIntervalGroups";
			});
			
		/* Fixed Interval Width Histogram */
		var histRects = fiwHistogram(graph,fiwPartitions);
		for (var i=0; i < histRects.length; i++){	  									   
			graphPanel.add(pv.Line)
				.data(histRects[i])
				.visible(function(d) { 
					return ( graph.groupingMode == "FixedIntervalGroups" &&
									 graph.histogram
									) 
				})
				.left(function(d) { return graph.x(d[0]) })
				.bottom(function(d) { return d[1] })
				.lineWidth(0.5)
				.strokeStyle("green")
				.fillStyle(pv.rgb(0,225,0,0.05));
		}
		
		/* Fixed Group Size Partitions */
		var fgPartitions = partitionDataInFixedSizeGroups(graph);
		graphPanel.add(pv.Rule)
			.data(fgPartitions)
			.left(function(d){return graph.x(d)})
			.bottom(function(){return graph.baseLine})
			.height(function(){return graph.h * 0.75})
			.visible(function(){return graph.groupingMode == "FixedSizeGroups"})
			.strokeStyle("green")
			.title(function(d){return d})
			.anchor("top").add(pv.Dot)
				.title(function(d){return d})
				.shape("square")
				.fillStyle("green")
				.strokeStyle("green")
				.size(4);
			
		/*Fixed Size Partition Size Labels*/
		graphPanel.add(pv.Label)
			.data(fgPartitions)
			.textAlign("center")
			.textStyle("green")
			.bottom(function(){return graph.h * 0.70 + graph.baseLine})
			.left(function(){
				if (this.index != fgPartitions.length-1){
					return graph.x((fgPartitions[this.index]+fgPartitions[this.index+1])/2);
				} else return 0;
			})
			.visible(function(){
				return this.index != fgPartitions.length-1 &&
							 graph.groupingMode == "FixedSizeGroups";
			})
			.text(function(){
				if (graph.dataVals().length % graph.partitionGroupSize == 0 ||
						this.index != fgPartitions.length-2)
					return graph.partitionGroupSize;
				
				else return graph.dataVals().length % graph.partitionGroupSize;
				
			})
			
		/* Two Equal Partitions */
		var twoPartitions = partitionDataInTwo(graph);
		graphPanel.add(pv.Rule)
			.data(twoPartitions)
			.left(function(d){return graph.x(d)})
			.bottom(function(){return graph.baseLine})
			.height(function(){return graph.h * 0.75})
			.visible(function(){return graph.groupingMode == "TwoEqualGroups"})
			.strokeStyle("green")
			.title(function(d){return d})
			.anchor("top").add(pv.Dot)
				.title(function(d){return d})
				.shape("square")
				.fillStyle("green")
				.strokeStyle("green")
				.size(4);
				
		/*Two Partition Size Labels*/
		graphPanel.add(pv.Label)
			.data(twoPartitions)
			.textAlign("center")
			.textStyle("green")
			.bottom(function(){return graph.h * 0.70 + graph.baseLine})
			.left(function(){
				if (this.index != twoPartitions.length-1){
					return graph.x((twoPartitions[this.index]+twoPartitions[this.index+1])/2);
				} else return 0;
			})
			.visible(function(){
				return this.index != twoPartitions.length-1 &&
							 graph.groupingMode == "TwoEqualGroups";
			})
			.text(function(){
				if (graph.dataVals().length % 2 == 0)
					return graph.dataVals().length/2;
				else if(this.index != twoPartitions.length-2)
					return Math.ceil(graph.dataVals().length/2);
				else
					return Math.floor(graph.dataVals().length/2);
				
			})
		
		/* Four Equal Partitions */
		var fourPartitions = partitionDataInFour(graph);
		graphPanel.add(pv.Rule)
			.data(fourPartitions)
			.left(function(d){return graph.x(d)})
			.bottom(function(){return graph.baseLine})
			.height(function(){return graph.h * 0.75})
			.visible(function(){return graph.groupingMode == "FourEqualGroups" &&
																 graph.boxPlot == false;})
			.strokeStyle("green")
			.title(function(d){return d})
			.anchor("top").add(pv.Dot)
				.title(function(d){return d})
				.shape("square")
				.fillStyle("green")
				.strokeStyle("green")
				.visible(function(){return graph.groupingMode == "FourEqualGroups" &&
																	 graph.boxPlot == false; })
				.size(4);
				
		/*Four Partition Size Labels*/
		graphPanel.add(pv.Label)
			.data(fourPartitions)
			.textAlign("center")
			.textStyle("green")
			.bottom(function(){return graph.h * 0.70 + graph.baseLine})
			.left(function(){
				if (this.index != fourPartitions.length-1){
					return graph.x((fourPartitions[this.index]+fourPartitions[this.index+1])/2);
				} else return 0;
			})
			.visible(function(){
				return this.index != fourPartitions.length-1 &&
							graph.groupingMode == "FourEqualGroups" &&
							graph.boxPlot == false;
			})
			.text(function(){
				var dataLength = graph.dataVals().length;
				if (dataLength >= 8){
					if (dataLength % 4 == 0)
						return dataLength/4;
					else if(this.index != fourPartitions.length-2)
						return Math.ceil(dataLength/4);
					else
						return dataLength % Math.ceil(dataLength/4);
				} else {
					if(this.index != fourPartitions.length-2)
						return 1;
					else
						return dataLength - 3;
				}
			})
			
		/* Box Plot Extra Lines */
		graphPanel.add(pv.Line)
			.data([[fourPartitions[0], graph.baseLine],
						 [fourPartitions[0], graph.h * 0.80]])
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.groupingMode == "FourEqualGroups" &&
																	 graph.boxPlot; })
																	 
		graphPanel.add(pv.Line)
			.data([[fourPartitions[4], graph.baseLine],
						 [fourPartitions[4], graph.h * 0.80]])
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.groupingMode == "FourEqualGroups" &&
																	 graph.boxPlot; })
																	 
		graphPanel.add(pv.Line)
			.data([[fourPartitions[1], (graph.h-graph.baseLine) * 0.20 + graph.baseLine],
						 [fourPartitions[1], (graph.h-graph.baseLine) * 0.60 + graph.baseLine]])
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.groupingMode == "FourEqualGroups" &&
																	 graph.boxPlot; })
																	 
		graphPanel.add(pv.Line)
			.data([[fourPartitions[2], (graph.h-graph.baseLine) * 0.20 + graph.baseLine],
						 [fourPartitions[2], (graph.h-graph.baseLine) * 0.60 + graph.baseLine]])
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.groupingMode == "FourEqualGroups" &&
																	 graph.boxPlot; })
																	 
		graphPanel.add(pv.Line)
			.data([[fourPartitions[3], (graph.h-graph.baseLine) * 0.20 + graph.baseLine],
						 [fourPartitions[3], (graph.h-graph.baseLine) * 0.60 + graph.baseLine]])
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.groupingMode == "FourEqualGroups" &&
																	 graph.boxPlot; })						
																	 						
		graphPanel.add(pv.Line)
			.data([[fourPartitions[0], (graph.h-graph.baseLine) * 0.40 + graph.baseLine],
						 [fourPartitions[1], (graph.h-graph.baseLine) * 0.40 + graph.baseLine]])
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.groupingMode == "FourEqualGroups" &&
																	 graph.boxPlot; })
			
		graphPanel.add(pv.Line)
			.data([[fourPartitions[1], (graph.h-graph.baseLine) * 0.60 + graph.baseLine],
						 [fourPartitions[3], (graph.h-graph.baseLine) * 0.60 + graph.baseLine]])
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.groupingMode == "FourEqualGroups" &&
																	 graph.boxPlot; })
			
		graphPanel.add(pv.Line)
			.data([[fourPartitions[1], (graph.h-graph.baseLine) * 0.20 + graph.baseLine],
						 [fourPartitions[3], (graph.h-graph.baseLine) * 0.20 + graph.baseLine]])
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.groupingMode == "FourEqualGroups" &&
																	 graph.boxPlot; })
			
		graphPanel.add(pv.Line)
			.data([[fourPartitions[3], (graph.h-graph.baseLine) * 0.40 + graph.baseLine],
						 [fourPartitions[4], (graph.h-graph.baseLine) * 0.40 + graph.baseLine]])
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.groupingMode == "FourEqualGroups" &&
																	 graph.boxPlot; })
		
		
		/* Dots */
		graphPanel.add(pv.Dot)
			.data(function() {return graph.getDataDrawObjects()})
			.visible(function(d) {
				if ((d.y+graph.baseLine) > graph.h) graph.overflowFlag = true;
				return $('#checkboxHideData').attr('checked') == false  && (d.y+graph.baseLine) < graph.h;
			})
			.left(function(d) { return d.x })
			.bottom(function(d) {
				return d.y + graph.baseLine; 
			})
			.cursor(function(){
				if (graphCollection.editModeEnabled)
					return "move";
				else
					return "default";
			})
			.radius(function() {return graphCollection.bucketDotSize})
			.fillStyle(function(d) {return pointFillStyle(d.set)})
			.strokeStyle(function(d) {return pointStrokeStyle(d.set)})
			.title(function(d) { return d.label+", "+graph.x.invert(d.xReal).toFixed(1) })
			.event("mousedown", pv.Behavior.drag())
			.event("drag", function(d){
				if (graphCollection.editModeEnabled){
					graphCollection.worksheet.data[d.set].forEach(function(data){
						if (data.label == d.label){
							data.value = graph.x.invert(vis.mouse().x);
							graphCollection.editedCategories[d.set] = true;
							for (var h = 0; h < exampleSpreadsheets.length; h++) {
								for (var i = 0; i < exampleSpreadsheets[h].worksheets.length; i++) {
									if (exampleSpreadsheets[h].worksheets[i].URL == graph.worksheet.URL){
										exampleSpreadsheets[h].worksheets[i].data[d.set].edited = true;
									}
								}
							}
						}
					});
					graph.xMax = pv.max(graph.dataVals(), function(val) { return val });
					graph.xMin = pv.min(graph.dataVals(), function(val) { return val });
					graphCollection.scaleAllGraphsToFit();
					constructVis();
				}
			});
		
		//Graph Overflow Warning Message	
		graphPanel.add(pv.Label)
			.text("Warning! Data points exceed graph height.")
			.textStyle("red")
			.visible(function(){return graph.overflowFlag})
			.font(fontString)
			.top(35)
			.left(graph.w/2)
			.textAlign("center")
			
			
		/* Legend */
		var legendPanel = graphPanel.add(pv.Panel)
			.right(5)
			.top(4)
			.overflow("hidden")
			.width(function(){
				if(graph.legendHidden) return 110;
				else return 190;
			})
			.height(function(){
				if (graph.legendHidden)
					return 25;
				else
					return graph.includedCategories.length * 30 + 30
			})
			.lineWidth(1)
			.strokeStyle("black")
			.fillStyle(function(){
				if (graphCollection.editModeEnabled)
					return "#FCA8B3";
				else
				 return "white";
			})
		
		legendPanel.add(pv.Panel)
			.left(0)
			.top(0)
			.width(100)
			.height(30)
			.title("Click title to hide/show")
			.events("all")
			.event("click", function(){
				graph.legendHidden = !graph.legendHidden;
				legendPanel.render();
			})
			.add(pv.Label)
				.text(function() {
					if (graph.legendHidden) return "Show Legend";
					else return "Legend:";
				})
				.left(5)
				.top(5)
				.textBaseline("top")
				.font(fontString);

		var dragFeedbackPanels = [];
		graph.includedCategories.forEach(function(category, index){
			var abbrevKey = category.slice(0,15);//+"..."
			if (category.length > 15)
			abbrevKey += "...";
			
			//Copy of category panel which follows mouse as it is dragged
			dragFeedbackPanels[index] = vis.add(pv.Panel)
				.visible(false)
				.lineWidth(1)
				.strokeStyle("black")
				.height(30)
				.width(180)
				.left(0)
				.top(0)
				
			dragFeedbackPanels[index].add(pv.Dot)
				.left(15)
				.top(15)
				.shape("square")
				.size(80)
				.fillStyle(function(d) {return pointFillStyle(category)})
				.strokeStyle(function(d) {return pointStrokeStyle(category)})
				.lineWidth(2)
				.anchor("right").add(pv.Label)
					.text(abbrevKey)
					.font(fontString)
					.textStyle(function(){
						if (graphCollection.editedCategories[category])
							return "red";
						else 
							return "black";
					});
				
			var catPanel = legendPanel.add(pv.Panel)
				.left(5)
				.data([{"x":0,"y":0}])
				.def("category", category)
				.def("row",index)
				.title(category)
				.lineWidth(1)
				.visible(function(){ return !(graph.legendHidden)})
				.top(30*index+25)
				.height(30)
				.cursor("move")
				.events("all")
				.width(180)
				.event("mouseover", function(d){
					this.strokeStyle("black");
					this.render();
				})
				.event("mouseout", function(d){ 
					this.fillStyle(pv.rgb(0,0,0,0))
					this.strokeStyle(pv.rgb(0,0,0,0));
					this.render();
				})
				.event("mousedown", pv.Behavior.drag())
				.event("dragend", function(){
					var mouseY = vis.mouse().y;
					var mouseX = vis.mouse().x;
					if(mouseX > 0 && mouseX < graphCollection.w && mouseY > 0 && mouseY < graphCollection.h){
						if (graphCollection.graphs.length > 4){
							var which = parseInt(mouseY/graphCollection.defaultGraphHeight);
							if (graphCollection.graphs[which].addCategory(this.category()))
								graph.removeCategory(this.category());
							graphCollection.updateMenuOptions();
						} else {
							var which = parseInt(mouseY/(graphCollection.h/graphCollection.graphs.length));
							if (graphCollection.graphs[which].addCategory(this.category()))
								graph.removeCategory(this.category());
							graphCollection.updateMenuOptions();
						}
					} else {
						graph.removeCategory(category);
					}
					dragFeedbackPanels[this.row()].visible(false);
					document.body.style.cursor="default";
					constructVis();
				})
				.event("drag", function(){
					var mouseY = vis.mouse().y;
					var mouseX = vis.mouse().x;
					dragFeedbackPanels[this.row()].left(mouseX);
					dragFeedbackPanels[this.row()].top(mouseY);
					dragFeedbackPanels[this.row()].render();
				})
				.event("dragstart", function(){
					var mouseY = vis.mouse().y;
					var mouseX = vis.mouse().x;
					dragFeedbackPanels[this.row()].left(mouseX);
					dragFeedbackPanels[this.row()].top(mouseY);
					dragFeedbackPanels[this.row()].visible(true);
					document.body.style.cursor="move";
					dragFeedbackPanels[this.row()].render();
				})
				.event("touchstart", function(event){
					touch.draggedObj = dragFeedbackPanels[this.row()];
					touch.dragging = true;
					touch.dragCat = this.category();
					touch.dragGraphIndex = graphCollection.graphs.indexOf(graph);
				})
				
				
			catPanel.add(pv.Dot)
				.left(15)
				.top(15)
				.shape("square")
				.cursor("move")
				.size(80)
				.fillStyle(function(d) {return pointFillStyle(category)})
				.strokeStyle(function(d) {return pointStrokeStyle(category)})
				.lineWidth(2)
				.anchor("right").add(pv.Label)
					.text(abbrevKey)
					.font(fontString)	
					.textStyle(function(){
						if (graphCollection.editedCategories[category])
							return "red";
						else 
							return "black";
					});
		});	
	} else {
		//Empty Graph Message
		graphPanel.add(pv.Label)
			.left(graph.w/2)
			.top(graph.h/2)
			.textAlign("center")
			.textBaseline("center")
			.text("Empty Graph")
			.font(fontString)
		graphPanel.add(pv.Label)
			.left(graph.w/2)
			.top(graph.h/2 + 20)
			.textAlign("center")
			.textBaseline("center")
			.text("Drag a Dataset from the Left to Add")
			.font(fontString)
		graphPanel.add(pv.Label)
			.left(graph.w/2)
			.top(graph.h/2 + 40)
			.textAlign("center")
			.textBaseline("center")
			.text("Maximum 4 Datasets per Graph")
			.font(fontString)
	}
}
