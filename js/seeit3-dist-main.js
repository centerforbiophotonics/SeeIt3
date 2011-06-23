var graphCollection = {};
var vis = {};
var deleteUDPFlag = true;

$('#textXMin').hide();
$('#textXMax').hide();

function constructVis(){
	jQuery('span').remove();
	positionAxisMinMaxWidgets();
	//graph.graphOverflowFlag = false;
	
	vis = new pv.Panel()
		.width(graphCollection.w)
		.height(graphCollection.h)
		.bottom(graphCollection.padBot)
		.left(graphCollection.padLeft)
		.right(graphCollection.padRight)
		.top(graphCollection.padTop)
		//.events("all")
		//.event("mousedown", function() {
		//	if (jQuery('#radioUserDefGroups').attr('checked')){
		//		selectAUserDefPartition("both", graph, graph.udPartitionsBoth.push(this.mouse())-1);
		//	}
		//	vis.render();
		//});
	
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
			.event("dragend", function(){
				var mouseY = vis.mouse().y;
				var mouseX = vis.mouse().x;
				if(mouseX > 0 && mouseX < graphCollection.w && mouseY > 0 && mouseY < graphCollection.h){
					if (graphCollection.graphs.length > 4){
						var which = parseInt(mouseY/graphCollection.defaultGraphHeight);
						graphCollection.graphs[which].addCategory(this.category());
					} else {
						var which = parseInt(mouseY/(graphCollection.h/graphCollection.graphs.length));
						graphCollection.graphs[which].addCategory(this.category());
					}
				}
				dragFeedbackPanels[this.row()].visible(false);
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
				vis.render();
			})
			
		catPanel.add(pv.Dot)
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
			graphCollection.selectedGraphIndex = index;
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
	graphPanel.add(pv.Dot)
		.left(0)
		.top(10)
		.shape("cross")
		.lineWidth(2)
		.strokeStyle("black")
		.event("click", function(){
			graphCollection.removeGraph(graph);
			constructVis();
		})
		.event("mouseover", function(d){
			this.parent.children[this.childIndex+1].visible(true); //will break if more marks are added to graphPanel before this one
			graphPanel.render();
		})
		.event("mouseout", function(d){ 
			this.parent.children[this.childIndex+1].visible(false); //Ditto
			graphPanel.render();
		})
		.anchor("right").add(pv.Label)
				.visible(false)
				.text("Remove Graph")
				.textStyle(pv.rgb(125,125,125,0.05))
				.font(fontString)
				
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
				
		/* X-axis label */
		//graphPanel.add(pv.Label)
		//	.data([graph])
		//	.left(graph.w / 2)
		//	.bottom(0)
		//	.text(function(d){return d.worksheet.dataType1 + " and " + d.worksheet.dataType2 + " by " + d.worksheet.labelType})
		//	.textAlign("center")
		//	.textAngle(0)
		//	.font(function(){return "bold "+graph.labelTextSize+"px sans-serif"});
			
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
			
			//Copy of category panel which follows mouse as it is dragged
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
							graphCollection.graphs[which].addCategory(this.category());
							graph.removeCategory(this.category());
						} else {
							var which = parseInt(mouseY/(graphCollection.h/graphCollection.graphs.length));
							if (graphCollection.graphs[which].addCategory(this.category()))
								graph.removeCategory(this.category());
						}
					} else {
						graph.removeCategory(category);
					}
					dragFeedbackPanels[this.row()].visible(false);
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
					vis.render();
				})
				
				
			legendPanel.add(pv.Dot)
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
					
		});
		
			
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
})

/* populate dataset drop down menu */
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
  }
});


jQuery('#menu').change(function(event) {
  constructVis();
  event.stopPropagation();
})

jQuery('#editInGoogleDocs').click(function(event) {
  var URL = jQuery('#workSheetSelector').val();
  var matches = /feeds\/list\/([A-Z|a-z|0-9|_|-]+)/.exec(URL);
  window.open('https://spreadsheets.google.com/ccc?key=' + matches[1]);
  event.preventDefault();
});

jQuery('#menuOptions').change(function(event) {
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
	var curMax = graph.x.domain()[1];
	if (isNaN(textBoxVal) || textBoxVal >= curMax){
		updateScaleTextBoxes(graph);
	} else {
		jQuery('#fitScalesToData').attr('checked', false);
		graph.setXScale(textBoxVal, curMax);
		constructVis();
	}
});

$('#textXMax').change(function(event) {
	var textBoxVal = parseFloat($('#textXMax').val());
	var curMin = graph.x.domain()[0];
	if (isNaN(textBoxVal) || textBoxVal <= curMin){
		updateScaleTextBoxes(graph);
	} else {
		jQuery('#fitScalesToData').attr('checked', false);
		graph.setXScale(curMin, textBoxVal);
		constructVis();
	}
});

$('#fixedGroupSize').change(function(event) {
	var textBoxVal = parseFloat($('#fixedGroupSize').val());
	if (isNaN(textBoxVal) || textBoxVal <= 0){
		$('#fixedGroupSize').val(graph.partitionGroupSize);
	} else {
		graph.partitionGroupSize = textBoxVal;
		constructVis();
	}
});

$('#fixedIntervalWidth').change(function(event) {
	var textBoxVal = parseFloat($('#fixedIntervalWidth').val());
	if (isNaN(textBoxVal) || textBoxVal <= 0){
		$('#fixedIntervalWidth').val(graph.partitionIntervalWidth);
	} else {
		graph.partitionIntervalWidth = textBoxVal;
		constructVis();
	}
});

$('#refreshWorksheet').click(function(event){
	getWorksheet().fetchWorksheetData();
	if ($('#fitScalesToData').is(':checked')){
		jQuery('#fitScalesToData').attr('checked', false);
	}
});

$('#checkboxBWView').change(function() { return constructVis(); });

$('#fitScalesToData').change(function() {
	graph.setXScale();
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
$('#groupingOptions').css('position', 'absolute')
										 .css('top', ($('#groupingButton').position().top + 25) +"px")
										 .css('left',($('#groupingButton').position().left) +"px");

$('#groupingButton').click(function(){
	$('#groupingOptions').slideToggle();
	$('#displayOptions').slideUp();
});

$('#displayOptions').hide();
$('#displayOptions').css('position', 'absolute')
										 .css('top', ($('#displayButton').position().top + 25) +"px")
										 .css('left',($('#displayButton').offset().left) +"px");

$('#displayButton').click(function(){
	$('#displayOptions').slideToggle();
	$('#groupingOptions').slideUp();
});

