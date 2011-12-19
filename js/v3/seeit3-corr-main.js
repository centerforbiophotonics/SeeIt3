//Entry Point
var graphCollection = new GraphCollection();
var vis = {};
var touch = new Touch();
var fontString = "bold 14px arial";
var dragging = false;

var exampleSpreadsheets = [
	new Spreadsheet('0AuGPdilGXQlBdEd4SU44cVI5TXJxLXd3a0JqS3lHTUE'),
	new Spreadsheet('0AuGPdilGXQlBdE1idkxMSFNjbnFJWjRKTnA2Zlc4NXc'),
];

/* populate dataset drop down menu */
var lastSelectedWorksheet; 
var numWorksheetsLoaded = 0;
jQuery('body').bind('WorksheetLoaded', function(event) {
	if (event.refresh){
		graphCollection.addWorksheet(event.worksheet);
	}
	graphCollection.addWorksheet(event.worksheet);
  numWorksheetsLoaded++;
  $('p#loadingMsg').html("Loading "+(numWorksheetsLoaded/numWorksheets*100).toFixed(0)+"%");
  if (numWorksheetsLoaded >= numWorksheets){
		jQuery('p#loadingMsg').hide();
		constructVis();
  }
});

function constructVis() {
	jQuery('span').remove();
	touch = new Touch();
	
	vis = new pv.Panel()
		.width(function(){return graphCollection.w})
		.height(function(){return graphCollection.h})
		.bottom(function(){return graphCollection.padBot})
		.left(function(){return graphCollection.padLeft})
		.right(function(){return graphCollection.padRight})
		.top(function(){return graphCollection.padTop})
		
	/* Divider Between Graphs and Buttons */
	vis.add(pv.Rule)
		.left(-35)
		.right(graphCollection.padRight * -1)
		.top(-30)
	
	
	//Datasets
	var dataSetsPanel = vis.add(pv.Panel)
		.events("all")
		.cursor("pointer")
		.title("Show Datasets")
		.height(30)
		.width(function() {
			if (graphCollection.buttonIcon && graphCollection.buttonText){ 
				return 100;
			}else if (!graphCollection.buttonIcon){
				return 70;
			}else if (!graphCollection.buttonText){
				return 34;
			}
		})
		.left(-34)
		.top(-60)
		.lineWidth(1)
		.event("click", function(){
			$('#datasets').css('top',$('span').offset().top);
			if (!graphCollection.datasetsMenuShowing){
				$('#datasets').show();
				graphCollection.datasetsMenuShowing = true;
				positionAndSizeGraph();
				positionGraphMenuOverGraph(graphCollection.selectedGraphIndex, graphCollection);
				positionDisplayMenu();
				vis.render();
				
			} else {
				$('#datasets').hide();
				graphCollection.datasetsMenuShowing = false;
				positionAndSizeGraph();
				positionGraphMenuOverGraph(graphCollection.selectedGraphIndex, graphCollection);
				positionDisplayMenu();
				vis.render();
				
			}
			for(var i=0; i<graphCollection.graphs.length;i++){
				positionAndSizeAxisPanels(graphCollection.graphs[i],i);
			}
		})
		.event("mouseover", function(d){
			this.strokeStyle("black");
			this.render();
		})
		.event("mouseout", function(d){ 
			this.strokeStyle(pv.rgb(0,0,0,0));
			this.render();
		})
	
	dataSetsPanel.add(pv.Image)
		.url("http://centerforbiophotonics.github.com/SeeIt3/img/dataset.png")  //fix this
		.width(25)
		.height(25)
		.top(2)
		.left(2)
		.cursor("pointer")
		.title("Show Datasets")
		.visible(function() {
			if (graphCollection.buttonIcon)
				return true;
			else
				return false;
		})
		.anchor("left").add(pv.Label)
			.left(function(){
				if (graphCollection.buttonText && !graphCollection.buttonIcon){
					return 2;
				}else
					return 32;
			})
			.top(15)
			.text("Datasets")
			.font(fontString)
			.visible(function() {
				if (graphCollection.buttonText)
					return true;
				else
					return false;
			})
	
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
		.left(function() {
			if (graphCollection.buttonIcon && graphCollection.buttonText){ 
				return 67;
			}else if (!graphCollection.buttonIcon){
				return 40;
			}else if (!graphCollection.buttonText){
				return 0;
			}
		})
		.top(-60)
		.lineWidth(1)
		.event("click", function(){
			hideMenus();
			positionDisplayMenu();
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
				return 220;
			}else if (!graphCollection.buttonIcon){
				return 160;
			}else if (!graphCollection.buttonText){
				return 35;
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
				return 330;
			}else if (!graphCollection.buttonIcon){
				return 240;
			}else if (!graphCollection.buttonText){
				return 70;
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
		.title("Switch between One or Two Graph View")
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
		
	
	graphCollection.graphs.forEach(function(graph, index){
		constructGraphPanel(graph, index);
	});
	//constructSidePanel();
	constructDatasetPanel();
	
	vis.render();
	
	$("#YAxisHorizontal0").remove();
	$("#YAxis0").remove();
	$("#XAxis0").remove();
	$("#YAxisHorizontal1").remove();
	$("#YAxis1").remove();
	$("#XAxis1").remove();
	graphCollection.graphs.forEach(function(graph, index){
		constructLegendPanel(graph, index);
	});
	
	positionAndSizeGraph();
	
	graphCollection.graphs.forEach(function(graph, index){
		positionAndSizeAxisPanels(graph,index);
	});
	
}

function constructDatasetPanel(){
	var html = "";
	var i = 0;
	var picker = 0;
	exampleSpreadsheets.forEach(function(s){
		s.worksheets.forEach(function(w){
			html += "<table><tr>"+
							"<td><input type='image' id='subtreeToggle"+i+"'"+
								"src='"+(graphCollection.datasetsVisible[w.title]?"img/downTriangle.png":"img/rightTriangle.png")+"'"+
								"onclick='toggleDataSubtree(\"subtree"+i+"\","+i+",\""+w.title+"\")'"+
								"width='15' height='15'></td>"+
							"<td nowrap><div id='treeTitle"+i+"' "+
								"onclick='toggleDataSubtree(\"subtree"+i+"\","+i+",\""+w.title+"\")'>"+
								w.title+"</div></td>"+
							"</table></tr>";
			html += "<div id='subtree"+i+"' "+(graphCollection.datasetsVisible[w.title]?"":"hidden")+">";
			html += "<input type='image' src='img/edit.png'  style='margin-left:25px;' onclick='openWorksheetMenu(\""+w.title+"\")' width='25' height='25'>"+
							"<input type='image' src='img/refresh.png' style='margin-left:25px;' onclick='refreshWorksheet(\""+w.title+"\")' width='25' height='25'>"+
							"<input type='image' src='img/question.png' style='margin-left:25px;' onclick='showWorksheetDescription(\""+w.title+"\")' width='30' height='30'>"+
							"<input type='image' src='img/document.png' style='margin-left:25px;' onclick='editInGoogleDocs(\""+w.title+"\")' width='25' height='25'>";
			for (key in w.data){
				html+="<table style='margin-left:15px;'><tr>"+
							"<td><div id=\""+convertToID(key)+"\" class='menuItemDef'"+ 
							"style=\"color:"+(w.edited[key]?'red':'black')+";\""+
							"onmouseover=\"this.className='menuItemOver'\""+
							"onmouseout=\"this.className='menuItemDef'\""+
							"onmousedown=\"javascript:sidePanDragStart(event,'"+key+"')\">"+
							key+"</div></td></tr></table>";
				picker++;
			}
							
			html += "</div>";
			i++;
		})
	})
	html+="<table><tr onclick=\"openWorksheetMenu()\" style=\"cursor:pointer;\">"+
							"<td><image src='img/plus.png' width='25' height='25'></td>"+
							"<td>Add a Worksheet</td></div></tr></table>";
	$('#dataTree').html(html);
	$('#datasets').css('z-index',2)
}

function constructSidePanel(){
	var row = 0;
	
	vis.add(pv.Label)
		.text("Data Sets:")
		.left(-197)
		.top(-40)
		.font(fontString);
	
	var dragFeedbackPanels = [];
	for (var key in graphCollection.data){
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
						//constructVis();
					}
					
					if (g.yAxisPanel.mouse().x > 0 &&
							g.yAxisPanel.mouse().x < g.yAxisPanel.width() &&
							g.yAxisPanel.mouse().y > 0 &&
							g.yAxisPanel.mouse().y < g.yAxisPanel.height())
					{
						g.assignY(category);
						//constructVis();
					}
				});
				
				graphCollection.updateMenuOptions();
				
				dragFeedbackPanels[this.row()].visible(false);
				document.body.style.cursor="default";
				constructVis();
				//vis.render();
			})
			.event("touchstart", function(event){
				touch.dragType = "sideCat";
				touch.draggedObj = dragFeedbackPanels[this.row()];
				touch.dragging = true;
				touch.dragCat = this.category();
			})
			.event('touchend', function(event){
				setTimeout("constructVis()",1); 
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
		.top(40)
		.left(function(){return 60 + index * graph.w + index * 130})
		.events("all")
		.event("click", function(){
			hideMenus();
		})
		
	graph.graphPanel = graphPanel;
		
	
	/*Graph Title*/		  
	graphPanel.add(pv.Label)
		.left(function(){return graph.w / 2})
		.top(-15)
		.textAlign("center")
		.textAngle(0)
		.text(function(){
			var title = "";
			if (graph.xData != null){
				title += graph.xData;
			}
			if (graph.yData != null && graph.xData != null){
				title += " vs. ";
			} 
			if (graph.yData != null){
				title += graph.yData;
			}
			return title;
		})
		.font(function(){
			if (graph.yData != null && graph.xData != null && 
					graphCollection.graphs.length == 2)
				return "bold 12px sans-serif";
			else
				return "bold 20px sans-serif";
		});
	
	//Remove Graph Button
	graphPanel.add(pv.Panel)
		.right(0)
		.top(-60)
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
	
	
	//Divider between graphs
	graphPanel.add(pv.Rule)
		.left(-95)
		.top(-70)
		.bottom(-80)
		.visible(function(){ return index == 1 })
			
	//Show Graph Option Menu Button
	graphPanel.add(pv.Image)
		.url("http://centerforbiophotonics.github.com/SeeIt3/img/wrench.png")  //fix this
		.width(30)
		.height(30)
		.top(-65)
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
	graphPanel.event("click", function(){
		hideMenus();
		if (!dragging){
			if (graphCollection.editModeEnabled){
				var mouseX = graphPanel.mouse().x;
				var mouseY = graph.h - graphPanel.mouse().y;
				
				if (graph.labelPrompt){
					var label = prompt("Enter a label for the data", "defaultLabel"+graphCollection.defaultLabel);
					
					var dupFlag = false;
					graphCollection.worksheet.data[graph.xData].forEach(function(d){
						if (d.label == label){
							dupFlag = true;
							alert("The label "+label+" is already used in "+graph.xData);
						}
					});
					
					graphCollection.worksheet.data[graph.yData].forEach(function(d){
						if (d.label == label){
							dupFlag = true;
							alert("The label "+label+" is already used in "+graph.yData);
						}
					});
					
					if (!dupFlag){
						graphCollection.worksheet.data[graph.xData].push(
							{"label": label,
							 "value": graph.x.invert(mouseX)}
						);
						graphCollection.editData(graph.xData,graph.xData,graphCollection.worksheet.data[graph.xData]);
						
						graphCollection.worksheet.data[graph.yData].push(
							{"label": label,
							 "value": graph.y.invert(mouseY)}
						);
						graphCollection.editData(graph.yData,graph.yData,graphCollection.worksheet.data[graph.yData]);
						
						if (!graphCollection.labelColors.hasOwnProperty(label))
							graphCollection.labelColors[label] = graphCollection.colorScale(parseInt(Math.random()*20));
						
						if (label == "defaultLabel"+graphCollection.defaultLabel)
							graphCollection.defaultLabel++;
					}
				} else {
					graphCollection.worksheet.data[graph.xData].push(
						{"label": "defaultLabel"+graphCollection.defaultLabel,
						 "value": graph.x.invert(mouseX)}
					);
					graphCollection.editData(graph.xData,graph.xData,graphCollection.worksheet.data[graph.xData]);
					
					graphCollection.worksheet.data[graph.yData].push(
						{"label": "defaultLabel"+graphCollection.defaultLabel,
						 "value": graph.y.invert(mouseY)}
					);
					graphCollection.editData(graph.yData,graph.yData,graphCollection.worksheet.data[graph.yData]);
					
					if (!graphCollection.labelColors.hasOwnProperty("defaultLabel"+graphCollection.defaultLabel))
							graphCollection.labelColors["defaultLabel"+graphCollection.defaultLabel] = graphCollection.colorScale(parseInt(Math.random()*20));
					
					graphCollection.defaultLabel++;
				}
				vis.render();
			}
		} else {
			dragging = false;
		}
	});
	
	//graphPanel.height(
	/* Y-axis ticks */
  graphPanel.add(pv.Rule)
		.data(function() { return graph.y.ticks()})
		.bottom(function(d){return graph.y(d)})
		.strokeStyle(function(){
			if(graphCollection.editModeEnabled)
				return pv.rgb(255,0,0,0.25);
			else
				return "#ddd";
		})
		.anchor('left').add(pv.Label)
			.text(function(d) {return d.toFixed(1)})
			.font(function(){return "bold "+graphCollection.tickTextSize+"px sans-serif"})
			//.visible(function(){return this.index % 2 == 0})
	
	/* X-axis ticks */
  graphPanel.add(pv.Rule)
		.data(function() { return graph.x.ticks()})
		.left(function(d) {return graph.x(d)})
		.strokeStyle(function(){
			if(graphCollection.editModeEnabled)
				return pv.rgb(255,0,0,0.25);
			else
				return "#ddd";
		})
		.anchor("bottom").add(pv.Label)
			.text(function(d) {return d.toFixed(1)})
			.font(function(){return "bold "+graphCollection.tickTextSize+"px sans-serif"})
			//.visible(function(){return this.index % 2 == 0})
			
	/* Number of datapoints N */
  graphPanel.add(pv.Label)
		.right(function(){return graph.w/2})
		.top(0)
		.textAlign("center")
		.textAngle(0)
		.text(function(){return "N = " + graph.getData().length})
		.font("bold 14px sans-serif");
			
	//Y-axis Line
	graphPanel.add(pv.Rule)
		.left(1)
		.top(0)
		.bottom(0)
		.strokeStyle(function(){
			if(graphCollection.editModeEnabled)
				return "red";
			else
				return "#000";
		})
			
	//X-axis Line
	graphPanel.add(pv.Rule)
		.left(1)
		.right(0)
		.bottom(1)
		.strokeStyle(function(){
			if(graphCollection.editModeEnabled)
				return "red";
			else
				return "#000";
		})
	
	//Mouse position label for drag editing
	var dragLabel = graphPanel.add(pv.Label)
		.visible(false)
		.font(fontString)
		.textAlign("center")
		.text("0")
		
	/* median median crosses and squares */
	/* rectangle around median group */
	graphPanel.add(pv.Bar)
		.data(function(){return getMedianRectangles(graph)})
		.visible(function() { return graph.mmDivs && graph.groups != null})
		.left(function(d){return d.left})
		.bottom(function(d){return d.bottom})
		.width(function(d){return d.width})
		.height(function(d){return d.height})
		.lineWidth(0.5)
		.strokeStyle("blue")
		.fillStyle(pv.rgb(0,0,255,0.05))
		.add(pv.Label)								
			.text(function(d) {return "N = "+ d.n;})
			.textAlign("left")
			.textBaseline("top")
			.textStyle("blue")
			.textAngle(0)
			.font("bold 12px sans-serif");

	/* median cross */
		graphPanel.add(pv.Dot)
			.visible(function() { return graph.mmDots && graph.groups != null})
			.data(function(){ return graph.medians }) 
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return graph.y(d[1]) })
			.radius(10)
			.angle(Math.PI / 4)
			.shape('cross')
			.strokeStyle(pv.rgb(0,0,255,0.90));
			
  /* median-median line:
	   Is middle median dot higher or lower than line through outer median dots? 
	   That is, middle median dot's y value - y value at same x of original median line 
	   divided by three */
	graphPanel.add(pv.Line)
		.visible(function() {return graph.mmLine && graph.groups != null})
		.data(function(){return [[graph.xMin, graph.mmFarLeftYVal], 
														 [graph.xMax, graph.mmFarRightYVal]]})
		.left(function(d) { return graph.x(d[0]) })
		.bottom(function(d) { return graph.y(d[1]) })
		.title("Median-median line")
		.strokeStyle("blue")
		.lineWidth(2)
		.add(pv.Label)
			.visible(function () { return graph.mmEQ && graph.mmLine; })
			.text(function(d) {
				if (this.index == 0) { return "Y = "+graph.mmSlope.toFixed(3)+
																   "X + "+graph.mmIntercept.toFixed(3) }
				else { return "" }
			})
			.textAlign("left")
			.textBaseline("top")
			.textStyle("blue")
			.textAngle(function(){return getMMLineLabelAngle(graph)})
			.font("bold 12px sans-serif");
			
	/* Least Squares Regression Line */  
	graphPanel.add(pv.Line)
		.visible(function() { return graph.lsLine })
		.data(function(){return [[graph.xMin, graph.lsFarLeftYVal], 
														 [graph.xMax, graph.lsFarRightYVal]]})
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
			.textAngle(function(){return getLSLineLabelAngle(graph)})
			.font("bold 12px sans-serif")
		.add(pv.Label)									//R Value
			.visible(function () { return graph.lsR && graph.lsLine })
			.text(function(d) {
				if (this.index == 0) { return "R = "+ getR(graph.getData()).toFixed(2)+ " -- Sum of Squares = "+ getSumOfLeastSquares(graph).toFixed(1);}
				else {return ""}
			})
			.textAlign("left")
			.textBaseline("bottom")
			.textStyle(pv.rgb(0,225,0,1))
			.textAngle(function(){return getLSLineLabelAngle(graph)})
			.font("bold 12px sans-serif");
		
  /*R Squares*/
  graphPanel.add(pv.Bar)
		.data(function(){return getRSquares(graph)})
		.visible(function() { return graph.lsSquares && graph.lsLine })
		.left(function(d){return d.left})
		.bottom(function(d){return d.bottom})
		.width(function(d){return d.width})
		.height(function(d){return d.height})
		.lineWidth(0.5)
		.strokeStyle("green")
		.fillStyle(pv.rgb(0,225,0,0.05));
	
	// User defined least squares
	graphPanel.add(pv.Bar)
		.data(function(){return getUDSquares(graph)})
		.visible(function() { return graph.udLine && graph.udSquares })
		.left(function(d){return d.left})
		.top(function(d){return d.top})
		.width(function(d){return d.width})
		.height(function(d){return d.height})
		.lineWidth(0.5)
		.strokeStyle("red")
		.fillStyle(pv.rgb(225,0,0,0.05));
	
	/* user drawn line */
	var udLine = graphPanel.add(pv.Line)
		.data(function(){return graph.userDrawnLinePoints})
		.left(function(d) { return graph.x(d.x) })
		.top(function(d) { return graph.y(d.y) })
		.visible(function() { return graph.udLine })
		.fillStyle("red")
		.strokeStyle("red")
		.lineWidth(2)
		.add(pv.Dot)									//Endpoints
			.fillStyle("red")
			.shape('square')
			.cursor('move')
			.size(80)
			.event("mousedown", pv.Behavior.drag())
			.event("drag", function() {
				dragging = true;
				var mouseX = graph.x.invert(graphPanel.mouse().x),
					mouseY = graph.y.invert(graphPanel.mouse().y),
					panelX = graphPanel.mouse().x,
					panelY = graphPanel.mouse().y;
					
				if (panelX > 0 && panelX < graph.w && panelY > 0 && panelY < graph.h){
					graph.userDrawnLinePoints[this.index].x = mouseX;
					graph.userDrawnLinePoints[this.index].y = mouseY;
				} else {
					graph.userDrawnLinePoints[this.index].x = mouseX;
					graph.userDrawnLinePoints[this.index].y = mouseY;
					if (panelX < 0)
						graph.userDrawnLinePoints[this.index].x = graph.x.domain()[0];
					if (panelX > graph.w)
						graph.userDrawnLinePoints[this.index].x = graph.x.domain()[1];
					if (panelY < 0)
						graph.userDrawnLinePoints[this.index].y = graph.y.domain()[0];
					if (panelY > graph.h)
						graph.userDrawnLinePoints[this.index].y = graph.y.domain()[1];
				}
				
				graphPanel.render();
			})
			.event("touchstart", function(d){
				touch.dragType = "udLineAdjust";
				touch.dragging = true;
				touch.graphPanel = graphPanel;
				touch.graphIndex = index;
				touch.udLineHandleIndex = this.index;
			})
		.add(pv.Label)									//Line Equation
			.data(function() {
				var mp = getUserLineMidpoint(graph)[0],
				lp = graph.userDrawnLinePoints[0]
				return [{"x":(mp.x+lp.x)/2,"y":(mp.y+lp.y)/2}];
			})
			.left(function(d) { return graph.x(d.x) })
			.bottom(function(d) { return graph.y(d.y) })
			.visible(function () { return graph.udLine })
			.text(function(d) {
				if (this.index == 0) { return "Y = "+getUserLineSlope(graph).toFixed(3)+"X + "+getUserLineIntercept(graph).toFixed(3)}
				else {return ""}
			})
			.textAlign("left")
			.textBaseline("top")
			.textStyle("red")
			.textAngle(function() { return getUserLineLabelAngle(graph)})
			.font("bold 12px sans-serif")
		.add(pv.Label)									//Sum of Squares
			.data(function() {
				var mp = getUserLineMidpoint(graph)[0],
				lp = graph.userDrawnLinePoints[0]
				return [{"x":(mp.x+lp.x)/2,"y":(mp.y+lp.y)/2}];
			})
			.left(function(d) { return graph.x(d.x) })
			.bottom(function(d) { return graph.y(d.y) })
			.visible(function () { return graph.udLine })
			.text(function(d) {
				if (this.index == 0) { return "Sum of Squares = "+ getUserLineR(graph).toFixed(2) }
				else {return ""}
			})
			.textAlign("left")
			.textBaseline("bottom")
			.textStyle("red")
			.textAngle(function() {return getUserLineLabelAngle(graph)})
			.font("bold 12px sans-serif")
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
				dragging = true;
				var mouseX = graph.x.invert(graphPanel.mouse().x),
					mouseY = graph.y.invert(graphPanel.mouse().y),
					handle = getUserLineMidpoint(graph),
					panelX = graphPanel.mouse().x,
					panelY = graphPanel.mouse().y;
					
				if (panelX > 0 && panelX < graph.w && panelY > 0 && panelY < graph.h){					
					graph.userDrawnLinePoints[0].x += mouseX - handle[0].x;
					graph.userDrawnLinePoints[1].x += mouseX - handle[0].x;
					graph.userDrawnLinePoints[0].y += mouseY - handle[0].y;
					graph.userDrawnLinePoints[1].y += mouseY - handle[0].y;
				}
				
				if (graph.userDrawnLinePoints[0].x > graph.x.domain()[1])
					graph.userDrawnLinePoints[0].x = graph.x.domain()[1]
					
				if (graph.userDrawnLinePoints[0].x < graph.x.domain()[0])
					graph.userDrawnLinePoints[0].x = graph.x.domain()[0]
					
				if (graph.userDrawnLinePoints[0].y > graph.y.domain()[1])
					graph.userDrawnLinePoints[0].y = graph.y.domain()[1]
					
				if (graph.userDrawnLinePoints[0].y < graph.y.domain()[0])
					graph.userDrawnLinePoints[0].y = graph.y.domain()[0]
					
				if (graph.userDrawnLinePoints[1].x > graph.x.domain()[1])
					graph.userDrawnLinePoints[1].x = graph.x.domain()[1]
					
				if (graph.userDrawnLinePoints[1].x < graph.x.domain()[0])
					graph.userDrawnLinePoints[1].x = graph.x.domain()[0]
					
				if (graph.userDrawnLinePoints[1].y > graph.y.domain()[1])
					graph.userDrawnLinePoints[1].y = graph.y.domain()[1]
					
				if (graph.userDrawnLinePoints[1].y < graph.y.domain()[0])
					graph.userDrawnLinePoints[1].y = graph.y.domain()[0]
				
				
				graphPanel.render();
			})
			.event("touchstart", function(d){
				touch.dragType = "udLineMove";
				touch.dragging = true;
				touch.graphPanel = graphPanel;
				touch.graphIndex = index;
			})
			
	/* user ellipse */
	graphPanel.add(pv.Line)
		.visible(function() { return graph.udEllipse })
		.data(function() { return getRotatedEllipseCoords(graph) })
		.left(function(d) { return d[0] })
		.bottom(function(d) { return d[1] })
		.strokeStyle("red");
 
	graphPanel.add(pv.Dot)
		.visible(function() { return graph.udEllipse })
		.data(function(){return getEllipseManipCoords(graph)})
		.left(function(d) { return d[0] })
		.bottom(function(d) { return d[1] })
		.cursor('move')
		.shape('square')
		.radius(10)
		.fillStyle("red")
		.strokeStyle("red")
		.title(function(){return "# of Points Inside = "+ numPointsInEllipse(graph)})
		.event("mousedown", pv.Behavior.drag())
		.event("drag", function(){
			dragging = true;
			var mouseX = graphPanel.mouse().x,
				mouseY = graph.h - graphPanel.mouse().y,
				handleX = getEllipseManipCoords(graph)[this.index][0],
				handleY = getEllipseManipCoords(graph)[this.index][1],
				
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
					
			graphPanel.render();
		})
		.event("touchstart", function(d){
			touch.dragType = "ellipseAdjust";
			touch.dragging = true;
			touch.graphPanel = graphPanel;
			touch.graphIndex = index;
			touch.ellipseHandleIndex = this.index;
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
		.visible(function() { return graph.udEllipse })
		.data(function() {return [[graph.ellipseCX, graph.ellipseCY]]})
		.left(function(d) { return d[0] })
		.bottom(function(d) { return d[1] })
		.cursor('move')
		.shape('square')
		.radius(8)
		.fillStyle(pv.rgb(255,0,0,0.20))
		.strokeStyle(pv.rgb(255,0,0,0.50))
		.event("mousedown", pv.Behavior.drag())
		.event("drag", function(){
			dragging = true;
			var mouseX = graphPanel.mouse().x,
				mouseY = graph.h - graphPanel.mouse().y;

			if (mouseX > 0 && mouseX < graph.w && mouseY > 0 && mouseY < graph.h){
				graph.ellipseCX = mouseX;
				graph.ellipseCY = mouseY;
			}

			graph.pointsInEllipse = numPointsInEllipse(graph);
					
			graphPanel.render();
		})
		.event("touchstart", function(d){
			touch.dragType = "ellipseMove";
			touch.dragging = true;
			touch.graphPanel = graphPanel;
			touch.graphIndex = index;
		})
		
	//graphPanel.add(pv.Label)
	//	.data(function() {return [[graph.ellipseCX, graph.ellipseCY]]})
	//	.left(function(d) { return d[0] })
	//	.bottom(function(d) { return d[1] })
	//	.text(function(d) {return numPointsInEllipse(graph)})
	//	.visible(function() { return graph.udEllipse })
	//	.textAlign("center")
	//	.textBaseline("middle")
	//	.textStyle("red")
	//	.textAngle(0)
	//	.textMargin(10)
	//	.font("bold 12px sans-serif");
	
	/* dot plot */
	graphPanel.add(pv.Dot)
		.data(function(){return graph.getClonedData()})
		.event("point", function() { return this.active(this.index).parent })
		.event("unpoint", function() { return this.active(-1).parent })
		.left(function(d) { return graph.x(d.x) })
		.bottom(function(d) { return graph.y(d.y) })
		.radius(function() { return graphCollection.dotSize })
		.fillStyle(function(d) {return pointFillStyle(d.label)})
		.strokeStyle(function(d) {return pointStrokeStyle(d.label)})
		.title(function(d) { return d.label + ": " + d.x.toFixed(1) + ", " + d.y.toFixed(1) })
		.cursor(function(){
			if (graphCollection.editModeEnabled)
				return "move";
			else
				return "default";
		})
		.visible(function(d) {
			var y = graph.y(d.y);
			var x = graph.x(d.x);
			return graph.showData  && 
				y <= graph.h &&
				y >= 0 &&
				x <= graph.w &&
				x >= 0;
		})
		.event("mousedown", pv.Behavior.drag())
		.event("drag", function(d){
			dragging = true;  
			if (graphCollection.editModeEnabled &&
					graphPanel.mouse().x >= 0 &&
					graphPanel.mouse().x <= graph.w &&
					graphPanel.mouse().y >= 0 &&
					graphPanel.mouse().y <= graph.h){
				
				graphCollection.editSinglePoint(graph.xData, d.label, graph.x.invert(graphPanel.mouse().x));
				graphCollection.editSinglePoint(graph.yData, d.label, graph.y.invert(graph.h - graphPanel.mouse().y));
				
				dragLabel.text(graph.x.invert(graphPanel.mouse().x).toFixed(1) +
												", " +
											graph.y.invert(graph.h - graphPanel.mouse().y).toFixed(1));
				dragLabel.left(graphPanel.mouse().x)
				dragLabel.top(graphPanel.mouse().y - 10)
				dragLabel.visible(true)
				
				vis.render();
			} else {
				dragLabel.text("Delete");
				vis.render();
			}
		})
		.event("dragend",function(d){
			if (graphCollection.editModeEnabled){
				var newXData = graphCollection.worksheet.data[graph.xData];
				var newYData = graphCollection.worksheet.data[graph.yData];
				var remIndex = null;
				newXData.forEach(function(data, index){
					if (data.label == d.label && 
					(graphPanel.mouse().x < 0 ||
					 graphPanel.mouse().x > graph.w ||
					 graphPanel.mouse().y < 0 ||
					 graphPanel.mouse().y > graph.h))
					{
						remIndex = index;
					}
				});
				if (remIndex != null)
					newXData.splice(remIndex,1);
				graphCollection.editData(graph.xData,graph.xData,newXData);
				
				remIndex = null;
				newYData.forEach(function(data, index){
					if (data.label == d.label && 
					(graphPanel.mouse().x < 0 ||
					 graphPanel.mouse().x > graph.w ||
					 graphPanel.mouse().y < 0 ||
					 graphPanel.mouse().y > graph.h))
					{
						remIndex = index;
					}
				});
				if (remIndex != null)
					newYData.splice(remIndex,1);
				graphCollection.editData(graph.yData,graph.yData,newYData);
				
				dragLabel.visible(false);
				constructVis();
				//vis.render();
			}
		})
		.event("touchstart", function(d){
			if (graphCollection.editModeEnabled){
				touch.dragType = "dataCorr";
				touch.dataObj = d;
				touch.dragging = true;
				touch.graphIndex = index;
				touch.graphPanel = graphPanel;
				touch.dragLabel = dragLabel;
			}
		})
		
	//Graph Overflow Warning Message
	graphPanel.add(pv.Label)
		.text("Warning! Data points lie outside graph boundaries.")
		.textStyle("red")
		.font(fontString)
		.top(35)
		.left(function(){return graph.w/2})
		.textAlign("center")
		.visible(function(){
			var retVal = false;
			graph.getClonedData().forEach(function(d){
				var y = graph.y(d.y);
				var x = graph.x(d.x);
				if (y > graph.h ||
						y < 0 ||
						x > graph.w ||
						x < 0)
					retVal = true;
			});
			return retVal;
		})
 
}

function constructTwoDistGraph(graph,index, graphPanel){	
	graph.xMax = pv.max(graph.data[graph.xData], function(d) { return d.value });
	graph.xMin = pv.min(graph.data[graph.xData], function(d) { return d.value });
	graph.setXScale();
	graph.yMax = pv.max(graph.data[graph.yData], function(d) { return d.value });
	graph.yMin = pv.min(graph.data[graph.yData], function(d) { return d.value });
	graph.setYScale();
	
	graphPanel.event("click", function(){
		hideMenus();
	});
	
	///////////////////////////////////////////////////////////////////
	//Top subgraph is y-axis data
	///////////////////////////////////////////////////////////////////
	var topDist = graphPanel.add(pv.Panel)
		.width(function(){return graph.w})
		.height(function(){return (graph.h-80)/2})
		.top(0)
		.left(0)
		.events("all")
		.event("click", function(){
			hideMenus();
			if (!dragging){
				if (graphCollection.editModeEnabled){
					var mouseX = topDist.mouse().x;
					
					if (graph.labelPrompt){
						var label = prompt("Enter a label for the data", "defaultLabel"+graphCollection.defaultLabel);
						
						var dupFlag = false;
						graphCollection.worksheet.data[graph.yData].forEach(function(d){
							if (d.label == label){
								dupFlag = true;
								alert("The label "+label+" is already used in "+graph.yData);
							}
						});
						
						if (!dupFlag){
							graphCollection.worksheet.data[graph.yData].push(
								{"label": label,
								 "value": graph.yHoriz.invert(mouseX)}
							);
							graphCollection.editData(graph.yData,graph.yData,graphCollection.worksheet.data[graph.yData]);
							
							if (!graphCollection.labelColors.hasOwnProperty(label))
								graphCollection.labelColors[label] = graphCollection.colorScale(parseInt(Math.random()*20));
							
							if (label == "defaultLabel"+graphCollection.defaultLabel)
								graphCollection.defaultLabel++;
						}
					} else {
						graphCollection.worksheet.data[graph.yData].push(
							{"label": "defaultLabel"+graphCollection.defaultLabel,
							 "value": graph.yHoriz.invert(mouseX)}
						);
						graphCollection.editData(graph.yData,graph.yData,graphCollection.worksheet.data[graph.yData]);
						
						if (!graphCollection.labelColors.hasOwnProperty("defaultLabel"+graphCollection.defaultLabel))
								graphCollection.labelColors["defaultLabel"+graphCollection.defaultLabel] = graphCollection.colorScale(parseInt(Math.random()*20));
						
						graphCollection.defaultLabel++;
					}
					vis.render();
				}
			} else {
				dragging = false;
			}
		});
	
	/* Number of datapoints N */
	topDist.add(pv.Label)
		.left(function(){return graph.w / 2})
		.top(0)
		.textAlign("center")
		.textAngle(0)
		.text(function(){return "N = " + graph.data[graph.yData].length})
		.font("bold 14px sans-serif");
	
	//Mouse position label for drag editing
	var topDragLabel = topDist.add(pv.Label)
		.visible(false)
		.font(fontString)
		.textAlign("center")
		.text("0")
	
	
	/* Y-axis (horizontal) ticks */
	topDist.add(pv.Rule)
		.data(function() { return graph.y.ticks() })
		.left(function(d) {return graph.yHoriz(d)})
		.strokeStyle(function(){
			if(graphCollection.editModeEnabled)
				return pv.rgb(255,0,0,0.25);
			else
				return "#ddd";
		})
		.anchor("bottom").add(pv.Label)
		  .text(function(d) {return d.toFixed(1)})
		  .font(function(){return "bold "+graphCollection.tickTextSize+"px sans-serif"})
		  //.visible(function(){return this.index % 2 == 0})
		  
	/* X-axis line */
	topDist.add(pv.Rule)
		.bottom(0)
		.strokeStyle(function(){
			if(graphCollection.editModeEnabled)
				return "red";
			else
				return "#000";
		})
	
	/* Dots */	
	topDist.add(pv.Dot)
		.data(function() {return xDistributionPoints(graph, graph.data[graph.yData], graph.yHoriz)})
		.left(function(d) {return d.x})
		.bottom(function(d) {return d.y})
		.radius(function() {return graphCollection.dotSize})
		.fillStyle(function(d) {return pointFillStyle(d.label)})
		.strokeStyle(function(d) {return pointStrokeStyle(d.label)})
		.title(function(d) { return d.label + ", " + graph.yHoriz.invert(d.x).toFixed(1) })
		.cursor(function(){
			if (graphCollection.editModeEnabled)
				return "move";
			else
				return "default";
		})
		.visible(function(d) {
			return graph.showData  && 
				d.y <= topDist.height() &&
				d.x >= 0 &&
				d.x <= topDist.width();
		})
		.event("mousedown", pv.Behavior.drag())
		.event("drag", function(d){  
			if (graphCollection.editModeEnabled &&
					topDist.mouse().x >= 0 &&
					topDist.mouse().x <= graph.w &&
					topDist.mouse().y >= 0 &&
					topDist.mouse().y <= graph.h){
				
				graphCollection.editSinglePoint(graph.yData, d.label, graph.yHoriz.invert(topDist.mouse().x));
				
				topDragLabel.text(graph.yHoriz.invert(topDist.mouse().x).toFixed(1))
				topDragLabel.left(topDist.mouse().x)
				topDragLabel.top(topDist.mouse().y - 10)
				topDragLabel.visible(true)
				
				vis.render();
			} else {
				topDragLabel.text("Delete");
				vis.render();
			}
		})
		.event("dragend",function(d){
			if (graphCollection.editModeEnabled){
				var newYData = graphCollection.worksheet.data[graph.yData];
				var remIndex = null;
				
				newYData.forEach(function(data, index){
					if (data.label == d.label && 
					(topDist.mouse().x < 0 ||
					 topDist.mouse().x > graph.w ||
					 topDist.mouse().y < 0 ||
					 topDist.mouse().y > graph.h))
					{
						remIndex = index;
					}
				});
				if (remIndex != null)
					newYData.splice(remIndex,1);
				graphCollection.editData(graph.yData,graph.yData,newYData);
				
				topDragLabel.visible(false);
				
				vis.render();
			}
		})
		.event("touchstart", function(d){
			touch.dragType = "dataBothTop";
			touch.dataObj = d;
			touch.dragging = true;
			touch.graphIndex = index;
			touch.graphPanel = graphPanel;
			touch.dragLabel = topDragLabel;
			touch.topSubgraph = topDist;
		})
		
	//Graph Overflow Warning Message
	topDist.add(pv.Label)
		.text("Warning! Data points lie outside graph boundaries.")
		.textStyle("red")
		.font(fontString)
		.top(35)
		.left(function(){return graph.w/2})
		.textAlign("center")
		.visible(function(){
			var retVal = false;
			 xDistributionPoints(graph, graph.data[graph.yData], graph.yHoriz).forEach(function(d){
				if (d.y > topDist.height() ||
						d.x > topDist.width() ||
						d.x < 0)
					retVal = true;
			});
			return retVal;
		})
		
	
	//Divider Between graphs
	topDist.add(pv.Rule)
		.bottom(-52)
		.left(0)
		.right(0)
		.strokeStyle("#000");
	
	/////////////////////////////////////////////////////////////////////
	//Bottom subgraph is x-axis data
	/////////////////////////////////////////////////////////////////////
	var bottomDist = graphPanel.add(pv.Panel)
		.width(function(){return graph.w})
		.height(function(){return (graph.h-80)/2})
		.top(function(){return (graph.h-80)/2 + 80})
		.left(0)
		.events("all")
		.event("click", function(){
			hideMenus();
			if (!dragging){
				if (graphCollection.editModeEnabled){
					var mouseX = bottomDist.mouse().x;
					
					if (graph.labelPrompt){
						var label = prompt("Enter a label for the data", "defaultLabel"+graphCollection.defaultLabel);
						
						var dupFlag = false;
						graphCollection.worksheet.data[graph.xData].forEach(function(d){
							if (d.label == label){
								dupFlag = true;
								alert("The label "+label+" is already used in "+graph.xData);
							}
						});
						
						if (!dupFlag){
							graphCollection.worksheet.data[graph.xData].push(
								{"label": label,
								 "value": graph.x.invert(mouseX)}
							);
							graphCollection.editData(graph.xData,graph.xData,graphCollection.worksheet.data[graph.xData]);
							
							if (!graphCollection.labelColors.hasOwnProperty(label))
								graphCollection.labelColors[label] = graphCollection.colorScale(parseInt(Math.random()*20));
							
							if (label == "defaultLabel"+graphCollection.defaultLabel)
								graphCollection.defaultLabel++;
						}
					} else {
						graphCollection.worksheet.data[graph.xData].push(
							{"label": "defaultLabel"+graphCollection.defaultLabel,
							 "value": graph.x.invert(mouseX)}
						);
						graphCollection.editData(graph.xData,graph.xData,graphCollection.worksheet.data[graph.xData]);
						
						if (!graphCollection.labelColors.hasOwnProperty("defaultLabel"+graphCollection.defaultLabel))
								graphCollection.labelColors["defaultLabel"+graphCollection.defaultLabel] = graphCollection.colorScale(parseInt(Math.random()*20));
						
						graphCollection.defaultLabel++;
					}
					vis.render();
				}
			} else {
				dragging = false;
			}
		});
		
	//Mouse position label for drag editing
	var botDragLabel = bottomDist.add(pv.Label)
		.visible(false)
		.font(fontString)
		.textAlign("center")
		.text("0")
	
	/* Number of datapoints N */
	bottomDist.add(pv.Label)
		.left(function(){return graph.w / 2})
		.top(-5)
		.textAlign("center")
		.textAngle(0)
		.text(function(){return "N = " + graph.data[graph.xData].length})
		.font("bold 14px sans-serif");
		
	/* X-axis ticks */
	bottomDist.add(pv.Rule)
		.data(function() { return graph.x.ticks() })
		.left(function(d) {return graph.x(d)})
		.strokeStyle(function(){
			if(graphCollection.editModeEnabled)
				return pv.rgb(255,0,0,0.25);
			else
				return "#ddd";
		})
		.anchor("bottom").add(pv.Label)
		  .text(function(d) {return d.toFixed(1)})
		  .font(function(){return "bold "+graphCollection.tickTextSize+"px sans-serif"})
		  //.visible(function(){return this.index % 2 == 0})
		
	/* X-axis line */
	bottomDist.add(pv.Rule)
		.bottom(0)
		.strokeStyle(function(){
			if(graphCollection.editModeEnabled)
				return "red";
			else
				return "#000";
		})
	
	
	
	/* Dots */	
	bottomDist.add(pv.Dot)
		.data(function() {return xDistributionPoints(graph, graph.data[graph.xData], graph.x)})
		.left(function(d) {return d.x})
		.bottom(function(d) {return d.y})
		.radius(function() {return graphCollection.dotSize})
		.fillStyle(function(d) {return pointFillStyle(d.label)})
		.strokeStyle(function(d) {return pointStrokeStyle(d.label)})
		.title(function(d) { return d.label + ", " + graph.x.invert(d.x).toFixed(1)})
		.cursor(function(){
			if (graphCollection.editModeEnabled)
				return "move";
			else
				return "default";
		})
		.visible(function(d) {
			return graph.showData  && 
				d.y <= bottomDist.height() &&
				d.x <= bottomDist.width() &&
				d.x >= 0;
		})
		.event("mousedown", pv.Behavior.drag())
		.event("drag", function(d){  
			if (graphCollection.editModeEnabled &&
					bottomDist.mouse().x >= 0 &&
					bottomDist.mouse().x <= graph.w &&
					bottomDist.mouse().y >= 0 &&
					bottomDist.mouse().y <= graph.h){
				
				graphCollection.editSinglePoint(graph.xData, d.label, graph.x.invert(bottomDist.mouse().x));

				botDragLabel.text(graph.x.invert(bottomDist.mouse().x).toFixed(1))
				botDragLabel.left(bottomDist.mouse().x)
				botDragLabel.top(bottomDist.mouse().y - 10)
				botDragLabel.visible(true)
				
				vis.render();
			} else {
				botDragLabel.text("Delete");
				vis.render();
			}
		})
		.event("dragend",function(d){
			if (graphCollection.editModeEnabled){
				var newXData = graphCollection.worksheet.data[graph.xData];
				var remIndex = null;
				newXData.forEach(function(data, index){
					if (data.label == d.label && 
					(bottomDist.mouse().x < 0 ||
					 bottomDist.mouse().x > graph.w ||
					 bottomDist.mouse().y < 0 ||
					 bottomDist.mouse().y > graph.h))
					{
						remIndex = index;
					}
				});
				if (remIndex != null)
					newXData.splice(remIndex,1);
				graphCollection.editData(graph.xData,graph.xData,newXData);
				
				botDragLabel.visible(false);
				
				vis.render();
			}
		})
		.event("touchstart", function(d){
			touch.dragType = "dataBothBottom";
			touch.dataObj = d;
			touch.dragging = true;
			touch.graphIndex = index;
			touch.graphPanel = graphPanel;
			touch.dragLabel = botDragLabel;
			touch.bottomSubgraph = bottomDist;
		})
		
	//Graph Overflow Warning Message
	bottomDist.add(pv.Label)
		.text("Warning! Data points lie outside graph boundaries.")
		.textStyle("red")
		.font(fontString)
		.top(35)
		.left(function(){return graph.w/2})
		.textAlign("center")
		.visible(function(){
			var retVal = false;
			 xDistributionPoints(graph, graph.data[graph.xData], graph.x).forEach(function(d){
				if (d.y > bottomDist.height() ||
						d.x > bottomDist.width() ||
						d.x < 0)
					retVal = true;
			});
			return retVal;
		})
		
	vis.render();
}

function constructXDistGraph(graph, index, graphPanel){		
	graphPanel.event("click", function(){
		hideMenus();
		if (!dragging){
			if (graphCollection.editModeEnabled){
				var mouseX = graphPanel.mouse().x;
				
				if (graph.labelPrompt){
					var label = prompt("Enter a label for the data", "defaultLabel"+graphCollection.defaultLabel);
					
					var dupFlag = false;
					graphCollection.worksheet.data[graph.xData].forEach(function(d){
						if (d.label == label){
							dupFlag = true;
							alert("The label "+label+" is already used in "+graph.xData);
						}
					});
					
					if (!dupFlag){
						graphCollection.worksheet.data[graph.xData].push(
							{"label": label,
							 "value": graph.x.invert(mouseX)}
						);
						graphCollection.editData(graph.xData,graph.xData,graphCollection.worksheet.data[graph.xData]);
						
						if (!graphCollection.labelColors.hasOwnProperty(label))
							graphCollection.labelColors[label] = graphCollection.colorScale(parseInt(Math.random()*20));
						
						if (label == "defaultLabel"+graphCollection.defaultLabel)
							graphCollection.defaultLabel++;
					}
				} else {
					graphCollection.worksheet.data[graph.xData].push(
						{"label": "defaultLabel"+graphCollection.defaultLabel,
						 "value": graph.x.invert(mouseX)}
					);
					graphCollection.editData(graph.xData,graph.xData,graphCollection.worksheet.data[graph.xData]);
					
					if (!graphCollection.labelColors.hasOwnProperty("defaultLabel"+graphCollection.defaultLabel))
							graphCollection.labelColors["defaultLabel"+graphCollection.defaultLabel] = graphCollection.colorScale(parseInt(Math.random()*20));
					
					graphCollection.defaultLabel++;
				}
				vis.render();
			}
		} else {
			dragging = false;
		}
	});
	
	/* Number of datapoints N */
	graphPanel.add(pv.Label)
		.left(function(){return graph.w / 2})
		.top(0)
		.textAlign("center")
		.textAngle(0)
		.text(function(){return "N = " + graph.data[graph.xData].length})
		.font("bold 14px sans-serif");

	/* X-axis ticks */
	graphPanel.add(pv.Rule)
		.data(function() { return graph.x.ticks() })
		.left(function(d) {return graph.x(d)})
		.strokeStyle(function(){
			if(graphCollection.editModeEnabled)
				return pv.rgb(255,0,0,0.25);
			else
				return "#ddd";
		})
		.anchor("bottom").add(pv.Label)
			.bottom(-10)
		  .text(function(d) {return d.toFixed(1)})
		  .font(function(){return "bold "+graphCollection.tickTextSize+"px sans-serif"})
			//.visible(function(){return this.index % 2 == 0})
			
	/* X-axis line */
	graphPanel.add(pv.Rule)
		.bottom(0)
		.strokeStyle(function(){
			if(graphCollection.editModeEnabled)
				return "red";
			else
				return "#000";
		})
	
	//Mouse position label for drag editing
	var dragLabel = graphPanel.add(pv.Label)
		.visible(false)
		.font(fontString)
		.textAlign("center")
		.text("0")
	
	/* Dots */	
	graphPanel.add(pv.Dot)
		.data(function() {return xDistributionPoints(graph, graph.data[graph.xData], graph.x)})
		.left(function(d) {return d.x})
		.bottom(function(d) {return d.y})
		.radius(function() {return graphCollection.dotSize})
		.fillStyle(function(d) {return pointFillStyle(d.label)})
		.strokeStyle(function(d) {return pointStrokeStyle(d.label)})
		.title(function(d) { return d.label + ", " + graph.x.invert(d.x).toFixed(1)})
		.cursor(function(){
			if (graphCollection.editModeEnabled)
				return "move";
			else
				return "default";
		})
		.visible(function(d) {
			return graph.showData  && 
				(d.y) < graph.h &&
				d.x >= 0 &&
				d.x <= graph.w;
		})
		.event("mousedown", pv.Behavior.drag())
		.event("drag", function(d){  
			if (graphCollection.editModeEnabled &&
					graphPanel.mouse().x >= 0 &&
					graphPanel.mouse().x <= graph.w &&
					graphPanel.mouse().y >= 0 &&
					graphPanel.mouse().y <= graph.h){
				
				graphCollection.editSinglePoint(graph.xData, d.label, graph.x.invert(graphPanel.mouse().x));
				
				dragLabel.text(graph.x.invert(graphPanel.mouse().x).toFixed(1))
				dragLabel.left(graphPanel.mouse().x)
				dragLabel.top(graphPanel.mouse().y - 10)
				dragLabel.visible(true)
				
				vis.render();
			} else {
				dragLabel.text("Delete");
				vis.render();
			}
		})
		.event("dragend",function(d){
			if (graphCollection.editModeEnabled){
				var newXData = graphCollection.worksheet.data[graph.xData];
				var remIndex = null;
				newXData.forEach(function(data, index){
					if (data.label == d.label && 
					(graphPanel.mouse().x < 0 ||
					 graphPanel.mouse().x > graph.w ||
					 graphPanel.mouse().y < 0 ||
					 graphPanel.mouse().y > graph.h))
					{
						remIndex = index;
					}
				});
				if (remIndex != null)
					newXData.splice(remIndex,1);
				graphCollection.editData(graph.xData,graph.xData,newXData);
				
				dragLabel.visible(false);
				
				vis.render();
			}
		})
		.event("touchstart", function(d){
			if (graphCollection.editModeEnabled){
				touch.dragType = "dataX";
				touch.dataObj = d;
				touch.dragging = true;
				touch.graphIndex = index;
				touch.graphPanel = graphPanel;
				touch.dragLabel = dragLabel;
			}
		})
		
	//Graph Overflow Warning Message
	graphPanel.add(pv.Label)
		.text("Warning! Data points lie outside graph boundaries.")
		.textStyle("red")
		.font(fontString)
		.top(35)
		.left(function(){return graph.w/2})
		.textAlign("center")
		.visible(function(){
			var retVal = false;
			 xDistributionPoints(graph, graph.data[graph.xData], graph.x).forEach(function(d){
				if (d.y > graph.h ||
						d.x < 0 ||
						d.x > graph.w)
					retVal = true;
			});
			return retVal;
		})
		
	vis.render();
}
	
function constructYDistGraph(graph,index, graphPanel){
	graphPanel.event("click", function(){
		hideMenus();
		if (!dragging){
			if (graphCollection.editModeEnabled){
				var mouseY = graph.h - graphPanel.mouse().y;
				
				if (graph.labelPrompt){
					var label = prompt("Enter a label for the data", "defaultLabel"+graphCollection.defaultLabel);
					
					var dupFlag = false;
					graphCollection.worksheet.data[graph.yData].forEach(function(d){
						if (d.label == label){
							dupFlag = true;
							alert("The label "+label+" is already used in "+graph.yData);
						}
					});
					
					if (!dupFlag){
						graphCollection.worksheet.data[graph.yData].push(
							{"label": label,
							 "value": graph.y.invert(mouseY)}
						);
						graphCollection.editData(graph.yData,graph.yData,graphCollection.worksheet.data[graph.yData]);
						
						if (!graphCollection.labelColors.hasOwnProperty(label))
							graphCollection.labelColors[label] = graphCollection.colorScale(parseInt(Math.random()*20));
						
						if (label == "defaultLabel"+graphCollection.defaultLabel)
							graphCollection.defaultLabel++;
					}
				} else {
					graphCollection.worksheet.data[graph.yData].push(
						{"label": "defaultLabel"+graphCollection.defaultLabel,
						 "value": graph.y.invert(mouseY)}
					);
					graphCollection.editData(graph.yData,graph.yData,graphCollection.worksheet.data[graph.yData]);
					
					if (!graphCollection.labelColors.hasOwnProperty("defaultLabel"+graphCollection.defaultLabel))
							graphCollection.labelColors["defaultLabel"+graphCollection.defaultLabel] = graphCollection.colorScale(parseInt(Math.random()*20));
					
					graphCollection.defaultLabel++;
				}
				vis.render();
			}
		} else {
			dragging = false;
		}
	});
	
	/* Number of datapoints N */
	graphPanel.add(pv.Label)
		.left(function(){return graph.w / 2})
		.top(0)
		.textAlign("center")
		.textAngle(0)
		.text(function(){return "N = " + graph.data[graph.yData].length})
		.font("bold 14px sans-serif");

	/* Y-axis ticks */
	graphPanel.add(pv.Rule)
		.data(function() { return graph.y.ticks() })
		.bottom(function(d) {return graph.y(d)})
		.strokeStyle(function(){
			if(graphCollection.editModeEnabled)
				return pv.rgb(255,0,0,0.25);
			else
				return "#ddd";
		})
		.anchor("left").add(pv.Label)
		  .text(function(d) {return d.toFixed(1)})
		  .font(function(){return "bold "+graphCollection.tickTextSize+"px sans-serif"})
		  //.visible(function(){return this.index % 2 == 0})
		  
	/* Y-axis line */
	graphPanel.add(pv.Rule)
		.left(0)
		.strokeStyle(function(){
			if(graphCollection.editModeEnabled)
				return "red";
			else
				return "#000";
		})
	
	//Mouse position label for drag editing
	var dragLabel = graphPanel.add(pv.Label)
		.visible(false)
		.font(fontString)
		.textAlign("center")
		.text("0")
	
	/* Dots */	
	graphPanel.add(pv.Dot)
		.data(function() {return yDistributionPoints(graph)})
		.left(function(d) {return d.x})
		.bottom(function(d) {return d.y})
		.radius(function() {return graphCollection.dotSize})
		.fillStyle(function(d) {return pointFillStyle(d.label)})
		.strokeStyle(function(d) {return pointStrokeStyle(d.label)})
		.title(function(d) { return d.label + ", " + graph.y.invert(d.y).toFixed(1) })
		.cursor(function(){
			if (graphCollection.editModeEnabled)
				return "move";
			else
				return "default";
		})
		.visible(function(d) {
			return graph.showData  && 
				d.x <= graph.w &&
				d.y <= graph.h &&
				d.y >= 0;
		})
		.event("mousedown", pv.Behavior.drag())
		.event("drag", function(d){  
			if (graphCollection.editModeEnabled &&
					graphPanel.mouse().x >= 0 &&
					graphPanel.mouse().x <= graph.w &&
					graphPanel.mouse().y >= 0 &&
					graphPanel.mouse().y <= graph.h){
				
				graphCollection.editSinglePoint(graph.yData, d.label, graph.y.invert(graph.h - graphPanel.mouse().y));
				
				dragLabel.text(graph.y.invert(graph.h - graphPanel.mouse().y).toFixed(1));
				dragLabel.left(graphPanel.mouse().x)
				dragLabel.top(graphPanel.mouse().y - 10)
				dragLabel.visible(true)
				
				vis.render();
			} else {
				dragLabel.text("Delete");
				vis.render();
			}
		})
		.event("dragend",function(d){
			if (graphCollection.editModeEnabled){
				var newYData = graphCollection.worksheet.data[graph.yData];
				var remIndex = null;
				newYData.forEach(function(data, index){
					if (data.label == d.label && 
					(graphPanel.mouse().x < 0 ||
					 graphPanel.mouse().x > graph.w ||
					 graphPanel.mouse().y < 0 ||
					 graphPanel.mouse().y > graph.h))
					{
						remIndex = index;
					}
				});
				if (remIndex != null)
					newYData.splice(remIndex,1);
				graphCollection.editData(graph.yData,graph.yData,newYData);
				
				dragLabel.visible(false);
				
				vis.render();
			}
		})
		.event("touchstart", function(d){
			touch.dragType = "dataY";
			touch.dataObj = d;
			touch.dragging = true;
			touch.graphIndex = index;
			touch.graphPanel = graphPanel;
			touch.dragLabel = dragLabel;
		})
		
	//Graph Overflow Warning Message
	graphPanel.add(pv.Label)
		.text("Warning! Data points lie outside graph boundaries.")
		.textStyle("red")
		.font(fontString)
		.top(35)
		.left(function(){return graph.w/2})
		.textAlign("center")
		.visible(function(){
			var retVal = false;
			yDistributionPoints(graph).forEach(function(d){
				if (d.x > graph.w ||
						d.y < 0 ||
						d.y > graph.h)
					retVal = true;
			});
			return retVal;
		})
		
	vis.render();
}

function constructLegendPanel(graph, index){	
	//Y-Axis Horizontal
	if (graph.twoDistView && graph.xData != null && graph.yData != null){
		$('body').prepend("<div class=\"axisDef\" id=\"YAxisHorizontal"+index+"\""+
										"onmouseover=\"this.className='axisOver'\""+
										"onmouseout=\"this.className='axisDef'\""+
										"onmousedown=\"javascript:legPanDragStart(event,'"+graph.yData+"',"+index+",'y')\">"+
										"<center><p style=\"margin-top:11px;\">"+graph.yData+"</p></center>"+
										"</div>");
	}
	//Y-Axis
	else {
		$('body').prepend("<div class=\"axisDef\" id=\"YAxis"+index+"\""+
											"onmouseover=\"this.className='axisOver'\""+
											"onmouseout=\"this.className='axisDef'\""+
											"onmousedown=\"javascript:legPanDragStart(event,'"+graph.yData+"',"+index+",'y')\">"+
											"<center><p style=\"margin-top:14px;\">"+graph.yData+"</p></center>"+
											"</div>");
	}
	//X-Axis
	$('body').prepend("<div class=\"axisDef\" id=\"XAxis"+index+"\""+
										"onmouseover=\"this.className='axisOver'\""+
										"onmouseout=\"this.className='axisDef'\""+
										"onmousedown=\"javascript:legPanDragStart(event,'"+graph.xData+"',"+index+",'x')\">"+
										"<center><p style=\"margin-top:12px;\">"+graph.xData+"</p></center>"+
										"</div>");
	
	
	positionAndSizeAxisPanels(graph,index);
}

function xAxisDragEnd(event, index){
	console.log("xAxis");
	if (dragObj.dragging){
		graphCollection.graphs[index].assignX(dragObj.category);
	}
	
}

function positionAndSizeAxisPanels(graph,index){
	$('#YAxisHorizontal'+index).css('position', 'absolute')
															.css('left', $('span').offset().left + 
																						graphCollection.padLeft +
																						60 + index * graph.w + index * 130 )
															.css('top', $('span').offset().top + 
																						graphCollection.padTop +
																						graph.h/2+20 )
															.css('height', 40+"px")
															.css('width', graph.w+"px")
															.css('z-index', 1)
															
	$('#YAxis'+index).css('position', 'absolute')
										.css('left', $('span').offset().left - (graph.h-40)/2 +
													index * graph.w + index * 132 + 2)
										.css('top', $('span').offset().top + graphCollection.padTop+40 + (graph.h-40)/2)
										.css('height', 40+"px")
										.css('width', graph.h+"px")
										.css("-webkit-transform", "rotate(90deg)") 
										.css("-moz-transform", "rotate(90deg)")	
										.css('z-index', 1)
															
	$('#XAxis'+index).css('position', 'absolute')
										.css('left', $('span').offset().left + 
																	graphCollection.padLeft +
																	60 + index * graph.w + index * 130 )
										.css('top', $('span').offset().top + 
																	graphCollection.padTop +
																	graph.h + 60 - 1)
										.css('height', 40+"px")
										.css('width', graph.w+"px")
										.css('z-index', 1)
}

function positionAndSizeGraph(){
	if (graphCollection.datasetsMenuShowing){
		$('span').css('position', 'absolute')
						 .css('left',$('#datasets').width()+29)
						 .css('z-index', -1);
		graphCollection.setW(graphCollection.calcGraphWidth());
	} else {
		$('span').css('position', 'absolute')
						 .css('left',8)
						 .css('z-index', -1);
		graphCollection.setW(graphCollection.calcGraphWidth());
	}
}

var dragObj;
function sidePanDragStart(event, category){
	event.preventDefault();
	
	//To prevent a touch event from firing an additional drag event
	if (touch.touch) {
		touch.touch = false;
		return;
	}
	
	//console.log("sideStart");
	dragObj = new Object();
	dragObj.category = category;
	dragObj.type = "side";
	dragObj.dragging = true;
	
	$('#dragFeedback').html(category);
	$('#dragFeedback').show();
	$('#dragFeedback').css('position', 'absolute')
								 .css('left',event.pageX)
								 .css('top',event.pageY)
								 .css('z-index', 10000);
	
	document.body.style.cursor="move";
	document.addEventListener("mousemove", sidePanDragGo,   true);
	document.addEventListener("mouseup",   sidePanDragStop, true);
}

function sidePanDragGo(event){
	event.preventDefault();
	$('#dragFeedback').css('position', 'absolute')
								 .css('left',event.pageX)
								 .css('top',event.pageY)
								 .css('z-index', 10);
								 
	var curX = event.pageX;
	var curY = event.pageY;
								 
	for (var i=0; i<graphCollection.graphs.length; i++){
		var graph = graphCollection.graphs[i]; 
		if (curX - $('#XAxis'+i).offset().left >= 0 &&
				curX - $('#XAxis'+i).offset().left <= graph.w &&
				curY - $('#XAxis'+i).offset().top >= 0 &&
				curY - $('#XAxis'+i).offset().top <= 40)
		{
			$('#XAxis'+i).attr('class','axisOver');
		} else {
			$('#XAxis'+i).attr('class','axisDef');
		}
		
		if (graph.twoDistView && graph.xData != null && graph.yData != null){
			if (curX - ($('#YAxisHorizontal'+i).offset().left) >= 0 &&
					curX - ($('#YAxisHorizontal'+i).offset().left) <= graph.w &&
					curY - ($('#YAxisHorizontal'+i).offset().top) >= 0 &&
					curY - ($('#YAxisHorizontal'+i).offset().top) <= 40)
			{
				$('#YAxisHorizontal'+i).attr('class','axisOver');
			} else {
				$('#YAxisHorizontal'+i).attr('class','axisDef');
			}
		} 
		else {
			if (curX - ($('#YAxis'+i).offset().left) >= 0 &&
					curX - ($('#YAxis'+i).offset().left) <= 40 &&
					curY - ($('#YAxis'+i).offset().top) >= 0 &&
					curY - ($('#YAxis'+i).offset().top) <= graph.h)
			{
				$('#YAxis'+i).attr('class','axisOver');
			} else {
				$('#YAxis'+i).attr('class','axisDef');
			}
		}
	}
}

function sidePanDragStop(event){
	$('#dragFeedback').hide();
	
	var curX = event.pageX;
	var curY = event.pageY;
	
	for (var i=0; i<graphCollection.graphs.length; i++){	
		var graph = graphCollection.graphs[i];			 
		if (curX - $('#XAxis'+i).offset().left >= 0 &&
				curX - $('#XAxis'+i).offset().left <= graph.w &&
				curY - $('#XAxis'+i).offset().top >= 0 &&
				curY - $('#XAxis'+i).offset().top <= 40)
		{
			graph.assignX(dragObj.category);
			constructVis();
		}
		
		if (graph.twoDistView && graph.xData != null && graph.yData != null){
			if (curX - ($('#YAxisHorizontal'+i).offset().left) >= 0 &&
					curX - ($('#YAxisHorizontal'+i).offset().left) <= graph.w &&
					curY - ($('#YAxisHorizontal'+i).offset().top) >= 0 &&
					curY - ($('#YAxisHorizontal'+i).offset().top) <= 40)
			{
				graph.assignY(dragObj.category);
				constructVis();
			}
		} 
		else {
			if (curX - ($('#YAxis'+i).offset().left) >= 0 &&
					curX - ($('#YAxis'+i).offset().left) <= 80 &&
					curY - ($('#YAxis'+i).offset().top) >= 0 &&
					curY - ($('#YAxis'+i).offset().top) <= graph.h)
			{
				graph.assignY(dragObj.category);
				constructVis();
			}
		}
	}
	
	dragObj.dragging = false;
	
	
	document.body.style.cursor="default";
	document.removeEventListener("mousemove", sidePanDragGo,   true);
	document.removeEventListener("mouseup",   sidePanDragStop, true);
}

function legPanDragStart(event, category, index, axis){
	if (touch.touch){
		touch.touch = false;
		return;
	}
	
	event.preventDefault();
	
	dragObj = new Object();
	dragObj.category = category;
	dragObj.fromGraph = index;
	dragObj.fromAxis = axis;
	$('#dragFeedback').html(category);
	$('#dragFeedback').show();
	$('#dragFeedback').css('position', 'absolute')
								 .css('left',event.pageX)
								 .css('top',event.pageY)
								 .css('z-index', 10);
	
	document.body.style.cursor="move";
	document.addEventListener("mousemove", legPanDragGo,   true);
	document.addEventListener("mouseup",   legPanDragStop, true);
}

function legPanDragGo(event){
	event.preventDefault();
	$('#dragFeedback').css('position', 'absolute')
								 .css('left',event.pageX)
								 .css('top',event.pageY)
								 .css('z-index', 10000);
	
	var curX = event.pageX;
	var curY = event.pageY;
								 
	for (var i=0; i<graphCollection.graphs.length; i++){
		var graph = graphCollection.graphs[i];				 
		if (curX - $('#XAxis'+i).offset().left >= 0 &&
				curX - $('#XAxis'+i).offset().left <= graph.w &&
				curY - $('#XAxis'+i).offset().top >= 0 &&
				curY - $('#XAxis'+i).offset().top <= 40)
		{
			$('#XAxis'+i).attr('class','axisOver');
		} else {
			$('#XAxis'+i).attr('class','axisDef');
		}
		
		if (graph.twoDistView && graph.xData != null && graph.yData != null){
			if (curX - ($('#YAxisHorizontal'+i).offset().left) >= 0 &&
					curX - ($('#YAxisHorizontal'+i).offset().left) <= graph.w &&
					curY - ($('#YAxisHorizontal'+i).offset().top) >= 0 &&
					curY - ($('#YAxisHorizontal'+i).offset().top) <= 40)
			{
				$('#YAxisHorizontal'+i).attr('class','axisOver');
			} else {
				$('#YAxisHorizontal'+i).attr('class','axisDef');
			}
		} 
		else {
			if (curX - ($('#YAxis'+i).offset().left) >= 0 &&
					curX - ($('#YAxis'+i).offset().left) <= 40 &&
					curY - ($('#YAxis'+i).offset().top) >= 0 &&
					curY - ($('#YAxis'+i).offset().top) <= graph.h)
			{
				$('#YAxis'+i).attr('class','axisOver');
			} else {
				$('#YAxis'+i).attr('class','axisDef');
			}
		}
	}
}

function legPanDragStop(event){
	$('#dragFeedback').hide();
	
	var curX = event.pageX;
	var curY = event.pageY;
	
	var visX = event.pageX -
						 $('span').offset().left -
						 graphCollection.padLeft + 40;
							
	var visY = event.pageY - 
						 $('span').offset().top - 
						 graphCollection.padTop;
	
	if (visX > 0 && 
			visX < graphCollection.w+graphCollection.padRight && 
			visY > 0 && 
			visY < graphCollection.h+graphCollection.padBot)
	{
		for (var i=0; i<graphCollection.graphs.length; i++){
			var graph = graphCollection.graphs[i];
			if (curX - $('#XAxis'+i).offset().left >= 0 &&
					curX - $('#XAxis'+i).offset().left <= graph.w &&
					curY - $('#XAxis'+i).offset().top >= 0 &&
					curY - $('#XAxis'+i).offset().top <= 40)
			{
				var tempX = graph.xData;
				graph.assignX(dragObj.category);
				if (dragObj.fromAxis == 'y'){
					if (dragObj.fromGraph == i)
						graphCollection.graphs[dragObj.fromGraph].assignY(tempX);
					else
						graphCollection.graphs[dragObj.fromGraph].assignY(null);
				}else if (dragObj.fromGraph != i){
					graphCollection.graphs[dragObj.fromGraph].assignX(null);
				}
				constructVis();
			}
			
			if (graph.twoDistView && graph.xData != null && graph.yData != null){
				if (curX - ($('#YAxisHorizontal'+i).offset().left) >= 0 &&
						curX - ($('#YAxisHorizontal'+i).offset().left) <= graph.w &&
						curY - ($('#YAxisHorizontal'+i).offset().top) >= 0 &&
						curY - ($('#YAxisHorizontal'+i).offset().top) <= 40)
				{
					var tempY = graph.yData;
					graph.assignY(dragObj.category);
					if (dragObj.fromAxis == 'y' && dragObj.fromGraph != i){
						graphCollection.graphs[dragObj.fromGraph].assignY(null);
					} else {
						if (dragObj.fromGraph == i)
							graphCollection.graphs[dragObj.fromGraph].assignX(tempY);
						else
							graphCollection.graphs[dragObj.fromGraph].assignX(null);
					}
					constructVis();
				}
			} 
			else {
				if (curX - ($('#YAxis'+i).offset().left) >= 0 &&
						curX - ($('#YAxis'+i).offset().left) <= 80 &&
						curY - ($('#YAxis'+i).offset().top) >= 0 &&
						curY - ($('#YAxis'+i).offset().top) <= graph.h)
				{
					var tempY = graph.yData;
					graph.assignY(dragObj.category);
					if (dragObj.fromAxis == 'y' && dragObj.fromGraph != i){
						graphCollection.graphs[dragObj.fromGraph].assignY(null);
					} else {
						if (dragObj.fromGraph == i)
							graphCollection.graphs[dragObj.fromGraph].assignX(tempY);
						else
							graphCollection.graphs[dragObj.fromGraph].assignX(null);
					}
					constructVis();
				}
			}
		}
	} else {
		if (dragObj.fromAxis == 'y')
			graphCollection.graphs[dragObj.fromGraph].assignY(null);
		else
			graphCollection.graphs[dragObj.fromGraph].assignX(null);
		constructVis();
	}
	
	document.body.style.cursor="default";
	document.removeEventListener("mousemove", legPanDragGo,   true);
	document.removeEventListener("mouseup",   legPanDragStop, true);
}
