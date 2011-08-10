//Entry Point
var exampleSpreadsheets = [
	new Spreadsheet('0AuGPdilGXQlBdEd4SU44cVI5TXJxLXd3a0JqS3lHTUE'),
	new Spreadsheet('0AuGPdilGXQlBdE1idkxMSFNjbnFJWjRKTnA2Zlc4NXc'),
];

/* populate dataset drop down menu */
var numWorksheetsLoaded = 0;
jQuery('body').bind('WorksheetLoaded', function(event) {
  jQuery('#workSheetSelector').append(jQuery("<option value='" + event.worksheet.URL + "'>" + event.worksheet.title + "</option>")).val(event.worksheet.URL);
  numWorksheetsLoaded++;
  if (numWorksheetsLoaded >= numWorksheets){
	jQuery('p#loadingMsg').hide();	
	graphCollection = new GraphCollection();
	constructVis();
	positionDisplayMenu();
  }
});

var vis = {};
var graphCollection = {};
var fontString = "bold 14px arial";

function constructVis() {
	jQuery('span').remove();
	
	vis = new pv.Panel()
		.width(function(){return graphCollection.w})
		.height(function(){return graphCollection.h})
		.bottom(function(){return graphCollection.padBot})
		.left(function(){return graphCollection.padLeft})
		.right(function(){return graphCollection.padRight})
		.top(function(){return graphCollection.padTop})
	
	/* Divider Between Graphs and Data Sets */
	vis.add(pv.Rule)
		.left(-35)
		.bottom(graphCollection.padBot * -1)
		.top(graphCollection.padTop * -1)
		
	/* Divider Between Graphs and Buttons */
	vis.add(pv.Rule)
		.left(-35)
		.right(graphCollection.padRight * -1)
		.top(-30)
		
	/* Display Options Menu Button */
	var dispOptPanel = vis.add(pv.Panel)
		.events("all")
		.cursor("pointer")
		.title("Show display option menu")
		.height(30)
		.width(function() {
			if (graphCollection.buttonIcon && graphCollection.buttonText){ 
				return 150;
			}else if (!graphCollection.buttonIcon){
				return 120;
			}else if (!graphCollection.buttonText){
				return 34;
			}
		})
		.left(-34)
		.top(-60)
		.lineWidth(1)
		.event("click", function(){
			hideMenus();
			$('#displayOptions').slideDown();
		})
		.event("mouseover", function(d){
			this.strokeStyle("black");
			this.render();
		})
		.event("mouseout", function(d){ 
			this.strokeStyle(pv.rgb(0,0,0,0));
			this.render();
		})
	
	dispOptPanel.add(pv.Image)
		.url("http://centerforbiophotonics.github.com/SeeIt3/img/eye.png")  //fix this
		.width(30)
		.height(30)
		.top(0)
		.left(2)
		.cursor("pointer")
		.title("Show display option menu")
		.visible(function() {
			if (graphCollection.buttonIcon)
				return true;
			else
				return false;
		})
		.event("click", function(){
			hideMenus();
			$('#displayOptions').slideDown();
		})
		.anchor("left").add(pv.Label)
			.left(function(){
				if (graphCollection.buttonText && !graphCollection.buttonIcon)
					return 2;
				else
				 return 32;
			})
			.text("Display Options")
			.font(fontString)
			.visible(function() {
				if (graphCollection.buttonText)
					return true;
				else
					return false;
			})
	
	/* Toggle Edit Mode Button */
	var togEditPanel = vis.add(pv.Panel)
		.events("all")
		.cursor("pointer")
		.title("Toggle edit mode")
		.height(30)
		.width(function() {
			if (graphCollection.buttonIcon && graphCollection.buttonText){ 
				return 110;
			}else if (!graphCollection.buttonIcon){
				return 80;
			}else if (!graphCollection.buttonText){
				return 34;
			}
		})
		.left(function() {
			if (graphCollection.buttonIcon && graphCollection.buttonText){ 
				return 120;
			}else if (!graphCollection.buttonIcon){
				return 90;
			}else if (!graphCollection.buttonText){
				return 4;
			}
		})
		.top(-60)
		.lineWidth(1)
		.event("click", function(){
			graphCollection.editModeEnabled = !(graphCollection.editModeEnabled);
			vis.render();
		})
		.event("mouseover", function(d){
			this.strokeStyle("black");
			this.render();
		})
		.event("mouseout", function(d){ 
			this.strokeStyle(pv.rgb(0,0,0,0));
			this.render();
		})
		
	togEditPanel.add(pv.Image)
		.url(function(){
			if (graphCollection.editModeEnabled)
				return "http://centerforbiophotonics.github.com/SeeIt3/img/handON.png"
			else
				return "http://centerforbiophotonics.github.com/SeeIt3/img/hand.png"
		})
		.width(30)
		.height(26)
		.top(2)
		.left(0)
		.cursor("pointer")
		.title("Toggle edit mode")
		.event("click", function(){
			graphCollection.editModeEnabled = !(graphCollection.editModeEnabled);
			vis.render();
		})
		.visible(function() {
			if (graphCollection.buttonIcon)
				return true;
			else
				return false;
		})
		.anchor("left").add(pv.Label)
			.left(function(){
				if (graphCollection.buttonText && !graphCollection.buttonIcon)
					return 2;
				else
				 return 32;
			})
			.text("Edit Mode")
			.font(fontString)
			.textStyle(function(){
				if (graphCollection.editModeEnabled)
					return "red"
				else
					return "black"
			})
			.visible(function() {
				if (graphCollection.buttonText)
					return true;
				else
					return false;
			})
		
	/* Add New Graph Button */
	var newGrphPanel = vis.add(pv.Panel)
		.events("all")
		.cursor("pointer")
		.title("Switch between One or Two Graph View")
		.height(30)
		.width(function() {
			if (graphCollection.buttonIcon && graphCollection.buttonText){ 
				return graphCollection.numGraphs == 1 ? 120 : 110;
			}else if (!graphCollection.buttonIcon){
				return graphCollection.numGraphs == 1 ? 90 : 80;
			}else if (!graphCollection.buttonText){
				return graphCollection.numGraphs == 1 ? 39 : 30;
			}
		})
		.left(function() {
			if (graphCollection.buttonIcon && graphCollection.buttonText){ 
				return 235;
			}else if (!graphCollection.buttonIcon){
				return 175;
			}else if (!graphCollection.buttonText){
				return 43;
			}
		})
		.top(-60)
		.lineWidth(1)
		.event("click", function(){
			if (graphCollection.graphs.length == 1)
				graphCollection.addGraph();
			else
				graphCollection.removeGraph(graphCollection.graphs[1]);
			
			constructVis();
		})
		.event("mouseover", function(d){
			this.strokeStyle("black");
			this.render();
		})
		.event("mouseout", function(d){ 
			this.strokeStyle(pv.rgb(0,0,0,0));
			this.render();
		})
		
	newGrphPanel.add(pv.Image)
		.url(function(){
			if (graphCollection.numGraphs == 1)
				return "http://centerforbiophotonics.github.com/SeeIt3/img/newGraph.png";
			else 
				return "http://centerforbiophotonics.github.com/SeeIt3/img/remGraph.png";
		})  //fix this
		.width(30)
		.height(30)
		.top(0)
		.left(2)
		.cursor("pointer")
		.title("Add a new empty graph")
		.event("click", function(){
			graphCollection.addGraph();
			constructVis();
		})
		.visible(function() {
			if (graphCollection.buttonIcon)
				return true;
			else
				return false;
		})
		.anchor("left").add(pv.Label)
			.left(function(){
				if (graphCollection.buttonText && !graphCollection.buttonIcon)
					return 2;
				else
				 return 32;
			})
			.text(function(){
				if(graphCollection.graphs.length == 1) return "Two Graphs";
				else return "One Graph";
			})
			.font(fontString)
			.visible(function() {
				if (graphCollection.buttonText)
					return true;
				else
					return false;
			})
		
	
	
	constructSidePanel();
	
	graphCollection.graphs.forEach(function(graph, index){
		constructGraphPanel(graph, index);
	});
	
	vis.render();
}

function constructSidePanel(){
	var row = 0;
	
	vis.add(pv.Label)
		.text("Data Sets:")
		.left(-197)
		.top(-40)
		.font(fontString);
	
	var dragFeedbackPanels = [];
	for (var key in graphCollection.worksheet.data){
		var abbrevKey = key.slice(0,18);
		if (key.length > 18)
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
		
		dragFeedbackPanels[row].add(pv.Label)
			.left(0)
			.top(23)
			.text(abbrevKey)
			.font(fontString)
			.def("category", key)
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
		.top(40*row - 35)
		.cursor("pointer")
		.title("Edit dataset")
		.event("click", function(){
			hideMenus();
			resetEditDataSetMenu();
			populateEditMenuFromExisting(this.category());
			$('#dataSetEdit').slideDown();
			$('#dataSetEdit').scrollTop(0)
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
			.top(40*row - 35)
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
				var category = this.category();
				
				graphCollection.graphs.forEach(function(g){
					if (g.xAxisPanel.mouse().x > 0 &&
							g.xAxisPanel.mouse().x < g.xAxisPanel.width() &&
							g.xAxisPanel.mouse().y > 0 &&
							g.xAxisPanel.mouse().y < g.xAxisPanel.height())
					{
						g.assignX(category);
						constructVis();
					}
					
					if (g.yAxisPanel.mouse().x > 0 &&
							g.yAxisPanel.mouse().x < g.yAxisPanel.width() &&
							g.yAxisPanel.mouse().y > 0 &&
							g.yAxisPanel.mouse().y < g.yAxisPanel.height())
					{
						g.assignY(category);
						constructVis();
					}
				});
				
				dragFeedbackPanels[this.row()].visible(false);
				document.body.style.cursor="default";
				constructVis();
				//vis.render();
			})
			.event("touchstart", function(event){
				touch.draggedObj = dragFeedbackPanels[this.row()];
				touch.dragging = true;
				touch.dragCat = this.category();
				touch.dragGraphIndex = -1;
			})
			
			
			
		catPanel.add(pv.Label)
			.left(0)
			.top(23)
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
			.def("row", row)
			.title("Add a Dataset")
			.lineWidth(1)
			.height(30)
			.width(160)
			.left(-198)
			.top(40*row - 35)
			.event("click", function(){
				resetAddDataSetMenu();
				populateAddMenuLabelsFromExisting();
				hideMenus();
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

function constructGraphPanel(graph,index){
	var graphPanel = vis.add(pv.Panel)
		.width(function(){return graph.w})
		.height(function(){return graph.h})
		.top(20)
		.left(function(){return 60 + index * graph.w + index * 110})
		.events("all");
	
	/*Graph Title*/		  
	graphPanel.add(pv.Label)
		.left(function(){return graph.w / 2})
		.top(-20)
		.textAlign("center")
		.textAngle(0)
		.text(graph.worksheet.title)//+ " (Dropped onto Y-axis)")
		.font("bold 20px sans-serif");
	
	//Remove Graph Button
	graphPanel.add(pv.Panel)
		.right(0)
		.top(-40)
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
	
	//X-axis drag feedback
	var xAxisDragFeedbackPanel = vis.add(pv.Panel)
		.height(function(){
			if (graph.xData == null)
				return 30;
			else
				return getPixelHeightOfText("bold "+graphCollection.labelTextSize+"px sans-serif", graph.xData);
		})
		.width(function(){
			if (graph.xData == null)
				return graph.w;
			else
				return getPixelWidthOfText("bold "+graphCollection.labelTextSize+"px sans-serif", graph.xData) + 20;
		})
		.left(function(){return graph.w/2 - this.width()/2})
		.bottom(-70)
		.lineWidth(1)
		.strokeStyle("black")
		.visible(false)
		
	xAxisDragFeedbackPanel.add(pv.Label)
		.text(function(){
			if (graph.xData == null)
				return "Drag here to assign a dataset to the x-axis."
			else
				return graph.xData;
		})
		.left(function(){return graph.xAxisPanel.width()/2})
		.top(function(){return graph.xAxisPanel.height()/2})
		.textAlign("center")
		.textBaseline("middle")
		.font(function(){return "bold "+graphCollection.labelTextSize+"px sans-serif"})
		
		
	//X-axis drag drop zone
	graph.xAxisPanel = graphPanel.add(pv.Panel)
		.data([{"x":0,"y":0}])
		.height(function(){
			if (graph.xData == null)
				return 30;
			else
				return getPixelHeightOfText("bold "+graphCollection.labelTextSize+"px sans-serif", graph.xData);
		})
		.width(function(){
			if (graph.xData == null)
				return graph.w;
			else
				return getPixelWidthOfText("bold "+graphCollection.labelTextSize+"px sans-serif", graph.xData) + 20;
		})
		.left(function(){return graph.w/2 - this.width()/2})
		.bottom(-70)
		.lineWidth(1)
		.cursor("move")
		.events("all")
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
			xAxisDragFeedbackPanel.left(mouseX);
			xAxisDragFeedbackPanel.top(mouseY);
			xAxisDragFeedbackPanel.visible(true);
			document.body.style.cursor="move";
			xAxisDragFeedbackPanel.render();
		})
		.event("drag", function(event){
			var mouseY = vis.mouse().y;
			var mouseX = vis.mouse().x;
			xAxisDragFeedbackPanel.left(mouseX);
			xAxisDragFeedbackPanel.top(mouseY);
			xAxisDragFeedbackPanel.render();
		})
		.event("dragend", function(){
			var mouseY = vis.mouse().y;
			var mouseX = vis.mouse().x;
			var category = graph.xData;
			var thisGraphIndex = index;
			
			if(mouseX > -35 && mouseX < graphCollection.w && mouseY > 0 && mouseY < graphCollection.h + 70){
				graphCollection.graphs.forEach(function(g,i){
					if (g.xAxisPanel.mouse().x > 0 &&
							g.xAxisPanel.mouse().x < g.xAxisPanel.width() &&
							g.xAxisPanel.mouse().y > 0 &&
							g.xAxisPanel.mouse().y < g.xAxisPanel.height())
					{
						if (i != thisGraphIndex){
							g.assignX(category);
							graph.assignX(null);
						}
					}
					
					if (g.yAxisPanel.mouse().x > 0 &&
							g.yAxisPanel.mouse().x < g.yAxisPanel.width() &&
							g.yAxisPanel.mouse().y > 0 &&
							g.yAxisPanel.mouse().y < g.yAxisPanel.height())
					{
						if (i == thisGraphIndex){
							g.assignX(g.yData);
							g.assignY(category);
						} else {
							g.assignY(category);
							graph.assignX(null);
						}
					}
				});
			} else {
				graph.assignX(null);
			}
			
			xAxisDragFeedbackPanel.visible(false);
			document.body.style.cursor="default";
			constructVis();
			//vis.render();
		})
		
	graph.xAxisPanel.add(pv.Label)
		.text(function(){
			if (graph.xData == null)
				return "Drag here to assign a dataset to the x-axis."
			else
				return graph.xData;
		})
		.left(function(){return graph.xAxisPanel.width()/2})
		.top(function(){return graph.xAxisPanel.height()/2})
		.textAlign("center")
		.textBaseline("middle")
		.font(function(){return "bold "+graphCollection.labelTextSize+"px sans-serif"})
		
	//Y-axis drag feedback panel
	var yAxisDragFeedbackPanel = vis.add(pv.Panel)
		.width(function(){
			if (graph.yData == null)
				return 30;
			else
				return getPixelHeightOfText("bold "+graphCollection.labelTextSize+"px sans-serif", graph.yData);
		})
		.height(function(){
			if (graph.yData == null)
				return graph.h;
			else
				return getPixelWidthOfText("bold "+graphCollection.labelTextSize+"px sans-serif", graph.yData) + 20;
		})
		.left(-85)
		//.visible(function(){return graph.twoDistView == false})
		.bottom(function(){return graph.h/2 - this.height()/2})
		.lineWidth(1)
		.strokeStyle("black")
		.visible(false)
		
		
	yAxisDragFeedbackPanel.add(pv.Label)
		.text(function(){
			if (graph.yData == null)
				return "Drag here to assign a dataset to the y-axis."
			else
				return graph.yData;
		})
		.left(function(){return graph.yAxisPanel.width()/2})
		.top(function(){return graph.yAxisPanel.height()/2})
		.textAngle(-Math.PI/2)
		.textAlign("center")
		.textBaseline("middle")
		.font(function(){return "bold "+graphCollection.labelTextSize+"px sans-serif"})
		
	//Y-axis drag drop zone
	graph.yAxisPanel = graphPanel.add(pv.Panel)
		.data([{"x":0,"y":0}])
		.width(function(){
			if (graph.yData == null)
				return 30;
			else
				return getPixelHeightOfText("bold "+graphCollection.labelTextSize+"px sans-serif", graph.yData);
		})
		.height(function(){
			if (graph.yData == null)
				return graph.h;
			else
				return getPixelWidthOfText("bold "+graphCollection.labelTextSize+"px sans-serif", graph.yData) + 20;
		})
		.left(-85)
		.visible(function(){return graph.twoDistView == false || graph.xData == null || graph.yData == null})
		.bottom(function(){return graph.h/2 - this.height()/2})
		.lineWidth(1)
		.cursor("move")
		.events("all")
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
			yAxisDragFeedbackPanel.left(mouseX);
			yAxisDragFeedbackPanel.top(mouseY);
			yAxisDragFeedbackPanel.visible(true);
			document.body.style.cursor="move";
			yAxisDragFeedbackPanel.render();
		})
		.event("drag", function(event){
			var mouseY = vis.mouse().y;
			var mouseX = vis.mouse().x;
			yAxisDragFeedbackPanel.left(mouseX);
			yAxisDragFeedbackPanel.top(mouseY);
			yAxisDragFeedbackPanel.render();
		})
		.event("dragend", function(){
			var mouseY = vis.mouse().y;
			var mouseX = vis.mouse().x;
			var category = graph.yData;
			var thisGraphIndex = index;
			if(mouseX > -35 && mouseX < graphCollection.w && mouseY > 0 && mouseY < graphCollection.h + 70){
				graphCollection.graphs.forEach(function(g,i){
					if (g.xAxisPanel.mouse().x > 0 &&
							g.xAxisPanel.mouse().x < g.xAxisPanel.width() &&
							g.xAxisPanel.mouse().y > 0 &&
							g.xAxisPanel.mouse().y < g.xAxisPanel.height())
					{
						if (i == thisGraphIndex){
							g.assignY(g.xData);
							g.assignX(category);
						} else {
							g.assignX(category);
							graph.assignY(null);
						}
					}
					
					if (g.yAxisPanel.mouse().x > 0 &&
							g.yAxisPanel.mouse().x < g.yAxisPanel.width() &&
							g.yAxisPanel.mouse().y > 0 &&
							g.yAxisPanel.mouse().y < g.yAxisPanel.height())
					{
						if (i != thisGraphIndex){
							g.assignY(category);
							graph.assignY(null);
						}
					}
				});
			} else {
				graph.assignY(null);
			}
			
			yAxisDragFeedbackPanel.visible(false);
			document.body.style.cursor="default";
			constructVis();
			//vis.render();
		})
		
		
	graph.yAxisPanel.add(pv.Label)
		.text(function(){
			if (graph.yData == null)
				return "Drag here to assign a dataset to the y-axis."
			else
				return graph.yData;
		})
		.left(function(){return graph.yAxisPanel.width()/2})
		.top(function(){return graph.yAxisPanel.height()/2})
		.textAngle(-Math.PI/2)
		.textAlign("center")
		.textBaseline("middle")
		.font(function(){return "bold "+graphCollection.labelTextSize+"px sans-serif"})
		
	
	//Divider between graphs
	graphPanel.add(pv.Rule)
		.left(-95)
		.top(-50)
		.bottom(-80)
		.visible(function(){ return index == 1 })
			
	//Show Graph Option Menu Button
	graphPanel.add(pv.Image)
		.url("http://centerforbiophotonics.github.com/SeeIt3/img/wrench.png")  //fix this
		.width(30)
		.height(30)
		.top(-45)
		.left(-80)
		.cursor("pointer")
		.title("Show graph option menu")
		.event("click", function(){
			graphCollection.selectedGraphIndex = index;
			graphCollection.updateMenuOptions();
			positionGraphMenuOverGraph(index, graphCollection);
			hideMenus();
			$('#graphOptions').slideDown();
		})
		
	//Copy to clipboard button
	graphPanel.add(pv.Image)
		.url("http://centerforbiophotonics.github.com/SeeIt3/img/clipboard.png")  //fix this
		.width(30)
		.height(30)
		.top(-45)
		.left(-20)
		.cursor("pointer")
		.title("Copy data to clipboard.")
		.event("click", function(){
			$('#cbText').val(graph.toString());
			positionClipboardPrompt();
			hideMenus();
			$('#clipboardPrompt').slideDown();
			$('#cbText').focus();
			$('#cbText').select();
			$('#clipboardPrompt').scrollTop(0);
		
		})
		
	
	
	if (graph.yData != null && graph.xData != null){
		if (graph.twoDistView)
			constructTwoDistGraph(graph,index, graphPanel);
		else
			constructCorrGraph(graph, index, graphPanel);
	} else if (graph.yData != null) {
		constructYDistGraph(graph, index, graphPanel);
	} else if (graph.xData != null) {
		constructXDistGraph(graph, index, graphPanel);
	} else {
		constructEmptyGraph(graph, index, graphPanel);
	}
}

function constructEmptyGraph(graph,index, graphPanel){
	//Empty Graph Message
	graphPanel.add(pv.Label)
		.left(function(){return graph.w/2})
		.top(function(){return graph.h/2})
		.textAlign("center")
		.textBaseline("center")
		.text("Empty Graph")
		.font(fontString)
		
}

function constructCorrGraph(graph, index, graphPanel){		
	 /* Y-axis ticks */
  graphPanel.add(pv.Rule)
		.data(function() { return graph.y.ticks(graphCollection.buckets) })
		.bottom(graph.y)
		.strokeStyle("#ddd")
		.anchor('left').add(pv.Label)
			.text(graph.y.tickFormat)
			.font(function(){return "bold "+graphCollection.tickTextSize+"px sans-serif"})
	
	/* X-axis ticks */
  graphPanel.add(pv.Rule)
		.data(function() { return graph.x.ticks(graphCollection.buckets) })
		.left(graph.x)
		.strokeStyle("#ddd")
		.anchor("bottom").add(pv.Label)
			.text(graph.x.tickFormat)
			.font(function(){return "bold "+graphCollection.tickTextSize+"px sans-serif"})
	
	/* Number of datapoints N */
  graphPanel.add(pv.Label)
		.right(function(){return graph.w/2})
		.top(-5)
		.textAlign("center")
		.textAngle(0)
		.text(function(){return "N = " + graph.data.length})
		.font("bold 14px sans-serif");
			
	//Y-axis Line
	graphPanel.add(pv.Rule)
		.left(1)
		.top(0)
		.bottom(0)
		.strokeStyle("#000")
			
	//X-axis Line
	graphPanel.add(pv.Rule)
		.left(1)
		.right(0)
		.bottom(1)
		.strokeStyle("#000")
			
	/* dot plot */
	graphPanel.add(pv.Dot)
		.data(graph.data)
		.visible(function() { return jQuery('#checkboxShowData').is(':checked') })
		.event("point", function() { return this.active(this.index).parent })
		.event("unpoint", function() { return this.active(-1).parent })
		.left(function(d) { return graph.x(d.x) })
		.bottom(function(d) { return graph.y(d.y) })
		.radius(function() { return graphCollection.dotSize })
		.fillStyle(function(d) {return pointFillStyle(d.label)})
		.strokeStyle(function(d) {return pointStrokeStyle(d.label)})
		.title(function(d) { return d.label + ": " + d.x + ", " + d.y })
		.def('active', -1)
		.event("point", function() { return this.active(this.index).parent })
		.event("unpoint", function() { return this.active(-1).parent });
		
	/* median median crosses and squares */
	for (var i = 0; i < graph.groups.length; i++) {
		var bounds = getBounds(graph.groups[i]);
		var coords = getBoundingCoords(bounds);
		var n = graph.groups[i].length;

		/* rectangle around median group */
		graphPanel.add(pv.Line)
			.visible(function() { return graph.mmDivs})
			.data(coords)
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return graph.y(d[1]) })
			.lineWidth(0.5)
			.strokeStyle("blue")
			.fillStyle(pv.rgb(0,0,255,0.05))
			.add(pv.Label)								
				.text(function(d) {
					if (this.index == 0) { return "N = "+ n;}
					else {return ""}
				})
				.textAlign("left")
				.textBaseline("top")
				.textStyle("blue")
				.textAngle(0)
				.font("bold 12px sans-serif");

		/* median cross */
		graphPanel.add(pv.Dot)
			.visible(function() { return graph.mmDots})
			.data([graph.medians[i]]) 
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return graph.y(d[1]) })
			.radius(10)
			.angle(Math.PI / 4)
			.shape('cross')
			.strokeStyle(pv.rgb(0,0,255,0.90));
	}


  /* median-median line:
	   Is middle median dot higher or lower than line through outer median dots? 
	   That is, middle median dot's y value - y value at same x of original median line 
	   divided by three */
	graphPanel.add(pv.Line)
		.visible(function() {return graph.mmLine })
		.data([[graph.xMin, graph.mmFarLeftYVal], [graph.xMax, graph.mmFarRightYVal]])
		.left(function(d) { return graph.x(d[0]) })
		.bottom(function(d) { return graph.y(d[1]) })
		.title("Median-median line")
		.strokeStyle("blue")
		.lineWidth(2)
		.add(pv.Label)
			.visible(function () { return graph.mmEQ && graph.mmLine; })
			.text(function(d) {
				if (this.index == 0) { return "Y = "+graph.mmSlope.toFixed(3)+"X + "+graph.mmIntercept.toFixed(3);}
				else{return "";}
			})
			.textAlign("left")
			.textBaseline("top")
			.textStyle("blue")
			.textAngle(getMMLineLabelAngle(graph))
			.font("bold 12px sans-serif");
			
	/* Least Squares Regression Line */  
	graphPanel.add(pv.Line)
		.visible(function() { return graph.lsLine })
		.data([[graph.xMin, graph.lsFarLeftYVal], [graph.xMax, graph.lsFarRightYVal]])
		.left(function(d) { return graph.x(d[0]) })
		.bottom(function(d) { return graph.y(d[1]) })
		.title("Least-Squares Regression Line")
		.strokeStyle(pv.rgb(0,225,0,1))
		.lineWidth(2)
		.add(pv.Label)									//Line Equation
			.visible(function () { return graph.lsEQ && graph.lsLine })
			.text(function(d) {
				if (this.index == 0) { return "Y = "+graph.lsSlope.toFixed(3)+"X + "+graph.lsIntercept.toFixed(3);}
				else {return ""}
			})
			.textAlign("left")
			.textBaseline("top")
			.textStyle(pv.rgb(0,225,0,1))
			.textAngle(getLSLineLabelAngle(graph))
			.font("bold 12px sans-serif")
		.add(pv.Label)									//R Value
			.visible(function () { return graph.lsR && graph.lsLine })
			.text(function(d) {
				if (this.index == 0) { return "R = "+ getR(graph.data).toFixed(2);}
				else {return ""}
			})
			.textAlign("left")
			.textBaseline("bottom")
			.textStyle(pv.rgb(0,225,0,1))
			.textAngle(getLSLineLabelAngle(graph))
			.font("bold 12px sans-serif");
		
  /*R Squares*/
	for (var i=0; i < graph.data.length; i++){
		var sqrBounds = getRSquareBounds(graph, i);   
		graphPanel.add(pv.Line)
			.visible(function() { return graph.lsSquares && graph.lsLine })
			.data(sqrBounds)
			.left(function(d) { return d[0] })
			.bottom(function(d) { return d[1] })
			.lineWidth(0.5)
			.strokeStyle("green")
			.fillStyle(pv.rgb(0,225,0,0.05));
  }
	
	/* user drawn line */
	graphPanel.add(pv.Line)
		.data(graph.userDrawnLinePoints)
		.left(function(d) { return graph.x(d.x) })
		.bottom(function(d) { return graph.y(d.y) })
		.visible(function() { return graph.udLine })
		.fillStyle("red")
		.strokeStyle("red")
		.lineWidth(2)
		.add(pv.Label)									//Line Equation
			.visible(function () { return graph.udLine })
			.text(function(d) {
				if (this.index == 0) { return "Y = "+getUserLineSlope(graph).toFixed(3)+"X + "+getUserLineIntercept(graph).toFixed(3);}
				else {return ""}
			})
			.textAlign("left")
			.textBaseline("top")
			.textStyle("red")
			.textAngle(function() { return getUserLineLabelAngle(graph)})
			.font("bold 12px sans-serif")
		.add(pv.Label)									//R Squared Value
			.visible(function () { return graph.udLine })
			.text(function(d) {
				if (this.index == 0) { return "Sum of Squares = "+ getUserLineR(graph).toFixed(2);}
				else {return ""}
			})
			.textAlign("left")
			.textBaseline("bottom")
			.textStyle("red")
			.textAngle(function() {return getUserLineLabelAngle(graph)})
			.font("bold 12px sans-serif")
		.add(pv.Dot)									//Endpoints
			.fillStyle("red")
			.shape('square')
			.cursor('move')
			.event("mousedown", pv.Behavior.drag())
			.event("drag", function() {
				var mouseX = graph.x.invert(graphPanel.mouse().x),
					mouseY = graph.y.invert(graph.h - graphPanel.mouse().y);
				
				graph.userDrawnLinePoints[this.index].x = mouseX;
				graph.userDrawnLinePoints[this.index].y = mouseY;
				
				graphPanel.render();
			})		
		.add(pv.Dot)									//Midpoint
			.data(function() {return getUserLineMidpoint(graph)})
			.left(function(d) { return graph.x(d.x) })
			.bottom(function(d) { return graph.y(d.y) })
			.fillStyle(pv.rgb(255,0,0,0.1))
			.strokeStyle(pv.rgb(255,0,0,0.5))
			.shape('diamond')
			.cursor('move')
			.event("mousedown", pv.Behavior.drag())
			.event("drag", function() {
				var mouseX = graph.x.invert(graphPanel.mouse().x),
					mouseY = graph.y.invert(graph.h - graphPanel.mouse().y),
					handle = getUserLineMidpoint(graph);
					
				graph.userDrawnLinePoints[0].x += mouseX - handle[0].x;
				graph.userDrawnLinePoints[1].x += mouseX - handle[0].x;
				graph.userDrawnLinePoints[0].y += mouseY - handle[0].y;
				graph.userDrawnLinePoints[1].y += mouseY - handle[0].y;
							
				graphPanel.render();
			});		
	
	/* user ellipse */
	graphPanel.add(pv.Line)
		.visible(function() { return graph.udEllipse })//jQuery('#checkboxShowMMEllipse').is(':checked') })
		.data(function() { return getRotatedEllipseCoords(graph) })
		.left(function(d) { return d[0] })
		.bottom(function(d) { return d[1] })
		.strokeStyle("red");

	function getEllipseManipCoords(){
		var cardinalAngs = pv.range(0, 2 * Math.PI, Math.PI/2)
		var ellipseXRadius = graph.xRadius;
		var ellipseYRadius = graph.yRadius;
		
		var coords = [];
		for (i = 0; i < cardinalAngs.length; i++) {
			coords.push([ ellipseXRadius * Math.cos(cardinalAngs[i]),
						ellipseYRadius * Math.sin(cardinalAngs[i]) ]);
		}
		
		for (var i = 0; i < coords.length; i++) {
			coords[i] = ([ coords[i][0] * Math.cos(graph.angle) - coords[i][1] * Math.sin(graph.angle) + graph.ellipseCX,
						 coords[i][0] * Math.sin(graph.angle) + coords[i][1] * Math.cos(graph.angle) + graph.ellipseCY ]);
		}
		return coords;
	}
  
 
	graphPanel.add(pv.Dot)
		.visible(function() { return graph.udEllipse })//jQuery('#checkboxShowMMEllipse').is(':checked') })
		.data(getEllipseManipCoords)
		.left(function(d) { return d[0] })
		.bottom(function(d) { return d[1] })
		.cursor('move')
		.shape('square')
		.radius(5)
		.fillStyle("red")
		.strokeStyle("red")
		.event("mousedown", pv.Behavior.drag())
		.event("drag", function(){
			var mouseX = graphPanel.mouse().x,
				mouseY = graph.h - graphPanel.mouse().y,
				handleX = getEllipseManipCoords()[this.index][0],
				handleY = getEllipseManipCoords()[this.index][1],
				
				mouseVec = pv.vector(graph.ellipseCX - mouseX
									,graph.ellipseCY - mouseY),
				
				handleVec = pv.vector(graph.ellipseCX - handleX
									,graph.ellipseCY - handleY).norm();

			var detHndlMs = determinantBtwnVec(handleVec, mouseVec);
			var rotDist = angleBtwnVec(mouseVec, handleVec);			

			if (mouseX > (0 - graphCollection.padLeft) 
				&& mouseX < (graph.w + graphCollection.padRight) 
				&& mouseY > (0 - graphCollection.padBot) 
				&& mouseY < (graph.h + graphCollection.padTop)){
				
				//Rotation
				if (!isNaN(rotDist)){
					if (detHndlMs > 0){
						graph.angle = (graph.angle + rotDist) % (2*Math.PI);
					}else{
						graph.angle = (graph.angle - rotDist) % (2*Math.PI);
					}
				}
				 
				//Radius Inc/Dec
				if (this.index % 2 == 0){
					graph.xRadius = mouseVec.length();
				}else{
					graph.yRadius = mouseVec.length();
				}
			}

			graph.pointsInEllipse = numPointsInEllipse(graph);
					
			vis.render();
		})
		.add(pv.Label)								
			.text(function(d) {
				if (this.index == 3) { return "# of Points Inside = "+ numPointsInEllipse(graph) }
				else {return "";}
			})
			.textAlign("center")
			.textBaseline("bottom")
			.textStyle("red")
			.textAngle(0)
			.textMargin(10)
			.font("bold 12px sans-serif");
		 
	graphPanel.add(pv.Dot)
		.visible(function() { return graph.udEllipse })//jQuery('#checkboxShowMMEllipse').is(':checked') })
		.data(function() {return [[graph.ellipseCX, graph.ellipseCY]]})
		.left(function(d) { return d[0] })
		.bottom(function(d) { return d[1] })
		.cursor('move')
		.shape('cross')
		.radius(8)
		.fillStyle(pv.rgb(255,0,0,0.20))
		.strokeStyle(pv.rgb(255,0,0,0.50))
		.event("mousedown", pv.Behavior.drag())
		.event("drag", function(){
			var mouseX = graphPanel.mouse().x,
				mouseY = graph.h - graphPanel.mouse().y;

			if (mouseX > 0 && mouseX < graph.w && mouseY > 0 && mouseY < graph.h){
				graph.ellipseCX = mouseX;
				graph.ellipseCY = mouseY;
			}

			graph.pointsInEllipse = numPointsInEllipse(graph);
					
			vis.render();
		});
	 
		 
}

function constructTwoDistGraph(graph,index, graphPanel){	
	//Top subgraph is y-axis data
	var topDist = graphPanel.add(pv.Panel)
		.width(function(){return graph.w})
		.height(function(){return (graph.h-80)/2})
		.top(0)
		.left(0)
		.events("all");
	
	/* Number of datapoints N */
	topDist.add(pv.Label)
		.left(function(){return graph.w / 2})
		.top(-5)
		.textAlign("center")
		.textAngle(0)
		.text("N = " + graph.worksheet.data[graph.yData].length)
		.font("bold 14px sans-serif");
	
	//Y-axis drag feedback panel
	var yAxisDragFeedbackPanel = vis.add(pv.Panel)
		.height(function(){
			if (graph.yData == null)
				return 30;
			else
				return getPixelHeightOfText("bold "+graphCollection.labelTextSize+"px sans-serif", graph.yData);
		})
		.width(function(){
			if (graph.yData == null)
				return graph.w;
			else
				return getPixelWidthOfText("bold "+graphCollection.labelTextSize+"px sans-serif", graph.yData) + 20;
		})
		.left(function(){return graph.w/2 - this.width()/2})
		.bottom(-50)
		.lineWidth(1)
		.strokeStyle("black")
		.visible(false)
		
		
	yAxisDragFeedbackPanel.add(pv.Label)
		.text(function(){
			if (graph.yData == null)
				return "Drag here to assign a dataset to the y-axis."
			else
				return graph.yData;
		})
		.left(function(){return graph.yAxisPanel.width()/2})
		.top(function(){return graph.yAxisPanel.height()/2})
		.textAlign("center")
		.textBaseline("middle")
		.font("bold "+graphCollection.labelTextSize+"px sans-serif", graph.yData)
	
	
	//Y-axis drag drop zone
	graph.yAxisPanel = topDist.add(pv.Panel)
		.data([{"x":0,"y":0}])
		.height(function(){
			if (graph.yData == null)
				return 30;
			else
				return getPixelHeightOfText("bold "+graphCollection.labelTextSize+"px sans-serif", graph.yData);
		})
		.width(function(){
			if (graph.yData == null)
				return graph.w;
			else
				return getPixelWidthOfText("bold "+graphCollection.labelTextSize+"px sans-serif", graph.yData) + 20;
		})
		.left(function(){return graph.w/2 - this.width()/2})
		.bottom(-50)
		.lineWidth(1)
		.cursor("move")
		.events("all")
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
			yAxisDragFeedbackPanel.left(mouseX);
			yAxisDragFeedbackPanel.top(mouseY);
			yAxisDragFeedbackPanel.visible(true);
			document.body.style.cursor="move";
			yAxisDragFeedbackPanel.render();
		})
		.event("drag", function(event){
			var mouseY = vis.mouse().y;
			var mouseX = vis.mouse().x;
			yAxisDragFeedbackPanel.left(mouseX);
			yAxisDragFeedbackPanel.top(mouseY);
			yAxisDragFeedbackPanel.render();
		})
		.event("dragend", function(){
			var mouseY = vis.mouse().y;
			var mouseX = vis.mouse().x;
			var category = graph.yData;
			var thisGraphIndex = index;
			if(mouseX > -35 && mouseX < graphCollection.w && mouseY > 0 && mouseY < graphCollection.h + 70){
				graphCollection.graphs.forEach(function(g,i){
					if (g.xAxisPanel.mouse().x > 0 &&
							g.xAxisPanel.mouse().x < g.xAxisPanel.width() &&
							g.xAxisPanel.mouse().y > 0 &&
							g.xAxisPanel.mouse().y < g.xAxisPanel.height())
					{
						if (i == thisGraphIndex){
							g.assignY(g.xData);
							g.assignX(category);
						} else {
							g.assignX(category);
							graph.assignY(null);
						}
					}
					
					if (g.yAxisPanel.mouse().x > 0 &&
							g.yAxisPanel.mouse().x < g.yAxisPanel.width() &&
							g.yAxisPanel.mouse().y > 0 &&
							g.yAxisPanel.mouse().y < g.yAxisPanel.height())
					{
						if (i != thisGraphIndex){
							g.assignY(category);
							graph.assignY(null);
						}
					}
				});
			} else {
				graph.assignY(null);
			}
			
			yAxisDragFeedbackPanel.visible(false);
			document.body.style.cursor="default";
			constructVis();
			//vis.render();
		})
		
	graph.yAxisPanel.add(pv.Label)
		.text(function(){
			if (graph.yData == null)
				return "Drag here to assign a dataset to the y-axis."
			else
				return graph.yData;
		})
		.left(function(){return graph.yAxisPanel.width()/2})
		.top(function(){return graph.yAxisPanel.height()/2})
		.textAlign("center")
		.textBaseline("middle")
		.font("bold "+graphCollection.labelTextSize+"px sans-serif", graph.yData)
		
	/* X-axis ticks */
	topDist.add(pv.Rule)
		.data(function() { return getYBuckets(graph) })
		.left(function(d) {return graph.yHoriz(d)})
		.strokeStyle("#ddd")
		.anchor("bottom").add(pv.Label)
		  .text(function(d) {return d.toFixed(1)})
		  .font(function(){return "bold "+graphCollection.tickTextSize+"px sans-serif"})
		  
	/* X-axis line */
	topDist.add(pv.Rule)
		.bottom(0)
		.strokeStyle("#000");
	
	/* Dots */	
	topDist.add(pv.Dot)
		.data(function() {return xDistributionPoints(graph, graph.worksheet.data[graph.yData], graph.yHoriz)})
		.left(function(d) {return d.x})
		.bottom(function(d) {return d.y})
		.radius(function() {return graphCollection.dotSize})
		.fillStyle(function(d) {return pointFillStyle(d.label)})
		.strokeStyle(function(d) {return pointStrokeStyle(d.label)})
		.title(function(d) { return d.label + ", " + graph.yHoriz.invert(d.x).toFixed(1) });
	
	//Divider Between graphs
	topDist.add(pv.Rule)
		.bottom(-52)
		.left(0)
		.right(0)
		.strokeStyle("#000");
		
	//Bottom subgraph is x-axis data
	var bottomDist = graphPanel.add(pv.Panel)
		.width(function(){return graph.w})
		.height(function(){return (graph.h-80)/2})
		.top(function(){return (graph.h-80)/2 + 80})
		.left(0)
		.events("all");
	
	/* Number of datapoints N */
	bottomDist.add(pv.Label)
		.left(function(){return graph.w / 2})
		.top(-5)
		.textAlign("center")
		.textAngle(0)
		.text("N = " + graph.worksheet.data[graph.xData].length)
		.font("bold 14px sans-serif");
		
	/* X-axis ticks */
	bottomDist.add(pv.Rule)
		.data(function() { return getXBuckets(graph) })
		.left(function(d) {return graph.x(d)})
		.strokeStyle("#ddd")
		.anchor("bottom").add(pv.Label)
		  .text(function(d) {return d.toFixed(1)})
		  .font(function(){return "bold "+graphCollection.tickTextSize+"px sans-serif"})
		
	/* X-axis line */
	bottomDist.add(pv.Rule)
		.bottom(0)
		.strokeStyle("#000");
	
	/* Dots */	
	bottomDist.add(pv.Dot)
		.data(function() {return xDistributionPoints(graph, graph.worksheet.data[graph.xData], graph.x)})
		.left(function(d) {return d.x})
		.bottom(function(d) {return d.y})
		.radius(function() {return graphCollection.dotSize})
		.fillStyle(function(d) {return pointFillStyle(d.label)})
		.strokeStyle(function(d) {return pointStrokeStyle(d.label)})
		.title(function(d) { return d.label + ", " + graph.x.invert(d.x).toFixed(1)});
		
	vis.render();
}

function constructXDistGraph(graph, index, graphPanel){		  
	/* Number of datapoints N */
	graphPanel.add(pv.Label)
		.left(function(){return graph.w / 2})
		.top(-5)
		.textAlign("center")
		.textAngle(0)
		.text("N = " + graph.worksheet.data[graph.xData].length)
		.font("bold 14px sans-serif");

	/* X-axis ticks */
	graphPanel.add(pv.Rule)
		.data(function() { return getXBuckets(graph) })
		.left(function(d) {return graph.x(d)})
		.strokeStyle("#ddd")
		.anchor("bottom").add(pv.Label)
			.bottom(-10)
		  .text(function(d) {return d.toFixed(1)})
		  .font(function(){return "bold "+graphCollection.tickTextSize+"px sans-serif"})
		
	/* X-axis line */
	graphPanel.add(pv.Rule)
		.bottom(0)
		.strokeStyle("#000");
	
	/* Dots */	
	graphPanel.add(pv.Dot)
		.data(function() {return xDistributionPoints(graph, graph.worksheet.data[graph.xData], graph.x)})
		.left(function(d) {return d.x})
		.bottom(function(d) {return d.y})
		.radius(function() {return graphCollection.dotSize})
		.fillStyle(function(d) {return pointFillStyle(d.label)})
		.strokeStyle(function(d) {return pointStrokeStyle(d.label)})
		.title(function(d) { return d.label });
		
	vis.render();
}
	
function constructYDistGraph(graph,index, graphPanel){
	/* Number of datapoints N */
	graphPanel.add(pv.Label)
		.left(function(){return graph.w / 2})
		.top(-5)
		.textAlign("center")
		.textAngle(0)
		.text("N = " + graph.worksheet.data[graph.yData].length)
		.font("bold 14px sans-serif");

	/* Y-axis ticks */
	graphPanel.add(pv.Rule)
		.data(function() { return getYBuckets(graph) })
		.bottom(function(d) {return graph.y(d)})
		.strokeStyle("#ddd")
		.anchor("left").add(pv.Label)
		  .text(function(d) {return d.toFixed(1)})
		  .font(function(){return "bold "+graphCollection.tickTextSize+"px sans-serif"})
		  
	/* Y-axis line */
	graphPanel.add(pv.Rule)
		.left(0)
		.strokeStyle("#000");
	
	/* Dots */	
	graphPanel.add(pv.Dot)
		.data(function() {return yDistributionPoints(graph)})
		.left(function(d) {return d.x})
		.bottom(function(d) {return d.y})
		.radius(function() {return graphCollection.dotSize})
		.fillStyle(function(d) {return pointFillStyle(d.label)})
		.strokeStyle(function(d) {return pointStrokeStyle(d.label)})
		.title(function(d) { return d.label });
		
	vis.render();
}


