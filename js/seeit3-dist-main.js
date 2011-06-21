var graphCollection = {};
var vis = {};
var deleteUDPFlag = true;

$('#textYMin').hide();
$('#textYMax').hide();
$('#textXMin').hide();
$('#textXMax').hide();

//function constructVis() {
//	positionAxisMinMaxWidgets();
//	selectAUserDefPartition("none", graph, null);
//	if (jQuery('#checkboxSplitData').is(':checked')) {
//		constructSplitVis();
//	} else {
//		constructSingleVis();
//	}
//}


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
		.left(-145)
		.top(-10)
		.font(fontString);
		
	for (var key in graphCollection.worksheet.data){
		var abbrevKey = key.slice(0,15)+"..."
		
		vis.add(pv.Dot)
			.data([{"x":0,"y":0}])
			.def("category", key)
			.left(-135)
			.top(20*row)
			.shape("square")
			.size(40)
			.fillStyle(graphCollection.categoryColors[key])
			.lineWidth(1)
			.strokeStyle("black")
			.title(key)
			.event("mouseover", function(d){
				this.lineWidth(3);
				this.render();
			})
			.event("mouseout", function(d){ 
				this.lineWidth(1);
				this.render();
			})
			.event("mousedown", pv.Behavior.drag())
			.event("dragend", function(){
				var mouseY = vis.mouse().y;
				if (graphCollection.graphs.length > 4){
					var which = parseInt(mouseY/graphCollection.defaultGraphHeight);
					graphCollection.graphs[which].addCategory(this.category());
				} else {
					var which = parseInt(mouseY/(graphCollection.h/graphCollection.graphs.length));
					console.log(which);
					graphCollection.graphs[which].addCategory(this.category());
				}
				constructVis();
			})
			.anchor("right").add(pv.Label)
				.text(abbrevKey)
				.font(fontString)
				.event("mouseover", function(d){
					console.log(this);
					this.lineWidth(3);
					this.render();
				})
				.event("mouseout", function(d){ 
					this.lineWidth(1);
					this.render();
				})
				
		//vis.add(pv.Panel)
		//	.left(-145)
		//	.top(31*row)
		//	.width(130)
		//	.height(30)
		//	.overflow("hidden")
		//	.cursor("move")
		//	.fillStyle(graphCollection.categoryColors[key])
		//	.lineWidth(1)
		//	.strokeStyle("black")
		//	.title(key)
		//	.event("mouseover", function(d){
		//		this.lineWidth(6);
		//		this.render();
		//	})
		//	.event("mouseout", function(d){ 
		//		this.lineWidth(1);
		//		this.render();
		//	})
		//	.add(pv.Label)
		//		.text(abbrevKey)
		//		.left(2)
		//		.top(7)
		//		.textBaseline("top")
		//		.font(fontString)
		//		.event("mousedown", pv.Behavior.drag())
		//		.event("dragend", function(){
		//			var mouseY = vis.mouse().y;
		//			if (graphCollection.graphs.length > 4){
		//				var which = parseInt(mouseY/graphCollection.defaultGraphHeight);
		//				graphCollection.graphs[which].addCategory(key);
		//			} else {
		//				var which = parseInt(mouseY/(graphCollection.h/graphCollection.graphs.length));
		//				graphCollection.graphs[which].addCategory(key);
		//			}
		//		})
				
		row++;
	}
	
}

//
var testFlag = false;

function constructGraphPanel(vis, graph, index, numberOfGraphs){
	var fontString = "bold 12px sans-serif";
	
	var graphPanel = vis.add(pv.Panel)
		.top(function(){return graph.h*index})
		.height(graph.h)
		.width(graph.w)
		//.lineWidth(1)
		//.strokeStyle("black")
		.fillStyle(function(){
			return "white"
			if(testFlag) {
				testFlag = false;
				return "red"
			} else {
				testFlag = true;
				return "blue";
			}
		});
		
	graph.panel = graphPanel;
	
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
	
	graph.includedCategories.forEach(function(category, index){
		var abbrevKey = category.slice(0,15)+"..."
		//graphPanel.add(pv.Panel)
		//	.left(0)
		//	.top(31*index + 20)
		//	.width(130)
		//	.height(30)
		//	.overflow("hidden")
		//	.cursor("move")
		//	.fillStyle(graphCollection.categoryColors[category])
		//	.lineWidth(1)
		//	.strokeStyle("black")
		//	.title(category)
		//	.event("mouseover", function(d){
		//		this.lineWidth(6);
		//		this.render();
		//	})
		//	.event("mouseout", function(d){ 
		//		this.lineWidth(1);
		//		this.render();
		//	})
		//	.add(pv.Label)
		//		.text(abbrevKey)
		//		.left(2)
		//		.top(7)
		//		.textBaseline("top")
		//		.font(fontString);
		
		graphPanel.add(pv.Dot)
			.right(120)
			.top(20*index+45)
			.shape("square")
			.size(40)
			.fillStyle(graphCollection.categoryColors[category])
			.lineWidth(1)
			.strokeStyle("black")
			.title(category)
			.event("mouseover", function(d){
				this.lineWidth(3);
				this.render();
			})
			.event("mouseout", function(d){ 
				this.lineWidth(1);
				this.render();
			})
			.event("mousedown", pv.Behavior.drag())
			.event("dragend", function(){
				var mouseY = vis.mouse().y;
				if (graphCollection.graphs.length > 4){
					var which = parseInt(mouseY/graphCollection.defaultGraphHeight);
					graphCollection.graphs[which].addCategory(category);
				} else {
					var which = parseInt(mouseY/(graphCollection.h/graphCollection.graphs.length));
					graphCollection.graphs[which].addCategory(category);
				}
			})
			.anchor("right").add(pv.Label)
				.text(abbrevKey)
				.font(fontString)
				.event("mouseover", function(d){
					console.log(this);
					this.lineWidth(3);
					this.render();
				})
				.event("mouseout", function(d){ 
					this.lineWidth(1);
					this.render();
				})
		
		
		
	});
	
		
	/* Dots */
	graphPanel.add(pv.Dot)
		.data(function() {return graph.getDataDrawObjects()})
		.visible(function() { return $('#checkboxHideData').attr('checked') == false })
		.left(function(d) { return d.x })
		.bottom(function(d) {
			//if (d.y > graph.h + padTop)
		//		graph.graphOverflowFlag = true;
			return d.y + graph.baseLine; 
		})
		.radius(function() {return graph.bucketDotSize})
		.fillStyle(function(d) {return graphCollection.categoryColors[d.set]})//dataPointFillStyle(d)})
		.strokeStyle(function(d) {return "black"})//dataPointStrokeStyle(d)})
		.title(function(d) { return d.label+", "+graph.x.invert(d.x).toFixed(1) });

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