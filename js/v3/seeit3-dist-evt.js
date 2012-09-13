/* Events */	

/* Dynamic Graph Resizing */
$(window).resize(function() {
	if (graphCollection.hasOwnProperty("data")){
		//console.log("Old:" + graphCollection.w + "..." + graphCollection.h);
		graphCollection.setW(graphCollection.calcGraphWidth());
		graphCollection.setH(graphCollection.calcGraphHeight());
		
		constructVis();
		
		if (graphCollection.datasetsMenuShowing)
			$('span').css('position', 'absolute')
								.css('left',$('#datasets').width()+29)
								.css('z-index', -1);
		else
			$('span').css('position', 'absolute')
								.css('left',8)
								.css('z-index', -1);
	}
});

/* Top Bar Menu Items */
function editInGoogleDocs(title){
	var URL = graphCollection.worksheets[title].URL;
	var matches = /feeds\/cells\/([A-Z|a-z|0-9|_|-]+)/.exec(URL);
	window.open('https://spreadsheets.google.com/ccc?key=' + matches[1]);
}


function refreshWorksheet(title){
	graphCollection.worksheets[title].fetchWorksheetData();
	exampleSpreadsheets.forEach(function(s){
		s.worksheets.forEach(function(w){
			if (w.title == title){
				graphCollection.addWorksheet(w);
			}
		})
	})
	if ($('#fitScaleToData').is(':checked')){
		jQuery('#fitScaleToData').attr('checked', false);
	}
};

$('#about').click(function(){
	$('#aboutPopup').slideToggle();
});

$('#print').click(function(){
	if (graphCollection.datasetsMenuShowing) toggleDatasetMenu();
	$('#notGraph').hide();
	graphCollection.printMode = true;
	graphCollection.setW(600);
	constructVis();
	
	window.print();
	
	$('#notGraph').show();
	graphCollection.printMode = false;
	graphCollection.setW(graphCollection.calcGraphWidth());
	constructVis();
});

$('#aboutPopup').hide();

function positionAboutPopup(){
	$('#aboutPopup').css('position', 'absolute')
										 .css('top', parseInt(window.innerHeight/2 - $('#aboutPopup').height()/2)+"px")
										 .css('left',parseInt(window.innerWidth/2 - $('#aboutPopup').width()/2)+"px")
										 .css("z-index",2);
}
positionAboutPopup();

/* Grouping Menu */
$('#groupingOptions').hide();

jQuery('#groupingOptions').change(function(event) {
	graphCollection.graphs[graphCollection.selectedGraphIndex].groupingMode = $('input:radio[name=mode]:checked').attr('id').slice(5);
	graphCollection.graphs[graphCollection.selectedGraphIndex].histogram = $('#checkboxHistogram').is(':checked');
	graphCollection.graphs[graphCollection.selectedGraphIndex].sdLine = $('#checkboxSDLine').is(':checked');
	graphCollection.graphs[graphCollection.selectedGraphIndex].advBoxPlot = $('#checkboxAdvBP').is(':checked');
		
	graphCollection.graphs[graphCollection.selectedGraphIndex].showMMM = $('#checkboxMMM').is(':checked');
	graphCollection.graphs[graphCollection.selectedGraphIndex].showMean = $('#checkboxMean').is(':checked');
	graphCollection.graphs[graphCollection.selectedGraphIndex].showMedian = $('#checkboxMedian').is(':checked');
	graphCollection.graphs[graphCollection.selectedGraphIndex].showMode = $('#checkboxMode').is(':checked');
	
  vis.render();
  event.stopPropagation();
});

//sampling engine checkbox
jQuery('#sampling').change(function(event) {
	var testMode = $('#sampling').attr('checked') == 'checked' ? "sampling" : "noTest";
	graphCollection.graphs[graphCollection.selectedGraphIndex].testMode = testMode;
	
	if (graphCollection.graphs[graphCollection.selectedGraphIndex].testMode != "sampling")
		graphCollection.graphs[graphCollection.selectedGraphIndex].samplingData = [];
	
	graphCollection.graphs[graphCollection.selectedGraphIndex].sampleSet = [];
	graphCollection.graphs[graphCollection.selectedGraphIndex].samplingTo = [];
	for (var i=1; i<= graphCollection.graphs[graphCollection.selectedGraphIndex].samplingToHowMany; i++){
		if (graphCollection.graphs[graphCollection.selectedGraphIndex+1] != undefined){
			if (graphCollection.graphs[graphCollection.selectedGraphIndex+1].isSamplingGraph){
				delete graphCollection.data[graphCollection.graphs[graphCollection.selectedGraphIndex].sampleSet[i-1]];
				graphCollection.removeGraph(graphCollection.graphs[graphCollection.selectedGraphIndex+1]);
			}
		}
	}
	
	if (testMode == "sampling"){
		for (i=1; i<= graphCollection.graphs[graphCollection.selectedGraphIndex].samplingToHowMany; i++){
			graphCollection.addSamplingGraph(graphCollection.selectedGraphIndex, i);
			graphCollection.graphs[graphCollection.selectedGraphIndex+i].updateSample(graphCollection.graphs[graphCollection.selectedGraphIndex+i].samplingHowMany);
		}
		setHighLightedSample(graphCollection.selectedGraphIndex+1);
	}
	
	constructVis();
});

//number of sampling graphs per source graph
jQuery('#numSamples').change(function(event){
	var newNumSamples = parseInt($('#numSamples').val());
	var selectedGraph = graphCollection.graphs[graphCollection.selectedGraphIndex];
	
	if ($('#sampling').attr('checked') == 'checked'){
		if (newNumSamples > selectedGraph.samplingToHowMany){
			selectedGraph.samplingToHowMany = newNumSamples;
			graphCollection.addSamplingGraph(graphCollection.selectedGraphIndex, 2);
			graphCollection.graphs[graphCollection.selectedGraphIndex+2].updateSample(graphCollection.graphs[graphCollection.selectedGraphIndex+2].samplingHowMany);
		} else if (newNumSamples < selectedGraph.samplingToHowMany){
			selectedGraph.samplingToHowMany = newNumSamples;
			delete graphCollection.data[graphCollection.graphs[graphCollection.selectedGraphIndex].sampleSet[1]];
			graphCollection.graphs[graphCollection.selectedGraphIndex].sampleSet[1] = null;
			graphCollection.graphs[graphCollection.selectedGraphIndex].samplingTo[1] = null;
			graphCollection.graphs[graphCollection.selectedGraphIndex].selectedSample = graphCollection.graphs[graphCollection.selectedGraphIndex].sampleSet[0];
			graphCollection.graphs[graphCollection.selectedGraphIndex].selectedSampleNumber = 1;
			graphCollection.removeGraph(graphCollection.graphs[graphCollection.selectedGraphIndex+2]);
		}
		
		constructVis();
	} else {
		selectedGraph.samplingToHowMany = newNumSamples;
	}
});

$('#checkboxMMM').change(function(event){
	$('#checkboxMean').attr('checked', $('#checkboxMMM').is(':checked'));
	$('#checkboxMedian').attr('checked', $('#checkboxMMM').is(':checked'));
	$('#checkboxMode').attr('checked', $('#checkboxMMM').is(':checked'));
});

$('#checkboxMean').change(function(event){
	$('#checkboxMMM').attr('checked', $('#checkboxMean').is(':checked') &&
																	$('#checkboxMedian').is(':checked') &&
																	$('#checkboxMode').is(':checked'));
});

$('#checkboxMedian').change(function(event){
	$('#checkboxMMM').attr('checked', $('#checkboxMean').is(':checked') &&
																	$('#checkboxMedian').is(':checked') &&
																	$('#checkboxMode').is(':checked'));
});

$('#checkboxMode').change(function(event){
	$('#checkboxMMM').attr('checked', $('#checkboxMean').is(':checked') &&
																	$('#checkboxMedian').is(':checked') &&
																	$('#checkboxMode').is(':checked'));
});

$('#textXMin').change(function(event) {
	var textBoxVal = parseFloat($('#textXMin').val());
	var curMax = graphCollection.graphs[graphCollection.selectedGraphIndex].x.domain()[1];
	if (isNaN(textBoxVal) || textBoxVal >= curMax){
		$('#textXMin').val(graphCollection.graphs[graphCollection.selectedGraphIndex].x.domain()[0]);
	} else {
		graphCollection.graphs[graphCollection.selectedGraphIndex].fitScaleToData = false;
		graphCollection.graphs[graphCollection.selectedGraphIndex].setXScale(textBoxVal, curMax);
		graphCollection.graphs[graphCollection.selectedGraphIndex].customScale = true;
		graphCollection.updateMenuOptions();
		vis.render();
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
		graphCollection.graphs[graphCollection.selectedGraphIndex].customScale = true;
		graphCollection.updateMenuOptions();
		vis.render();
	}
});

$('#fixedGroupSize').change(function(event) {
	var textBoxVal = parseFloat($('#fixedGroupSize').val());
	if (isNaN(textBoxVal) || textBoxVal <= 0){
		$('#fixedGroupSize').val(graphCollection.graphs[graphCollection.selectedGraphIndex].partitionGroupSize);
	} else {
		graphCollection.graphs[graphCollection.selectedGraphIndex].partitionGroupSize = textBoxVal;
		vis.render();
	}
});

$('#fixedIntervalWidth').change(function(event) {
	var textBoxVal = parseFloat($('#fixedIntervalWidth').val());
	if (isNaN(textBoxVal) || textBoxVal <= 0){
		$('#fixedIntervalWidth').val(graphCollection.graphs[graphCollection.selectedGraphIndex].partitionIntervalWidth);
	} else {
		graphCollection.graphs[graphCollection.selectedGraphIndex].partitionIntervalWidth = textBoxVal;
		vis.render();
	}
});

$('#fitScaleToData').change(function() {
	graphCollection.graphs[graphCollection.selectedGraphIndex].fitScaleToData = jQuery('#fitScaleToData').is(':checked');
	graphCollection.graphs[graphCollection.selectedGraphIndex].setXScale();
	graphCollection.updateMenuOptions();
	vis.render();
});

$('#applyOptionsToAll').click(function(event){
	var selGraph = graphCollection.graphs[graphCollection.selectedGraphIndex];
	
	graphCollection.graphs.forEach(function(graph, index){
		graph.histogram = selGraph.histogram;
		graph.fitScaleToData = selGraph.fitScaleToData;
		graph.groupingMode = selGraph.groupingMode;
		graph.partitionGroupSize = selGraph.partitionGroupSize;
		if (!graph.isResamplingGraph)
			graph.partitionIntervalWidth = selGraph.partitionIntervalWidth;
		graph.showMMM = selGraph.showMMM;
		graph.showMean = selGraph.showMean;
		graph.showMedian = selGraph.showMedian;
		graph.showMode = selGraph.showMode;
		graph.sdLine = selGraph.sdLine;
		graph.advBoxPlot = selGraph.advBoxPlot;
		
		//Old way which caused udpartitions to share a reference.  Make this an option?
		//graph.udPartitions = selGraph.udPartitions;
		
		//clone udPartitions
		if (index != graphCollection.selectedGraphIndex){
			graph.udPartitions = [];
			for (var i = 0; i < selGraph.udPartitions.length; i++){
				graph.udPartitions.push(pv.vector(selGraph.udPartitions[i].x, selGraph.udPartitions[i].y))
			}
		}
		if (!graph.isResamplingGraph){
			if (selGraph.customScale)
				graph.setXScale(selGraph.scaleMin, selGraph.scaleMax);
				
			graph.setXScale();
		}
	});
	vis.render();
});

$('#groupOptClose').click(function(){
	hideMenus();
});


/* Visualization Options */
$('#displayOptions').hide();

$('#checkboxBWView').change(function() { vis.render() });

$("#divisionsInc").click(function(){
	if (graphCollection.buckets < 40)
		graphCollection.buckets++;
	$("#divisionsValue").html(graphCollection.buckets);
	vis.render();
})

$("#divisionsDec").click(function(){
	if (graphCollection.buckets > 2)
		graphCollection.buckets--;
	$("#divisionsValue").html(graphCollection.buckets);
	vis.render();
})

$("#dotSizeInc").click(function(){
	if (graphCollection.bucketDotSize < 12)
		graphCollection.bucketDotSize++;
	$("#dotSizeValue").html(graphCollection.bucketDotSize);
	vis.render();
})

$("#dotSizeDec").click(function(){
	if (graphCollection.bucketDotSize > 2)
		graphCollection.bucketDotSize--;
	$("#dotSizeValue").html(graphCollection.bucketDotSize);
	vis.render();
})

$("#textSizeInc").click(function(){
	if (parseInt(graphCollection.tickTextSize) < 20){
		graphCollection.tickTextSize = (parseInt(graphCollection.tickTextSize)+1)+"";
		graphCollection.labelTextSize = (parseInt(graphCollection.labelTextSize)+1)+"";
		$("#textSizeValue").html(graphCollection.tickTextSize);
		vis.render();
	}
})

$("#textSizeDec").click(function(){
	if (parseInt(graphCollection.tickTextSize) > 12){
		graphCollection.tickTextSize = (parseInt(graphCollection.tickTextSize)-1)+"";
		graphCollection.labelTextSize = (parseInt(graphCollection.labelTextSize)-1)+"";
		$("#textSizeValue").html(graphCollection.tickTextSize);
		vis.render();
	}
})




$('#checkboxHideData').change(function() { vis.render();});

$('#divisionsCell').hide();

$('#displayOptions').change(function(){
	if ($('#drawMode option:selected').text() != "Gravity"){
		$('#divisionsCell').show();
	} else {
		$('#divisionsCell').hide();
	}
	
	graphCollection.bwMode = jQuery('#checkboxBWView').is(':checked');
	
	constructVis();
})

$("#buttonMode").change(function(){
	var val = jQuery("#buttonMode option:selected").val();
	
	if (val == "both"){
		graphCollection.buttonText = true;
		graphCollection.buttonIcon = true;
	} else if (val == "icon"){
		graphCollection.buttonText = false;
		graphCollection.buttonIcon = true;
	} else if (val == "text"){
		graphCollection.buttonText = true;
		graphCollection.buttonIcon = false;
	}
	vis.render();
});


/* Touch Events */
document.addEventListener("touchstart", touchStart, false);

function touchStart(event){
  if (!touch.dragging) return;
	
	switch (touch.dragType){
		case "data":
			dataTouchStart(event);
			break;
		case "partitionCreate":
			partitionCreateTouchStart(event);
			break;
		case "partitionMove":
			partitionMoveTouchStart(event);
			break;
	}
}

function dataTouchStart(event){
	if (!graphCollection.editModeEnabled){
		var curX = event.targetTouches[0].pageX;// -
							//$('span').offset().left -
							//graphCollection.padLeft;
							
		var curY = event.targetTouches[0].pageY;// - 
							//$('span').offset().top - 
							//graphCollection.padTop;
							
		var d = touch.dataObj;
		var graph = graphCollection.graphs[touch.graphIndex];
		
		$('#dragFeedback').html(d.label+", "+graph.x.invert(d.xReal).toFixed(1));
		$('#dragFeedback').show();
		$('#dragFeedback').css('position', 'absolute')
									 .css('left',curX)
									 .css('top',curY - 30)
									 .css('z-index', 10000);
	}
	return;
}

function sideCatTouchStart(event, category){
	var curX = event.targetTouches[0].clientX;
	var curY = event.targetTouches[0].clientY;
							
	$('#dragFeedback').html(category);
	$('#dragFeedback').show();
	$('#dragFeedback').css('position', 'absolute')
								 .css('left',curX)
								 .css('top',curY)
								 .css('z-index', 10000);
}

function graphCatTouchStart(event, category, graphIndex){
	
	var curX = event.targetTouches[0].clientX;
	var curY = event.targetTouches[0].clientY;
	
	graphCollection.graphs[graphIndex].selectedCategory = category;
							
	$('#dragFeedback').html(category);
	$('#dragFeedback').show();
	$('#dragFeedback').css('position', 'absolute')
										.css('left',curX)
										.css('top',curY)
										.css('z-index', 10000);
}

function partitionCreateTouchStart(event){
	var curX = event.targetTouches[0].pageX -
							$('span').offset().left -
							graphCollection.padLeft + 14;
							
	var curY = event.targetTouches[0].pageY - 
							$('span').offset().top - 
							graphCollection.padTop;
	
	graphCollection.selectAUserDefPartition(touch.graphIndex,
		graphCollection.graphs[touch.graphIndex].udPartitions
			.push(pv.vector(curX,curY))-1
	)
	touch.graphPanel.render();
}

function partitionMoveTouchStart(event){
	graphCollection.selectAUserDefPartition(touch.graphIndex, touch.partitionIndex);
	touch.graphPanel.render();
}


document.addEventListener("touchmove", touchMove, false);

function touchMove(event){
  if (!touch.dragging) return;
  
  switch (touch.dragType){
		case "data":
			dataTouchMove(event);
			break;
		case "partitionCreate":
			partitionCreateTouchMove(event);
			break;
		case "partitionMove":
			partitionMoveTouchMove(event);
			break;
	}
}

function dataTouchMove(event){
	var curX = event.targetTouches[0].pageX -
							$('span').offset().left -
							graphCollection.padLeft;
							
	var curY = event.targetTouches[0].pageY - 
							$('span').offset().top - 
							graphCollection.padTop;
	touch.finalX = curX;
	touch.finalY = curY;
	var d = touch.dataObj;
	var graph = graphCollection.graphs[touch.graphIndex];
	
	if (graphCollection.editModeEnabled){
		if (curX >= 0 && curY <= graph.w - 5){
			var worksheet = "";
			for (var key in graphCollection.worksheets){
				if (graphCollection.worksheets[key].data[d.set] != undefined)
					worksheet = key;
			}
			
			graphCollection.editSinglePoint(worksheet,d.set,d.label,graph.x.invert(curX));
			graph.selectedCategory = d.set;
		
			touch.dragLabel.text(graph.x.invert(curX).toFixed(1));
			touch.dragLabel.left(curX)
			touch.dragLabel.top(curY - 20)
			touch.dragLabel.visible(true)
			
			vis.render();
		} else {
			touch.dragLabel.text("Delete");
			vis.render();
		}
	} else {
		$('#dragFeedback').css('position', 'absolute')
									 .css('left',curX + $('span').offset().left + graphCollection.padLeft)
									 .css('top',curY + $('span').offset().top + graphCollection.padTop - 30)
									 .css('z-index', 10000);
	}
}

function sideCatTouchMove(event, category){
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

function graphCatTouchMove(event, category, graphIndex){
	event.preventDefault();
	var curX = event.targetTouches[0].clientX;
	var curY = event.targetTouches[0].clientY;
	
	touch.finalX = curX;
	touch.finalY = curY;
							
	$('#dragFeedback').html(category);
	$('#dragFeedback').show();
	$('#dragFeedback').css('position', 'absolute')
										.css('left',curX)
										.css('top',curY)
										.css('z-index', 10000);
}

function partitionCreateTouchMove(event){
	var graph = graphCollection.graphs[touch.graphIndex];
	var curX = event.targetTouches[0].pageX -
							$('span').offset().left -
							graphCollection.padLeft + 14;
							
	var curY = event.targetTouches[0].pageY - 
							$('span').offset().top - 
							graphCollection.padTop;
	touch.finalX = curX;
	touch.finalY = curY;
	
	graph.udPartitions[graph.udPartitions.length-1] = pv.vector(curX,curY);
	
	touch.graphPanel.render();
}

function partitionMoveTouchMove(event){
	var graph = graphCollection.graphs[touch.graphIndex];
	var curX = event.targetTouches[0].pageX -
							$('span').offset().left -
							graphCollection.padLeft + 14;
							
	var curY = event.targetTouches[0].pageY - 
							$('span').offset().top - 
							graphCollection.padTop;
	touch.finalX = curX;
	touch.finalY = curY;
	
	graph.udPartitions[touch.partitionIndex] = pv.vector(curX,curY);
	
	touch.graphPanel.render();
}


document.addEventListener("touchend", touchEnd, false);

function touchEnd(event){ 
  if (!touch.dragging) return;
	
	switch (touch.dragType){
		case "data":
			dataTouchEnd(event);
			break;
		case "partitionCreate":
			partitionCreateTouchEnd(event);
			break;
		case "partitionMove":
			partitionMoveTouchEnd(event);
			break;
	}
}

function dataTouchEnd(event){
	if (graphCollection.editModeEnabled){
		var d = touch.dataObj;
		var graph = graphCollection.graphs[touch.graphIndex];
		var curX = touch.finalX;
		var curY = touch.finalY;
		
		var newData = graphCollection.data[d.set];
		var remIndex = null;
		newData.forEach(function(data, index){
			if (data.label == d.label && 
			(curX < 0 ||
			curX > graph.w - 5)){
				remIndex = index;
			}
		});
		if (remIndex != null)
			newData.splice(remIndex,1);
			
		var worksheet = "";
		for (var key in graphCollection.worksheets){
			if (graphCollection.worksheets[key].data[d.set] != undefined)
				worksheet = key;
		}
		
		graphCollection.editData(worksheet,d.set,d.set,newData);
		
	
		if (Math.abs(curX - d.x) <= graphCollection.bucketDotSize &&
				Math.abs((graph.h - curY) - (d.y + graph.baseLine)) <= graphCollection.bucketDotSize+1)
		{
			dragging = true;
		}
		
		touch.dragLabel.visible(false);
		touch.reset();
		vis.render();
	}
	$('#dragFeedback').hide();
	touch.reset();
}

function sideCatTouchEnd(event, category){
	var curX = touch.finalX -
							$('span').offset().left -
							graphCollection.padLeft + 14;
							
	var curY = touch.finalY - 
							$('span').offset().top - 
							graphCollection.padTop;
	
	$('#dragFeedback').hide();
	if(curX > 0 && curX < graphCollection.w && curY > 0 && curY < graphCollection.h){
		if (graphCollection.graphs.length > 4){
			var which = parseInt(curY/graphCollection.defaultGraphHeight);
			graphCollection.graphs[which].addCategory(category);
			graphCollection.updateMenuOptions();
		} else {
			var which = parseInt(curY/(graphCollection.h/graphCollection.graphs.length));
			graphCollection.graphs[which].addCategory(category);
			graphCollection.updateMenuOptions();
		}
	}
	touch.touch = true;
	constructVis();
}

function graphCatTouchEnd(event, category, graphIndex){
	var curX = touch.finalX -
							$('span').offset().left -
							graphCollection.padLeft + 14;
	
	var curY = touch.finalY - 
							$('span').offset().top - 
							graphCollection.padTop;
	
	$('#dragFeedback').hide();
	if(curX > 0 && curX < graphCollection.w && curY > 0 && curY < graphCollection.h){
		if (graphCollection.graphs.length > 4){
			var which = parseInt(curY/graphCollection.defaultGraphHeight);
			
			if (graphCollection.graphs[which].addCategory(category))
				graphCollection.graphs[touch.dragGraphIndex].removeCategory(category);
			
			graphCollection.updateMenuOptions();
		} else {
			var which = parseInt(curY/(graphCollection.h/graphCollection.graphs.length));
			if (graphCollection.graphs[which].addCategory(category))
				graphCollection.graphs[graphIndex].removeCategory(category);
			
			graphCollection.updateMenuOptions();
		}
	} else {
		graphCollection.graphs[graphIndex].removeCategory(category);
	}
	
	touch.touch = true;
	constructVis();
}

function partitionCreateTouchEnd(event){
	var graph = graphCollection.graphs[touch.graphIndex];
	var curX = touch.finalX;
	var curY = touch.finalY;
	
	graph.udPartitions[graph.udPartitions.length-1] = pv.vector(curX,curY);
	touch.graphPanel.render();
	touch.reset();
}

function partitionMoveTouchEnd(event){
	touch.graphPanel.render();
	touch.reset();
}

/*Worksheet Menu*/
var worksheetNew;
var worksheetToEdit;
function positionWorksheetMenu(){
	$('#worksheetMenu').css('position', 'absolute')
										 .css('top', parseInt(window.innerHeight/2 - $('#worksheetMenu').height()/2)+"px")
										 .css('left',parseInt(window.innerWidth/2 - $('#worksheetMenu').width()/2)+"px")
										 .css("z-index",2);
}

$('#worksheetMenu').hide();

function openWorksheetMenu(worksheetTitle){
	var text, title;
	
	if (worksheetTitle == undefined){
		title = "*** Enter Worksheet Title ***";
		text = "*** Enter Worksheet Text ***";
		worksheetNew = true;
		$('#loadFromURL').show();
		$('#deleteWorksheet').hide();
	} else {
		title = worksheetTitle;
		text = graphCollection.worksheets[worksheetTitle].toString();
		worksheetNew = false;
		worksheetToEdit = worksheetTitle;
		$('#loadFromURL').hide();
		$('#deleteWorksheet').show();
	}
	
	$('#worksheetTitle').val(title);
	$('#worksheetText').val(text);
	
	if (worksheetMenuShow){
		$('#worksheetMenu').slideUp();
	} else {
		positionWorksheetMenu();
		hideMenus();
		$('#worksheetMenu').slideDown();
	}
	
	worksheetMenuShow = !worksheetMenuShow;
	
	$('#worksheetText').focus();
	$('#worksheetText').select();
	$('#worksheetMenu').scrollTop(0);
}

$('#worksheetMenuClose').click(function(){
	$('#worksheetMenu').slideUp();
});

$('#loadFromURL').click(function(){
	hideMenus();
	positionWorksheetURLMenu();
	$('#worksheetURLMenu').slideDown();
});

$('#loadFromForm').click(function(){
	var title = $('#worksheetTitle').val();
	var rawText = $('#worksheetText').val();
	var cells = [];
	rawText.split('\n').forEach(function(line){
		lineArray = [];
		line.split('\t').forEach(function(tabChunk){
			commaSep = tabChunk.split(",");
			for (var i=0; i<commaSep.length; i++)
				lineArray.push($.trim(commaSep[i]));
		});
		
		cells.push(lineArray);
	});
	if (validateWorksheetForm(title, cells, $('#worksheetLabelsRequired').is(':checked'))){
		if (worksheetNew)
			addWorksheet(title, cells, $('#worksheetLabelsRequired').is(':checked'));
		else
			updateWorksheet(worksheetToEdit,title,cells, $('#worksheetLabelsRequired').is(':checked'));
		$('#worksheetMenu').slideUp();
	}
});

$('#deleteWorksheet').click(function(){
	if (confirm("Are you sure you want to delete "+worksheetToEdit+"?")) { 
		hideMenus();
		graphCollection.removeWorksheet(worksheetToEdit);
		constructVis();
	}
	
	
});

function validateWorksheetForm(title, cells, labelsRequired){
	//Check for blank or default title
	if (trim(title) == "" || title == "*** Enter Worksheet Title ***"){
		alert("Error: Dataset requires a title.");
		return false;
	}
	
	if (labelsRequired){
		//Check Duplicate Labels
		for (var i=0; i<cells.length; i++){
			for (var j=0; j<cells.length; j++){
				if (cells[i][0] == cells[j][0] && i!=j && cells[i][0] != ""){
					alert("Error: Data contains duplicate labels. Duplicate label is \""+cells[j][0]+"\"");
					return false;
				}
			}
		}
		
		//Check for blank label type
		if(cells[0][0] == ""){
			alert("Error: Label type is blank.");
			return false;
		}
		
		//Check for more than two columns
		if (cells[0].length < 2){
			alert("Error: Data contains less than two columns.  The first column is for labels.");
			return false;
		}
		
		//Check for data without label
		for (var i=0; i<cells.length; i++){
			if (cells[i][0] == "" && cells[i].length > 1){
				alert("Error: Data exists without a label.");
				return false;
			}
		}
	}
	
	//Check Duplicate Dataset Titles
	for (var i=0; i<cells[0].length; i++){
		for (var j=0; j<cells[0].length; j++){
			if (cells[0][i] == cells[0][j] && i!=j){
				alert("Error: Data contains duplicate dataset titles. Duplicate title is \""+cells[0][j]+"\"");
				return false;
			}
		}
	}
	
	//Check Duplicate Worksheet Titles
	for (var key in graphCollection.worksheets){
		if (title == key && key != worksheetToEdit){
			alert("Error: Worksheet title is already used.");
			return false;
		}
	}
	
	//Check Duplicate Dataset Titles outside of new worksheet
	if (worksheetNew){
		for (var i=1; i<cells.length; i++){
			for (var key in graphCollection.data){
				if (cells[0][i] == key){
					alert("Error: a dataset already exists with the title \""+cells[0][i]+"\"");
					return false;
				}
			}
		}
	}
	
	
	
	return true;
}

function addWorksheet(title, cells, labelsRequired){
	var obj = {"title": title};
	var labelType;
	var labelMasterList = [];
	var data = {};
	var edited = {};
	
	//create labelType
	if (labelsRequired) {
		labelType = trim(cells[0][0]);
	} else {
		labelType = "Label"
	}
	
	//create labelMasterList
	if (labelsRequired){
		for (var y=1; y<cells.length; y++){
			if (trim(cells[y][0]) != "")
				labelMasterList.push(trim(cells[y][0]));
		}	
	} else {
		for (var y=1; y<cells.length; y++){
			labelMasterList.push("Default-"+y);
		}	
	}
	
	obj.labelMasterList = labelMasterList;
	obj.labelType = labelType;
	
	//create data and edited hash
	for (var x = (labelsRequired? 1 : 0); x<cells[0].length; x++){
		if (trim(cells[0][x]) != ""){
			data[trim(cells[0][x])] = [];
			edited[trim(cells[0][x])] = true;
			for (var y=1; y<cells.length; y++){
				if ((cells[y][0] != "" || !labelsRequired) && cells[y][x] != ""){
					data[trim(cells[0][x])].push({
						"label":trim(labelMasterList[y-1]),
						"value":parseFloat(cells[y][x])
					});
				}
			}
		}
	}
	obj.data = data;
	obj.edited = edited;
	obj.userDefined = true;
	
	exampleSpreadsheets.push(new Spreadsheet(obj));
	constructVis();
	
};

function updateWorksheet(oldTitle, newTitle, cells, labelsRequired){
	var URL;
	
	for (var key in graphCollection.worksheets){
		if (graphCollection.worksheets[key].title == oldTitle)
			URL = graphCollection.worksheets[key].URL;
	}
	graphCollection.removeWorksheet(oldTitle);
	addWorksheet(newTitle, cells, labelsRequired);
	exampleSpreadsheets[exampleSpreadsheets.length-1].worksheets[0].URL = URL;
	constructVis();
}


/*Worksheet URL Menu*/
function positionWorksheetURLMenu(){
	$('#worksheetURLMenu').css('position', 'absolute')
										 .css('top', parseInt(window.innerHeight/2 - $('#worksheetURLMenu').height()/2)+"px")
										 .css('left',parseInt(window.innerWidth/2 - $('#worksheetURLMenu').width()/2)+"px")
										 .css("z-index",2);
}
$('#worksheetURLMenu').hide();

$('#backToWorksheetMenu').click(function(){
	$('#worksheetURLMenu').slideUp();
	$('#worksheetMenu').slideDown();
});

$('#submitURL').click(function(){
	var key = parseSpreadsheetKeyFromURL($('#worksheetURL').val());
	var exists = false;
	exampleSpreadsheets.forEach(function(s){
		if (s.key == key) exists = true;
	});
	if (!exists) exampleSpreadsheets.push(new Spreadsheet(key));
	else alert("Error: that worksheet has already been loaded.");
	$('#worksheetURLMenu').slideUp();
});



/* Worksheet Description Popup */
function positionWorksheetDescriptionPopup(){
	$('#worksheetDescriptionPopup').css('position', 'absolute')
										 .css('top', parseInt(window.innerHeight/2 - $('#worksheetDescriptionPopup').height()/2)+"px")
										 .css('left',parseInt(window.innerWidth/2 - $('#worksheetDescriptionPopup').width()/2)+"px")
										 .css("z-index",2);
}

$('#worksheetDescriptionPopup').hide();

function showWorksheetDescription(title){
	var worksheet = graphCollection.worksheets[title];
	
	$('#worksheetDescriptionParagraph').html(worksheet.description);
	$('#worksheetDescriptionTitle').html(worksheet.title + "<br>by " + worksheet.labelType);
	positionWorksheetDescriptionPopup();
	$('#worksheetDescriptionPopup').slideToggle();
}


function updateResamplingDisplay(){
	//graphCollection.graphs[0].resampleHistogram = $('#resampleDispType').is(':checked');
	graphCollection.graphs[0].resampleDisplayMode = $('#resampleDisplayMode option:selected').val();
	
	if (graphCollection.graphs[0].resampleDisplayMode == "pgraph")
		$('#resampleLabel').html("Iterations");
	else
		$('#resampleLabel').html("Difference between the Means of Samples from Sample 1 and Sample 2");
	vis.render();
}
