var graphCollection = {};
var vis = {};

var draggedObj = undefined;
var dragging = false;
var dragCat = undefined;
var dragGraphIndex = undefined;  // -1 means side panel, all others are graph index
var finalX = undefined;
var finalY = undefined;

$('#textXMin').hide();
$('#textXMax').hide();

function constructVis(){
	jQuery('span').remove();
	//graph.graphOverflowFlag = false;
	
	vis = new pv.Panel()
		.width(graphCollection.w)
		.height(graphCollection.h)
		.bottom(graphCollection.padBot)
		.left(graphCollection.padLeft)
		.right(graphCollection.padRight)
		.top(graphCollection.padTop)
	
	/* Divider Between Graphs and Data Sets */
	vis.add(pv.Rule)
		.left(-15)
		.bottom(-20)
		.top(-30)
		
	/*Divider Between Top Graph and Title*/
	vis.add(pv.Rule)
		.top(-1)
		.right(-20)
		.left(-15)
	
	/*Graph Title*/		  
	vis.add(pv.Label)
		.left(graphCollection.w / 2)
		.top(-5)
		.textAlign("center")
		.textAngle(0)
		.text(graphCollection.worksheet.title)
		.font("bold 20px sans-serif");
	
	constructCategoryPanel(vis);
	
	graphCollection.graphs.forEach(function(graph,index,graphs){
		constructGraphPanel(vis, graph, index, graphs.length);
	});
	vis.render();
}
		  
function constructCategoryPanel(vis){
	var row = 0;
	var fontString = "bold 12px sans-serif";
	
	vis.add(pv.Label)
		.text("Data Sets:")
		.left(-147)
		.top(-10)
		.font(fontString);
	
	var dragFeedbackPanels = [];	
	for (var key in graphCollection.worksheet.data){
		var abbrevKey = key.slice(0,15)+"..."
		
		//Copy of category panel which follows mouse as it is dragged
		dragFeedbackPanels[row] = vis.add(pv.Panel)
			.visible(false)
			.lineWidth(1)
			.strokeStyle("black")
			.height(20)
			.width(130)
			.left(0)
			.top(0)
			
		dragFeedbackPanels[row].add(pv.Dot)
			.left(10)
			.top(10)
			.shape("square")
			.size(40)
			.fillStyle(graphCollection.categoryColors[key])
			.lineWidth(1)
			.strokeStyle("black")
			.anchor("right").add(pv.Label)
				.text(abbrevKey)
				.font(fontString)
		
		var catPanel = vis.add(pv.Panel)
			.data([{"x":0,"y":0}])
			.def("category", key)
			.def("row",row)
			.events("all")
			.cursor("move")
			.title(key)
			.lineWidth(1)
			.height(20)
			.width(130)
			.left(-147)
			.top(20*row - 10)
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
				vis.render();
			})
			.event("drag", function(event){
				var mouseY = vis.mouse().y;
				var mouseX = vis.mouse().x;
				dragFeedbackPanels[this.row()].left(mouseX);
				dragFeedbackPanels[this.row()].top(mouseY);
				vis.render()
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
				draggedObj = dragFeedbackPanels[this.row()];
				dragging = true;
				dragCat = this.category();
				dragGraphIndex = -1;
			})
			.event("touchmove", function(event){
				
			})
			.event("touchend", function(event){
				
				
			})
			
			
			
		catPanel.add(pv.Dot)
			.left(10)
			.top(10)
			.shape("square")
			.cursor("move")
			.size(40)
			.fillStyle(graphCollection.categoryColors[key])
			.lineWidth(1)
			.strokeStyle("black")
			.anchor("right").add(pv.Label)
				.text(abbrevKey)
				.font(fontString)

		row++;
	}	
}



function constructGraphPanel(vis, graph, index, numberOfGraphs){
	var fontString = "bold 12px sans-serif";
	
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
					
			if (oldIndex != index) $('#groupingOptions').slideUp();
			vis.render();
		});
		
	graph.panel = graphPanel;
	
	//Selected Graph Highlights
	graphPanel.add(pv.Rule)
		.visible(function(){return graphCollection.selectedGraphIndex == index})
		.bottom(1)
		.left(-15)
		.right(-20)
		.lineWidth(3)
		
	graphPanel.add(pv.Rule)
		.visible(function(){return graphCollection.selectedGraphIndex == index})
		.left(-14)
		.lineWidth(3)
		
	graphPanel.add(pv.Rule)
		.visible(function(){return graphCollection.selectedGraphIndex == index})
		.top(-1)
		.left(-15)
		.right(-20)
		.lineWidth(3)
		
	graphPanel.add(pv.Rule)
		.visible(function(){return graphCollection.selectedGraphIndex == index})
		.right(-19)
		.lineWidth(3)
	
	//Remove Graph Button
	graphPanel.add(pv.Panel)
		.left(-8)
		.top(5)
		.width(20)
		.height(20)
		.visible(function(){return index == graphCollection.selectedGraphIndex})
		.strokeStyle("black")
		.cursor("pointer")
		.events("all")
		.title("Remove Graph")
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
		.width(20)
		.height(20)
		.top(4)
		.left(20)
		.visible(function(){return index == graphCollection.selectedGraphIndex})
		.cursor("pointer")
		.title("Show Graph Option Menu")
		.event("click", function(){
			positionGroupingMenuOverGraph(index, graphCollection);
			$('#groupingOptions').slideDown();
		})
				
	//Divider Line Between Graphs
	graphPanel.add(pv.Rule)
		.bottom(1)
		.left(-15)
		.right(-20)
	
	if (graph.includedCategories.length > 0){
		/* Number of datapoints N */
		graphPanel.add(pv.Label)
			.right(0)
			.top(2)
			.textAlign("right")
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
			
		/* X-axis line */
		graphPanel.add(pv.Rule)
			.bottom(graph.baseLine)
			.strokeStyle("#000");
			
		/* Legend */
		graphPanel.add(pv.Label)
			.text("Legend:")
			.right(130)
			.top(20)
			.textBaseline("top")
			.font(fontString);

		var dragFeedbackPanels = [];
		graph.includedCategories.forEach(function(category, index){
			var abbrevKey = category.slice(0,15)+"..."
			
			//Copy of legend panel which follows mouse as it is dragged
			dragFeedbackPanels[index] = vis.add(pv.Panel)
				.visible(false)
				.lineWidth(1)
				.strokeStyle("black")
				.height(20)
				.width(130)
				.left(0)
				.top(0)
				
			dragFeedbackPanels[index].add(pv.Dot)
				.left(10)
				.top(10)
				.shape("square")
				.size(40)
				.fillStyle(graphCollection.categoryColors[category])
				.lineWidth(1)
				.strokeStyle("black")
				.anchor("right").add(pv.Label)
					.text(abbrevKey)
					.font(fontString)
				
			var legendPanel = graphPanel.add(pv.Panel)
				.right(0)
				.data([{"x":0,"y":0}])
				.def("category", category)
				.def("row",index)
				.title(category)
				.lineWidth(1)
				.top(20*index+40)
				.height(20)
				.cursor("move")
				.events("all")
				.width(130)
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
					vis.render()
				})
				.event("dragstart", function(){
					var mouseY = vis.mouse().y;
					var mouseX = vis.mouse().x;
					dragFeedbackPanels[this.row()].left(mouseX);
					dragFeedbackPanels[this.row()].top(mouseY);
					dragFeedbackPanels[this.row()].visible(true);
					document.body.style.cursor="move";
					vis.render();
				})
				
				
			legendPanel.add(pv.Dot)
				.left(10)
				.top(10)
				.shape("square")
				.cursor("move")
				.size(40)
				.fillStyle(graphCollection.categoryColors[category])
				.lineWidth(1)
				.strokeStyle("black")
				.anchor("right").add(pv.Label)
					.text(abbrevKey)
					.font(fontString)
					
		});
		
		/* User Defined Partitions */
		graphPanel.add(pv.Rule)
			.data(function(){return graph.udPartitions})
			.left(function(d){return d.x})
			.bottom(function(){return graph.baseLine})
			.height(function(){return graph.h * 0.75})
			.strokeStyle("green")
			.visible(function(){return graph.groupingMode == "UserDefGroups"})
			.anchor("top").add(pv.Dot)
				.title(function(d){return graph.x.invert(d.x)})
				.events("all")
				.cursor("move")
				.shape("square")
				.fillStyle(function() {
					if (graph.selectedUDPart == this.index)  return "yellow";
					else return "green";
				})
				.strokeStyle("green")
				.radius(4)
				.event("mousedown", pv.Behavior.drag())
				.event("dragstart", function() {
					graphCollection.selectAUserDefPartition(index, this.index);
				})
				.event("drag", vis)
		
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
				.title("Drag to create a new partition.")
				.events("all")
				.cursor("move")
				.shape("square")
				.fillStyle("green")
				.strokeStyle("green")
				.radius(4)
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
			
		
		graphPanel.add(pv.Rule)
			.right(0)
			.bottom(function(){return graph.baseLine})
			.height(function(){return graph.h * 0.75})
			.strokeStyle("green")
			.visible(function(){return graph.groupingMode == "UserDefGroups"})
			.event("dragstart", function() {
				graph.udPartitions.push(vis.mouse())
				graphPanel.render();
			})
			.event("drag", function(){
				graph.udPartitions.slice(-1) = vis.mouse();
			})
			.event("dragend",function(){
				graph.udPartitions.slice(-1) = vis.mouse();
			}) 
			
		/* UD Partition Data Count Label */
		graphPanel.add(pv.Label)
			.data(function(){return countDataInUserDefPartitions(graph)})
			.textAlign("center")
			.textStyle("green")
			.bottom(function(){return graph.h * 0.75 + graph.baseLine})
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
			.bottom(function(){return graph.h * 0.75 + graph.baseLine})
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
			.bottom(function(){return graph.h * 0.75 + graph.baseLine})
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
			.bottom(function(){return graph.h * 0.75 + graph.baseLine})
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
			.bottom(function(){return graph.h * 0.75 + graph.baseLine})
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
			.visible(function() { return $('#checkboxHideData').attr('checked') == false })
			.left(function(d) { return d.x })
			.bottom(function(d) {
				return d.y + graph.baseLine; 
			})
			.radius(function() {return graph.bucketDotSize})
			.fillStyle(function(d) {return graphCollection.categoryColors[d.set]})
			.strokeStyle(function(d) {return "black"})
			.title(function(d) { return d.label+", "+graph.x.invert(d.x).toFixed(1) });
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
			.top(graph.h/2 + 15)
			.textAlign("center")
			.textBaseline("center")
			.text("Drag a Dataset from the Left to Add")
			.font(fontString)
	}
	vis.render();
}
	
	
/* Events */	
jQuery('#newSpreadsheetURL').keyup(function(event) {
  if (event.keyCode == '13') {
	var key = parseSpreadsheetKeyFromURL($(this).val());
	$(this).val('');
	exampleSpreadsheets.push(new Spreadsheet(key));
  }
});

/* Dynamic Graph Resizing */
$(window).resize(function() {
	graphCollection.setW(calcGraphWidth());
	if (graphCollection.graphs.length <= 4)
		graphCollection.setH(calcGraphHeight());
	constructVis();
	positionGroupingMenuOverGraph(graphCollection.selectedGraphIndex, graphCollection);
})

/* Populate dataset drop down menu */
var numWorksheetsLoaded = 0;
jQuery('body').bind('WorksheetLoaded', function(event) {
  jQuery('#workSheetSelector').append(jQuery("<option value='" + event.worksheet.URL + "'>" + event.worksheet.title + "</option>")).val(event.worksheet.URL);
  numWorksheetsLoaded++;
  if (numWorksheetsLoaded >= numWorksheets){
		jQuery('p#loadingMsg').hide();	
		$('#textXMin').show();
		$('#textXMax').show();
		graphCollection = new GraphCollection();
		//updateScaleTextBoxes(graph);
		//toggleNetworkOptions(graph);
		constructVis();
		positionGroupingMenuOverGraph(0,graphCollection);
		//$('#groupingOptions').slideDown();
  }
});


jQuery('#menu').change(function(event) {
  constructVis();
  event.stopPropagation();
})

jQuery('#editInGoogleDocs').click(function(event) {
  var URL = jQuery('#workSheetSelector').val();
  var matches = /feeds\/cells\/([A-Z|a-z|0-9|_|-]+)/.exec(URL);
  window.open('https://spreadsheets.google.com/ccc?key=' + matches[1]);
  event.preventDefault();
});

jQuery('#groupingOptions').change(function(event) {
	graphCollection.graphs[graphCollection.selectedGraphIndex].groupingMode = $('input:radio[name=mode]:checked').attr('id').slice(5);
	graphCollection.graphs[graphCollection.selectedGraphIndex].histogram = $('#checkboxHistogram').is(':checked');
	graphCollection.graphs[graphCollection.selectedGraphIndex].boxPlot = $('#checkboxBoxPlot').is(':checked');
  constructVis();
  event.stopPropagation();
});

jQuery('#workSheetSelector').change(function(event) {
  graphCollection = new GraphCollection();
  graph.setXScale();
  updateScaleTextBoxes(graph);
  toggleNetworkOptions(graph);
  constructVis();
});

$('#textXMin').change(function(event) {
	var textBoxVal = parseFloat($('#textXMin').val());
	var curMax = graphCollection.graphs[graphCollection.selectedGraphIndex].x.domain()[1];
	if (isNaN(textBoxVal) || textBoxVal >= curMax){
		$('#textXMin').val(graphCollection.graphs[graphCollection.selectedGraphIndex].x.domain()[0]);
	} else {
		graphCollection.graphs[graphCollection.selectedGraphIndex].fitScaleToData = false;
		graphCollection.graphs[graphCollection.selectedGraphIndex].setXScale(textBoxVal, curMax);
		graphCollection.updateMenuOptions();
		constructVis();
	}
});

$('#textXMax').change(function(event) {
	var textBoxVal = parseFloat($('#textXMax').val());
	var curMin = graphCollection.graphs[graphCollection.selectedGraphIndex].x.domain()[0];
	if (isNaN(textBoxVal) || textBoxVal <= curMin){
		$('#textXMax').val(graphCollection.graphs[graphCollection.selectedGraphIndex].x.domain()[1]);
	} else {
		graphCollection.graphs[graphCollection.selectedGraphIndex].fitScaleToData = false;
		graphCollection.graphs[graphCollection.selectedGraphIndex].setXScale(curMin, textBoxVal);
		graphCollection.updateMenuOptions();
		constructVis();
	}
});

$('#fixedGroupSize').change(function(event) {
	var textBoxVal = parseFloat($('#fixedGroupSize').val());
	if (isNaN(textBoxVal) || textBoxVal <= 0){
		$('#fixedGroupSize').val(graphCollection.graphs[graphCollection.selectedGraphIndex].partitionGroupSize);
	} else {
		graphCollection.graphs[graphCollection.selectedGraphIndex].partitionGroupSize = textBoxVal;
		constructVis();
	}
});

$('#fixedIntervalWidth').change(function(event) {
	var textBoxVal = parseFloat($('#fixedIntervalWidth').val());
	if (isNaN(textBoxVal) || textBoxVal <= 0){
		$('#fixedIntervalWidth').val(graphCollection.graphs[graphCollection.selectedGraphIndex].partitionIntervalWidth);
	} else {
		graphCollection.graphs[graphCollection.selectedGraphIndex].partitionIntervalWidth = textBoxVal;
		constructVis();
	}
});

$('#refreshWorksheet').click(function(event){
	getWorksheet().fetchWorksheetData();
	if ($('#fitScaleToData').is(':checked')){
		jQuery('#fitScaleToData').attr('checked', false);
	}
});

$('#checkboxBWView').change(function() { return constructVis(); });

$('#fitScaleToData').change(function() {
	graphCollection.graphs[graphCollection.selectedGraphIndex].fitScaleToData = jQuery('#fitScaleToData').is(':checked');
	graphCollection.graphs[graphCollection.selectedGraphIndex].setXScale();
	graphCollection.updateMenuOptions();
	constructVis();
});

/* Sliders */
jQuery('#sliderTextSize').slider({ 
	orientation:'vertical', min:12, max:20, value:parseInt(graphCollection.tickTextSize), step:1,
	slide:function(event, ui) { 
		graphCollection.labelTextSize = (ui.value + 4).toString();
		graphCollection.tickTextSize = ui.value.toString();
		vis.render(); 
	}
});
	
//jQuery('#sliderDotSize').slider({ 
//	orientation:'vertical', min:1, max:10, value:graph.bucketDotSize, step:1,
//	slide:function(event, ui) {
//		graph.bucketDotSize = ui.value; 
//		vis.render(); 
//	}
//});

//jQuery('#sliderDivisions').slider({ 
//	orientation:'vertical', min:2, max:40, value:30, step:1,
//	slide:function(event, ui) { 
//		graph.buckets = ui.value;
//		graph.singleDistPoints = singleDistPoints(graph);
//		constructVis();
//	}
//});

$('#addGraph').click(function(event){
	graphCollection.addGraph();
	constructVis();
});

$('#groupingOptions').hide();

$('#displayOptions').hide();
$('#displayOptions').css('position', 'absolute')
										 .css('top', ($('#displayButton').position().top + 25) +"px")
										 .css('left',($('#displayButton').position().left) +"px");

$('#displayButton').click(function(){
	$('#displayOptions').slideToggle();
	$('#groupingOptions').slideUp();
});

$('#closeGroupingMenu').click(function(){
	$('#groupingOptions').slideUp();
});



document.addEventListener("touchstart", touchStart, false);

function touchStart(event){
	event.preventDefault(); 
  if (!dragging) return;
   
	var targetTouches = event.targetTouches;  
	var curX = event.targetTouches[0].pageX -
							$('span').offset().left -
							graphCollection.padLeft + 14;
							
	var curY = event.targetTouches[0].pageY - 
							$('span').offset().top - 
							graphCollection.padTop;
	draggedObj.left(curX);
	draggedObj.top(curY);
	draggedObj.visible(true);
	vis.render();
}

document.addEventListener("touchmove", touchMove, false);

function touchMove(event){
	event.preventDefault(); 
  if (!dragging) return;
  
	var targetTouches = event.targetTouches;  
	var curX = event.targetTouches[0].pageX -
							$('span').offset().left -
							graphCollection.padLeft + 14;
							
	var curY = event.targetTouches[0].pageY - 
							$('span').offset().top - 
							graphCollection.padTop;
	draggedObj.left(curX);
	draggedObj.top(curY);
	finalX = curX;
	finalY = curY;
	vis.render();
}

document.addEventListener("touchend", touchEnd, false);

function touchEnd(event){
	event.preventDefault(); 
  if (!dragging) return;
	console.log("finalX: " + finalX);
	console.log("finalY: " + finalY);
	//var targetTouches = event.targetTouches;
	//console.log(objectToString(targetTouches));  
  var curX = finalX  //event.targetTouches[0].pageX -
							//$('span').offset().left -
							//graphCollection.padLeft + 14;
							
	var curY = finalY  //event.targetTouches[0].pageY - 
							//$('span').offset().top - 
							//graphCollection.padTop;
	
	draggedObj.visible(false);
	if(curX > 0 && curX < graphCollection.w && curY > 0 && curY < graphCollection.h){
		console.log("inside panel");
		if (graphCollection.graphs.length > 4){
			var which = parseInt(curY/graphCollection.defaultGraphHeight);
			if (dragGraphIndex == -1)
				graphCollection.graphs[which].addCategory(dragCat);
			else {
				if (graphCollection.graphs[which].addCategory(dragCat))
					graphCollection.graphs[dragGraphIndex].removeCategory(dragCat);
			}
			graphCollection.updateMenuOptions();
		} else {
			console.log(which);
			var which = parseInt(curY/(graphCollection.h/graphCollection.graphs.length));
			if (dragGraphIndex == -1)
				graphCollection.graphs[which].addCategory(dragCat);
			else {
				if (graphCollection.graphs[which].addCategory(dragCat))
					graphCollection.graphs[dragGraphIndex].removeCategory(dragCat);		
			}
			graphCollection.updateMenuOptions();
		}
	} else if (dragGraphIndex != -1) {
		graphCollection.graphs[dragGraphIndex].removeCategory(dragCat);
	}
	
	draggedObj = undefined;
	dragging = false;
	dragCat = undefined;
	dragGraphIndex = undefined;
	finalX = undefined;
	finalY = undefined; 
	constructVis();
}

