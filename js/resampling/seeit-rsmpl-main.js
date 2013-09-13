//Entry Point
var graphCollection = new GraphCollection();
var vis = {};
var touch = new Touch();
var fontString = "bold 14px arial";
var largeFontString = "bold 18px arial";
var dragging = false;
var updateTimer = null;
var displayOptionsShow =  false;
var worksheetMenuShow = false;

//variables for resampling
var resamplingInProgress = false;
var resampleTimer = null;
var resamplePop1Mean = null;
var resamplePop2Mean = null;
var resampleResetPopulation = true;
var population = [];
var replacementPop1 = [];
var replacementPop2 = [];

var buttonWidths = [[87, 60, 34], 		//Datasets Toggle
										[85, 55, 34],			//Display Options
										[75, 45, 34],			//New Graph
										[95, 67, 34],			//Advanced Mode
										[66, 40, 34],			//Edit Mode
										[73, 47, 32],			//Fit Scales
										[103, 78, 32]			//Resampling
									 ];

var exampleSpreadsheets = [ ];
var preloadedDataSets = [];

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
		exampleSpreadsheets.push(new Spreadsheet('0AuGPdilGXQlBdEd4SU44cVI5TXJxLXd3a0JqS3lHTUE'));
		exampleSpreadsheets.push(new Spreadsheet('0AuGPdilGXQlBdE1idkxMSFNjbnFJWjRKTnA2Zlc4NXc'));
		exampleSpreadsheets.push(new Spreadsheet('0AqRJFVxKpZCVdE92TEF1djZDcEVrZlR3clpZSmlxQmc'));
		exampleSpreadsheets.push(new Spreadsheet('0AqRJFVxKpZCVdE1YakcyTWNncWtZa1pUcks1S2VtN2c'));
		exampleSpreadsheets.push(new Spreadsheet('0AqRJFVxKpZCVdEU4MmxSUG9NMTBkaEFzRDRXRFliWFE'));
		exampleSpreadsheets.push(new Spreadsheet('0AqRJFVxKpZCVdGJ2dGYtWHlrNmFYUURydGYtekV2amc'));
		exampleSpreadsheets.push(new Spreadsheet('0AqRJFVxKpZCVdGdtQ3pWU3Y4X29INEFjYTZyeVRSN0E'));
		exampleSpreadsheets.push(new Spreadsheet('0Al5kfBmMhbwmdGJ2b1A1eWtMdUF4bWJxcnhBQ0Fsb3c'));			//Gapminder
		exampleSpreadsheets.push(new Spreadsheet('0AmS4TeF7pWtWdGlCcVdQa184SzFNeTRjM1F4NmNfZlE'));			//Skin Cancer Fig 8
		exampleSpreadsheets.push(new Spreadsheet('0AmS4TeF7pWtWdHd4SEpzUV9rUlZTNUJhdGlqM2dQQVE'));			//Skin Cancer Fig 4
		exampleSpreadsheets.push(new Spreadsheet('0AmS4TeF7pWtWdFNBRzg1d0U4QjVzcVlOZW1KWUhCUFE'));			//Skin Cancer Fig 2
		exampleSpreadsheets.push(new Spreadsheet('0AuGf3AP4DbKAdEZBUVV6cFFkM19yZHB4N2YwLVNXSXc'));			//Doll and Hill
		exampleSpreadsheets.push(new Spreadsheet('0AuGf3AP4DbKAdDNCMFhJTnZpSWtMR1dfZU0zSUtWNXc'));			//Giraffe Data
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
				
			} else if (param[0].indexOf('set') != -1){
				preloadedDataSets.push(param[1]);
			}
		});
	}
	
	//Push worksheets in localStorage
	for (var w_title in localStorage){
		var worksheet = JSON.parse(localStorage[w_title]);
		console.log(worksheet);
		worksheet.fromLocalStorage = true;
		exampleSpreadsheets.push(new Spreadsheet(worksheet));
	}
	
} else {
	$('p#loadingMsg').hide();
	$("#ieWarning").show();
}	

//Preload a worksheet
//var preload = window.location.search;
//var preloadedDataSets = [];
//var exclusiveLoad = false;	
//if (preload.substring(0, 1) == '?') {
		//console.log(preload);
		
		//preload = preload.substring(1);
		
		//if (preload.substring(0, 1) == '!'){
			//exclusiveLoad = true;
			//preload = preload.substring(1);
		//}
		
		
		//preload.split("&").forEach(function(url){
			//var key = parseSpreadsheetKeyFromURL(url);
			
			//var preloadedSet = parsePreloadedSetFromURL(url);
			//if (preloadedSet){
				//preloadedDataSets.push(preloadedSet);
			//}
			
			//if(key){
				//console.log("valid key");
				
				//var exists = false;
				//exampleSpreadsheets.forEach(function(s){
					//if (s.key == key) exists = true;
				//});
				
				//if (!exists) {
					//exampleSpreadsheets.push(new Spreadsheet(key));
					////constructVis();
				//}
				////else alert("Error: the google spreadsheet you specified in the URL is one of the default spreadsheets already included.");
			//}
		//});
		
		
//}

//if (!exclusiveLoad){
	//exampleSpreadsheets.push(new Spreadsheet('0AuGPdilGXQlBdEd4SU44cVI5TXJxLXd3a0JqS3lHTUE'));
	//exampleSpreadsheets.push(new Spreadsheet('0AuGPdilGXQlBdE1idkxMSFNjbnFJWjRKTnA2Zlc4NXc'));
	//exampleSpreadsheets.push(new Spreadsheet('0AqRJFVxKpZCVdE92TEF1djZDcEVrZlR3clpZSmlxQmc'));
	//exampleSpreadsheets.push(new Spreadsheet('0AqRJFVxKpZCVdE1YakcyTWNncWtZa1pUcks1S2VtN2c'));
	//exampleSpreadsheets.push(new Spreadsheet('0AqRJFVxKpZCVdEU4MmxSUG9NMTBkaEFzRDRXRFliWFE'));
	//exampleSpreadsheets.push(new Spreadsheet('0AqRJFVxKpZCVdGJ2dGYtWHlrNmFYUURydGYtekV2amc'));
	//exampleSpreadsheets.push(new Spreadsheet('0AqRJFVxKpZCVdGdtQ3pWU3Y4X29INEFjYTZyeVRSN0E'));
	//exampleSpreadsheets.push(new Spreadsheet('0Al5kfBmMhbwmdGJ2b1A1eWtMdUF4bWJxcnhBQ0Fsb3c'));			//Gapminder
	//exampleSpreadsheets.push(new Spreadsheet('0AmS4TeF7pWtWdGlCcVdQa184SzFNeTRjM1F4NmNfZlE'));			//Skin Cancer Fig 8
	//exampleSpreadsheets.push(new Spreadsheet('0AmS4TeF7pWtWdHd4SEpzUV9rUlZTNUJhdGlqM2dQQVE'));			//Skin Cancer Fig 4
	//exampleSpreadsheets.push(new Spreadsheet('0AmS4TeF7pWtWdFNBRzg1d0U4QjVzcVlOZW1KWUhCUFE'));			//Skin Cancer Fig 2
	//exampleSpreadsheets.push(new Spreadsheet('0AuGf3AP4DbKAdEZBUVV6cFFkM19yZHB4N2YwLVNXSXc'));			//Doll and Hill
	//exampleSpreadsheets.push(new Spreadsheet('0AuGf3AP4DbKAdDNCMFhJTnZpSWtMR1dfZU0zSUtWNXc'));			//Giraffe Data
//}		

// Populate dataset drop down menu
var numWorksheetsLoaded = 0;
jQuery('body').bind('WorksheetLoaded', function(event) {
	if (event.refresh){
		graphCollection.addWorksheet(event.worksheet);
	}
	
  numWorksheetsLoaded++;
  $('p#loadingMsg').html("Loading "+(numWorksheetsLoaded/numWorksheets*100).toFixed(0)+"%");
  if (numWorksheetsLoaded >= numWorksheets){
		
		jQuery('p#loadingMsg').hide();
		constructVis();
		showHideAdvancedOptions();
		positionGroupingMenuOverGraph(0,graphCollection);
		positionDisplayMenu();
		toggleDatasetMenu();
		
		if (preloadedDataSets.length >= 2){
			if (graphCollection.data[preloadedDataSets[0].replace(/%20/g," ")] != undefined){
				graphCollection.graphs[2].addCategory(preloadedDataSets[0].replace(/%20/g," "));
			} else {
				alert("Failed to automatically load a dataset. Try assigning it manually.");
			}
			
			if (graphCollection.data[preloadedDataSets[1].replace(/%20/g," ")] != undefined){
				graphCollection.graphs[2].secondGraph.addCategory(preloadedDataSets[1].replace(/%20/g," "));
			} else {
				alert("Failed to automatically load a dataset. Try assigning it manually.");
			}
		}	
  }
});

function displayMenuButtonHandler(){
	if (displayOptionsShow){
		$('#displayOptions').slideUp();
	} else {
		positionDisplayMenu();
		$('#displayOptions').slideDown();
	}
	displayOptionsShow = !displayOptionsShow
}

function constructVis(){
	if (jQuery('span').length != 0){
		closeColorPickers();
		jQuery('span').remove();
	}
	
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
		.fillStyle("white")
		
	if(!graphCollection.printMode){
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
			.top(-31)
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
			.url("http://centerforbiophotonics.github.com/SeeIt3/img/dataset.png")  //fix this
			.width(25)
			.height(25)
			.top(2)
			.left(2)
			.cursor("pointer")
			.title(function(){
				if(graphCollection.datasetsMenuShowing)
					return "Hide Datasets";
				else
					return "Show Datasets";
			})
			.visible(function() {
				if (graphCollection.buttonIcon)
					return true;
				else
					return false;
			})
			.event("click", toggleDatasetMenu)
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
			.top(-31)
			.lineWidth(1)
			.event("click", displayMenuButtonHandler)
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
			.event("click", displayMenuButtonHandler)
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
		//var newGrphPanel = vis.add(pv.Panel)
			//.data([2])
			//.events("all")
			//.cursor("pointer")
			//.title("Add a new empty graph")
			//.height(30)
			//.width(topButtonWidth)
			//.left(topButtonLeft)
			//.top(-31)
			//.lineWidth(1)
			//.event("click", function(){
				//graphCollection.addGraph();
				//constructVis();
			//})
			//.event("mouseover", function(d){
				//this.strokeStyle("black");
				//this.render();
			//})
			//.event("mouseout", function(d){ 
				//this.strokeStyle(pv.rgb(0,0,0,0));
				//this.render();
			//})
			
		//newGrphPanel.add(pv.Image)
			//.url("http://centerforbiophotonics.github.com/SeeIt3/img/newGraph.png")  //fix this
			//.width(30)
			//.height(30)
			//.top(0)
			//.left(2)
			//.cursor("pointer")
			//.title("Add a new empty graph")
			//.event("click", function(){
				//graphCollection.addGraph();
				//constructVis();
			//})
			//.visible(function() {
				//if (graphCollection.buttonIcon)
					//return true;
				//else
					//return false;
			//})
			//.anchor("left").add(pv.Label)
				//.left(function(){
					//if (graphCollection.buttonText && !graphCollection.buttonIcon)
						//return 2;
					//else
					 //return 32;
				//})
				//.top(10)
				//.text("New")
				//.font("bold 12px arial")
				//.visible(function() {
					//if (graphCollection.buttonText)
						//return true;
					//else
						//return false;
				//})
			//.anchor("left").add(pv.Label)
				//.left(function(){
					//if (graphCollection.buttonText && !graphCollection.buttonIcon)
						//return 2;
					//else
					 //return 32;
				//})
				//.top(22)
				//.text("Graph")
				//.font("bold 12px arial")
				//.visible(function() {
					//if (graphCollection.buttonText)
						//return true;
					//else
						//return false;
				//})
				
		///*Toggle Basic/Advanced User Mode*/
		//var togUserModePanel = vis.add(pv.Panel)
			//.data([3])
			//.events("all")
			//.cursor("pointer")
			//.title("Toggle advanced mode")
			//.height(30)
			//.width(topButtonWidth)
			//.left(topButtonLeft)
			//.top(-31)
			//.lineWidth(1)
			//.event("click", function(){
				//graphCollection.advancedUser = !(graphCollection.advancedUser);
				//showHideAdvancedOptions();
			//})
			//.event("mouseover", function(d){
				//this.strokeStyle("black");
				//this.render();
			//})
			//.event("mouseout", function(d){ 
				//this.strokeStyle(pv.rgb(0,0,0,0));
				//this.render();
			//})
			
		//togUserModePanel.add(pv.Image)
			//.url(function(){
				//if (graphCollection.advancedUser)
					//return "http://centerforbiophotonics.github.com/SeeIt3/img/advModeON.png"
				//else
					//return "http://centerforbiophotonics.github.com/SeeIt3/img/advModeOFF.png"
			//})
			//.width(30)
			//.height(26)
			//.top(2)
			//.left(0)
			//.cursor("pointer")
			//.title("Toggle basic/advanced mode")
			//.event("click", function(){
				//graphCollection.advancedUser = !(graphCollection.advancedUser);
				//showHideAdvancedOptions();
			//})
			//.visible(function() {
				//if (graphCollection.buttonIcon)
					//return true;
				//else
					//return false;
			//})
			//.anchor("left").add(pv.Label)
				//.left(function(){
					//if (graphCollection.buttonText && !graphCollection.buttonIcon)
						//return 2;
					//else
					 //return 28;
				//})
				//.text(function(){return "Advanced"})
				//.textStyle(function(){
					//if (graphCollection.advancedUser)
						//return "red"
					//else
						//return "grey"
				//})
				//.top(10)
				//.font("bold 12px arial")
				//.visible(function() {
					//if (graphCollection.buttonText)
						//return true;
					//else
						//return false;
				//})
			//.anchor("left").add(pv.Label)
				//.left(function(){
					//if (graphCollection.buttonText && !graphCollection.buttonIcon)
						//return 2;
					//else
						//return 28;
				//})
				//.text(function(){return "Mode"})
				//.textStyle(function(){
					//if (graphCollection.advancedUser)
						//return "red"
					//else
						//return "grey"
				//})
				//.top(22)
				//.font("bold 12px arial")
				//.visible(function() {
					//if (graphCollection.buttonText)
						//return true;
					//else
						//return false;
				//})
				
			
		///* Toggle Edit Mode Button */
		//var togEditPanel = vis.add(pv.Panel)
			//.data([4])
			//.events("all")
			//.cursor("pointer")
			//.title("Toggle edit mode")
			//.height(30)
			//.width(topButtonWidth)
			//.left(topButtonLeft)
			//.top(-31)
			//.lineWidth(1)
			//.visible(function() {
				//if (graphCollection.advancedUser)
					//return true;
				//else
					//return false;
			//})
			//.event("click", function(){
				//graphCollection.editModeEnabled = !(graphCollection.editModeEnabled);
				//constructVis();
			//})
			//.event("mouseover", function(d){
				//this.strokeStyle("black");
				//this.render();
			//})
			//.event("mouseout", function(d){ 
				//this.strokeStyle(pv.rgb(0,0,0,0));
				//this.render();
			//})
			
		//togEditPanel.add(pv.Image)
			//.url(function(){
				//if (graphCollection.editModeEnabled)
					//return "http://centerforbiophotonics.github.com/SeeIt3/img/handON.png"
				//else
					//return "http://centerforbiophotonics.github.com/SeeIt3/img/hand.png"
			//})
			//.width(30)
			//.height(26)
			//.top(2)
			//.left(0)
			//.cursor("pointer")
			//.title("Toggle edit mode")
			//.event("click", function(){
				//graphCollection.editModeEnabled = !(graphCollection.editModeEnabled);
				//vis.render();
			//})
			//.visible(function() {
				//if (graphCollection.buttonIcon)
					//return true;
				//else
					//return false;
			//})
			//.anchor("left").add(pv.Label)
				//.left(function(){
					//if (graphCollection.buttonText && !graphCollection.buttonIcon)
						//return 2;
					//else
					 //return 28;
				//})
				//.top(10)
				//.text("Edit")
				//.font("bold 12px arial")
				//.textStyle(function(){
					//if (graphCollection.editModeEnabled)
						//return "red"
					//else
						//return "black"
				//})
				//.visible(function() {
					//if (graphCollection.buttonText)
						//return true;
					//else
						//return false;
				//})
			//.anchor("left").add(pv.Label)
				//.left(function(){
					//if (graphCollection.buttonText && !graphCollection.buttonIcon)
						//return 2;
					//else
					 //return 28;
				//})
				//.top(22)
				//.text("Mode")
				//.font("bold 12px arial")
				//.textStyle(function(){
					//if (graphCollection.editModeEnabled)
						//return "red"
					//else
						//return "black"
				//})
				//.visible(function() {
					//if (graphCollection.buttonText)
						//return true;
					//else
						//return false;
				//})
		
		////Fit all graphs to scale button
		//var fitScalePanel = vis.add(pv.Panel)
			//.data([5])
			//.events("all")
			//.cursor("pointer")
			//.title("Scale all graphs identically")
			//.height(30)
			//.width(topButtonWidth)
			//.left(topButtonLeft)
			//.top(-31)
			//.lineWidth(1)
			//.visible(function() {
				//if (graphCollection.advancedUser)
					//return true;
				//else
					//return false;
			//})
			//.event("click", function(){
				//graphCollection.graphs.forEach(function(graph){
					//graph.customScale = false;
					//graph.fitScaleToData = false;
				//});
				//graphCollection.scaleAllGraphsToFit();
				//vis.render();
			//})
			//.event("mouseover", function(d){
				//this.strokeStyle("black");
				//this.render();
			//})
			//.event("mouseout", function(d){ 
				//this.strokeStyle(pv.rgb(0,0,0,0));
				//this.render();
			//})
			
		//fitScalePanel.add(pv.Image)
			//.url(function(){
				//return "http://centerforbiophotonics.github.com/SeeIt3/img/ruler.png"
			//})
			//.width(30)
			//.height(30)
			//.top(1)
			//.left(0)
			//.cursor("pointer")
			//.title("Scale all graphs identically.")
			//.event("click", function(){
				//graphCollection.graphs.forEach(function(graph){
					//graph.customScale = false;
					//graph.fitScaleToData = false;
				//});
				//graphCollection.scaleAllGraphsToFit();
				//vis.render();
			//})
			//.visible(function() {
				//if (graphCollection.buttonIcon)
					//return true;
				//else
					//return false;
			//})
			//.anchor("left").add(pv.Label)
				//.left(function(){
					//if (graphCollection.buttonText && !graphCollection.buttonIcon)
						//return 2;
					//else
					 //return 28;
				//})
				//.top(10)
				//.text("Fit")
				//.font("bold 12px arial")
				//.textStyle(function(){return "black"})
				//.visible(function() {
					//if (graphCollection.buttonText)
						//return true;
					//else
						//return false;
				//})
			//.anchor("left").add(pv.Label)
				//.left(function(){
					//if (graphCollection.buttonText && !graphCollection.buttonIcon)
						//return 2;
					//else
					 //return 28;
				//})
				//.top(22)
				//.text("Scales")
				//.font("bold 12px arial")
				//.textStyle(function(){return "black"})
				//.visible(function() {
					//if (graphCollection.buttonText)
						//return true;
					//else
						//return false;
				//})
				
		////Add a Resampling Graph
		//var resamplingPanel = vis.add(pv.Panel)
			//.data([6])
			//.events("all")
			//.cursor("pointer")
			//.title("Toggle Resampling")
			//.height(30)
			//.width(topButtonWidth)
			//.left(topButtonLeft)
			//.top(-31)
			//.lineWidth(1)
			//.visible(function() {
				//if (graphCollection.advancedUser)
					//return true;
				//else
					//return false;
			//})
			//.event("click", function(){
				//if (!graphCollection.resamplingEnabled){
					//graphCollection.resamplingEnabled = true;
					//graphCollection.addResamplingGraph(graphCollection.selectedGraphIndex);
				//}else{
					//graphCollection.resamplingEnabled = false;
					//graphCollection.removeGraph(graphCollection.graphs[0]);
					//graphCollection.removeGraph(graphCollection.graphs[0]);
					//graphCollection.removeGraph(graphCollection.graphs[0]);
				//}
				
				//constructVis();
			//})
			//.event("mouseover", function(d){
				//this.strokeStyle("black");
				//this.render();
			//})
			//.event("mouseout", function(d){ 
				//this.strokeStyle(pv.rgb(0,0,0,0));
				//this.render();
			//})
			
		//resamplingPanel.add(pv.Image)
			//.url(function(){
				//if (graphCollection.resamplingEnabled)
					//return "http://centerforbiophotonics.github.com/SeeIt3/img/shuffle-ON.png"
				//else
					//return "http://centerforbiophotonics.github.com/SeeIt3/img/shuffle-OFF.png"
				
			//})
			//.width(30)
			//.height(30)
			//.top(1)
			//.left(0)
			//.cursor("pointer")
			//.title("Toggle Resampling")
			//.event("click", function(){
				//if (!graphCollection.resamplingEnabled){
					//graphCollection.resamplingEnabled = true;
					//graphCollection.addResamplingGraph(graphCollection.selectedGraphIndex);
				//}else{
					//graphCollection.resamplingEnabled = false;
					//graphCollection.removeGraph(graphCollection.graphs[0]);
				//}
				
				//constructVis();
			//})
			//.visible(function() {
				//if (graphCollection.buttonIcon)
					//return true;
				//else
					//return false;
			//})
			//.anchor("left").add(pv.Label)
				//.left(function(){
					//if (graphCollection.buttonText && !graphCollection.buttonIcon)
						//return 2;
					//else
					 //return 28;
				//})
				//.top(15)
				//.text("Resampling")
				//.font("bold 12px arial")
				//.textStyle(function(){
					//if (graphCollection.resamplingEnabled)
						//return "red"
					//else
						//return "black"
				//})
				//.visible(function() {
					//if (graphCollection.buttonText)
						//return true;
					//else
						//return false;
				//})
	}
		
	constructDatasetPanel();
	
	graphCollection.graphs.forEach(function(graph,index,graphs){
		constructGraphPanel(graph, index);
	});
	vis.render();
	
	if (graphCollection.datasetsMenuShowing) 
		$('span').css('position', 'absolute')
						 .css('left',$('#datasets').width()+29)
						 .css('z-index', -1);
						 
	//remove and redraw sample options
	$('.sampleOptions').remove();
	$('.resampleOptions').remove();
	graphCollection.graphs.forEach(function(graph,i){
		if (graph.isSamplingGraph){
			constructSampleOptionsMenu(graph,i);
			positionSampleOptions(graph,i);
			if (graph.samplingFrom.includedCategories.length > 0)
				$('#sampleOptions'+i).show();
			else
				$('#sampleOptions'+i).hide();
		}
		if (graph.testMode == "sampling"){
			constructSampleButton(graph,i);
			positionSampleButton(graph,i);
		}
		if (graph.testMode == "resampling"){
			constructResampleControlPanel(graph,i);
			positionResampleControlPanel(graph,i);
		}
		
		
	})
	
	//resampling population labels
	$('.populationLabels').remove();
	if(graphCollection.resamplingEnabled){
		constructPopulationLabels();
		positionPopulationLabels();
	}
	
	//remove and redraw legends
	$('.legend').remove();
	graphCollection.graphs.forEach(function(graph,i){
		constructLegendPanel(graph,i);
		positionAndSizeLegendPanel(graph,i);
	})

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
							"<td nowrap><div id='treeTitle"+i+"'"+
								"onmousedown='toggleDataSubtree(\"subtree"+i+"\","+i+",\""+w.title+"\")'"+
								"style='cursor:pointer; font:"+fontString+";'>"+w.title+"</div></td>"+
							"</table></tr>"+
							"<div id='subtree"+i+"' "+(graphCollection.datasetsVisible[w.title]?"":"hidden")+">"+
							"<input type='image' src='img/edit.png' style='margin-left:25px;' onclick='openWorksheetMenu(\""+w.title+"\")' width='25' height='25'>"+
							//"<input type='image' src='img/refresh.png' style='margin-left:25px;' onclick='refreshWorksheet(\""+w.title+"\")' width='25' height='25'>"+
							"<input type='image' src='img/question.png' style='margin-left:25px;' onclick='showWorksheetDescription(\""+w.title+"\")' width='30' height='30'>"+
							//"<input type='image' src='img/document.png'  style='margin-left:25px;'onclick='editInGoogleDocs(\""+w.title+"\")' width='25' height='25'>";
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
				var color = graphCollection.categoryColors[key];
				html+="<table style='margin-left:25px;'><tr><td>"+
							"<input id='colorPick"+picker+"' class='color {hash:false}' "+
								"value='"+colorToHex(color.color)+"' "+
								"onchange=\"updateColor('"+key+"', this.color)\" "+
								"style='width:20px; height:20px; font:"+fontString+";'></td>"+
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
							"<td>Add a Worksheet</td></div></tr></table>";
	$('#dataTree').html(html);
	jscolor.init();
}


var dragObj;
function sidePanDragStart(event, category){
	event.preventDefault();
	
	//To prevent a touch event from firing an additional drag event
	if (touch.touch) {
		touch.touch = false;
		return;
	}
	
	dragObj = new Object();
	dragObj.category = category;
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
								 .css('z-index', 10000);
}

function sidePanDragStop(event){
	$('#dragFeedback').hide();
	
	var curX = event.pageX -
						 $('span').offset().left -
						 graphCollection.padLeft + 14;
							
	var curY = event.pageY - 
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
		constructVis();
	}
	
	
	document.body.style.cursor="default";
	document.removeEventListener("mousemove", sidePanDragGo,   true);
	document.removeEventListener("mouseup",   sidePanDragStop, true);
}

function legPanDragStart(event, category, index, i, isSecondGraph){
	if (touch.touch){
		touch.touch = false;
		return;
	}
	
	event.preventDefault();
	
	if (graphCollection.editModeEnabled)
		$('#legCat'+index+"-"+i).attr('class','menuItemSel');
	graphCollection.graphs[index].selectedCategory = category;
	
	dragObj = new Object();
	dragObj.category = category;
	dragObj.index = index;
	dragObj.isSecondGraph = isSecondGraph;
	$('#dragFeedback').html(category);
	$('#dragFeedback').show();
	$('#dragFeedback').css('position', 'absolute')
								 .css('left',event.pageX)
								 .css('top',event.pageY)
								 .css('z-index', 10000);
	
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
}

function legPanDragStop(event){
	$('#dragFeedback').hide();
	
	var curX = event.pageX -
						 $('span').offset().left -
						 graphCollection.padLeft + 14;
							
	var curY = event.pageY - 
						 $('span').offset().top - 
						 graphCollection.padTop;
						 
	if(curX > 0 && curX < graphCollection.w && curY > 0 && curY < graphCollection.h){
		if (graphCollection.graphs.length > 4){
			var which = parseInt(curY/graphCollection.defaultGraphHeight);
			var toGraph = graphCollection.graphs[which];
			var fromGraph = graphCollection.graphs[dragObj.index];
			if (toGraph.addCategory(dragObj.category)){
				fromGraph.removeCategory(dragObj.category);
				if (fromGraph.selectedCategory == dragObj.category)
					fromGraph.selectedCategory = null;
			}
			graphCollection.updateMenuOptions();
		} else {
			var which = parseInt(curY/(graphCollection.h/graphCollection.graphs.length));
			var toGraph = graphCollection.graphs[which];
			var fromGraph = graphCollection.graphs[dragObj.index];
			if (toGraph.addCategory(dragObj.category)){
				fromGraph.removeCategory(dragObj.category);
				if (fromGraph.selectedCategory == dragObj.category)
					fromGraph.selectedCategory = null;
			}
			graphCollection.updateMenuOptions();
		}
	} else {
		var fromGraph = graphCollection.graphs[dragObj.index];
		if (dragObj.isSecondGraph)
			fromGraph = fromGraph.secondGraph;
		
		fromGraph.removeCategory(dragObj.category);
		if (fromGraph.selectedCategory == dragObj.category)
			fromGraph.selectedCategory = null;
	}
	constructVis();
	
	document.body.style.cursor="default";
	document.removeEventListener("mousemove", legPanDragGo,   true);
	document.removeEventListener("mouseup",   legPanDragStop, true);
}

function popLabDragStart(event, popNum){
	if (touch.touch){
		touch.touch = false;
		return;
	}
	
	event.preventDefault();
	
	dragObj = new Object();
	dragObj.popNum = popNum;
	
	$('#dragFeedback').html("Sample "+popNum);
	$('#dragFeedback').show();
	$('#dragFeedback').css('position', 'absolute')
								 .css('left',event.pageX)
								 .css('top',event.pageY)
								 .css('z-index', 10000);
	
	document.body.style.cursor="move";
	document.addEventListener("mousemove", popLabDragGo,   true);
	document.addEventListener("mouseup",   popLabDragStop, true);
}

function popLabDragGo(event){
	event.preventDefault();
	$('#dragFeedback').css('position', 'absolute')
								 .css('left',event.pageX)
								 .css('top',event.pageY)
								 .css('z-index', 10000);
}

function popLabDragStop(event){
	$('#dragFeedback').hide();
	
	var curX = event.pageX -
						 $('span').offset().left -
						 graphCollection.padLeft + 14;
							
	var curY = event.pageY - 
						 $('span').offset().top - 
						 graphCollection.padTop;
						 
	if(curX > 0 && curX < graphCollection.w && curY > 0 && curY < graphCollection.h){
		var which;
		if (graphCollection.graphs.length > 4)
			which = parseInt(curY/graphCollection.defaultGraphHeight);
		else
			which = parseInt(curY/(graphCollection.h/graphCollection.graphs.length));
		
		if (!graphCollection.graphs[which].isIntermedResamplingGraph)	
			graphCollection.graphs[0]["population"+dragObj.popNum] = graphCollection.graphs[which];
		
		resetResampling(0);
	} 
	constructVis();
	
	document.body.style.cursor="default";
	document.removeEventListener("mousemove", popLabDragGo,   true);
	document.removeEventListener("mouseup",   popLabDragStop, true);
}

function popLabTouchStart(event, popNum){
	
	var curX = event.targetTouches[0].clientX;
	var curY = event.targetTouches[0].clientY;
	
	touch.finalX = curX;
	touch.finalY = curY;
	
	event.preventDefault();
	
	dragObj = new Object();
	dragObj.popNum = popNum;
	
	$('#dragFeedback').html("Sample "+popNum);
	$('#dragFeedback').show();
	$('#dragFeedback').css('position', 'absolute')
								 .css('left',curX)
								 .css('top',curY)
								 .css('z-index', 10000);
}

function popLabTouchMove(event){
	event.preventDefault();
	
	var curX = event.targetTouches[0].clientX;
	var curY = event.targetTouches[0].clientY;
	
	touch.finalX = curX;
	touch.finalY = curY;
	
	$('#dragFeedback').css('position', 'absolute')
								 .css('left',curX)
								 .css('top',curY)
								 .css('z-index', 10000);
}

function popLabTouchEnd(event){
	$('#dragFeedback').hide();
	
	var curX = touch.finalX -
							$('span').offset().left -
							graphCollection.padLeft + 14;
	
	var curY = touch.finalY - 
							$('span').offset().top - 
							graphCollection.padTop;
							
	//console.log(curX+"---"+curY);
						 
	//touch.finalX = curX;
	//touch.finalY = curY;
						 
	if(curX > 0 && curX < graphCollection.w && curY > 0 && curY < graphCollection.h){
		var which;
		if (graphCollection.graphs.length > 4)
			which = parseInt(curY/graphCollection.defaultGraphHeight);
		else
			which = parseInt(curY/(graphCollection.h/graphCollection.graphs.length));
			
		graphCollection.graphs[0]["population"+dragObj.popNum] = graphCollection.graphs[which];
		
		resetResampling(0);
		
		//console.log(which);
	} 
	
	touch.touch = true;
	
	constructVis();
}


function closeColorPickers(){
	var picker = 0;
	for (var i=0; i<exampleSpreadsheets.length; i++){
		for (var j=0; j<exampleSpreadsheets[i].worksheets.length; j++){
			for (var key in exampleSpreadsheets[i].worksheets[j].data){
				if (document.getElementById('colorPick'+picker) != null)
					document.getElementById('colorPick'+picker).color.hidePicker()
				picker++;
			}
		}
	} 
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
					graphCollection.selectAUserDefPartition();  //deselect ud partitions
				}
				graphCollection.selectedGraphIndex = index;
				graphCollection.selectedLabel = null;
				graphCollection.updateMenuOptions();
				
				positionGroupingMenuOverGraph(index, graphCollection);
						
				hideMenus();
				if (graphCollection.editModeEnabled){
					var loc = graphPanel.mouse().x;
					if (graph.selectedCategory != null){
						
						var worksheet = "";
						for (var key in graphCollection.worksheets){
							if (graphCollection.worksheets[key].data[graph.selectedCategory] != undefined)
								worksheet = key;
						}
						
						graphCollection.worksheets[worksheet].labelMasterList.push(
							"default"+graphCollection.nextDefaultLabel[graph.selectedCategory]);
						
						graphCollection.data[graph.selectedCategory].push(
							{"label": "default"+graphCollection.nextDefaultLabel[graph.selectedCategory]++,
							 "value": graph.x.invert(loc)}
						);
						
						graphCollection.editData(worksheet, 
																			graph.selectedCategory, 
																			graph.selectedCategory, 
																			graphCollection.data[graph.selectedCategory]
																		);
					} //else if (graph.includedCategories.length < 4){
						//var newCat = "***defaultCategory-"+graphCollection.nextDefaultCategoryNumber++;
						//graph.selectedCategory = newCat;
						//graphCollection.data[newCat] = [];
						//graphCollection.nextDefaultLabel[newCat] = 0;
						//graphCollection.data[newCat].push(
							//{"label": "default"+graphCollection.nextDefaultLabel[newCat]++,
							 //"value": graph.x.invert(loc)}
						//);
						//graph.addCategory(newCat);
					//}
				}
			
				constructVis();
			}
			dragging = false;
		});
		
	graph.panel = graphPanel;
	
	if (!graphCollection.printMode && (graph.isRegularGraph || graph.isSamplingGraph)){
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
			.visible(function(){
				return !graph.isSamplingGraph && !graph.isResamplingGraph && !graph.isIntermedResamplingGraph;
			})
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
			.visible(function(){
				return !graph.isSamplingGraph && !graph.isResamplingGraph && !graph.isIntermedResamplingGraph;
			})
			.event("click", function(){
				graphCollection.selectedGraphIndex = index;
				graphCollection.updateMenuOptions();
				positionGroupingMenuOverGraph(index, graphCollection);
				hideMenus();
				$('#groupingOptions').slideDown();
			})
	}
		
				
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
				return "red";
			else if (graph.testMode == "sampling" || 
							 //graph.testMode == "resampling" || 
							 (graph.isSamplingGraph && graph.sampleNumber < graph.samplingFrom.samplingToHowMany))
				return "lightgrey";
			else
				return "black";
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
		
	//graphPanel.add(pv.Rule)
		//.right(-25)
		//.bottom(0)
		//.top(0)
		//.lineWidth(function(){
			//if (graphCollection.editModeEnabled)
				//return 2;
			//else
				//return 1;
		//})
		//.strokeStyle(function(){
			//if (graphCollection.editModeEnabled)
				//return "red"
			//else
				//return "black"
		//})
	
	if (graph.isRegularGraph){
		constructRegularGraph(graphPanel,graph,index);
	} else if (graph.isSamplingGraph){
		constructSamplingGraph(graphPanel,graph,index);
	} else if (graph.isResamplingGraph){
		constructResamplingGraph(graphPanel,graph,index);
	} else if (graph.isIntermedResamplingGraph){
		constructIntermedResamplingGraph(graphPanel,graph,index);
	} else if (graph.isDoubleGraph){
		constructDoubleGraph(graphPanel,graph,index);
	}
}

function constructIntermedResamplingGraph(graphPanel,graph,index){
	var horAdjust = 20;
	
	//Vertical Divider
	graphPanel.add(pv.Rule)
		.left(graph.subW)
		.bottom(0)
		.top(0)
		.lineWidth(1)
		.strokeStyle("black")
	
	var graph1 = graphPanel.add(pv.Panel)
		.top(0)
		.left(0)
		.height(function(){return graph.h})
		.width(function(){return graph.subW})
			
	graph1.add(pv.Label)
		.left(function(){return graph.subW/2})
		.top(25)
		.textAlign("center")
		.textAngle(0)
		.textBaseline("bottom")
		.text(function(){return "Resampling Group 1: Iteration " + graph.data[graphCollection.graphs[0].resampleSet].length })
		.font(fontString)
	
	var graph2 = graphPanel.add(pv.Panel)
		.top(0)
		.left(graph.subW)
		.height(function(){return graph.h})
		.width(function(){return graph.secondGraph.w})
		
	graph2.add(pv.Label)
		.left(function(){return graph.secondGraph.w/2})
		.top(25)
		.textAlign("center")
		.textAngle(0)
		.textBaseline("bottom")
		.text(function(){return "Resampling Group 2: Iteration " + graph.data[graphCollection.graphs[0].resampleSet].length })
		.font(fontString)
		
	if (graphCollection.data[graph.includedCategories[0]] == undefined || graphCollection.data[graph.includedCategories[0]].length == 0){
		
			
	} else {
		
		/* Number of datapoints N */
		graph1.add(pv.Label)
			.right(10)
			.top(35)
			.textAlign("right")
			.textAngle(0)
			.textBaseline("bottom")
			.text(function(){return "n = " + graph.n})
			.font(fontString);
			
		/* Mean */
		graph1.add(pv.Label)
			.left(-30)
			.top(35)
			.textAlign("left")
			.textAngle(0)
			.textBaseline("bottom")
			.text(function(){return "Mean = " + graph.getMeanMedianMode()[0].toFixed(1)})
			.font(fontString);
			
		/* X-axis ticks */
		graph1.add(pv.Rule)
			.data(function() { return graph.subX.ticks() })
			.left(function(d) {return graph.subX(d)})
			.bottom(graph.baseLine)
			.strokeStyle("#aaa")
			.height(5)
			.anchor("bottom").add(pv.Label)
				.text(function(d) {return d.toFixed(1)})
				.font(function(){return "bold "+graphCollection.tickTextSize+"px sans-serif"})
			
		/* X-axis line */
		graph1.add(pv.Rule)
			.bottom(graph.baseLine)
			.width(function(){return graph.subW-horAdjust})
			.strokeStyle("#000");		
		
		/* Dots */
		graph1.add(pv.Dot)
			.data(function() {return graph.getDataDrawObjects()})
			.visible(function(d) {
				return $('#checkboxHideData').attr('checked') != "checked"  && 
					(d.y+graph.baseLine) < graph.h &&
					d.x >= 0 &&
					d.x <= graph.subW &&
					!graphCollection.lineMode;
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
				if (d.label == graphCollection.selectedLabel && graph.testMode != "sampling")
					return graphCollection.bwMode ? "grey": "red";
				else if (graph.testMode == "sampling" &&
								 sampleContainsData(graphCollection.data[graph.selectedSample], d, graph))
					return graphCollection.bwMode ? "grey": "blue";
				else
					return pointStrokeStyle(d.set);
			})
			.lineWidth(function(d){
				if (d.label == graphCollection.selectedLabel && graph.testMode != "sampling") return 4;
				else if (graph.testMode == "sampling" &&
								 sampleContainsData(graphCollection.data[graph.selectedSample], d, graph)) return 4;
				else return 2;
			})
			.title(function(d) { return d.label+", "+graph.subX.invert(d.xReal).toFixed(1) })
		
		/*Mean Line */
		graph1.add(pv.Rule)
			.data(function(){
				return [graph.getMeanMedianMode()[0]]
			})
			.left(function(d){return graph.subX(d)})
			.bottom(function(){return graph.baseLine})
			.height(function(){
					return (graph.h-graph.baseLine) * 0.75;
			})
			.strokeStyle(function(d){
				return pv.rgb(255,0,0,0.5);
			})
			.title(function(d){			
					return "Mean: " + d.toFixed(1);
			})
			.anchor("top").add(pv.Dot)
				.title(function(d){					
						return "Mean: " + d.toFixed(1);
				})
				.shape(function(d){
						return "square";
				})
				.fillStyle(function(d){
						return pv.rgb(255,0,0,1);			
				})
				.strokeStyle(function(d){				
						return pv.rgb(255,0,0,0.5);
				})
				.size(40)
				//.anchor("top").add(pv.Label)
					////.left(10)
					////.top(30)
					//.textAlign("center")
					//.textAngle(0)
					//.textBaseline("bottom")
					//.text(function(){return "Mean = " + graph.getMeanMedianMode()[0].toFixed(1)})
					//.font(fontString);
			
		
		//Graph Overflow Warning Message
		graph1.add(pv.Label)
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
		
	} 
	
	if (graphCollection.data[graph.secondGraph.includedCategories[0]] == undefined || graphCollection.data[graph.secondGraph.includedCategories[0]].length == 0){
		
	} else {
		
		/* Number of datapoints N */
		graph2.add(pv.Label)
			.right(-8)
			.top(35)
			.textAlign("right")
			.textAngle(0)
			.textBaseline("bottom")
			.text(function(){return "n = " + graph.secondGraph.n})
			.font(fontString);
		
		/* Mean */
		graph2.add(pv.Label)
			.left(10)
			.top(35)
			.textAlign("left")
			.textAngle(0)
			.textBaseline("bottom")
			.text(function(){return "Mean = " + graph.secondGraph.getMeanMedianMode()[0].toFixed(1)})
			.font(fontString);
			
		/* X-axis ticks */
		graph2.add(pv.Rule)
			.data(function() { return graph.secondGraph.subX.ticks() })
			.left(function(d) {return graph.secondGraph.subX(d) + horAdjust})
			.bottom(graph.secondGraph.baseLine)
			.strokeStyle("#aaa")
			.height(5)
			.anchor("bottom").add(pv.Label)
				.text(function(d) {return d.toFixed(1)})
				.font(function(){return "bold "+graphCollection.tickTextSize+"px sans-serif"})
			
		/* X-axis line */
		graph2.add(pv.Rule)
			.bottom(graph.secondGraph.baseLine)
			.width(function(){return graph.secondGraph.w - horAdjust})
			.left(horAdjust)
			.strokeStyle("#000");
	
		
		/* Dots */
		graph2.add(pv.Dot)
			.data(function() {return graph.secondGraph.getDataDrawObjects()})
			.visible(function(d) {
				return $('#checkboxHideData').attr('checked') != "checked"  && 
					(d.y+graph.secondGraph.baseLine) < graph.secondGraph.h &&
					d.x >= 0 &&
					d.x <= graph.secondGraph.w &&
					!graphCollection.lineMode;
			})
			.left(function(d) { return d.x + horAdjust})
			.bottom(function(d) { return d.y + graph.secondGraph.baseLine })
			.cursor(function(){
				if (graphCollection.editModeEnabled)
					return "move";
				else
					return "default";
			})
			.radius(function() {return graphCollection.bucketDotSize})
			.fillStyle(function(d) {return pointFillStyle(d.set)})
			.strokeStyle(function(d) {
				if (d.label == graphCollection.selectedLabel && graph.testMode != "sampling")
					return graphCollection.bwMode ? "grey": "red";
				else if (graph.testMode == "sampling" &&
								 sampleContainsData(graphCollection.data[graph.selectedSample], d, graph))
					return graphCollection.bwMode ? "grey": "blue";
				else
					return pointStrokeStyle(d.set);
			})
			.lineWidth(function(d){
				if (d.label == graphCollection.selectedLabel && graph.testMode != "sampling") return 4;
				else if (graph.testMode == "sampling" &&
								 sampleContainsData(graphCollection.data[graph.selectedSample], d, graph)) return 4;
				else return 2;
			})
			.title(function(d) { return d.label+", "+graph.secondGraph.subX.invert(d.xReal).toFixed(1) })
			
		
		/*Mean Median Mode Lines */
		graph2.add(pv.Rule)
			.data(function(){
				return [graph.secondGraph.getMeanMedianMode()[0]]
			})
			.left(function(d){return graph.secondGraph.subX(d) + horAdjust})
			.bottom(function(){return graph.secondGraph.baseLine})
			.height(function(){	
					return (graph.h-graph.baseLine) * 0.75;
			})
			.strokeStyle(function(d){
				return pv.rgb(255,0,0,0.5);
			})
			.title(function(d){			
					return "Mean: " + d.toFixed(1);
			})
			.anchor("top").add(pv.Dot)
				.title(function(d){					
						return "Mean: " + d.toFixed(1);
				})
				.shape(function(d){
						return "square";
				})
				.fillStyle(function(d){
						return pv.rgb(255,0,0,1);			
				})
				.strokeStyle(function(d){				
						return pv.rgb(255,0,0,0.5);
				})
				.size(40)
				//.anchor("top").add(pv.Label)
					////.left(10)
					////.top(30)
					//.textAlign("center")
					//.textAngle(0)
					//.textBaseline("bottom")
					//.text(function(){return "Mean = " + graph.getMeanMedianMode()[0].toFixed(1)})
					//.font(fontString);
		
		//Graph Overflow Warning Message
		graph2.add(pv.Label)
			.text("Warning! Data points lie outside graph boundaries.")
			.textStyle("red")
			.font(fontString)
			.top(35)
			.left(function(){return graph.secondGraphw/2})
			.textAlign("center")
			.visible(function(){
				var retVal = false;
				graph.getDataDrawObjects().forEach(function(d){
					if ((d.y+graph.secondGraph.baseLine) > graph.secondGraph.h ||
							d.x < 0 ||
							d.x > graph.w)
						retVal = true;
				});
				return retVal;
			})
	}
}

function constructDoubleGraph(graphPanel,graph,index){
	var horAdjust = 20;
	
	//Vertical Divider
	graphPanel.add(pv.Rule)
		.left(graph.subW)
		.bottom(0)
		.top(0)
		.lineWidth(1)
		.strokeStyle("black")
	
	var graph1 = graphPanel.add(pv.Panel)
		.top(0)
		.left(0)
		.height(function(){return graph.h})
		.width(function(){return graph.subW})
			
	graph1.add(pv.Label)
		.left(function(){return graph.subW/2})
		.top(25)
		.textAlign("center")
		.textAngle(0)
		.textBaseline("bottom")
		.text("Sample 1")
		.font(fontString)
	
	var graph2 = graphPanel.add(pv.Panel)
		.top(0)
		.left(graph.subW)
		.height(function(){return graph.h})
		.width(function(){return graph.secondGraph.w})
		
	graph2.add(pv.Label)
		.left(function(){return graph.secondGraph.w/2})
		.top(25)
		.textAlign("center")
		.textAngle(0)
		.textBaseline("bottom")
		.text("Sample 2")
		.font(fontString)
		
	if (graph.includedCategories.length == 0){
		graph1.add(pv.Label)
			.left(function(){return graph.subW/2})
			.top(function(){return graph.h/4*3})
			.textAlign("center")
			.textAngle(0)
			.textBaseline("bottom")
			.text("Drag Data Here")
			.font(largeFontString)
			.textStyle("red")
			
	} else {
		
		/* Number of datapoints N */
		graph1.add(pv.Label)
			.right(10)
			.top(35)
			.textAlign("right")
			.textAngle(0)
			.textBaseline("bottom")
			.text(function(){return "n = " + graph.n})
			.font(fontString);
			
		/* Mean */
		graph1.add(pv.Label)
			.left(-30)
			.top(35)
			.textAlign("left")
			.textAngle(0)
			.textBaseline("bottom")
			.text(function(){return "Mean = " + graph.getMeanMedianMode()[0].toFixed(1)})
			.font(fontString);
			
		/* X-axis ticks */
		graph1.add(pv.Rule)
			.data(function() { return graph.subX.ticks() })
			.left(function(d) {return graph.subX(d)})
			.bottom(graph.baseLine)
			.strokeStyle("#aaa")
			.height(5)
			.anchor("bottom").add(pv.Label)
				.text(function(d) {return d.toFixed(1)})
				.font(function(){return "bold "+graphCollection.tickTextSize+"px sans-serif"})
			
		/* X-axis line */
		graph1.add(pv.Rule)
			.bottom(graph.baseLine)
			.width(function(){return graph.subW-horAdjust})
			.strokeStyle("#000");		
		
		/* Dots */
		graph1.add(pv.Dot)
			.data(function() {return graph.getDataDrawObjects()})
			.visible(function(d) {
				return $('#checkboxHideData').attr('checked') != "checked"  && 
					(d.y+graph.baseLine) < graph.h &&
					d.x >= 0 &&
					d.x <= graph.subW &&
					!graphCollection.lineMode;
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
				if (d.label == graphCollection.selectedLabel && graph.testMode != "sampling")
					return graphCollection.bwMode ? "grey": "red";
				else if (graph.testMode == "sampling" &&
								 sampleContainsData(graphCollection.data[graph.selectedSample], d, graph))
					return graphCollection.bwMode ? "grey": "blue";
				else
					return pointStrokeStyle(d.set);
			})
			.lineWidth(function(d){
				if (d.label == graphCollection.selectedLabel && graph.testMode != "sampling") return 4;
				else if (graph.testMode == "sampling" &&
								 sampleContainsData(graphCollection.data[graph.selectedSample], d, graph)) return 4;
				else return 2;
			})
			.title(function(d) { return d.label+", "+graph.subX.invert(d.xReal).toFixed(1) })
			
		/*Mean Line */
		graph1.add(pv.Rule)
			.data(function(){
				return [graph.getMeanMedianMode()[0]]
			})
			.left(function(d){return graph.subX(d)})
			.bottom(function(){return graph.baseLine})
			.height(function(){
					return (graph.h-graph.baseLine) * 0.75;
			})
			.strokeStyle(function(d){
				return pv.rgb(255,0,0,0.5);
			})
			.title(function(d){			
					return "Mean: " + d.toFixed(1);
			})
			.anchor("top").add(pv.Dot)
				.title(function(d){					
						return "Mean: " + d.toFixed(1);
				})
				.shape(function(d){
						return "square";
				})
				.fillStyle(function(d){
						return pv.rgb(255,0,0,1);			
				})
				.strokeStyle(function(d){				
						return pv.rgb(255,0,0,0.5);
				})
				.size(40)
				//.anchor("top").add(pv.Label)
					////.left(10)
					////.top(30)
					//.textAlign("center")
					//.textAngle(0)
					//.textBaseline("bottom")
					//.text(function(){return "Mean = " + graph.getMeanMedianMode()[0].toFixed(1)})
					//.font(fontString);
		
		
		//Graph Overflow Warning Message
		graph1.add(pv.Label)
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
		
	} 
	
	if (graph.secondGraph.includedCategories.length == 0){
		graph2.add(pv.Label)
			.left(function(){return graph.secondGraph.w/2})
			.top(function(){return graph.h/4*3})
			.textAlign("center")
			.textAngle(0)
			.textBaseline("bottom")
			.text("Drag Data Here")
			.font(largeFontString)
			.textStyle("red")
	} else {
		
		/* Number of datapoints N */
		graph2.add(pv.Label)
			.right(-8)
			.top(35)
			.textAlign("right")
			.textAngle(0)
			.textBaseline("bottom")
			.text(function(){return "n = " + graph.secondGraph.n})
			.font(fontString);
		
		/* Mean */
		graph2.add(pv.Label)
			.left(10)
			.top(35)
			.textAlign("left")
			.textAngle(0)
			.textBaseline("bottom")
			.text(function(){return "Mean = " + graph.secondGraph.getMeanMedianMode()[0].toFixed(1)})
			.font(fontString);
			
		/* X-axis ticks */
		graph2.add(pv.Rule)
			.data(function() { return graph.secondGraph.subX.ticks() })
			.left(function(d) {return graph.secondGraph.subX(d) + horAdjust})
			.bottom(graph.secondGraph.baseLine)
			.strokeStyle("#aaa")
			.height(5)
			.anchor("bottom").add(pv.Label)
				.text(function(d) {return d.toFixed(1)})
				.font(function(){return "bold "+graphCollection.tickTextSize+"px sans-serif"})
			
		/* X-axis line */
		graph2.add(pv.Rule)
			.bottom(graph.secondGraph.baseLine)
			.width(function(){return graph.secondGraph.w - horAdjust})
			.left(horAdjust)
			.strokeStyle("#000");
	
		
		/* Dots */
		graph2.add(pv.Dot)
			.data(function() {return graph.secondGraph.getDataDrawObjects()})
			.visible(function(d) {
				return $('#checkboxHideData').attr('checked') != "checked"  && 
					(d.y+graph.secondGraph.baseLine) < graph.secondGraph.h &&
					d.x >= 0 &&
					d.x <= graph.secondGraph.w &&
					!graphCollection.lineMode;
			})
			.left(function(d) { return d.x + horAdjust})
			.bottom(function(d) { return d.y + graph.secondGraph.baseLine })
			.cursor(function(){
				if (graphCollection.editModeEnabled)
					return "move";
				else
					return "default";
			})
			.radius(function() {return graphCollection.bucketDotSize})
			.fillStyle(function(d) {return pointFillStyle(d.set)})
			.strokeStyle(function(d) {
				if (d.label == graphCollection.selectedLabel && graph.testMode != "sampling")
					return graphCollection.bwMode ? "grey": "red";
				else if (graph.testMode == "sampling" &&
								 sampleContainsData(graphCollection.data[graph.selectedSample], d, graph))
					return graphCollection.bwMode ? "grey": "blue";
				else
					return pointStrokeStyle(d.set);
			})
			.lineWidth(function(d){
				if (d.label == graphCollection.selectedLabel && graph.testMode != "sampling") return 4;
				else if (graph.testMode == "sampling" &&
								 sampleContainsData(graphCollection.data[graph.selectedSample], d, graph)) return 4;
				else return 2;
			})
			.title(function(d) { return d.label+", "+graph.secondGraph.subX.invert(d.xReal).toFixed(1) })
			
		
		/*Mean Median Mode Lines */
		graph2.add(pv.Rule)
			.data(function(){
				return [graph.secondGraph.getMeanMedianMode()[0]]
			})
			.left(function(d){return graph.secondGraph.subX(d) + horAdjust})
			.bottom(function(){return graph.secondGraph.baseLine})
			.height(function(){	
					return (graph.h-graph.baseLine) * 0.75;
			})
			.strokeStyle(function(d){
				return pv.rgb(255,0,0,0.5);
			})
			.title(function(d){			
					return "Mean: " + d.toFixed(1);
			})
			.anchor("top").add(pv.Dot)
				.title(function(d){					
						return "Mean: " + d.toFixed(1);
				})
				.shape(function(d){
						return "square";
				})
				.fillStyle(function(d){
						return pv.rgb(255,0,0,1);			
				})
				.strokeStyle(function(d){				
						return pv.rgb(255,0,0,0.5);
				})
				.size(40)
				//.anchor("top").add(pv.Label)
					////.left(10)
					////.top(30)
					//.textAlign("center")
					//.textAngle(0)
					//.textBaseline("bottom")
					//.text(function(){return "Mean = " + graph.getMeanMedianMode()[0].toFixed(1)})
					//.font(fontString);
		
		
		//Graph Overflow Warning Message
		graph2.add(pv.Label)
			.text("Warning! Data points lie outside graph boundaries.")
			.textStyle("red")
			.font(fontString)
			.top(35)
			.left(function(){return graph.secondGraphw/2})
			.textAlign("center")
			.visible(function(){
				var retVal = false;
				graph.getDataDrawObjects().forEach(function(d){
					if ((d.y+graph.secondGraph.baseLine) > graph.secondGraph.h ||
							d.x < 0 ||
							d.x > graph.w)
						retVal = true;
				});
				return retVal;
			})
	}
}

function constructResamplingGraph(graphPanel, graph, index){
	
	if (graph.population1.includedCategories.length == 0 || 
			graph.population2.includedCategories.length == 0){
		/* Assignment Instructons*/
		graphPanel.add(pv.Label)
			.left(function(){return graph.w/2})
			.top(50)
			.textAlign("center")
			.textAngle(0)
			.textStyle(function() {return "red"})
			.textBaseline("bottom")
			.text("Drag data from the right to the two boxes at the bottom of the screen.")
			.font(largeFontString)
	} else if (graph.data[graph.resampleSet].length == 0) {
		/* Instructons*/
		graphPanel.add(pv.Label)
			.right(100)
			.bottom(50)
			.textAlign("left")
			.textAngle(0)
			.textBaseline("bottom")
			.text("Press start.")
			.font(fontString)
	} else {
		/* X-axis ticks */
		graphPanel.add(pv.Rule)
			.data(function() {
				if (graph.resampleDisplayMode != "pgraph")
					return graph.x.ticks();
				else {
					var array = [0];
					array = array.concat(pValTicks(graph));
					return array;
					//return pValTicks(graph);
					
				}
			})
			.left(function(d) {
				if (graph.resampleDisplayMode != "pgraph")
					return graph.x(d);
				else {
					var x = pv.Scale.linear(0, graph.resamplingIterations).range(0, graph.w-20);
					return x(d) + 20;
				}
			})
			.bottom(function() {return graph.baseLine})
			.strokeStyle("#aaa")
			.height(5)
			.visible(function(d){
				if (graph.resamplingIterations > 10000) return d % 10000 == 0; //&& d != 0;
				else if (graph.resamplingIterations > 1000) return d % 1000 == 0;// && d != 0;
				else return true; //&& d != 0;
				
			})
			.anchor("bottom").add(pv.Label)
				.text(function(d) {
					if (graph.resampleDisplayMode != "pgraph")
						return d.toFixed(1)
					else
						return d.toFixed(0);
				})
				.font(function(){return "bold "+graphCollection.tickTextSize+"px sans-serif"})
			
		/* X-axis line */
		graphPanel.add(pv.Rule)
			.bottom(function() {return graph.baseLine})
			.width(function() {
				if (graph.resampleDisplayMode != "pgraph") return graph.w;
				else return graph.w-20;
			})
			.left(function(){
				if (graph.resampleDisplayMode != "pgraph") return 0;
				else return 20;
			})
			.strokeStyle("#000")
		
		/* Y-axis ticks */
		graphPanel.add(pv.Rule)
			.data(function() {  
				var y = pv.Scale.linear(0, graph.resamplingMaxPVal).range(0, graph.h-graph.baseLine-10);
				if (graph.resamplingMaxPVal == 0) return [0,1];
				else return y.ticks();
			})
			.bottom(function(d) {
				var y = pv.Scale.linear(0, graph.resamplingMaxPVal).range(0, graph.h-graph.baseLine-10);
				if (graph.resamplingMaxPVal == 0) return d*(graph.h-graph.baseLine);
				else return graph.baseLine + y(d);
			})
			.left(20)
			.strokeStyle("#aaa")
			.width(5)
			.visible(function(){
				return graph.resampleDisplayMode == "pgraph" && 
					this.index % 2 == 0 &&
					this.index != 0;
			})
			.anchor("left").add(pv.Label)
				.text(function(d) {return d.toFixed(2)})
				.font(function(){return "bold "+graphCollection.tickTextSize+"px sans-serif"})
				.left(15)
				//.visible(function(){return this.index % 2 == 0})
		
		/* Y-axis Line */
		graphPanel.add(pv.Rule)
		.left(20)
		.top(10)
		.bottom(graph.baseLine)
		.visible(function(){return graph.resampleDisplayMode == "pgraph"})
		
		/* Y-axis Label */
		graphPanel.add(pv.Label)
			.left(-15)
			.bottom(function(){return graph.baseLine + ((graph.h-graph.baseLine)/2)})
			.textAlign("center")
			.textAngle(-Math.PI/2)
			.textBaseline("bottom")
			.text("P Value")
			.font(fontString)
			.visible(function(){return graph.resampleDisplayMode == "pgraph"})
		
		/* P Values */
		graphPanel.add(pv.Dot)
			.data(function() { return graph.resamplingPVals })
			.visible(function(){return graph.resampleDisplayMode == "pgraph"})
			.left(function(d) { 
				var x = pv.Scale.linear(0, graph.resamplingIterations).range(0, graph.w-20);
				return x(d.x) + 20;
			})
			.bottom(function(d) { 
				var y = pv.Scale.linear(0, graph.resamplingMaxPVal).range(0, graph.h-graph.baseLine-10);
				if (graph.resamplingMaxPVal == 0) return graph.baseLine;
				else return graph.baseLine + y(d.y);
			})
			.radius(function() {return graphCollection.bucketDotSize})
			.fillStyle("grey")
			.strokeStyle("black")
			.title(function(d) {return "Iterations: "+d.x+", P: "+d.y.toFixed(4)})
		
		/* Dots */
		graphPanel.add(pv.Dot)
			.data(function() {return ( graph.resampleDisplayMode == "dot" ? graph.getDataDrawObjects() : [])})
			.left(function(d) { return d.x })
			.bottom(function(d) { return d.y + graph.baseLine })
			.radius(3)
			.fillStyle("white")
			.strokeStyle("black")
			.lineWidth(2)
			.title(function(d) { return d.label+", "+graph.x.invert(d.xReal).toFixed(1) })
			.visible(function(){return graph.resampleDisplayMode == "dot"})
		
		/* Lines */
		graphPanel.add(pv.Rule)
			.data(function() {return ( graph.resampleDisplayMode == "line" ? graph.data[graph.resampleSet] : [])})
			.left(function(d) {return graph.x(d.value) })
			.bottom(function(){return graph.baseLine})
			.height(function(){return (graph.h-graph.baseLine) * 0.75})
			.strokeStyle(function() {return (graphCollection.bwMode ? pv.rgb(100,100,100,0.2): pv.rgb(0,0,255,0.2))})
			.visible(function(){return graph.resampleDisplayMode == "line"})
		
		/* Fixed Interval Width Histogram */
		graphPanel.add(pv.Bar)
			.data(function(){return (graph.resampleDisplayMode == "histogram" ? fiwHistogram(graph,partitionDataByIntervalWidth(graph)) : []) })
			.visible(function(d) { return graph.resampleHistogram })
			.left(function(d){return d.left})
			.bottom(graph.baseLine)
			.height(function(d){return d.height})
			.width(function(d){return d.width})
			.lineWidth(0.5)
			.strokeStyle("green")
			.visible(function(){return graph.resampleDisplayMode == "histogram"})
			.fillStyle(pv.rgb(0,225,0,0.25));
		
		/* Source Populations Mean Differences */
		graphPanel.add(pv.Rule)
			.data(function() {return [Math.abs(resamplePop1Mean - resamplePop2Mean),
																-1*Math.abs(resamplePop1Mean - resamplePop2Mean)]
			})
			.left(function(d) {return graph.x(d) })
			.bottom(function(){return graph.baseLine})
			.height(function(){return (graph.h-graph.baseLine) * 0.75})
			.strokeStyle(function() {return (graphCollection.bwMode ? "black" : "red")})
			.lineWidth(2)
			.visible(function(){return graph.resampleDisplayMode != "pgraph"})
			
		/* Number of points between lines */
		graphPanel.add(pv.Label)
			.data(function(){
				var inside = 0;
				graph.data[graph.resampleSet].forEach(function(d, index){
					if (Math.abs(d.value) < Math.abs(resamplePop1Mean - resamplePop2Mean) &&
							index < graph.resamplingIterations)
						inside++;
				});
					
				return [inside + " within the limits."];	
			})
			.textAlign("left")
			.textStyle(function() {return (graphCollection.bwMode ? "black" : "blue")})
			.top(20)
			.textBaseline("top")
			//.bottom(function(){return (graph.h-graph.baseLine) * 0.85 + graph.baseLine })
			.left(30)
			.font(function(){return fontString})
			.visible(function(){return graph.resampleDisplayMode != "pgraph"})
			
		/* Number of points outside lines */
		graphPanel.add(pv.Label)
			.data(function(){
				var outside = 0;
				graph.data[graph.resampleSet].forEach(function(d, index){
					if (Math.abs(d.value) >= Math.abs(resamplePop1Mean - resamplePop2Mean) &&
							index < graph.resamplingIterations)
						outside++;
				});
					
				return [outside + " outside the limits."];	
			})
			.textAlign("left")
			.textStyle(function() {return (graphCollection.bwMode ? "black" : "blue")})
			.top(40)
			.textBaseline("top")
			//.bottom(function(){return (graph.h-graph.baseLine) * 0.78 + graph.baseLine })
			.left(30)
			.font(function(){return fontString})
			.visible(function(){return graph.resampleDisplayMode != "pgraph"})
			
		/* Number of points to the right */
		graphPanel.add(pv.Label)
			.data(function(){
				var right = 0;
				graph.data[graph.resampleSet].forEach(function(d, index){
					if (d.value >= Math.abs(resamplePop1Mean - resamplePop2Mean) &&
							index < graph.resamplingIterations)
						right++;
				});
					
				return [right + " ==>"];	
			})
			.textAlign("left")
			.textStyle(function() {return (graphCollection.bwMode ? "black" : "red")})
			.bottom(function(){return (graph.h-graph.baseLine) * 0.75 + graph.baseLine})
			.left(function(){return graph.x(Math.abs(resamplePop1Mean - resamplePop2Mean))})
			.visible(function(){return graph.resampleDisplayMode != "pgraph"})
		
		/* Number of points to the left*/
		graphPanel.add(pv.Label)
			.data(function(){
				var left = 0;
				graph.data[graph.resampleSet].forEach(function(d, index){
					if (d.value <= -1*Math.abs(resamplePop1Mean - resamplePop2Mean) &&
							index < graph.resamplingIterations)
						left++;
				});
					
				return ["<== " + left];	
			})
			.textAlign("right")
			.textStyle(function() {return (graphCollection.bwMode ? "black" : "red")})
			.bottom(function(){return (graph.h-graph.baseLine) * 0.75 + graph.baseLine})
			.left(function(){return graph.x(-1*Math.abs(resamplePop1Mean - resamplePop2Mean))})
			.visible(function(){return graph.resampleDisplayMode != "pgraph"})
	
		/* Percentage outside lines */
		graphPanel.add(pv.Label)
			.data(function(){
				var outside = 0;
				graph.data[graph.resampleSet].forEach(function(d, index){
					if (Math.abs(d.value) >= Math.abs(resamplePop1Mean - resamplePop2Mean) &&
							index < graph.resamplingIterations)
						outside++;
				});
					
				return [outside+" / "+
								(Math.min(graph.data[graph.resampleSet].length, graph.resamplingIterations))+
								" x 100 = "+
								(graph.data[graph.resampleSet].length*100 != 0 ?
									(outside/Math.min(graph.data[graph.resampleSet].length, graph.resamplingIterations)*100).toFixed(1) : 0)+
								"%"];	
			})
			.textAlign("left")
			.textStyle(function() {return (graphCollection.bwMode ? "black" : "blue")})
			.top(0)
			.textBaseline("top")
			//.bottom(function(){return (graph.h-graph.baseLine) * 0.93 + graph.baseLine })
			.left(30)
			.font(function(){return fontString})
			.visible(function(){return graph.resampleDisplayMode != "pgraph"})
	}
}

function constructSamplingGraph(graphPanel, graph, index){
	/* X-axis label */
	graphPanel.add(pv.Label)
		.right(function(){return graph.w/2})
		.bottom(10)
		.textAlign("center")
		.textAngle(0)
		.textBaseline("bottom")
		.text("Sample from Above Graph")
		.font(fontString)
	
	if (graph.samplingFrom.includedCategories.length > 0){
		/* X-axis ticks */
		graphPanel.add(pv.Rule)
			.data(function() { return graph.x.ticks() })
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
			.strokeStyle("#000")
			
		
		/* UD Edge of the graph partition lines*/
		graphPanel.add(pv.Rule)
			.data([{"x":0,"y":0}])
			.left(0)
			.bottom(function(){return graph.baseLine})
			.height(function(){return (graph.h-graph.baseLine) * 0.75})
			.strokeStyle("green")
			.visible(function(){return graph.samplingFrom.groupingMode == "UserDefGroups"})
			.anchor("top").add(pv.Dot)
				.left(8)
				.title("Drag to create a new partition.")
				.events("all")
				.shape("square")
				.fillStyle("green")
				.strokeStyle("green")
				.radius(8)
				
		/* User Defined Partitions */
		graphPanel.add(pv.Rule)
			.data(function(){return graph.samplingFrom.udPartitions})
			.left(function(d){return d.x})
			.bottom(function(){return graph.baseLine})
			.height(function(){return (graph.h-graph.baseLine) * 0.75})
			.strokeStyle("green")
			.visible(function(){return graph.samplingFrom.groupingMode == "UserDefGroups"})
			.anchor("top").add(pv.Dot)
				.left(function(d){return d.x + 8})
				.title(function(d){return graph.x.invert(d.x).toFixed(1)})
				.events("all")
				.shape("square")
				.fillStyle(function() {
					if (graph.samplingFrom.selectedUDPart == this.index)  return "yellow";
					else return "green";
				})
				.strokeStyle("green")
				.radius(8)
				
		graphPanel.add(pv.Rule)
			.right(0)
			.bottom(function(){return graph.baseLine})
			.height(function(){return (graph.h-graph.baseLine) * 0.75})
			.strokeStyle("green")
			.visible(function(){return graph.samplingFrom.groupingMode == "UserDefGroups"})
			
			
		/* UD Partition Data Count Label */
		graphPanel.add(pv.Label)
			.data(function(){return countDataInUserDefPartitions(graph)})
			.textAlign("center")
			.textStyle("green")
			.bottom(function(){return (graph.h-graph.baseLine) * 0.70 + graph.baseLine})
			.left(function(d){
				var udPartXVals = getSortedUDPartitionXVals(graph.samplingFrom);
				if (this.index != udPartXVals.length-1){
					return graph.x((udPartXVals[this.index]+udPartXVals[this.index+1])/2);
				} else return 0;
			})
			.visible(function(){
				var udPartXVals = getSortedUDPartitionXVals(graph.samplingFrom);
				return this.index != udPartXVals.length-1 &&
							 graph.samplingFrom.groupingMode == "UserDefGroups";
			});
		
		/* Fixed Interval Width Partitions */
		graphPanel.add(pv.Rule)
			.data(function(){return partitionDataByIntervalWidth(graph.samplingFrom)})
			.left(function(d){return graph.x(d)})
			.bottom(function(){return graph.baseLine})
			.height(function(){return (graph.h-graph.baseLine) * 0.75})
			.visible(function(){return graph.samplingFrom.groupingMode == "FixedIntervalGroups"})
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
			.data(function(){return countDataInPartitions(graph,partitionDataByIntervalWidth(graph.samplingFrom))})
			.textAlign("center")
			.textStyle("green")
			.bottom(function(){return (graph.h-graph.baseLine) * 0.70 + graph.baseLine})
			.left(function(){
				if (this.index != partitionDataByIntervalWidth(graph.samplingFrom).length-1){
					return graph.x((partitionDataByIntervalWidth(graph.samplingFrom)[this.index]+partitionDataByIntervalWidth(graph.samplingFrom)[this.index+1])/2);
				} else return 0;
			})
			.visible(function(){
				return this.index != partitionDataByIntervalWidth(graph.samplingFrom).length-1 &&
							 graph.samplingFrom.groupingMode == "FixedIntervalGroups";
			});
			
		/* Fixed Interval Width Histogram */
		graphPanel.add(pv.Bar)
			.data(function(){return fiwHistogram(graph,partitionDataByIntervalWidth(graph.samplingFrom))})
			.visible(function(d) { 
				return ( graph.samplingFrom.groupingMode == "FixedIntervalGroups" &&
								 graph.samplingFrom.histogram
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
			.height(function(){return (graph.h-graph.baseLine) * 0.75})
			.visible(function(){return graph.samplingFrom.groupingMode == "FixedSizeGroups"})
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
			.bottom(function(){return (graph.h-graph.baseLine) * 0.70 + graph.baseLine})
			.left(function(){
				if (this.index != partitionDataInFixedSizeGroups(graph).length-1){
					return graph.x((partitionDataInFixedSizeGroups(graph)[this.index]+partitionDataInFixedSizeGroups(graph)[this.index+1])/2);
				} else return 0;
			})
			.visible(function(){
				return this.index != partitionDataInFixedSizeGroups(graph).length-1 &&
							 graph.samplingFrom.groupingMode == "FixedSizeGroups";
			})
			.text(function(){
				if (graph.dataVals().length % graph.partitionGroupSize == 0 ||
						this.index != partitionDataInFixedSizeGroups(graph).length-2)
					return graph.samplingFrom.partitionGroupSize;
				
				else return graph.dataVals().length % graph.samplingFrom.partitionGroupSize;
			})

		/* Two Equal Partitions */
		graphPanel.add(pv.Rule)
			.data(function(){return partitionDataInTwo(graph)})
			.left(function(d){return graph.x(d)})
			.bottom(function(){return graph.baseLine})
			.height(function(){return (graph.h-graph.baseLine) * 0.75})
			.visible(function(){
				return graph.samplingFrom.groupingMode == "TwoEqualGroups" &&
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
			.bottom(function(){return (graph.h-graph.baseLine) * 0.70 + graph.baseLine})
			.left(function(){
				if (this.index != partitionDataInTwo(graph).length-1){
					return graph.x((partitionDataInTwo(graph)[this.index]+partitionDataInTwo(graph)[this.index+1])/2);
				} else return 0;
			})
			.visible(function(){
				return this.index != partitionDataInTwo(graph).length-1 &&
							 graph.samplingFrom.groupingMode == "TwoEqualGroups" &&
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
				return graph.samplingFrom.groupingMode == "TwoEqualGroups" &&
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
			.height(function(){return (graph.h-graph.baseLine) * 0.75})
			.visible(function(){return graph.samplingFrom.groupingMode == "FourEqualGroups" &&
																 !graph.insufDataForFour;
			})
			.strokeStyle("green")
			.title(function(d){return d.toFixed(1)})
			.anchor("top").add(pv.Dot)
				.title(function(d){return d.toFixed(1)})
				.shape("square")
				.fillStyle("green")
				.strokeStyle("green")
				.visible(function(){return graph.samplingFrom.groupingMode == "FourEqualGroups" &&
																	 !graph.insufDataForFour; 
				})
				.size(4);
				
		/*Four Partition Size Labels*/
		graphPanel.add(pv.Label)
			.data(function(){return countDataInPartitions(graph, partitionDataInFour(graph))})
			.textAlign("center")
			.textStyle("green")
			.bottom(function(){return (graph.h-graph.baseLine) * 0.70 + graph.baseLine})
			.left(function(){
				if (this.index != partitionDataInFour(graph).length-1){
					return graph.x((partitionDataInFour(graph)[this.index]+partitionDataInFour(graph)[this.index+1])/2);
				} else return 0;
			})
			.visible(function(){
				return this.index != partitionDataInFour(graph).length-1 &&
							graph.samplingFrom.groupingMode == "FourEqualGroups" &&
							!graph.insufDataForFour;
			})
			.text(function(d){
				if (this.index != partitionDataInFour(graph).length-1){
					return d;
				} else return 0;
			})
			
		//Simple Box Plot Lines
		graphPanel.add(pv.Line)
			.data(function(){
				return [[partitionDataInFour(graph)[0], graph.baseLine],
								[partitionDataInFour(graph)[0], graph.h * 0.80]]})
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.samplingFrom.groupingMode == "BoxPlot" &&
																	 !graph.samplingFrom.advBoxPlot &&
																	 !graph.insufDataForFour; 
			})

		graphPanel.add(pv.Line)
			.data(function(){return [[partitionDataInFour(graph)[4], graph.baseLine],
						 [partitionDataInFour(graph)[4], graph.h * 0.80]]})
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.samplingFrom.groupingMode == "BoxPlot" &&
																	 !graph.samplingFrom.advBoxPlot &&
																	 !graph.insufDataForFour; 
			})

		graphPanel.add(pv.Line)
			.data(function(){return [[partitionDataInFour(graph)[1], (graph.h-graph.baseLine) * 0.20 + graph.baseLine],
						 [partitionDataInFour(graph)[1], (graph.h-graph.baseLine) * 0.60 + graph.baseLine]]})
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.samplingFrom.groupingMode == "BoxPlot" &&
																	 !graph.samplingFrom.advBoxPlot &&
																	 !graph.insufDataForFour; 
		})

		graphPanel.add(pv.Line)
			.data(function(){return [[partitionDataInFour(graph)[2], (graph.h-graph.baseLine) * 0.20 + graph.baseLine],
						 [partitionDataInFour(graph)[2], (graph.h-graph.baseLine) * 0.60 + graph.baseLine]]})
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.samplingFrom.groupingMode == "BoxPlot" &&
																	 !graph.samplingFrom.advBoxPlot &&
																	 !graph.insufDataForFour; 
			})

		graphPanel.add(pv.Line)
			.data(function(){return [[partitionDataInFour(graph)[3], (graph.h-graph.baseLine) * 0.20 + graph.baseLine],
						 [partitionDataInFour(graph)[3], (graph.h-graph.baseLine) * 0.60 + graph.baseLine]]})
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.samplingFrom.groupingMode == "BoxPlot" &&
																	 !graph.samplingFrom.advBoxPlot &&
																	 !graph.insufDataForFour; 
			})						

		graphPanel.add(pv.Line)
			.data(function(){return [[partitionDataInFour(graph)[0], (graph.h-graph.baseLine) * 0.40 + graph.baseLine],
						 [partitionDataInFour(graph)[1], (graph.h-graph.baseLine) * 0.40 + graph.baseLine]]})
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.samplingFrom.groupingMode == "BoxPlot" &&
																	 !graph.samplingFrom.advBoxPlot &&
																	 !graph.insufDataForFour; 
			})

		graphPanel.add(pv.Line)
			.data(function(){return [[partitionDataInFour(graph)[1], (graph.h-graph.baseLine) * 0.60 + graph.baseLine],
						 [partitionDataInFour(graph)[3], (graph.h-graph.baseLine) * 0.60 + graph.baseLine]]})
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.samplingFrom.groupingMode == "BoxPlot" &&
																	 !graph.samplingFrom.advBoxPlot &&
																	 !graph.insufDataForFour; 
			})

		graphPanel.add(pv.Line)
			.data(function(){return [[partitionDataInFour(graph)[1], (graph.h-graph.baseLine) * 0.20 + graph.baseLine],
						 [partitionDataInFour(graph)[3], (graph.h-graph.baseLine) * 0.20 + graph.baseLine]]})
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.samplingFrom.groupingMode == "BoxPlot" &&
																	 !graph.samplingFrom.advBoxPlot &&
																	 !graph.insufDataForFour; 
			})

		graphPanel.add(pv.Line)
			.data(function(){return [[partitionDataInFour(graph)[3], (graph.h-graph.baseLine) * 0.40 + graph.baseLine],
						 [partitionDataInFour(graph)[4], (graph.h-graph.baseLine) * 0.40 + graph.baseLine]]})
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.samplingFrom.groupingMode == "BoxPlot" &&
																	 !graph.samplingFrom.advBoxPlot &&
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
			.visible(function(){return graph.samplingFrom.groupingMode == "BoxPlot" &&
																		graph.samplingFrom.advBoxPlot && 
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
			.visible(function(){return graph.samplingFrom.groupingMode == "BoxPlot" &&
																		graph.samplingFrom.advBoxPlot &&
																	 !graph.insufDataForFour; 
			})
																	 
		graphPanel.add(pv.Line)
			.data(function(){return [[partitionDataInFour(graph)[1], (graph.h-graph.baseLine) * 0.20 + graph.baseLine],
						 [partitionDataInFour(graph)[1], (graph.h-graph.baseLine) * 0.60 + graph.baseLine]]})
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.samplingFrom.groupingMode == "BoxPlot" &&
																		graph.samplingFrom.advBoxPlot &&
																	 !graph.insufDataForFour; 
		})
																	 
		graphPanel.add(pv.Line)
			.data(function(){return [[partitionDataInFour(graph)[2], (graph.h-graph.baseLine) * 0.20 + graph.baseLine],
						 [partitionDataInFour(graph)[2], (graph.h-graph.baseLine) * 0.60 + graph.baseLine]]})
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.samplingFrom.groupingMode == "BoxPlot" &&
																		graph.samplingFrom.advBoxPlot &&
																	 !graph.insufDataForFour; 
			})
																	 
		graphPanel.add(pv.Line)
			.data(function(){return [[partitionDataInFour(graph)[3], (graph.h-graph.baseLine) * 0.20 + graph.baseLine],
						 [partitionDataInFour(graph)[3], (graph.h-graph.baseLine) * 0.60 + graph.baseLine]]})
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.samplingFrom.groupingMode == "BoxPlot" &&
																		graph.samplingFrom.advBoxPlot &&
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
			.visible(function(){return graph.samplingFrom.groupingMode == "BoxPlot" &&
																		graph.samplingFrom.advBoxPlot &&
																	 !graph.insufDataForFour; 
			})
			
		graphPanel.add(pv.Line)
			.data(function(){return [[partitionDataInFour(graph)[1], (graph.h-graph.baseLine) * 0.60 + graph.baseLine],
						 [partitionDataInFour(graph)[3], (graph.h-graph.baseLine) * 0.60 + graph.baseLine]]})
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.samplingFrom.groupingMode == "BoxPlot" &&
																		graph.samplingFrom.advBoxPlot &&
																	 !graph.insufDataForFour; 
			})
			
		graphPanel.add(pv.Line)
			.data(function(){return [[partitionDataInFour(graph)[1], (graph.h-graph.baseLine) * 0.20 + graph.baseLine],
						 [partitionDataInFour(graph)[3], (graph.h-graph.baseLine) * 0.20 + graph.baseLine]]})
			.left(function(d) { return graph.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return graph.samplingFrom.groupingMode == "BoxPlot" &&
																		graph.samplingFrom.advBoxPlot &&
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
			.visible(function(){return graph.samplingFrom.groupingMode == "BoxPlot" &&
																 graph.samplingFrom.advBoxPlot &&
																 !graph.insufDataForFour; 
			})
		
		//Box Plot Mean
		graphPanel.add(pv.Dot)
			.data(function(){return [graph.getMeanMedianMode()[0]]})
			.left(function(d){return graph.x(d)})
			.bottom(function(){return (graph.h-graph.baseLine) * 0.42 + graph.baseLine})
			.visible(function(){return graph.samplingFrom.groupingMode == "BoxPlot" &&
																	 !graph.insufDataForFour; 
			})
			.shape("cross")
			.strokeStyle("darkgreen")
		
		graphPanel.add(pv.Dot)
			.data(function(){return [graph.getMeanMedianMode()[0]]})
			.left(function(d){return graph.x(d)})
			.bottom(function(){return (graph.h-graph.baseLine) * 0.42 + graph.baseLine})
			.visible(function(){return graph.samplingFrom.groupingMode == "BoxPlot" &&
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
			.visible(function(){return graph.samplingFrom.groupingMode == "BoxPlot" &&
																	 graph.samplingFrom.sdLine &&
																	 !graph.insufDataForFour; 
			})
			.lineWidth(1)
			.strokeStyle("orange")
			
		graphPanel.add(pv.Label)
			.data(function(){return [graph.getMeanMedianMode()[0]]})
			.left(function(d){return graph.x(d)})
			.bottom(function(){return (graph.h-graph.baseLine) * 0.42 + graph.baseLine +20})
			.text(function(){return "SD = "+getSD(graph.dataVals()).toFixed(1)})
			.visible(function(){return graph.samplingFrom.groupingMode == "BoxPlot" &&
																	 graph.samplingFrom.sdLine &&
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
			.visible(function(){return graph.samplingFrom.groupingMode == "BoxPlot" &&
																	 graph.samplingFrom.sdLine &&
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
			.visible(function(){return graph.samplingFrom.groupingMode == "BoxPlot" &&
																	 graph.samplingFrom.sdLine &&
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
			.height(function(){return (graph.h-graph.baseLine) * 0.75})
			.visible(function(){
				if (this.index == 0)
					return graph.samplingFrom.showMMM || graph.samplingFrom.showMean;
				else if (this.index == 1)
					return graph.samplingFrom.showMMM || graph.samplingFrom.showMedian;
				else
					return graph.samplingFrom.showMMM || graph.samplingFrom.showMode;
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
						return graph.samplingFrom.showMMM || graph.samplingFrom.showMean;
					else if (this.index == 1)
						return graph.samplingFrom.showMMM || graph.samplingFrom.showMedian;
					else
						return graph.samplingFrom.showMMM || graph.samplingFrom.showMode;
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
				return graph.baseLine + (graph.h-graph.baseLine) * 0.75 + 5;
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
			.visible(function(){
				return graph.MMMLabelVis[this.index] && //graph.showMMM &&
					((this.index == 0) ? graph.samplingFrom.showMean : true) &&
					((this.index == 1) ? graph.samplingFrom.showMedian : true) &&
					((this.index >= 2) ? graph.samplingFrom.showMode : true);
			})
		
		
		/*Insufficient Data for Four Warning */	
		graphPanel.add(pv.Label)
			.text("Insufficient data.")
			.textStyle("red")
			.visible(function(){
				return graph.samplingFrom.groupingMode == "FourEqualGroups" &&
							 graph.insufDataForFour;
			})
			.font(fontString)
			.top(35)
			.left(graph.w/2)
			.textAlign("center")
		
		//Dots
		graphPanel.add(pv.Dot)
			.data(function() {return graph.getDataDrawObjects()})
			.left(function(d) {return d.x })
			.bottom(function(d) { return d.y + graph.baseLine })
			.radius(function() { return graphCollection.bucketDotSize})
			.fillStyle(function(d) { return pointFillStyle(d.set)})
			.strokeStyle(function(d) {
				return pointStrokeStyle(d.set);
			})
			.lineWidth(function(d){
				return 2;
			})
			.title(function(d) { return d.label+", "+graph.x.invert(d.xReal).toFixed(1) })
			
		//Advanced Box Plot Outlier Marks
		graphPanel.add(pv.Dot)
			.data(function(){return getOutlierDrawPositions(graph)})
			.visible(function(d){return graph.samplingFrom.groupingMode == "BoxPlot" &&
																		graph.samplingFrom.advBoxPlot && 
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
			
	} 
}
function constructRegularGraph(graphPanel, graph, index){

	if (graph.includedCategories.length > 0){
	/* Number of datapoints N */
		graphPanel.add(pv.Label)
			.right(10)
			.bottom(10)
			.textAlign("center")
			.textAngle(0)
			.textBaseline("bottom")
			.text(function(){return "n = " + graph.n})
			.font(fontString);
			
		/* X-axis ticks */
		graphPanel.add(pv.Rule)
			.data(function() { return graph.x.ticks() })
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
		
		/* UD Edge of the graph partition lines 
		 * Where new partitions come from 
		 */
		graphPanel.add(pv.Rule)
			.data([{"x":0,"y":0}])
			.left(0)
			.bottom(function(){return graph.baseLine})
			.height(function(){return (graph.h-graph.baseLine) * 0.75})
			.strokeStyle("green")
			.visible(function(){return graph.groupingMode == "UserDefGroups"})
			.anchor("top").add(pv.Dot)
				.left(8)
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
					if (graph.testMode == "sampling")
						vis.render();
					else
						graphPanel.render();
				})
				.event("drag", function(){
					graph.udPartitions[graph.udPartitions.length-1] = vis.mouse();
					if (graph.testMode == "sampling")
						vis.render();
					else
						graphPanel.render();
				})
				.event("dragend",function(){
					graph.udPartitions[graph.udPartitions.length-1] = vis.mouse();
					if (graph.testMode == "sampling")
						vis.render();
					else
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
			.height(function(){return (graph.h-graph.baseLine) * 0.75})
			.strokeStyle("green")
			.visible(function(){return graph.groupingMode == "UserDefGroups"})
			.anchor("top").add(pv.Dot)
				.left(function(d){return d.x + 8})
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
			.height(function(){return (graph.h-graph.baseLine) * 0.75})
			.strokeStyle("green")
			.visible(function(){return graph.groupingMode == "UserDefGroups"})
			
			
		/* UD Partition Data Count Label */
		graphPanel.add(pv.Label)
			.data(function(){return countDataInUserDefPartitions(graph)})
			.textAlign("center")
			.textStyle("green")
			.bottom(function(){return (graph.h-graph.baseLine) * 0.70 + graph.baseLine})
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
			.height(function(){return (graph.h-graph.baseLine) * 0.75})
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
			.bottom(function(){return (graph.h-graph.baseLine) * 0.70 + graph.baseLine})
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
			.height(function(){return (graph.h-graph.baseLine) * 0.75})
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
			.bottom(function(){return (graph.h-graph.baseLine) * 0.70 + graph.baseLine})
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
			.height(function(){return (graph.h-graph.baseLine) * 0.75})
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
			.bottom(function(){return (graph.h-graph.baseLine) * 0.70 + graph.baseLine})
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
			.height(function(){return (graph.h-graph.baseLine) * 0.75})
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
			.bottom(function(){return (graph.h-graph.baseLine) * 0.70 + graph.baseLine})
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
			.data(function(){
				return [[partitionDataInFour(graph)[0], graph.baseLine],
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
			.height(function(){
				if (this.index == 0)
					return (graph.h-graph.baseLine) * 0.75;
				else if (this.index == 1)
					return (graph.h-graph.baseLine) * 0.70;
				else
					return (graph.h-graph.baseLine) * 0.65;
			})
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
				.shape(function(d){
					if(this.index == 0)
						return "square";
					else if (this.index == 1)
						return "circle"
					else
						return "triangle";
				})
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
			.bottom(function(){
				if (this.index == 0)
					return graph.baseLine + (graph.h-graph.baseLine) * 0.75 + 10;
				else if (this.index == 1)
					return graph.baseLine + (graph.h-graph.baseLine) * 0.70 + 10;
				else
					return graph.baseLine + (graph.h-graph.baseLine) * 0.65 + 10;
			})
			//.bottom(function(d){
				//return graph.baseLine + (graph.h-graph.baseLine) * 0.75 + 5;
			//})
			.textStyle(function(d){
				if(this.index == 0)
					return pv.rgb(255,0,0,0.75);
				else if (this.index == 1)
					return pv.rgb(0,0,255,0.75);
				else
					return pv.rgb(0,255,0,0.75);
			})
			.font(fontString)
			.textAlign("center")
			.visible(function(){
				return graph.MMMLabelVis[this.index] && //graph.showMMM &&
					((this.index == 0) ? graph.showMean : true) &&
					((this.index == 1) ? graph.showMedian : true) &&
					((this.index >= 2) ? graph.showMode : true);
			})
		
		
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
		
		/* Line Mode Lines */
		graphPanel.add(pv.Rule)
			.data(function() {return graph.getDataDrawObjects()})
			.visible(function(d) {
				return $('#checkboxHideData').attr('checked') != "checked"  && 
					d.x >= 0 &&
					d.x <= graph.w &&
					graphCollection.lineMode;
			})
			.left(function(d) { return d.xReal })
			.bottom(function(){return graph.baseLine})
			.height(function(){return (graph.h-graph.baseLine) * 0.75})
			.lineWidth(function(){return graphCollection.bucketDotSize})
			.strokeStyle(function(d) {
				var color = pointFillStyle(d.set); 
				return pv.rgb(color.r, color.g, color.b, 0.3)
			})
			.title(function(d) { return d.label+", "+graph.x.invert(d.xReal).toFixed(1) })
		
		
		/* Dots */
		graphPanel.add(pv.Dot)
			.data(function() {return graph.getDataDrawObjects()})
			.visible(function(d) {
				return $('#checkboxHideData').attr('checked') != "checked"  && 
					(d.y+graph.baseLine) < graph.h &&
					d.x >= 0 &&
					d.x <= graph.w &&
					!graphCollection.lineMode;
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
				if (d.label == graphCollection.selectedLabel && graph.testMode != "sampling")
					return graphCollection.bwMode ? "grey": "red";
				else if (graph.testMode == "sampling" &&
								 sampleContainsData(graphCollection.data[graph.selectedSample], d, graph))
					return graphCollection.bwMode ? "grey": "blue";
				else
					return pointStrokeStyle(d.set);
			})
			.lineWidth(function(d){
				if (d.label == graphCollection.selectedLabel && graph.testMode != "sampling") return 4;
				else if (graph.testMode == "sampling" &&
								 sampleContainsData(graphCollection.data[graph.selectedSample], d, graph)) return 4;
				else return 2;
			})
			.title(function(d) { return d.label+", "+graph.x.invert(d.xReal).toFixed(1) })
			.event("click", function(d){
				if (graphCollection.editModeEnabled == false && graph.testMode != "sampling")
					graphCollection.selectedLabel = d.label;
				else if (graph.testMode == "sampling"){
					if (!sampleContainsData(graphCollection.data[graph.selectedSample], d, graph)) {
						graphCollection.data[graph.selectedSample].push(
																		{"set":d.set,
																		 "label":d.label,
																		 "value":graph.x.invert(d.xReal)});
						graph.samplingTo[graph.selectedSampleNumber-1].samplingHowMany++;
						$("#sampleN"+(index+1)).val(graph.samplingTo[graph.selectedSampleNumber-1].samplingHowMany);
																	 
					} else {
						graphCollection.data[graph.selectedSample].splice(sampleIndexOfData(graphCollection.data[graph.selectedSample], d, graph),1);
						graph.samplingTo[graph.selectedSampleNumber-1].samplingHowMany--;
						$("#sampleN"+(index+1)).val(graph.samplingTo[graph.selectedSampleNumber-1].samplingHowMany);
					}
					graph.samplingTo[graph.selectedSampleNumber-1].updateInsufDataFlags();
				}
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
					
					if (graph.testMode == "sampling" &&
							sampleContainsData(graphCollection.data[graph.selectedSample], d, graph)){
						graphCollection.data[graph.selectedSample]
													 .splice(sampleIndexOfData(graphCollection.data[graph.selectedSample], d, graph),1);
						graph.samplingTo[graph.selectedSampleNumber-1].updateInsufDataFlags();
						graph.samplingTo[graph.selectedSampleNumber-1].samplingHowMany--;
						$("#sampleN"+(index+1)).val(graph.samplingTo[graph.selectedSampleNumber-1].samplingHowMany);
					}
					
					
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
	} else {
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
			.text("Drag one or more datasets to this graph to view them.")
			.font(fontString)
		graphPanel.add(pv.Label)
			.left(function(){return graph.w/2})
			.top(function(){return graph.h/2 + 40})
			.textAlign("center")
			.textBaseline("center")
			.text("Click the \"hide datasets\" button in the top bar to hide the datasets panel.")
			.font(fontString)
		graphPanel.add(pv.Label)
			.left(function(){return graph.w/2})
			.top(function(){return graph.h/2 + 60})
			.textAlign("center")
			.textBaseline("center")
			.text("Maximum four datasets per graph.")
			.font(fontString)
			
		graphPanel.add(pv.Label)
			.left(225)
			.top(30)
			.textAlign("center")
			.textBaseline("center")
			.text("<=== Click the wrench to show visualization tools for this graph.")
			.font(fontString)
	}
}

function constructSampleButton(graph, index){
	//console.log("contructing Sample Button");
	$('body').prepend("<div class=\"sampleOptions\" id=\"sampleButton"+index+"\"></div>");
	
	var string = "<table cellpadding='0' cellspacing='4' width='100%'><tr>"+
							 "<td><input type=\"button\" class=\"button\" value=\"Sample\""+
							 "onmousedown=\"javascript:enterUpdateLoop("+index+")\""+
							 "ontouchstart=\"javascript:enterUpdateLoop("+index+")\""+
							 "ontouchend=\"javascript:exitUpdateLoop(); touch.touch = true;\""+
							 "></td></tr></table>";//+
							 //"onmouseup=\"javascript:exitUpdateLoop()\"></td></tr></table>";
							 //"onclick=\"javascript:updateMultipleSamples("+index+")\">";
							 
	$('#sampleButton'+index).html(string);
	
	if (graph.testMode != "sampling" || graph.includedCategories == 0)
		$('#sampleButton'+index).hide();
}

function positionSampleButton(graph, index){
	var top = $('span').offset().top +
						graphCollection.padTop +
						graph.h * (index+1) - 34;
						
	var left = $('span').offset().left +
						 graphCollection.padLeft +
						 graph.w - $('#sampleButton'+index).width() - 30;
	
	$('#sampleButton'+index).css('top', top+"px")
										.css('left',left+"px")
										.css('z-index', 1);
}

function enterUpdateLoop(index){
	if (touch.touch){
		touch.touch = false;
		return;
	}
	
	updateMultipleSamples(index, true);
	document.addEventListener("mouseup", exitUpdateLoop, true);
}

function updateMultipleSamples(sourceIndex, firstTime){
	for (var i =1; i <= graphCollection.graphs[sourceIndex].samplingToHowMany; i++)
		updateSample("sampleN"+(sourceIndex+i),sourceIndex+i);
	if (firstTime)
		updateTimer = setTimeout("updateMultipleSamples("+sourceIndex+", false)", 1000);
	else
		updateTimer = setTimeout("updateMultipleSamples("+sourceIndex+", false)", 1);
}

function exitUpdateLoop(){
	clearTimeout(updateTimer);
	document.removeEventListener("mouseup", exitUpdateLoop, true);
	//if (touched)
		//touch.touch = true;
}

function constructSampleOptionsMenu(graph, index){
	$('body').prepend("<div class=\"sampleOptions\" id=\"sampleOptions"+index+"\"></div>");
	
	var string = "<table cellpadding='0' cellspacing='4' width='100%'><tr>"+
							 "<td><input type=\"button\" class=\"button\" value=\"Show Points\""+
							 "onclick=\"javascript:setHighLightedSample("+index+")\"></td>"+
							// "<td><input type=\"button\" value=\"Sample\""+
							// "onclick=\"javascript:updateSample('sampleN"+index+"',"+index+")\"></td>"+
							 "<td nowrap><label for=\"sampleN"+index+"\">N = </label>"+
							 "<input align=\"right\" type=\"text\" class =\"textbox\" id=\"sampleN"+index+"\""+
								"size=\"2\""+
								"onchange=\"javascript:updateSample('sampleN"+index+"',"+index+")\""+
								"value='"+graph.samplingHowMany+"'></td>"+
							 "</tr></table>";
							
							 
	$('#sampleOptions'+index).html(string);
}

function positionSampleOptions(graph,index){
		var top = $('span').offset().top +
							graphCollection.padTop +
							graph.h * (index+1) - 34;
							
		var left = $('span').offset().left +
							 graphCollection.padLeft +
							 graph.w - $('#sampleOptions'+index).width() + 15;
		
		$('#sampleOptions'+index).css('top', top+"px")
											.css('left',left+"px")
											.css('z-index', 1);
}

function updateSample(textbox, index){
	var sampleSize = parseInt($('#'+textbox).val());
	if (!isNaN(sampleSize)){
		$('#'+textbox).val(graphCollection.graphs[index].updateSample(sampleSize));
	} else {
		$('#'+textbox).val(graphCollection.graphs[index].samplingHowMany);
	}
	
	vis.render();

}

function setHighLightedSample(index){
	graphCollection.graphs[index].samplingFrom.selectedSample = graphCollection.graphs[index].sampleSet;
	graphCollection.graphs[index].samplingFrom.selectedSampleNumber = graphCollection.graphs[index].sampleNumber;
	
	vis.render();
}

function constructResampleControlPanel(graph, index){
	$('body').prepend("<div class=\"resampleOptions\" id=\"resampleOptions"+index+"\"></div>");
	
	var string = "<table cellpadding='0' cellspacing='0' width='100%'><tr>"+
							 "<td colspan=\"7\" id=\"resampleLabel\" align=\"center\">"+
							 (graph.resampleDisplayMode != "pgraph" ?
								"Difference between the Means of Samples from Sample 1 and Sample 2" :
								"Iterations")+
								"</td></tr>"+
							 "<tr align=\"center\">"+
							 
							 "<td><input type=\"button\" value=\"Copy\" id=\"resampleCopyShow"+index+"\""+
							 "onclick=\"javascript:showResamplingCopy("+index+")\"></td>"+
							 
							 "<td><input type=\"button\" value=\""+(resamplingInProgress?"Stop":"Start")+"\" id=\"resampleToggleButton"+index+"\""+
							 "onclick=\"javascript:toggleResampling("+index+")\"></td>"+
							 
							 "<td><input type=\"button\" value=\"Step\" id=\"resampleStepButton"+index+"\""+
							 "onclick=\"javascript:resample("+index+", false)\"></td>"+
							 
							 "<td><input type=\"button\" value=\"Reset\" id=\"resampleResetButton"+index+"\""+
							 "onclick=\"javascript:resetResampling("+index+")\"></td>"+
							 
							 "<td><input type=\"button\" value=\"All\" id=\"resampleAllButton"+index+"\""+
							 "onclick=\"javascript:resampleAtOnce("+index+")\"></td>"+
							 
							 "<td nowrap><label for=\"resampleN"+index+"\">Iterations = </label>"+
							 "<input align=\"right\" type=\"text\" id=\"resampleN"+index+"\""+
								"size=\"4\""+
								"onchange=\"javascript:changeResampleIterations('resampleN"+index+"',"+index+")\""+
								"value='"+graph.resamplingIterations+"'></td>"+
							 
							 "<td>Mode:<select id=\"resampleDisplayMode\" onchange=\"javascript:updateResamplingDisplay()\">"+
									"<option value=\"dot\" "+(graph.resampleDisplayMode=="dot"?"selected":"")+">Dot</option>"+
									"<option value=\"line\" "+(graph.resampleDisplayMode=="line"?"selected":"")+">Line</option>"+
									"<option value=\"histogram\" "+(graph.resampleDisplayMode=="histogram"?"selected":"")+">Histogram</option>"+
									"<option value=\"pgraph\" "+(graph.resampleDisplayMode=="pgraph"?"selected":"")+">P Value Graph</option>"+
								"</select></td>"+
								
								
								//"<td><label for=\"resamplingReplacement\">Replacement</label>"+
								
								//"<input type=\"checkbox\" id=\"resamplingReplacement\""+
									//"onchange=\"javascript:toggleResamplingReplacement("+index+")\" "+(graph.resamplingReplacement?"checked":"")+"></td>"+
								"</tr></table>";
						 
	$('#resampleOptions'+index).html(string);
	
	if (graph.population1.includedCategories.length == 0 ||
		  graph.population2.includedCategories.length == 0)
		$('#resampleOptions'+index).hide();
}

function toggleResamplingReplacement(index){
	var graph = graphCollection.graphs[index];	
	graph.resamplingReplacement = !graph.resamplingReplacement;
	resetResampling(index);	
}


function positionResampleControlPanel(graph, index){
	var top = $('span').offset().top +
						graphCollection.padTop +
						graph.h * (index+1) - 40;
						
	var left = $('span').offset().left +
						 graphCollection.padLeft +
						 graph.w/2 - $('#resampleOptions'+index).width()/2;
	
	$('#resampleOptions'+index).css('max-width',graph.w)
										.css('top', top+"px")
										.css('left',left+"px")
										.css('z-index', 1);
}

function showResamplingCopy(index){
	$('#resamplingCopy').css('position', 'absolute')
										 .css('top', parseInt(window.innerHeight/2 - $('#worksheetMenu').height()/2)+"px")
										 .css('left',parseInt(window.innerWidth/2 - $('#worksheetMenu').width()/2)+"px")
										 .css("z-index",2);
	var csvString = "";
	graphCollection.data[graphCollection.graphs[0].resampleSet].forEach(function(d){
		csvString += d.label +"\t"+d.value.toFixed(2)+"\n";
	});
	
	$('#resamplingText').text(csvString);									 
	$('#resamplingCopy').slideDown();
	$('#resamplingText').focus();
	$('#resamplingText').select();
	$('#resamplingText').scrollTop(0);
		
}

function toggleResampling(index){
	if (resamplingInProgress){
		resamplingInProgress = false;
		$('#resampleToggleButton'+index).val("Start");
		clearTimeout(resampleTimer);
	} else {
		resamplingInProgress = true;
		$('#resampleToggleButton'+index).val("Stop");
		resamplePop1Mean = graphCollection.graphs[index].population1.getMeanMedianMode()[0];
		resamplePop2Mean = graphCollection.graphs[index].population2.getMeanMedianMode()[0];
		resampleTimer = setTimeout("resample("+index+",true)", 50);
	}
}

function resampleAtOnce(index){
	resetResampling(index);
	
	var graph = graphCollection.graphs[index];
	var sample1Size = graph.population1.n;
	var sample2Size = graph.population2.n;
	var group1 = [];
	var ticks = pValTicks(graph);
	
	resamplePop1Mean = graphCollection.graphs[index].population1.getMeanMedianMode()[0];
	resamplePop2Mean = graphCollection.graphs[index].population2.getMeanMedianMode()[0];
	
	if (resampleResetPopulation){
		population = [];
		replacementPop1 = [];
		replacementPop2 = [];
		for (var i=0; i<graph.population1.includedCategories.length; i++){
			graph.data[graph.population1.includedCategories[i]].forEach(function(d){
				d.set = graph.population1.includedCategories[i];
			});
			population = population.concat(graph.data[graph.population1.includedCategories[i]]);
			replacementPop1 = replacementPop1.concat(graph.data[graph.population1.includedCategories[i]]);
		}
			
		for (i=0; i<graph.population2.includedCategories.length; i++){
			graph.data[graph.population2.includedCategories[i]].forEach(function(d){
				d.set = graph.population2.includedCategories[i];
			});
			population = population.concat(graph.data[graph.population2.includedCategories[i]]);
			replacementPop2 = replacementPop2.concat(graph.data[graph.population2.includedCategories[i]]);
		}
		resampleResetPopulation = false;
	}
	
	var group1Sum = 0;
	var group2Sum = 0;
	var group1Mean = 0;
	var group2Mean = 0;
	
	var r = 0;
	
	while (graph.data[graph.resampleSet].length < graph.resamplingIterations){
		group1Sum = 0;
		group2Sum = 0;
		group1Mean = 0;
		group2Mean = 0;
		
		if (graph.resamplingReplacement){
			console.log("replacement");
			group1Counter = sample1Size;
			group2Counter = sample2Size;
			
			while (group1Counter > 0){
				//var randSelection = population[rand(0, population.length)];
				var randSelection = replacementPop1[rand(0, replacementPop1.length)]; //Diaz
				group1Sum += randSelection.value;
				group1Counter--;
				if (graph.data[graph.resampleSet].length == graph.resamplingIterations-1)
					graph.data[graphCollection.graphs[1].intermedResampleSet].push(randSelection);
			}
			while (group2Counter > 0){
				//var randSelection = population[rand(0, population.length)];
				var randSelection = replacementPop2[rand(0, replacementPop2.length)]; //Diaz
				group2Sum += randSelection.value;
				group2Counter--;
				if (graph.data[graph.resampleSet].length == graph.resamplingIterations-1)
					graph.data[graphCollection.graphs[1].secondGraph.intermedResampleSet].push(randSelection);
			}
			
			group1Mean = group1Sum / sample1Size;
			group2Mean = group2Sum / sample2Size;
			
		} else {
			for (i=0; i<population.length; i++)
				group1[i] = false;
			
			group1Counter = sample1Size;
			
			while (group1Counter > 0){
				r = rand(0, population.length);
				if (group1[r] == false){
					group1[r] = true;
					group1Counter--;
				}
			}
			
			group1Sum = 0;
			group2Sum = 0;
			for (i=0; i<population.length; i++){
				if(group1[i]){
					if (graph.data[graph.resampleSet].length == graph.resamplingIterations-1)
						graph.data[graphCollection.graphs[1].intermedResampleSet].push(population[i]);
					group1Sum += population[i].value;
				} else {
					if (graph.data[graph.resampleSet].length == graph.resamplingIterations-1)
						graph.data[graphCollection.graphs[1].secondGraph.intermedResampleSet].push(population[i]);
					group2Sum += population[i].value;
				}
			}
			
			group1Mean = group1Sum / sample1Size;
			group2Mean = group2Sum / sample2Size;
			
		}
		
		if (graph.data[graph.resampleSet].length == graph.resamplingIterations-1) {
			group1Mean = group1Sum / sample1Size;
			group2Mean = group2Sum / sample2Size;
			
			graphCollection.graphs[1].n = graphCollection.data[graphCollection.graphs[1].intermedResampleSet].length
			graphCollection.graphs[1].secondGraph.n = graphCollection.data[graphCollection.graphs[1].secondGraph.intermedResampleSet].length
			
			graphCollection.graphs[1].xMin = pv.min(graphCollection.graphs[1].dataVals(), function(d) { return d });
			graphCollection.graphs[1].xMax = pv.max(graphCollection.graphs[1].dataVals(), function(d) { return d });
			
			graphCollection.graphs[1].secondGraph.xMin = pv.min(graphCollection.graphs[1].secondGraph.dataVals(), function(d) { return d });
			graphCollection.graphs[1].secondGraph.xMax = pv.max(graphCollection.graphs[1].secondGraph.dataVals(), function(d) { return d });
			
			graphCollection.graphs[1].setXScale(graphCollection.graphs[2].scaleMin, graphCollection.graphs[2].scaleMax);
			graphCollection.graphs[1].secondGraph.setXScale(graphCollection.graphs[2].secondGraph.scaleMin, graphCollection.graphs[2].secondGraph.scaleMax);
		}
		
		graph.data[graph.resampleSet].push({"label":"iteration-"+(graph.data[graph.resampleSet].length+1),
																				"value":group1Mean-group2Mean});
		
		if (ticks.indexOf(graph.data[graph.resampleSet].length) != -1){
			var indx = ticks.indexOf(graph.data[graph.resampleSet].length);
			var outside = 0;
			graph.data[graph.resampleSet].forEach(function(d, index){
				if (Math.abs(d.value) >= Math.abs(resamplePop1Mean - resamplePop2Mean) &&
						index < graph.resamplingIterations)
					outside++;
			});
			
			var y = (outside+0.0)/(graph.data[graph.resampleSet].length+0.0);
			graph.resamplingPVals.push({
				"x":ticks[indx],
				"y":y
			})
			
			if (y > graph.resamplingMaxPVal)
				graph.resamplingMaxPVal = y;
		}
	}
	
	var min = -1*Math.abs(resamplePop1Mean - resamplePop2Mean) - 1;
	var max = Math.abs(resamplePop1Mean - resamplePop2Mean) + 1;
	for (i=0;i<graph.data[graph.resampleSet].length;i++){
		if(min > graph.data[graph.resampleSet][i].value)
			min = graph.data[graph.resampleSet][i].value;
		
		if(max < graph.data[graph.resampleSet][i].value)
			max = graph.data[graph.resampleSet][i].value;
	}
	
	if (graph.scaleMin != min || graph.scaleMax != max)
		graph.setXScale(min,max);
	
	graph.partitionIntervalWidth = (max-min)/100;
	
	resamplingInProgress = false;
	constructVis();
}

function resample(index, repeat){
	var graph = graphCollection.graphs[index];
	var ticks = pValTicks(graph);
	
	resamplePop1Mean = graph.population1.getMeanMedianMode()[0];
	resamplePop2Mean = graph.population2.getMeanMedianMode()[0];
	
	if (graph.data[graph.resampleSet].length >= graph.resamplingIterations){
		resamplingInProgress = false;
		$('#resampleToggleButton'+index).val("Start");
		clearTimeout(resampleTimer);
		vis.render();
	} else {
		var graph = graphCollection.graphs[index];
		var group1 = []; //boolean
		var sample1Size = graph.population1.n;
		var sample2Size = graph.population2.n;
		
		if (resampleResetPopulation){
			population = [];
			replacementPop1 = [];
			replacementPop2 = [];
			for (var i=0; i<graph.population1.includedCategories.length; i++){
				graph.data[graph.population1.includedCategories[i]].forEach(function(d){
					d.set = graph.population1.includedCategories[i];
				});
				population = population.concat(graph.data[graph.population1.includedCategories[i]]);
				replacementPop1 = replacementPop1.concat(graph.data[graph.population1.includedCategories[i]]);
			}
				
			for (i=0; i<graph.population2.includedCategories.length; i++){
				graph.data[graph.population2.includedCategories[i]].forEach(function(d){
					d.set = graph.population2.includedCategories[i];
				});
				population = population.concat(graph.data[graph.population2.includedCategories[i]]);
				replacementPop2 = replacementPop2.concat(graph.data[graph.population2.includedCategories[i]]);
			}
			resampleResetPopulation = false;
		}
		
		
		graphCollection.data[graphCollection.graphs[1].intermedResampleSet] = [];
		graphCollection.data[graphCollection.graphs[1].secondGraph.intermedResampleSet] = [];
		
		var group1Sum = 0;
		var group2Sum = 0;
		var group1Mean = 0;
		var group2Mean = 0;
		
		if (graph.resamplingReplacement){
			group1Counter = sample1Size;
			group2Counter = sample2Size;
			
			while (group1Counter > 0){
				//var randSelection = population[rand(0, population.length)];
				var randSelection = replacementPop1[rand(0, replacementPop1.length)]; //Diaz
				group1Sum += randSelection.value;
				graphCollection.data[graphCollection.graphs[1].intermedResampleSet].push(randSelection);
				group1Counter--;
			}
			while (group2Counter > 0){
				//var randSelection = population[rand(0, population.length)];
				var randSelection = replacementPop2[rand(0, replacementPop2.length)]; //Diaz
				group2Sum += randSelection.value;
				graphCollection.data[graphCollection.graphs[1].secondGraph.intermedResampleSet].push(randSelection);
				group2Counter--;
			}
				
		} else {
			for (i=0; i<population.length; i++)
				group1[i] = false;
			
			group1Counter = sample1Size;
			
			while (group1Counter > 0){
				var r = rand(0, population.length);
				if (group1[r] == false){
					group1[r] = true;
					group1Counter--;
				}
			}
			
			group1Sum = 0;
			group2Sum = 0;
			for (i=0; i<population.length; i++){
				if(group1[i]){
					group1Sum += population[i].value;
					graphCollection.data[graphCollection.graphs[1].intermedResampleSet].push(population[i]);
				}else{
					group2Sum += population[i].value;
					graphCollection.data[graphCollection.graphs[1].secondGraph.intermedResampleSet].push(population[i]);
				}
			}
		}
		
		group1Mean = group1Sum / sample1Size;
		group2Mean = group2Sum / sample2Size;
		
		graphCollection.graphs[1].n = graphCollection.data[graphCollection.graphs[1].intermedResampleSet].length
		graphCollection.graphs[1].secondGraph.n = graphCollection.data[graphCollection.graphs[1].secondGraph.intermedResampleSet].length
		
		graphCollection.graphs[1].xMin = pv.min(graphCollection.graphs[1].dataVals(), function(d) { return d });
		graphCollection.graphs[1].xMax = pv.max(graphCollection.graphs[1].dataVals(), function(d) { return d });
		
		graphCollection.graphs[1].secondGraph.xMin = pv.min(graphCollection.graphs[1].secondGraph.dataVals(), function(d) { return d });
		graphCollection.graphs[1].secondGraph.xMax = pv.max(graphCollection.graphs[1].secondGraph.dataVals(), function(d) { return d });
		
		graphCollection.graphs[1].setXScale(graphCollection.graphs[2].scaleMin, graphCollection.graphs[2].scaleMax);
		graphCollection.graphs[1].secondGraph.setXScale(graphCollection.graphs[2].secondGraph.scaleMin, graphCollection.graphs[2].secondGraph.scaleMax);
		
		
		graph.data[graph.resampleSet].push({"label":"iteration-"+(graph.data[graph.resampleSet].length+1),
																				"value":group1Mean-group2Mean});
		var min = -1*Math.abs(resamplePop1Mean - resamplePop2Mean) - 1;
		var max = Math.abs(resamplePop1Mean - resamplePop2Mean) + 1;
		for (i=0;i<graph.data[graph.resampleSet].length;i++){
			if(min > graph.data[graph.resampleSet][i].value)
				min = graph.data[graph.resampleSet][i].value;
			
			if(max < graph.data[graph.resampleSet][i].value)
				max = graph.data[graph.resampleSet][i].value;
		}
		
		if (graph.scaleMin != min || graph.scaleMax != max){
			graph.setXScale(min,max);
			graph.partitionIntervalWidth = (max-min)/100;
		}
		
		if (ticks.indexOf(graph.data[graph.resampleSet].length) != -1){
			var indx = ticks.indexOf(graph.data[graph.resampleSet].length);
			var outside = 0;
			graph.data[graph.resampleSet].forEach(function(d, index){
				if (Math.abs(d.value) >= Math.abs(resamplePop1Mean - resamplePop2Mean) &&
						index < graph.resamplingIterations)
					outside++;
			});
			
			var y = (outside+0.0)/(graph.data[graph.resampleSet].length+0.0);
			graph.resamplingPVals.push({
				"x":ticks[indx],
				"y":y
			})
			
			if (y > graph.resamplingMaxPVal)
				graph.resamplingMaxPVal = y;
		}
		
		if (graph.data[graph.resampleSet].length == 1)
			constructVis();
		
		vis.render();
		
		if (repeat)
			resampleTimer = setTimeout("resample("+index+",true)", 50);
	}
}

function resetResampling(index){
	var graph = graphCollection.graphs[index];
	
	graph.data[graph.resampleSet] = [];
	graph.resamplingPVals = [];
	graph.resamplingMaxPVal = -1;
	resampleResetPopulation = true;
	
	if (resamplingInProgress){
		resamplingInProgress = false;
		$('#resampleToggleButton'+index).val("Start");
		clearTimeout(resampleTimer);
	}
	
	graph.data[graphCollection.graphs[1].intermedResampleSet] = [];
	graph.data[graphCollection.graphs[1].secondGraph.intermedResampleSet] = [];
	
	constructVis();
	//vis.render();
}

function changeResampleIterations(textbox, index){
	var iterations = parseInt($('#'+textbox).val());
	if (!isNaN(iterations) && iterations >= 100 && iterations <= 200000){
		//resetResampling(0);
		//if (graphCollection.graphs[index].resamplingIterations < iterations){
			//$('#'+textbox).val(graphCollection.graphs[index].resamplingIterations = iterations);
			//resetResampling(0);
			//resampleAtOnce(index);
		//} else {
			$('#'+textbox).val(graphCollection.graphs[index].resamplingIterations = iterations);
		//}
			
		
	} else {
		$('#'+textbox).val(graphCollection.graphs[index].resamplingIterations);
	}
	
	vis.render();
}


function constructLegendPanel(graph, index){
	if (graph.isRegularGraph){
		$('body').prepend("<div class=\"legend\" id=\"legend"+index+"\"></div>");
		
		var selCat = graphCollection.graphs[index].selectedCategory;
		
		var string = "<center><table cellpadding='0' cellspacing='0' style='table-layout:fixed;' width='100%'><tr>";
		graph.includedCategories.forEach(function(category, i){
			if (i == 2)
				string += "</tr><tr>"
			var color = pointFillStyle(category);
			string += "<td align='center'><div class='"+(category==selCat&&graphCollection.editModeEnabled?"menuItemSel":"menuItemDef")+"' id='legCat"+index+"-"+i+"' "+ 
								"style=\"color:black; background-color:white; font:"+fontString+";\""+
								"onmouseover=\"javascript:"+ (category==selCat&&graphCollection.editModeEnabled?"this.className='menuItemSel":"this.className='menuItemOver") +"'\""+
								"onmouseout=\"javascript:"+ (category==selCat&&graphCollection.editModeEnabled?"this.className='menuItemSel":"this.className='menuItemDef") +"'\""+
								"onmousedown=\"javascript:legPanDragStart(event,'"+category+"',"+index+", "+i+", false)\""+
								"ontouchstart=\"graphCatTouchStart(event, '"+category+"', "+index+")\""+
								"ontouchmove=\"graphCatTouchMove(event, '"+category+"', "+index+")\""+
								"ontouchend=\"graphCatTouchEnd(event, '"+category+"', "+index+")\""+
								">"+
								"<table cellpadding='2' cellspacing='0'><tr>"+
								"<td><svg version='1.1' viewbox='0 0 18 18' width='18' height='18' style='border-style:none;'>"+
								"<rect id='lgndColor"+index+"-"+i+"' height='14' width='14' x='1' y='1' style='fill: rgb("+color.r+","+color.g+","+color.b+"); stroke: black; stroke-width: 2'/>"+
								"</svg></td>"+
								//"<td><div id='lgndColor"+index+"-"+i+"' style='background-color:rgb("+color.r+","+color.g+","+color.b+
								//"); border:2px solid black; width:20px; height:20px;'></div></td>"+
								"<td style='overflow:hidden;'><div id='lgndText"+index+"-"+i+"' style='white-space:nowrap; width:100%;'>"+category+"</div></td></tr></table></div></td>";
		});
		string += "</tr></table></center>";
		$('#legend'+index).html(string);
		
	} else if (graph.isDoubleGraph){
		
		if (graph.includedCategories.length > 0){
			$('body').prepend("<div class=\"legend\" id=\"legend"+index+"-1\"></div>");
			var selCat = graphCollection.graphs[index].selectedCategory;		
			var string = "<center><table cellpadding='0' cellspacing='0' style='table-layout:fixed;' width='100%'><tr>";	
			var category = graph.includedCategories[0];
			var i = 0;		
			var color = pointFillStyle(category);
			string += "<td align='center'><div class='"+(category==selCat&&graphCollection.editModeEnabled?"menuItemSel":"menuItemDef")+"' id='legCat"+index+"-"+i+"' "+ 
								"style=\"color:black; background-color:white; font:"+fontString+";\""+
								"onmouseover=\"javascript:"+ (category==selCat&&graphCollection.editModeEnabled?"this.className='menuItemSel":"this.className='menuItemOver") +"'\""+
								"onmouseout=\"javascript:"+ (category==selCat&&graphCollection.editModeEnabled?"this.className='menuItemSel":"this.className='menuItemDef") +"'\""+
								"onmousedown=\"javascript:legPanDragStart(event,'"+category+"',"+index+", "+i+", false)\""+
								"ontouchstart=\"graphCatTouchStart(event, '"+category+"', "+index+")\""+
								"ontouchmove=\"graphCatTouchMove(event, '"+category+"', "+index+")\""+
								"ontouchend=\"graphCatTouchEnd(event, '"+category+"', "+index+")\""+
								">"+
								"<table cellpadding='2' cellspacing='0'><tr>"+
								"<td><svg version='1.1' viewbox='0 0 18 18' width='18' height='18' style='border-style:none;'>"+
								"<rect id='lgndColor"+index+"-"+i+"' height='14' width='14' x='1' y='1' style='fill: rgb("+color.r+","+color.g+","+color.b+"); stroke: black; stroke-width: 2'/>"+
								"</svg></td>"+
								//"<td><div id='lgndColor"+index+"-"+i+"' style='background-color:rgb("+color.r+","+color.g+","+color.b+
								//"); border:2px solid black; width:20px; height:20px;'></div></td>"+
								"<td style='overflow:hidden;'><div id='lgndText"+index+"-"+i+"' style='white-space:nowrap; width:100%;'>"+category+"</div></td></tr></table></div></td>";
		
			string += "</tr></table></center>";
			$('#legend'+index+"-1").html(string);
		}
		
		if (graph.secondGraph.includedCategories.length > 0){
			$('body').prepend("<div class=\"legend\" id=\"legend"+index+"-2\"></div>");		
			var selCat = graphCollection.graphs[index].selectedCategory;			
			var string = "<center><table cellpadding='0' cellspacing='0' style='table-layout:fixed;' width='100%'><tr>";			
			var category = graph.secondGraph.includedCategories[0];
			var i = 1;			
			var color = pointFillStyle(category);
			string += "<td align='center'><div class='"+(category==selCat&&graphCollection.editModeEnabled?"menuItemSel":"menuItemDef")+"' id='legCat"+index+"-"+i+"' "+ 
								"style=\"color:black; background-color:white; font:"+fontString+";\""+
								"onmouseover=\"javascript:"+ (category==selCat&&graphCollection.editModeEnabled?"this.className='menuItemSel":"this.className='menuItemOver") +"'\""+
								"onmouseout=\"javascript:"+ (category==selCat&&graphCollection.editModeEnabled?"this.className='menuItemSel":"this.className='menuItemDef") +"'\""+
								"onmousedown=\"javascript:legPanDragStart(event,'"+category+"',"+index+", "+i+", true)\""+
								"ontouchstart=\"graphCatTouchStart(event, '"+category+"', "+index+")\""+
								"ontouchmove=\"graphCatTouchMove(event, '"+category+"', "+index+")\""+
								"ontouchend=\"graphCatTouchEnd(event, '"+category+"', "+index+")\""+
								">"+
								"<table cellpadding='2' cellspacing='0'><tr>"+
								"<td><svg version='1.1' viewbox='0 0 18 18' width='18' height='18' style='border-style:none;'>"+
								"<rect id='lgndColor"+index+"-"+i+"' height='14' width='14' x='1' y='1' style='fill: rgb("+color.r+","+color.g+","+color.b+"); stroke: black; stroke-width: 2'/>"+
								"</svg></td>"+
								//"<td><div id='lgndColor"+index+"-"+i+"' style='background-color:rgb("+color.r+","+color.g+","+color.b+
								//"); border:2px solid black; width:20px; height:20px;'></div></td>"+
								"<td style='overflow:hidden;'><div id='lgndText"+index+"-"+i+"' style='white-space:nowrap; width:100%;'>"+category+"</div></td></tr></table></div></td>";
			
			string += "</tr></table></center>";
			$('#legend'+index+"-2").html(string);
		}
		
		
		
	}
}


function positionAndSizeLegendPanel(graph,index){
	var top = $('span').offset().top +
						graphCollection.padTop +
						graph.h * (index+1) - 34;
						
	if (graph.includedCategories.length > 2)
		top -= 35;
	
	var left = $('span').offset().left +
								graphCollection.padLeft;
	
	if(graph.isRegularGraph){
		$('#legend'+index).css('top', top+"px")
											.css('left',left+"px")
											.css('width',graphCollection.w-40 -
														(graph.testMode=="sampling"?
															$('#sampleButton'+index).width() :
															0
														))
											.css('max-width',graphCollection.w-40)
											.css('z-index', 1);
	} else if (graph.isDoubleGraph){
		$('#legend'+index+"-1").css('top', top+"px")
											.css('left',left+"px")
											.css('width',graphCollection.w/2-40 -
														(graph.testMode=="sampling"?
															$('#sampleButton'+index).width() :
															0
														))
											.css('max-width',graphCollection.w/2-40)
											.css('z-index', 1);
											
		$('#legend'+index+"-2").css('top', top+"px")
											.css('left',left+graph.w/2+graphCollection.padLeft+"px")
											.css('width',graphCollection.w/2-40 -
														(graph.testMode=="sampling"?
															$('#sampleButton'+index).width() :
															0
														))
											.css('max-width',graphCollection.w/2-40)
											.css('z-index', 1);
	}
						
	
}

function constructPopulationLabels(){
	var popLab1 = "<div class=\"populationLabels\" id=\"population1\""+
								"style=\"color:black; background-color:white;\""+
								"onmouseover=\"javascript: this.className='populationLabelsHilight'\""+
								"onmouseout=\"javascript: this.className='populationLabels'\""+
								"onmousedown=\"javascript:popLabDragStart(event, 1)\""+
								"ontouchstart=\"popLabTouchStart(event, 1)\""+
								"ontouchmove=\"popLabTouchMove(event, 1)\""+
								"ontouchend=\"popLabTouchEnd(event, 1)\""+
								">Sample 1</div>"
		
	var popLab2 = "<div class=\"populationLabels\" id=\"population2\""+
								"style=\"color:black; background-color:white;\""+
								"onmouseover=\"javascript: this.className='populationLabelsHilight'\""+
								"onmouseout=\"javascript: this.className='populationLabels'\""+
								"onmousedown=\"javascript:popLabDragStart(event, 2)\""+
								"ontouchstart=\"popLabTouchStart(event, 2)\""+
								"ontouchmove=\"popLabTouchMove(event, 2)\""+
								"ontouchend=\"popLabTouchEnd(event, 2)\""+
								">Sample 2</div>"
		
	$('body').prepend(popLab1);
	$('body').prepend(popLab2);
}

function positionPopulationLabels(){
	var graph1 = graphCollection.graphs[0].population1;

	var top1 = $('span').offset().top +
						graphCollection.padTop +
						graph1.h * (graphCollection.graphs.indexOf(graph1)) +
						10;
						
	var left1 = $('span').offset().left +
						 graphCollection.padLeft + 20;
	
	$('#population1').css('top', top1+"px")
										.css('left',left1+"px")
										.css('z-index', 1);
										
	var graph2 = graphCollection.graphs[0].population2;

	var top2 = $('span').offset().top +
						graphCollection.padTop +
						graph2.h * (graphCollection.graphs.indexOf(graph2)) +
						10;
						
	var left2 = $('span').offset().left +
						 graphCollection.padLeft + 20 +
						 (graphCollection.graphs.indexOf(graph1) == graphCollection.graphs.indexOf(graph2) ?
								100 : 
								0);
	
	$('#population2').css('top', top2+"px")
										.css('left',left2+"px")
										.css('z-index', 1);
}

function toggleDatasetMenu() {
	if (!graphCollection.datasetsMenuShowing){
		$('#datasets').show();
		graphCollection.datasetsMenuShowing = true;
		resizeVis();
		//graphCollection.setW(graphCollection.calcGraphWidth());
		
		$('span').css('position', 'absolute')
						 .css('left',$('#datasets').width()+29)
						 .css('z-index', -1);
		positionGroupingMenuOverGraph(graphCollection.selectedGraphIndex, graphCollection);
		positionDisplayMenu();
	} else {
		$('#datasets').hide();
		graphCollection.datasetsMenuShowing = false;
		graphCollection.setW(graphCollection.calcGraphWidth());
		//vis.render();
		$('span').css('position', 'absolute')
						 .css('left',8)
						 .css('z-index', -1);
		constructVis();
		positionGroupingMenuOverGraph(graphCollection.selectedGraphIndex, graphCollection);
		positionDisplayMenu();
	}
	//vis.render();
	
	//for(var i=0; i<graphCollection.graphs.length;i++){
		//positionAndSizeLegendPanel(graphCollection.graphs[i],i);
		//positionPopulationLabels();
		//positionSampleOptions(graphCollection.graphs[i],i);
		//positionSampleButton(graphCollection.graphs[i],i);
		//positionResampleControlPanel(graphCollection.graphs[i],i);
	//}
}


