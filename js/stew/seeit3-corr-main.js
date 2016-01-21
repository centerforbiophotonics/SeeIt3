//Entry Point
var graphCollection = new GraphCollection();
var vis = {};
var touch = new Touch();
var fontString = "bold 14px arial";
var dragging = false;
var dragID = null;

var buttonWidths = [[87, 60, 34], 		//Datasets Toggle
										[85, 55, 34],			//Display Options
										[80, 50, 34],			//Two/One Graph
										[70, 40, 34],			//Fit Scales
										[98, 67, 34],			//Advanced Mode
										[70, 40, 34]			//Edit Mode				
									 ];

var exampleSpreadsheets = [ ];

var ie = $.browser.msie != undefined && $.browser.msie != false;

if (!ie){
	//Extract url params and set flag if default worksheets are not to be loaded
	var preload = window.location.search;
	var urlParamsUsed = false;
	var exclusiveLoad = false;	
	if (preload.substring(0, 1) == '?') {
			console.log(preload);
			urlParamsUsed = true;
			
			preload = preload.substring(1);
			
			if (preload.substring(0, 1) == '!'){
				exclusiveLoad = true;
				preload = preload.substring(1);
			}
			
	}
	
	//Push default worksheets from google first so that when pushing worksheets from url we can check for duplication
	if (!exclusiveLoad){
		exampleSpreadsheets.push(new Spreadsheet('1QFAZnzWYtLa2_XaObKWrTLM0RzgMc7eXiiaA5LWHPYc')); // CoffeVsHeigh
		exampleSpreadsheets.push(new Spreadsheet('1bKrr2d3I3yg6NTHVerX7EAFfCBl0LpqRJSM-vcmXlUc')); // EatOutVsBMI

		exampleSpreadsheets.push(new Spreadsheet('1VleKMtoL-CVJlSzWWpXZc5xueFGrqZ8qxApLh83c-ZY')); // ExerciseVsBMI

		exampleSpreadsheets.push(new Spreadsheet('1G8wFakhE3H_XvibXKUh1cjU4smLaJnHYyiuX6rCL9XA')); // StudyMinsVsRetention
		exampleSpreadsheets.push(new Spreadsheet('14gfBaBkGYw5Cv3f2vndRewtGJUwnHKjdCK0uew2hKCA')); // ChildrenVsHouseSize

		exampleSpreadsheets.push(new Spreadsheet('1uFHVQfP1lVFsya-4v_IVQbvFETE3GUusSmnJgTQB7BA')); // TVHoursVsGPA
		
		exampleSpreadsheets.push(new Spreadsheet('1q3vOF6rmldCya-tbVVXQKJqbPH96mF3N6Z3iwNVcOHg')); // TextingVsPercentGrade

		exampleSpreadsheets.push(new Spreadsheet('1ezXuPZClCMagXu_r90REOHV3SMjWTmvFFAFCAMsw6K4')); // YearsEduVsIncome
		exampleSpreadsheets.push(new Spreadsheet('1Fca5Y70pEKORxULceSp5PwhDN-E6SJqRYtfbb4764HI')); // FBHoursVsFriends		//Giraffe Data
	}	
	
	//Push worksheets specified by key in url
	if (urlParamsUsed){		
		preload.split("&").forEach(function(param){
			param = decodeURIComponent(param);
			param = param.split("=");
				
			if (param[0].indexOf('key') != -1){  // Preload Worksheet
				var key = parseSpreadsheetKeyFromURL(param.join('='));
		
				var exists = false;
				exampleSpreadsheets.forEach(function(s){
					if (s.key == key) exists = true;
				});
				
				if (!exists) {
					exampleSpreadsheets.push(new Spreadsheet(key));
					//constructVis();
				}
				else alert("Error: the google spreadsheet you specified in the URL is one of the default spreadsheets already included.");
				
			}	
		});
	}
	
	//Push worksheets in localStorage
	for (var w_title in localStorage){
		if (!localStorage[w_title] instanceof Function){  //For firefox
			var worksheet = JSON.parse(localStorage[w_title]);
			worksheet.fromLocalStorage = true;
			exampleSpreadsheets.push(new Spreadsheet(worksheet));
		}
	}
	
} else {
	$('p#loadingMsg').hide();
	$("#ieWarning").show();
}	

/* populate dataset drop down menu */
var lastSelectedWorksheet; 
var numWorksheetsLoaded = 0;
jQuery('body').bind('WorksheetLoaded', function(event) {
	if (event.refresh){
		graphCollection.addWorksheet(event.worksheet);
	}
	//graphCollection.addWorksheet(event.worksheet);
  numWorksheetsLoaded++;
  $('p#loadingMsg').html("Loading "+(numWorksheetsLoaded/numWorksheets*100).toFixed(0)+"%");
  if (numWorksheetsLoaded >= numWorksheets){
		jQuery('p#loadingMsg').hide();
		constructVis();
		showHideAdvancedOptions();
		toggleDatasetMenu();
  }
});

function constructVis() {
	jQuery('span').remove();
	touch = new Touch();
	
	var topButtonsOffset = -34;
	
	function topButtonWidth(d){
		if (graphCollection.buttonIcon && graphCollection.buttonText){ 
			return buttonWidths[d][0];
		}else if (!graphCollection.buttonIcon){
			return buttonWidths[d][1];
		}else if (!graphCollection.buttonText){
			return buttonWidths[d][2];
		}
	}
	
	function topButtonLeft(d){
			var left = 0;
			left += topButtonsOffset;
			
			for(var i=0; i<d; i++){
				if (graphCollection.buttonIcon && graphCollection.buttonText){ 
					left += buttonWidths[i][0];
				}else if (!graphCollection.buttonIcon){
					left += buttonWidths[i][1];
				}else if (!graphCollection.buttonText){
					left += buttonWidths[i][2];
				}
			}
			
			return left;			
	}
	
	vis = new pv.Panel()
		.width(function(){return graphCollection.w})
		.height(function(){return graphCollection.h})
		.bottom(function(){return graphCollection.padBot})
		.left(function(){return graphCollection.padLeft})
		.right(function(){return graphCollection.padRight})
		.top(function(){return graphCollection.padTop})
	
	if(!graphCollection.printMode){
		/* Divider Between Graphs and Buttons */
		vis.add(pv.Rule)
			.left(-35)
			.right(graphCollection.padRight * -1)
			.top(-60)
		
		
		//Datasets
		var dataSetsPanel = vis.add(pv.Panel)
			.data([0])
			.events("all")
			.cursor("pointer")
			.title(function(){
				if(graphCollection.datasetsMenuShowing)
					return "Hide Datasets";
				else
					return "Show Datasets";
			})
			.height(30)
			.width(topButtonWidth)
			.left(topButtonLeft)
			.top(-90)
			.lineWidth(1)
			.event("click", toggleDatasetMenu)
			.event("mouseover", function(d){
				this.strokeStyle("black");
				this.render();
			})
			.event("mouseout", function(d){ 
				this.strokeStyle(pv.rgb(0,0,0,0));
				this.render();
			})
		
		dataSetsPanel.add(pv.Image)
			.url(getRelativeImageURL() + "dataset.png")  //fix this
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
						return 28;
				})
				.top(10)
				.text(function(){
					if(graphCollection.datasetsMenuShowing)
						return "Hide";
					else
						return "Show";
				})
				.font("bold 12px arial")
				.visible(function() {
					if (graphCollection.buttonText)
						return true;
					else
						return false;
				})
			.anchor("left").add(pv.Label)
				.left(function(){
					if (graphCollection.buttonText && !graphCollection.buttonIcon){
						return 2;
					}else
						return 28;
				})
				.top(22)
				.text("Datasets")
				.font("bold 12px arial")
				.visible(function() {
					if (graphCollection.buttonText)
						return true;
					else
						return false;
				})
		
		/* Display Options Menu Button */
		var dispOptPanel = vis.add(pv.Panel)
			.data([1])
			.events("all")
			.cursor("pointer")
			.title("Show display option menu")
			.height(30)
			.width(topButtonWidth)
			.left(topButtonLeft)
			.top(-90)
			.lineWidth(1)
			.event("click", function(){
				var wasShowing = $('#displayOptions').is(":visible")
				hideMenus();
				positionDisplayMenu();
				if (!wasShowing)
					$('#displayOptions').slideToggle();
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
			.url(getRelativeImageURL() + "eye.png")  //fix this
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
				positionDisplayMenu();
				$('#displayOptions').slideToggle();
			})
			.anchor("left").add(pv.Label)
				.left(function(){
					if (graphCollection.buttonText && !graphCollection.buttonIcon)
						return 2;
					else
					 return 32;
				})
				.top(10)
				.text("Display")
				.font("bold 12px arial")
				.visible(function() {
					if (graphCollection.buttonText)
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
				.top(22)
				.text("Options")
				.font("bold 12px arial")
				.visible(function() {
					if (graphCollection.buttonText)
						return true;
					else
						return false;
				})
		
		/* Add New Graph Button */
		var newGrphPanel = vis.add(pv.Panel)
			.data([2])
			.events("all")
			.cursor("pointer")
			.title("Switch between One or Two Graph View")
			.height(30)
			.width(topButtonWidth)
			.left(topButtonLeft)
			.top(-90)
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
					return getRelativeImageURL() + "newGraph.png";
				else 
					return getRelativeImageURL() + "remGraph.png";
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
				.top(10)
				.text(function(){
					if(graphCollection.graphs.length == 1) return "Two";
					else return "One";
				})
				.font("bold 12px arial")
				.visible(function() {
					if (graphCollection.buttonText)
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
				.top(22)
				.text(function(){
					if(graphCollection.graphs.length == 1) return "Graphs";
					else return "Graph";
				})
				.font("bold 12px arial")
				.visible(function() {
					if (graphCollection.buttonText)
						return true;
					else
						return false;
				})
		
		/* Fit Graphs Button */
		var newGrphPanel = vis.add(pv.Panel)
			.data([3])
			.events("all")
			.cursor("pointer")
			.title("Fit all graphs to the data they contain")
			.height(30)
			.width(topButtonWidth)
			.left(topButtonLeft)
			.top(-90)
			.lineWidth(1)
			.event("click", function(){
				graphCollection.graphs.forEach(function(g){
					g.fitScaleToData = true;
					jQuery('#fitScalesToData').attr('checked', true);
					g.setXScale();
					g.setYScale();
				});
				graphCollection.updateMenuOptions();
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
			
		newGrphPanel.add(pv.Image)
			.url(function(){
				return getRelativeImageURL() + "ruler.png"
			})  //fix this
			.width(30)
			.height(30)
			.top(0)
			.left(2)
			.cursor("pointer")
			.title("Fit all graphs to the data they contain")
			.event("click", function(){
				graphCollection.graphs.forEach(function(g){
					g.fitScaleToData = true;
					jQuery('#fitScalesToData').attr('checked', true);
					g.setXScale();
					g.setYScale();
				});
				graphCollection.updateMenuOptions();
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
				.top(10)
				.text("Fit")
				.font("bold 12px arial")
				.visible(function() {
					if (graphCollection.buttonText)
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
				.top(22)
				.text("Scale")
				.font("bold 12px arial")
				.visible(function() {
					if (graphCollection.buttonText)
						return true;
					else
						return false;
				})
		
		
		/*Toggle Basic/Advanced User Mode*/
		var togUserModePanel = vis.add(pv.Panel)
			.data([4])
			.events("all")
			.cursor("pointer")
			.title("Toggle advanced mode")
			.height(30)
			.width(topButtonWidth)
			.left(topButtonLeft)
			.top(-90)
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
					return getRelativeImageURL() + "advModeON.png"
				else
					return getRelativeImageURL() + "advModeOFF.png"
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
				.top(10)
				.text("Advanced")
				.textStyle(function(){
					if (graphCollection.advancedUser)
						return "red"
					else
						return "grey"
				})
				.font("bold 12px arial")
				.visible(function() {
					if (graphCollection.buttonText)
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
				.top(22)
				.text("Mode")
				.textStyle(function(){
					if (graphCollection.advancedUser)
						return "red"
					else
						return "grey"
				})
				.font("bold 12px arial")
				.visible(function() {
					if (graphCollection.buttonText)
						return true;
					else
						return false;
				})
		
		
		/* Toggle Edit Mode Button */
		var togEditPanel = vis.add(pv.Panel)
			.data([5])
			.events("all")
			.cursor("pointer")
			.title("Toggle edit mode")
			.height(30)
			.width(topButtonWidth)
			.left(topButtonLeft)
			.top(-90)
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
					return getRelativeImageURL() + "handON.png"
				else
					return getRelativeImageURL() + "hand.png"
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
				.top(10)
				.text("Edit")
				.font("bold 12px arial")
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
			.anchor("left").add(pv.Label)
				.left(function(){
					if (graphCollection.buttonText && !graphCollection.buttonIcon)
						return 2;
					else
					 return 32;
				})
				.top(22)
				.text("Mode")
				.font("bold 12px arial")
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
	}
		
	$('#graphTitle0').hide();
	$('#graphTitle1').hide();
	graphCollection.graphs.forEach(function(graph, index){
		constructGraphPanel(graph, index);
	});
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
		positionAndSizeGraphTitle(graph,index);
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
								"width='15' height='15'"+
								"title='"+(graphCollection.datasetsVisible[w.title]?"Collapse Folder":"Expand Folder")+"'></td>"+
							"<td nowrap><div id='treeTitle"+i+"' "+
								"onmousedown='toggleDataSubtree(\"subtree"+i+"\","+i+",\""+w.title+"\")'"+
								"style='cursor:pointer; font:"+fontString+";'>"+
								w.title+"</div></td>"+
							"</table></tr>"+
							"<div id='subtree"+i+"' "+(graphCollection.datasetsVisible[w.title]?"":"hidden")+">"+
							"<input type='image' src='img/edit.png'  style='margin-left:25px;' onclick='openWorksheetMenu(\""+w.title+"\")' width='25' height='25'>"+
							//"<input type='image' src='img/refresh.png' style='margin-left:25px;' onclick='refreshWorksheet(\""+w.title+"\")' width='25' height='25'>"+
							"<input type='image' src='img/question.png' style='margin-left:25px;' onclick='showWorksheetDescription(\""+w.title+"\")' width='30' height='30'>"+
							//"<input type='image' src='img/document.png' style='margin-left:25px;' onclick='editInGoogleDocs(\""+w.title+"\")' width='25' height='25'>";
							(!w.local && !w.userCreated ? 
								"<input type='image' src='img/document.png'  style='margin-left:25px;'onclick='editInGoogleDocs(\""+w.title+"\")' width='25' height='25'>":
								"<input type='image' id='"+w.title+"-save-local' src='img/"+(w.storedLocally?"pinON.png":"pin.png")+"' style='margin-left:25px;'onclick='saveLocally(\""+w.title+"\")' width='25' height='25'>"
							)+
							(!w.local && !w.userCreated ? 
								"<input type='image' src='img/refresh.png' style='margin-left:25px;' onclick='refreshWorksheet(\""+w.title+"\")' width='25' height='25'>" :
								""
							)+
							(w.local && w.userCreated && w.storedLocally ?  
								"<input type='image' src='img/garbage.png' style='margin-left:25px;' onclick='clearFromLocalStorage(\""+w.title+"\")' width='25' height='25'>" :
								""
							);
			for (key in w.data){
				html+="<table style='margin-left:15px;'><tr>"+
							"<td><div id=\""+convertToID(key)+"\" class='menuItemDef'"+ 
							"style=\"color:"+(w.edited[key]?'red':'black')+"; font:"+fontString+";\""+
							"onmouseover=\"this.className='menuItemOver'\""+
							"onmouseout=\"this.className='menuItemDef'\""+
							"onmousedown=\"javascript:sidePanDragStart(event,'"+key+"')\""+
							"ontouchstart=\"sideCatTouchStart(event, '"+key+"')\""+
							"ontouchmove=\"sideCatTouchMove(event, '"+key+"')\""+
							"ontouchend=\"sideCatTouchEnd(event, '"+key+"')\""+
							">"+
							key+"</div></td></tr></table>";
				picker++;
			}
							
			html += "</div>";
			i++;
		})
	})
	html+="<table><tr onclick=\"openWorksheetMenu()\" style=\"cursor:pointer; font:"+fontString+";\">"+
							"<td><image src='img/plus.png' width='25' height='25'></td>"+
							"<td>Add a Dataset</td></div></tr></table>";
	$('#dataTree').html(html);
	$('#datasets').css('z-index',2)
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
	var title = "<center>";
	if (graph.xData != null){
		title += graph.xData;
	}
	if (graph.yData != null && graph.xData != null){
		title += " vs. ";
	} 
	if (graph.yData != null){
		title += graph.yData;
	}
	title += "</center>";
	$('#graphTitle'+index).html(title);
	$('#graphTitle'+index).css("font", fontString);	
	$('#graphTitle'+index).show();
	 
	if(!graphCollection.printMode){
		//Remove Graph Button
		graphPanel.add(pv.Panel)
			.right(-10)
			.top(-90)
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
				
		//Show Graph Option Menu Button
		graphPanel.add(pv.Image)
			.url(getRelativeImageURL() + "wrench.png")  //fix this
			.width(30)
			.height(30)
			.top(-95)
			.left(-90)
			.cursor("pointer")
			.title("Show graph option menu")
			.event("click", function(){
				var oldSelIndex = graphCollection.selectedGraphIndex;
				graphCollection.selectedGraphIndex = index;
				graphCollection.updateMenuOptions();
				positionGraphMenuOverGraph(index, graphCollection);
				if (oldSelIndex == index)
					hideMenus();
					$('#graphOptions').slideDown();
					
				graphCollection.showOptionMenuHint = false;
				vis.render();
			})
		
		//Option Menu Hint	
		graphPanel.add(pv.Label)
			.left(-30)
			.top(-70)
			.textAlign("left")
			.textBaseline("center")
			.text("<=== Click the wrench to show visualization tools for this graph.")
			.textStyle("red")
			.font(fontString)
			.visible(function(){return graphCollection.showOptionMenuHint})
	}	
	
	//Divider between graphs
	graphPanel.add(pv.Rule)
		.left(-95)
		.top(-100)
		.bottom(-80)
		.visible(function(){ return index == 1 })
			
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
	////Empty Graph Message
	//graphPanel.add(pv.Label)
		//.left(function(){return graph.w/2})
		//.top(function(){return graph.h/2})
		//.textAlign("center")
		//.textBaseline("center")
		//.text("Empty Graph")
		//.font(fontString)
		
	//Empty Graph Message
		graphPanel.add(pv.Label)
			.left(function(){return graph.w/2})
			.top(function(){return graph.h/2 - 40})
			.textAlign("center")
			.textBaseline("center")
			.text("Empty Graph")
			.font(fontString)
		graphPanel.add(pv.Label)
			.left(function(){return graph.w/2})
			.top(function(){return graph.h/2 - 20})
			.textAlign("center")
			.textBaseline("center")
			.text("Datasets are organized into folders in the datasets panel to the left.")
			.font(fontString)
			graphPanel.add(pv.Label)
			.left(function(){return graph.w/2})
			.top(function(){return graph.h/2})
			.textAlign("center")
			.textBaseline("center")
			.text("Click the triangle or title of each dataset folder to expand it.")
			.font(fontString)
		graphPanel.add(pv.Label)
			.left(function(){return graph.w/2})
			.top(function(){return graph.h/2 + 20})
			.textAlign("center")
			.textBaseline("center")
			.text("Drag a dataset to either axis to view it.")
			.font(fontString)
		graphPanel.add(pv.Label)
			.left(function(){return graph.w/2})
			.top(function(){return graph.h/2 + 40})
			.textAlign("center")
			.textBaseline("center")
			.text("Click the \"hide datasets\" button in the top bar to hide the datasets panel.")
			.font(fontString)
			
		
		
}

function constructCorrGraph(graph, index, graphPanel){	
	graphPanel.event("click", function(){
		hideMenus();
		if (!dragging){
			if (graphCollection.editModeEnabled){
				var worksheetX = null;
				for (key in graphCollection.worksheets){
					if (graphCollection.worksheets[key].data[graph.xData] != undefined)
						worksheetX = graphCollection.worksheets[key];
				}
				var worksheetY = null;
				for (key in graphCollection.worksheets){
					if (graphCollection.worksheets[key].data[graph.yData] != undefined)
						worksheetY = graphCollection.worksheets[key];
				}
				var mouseX = graphPanel.mouse().x;
				var mouseY = graph.h - graphPanel.mouse().y;
				
				if (graph.labelPrompt){
					var label = prompt("Enter a label for the data", "defaultLabel"+graphCollection.defaultLabel);
					
					var dupFlag = false;
					worksheetX.data[graph.xData].forEach(function(d){
						if (d.label == label){
							dupFlag = true;
							alert("The label "+label+" is already used in "+graph.xData);
						}
					});
					
					worksheetY.data[graph.yData].forEach(function(d){
						if (d.label == label){
							dupFlag = true;
							alert("The label "+label+" is already used in "+graph.yData);
						}
					});
					
					if (!dupFlag){
						worksheetX.data[graph.xData].push(
							{"label": label,
							 "value": graph.x.invert(mouseX)}
						);
						
						worksheetX.labelMasterList.push(label);
						if (worksheetX.title != worksheetY.title)		//push label to y worksheet if it is not x worksheet
							worksheetY.labelMasterList.push(label);
						
						worksheetX.edited[graph.xData] = true;
						worksheetY.edited[graph.yData] = true;
						
						graphCollection.editData(worksheetX, graph.xData,graph.xData,worksheetX.data[graph.xData]);
						
						worksheetY.data[graph.yData].push(
							{"label": label,
							 "value": graph.y.invert(mouseY)}
						);
						graphCollection.editData(worksheetY, graph.yData,graph.yData,worksheetY.data[graph.yData]);
						
						if (!graphCollection.labelColors.hasOwnProperty(label))
							graphCollection.labelColors[label] = graphCollection.colorScale(parseInt(Math.random()*20));
						
						if (label == "defaultLabel"+graphCollection.defaultLabel)
							graphCollection.defaultLabel++;
					}
				} else {
					worksheetX.labelMasterList.push("defaultLabel"+graphCollection.defaultLabel);
					if (worksheetX.title != worksheetY.title)		//push label to y worksheet if it is not x worksheet
						worksheetY.labelMasterList.push("defaultLabel"+graphCollection.defaultLabel);
					
					worksheetX.data[graph.xData].push(
						{"label": "defaultLabel"+graphCollection.defaultLabel,
						 "value": graph.x.invert(mouseX)}
					);
					graphCollection.editData(worksheetX,graph.xData,graph.xData,worksheetX.data[graph.xData]);
					
					worksheetY.data[graph.yData].push(
						{"label": "defaultLabel"+graphCollection.defaultLabel,
						 "value": graph.y.invert(mouseY)}
					);
					graphCollection.editData(worksheetY,graph.yData,graph.yData,worksheetY.data[graph.yData]);
					
					if (!graphCollection.labelColors.hasOwnProperty("defaultLabel"+graphCollection.defaultLabel))
							graphCollection.labelColors["defaultLabel"+graphCollection.defaultLabel] = graphCollection.colorScale(parseInt(Math.random()*20));
					
					graphCollection.defaultLabel++;
				}
				vis.render();
				constructDatasetPanel();
			}
		} else {
			dragging = false;
		}
	});
	
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
			.visible(function(){
				if (graphCollection.graphs.length == 2) 
					return this.index % 2 == 0;
				else 
					return true;
			})
			
	/* Number of datapoints N */
  graphPanel.add(pv.Label)
		.left(-40)
		.bottom(-40)
		.textAlign("center")
		.textAngle(0)
		.text(function(){return "n = " + graph.getData().length})
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
	
	/* Dots */
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
			if (dragID == null) dragID = d.label; //to ensure other data points don't get stuck to the one that is being dragged
			
			if (graphCollection.editModeEnabled &&
					graphPanel.mouse().x >= 0 &&
					graphPanel.mouse().x <= graph.w &&
					graphPanel.mouse().y >= 0 &&
					graphPanel.mouse().y <= graph.h){
				
				var worksheetX = null;
				for (key in graphCollection.worksheets){
					if (graphCollection.worksheets[key].data[graph.xData] != undefined)
						worksheetX = graphCollection.worksheets[key];
				}
				var worksheetY = null;
				for (key in graphCollection.worksheets){
					if (graphCollection.worksheets[key].data[graph.yData] != undefined)
						worksheetY = graphCollection.worksheets[key];
				}
				
				graphCollection.editSinglePoint(worksheetX, graph.xData, dragID, graph.x.invert(graphPanel.mouse().x));
				graphCollection.editSinglePoint(worksheetY, graph.yData, dragID, graph.y.invert(graph.h - graphPanel.mouse().y));
				
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
				var worksheetX = null;
				for (key in graphCollection.worksheets){
					if (graphCollection.worksheets[key].data[graph.xData] != undefined)
						worksheetX = graphCollection.worksheets[key];
				}
				var worksheetY = null;
				for (key in graphCollection.worksheets){
					if (graphCollection.worksheets[key].data[graph.yData] != undefined)
						worksheetY = graphCollection.worksheets[key];
				}
				
				var newXData = worksheetX.data[graph.xData];
				var newYData = worksheetY.data[graph.yData];
				var remIndex = null;
				newXData.forEach(function(data, index){
					if (data.label == dragID && 
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
				graphCollection.editData(worksheetX, graph.xData,graph.xData,newXData);
				
				remIndex = null;
				newYData.forEach(function(data, index){
					if (data.label == dragID && 
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
				graphCollection.editData(worksheetY, graph.yData,graph.yData,newYData);
				
				dragLabel.visible(false);
				dragID = null;
				constructVis();
				//vis.render();
			}
		})
		.event("touchstart", function(d){
			//if (graphCollection.editModeEnabled){
				touch.dragType = "dataCorr";
				touch.dataObj = d;
				touch.dragging = true;
				touch.graphIndex = index;
				touch.graphPanel = graphPanel;
				touch.dragLabel = dragLabel;
			//}
		})
	
		
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
			.text(function(d) {return "n = "+ d.n;})
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
		.title(function(d) { return "Y = "+graph.mmSlope.toFixed(3)+
																 "X + "+graph.mmIntercept.toFixed(3) 
		})
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
			
	graphPanel.add(pv.Label)
		.visible(function () { return graph.mmLine; })
		.text( "Median-Median Regression Line:" )
		.top(-80)
		.textAlign("left")
		.textBaseline("top")
		.textStyle("blue")
		.font(function(){return fontString})
		.add(pv.Label)
			.top(-60)
			.text(function(d) {
			if (this.index == 0) { return "Y = "+graph.mmSlope.toFixed(3)+
																 "X + "+graph.mmIntercept.toFixed(3) }
			else { return "" }
		})
		
			
	/* Least Squares Regression Line */  
	graphPanel.add(pv.Line)
		.visible(function() { return graph.lsLine })
		.data(function(){return [[graph.xMin, graph.lsFarLeftYVal], 
														 [graph.xMax, graph.lsFarRightYVal]]})
		.left(function(d) { return graph.x(d[0]) })
		.bottom(function(d) { return graph.y(d[1]) })
		.title(function(d) { return "Y = "+graph.lsSlope.toFixed(3)+
																"X + "+graph.lsIntercept.toFixed(3) +
																" -- R = "+ 
																getR(graph.getData()).toFixed(2)+ 
																" -- Sum of Squares = "+ 
																getSumOfLeastSquares(graph).toFixed(1);
		})
		.strokeStyle(pv.rgb(0,125,0,1))
		.lineWidth(2)
		.add(pv.Label)									//Line Equation
			.visible(function () { return graph.lsEQ && graph.lsLine })
			.text(function(d) {
				if (this.index == 0) { return "Y = "+graph.lsSlope.toFixed(3)+
																"X + "+graph.lsIntercept.toFixed(3);}
				else {return ""}
			})
			.textAlign("left")
			.textBaseline("top")
			.textStyle(pv.rgb(0,125,0,1))
			.textAngle(function(){return getLSLineLabelAngle(graph)})
			.font("bold 12px sans-serif")
		.add(pv.Label)									//R Value
			.visible(function () { return graph.lsR && graph.lsLine })
			.text(function(d) {
				if (this.index == 0) { return "R = "+ 
																getR(graph.getData()).toFixed(2)+ 
																" -- Sum of Squares = "+ 
																getSumOfLeastSquares(graph).toFixed(1);}
				else {return ""}
			})
			.textAlign("left")
			.textBaseline("bottom")
			.textStyle(pv.rgb(0,125,0,1))
			.textAngle(function(){return getLSLineLabelAngle(graph)})
			.font("bold 12px sans-serif");
	
	
	//Separate Line Equation For Readability
	graphPanel.add(pv.Label)									//Line Equation
			.visible(function () { return graph.lsLine })
			.top(-80)
			.text("Least Squares Regression Line:")
			.textAlign("left")
			.textBaseline("top")
			.textStyle(pv.rgb(0,125,0,1))
			.font(function(){return fontString})
		.add(pv.Label)									//Line Equation
			//.visible(function () { return graph.lsLine })
			.top(-60)
			.text(function(d) {
				if (this.index == 0) { return "Y = "+graph.lsSlope.toFixed(3)+
																"X + "+graph.lsIntercept.toFixed(3);}
				else {return ""}
			})
			//.textAlign("left")
			//.textBaseline("top")
			//.textStyle(pv.rgb(0,125,0,1))
			//.font(function(){return fontString})
		.add(pv.Label)									//R Value
			//.visible(function () { return graph.lsLine })
			.top(-40)
			.text(function(d) {
				if (this.index == 0) { return "R = "+ 
																getR(graph.getData()).toFixed(2);}
				else {return ""}
			})
			//.textAlign("left")
			//.textBaseline("bottom")
			//.textStyle(pv.rgb(0,125,0,1))
			//.font(function(){return fontString});		
		.add(pv.Label)									//R Value
			//.visible(function () { return graph.lsLine })
			.top(-20)
			.text(function(d) {
				if (this.index == 0) { return "Sum of Squares = "+ 
																getSumOfLeastSquares(graph).toFixed(1);}
				else {return ""}
			})
		
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
				if (this.index == 0) { return "Y = "+
																getUserLineSlope(graph).toFixed(3)+
																"X + "+getUserLineIntercept(graph).toFixed(3)}
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
					var worksheet = null;
					for (key in graphCollection.worksheets){
						if (graphCollection.worksheets[key].data[graph.yData] != undefined)
							worksheet = graphCollection.worksheets[key];
					}
					var mouseX = topDist.mouse().x;
					
					if (graph.labelPrompt){
						var label = prompt("Enter a label for the data", "defaultLabel"+graphCollection.defaultLabel);
						
						
						
						var dupFlag = false;
						worksheet.data[graph.yData].forEach(function(d){
							if (d.label == label){
								dupFlag = true;
								alert("The label "+label+" is already used in "+graph.yData);
							}
						});
						
						if (!dupFlag){
							worksheet.data[graph.yData].push(
								{"label": label,
								 "value": graph.yHoriz.invert(mouseX)}
							);
							worksheet.labelMasterList.push(label);
							worksheet.edited[graph.yData] = true;
							
							graphCollection.editData(worksheet, graph.yData,graph.yData,worksheet.data[graph.yData]);
							
							if (!graphCollection.labelColors.hasOwnProperty(label))
								graphCollection.labelColors[label] = graphCollection.colorScale(parseInt(Math.random()*20));
							
							if (label == "defaultLabel"+graphCollection.defaultLabel)
								graphCollection.defaultLabel++;
						}
					} else {
						worksheet.labelMasterList.push("defaultLabel"+graphCollection.defaultLabel);
						
						worksheet.data[graph.yData].push(
							{"label": "defaultLabel"+graphCollection.defaultLabel,
							 "value": graph.yHoriz.invert(mouseX)}
						);
						graphCollection.editData(worksheet, graph.yData,graph.yData,worksheet.data[graph.yData]);
						
						if (!graphCollection.labelColors.hasOwnProperty("defaultLabel"+graphCollection.defaultLabel))
								graphCollection.labelColors["defaultLabel"+graphCollection.defaultLabel] = graphCollection.colorScale(parseInt(Math.random()*20));
						
						graphCollection.defaultLabel++;
					}
					vis.render();
					constructDatasetPanel();
				}
			} else {
				dragging = false;
			}
		});
	
	/* Number of datapoints N */
	topDist.add(pv.Label)
		.left(-40)
		.bottom(-40)
		.textAlign("center")
		.textAngle(0)
		.text(function(){return "n = " + graph.data[graph.yData].length})
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
		  .visible(function(){
				if (graphCollection.graphs.length == 2) 
					return this.index % 2 == 0;
				else 
					return true;
			})
		  
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
				var worksheet = null;
				for (key in graphCollection.worksheets){
					if (graphCollection.worksheets[key].data[graph.yData] != undefined)
						worksheet = graphCollection.worksheets[key];
				}
				
				graphCollection.editSinglePoint(worksheet, graph.yData, d.label, graph.yHoriz.invert(topDist.mouse().x));
				
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
				var worksheet = null;
				for (key in graphCollection.worksheets){
					if (graphCollection.worksheets[key].data[graph.yData] != undefined)
						worksheet = graphCollection.worksheets[key];
				}
				var newYData = worksheet.data[graph.yData];
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
				graphCollection.editData(worksheet, graph.yData,graph.yData,newYData);
				
				topDragLabel.visible(false);
				
				vis.render();
				constructDatasetPanel();
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
		.bottom(-62)
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
					var worksheet = null;
					for (key in graphCollection.worksheets){
						if (graphCollection.worksheets[key].data[graph.xData] != undefined)
							worksheet = graphCollection.worksheets[key];
					}
					var mouseX = bottomDist.mouse().x;
					
					if (graph.labelPrompt){
						var label = prompt("Enter a label for the data", "defaultLabel"+graphCollection.defaultLabel);
						
						var dupFlag = false;
						worksheet.data[graph.xData].forEach(function(d){
							if (d.label == label){
								dupFlag = true;
								alert("The label "+label+" is already used in "+graph.xData);
							}
						});
						
						if (!dupFlag){
							worksheet.data[graph.xData].push(
								{"label": label,
								 "value": graph.x.invert(mouseX)}
							);
							worksheet.labelMasterList.push(label);
							worksheet.edited[graph.xData] = true;
							
							graphCollection.editData(worksheet, graph.xData,graph.xData,worksheet.data[graph.xData]);
							
							if (!graphCollection.labelColors.hasOwnProperty(label))
								graphCollection.labelColors[label] = graphCollection.colorScale(parseInt(Math.random()*20));
							
							if (label == "defaultLabel"+graphCollection.defaultLabel)
								graphCollection.defaultLabel++;
						}
					} else {
						worksheet.labelMasterList.push("defaultLabel"+graphCollection.defaultLabel);
						
						worksheet.data[graph.xData].push(
							{"label": "defaultLabel"+graphCollection.defaultLabel,
							 "value": graph.x.invert(mouseX)}
						);
						graphCollection.editData(worksheet, graph.xData,graph.xData,worksheet.data[graph.xData]);
						
						if (!graphCollection.labelColors.hasOwnProperty("defaultLabel"+graphCollection.defaultLabel))
								graphCollection.labelColors["defaultLabel"+graphCollection.defaultLabel] = graphCollection.colorScale(parseInt(Math.random()*20));
						
						graphCollection.defaultLabel++;
					}
					vis.render();
					constructDatasetPanel();
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
		.left(-40)
		.bottom(-40)
		.textAlign("center")
		.textAngle(0)
		.text(function(){return "n = " + graph.data[graph.xData].length})
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
		  .visible(function(){
				if (graphCollection.graphs.length == 2) 
					return this.index % 2 == 0;
				else 
					return true;
			})
		
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
				
				var worksheet = null;
				for (key in graphCollection.worksheets){
					if (graphCollection.worksheets[key].data[graph.xData] != undefined)
						worksheet = graphCollection.worksheets[key];
				}
				
				graphCollection.editSinglePoint(worksheet, graph.xData, d.label, graph.x.invert(bottomDist.mouse().x));

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
				var worksheet = null;
				for (key in graphCollection.worksheets){
					if (graphCollection.worksheets[key].data[graph.xData] != undefined)
						worksheet = graphCollection.worksheets[key];
				}
				
				var newXData = worksheet.data[graph.xData];
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
				graphCollection.editData(worksheet, graph.xData,graph.xData,newXData);
				
				botDragLabel.visible(false);
				
				vis.render();
				constructDatasetPanel();
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
				var worksheet = null;
				for (key in graphCollection.worksheets){
					if (graphCollection.worksheets[key].data[graph.xData] != undefined)
						worksheet = graphCollection.worksheets[key];
				}
				var mouseX = graphPanel.mouse().x;
				
				if (graph.labelPrompt){
					var label = prompt("Enter a label for the data", "defaultLabel"+graphCollection.defaultLabel);
					
					var dupFlag = false;
					worksheet.data[graph.xData].forEach(function(d){
						if (d.label == label){
							dupFlag = true;
							alert("The label "+label+" is already used in "+graph.xData);
						}
					});
					
					if (!dupFlag){
						worksheet.data[graph.xData].push(
							{"label": label,
							 "value": graph.x.invert(mouseX)}
						);
						worksheet.labelMasterList.push(label);
						worksheet.edited[graph.xData] = true;
						
						graphCollection.editData(worksheet, graph.xData,graph.xData,worksheet.data[graph.xData]);
						
						if (!graphCollection.labelColors.hasOwnProperty(label))
							graphCollection.labelColors[label] = graphCollection.colorScale(parseInt(Math.random()*20));
						
						if (label == "defaultLabel"+graphCollection.defaultLabel)
							graphCollection.defaultLabel++;
					}
				} else {
					worksheet.labelMasterList.push("defaultLabel"+graphCollection.defaultLabel);
					
					worksheet.data[graph.xData].push(
						{"label": "defaultLabel"+graphCollection.defaultLabel,
						 "value": graph.x.invert(mouseX)}
					);
					graphCollection.editData(worksheet, graph.xData,graph.xData,worksheet.data[graph.xData]);
					
					if (!graphCollection.labelColors.hasOwnProperty("defaultLabel"+graphCollection.defaultLabel))
							graphCollection.labelColors["defaultLabel"+graphCollection.defaultLabel] = graphCollection.colorScale(parseInt(Math.random()*20));
					
					graphCollection.defaultLabel++;
				}
				vis.render();
				constructDatasetPanel();
			}
		} else {
			dragging = false;
		}
	});
	
	/* Number of datapoints N */
	graphPanel.add(pv.Label)
		.left(-40)
		.bottom(-40)
		.textAlign("center")
		.textAngle(0)
		.text(function(){return "n = " + graph.data[graph.xData].length})
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
			.visible(function(){
				if (graphCollection.graphs.length == 2) 
					return this.index % 2 == 0;
				else 
					return true;
			})
			
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
				
				var worksheet = null;
				for (key in graphCollection.worksheets){
					if (graphCollection.worksheets[key].data[graph.xData] != undefined)
						worksheet = graphCollection.worksheets[key];
				}
				
				graphCollection.editSinglePoint(worksheet, graph.xData, d.label, graph.x.invert(graphPanel.mouse().x));
				
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
				var worksheet = null;
				for (key in graphCollection.worksheets){
					if (graphCollection.worksheets[key].data[graph.xData] != undefined)
						worksheet = graphCollection.worksheets[key];
				}
				
				var newXData = worksheet.data[graph.xData];
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
				graphCollection.editData(worksheet, graph.xData,graph.xData,newXData);
				
				dragLabel.visible(false);
				
				vis.render();
				constructDatasetPanel();
			}
		})
		.event("touchstart", function(d){
			//if (graphCollection.editModeEnabled){
				touch.dragType = "dataX";
				touch.dataObj = d;
				touch.dragging = true;
				touch.graphIndex = index;
				touch.graphPanel = graphPanel;
				touch.dragLabel = dragLabel;
			//}
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
	
function constructYDistGraph(graph,index,graphPanel){
	graphPanel.event("click", function(){
		hideMenus();
		if (!dragging){
			if (graphCollection.editModeEnabled){
				var worksheet = null;
				for (key in graphCollection.worksheets){
					if (graphCollection.worksheets[key].data[graph.yData] != undefined)
						worksheet = graphCollection.worksheets[key];
				}
				var mouseY = graph.h - graphPanel.mouse().y;
				
				if (graph.labelPrompt){
					var label = prompt("Enter a label for the data", "defaultLabel"+graphCollection.defaultLabel);
					
					var dupFlag = false;
					worksheet.data[graph.yData].forEach(function(d){
						if (d.label == label){
							dupFlag = true;
							alert("The label "+label+" is already used in "+graph.yData);
						}
					});
					
					if (!dupFlag){
						worksheet.data[graph.yData].push(
							{"label": label,
							 "value": graph.y.invert(mouseY)}
						);
						worksheet.labelMasterList.push(label);
						worksheet.edited[graph.yData] = true;
						
						graphCollection.editData( worksheet,
																			graph.yData, 
																			graph.yData, 
																			worksheet.data[graph.yData]);
						
						if (!graphCollection.labelColors.hasOwnProperty(label))
							graphCollection.labelColors[label] = graphCollection.colorScale(parseInt(Math.random()*20));
						
						if (label == "defaultLabel"+graphCollection.defaultLabel)
							graphCollection.defaultLabel++;
					}
					
				} else {
					worksheet.labelMasterList.push("defaultLabel"+graphCollection.defaultLabel);
					
					worksheet.data[graph.yData].push(
						{"label": "defaultLabel"+graphCollection.defaultLabel,
						 "value": graph.y.invert(mouseY)}
					);
					graphCollection.editData( worksheet,
																		graph.yData,
																		graph.yData,
																		worksheet.data[graph.yData]);
					
					if (!graphCollection.labelColors.hasOwnProperty("defaultLabel"+graphCollection.defaultLabel))
							graphCollection.labelColors["defaultLabel"+graphCollection.defaultLabel] = graphCollection.colorScale(parseInt(Math.random()*20));
					
					graphCollection.defaultLabel++;
				}
				vis.render();
				constructDatasetPanel();
			}
		} else {
			dragging = false;
		}
	});
	
	/* Number of datapoints N */
	graphPanel.add(pv.Label)
		.left(-40)
		.bottom(-40)
		.textAlign("center")
		.textAngle(0)
		.text(function(){return "n = " + graph.data[graph.yData].length})
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
				var worksheet = null;
				for (key in graphCollection.worksheets){
					if (graphCollection.worksheets[key].data[graph.yData] != undefined)
						worksheet = graphCollection.worksheets[key];
				}
				
				graphCollection.editSinglePoint(worksheet, graph.yData, d.label, graph.y.invert(graph.h - graphPanel.mouse().y));
				
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
				var worksheet = null;
				for (key in graphCollection.worksheets){
					if (graphCollection.worksheets[key].data[graph.yData] != undefined)
						worksheet = graphCollection.worksheets[key];
				}
				var newYData = worksheet.data[graph.yData];
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
				graphCollection.editData(worksheet, graph.yData,graph.yData,newYData);
				
				dragLabel.visible(false);
				
				vis.render();
				constructDatasetPanel();
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
										"onmousedown=\"javascript:legPanDragStart(event,'"+graph.yData+"',"+index+",'y')\""+
										"ontouchstart=\"legPanTouchStart(event, '"+graph.yData+"',"+index+",'y')\""+
										"ontouchend=\"legPanTouchEnd(event)\""+
										"ontouchmove=\"legPanTouchMove(event)\""+
										">"+
										"<center><p style=\"margin-top:11px; font:"+fontString+";\">"+
										(graph.yData != null ? graph.yData : "Drag a dataset here to assign it to the Y-Axis.")+
										"</p></center>"+
										"</div>");
	}
	//Y-Axis
	else {
		$('body').prepend("<div class=\"axisDef\" id=\"YAxis"+index+"\""+
											"onmouseover=\"this.className='axisOver'\""+
											"onmouseout=\"this.className='axisDef'\""+
											"onmousedown=\"javascript:legPanDragStart(event,'"+graph.yData+"',"+index+",'y')\""+
											"ontouchstart=\"legPanTouchStart(event, '"+graph.yData+"',"+index+",'y')\""+
											"ontouchmove=\"legPanTouchMove(event)\""+
											"ontouchend=\"legPanTouchEnd(event)\""+
											">"+
											"<center><p style=\"margin-top:10px; font:"+fontString+";\">"+
											(graph.yData != null ? graph.yData : "Drag a dataset here to assign it to the Y-Axis.")+
											"</p></center>"+
											"</div>");
	}
	//X-Axis
	$('body').prepend("<div class=\"axisDef\" id=\"XAxis"+index+"\""+
										"onmouseover=\"this.className='axisOver'\""+
										"onmouseout=\"this.className='axisDef'\""+
										"onmousedown=\"javascript:legPanDragStart(event,'"+graph.xData+"',"+index+",'x')\""+
										"ontouchstart=\"legPanTouchStart(event, '"+graph.xData+"',"+index+",'x')\""+
										"ontouchmove=\"legPanTouchMove(event)\""+
										"ontouchend=\"legPanTouchEnd(event)\""+
										">"+
										"<center><p style=\"margin-top:12px; font:"+fontString+";\">"+
										(graph.xData != null ? graph.xData : "Drag a dataset here to assign it to the X-Axis.")+
										"</p></center>"+
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
																						graph.h/2+20 -1 )
															.css('height', 40+"px")
															.css('width', graph.w+"px")
															.css('z-index', 1)
															
	$('#YAxis'+index).css('position', 'absolute')
										.css('left', $('span').offset().left - (graph.h-40)/2 +
													index * graph.w + index * 131 + 2)
										.css('top', $('span').offset().top + graphCollection.padTop+40 + (graph.h-40)/2)
										.css('height', 40+"px")
										.css('width', graph.h+"px")
										.css("-webkit-transform", "rotate(270deg)") 
										.css("-moz-transform", "rotate(270deg)")	
										.css('z-index', 1)
															
	$('#XAxis'+index).css('position', 'absolute')
										.css('left', $('span').offset().left + 
																	graphCollection.padLeft +
																	60 + index * graph.w + index * 130 )
										.css('top', $('span').offset().top + 
																	graphCollection.padTop +
																	graph.h + 60 - 2)
										.css('height', 40+"px")
										.css('width', graph.w+"px")
										.css('z-index', 1)
}

function positionAndSizeGraphTitle(graph,index){
	$('#graphTitle'+index).css('position', 'absolute')
															.css('height', 40+"px")
															.css('width', graph.w+"px")
															.css('left', $('span').offset().left + 
																						graphCollection.padLeft + 60 +
																						index * graph.w + index * 130 )
															.css('top', $('span').offset().top + 
																						graphCollection.padTop - 25)
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


function toggleDatasetMenu() {
	$('#datasets').css('top',$('span').offset().top);
	if (!graphCollection.datasetsMenuShowing){
		$('#datasets').show();
		graphCollection.datasetsMenuShowing = true;
		positionAndSizeGraph();
		positionGraphMenuOverGraph(graphCollection.selectedGraphIndex, graphCollection);
		positionDisplayMenu();
		constructVis();
		
	} else {
		$('#datasets').hide();
		graphCollection.datasetsMenuShowing = false;
		positionAndSizeGraph();
		positionGraphMenuOverGraph(graphCollection.selectedGraphIndex, graphCollection);
		positionDisplayMenu();
		constructVis();
		
		
	}
	for(var i=0; i<graphCollection.graphs.length;i++){
		positionAndSizeAxisPanels(graphCollection.graphs[i],i);
		positionAndSizeGraphTitle(graphCollection.graphs[i],i);
	}
}
