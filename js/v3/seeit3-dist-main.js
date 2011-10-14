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


// Populate dataset drop down menu
var lastSelectedWorksheet; 
var numWorksheetsLoaded = 0;
jQuery('body').bind('WorksheetLoaded', function(event) {
	if ($('#workSheetSelector option[value='+event.worksheet.URL+']').length == 0){
		jQuery('#workSheetSelector').prepend(jQuery("<option value='" + 
																					event.worksheet.URL + 
																					"'>" + 
																					event.worksheet.title + 
																					" by " + 
																					event.worksheet.labelType + 
																					"</option>"))
																.val(event.worksheet.URL);
		graphCollection.addWorksheet(event.worksheet);
	}
	
	if (event.refresh){
		graphCollection.addWorksheet(event.worksheet);
	}
	
  lastSelectedWorksheet = event.worksheet.URL;
  numWorksheetsLoaded++;
  if (numWorksheetsLoaded >= numWorksheets){
		jQuery('p#loadingMsg').hide();
		constructVis();
		positionGroupingMenuOverGraph(0,graphCollection);
		positionDisplayMenu();
  }
});


function constructVis(){
	jQuery('span').remove();

	vis = new pv.Panel()
		.width(function(){return graphCollection.w})
		.height(function(){return graphCollection.h})
		.bottom(function(){return graphCollection.padBot})
		.left(function(){return graphCollection.padLeft})
		.right(function(){return graphCollection.padRight})
		.top(function(){return graphCollection.padTop})
	
	/* Divider Between Graphs and Data Sets */
	//vis.add(pv.Rule)
	//	.left(-35)
	//	.bottom(0)
	//	.top(graphCollection.padTop * -1)
		
	/*Divider Between Top Graph and Title*/
	vis.add(pv.Rule)
		.top(-1)
		.right(-25)
		.left(-35)
		.lineWidth(function(){
			if (graphCollection.editModeEnabled)
				return 2;
			else
				return 1;
		})
		.strokeStyle(function(){
			if (graphCollection.editModeEnabled)
				return "red"
			else
				return "black"
		})
	
	/*Graph Title*/		  
	//vis.add(pv.Label)
	//	.left(function(){return graphCollection.w / 2})
	//	.top(-5)
	//	.textAlign("center")
	//	.textAngle(0)
	//	.text(graphCollection.worksheet.title + " by " +graphCollection.worksheet.labelType)
	//	.font("bold 20px sans-serif");
	
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
		.top(-31)
		.lineWidth(1)
		.event("click", function(){
			if (!graphCollection.datasetsMenuShowing){
				$('#datasets').show();
				graphCollection.datasetsMenuShowing = true;
				graphCollection.setW(graphCollection.calcGraphWidth());
				vis.render();
				$('span').css('position', 'absolute')
								 .css('left',$('#datasets').width()+29)
								 .css('z-index', -1);
				positionGroupingMenuOverGraph(graphCollection.selectedGraphIndex, graphCollection);
				positionDisplayMenu();
			} else {
				$('#datasets').hide();
				graphCollection.datasetsMenuShowing = false;
				graphCollection.setW(graphCollection.calcGraphWidth());
				vis.render();
				$('span').css('position', 'absolute')
								 .css('left',8)
								 .css('z-index', -1);
				positionGroupingMenuOverGraph(graphCollection.selectedGraphIndex, graphCollection);
				positionDisplayMenu();
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
		.event("click", function(){
			if (!graphCollection.datasetsMenuShowing){
				$('#datasets').show();
				graphCollection.datasetsMenuShowing = true;
				graphCollection.setW(graphCollection.calcGraphWidth());
				vis.render();
				$('span').css('position', 'absolute')
								 .css('left',$('#datasets').width()+29)
								 .css('z-index', -1);
				positionGroupingMenuOverGraph(graphCollection.selectedGraphIndex, graphCollection);
				positionDisplayMenu();
			} else {
				$('#datasets').hide();
				graphCollection.datasetsMenuShowing = false;
				graphCollection.setW(graphCollection.calcGraphWidth());
				vis.render();
				$('span').css('position', 'absolute')
								 .css('left',8)
								 .css('z-index', -1);
				positionGroupingMenuOverGraph(graphCollection.selectedGraphIndex, graphCollection);
				positionDisplayMenu();
			}
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
				return 70;
			}else if (!graphCollection.buttonIcon){
				return 35;
			}else if (!graphCollection.buttonText){
				return 4;
			}
		})
		.top(-31)
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
			.top(15)
			.text("Display Options")
			.font(fontString)
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
		.title("Add a new empty graph")
		.height(30)
		.width(function() {
			if (graphCollection.buttonIcon && graphCollection.buttonText){ 
				return 115;
			}else if (!graphCollection.buttonIcon){
				return 85;
			}else if (!graphCollection.buttonText){
				return 34;
			}
		})
		.left(function() {
			if (graphCollection.buttonIcon && graphCollection.buttonText){ 
				return 225;
			}else if (!graphCollection.buttonIcon){
				return 155;
			}else if (!graphCollection.buttonText){
				return 45;
			}
		})
		.top(-31)
		.lineWidth(1)
		.event("click", function(){
			graphCollection.addGraph();
			//vis.render();
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
		.url("http://centerforbiophotonics.github.com/SeeIt3/img/newGraph.png")  //fix this
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
			.top(15)
			.text("New Graph")
			.font(fontString)
			.visible(function() {
				if (graphCollection.buttonText)
					return true;
				else
					return false;
			})
			
	/*Toggle Basic/Advanced User Mode*/
	var togUserModePanel = vis.add(pv.Panel)
		.events("all")
		.cursor("pointer")
		.title("Toggle advanced mode")
		.height(30)
		.width(function() {
			if (graphCollection.buttonIcon && graphCollection.buttonText){ 
				return 150;
			}else if (!graphCollection.buttonIcon){
				return 122;
			}else if (!graphCollection.buttonText){
				return 34;
			}
		})
		.left(function() {
			if (graphCollection.buttonIcon && graphCollection.buttonText){ 
				return 340;
			}else if (!graphCollection.buttonIcon){
				return 240;
			}else if (!graphCollection.buttonText){
				return 80;
			}
		})
		.top(-31)
		.lineWidth(1)
		.event("click", function(){
			graphCollection.advancedUser = !(graphCollection.advancedUser);
			showHideAdvancedOptions();
		})
		.event("mouseover", function(d){
			this.strokeStyle("black");
			this.render();
		})
		.event("mouseout", function(d){ 
			this.strokeStyle(pv.rgb(0,0,0,0));
			this.render();
		})
		
	togUserModePanel.add(pv.Image)
		.url(function(){
			if (graphCollection.advancedUser)
				return "http://centerforbiophotonics.github.com/SeeIt3/img/advModeON.png"
			else
				return "http://centerforbiophotonics.github.com/SeeIt3/img/advModeOFF.png"
		})
		.width(30)
		.height(26)
		.top(2)
		.left(0)
		.cursor("pointer")
		.title("Toggle basic/advanced mode")
		.event("click", function(){
			graphCollection.advancedUser = !(graphCollection.advancedUser);
			showHideAdvancedOptions();
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
			.text(function(){return "Advanced Mode"})
			.textStyle(function(){
				if (graphCollection.advancedUser)
					return "red"
				else
					return "grey"
			})
			.font(fontString)
			.visible(function() {
				if (graphCollection.buttonText)
					return true;
				else
					return false;
			})
			
			
	/*Toggle Basic/Advanced User Mode*/
	//var togUserModePanel = vis.add(pv.Panel)
	//	.events("all")
	//	.cursor("pointer")
	//	.title("Toggle basic/advanced mode")
	//	.height(30)
	//	.width(function() {
	//		if (graphCollection.buttonIcon && graphCollection.buttonText){ 
	//			if (graphCollection.advancedUser)
	//				return 150;
	//			else
	//				return 142;
	//		}else if (!graphCollection.buttonIcon){
	//			if (graphCollection.advancedUser)
	//				return 122;
	//			else
	//				return 115;
	//		}else if (!graphCollection.buttonText){
	//			return 34;
	//		}
	//	})
	//	.left(function() {
	//		if (graphCollection.buttonIcon && graphCollection.buttonText){ 
	//			return 340;
	//		}else if (!graphCollection.buttonIcon){
	//			return 240;
	//		}else if (!graphCollection.buttonText){
	//			return 80;
	//		}
	//	})
	//	.top(-31)
	//	.lineWidth(1)
	//	.event("click", function(){
	//		graphCollection.advancedUser = !(graphCollection.advancedUser);
	//		if (graphCollection.advancedUser){
	//			$('#fixedSizeOptions').show();
	//			$('#fixedIntervalOptions').show();
	//			$('#boxPlotOptions').show();
	//			$('#scaleOptions').show();
	//			$('#divisionsCell').show();
	//			$('#stackAndButtonTable').show();
	//		} else {
	//			$('#fixedSizeOptions').hide();
	//			$('#fixedIntervalOptions').hide();
	//			$('#boxPlotOptions').hide();
	//			$('#scaleOptions').hide();
	//			$('#divisionsCell').hide();
	//			$('#stackAndButtonTable').hide();
	//			
	//			graphCollection.graphs.forEach(function(g){
	//			g.groupingMode = "NoGroups";
	//			});
	//			graphCollection.updateMenuOptions();
	//		}
	//		vis.render();
	//	})
	//	.event("mouseover", function(d){
	//		this.strokeStyle("black");
	//		this.render();
	//	})
	//	.event("mouseout", function(d){ 
	//		this.strokeStyle(pv.rgb(0,0,0,0));
	//		this.render();
	//	})
	//	
	//togUserModePanel.add(pv.Image)
	//	.url(function(){
	//		if (graphCollection.advancedUser)
	//			return "http://centerforbiophotonics.github.com/SeeIt3/img/advUser.png"
	//		else
	//			return "http://centerforbiophotonics.github.com/SeeIt3/img/user.png"
	//	})
	//	.width(30)
	//	.height(26)
	//	.top(2)
	//	.left(0)
	//	.cursor("pointer")
	//	.title("Toggle basic/advanced mode")
	//	.event("click", function(){
	//		graphCollection.advancedUser = !(graphCollection.advancedUser);
	//		vis.render();
	//	})
	//	.visible(function() {
	//		if (graphCollection.buttonIcon)
	//			return true;
	//		else
	//			return false;
	//	})
	//	.anchor("left").add(pv.Label)
	//		.left(function(){
	//			if (graphCollection.buttonText && !graphCollection.buttonIcon)
	//				return 2;
	//			else
	//			 return 32;
	//		})
	//		.text(function(){
	//			if (graphCollection.advancedUser)
	//				return "Advanced Mode"
	//			else
	//				return "Beginner Mode"
	//		})
	//		.font(fontString)
	//		.textStyle(function(){
	//			if (graphCollection.editModeEnabled)
	//				return "red"
	//			else
	//				return "black"
	//		})
	//		.visible(function() {
	//			if (graphCollection.buttonText)
	//				return true;
	//			else
	//				return false;
	//		})
		
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
				return 490;
			}else if (!graphCollection.buttonIcon){
				return 362;
			}else if (!graphCollection.buttonText){
				return 114;
			}
		})
		.top(-31)
		.lineWidth(1)
		.visible(function() {
			if (graphCollection.advancedUser)
				return true;
			else
				return false;
		})
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
	
	//Fit all graphs to scale button
	var fitScalePanel = vis.add(pv.Panel)
		.events("all")
		.cursor("pointer")
		.title("Scale all graphs identically")
		.height(30)
		.width(function() {
			if (graphCollection.buttonIcon && graphCollection.buttonText){ 
				return 105;
			}else if (!graphCollection.buttonIcon){
				return 75;
			}else if (!graphCollection.buttonText){
				return 32;
			}
		})
		.left(function() {
			if (graphCollection.buttonIcon && graphCollection.buttonText){ 
				return 600;
			}else if (!graphCollection.buttonIcon){
				return 442;
			}else if (!graphCollection.buttonText){
				return 148;
			}
		})
		.top(-31)
		.lineWidth(1)
		.visible(function() {
			if (graphCollection.advancedUser)
				return true;
			else
				return false;
		})
		.event("click", function(){
			graphCollection.graphs.forEach(function(graph){
				graph.customScale = false;
				graph.fitScaleToData = false;
			});
			graphCollection.scaleAllGraphsToFit();
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
		
	fitScalePanel.add(pv.Image)
		.url(function(){
			return "http://centerforbiophotonics.github.com/SeeIt3/img/ruler.png"
		})
		.width(30)
		.height(30)
		.top(1)
		.left(0)
		.cursor("pointer")
		.title("Scale all graphs identically.")
		.event("click", function(){
			graphCollection.graphs.forEach(function(graph){
				graph.customScale = false;
				graph.fitScaleToData = false;
			});
			graphCollection.scaleAllGraphsToFit();
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
			.text("Fit Scales")
			.font(fontString)
			.textStyle(function(){return "black"})
			.visible(function() {
				if (graphCollection.buttonText)
					return true;
				else
					return false;
			})
	
	//constructCategoryPanel();
	constructDatasetPanel();
	
	
	graphCollection.graphs.forEach(function(graph,index,graphs){
		constructGraphPanel(graph, index);
	});
	vis.render();
	if (graphCollection.datasetsMenuShowing) resizeVis();
	//positionGroupingMenuOverGraph(graphCollection.selectedGraphIndex, graphCollection);
	showHideAdvancedOptions();
}

function constructDatasetPanel(){
	var html = "";
	var i = 0;
	exampleSpreadsheets.forEach(function(s){
		s.worksheets.forEach(function(w){
			html += "<table><tr>"+
							"<td><input type='image' id='subtreeToggle"+i+"' src='img/downTriangle.png' onclick='toggleDataSubtree(\"subtree"+i+"\","+i+")' width='15' height='15'></td>"+
							"<td nowrap><div id='treeTitle"+i+"' onclick='toggleDataSubtree(\"subtree"+i+"\","+i+")'>"+w.title+"</div></td>"+
							"<td><input type='image' src='img/edit.png' onclick='toggleDataSubtree(\"subtree"+i+"\","+i+")' width='25' height='25'></td>"+
							"<td><input type='image' src='img/refresh.png' onclick='refreshWorksheet(\""+w.title+"\")' width='25' height='25'></td>"+
							"<td><input type='image' src='img/question.png' onclick='showWorksheetDescription(\""+w.title+"\")' width='30' height='30'></td>"+
							"<td><input type='image' src='img/document.png' onclick='editInGoogleDocs(\""+w.title+"\")' width='25' height='25'></td>"+
							"</table></tr>";
			html += "<div id='subtree"+i+"'>";
			for (key in w.data){
				
				var color = graphCollection.categoryColors[key];
				html+="<table style='margin-left:15px;'><tr><td>"+
							"<input class='color {hash:false}' value='"+colorToHex(color.color)+"' onchange=\"updateColor('"+key.trim()+"', this.color)\" style='width:20px; height:20px'></td>"+
							"<td><div id=\""+convertToID(key)+"\" class='menuItemDef'"+ 
							"style=\"color:"+(w.edited[key]?'red':'black')+";\""+
							"onmouseover=\"this.className='menuItemOver'\""+
							"onmouseout=\"this.className='menuItemDef'\""+
							"onmousedown=\"javascript:dragStart(event,'"+key+"')\">"+
							key+"</div></td></tr></table>";
			}
							
			html += "</div>";
			i++;
		})
	})
	html+="<table><tr><td><input type='image' src='img/plus.png' onclick='openEditDataMenu(\""+key+
							"\");' width='25' height='25'></td><div><td>"+
							"</td><td>Add a Worksheet</td></div></tr></table>";
	$('#dataTree').html(html);
	jscolor.init();
}

var dragObj;
function dragStart(event, category){
	//console.log(event);
	event.preventDefault();
	
	dragObj = new Object();
	dragObj.category = category;
	$('#dragFeedback').html(category);
	$('#dragFeedback').show();
	$('#dragFeedback').css('position', 'absolute')
								 .css('left',event.x)
								 .css('top',event.y)
								 .css('z-index', 10000);
								 
	document.addEventListener("mousemove", dragGo,   true);
	document.addEventListener("mouseup",   dragStop, true);
}

function dragGo(event){
	$('#dragFeedback').css('position', 'absolute')
								 .css('left',event.x)
								 .css('top',event.y)
								 .css('z-index', 10000);
}

function dragStop(event){
	$('#dragFeedback').hide();
	
	var curX = event.x -
						 $('span').offset().left -
						 graphCollection.padLeft + 14;
							
	var curY = event.y - 
						 $('span').offset().top - 
						 graphCollection.padTop;
						 
	if(curX > 0 && curX < graphCollection.w && curY > 0 && curY < graphCollection.h){
		if (graphCollection.graphs.length > 4){
			var which = parseInt(curY/graphCollection.defaultGraphHeight);
			graphCollection.graphs[which].addCategory(dragObj.category);
			graphCollection.updateMenuOptions();
		} else {
			var which = parseInt(curY/(graphCollection.h/graphCollection.graphs.length));
			graphCollection.graphs[which].addCategory(dragObj.category);
			graphCollection.updateMenuOptions();
		}
	}
	constructVis();
	
	document.removeEventListener("mousemove", dragGo,   true);
	document.removeEventListener("mouseup",   dragStop, true);
}
		  
function constructCategoryPanel(){
	var row = 0;
	
	vis.add(pv.Label)
		.text("Data Sets:")
		.left(-197)
		.top(-40)
		.font(fontString);
	
	var dragFeedbackPanels = [];
	for (var key in graphCollection.worksheet.data){
		var abbrevKey = key.slice(0,14);
		if (key.length > 14)
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
				//vis.render();
			})
			.event("touchstart", function(event){
				touch.dragType = "sideCat"
				touch.draggedObj = dragFeedbackPanels[this.row()];
				touch.dragging = true;
				touch.dragCat = this.category();
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


function constructGraphPanel(graph, index){
		
	var graphPanel = vis.add(pv.Panel)
		.top(function(){return graph.h*index})
		.height(function(){return graph.h})
		.width(function(){return graph.w})
		.events("all")
		.event("click", function(){
			if (!dragging){
				var oldIndex = graphCollection.selectedGraphIndex;
				if (oldIndex != index){
					graphCollection.selectAUserDefPartition();
				}
				graphCollection.selectedGraphIndex = index;
				graphCollection.selectedLabel = null;
				graphCollection.updateMenuOptions();
				
				positionGroupingMenuOverGraph(index, graphCollection);
						
				hideMenus();
				if (graph.selectedCategory != null && graphCollection.editModeEnabled){
					var loc = graphPanel.mouse().x;
					
					
					graph.data[graph.selectedCategory].push(
						{"label": "default"+graph.nextDefaultLabel[graph.selectedCategory]++,
						 "value": graph.x.invert(loc)}
					);
					
					graphCollection.editData(graph.selectedCategory, graph.selectedCategory, graph.data[graph.selectedCategory]);
				} else if (graphCollection.editModeEnabled && 
										graph.includedCategories.length < 4 &&
										graph.includedCategories.length > 0) {
					var loc = graphPanel.mouse().x;
					
					var dataTitle = "userCreatedCategory"+graphCollection.nextDefaultCategory++;
					var data = [{"label":"first", "value":graph.x.invert(loc)}];
					
					graphCollection.addData(dataTitle, data);
					graph.addCategory(dataTitle);
					graph.selectedCategory = dataTitle;
				}
			
				constructVis();
			}
			dragging = false;
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
			hideMenus();
			$('#groupingOptions').slideDown();
		})
		
	//Copy to clipboard button
	//graphPanel.add(pv.Image)
	//	.url("http://centerforbiophotonics.github.com/SeeIt3/img/clipboard.png")  //fix this
	//	.width(30)
	//	.height(30)
	//	.top(4)
	//	.left(30)
	//	.cursor("pointer")
	//	.title("Copy data to clipboard.")
	//	.event("click", function(){
	//		$('#cbText').val(graph.toString());
	//		positionClipboardPrompt();
	//		hideMenus();
	//		$('#clipboardPrompt').slideDown();
	//		$('#cbText').focus();
	//		$('#cbText').select();
	//		$('#clipboardPrompt').scrollTop(0);
	//	
	//	})
				
	//Divider Line Between Graphs
	graphPanel.add(pv.Rule)
		.bottom(0)
		.left(-35)
		.right(-25)
		.lineWidth(function(){
			if (graphCollection.editModeEnabled)
				return 2;
			else
				return 1;
		})
		.strokeStyle(function(){
			if (graphCollection.editModeEnabled)
				return "red"
			else
				return "black"
		})
		
	graphPanel.add(pv.Rule)
		.left(-34)
		.bottom(0)
		.top(-2)
		.lineWidth(function(){
			if (graphCollection.editModeEnabled)
				return 2;
			else
				return 0;
		})
		.strokeStyle(function(){
			if (graphCollection.editModeEnabled)
				return "red"
			else
				return "black"
		})
		
	graphPanel.add(pv.Rule)
		.right(-25)
		.bottom(0)
		.top(0)
		.lineWidth(function(){
			if (graphCollection.editModeEnabled)
				return 2;
			else
				return 1;
		})
		.strokeStyle(function(){
			if (graphCollection.editModeEnabled)
				return "red"
			else
				return "black"
		})
	
	if (graph.includedCategories.length > 0){
		/* Number of datapoints N */
		graphPanel.add(pv.Label)
			.right(function() {return graph.w/2})
			.top(2)
			.textAlign("center")
			.textAngle(0)
			.textBaseline("top")
			.text(function(){return "N = " + graph.n})
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
				.event("touchstart", function(event){
					touch.dragType = "partitionCreate";
					touch.graphPanel = graphPanel;
					touch.graphIndex = index;
					touch.dragging = true;
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
				.title(function(d){return graph.x.invert(d.x).toFixed(1)})
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
				.event("touchstart", function(event){
					touch.dragType = "partitionMove";
					touch.partitionIndex = this.index;
					touch.graphPanel = graphPanel;
					touch.graphIndex = index;
					touch.dragging = true;
				})
			
		
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
				vis.render();
			}
		});
		
		/* Fixed Interval Width Partitions */
		graphPanel.add(pv.Rule)
			.data(function(){return partitionDataByIntervalWidth(graph)})
			.left(function(d){return graph.x(d)})
			.bottom(function(){return graph.baseLine})
			.height(function(){return graph.h * 0.75})
			.visible(function(){return graph.groupingMode == "FixedIntervalGroups"})
			.strokeStyle("green")
			.title(function(d){return d})
			.anchor("top").add(pv.Dot)
				.title(function(d){return d.toFixed(1)})
				.shape("square")
				.fillStyle("green")
				.strokeStyle("green")
				.size(4);
			
		/*Fixed Interval Width Partitions Size Labels*/
		graphPanel.add(pv.Label)
			.data(function(){return countDataInPartitions(graph,partitionDataByIntervalWidth(graph))})
			.textAlign("center")
			.textStyle("green")
			.bottom(function(){return graph.h * 0.70 + graph.baseLine})
			.left(function(){
				if (this.index != partitionDataByIntervalWidth(graph).length-1){
					return graph.x((partitionDataByIntervalWidth(graph)[this.index]+partitionDataByIntervalWidth(graph)[this.index+1])/2);
				} else return 0;
			})
			.visible(function(){
				return this.index != partitionDataByIntervalWidth(graph).length-1 &&
							 graph.groupingMode == "FixedIntervalGroups";
			});
			
		/* Fixed Interval Width Histogram */
		graphPanel.add(pv.Bar)
			.data(function(){return fiwHistogram(graph,partitionDataByIntervalWidth(graph))})
			.visible(function(d) { 
				return ( graph.groupingMode == "FixedIntervalGroups" &&
								 graph.histogram
								) 
			})
			.left(function(d){return d.left})
			.bottom(graph.baseLine)
			.height(function(d){return d.height})
			.width(function(d){return d.width})
			.lineWidth(0.5)
			.strokeStyle("green")
			.fillStyle(pv.rgb(0,225,0,0.25));
		
		/* Fixed Group Size Partitions */
		graphPanel.add(pv.Rule)
			.data(function(){return partitionDataInFixedSizeGroups(graph)})
			.left(function(d){return graph.x(d)})
			.bottom(function(){return graph.baseLine})
			.height(function(){return graph.h * 0.75})
			.visible(function(){return graph.groupingMode == "FixedSizeGroups"})
			.strokeStyle("green")
			.title(function(d){return d.toFixed(1)})
			.anchor("top").add(pv.Dot)
				.title(function(d){return d.toFixed(1)})
				.shape("square")
				.fillStyle("green")
				.strokeStyle("green")
				.size(4);
			
		/*Fixed Group Size Partition Labels*/
		graphPanel.add(pv.Label)
			.data(function(){return partitionDataInFixedSizeGroups(graph)})
			.textAlign("center")
			.textStyle("green")
			.bottom(function(){return graph.h * 0.70 + graph.baseLine})
			.left(function(){
				if (this.index != partitionDataInFixedSizeGroups(graph).length-1){
					return graph.x((partitionDataInFixedSizeGroups(graph)[this.index]+partitionDataInFixedSizeGroups(graph)[this.index+1])/2);
				} else return 0;
			})
			.visible(function(){
				return this.index != partitionDataInFixedSizeGroups(graph).length-1 &&
							 graph.groupingMode == "FixedSizeGroups";
			})
			.text(function(){
				if (graph.dataVals().length % graph.partitionGroupSize == 0 ||
						this.index != partitionDataInFixedSizeGroups(graph).length-2)
					return graph.partitionGroupSize;
				
				else return graph.dataVals().length % graph.partitionGroupSize;
				
			})
		
			
		/* Two Equal Partitions */
		graphPanel.add(pv.Rule)
			.data(function(){return partitionDataInTwo(graph)})
			.left(function(d){return graph.x(d)})
			.bottom(function(){return graph.baseLine})
			.height(function(){return graph.h * 0.75})
			.visible(function(){
				return graph.groupingMode == "TwoEqualGroups" &&
							 !graph.insufDataForTwo;
			})
			.strokeStyle("green")
			.title(function(d){return d.toFixed(1)})
			.anchor("top").add(pv.Dot)
				.title(function(d){return d.toFixed(1)})
				.shape("square")
				.fillStyle("green")
				.strokeStyle("green")
				.size(4);
				
		/*Two Partition Size Labels*/
		graphPanel.add(pv.Label)
			.data(function(){return partitionDataInTwo(graph)})
			.textAlign("center")
			.textStyle("green")
			.bottom(function(){return graph.h * 0.70 + graph.baseLine})
			.left(function(){
				if (this.index != partitionDataInTwo(graph).length-1){
					return graph.x((partitionDataInTwo(graph)[this.index]+partitionDataInTwo(graph)[this.index+1])/2);
				} else return 0;
			})
			.visible(function(){
				return this.index != partitionDataInTwo(graph).length-1 &&
							 graph.groupingMode == "TwoEqualGroups" &&
							 !graph.insufDataForTwo;
			})
			.text(function(){
				if (graph.dataVals().length % 2 == 0)
					return graph.dataVals().length/2;
				else if(this.index != partitionDataInTwo(graph).length-2)
					return Math.ceil(graph.dataVals().length/2);
				else
					return Math.floor(graph.dataVals().length/2);
				
			})
		
		/*Insufficient Data for Two Warning */	
		graphPanel.add(pv.Label)
			.text("Insufficient data.")
			.textStyle("red")
			.visible(function(){
				return graph.groupingMode == "TwoEqualGroups" &&
							 graph.insufDataForTwo;
			})
			.font(fontString)
			.top(35)
			.left(graph.w/2)
			.textAlign("center")
			
		
		/* Four Equal Partitions */
		graphPanel.add(pv.Rule)
			.data(function(){return partitionDataInFour(graph)})
			.left(function(d){return graph.x(d)})
			.bottom(function(){return graph.baseLine})
			.height(function(){return graph.h * 0.75})
			.visible(function(){return graph.groupingMode == "FourEqualGroups" &&
																 !graph.insufDataForFour;
			})
			.strokeStyle("green")
			.title(function(d){return d.toFixed(1)})
			.anchor("top").add(pv.Dot)
				.title(function(d){return d.toFixed(1)})
				.shape("square")
				.fillStyle("green")
				.strokeStyle("green")
				.visible(function(){return graph.groupingMode == "FourEqualGroups" &&
																	 !graph.insufDataForFour; 
				})
				.size(4);
				
		/*Four Partition Size Labels*/
		graphPanel.add(pv.Label)
			.data(function(){return countDataInPartitions(graph, partitionDataInFour(graph))})
			.textAlign("center")
			.textStyle("green")
			.bottom(function(){return graph.h * 0.70 + graph.baseLine})
			.left(function(){
				if (this.index != partitionDataInFour(graph).length-1){
					return graph.x((partitionDataInFour(graph)[this.index]+partitionDataInFour(graph)[this.index+1])/2);
				} else return 0;
			})
			.visible(function(){
				return this.index != partitionDataInFour(graph).length-1 &&
							graph.groupingMode == "FourEqualGroups" &&
							!graph.insufDataForFour;
			})
			.text(function(d){
				if (this.index != partitionDataInFour(graph).length-1){
					return d;
				} else return 0;
			})
		
		//Simple Box Plot Lines
		graphPanel.add(pv.Line)
			.data(function(){return [[partitionDataInFour(graph)[0], graph.baseLine],
						 [partitionDataInFour(graph)[0], graph.h * 0.80]]})
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.groupingMode == "BoxPlot" &&
																	 !graph.advBoxPlot &&
																	 !graph.insufDataForFour; 
			})

		graphPanel.add(pv.Line)
			.data(function(){return [[partitionDataInFour(graph)[4], graph.baseLine],
						 [partitionDataInFour(graph)[4], graph.h * 0.80]]})
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.groupingMode == "BoxPlot" &&
																	 !graph.advBoxPlot &&
																	 !graph.insufDataForFour; 
			})

		graphPanel.add(pv.Line)
			.data(function(){return [[partitionDataInFour(graph)[1], (graph.h-graph.baseLine) * 0.20 + graph.baseLine],
						 [partitionDataInFour(graph)[1], (graph.h-graph.baseLine) * 0.60 + graph.baseLine]]})
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.groupingMode == "BoxPlot" &&
																	 !graph.advBoxPlot &&
																	 !graph.insufDataForFour; 
		})

		graphPanel.add(pv.Line)
			.data(function(){return [[partitionDataInFour(graph)[2], (graph.h-graph.baseLine) * 0.20 + graph.baseLine],
						 [partitionDataInFour(graph)[2], (graph.h-graph.baseLine) * 0.60 + graph.baseLine]]})
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.groupingMode == "BoxPlot" &&
																	 !graph.advBoxPlot &&
																	 !graph.insufDataForFour; 
			})

		graphPanel.add(pv.Line)
			.data(function(){return [[partitionDataInFour(graph)[3], (graph.h-graph.baseLine) * 0.20 + graph.baseLine],
						 [partitionDataInFour(graph)[3], (graph.h-graph.baseLine) * 0.60 + graph.baseLine]]})
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.groupingMode == "BoxPlot" &&
																	 !graph.advBoxPlot &&
																	 !graph.insufDataForFour; 
			})						

		graphPanel.add(pv.Line)
			.data(function(){return [[partitionDataInFour(graph)[0], (graph.h-graph.baseLine) * 0.40 + graph.baseLine],
						 [partitionDataInFour(graph)[1], (graph.h-graph.baseLine) * 0.40 + graph.baseLine]]})
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.groupingMode == "BoxPlot" &&
																	 !graph.advBoxPlot &&
																	 !graph.insufDataForFour; 
			})

		graphPanel.add(pv.Line)
			.data(function(){return [[partitionDataInFour(graph)[1], (graph.h-graph.baseLine) * 0.60 + graph.baseLine],
						 [partitionDataInFour(graph)[3], (graph.h-graph.baseLine) * 0.60 + graph.baseLine]]})
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.groupingMode == "BoxPlot" &&
																	 !graph.advBoxPlot &&
																	 !graph.insufDataForFour; 
			})

		graphPanel.add(pv.Line)
			.data(function(){return [[partitionDataInFour(graph)[1], (graph.h-graph.baseLine) * 0.20 + graph.baseLine],
						 [partitionDataInFour(graph)[3], (graph.h-graph.baseLine) * 0.20 + graph.baseLine]]})
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.groupingMode == "BoxPlot" &&
																	 !graph.advBoxPlot &&
																	 !graph.insufDataForFour; 
			})

		graphPanel.add(pv.Line)
			.data(function(){return [[partitionDataInFour(graph)[3], (graph.h-graph.baseLine) * 0.40 + graph.baseLine],
						 [partitionDataInFour(graph)[4], (graph.h-graph.baseLine) * 0.40 + graph.baseLine]]})
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.groupingMode == "BoxPlot" &&
																	 !graph.advBoxPlot &&
																	 !graph.insufDataForFour; 
			})
		
		
			
		/* Advanced Box Plot Lines */
		graphPanel.add(pv.Line)
			.data(function(){
				var min = removeOutliers(graph)[0];
				return [[min, graph.baseLine],
						 [min, graph.h * 0.80]]
			})
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.groupingMode == "BoxPlot" &&
																		graph.advBoxPlot && 
																	 !graph.insufDataForFour; 
			})
																	 
		graphPanel.add(pv.Line)
			.data(function(){
				var max = removeOutliers(graph)[removeOutliers(graph).length-1];
				return [[max, graph.baseLine],
						 [max, graph.h * 0.80]]
			})
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.groupingMode == "BoxPlot" &&
																		graph.advBoxPlot &&
																	 !graph.insufDataForFour; 
			})
																	 
		graphPanel.add(pv.Line)
			.data(function(){return [[partitionDataInFour(graph)[1], (graph.h-graph.baseLine) * 0.20 + graph.baseLine],
						 [partitionDataInFour(graph)[1], (graph.h-graph.baseLine) * 0.60 + graph.baseLine]]})
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.groupingMode == "BoxPlot" &&
																		graph.advBoxPlot &&
																	 !graph.insufDataForFour; 
		})
																	 
		graphPanel.add(pv.Line)
			.data(function(){return [[partitionDataInFour(graph)[2], (graph.h-graph.baseLine) * 0.20 + graph.baseLine],
						 [partitionDataInFour(graph)[2], (graph.h-graph.baseLine) * 0.60 + graph.baseLine]]})
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.groupingMode == "BoxPlot" &&
																		graph.advBoxPlot &&
																	 !graph.insufDataForFour; 
			})
																	 
		graphPanel.add(pv.Line)
			.data(function(){return [[partitionDataInFour(graph)[3], (graph.h-graph.baseLine) * 0.20 + graph.baseLine],
						 [partitionDataInFour(graph)[3], (graph.h-graph.baseLine) * 0.60 + graph.baseLine]]})
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.groupingMode == "BoxPlot" &&
																		graph.advBoxPlot &&
																	 !graph.insufDataForFour; 
			})						
																	 						
		graphPanel.add(pv.Line)
			.data(function(){
				var min = removeOutliers(graph)[0];
				return [[min, (graph.h-graph.baseLine) * 0.40 + graph.baseLine],
						 [partitionDataInFour(graph)[1], (graph.h-graph.baseLine) * 0.40 + graph.baseLine]]
			})
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.groupingMode == "BoxPlot" &&
																		graph.advBoxPlot &&
																	 !graph.insufDataForFour; 
			})
			
		graphPanel.add(pv.Line)
			.data(function(){return [[partitionDataInFour(graph)[1], (graph.h-graph.baseLine) * 0.60 + graph.baseLine],
						 [partitionDataInFour(graph)[3], (graph.h-graph.baseLine) * 0.60 + graph.baseLine]]})
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.groupingMode == "BoxPlot" &&
																		graph.advBoxPlot &&
																	 !graph.insufDataForFour; 
			})
			
		graphPanel.add(pv.Line)
			.data(function(){return [[partitionDataInFour(graph)[1], (graph.h-graph.baseLine) * 0.20 + graph.baseLine],
						 [partitionDataInFour(graph)[3], (graph.h-graph.baseLine) * 0.20 + graph.baseLine]]})
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.groupingMode == "BoxPlot" &&
																		graph.advBoxPlot &&
																	 !graph.insufDataForFour; 
			})
			
		graphPanel.add(pv.Line)
			.data(function(){
				var max = removeOutliers(graph)[removeOutliers(graph).length-1];
				return [[partitionDataInFour(graph)[3], (graph.h-graph.baseLine) * 0.40 + graph.baseLine],
						 [max, (graph.h-graph.baseLine) * 0.40 + graph.baseLine]]
			})
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.groupingMode == "BoxPlot" &&
																		graph.advBoxPlot &&
																	 !graph.insufDataForFour; 
			})
			
		//Box Plot Mean
		graphPanel.add(pv.Dot)
			.data(function(){return [graph.getMeanMedianMode()[0]]})
			.left(function(d){return graph.x(d)})
			.bottom(function(){return (graph.h-graph.baseLine) * 0.42 + graph.baseLine})
			.visible(function(){return graph.groupingMode == "BoxPlot" &&
																	 !graph.insufDataForFour; 
			})
			.shape("cross")
			.strokeStyle("darkgreen")
		
		graphPanel.add(pv.Dot)
			.data(function(){return [graph.getMeanMedianMode()[0]]})
			.left(function(d){return graph.x(d)})
			.bottom(function(){return (graph.h-graph.baseLine) * 0.42 + graph.baseLine})
			.visible(function(){return graph.groupingMode == "BoxPlot" &&
																	 !graph.insufDataForFour; 
			})
			.shape("cross")
			.angle(Math.PI/4)
			.strokeStyle("darkgreen")
			
		//Box Plot SD Line
		graphPanel.add(pv.Line)
			.data(function(){return getSDLinePoints(graph)})
			.left(function(d){return graph.x(d)})
			.bottom(function(){return (graph.h-graph.baseLine) * 0.42 + graph.baseLine})
			.visible(function(){return graph.groupingMode == "BoxPlot" &&
																	 graph.sdLine &&
																	 !graph.insufDataForFour; 
			})
			.lineWidth(1)
			.strokeStyle("orange")
			
		graphPanel.add(pv.Label)
			.data(function(){return [graph.getMeanMedianMode()[0]]})
			.left(function(d){return graph.x(d)})
			.bottom(function(){return (graph.h-graph.baseLine) * 0.42 + graph.baseLine +20})
			.text(function(){return "SD = "+getSD(graph.dataVals()).toFixed(1)})
			.visible(function(){return graph.groupingMode == "BoxPlot" &&
																	 graph.sdLine &&
																	 !graph.insufDataForFour; 
			})
			.textAlign("center")
			.textStyle("orange")
			
			
		graphPanel.add(pv.Line)
			.data(function(){return [getSDLinePoints(graph)[0], getSDLinePoints(graph)[0]]})
			.left(function(d){return graph.x(d)})
			.bottom(function(){ 
				if (this.index==0)
					return (graph.h-graph.baseLine) * 0.43 + graph.baseLine;
				else
					return (graph.h-graph.baseLine) * 0.41 + graph.baseLine;
			})
			.visible(function(){return graph.groupingMode == "BoxPlot" &&
																	 graph.sdLine &&
																	 !graph.insufDataForFour; 
			})
			.lineWidth(1)
			.strokeStyle("orange")
			
		graphPanel.add(pv.Line)
			.data(function(){return [getSDLinePoints(graph)[1], getSDLinePoints(graph)[1]]})
			.left(function(d){return graph.x(d)})
			.bottom(function(){ 
				if (this.index==0)
					return (graph.h-graph.baseLine) * 0.43 + graph.baseLine;
				else
					return (graph.h-graph.baseLine) * 0.41 + graph.baseLine;
			})
			.visible(function(){return graph.groupingMode == "BoxPlot" &&
																	 graph.sdLine &&
																	 !graph.insufDataForFour; 
			})
			.lineWidth(1)
			.strokeStyle("orange")
			
		/*Mean Median Mode Lines */
		graphPanel.add(pv.Rule)
			.data(function(){
				graph.getMeanMedianMode().forEach(function(m,i){
					if (i > graph.MMMLabelVis.length-1)
						graph.MMMLabelVis[i] = false;
				});
				return graph.getMeanMedianMode()
			})
			.left(function(d){return graph.x(d)})
			.bottom(function(){return graph.baseLine})
			.height(function(){return graph.h * 0.75})
			.visible(function(){
				if (this.index == 0)
					return graph.showMMM || graph.showMean;
				else if (this.index == 1)
					return graph.showMMM || graph.showMedian;
				else
					return graph.showMMM || graph.showMode;
			})
			.strokeStyle(function(d){
				if(this.index == 0)
					return pv.rgb(255,0,0,0.5);
				else if (this.index == 1)
					return pv.rgb(0,0,255,0.5);
				else
					return pv.rgb(0,255,0,0.5);
			})
			.title(function(d){
				if(this.index == 0)
					return "Mean: " + d.toFixed(1);
				else if (this.index == 1)
					return "Median: " + d.toFixed(1);
				else
					return "Mode: " + d.toFixed(1);
			})
			.anchor("top").add(pv.Dot)
				.title(function(d){
					if(this.index == 0)
						return "Mean: " + d.toFixed(1);
					else if (this.index == 1)
						return "Median: " + d.toFixed(1);
					else
						return "Mode: " + d.toFixed(1);
				})
				.shape("square")
				.fillStyle(function(d){
					if(this.index == 0)
						return pv.rgb(255,0,0,1);
					else if (this.index == 1)
						return pv.rgb(0,0,255,1);
					else
						return pv.rgb(0,255,0,1);
				})
				.strokeStyle(function(d){
					if(this.index == 0)
						return pv.rgb(255,0,0,0.5);
					else if (this.index == 1)
						return pv.rgb(0,0,255,0.5);
					else
						return pv.rgb(0,255,0,0.5);
				})
				.visible(function(){
					if (this.index == 0)
						return graph.showMMM || graph.showMean;
					else if (this.index == 1)
						return graph.showMMM || graph.showMedian;
					else
						return graph.showMMM || graph.showMode;
				})
				.size(40)
				.event('click', function(){
					graph.MMMLabelVis[this.index] = !(graph.MMMLabelVis[this.index]);
					vis.render();
				})
				
		// Mean, Median, Mode Labels
		graphPanel.add(pv.Label)
			.data(function(){return graph.getMeanMedianMode()})
			.text(function(d){
				if(this.index == 0)
					return "Mean = " + d.toFixed(1);
				else if (this.index == 1)
					return "Median = " + d.toFixed(1);
				else
					return "Mode = " + d.toFixed(1);
			})
			.left(function(d){return graph.x(d)})
			.bottom(function(d){
				return graph.baseLine + graph.h * 0.75 + 5;
			})
			.textStyle(function(d){
				if(this.index == 0)
					return pv.rgb(255,0,0,0.5);
				else if (this.index == 1)
					return pv.rgb(0,0,255,0.5);
				else
					return pv.rgb(0,255,0,0.5);
			})
			.font(fontString)
			.textAlign("center")
			.visible(function(){return graph.MMMLabelVis[this.index]})
		
		
		/*Insufficient Data for Four Warning */	
		graphPanel.add(pv.Label)
			.text("Insufficient data.")
			.textStyle("red")
			.visible(function(){
				return graph.groupingMode == "FourEqualGroups" &&
							 graph.insufDataForFour;
			})
			.font(fontString)
			.top(35)
			.left(graph.w/2)
			.textAlign("center")
		
		
		//Mouse position label for drag editing
		var dragLabel = graphPanel.add(pv.Label)
			.visible(false)
			.font(fontString)
			.textAlign("center")
			.text("0")
		
		
		/* Dots */
		graphPanel.add(pv.Dot)
			.data(function() {return graph.getDataDrawObjects()})
			.visible(function(d) {
				return $('#checkboxHideData').attr('checked') == false  && 
					(d.y+graph.baseLine) < graph.h &&
					d.x >= 0 &&
					d.x <= graph.w;
			})
			.left(function(d) { return d.x })
			.bottom(function(d) { return d.y + graph.baseLine })
			.cursor(function(){
				if (graphCollection.editModeEnabled)
					return "move";
				else
					return "default";
			})
			.radius(function() {return graphCollection.bucketDotSize})
			.fillStyle(function(d) {return pointFillStyle(d.set)})
			.strokeStyle(function(d) {
				if (d.label == graphCollection.selectedLabel)
					return jQuery('#checkboxBWView').is(':checked') ? "grey": "red";
				else
					return pointStrokeStyle(d.set);
			})
			.lineWidth(function(d){if (d.label == graphCollection.selectedLabel) return 4;
														 else return 2;
			})
			.title(function(d) { return d.label+", "+graph.x.invert(d.xReal).toFixed(1) })
			.event("click", function(d){
				if (graphCollection.editModeEnabled == false)
				graphCollection.selectedLabel = d.label;
				vis.render();
			})
			.event("mousedown", pv.Behavior.drag())
			.event("drag", function(d){  
				if (graphCollection.editModeEnabled &&
						vis.mouse().x >= 0 &&
						vis.mouse().x <= graph.w - 5){
							
					var worksheet = "";
					for (var key in graphCollection.worksheets){
						if (graphCollection.worksheets[key].data[d.set] != undefined)
							worksheet = key;
					}
					
					graphCollection.editSinglePoint(worksheet, d.set,d.label,graph.x.invert(vis.mouse().x));
					graph.selectedCategory = d.set;
					
					dragLabel.text(graph.x.invert(graphPanel.mouse().x).toFixed(1));
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
					var worksheet = "";
					for (var key in graphCollection.worksheets){
						if (graphCollection.worksheets[key].data[d.set] != undefined)
							worksheet = key;
					}
					var newData = graphCollection.worksheets[worksheet].data[d.set];
					var remIndex = null;
					newData.forEach(function(data, index){
						if (data.label == d.label && 
						(vis.mouse().x < 0 ||
						vis.mouse().x > graph.w - 5)){
							remIndex = index;
						}
					});
					if (remIndex != null)
						newData.splice(remIndex,1);
					graphCollection.editData(worksheet,d.set,d.set,newData);
					
				
					if (Math.abs(graphPanel.mouse().x - d.x) <= graphCollection.bucketDotSize &&
							Math.abs((graph.h - graphPanel.mouse().y) - (d.y + graph.baseLine)) <= graphCollection.bucketDotSize+1)
					{
						dragging = true;
					}
					
					dragLabel.visible(false);
					
					vis.render();
				}
			})
			.event("touchstart", function(d){
				touch.dragType = "data";
				touch.dataObj = d;
				touch.graphIndex = index;
				touch.dragging = true;
				touch.dragLabel = dragLabel;
			})
			
		//Advanced Box Plot Outlier Marks
		graphPanel.add(pv.Dot)
			.data(function(){return getOutlierDrawPositions(graph)})
			.visible(function(d){return graph.groupingMode == "BoxPlot" &&
																		graph.advBoxPlot && 
																	 !graph.insufDataForFour &&
																	 (d.y+graph.baseLine) < graph.h &&
																		d.x >= 0 &&
																		d.x <= graph.w;
			})
			.left(function(d) { return d.x })
			.bottom(function(){return (graph.h-graph.baseLine) * 0.42 + graph.baseLine})
			.shape("cross")
			.strokeStyle("darkgreen")
			.size(60)
			.angle(Math.PI/4)
			
		
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
				graph.getDataDrawObjects().forEach(function(d){
					if ((d.y+graph.baseLine) > graph.h ||
							d.x < 0 ||
							d.x > graph.w)
						retVal = true;
				});
				return retVal;
			})
			
			
		/* Legend */
		var legendPanel = graphPanel.add(pv.Panel)
			.right(15)
			.top(4)
			.overflow("hidden")
			.width(function(){
				if(graph.legendHidden) return 110;
				else if (graphCollection.editModeEnabled) return 220;
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
							if (graphCollection.graphs[which].addCategory(this.category())){
								graph.removeCategory(this.category());
								if (graph.selectedCategory == this.category())
									graph.selectedCategory = null;
							}
							graphCollection.updateMenuOptions();
						} else {
							var which = parseInt(mouseY/(graphCollection.h/graphCollection.graphs.length));
							if (graphCollection.graphs[which].addCategory(this.category())){
								graph.removeCategory(this.category());
								if (graph.selectedCategory == this.category())
									graph.selectedCategory = null;
							}
							graphCollection.updateMenuOptions();
						}
					} else {
						graph.removeCategory(category);
						if (graph.selectedCategory == category)
							graph.selectedCategory = null;
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
					touch.dragType="graphCat";
					touch.draggedObj = dragFeedbackPanels[this.row()];
					touch.dragging = true;
					touch.dragCat = this.category();
					touch.graphIndex = graphCollection.graphs.indexOf(graph);
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
			
			/* Edit Mode Select Checkboxes */		
			legendPanel.add(pv.Image)
				.url(function(){
					if (graph.selectedCategory == category)
						return "http://centerforbiophotonics.github.com/SeeIt3/img/checkbox_checked.png"
					else
						return "http://centerforbiophotonics.github.com/SeeIt3/img/checkbox_unchecked.png"
				})  
				.width(30)
				.height(30)
				.top(30*index+23)
				.right(3)
				.visible(function(){return graphCollection.editModeEnabled})
				.cursor("pointer")
				.title("Clicking the graph will add data to the checked category or to a new category if none is checked.")
				.events("all")
				.event("click", function(){
					if (graph.selectedCategory == category)
						graph.selectedCategory = null;
					else
						graph.selectedCategory = category;
					legendPanel.render();
				})
				
		});	
	} else {
		//Empty Graph Message
		graphPanel.add(pv.Label)
			.left(function(){return graph.w/2})
			.top(function(){return graph.h/2})
			.textAlign("center")
			.textBaseline("center")
			.text("Empty Graph")
			.font(fontString)
		graphPanel.add(pv.Label)
			.left(function(){return graph.w/2})
			.top(function(){return graph.h/2 + 20})
			.textAlign("center")
			.textBaseline("center")
			.text("Drag a Dataset from the Left to Add")
			.font(fontString)
		graphPanel.add(pv.Label)
			.left(function(){return graph.w/2})
			.top(function(){return graph.h/2 + 40})
			.textAlign("center")
			.textBaseline("center")
			.text("Maximum 4 Datasets per Graph")
			.font(fontString)
	}
}
