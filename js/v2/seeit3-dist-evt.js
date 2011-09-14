/* Events */	

/* Dynamic Graph Resizing */
$(window).resize(function() {
	if (graphCollection.hasOwnProperty("worksheet")){
		graphCollection.setW(calcGraphWidth());
		graphCollection.setH(graphCollection.calcGraphHeight());
		
		vis.render();
		positionGroupingMenuOverGraph(graphCollection.selectedGraphIndex, graphCollection);
		positionDatasetAddMenu();
		positionDatasetEditMenu();
		positionDisplayMenu();
		positionCreateWorksheetMenu();
		positionClipboardPrompt();
		positionAboutPopup();
		positionWorksheetDescriptionPopup();
		positionDatasetPaste();
	}
});

/* Top Bar Menu Items */
jQuery('#newSpreadsheetURL').keyup(function(event) {
	if (event.keyCode == '13') {
		var key = parseSpreadsheetKeyFromURL($(this).val());
		$(this).val('');
		exampleSpreadsheets.push(new Spreadsheet(key));
	}
});

jQuery('#editInGoogleDocs').click(function(event) {
	var URL = jQuery('#workSheetSelector').val();
	var matches = /feeds\/cells\/([A-Z|a-z|0-9|_|-]+)/.exec(URL);
	window.open('https://spreadsheets.google.com/ccc?key=' + matches[1]);
	event.preventDefault();
});

jQuery('#workSheetSelector').change(function(event) {
	if (jQuery('#workSheetSelector').val() == "New"){
		hideMenus();
		$('#worksheetCreate').slideDown();
	} else {
		graphCollection = new GraphCollection();
		lastSelectedWorksheet = jQuery('#workSheetSelector').val();
		constructVis();
	}
});

$('#refreshWorksheet').click(function(event){
	getWorksheet().fetchWorksheetData();
	if ($('#fitScaleToData').is(':checked')){
		jQuery('#fitScaleToData').attr('checked', false);
	}
});

$('#about').click(function(){
	$('#aboutPopup').slideToggle();
});

$('#aboutPopup').hide();

function positionAboutPopup(){
	$('#aboutPopup').css('position', 'absolute')
										 .css('top', parseInt(window.innerHeight/2 - $('#aboutPopup').height()/2)+"px")
										 .css('left',parseInt(window.innerWidth/2 - $('#aboutPopup').width()/2)+"px");
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
		
		if (selGraph.customScale)
			graph.setXScale(selGraph.scaleMin, selGraph.scaleMax);
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

$('#displayOptions').change(function(){
	vis.render();
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
		case "sideCat":
			sideCatTouchStart(event);
			break;
		case "graphCat":
			graphCatTouchStart(event);
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
	return;
}

function sideCatTouchStart(event){
	var curX = event.targetTouches[0].pageX -
							$('span').offset().left -
							graphCollection.padLeft + 14;
							
	var curY = event.targetTouches[0].pageY - 
							$('span').offset().top - 
							graphCollection.padTop;
	touch.draggedObj.left(curX);
	touch.draggedObj.top(curY);
	touch.draggedObj.visible(true);
	touch.draggedObj.render();
}

function graphCatTouchStart(event){
	var curX = event.targetTouches[0].pageX -
							$('span').offset().left -
							graphCollection.padLeft + 14;
							
	var curY = event.targetTouches[0].pageY - 
							$('span').offset().top - 
							graphCollection.padTop;
	touch.draggedObj.left(curX);
	touch.draggedObj.top(curY);
	touch.draggedObj.visible(true);
	touch.draggedObj.render();
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
		case "sideCat":
			sideCatTouchMove(event);
			break;
		case "graphCat":
			graphCatTouchMove(event);
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
							graphCollection.padLeft + 14;
							
	var curY = event.targetTouches[0].pageY - 
							$('span').offset().top - 
							graphCollection.padTop;
	touch.finalX = curX;
	touch.finalY = curY;
	var d = touch.dataObj;
	var graph = graphCollection.graphs[touch.graphIndex];
	
	if (graphCollection.editModeEnabled &&
			curX >= 0 &&
			curY <= graph.w - 5){
		
		graphCollection.editSinglePoint(d.set,d.label,graph.x.invert(curX));
		graph.selectedCategory = d.set;
		
		touch.dragLabel.text(graph.x.invert(curX).toFixed(1));
		touch.dragLabel.left(curX)
		touch.dragLabel.top(curY - 10)
		touch.dragLabel.visible(true)
		
		vis.render();
	} else {
		touch.dragLabel.text("Delete");
		vis.render();
	}
}

function sideCatTouchMove(event){
	var curX = event.targetTouches[0].pageX -
							$('span').offset().left -
							graphCollection.padLeft + 14;
							
	var curY = event.targetTouches[0].pageY - 
							$('span').offset().top - 
							graphCollection.padTop;
	touch.draggedObj.left(curX);
	touch.draggedObj.top(curY);
	touch.finalX = curX;
	touch.finalY = curY;
	touch.draggedObj.render();
}

function graphCatTouchMove(event){
	var curX = event.targetTouches[0].pageX -
							$('span').offset().left -
							graphCollection.padLeft + 14;
							
	var curY = event.targetTouches[0].pageY - 
							$('span').offset().top - 
							graphCollection.padTop;
	touch.draggedObj.left(curX);
	touch.draggedObj.top(curY);
	touch.finalX = curX;
	touch.finalY = curY;
	touch.draggedObj.render();
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
		case "sideCat":
			sideCatTouchEnd(event);
			break;
		case "graphCat":
			graphCatTouchEnd(event);
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
		
		var newData = graphCollection.worksheet.data[d.set];
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
		graphCollection.editData(d.set,d.set,newData);
		
	
		if (Math.abs(curX - d.x) <= graphCollection.bucketDotSize &&
				Math.abs((graph.h - curY) - (d.y + graph.baseLine)) <= graphCollection.bucketDotSize+1)
		{
			dragging = true;
		}
		
		touch.dragLabel.visible(false);
		touch.reset();
		vis.render();
	}
}

function sideCatTouchEnd(event){
	var curX = touch.finalX;
	var curY = touch.finalY;
	
	touch.draggedObj.visible(false);
	if(curX > 0 && curX < graphCollection.w && curY > 0 && curY < graphCollection.h){
		if (graphCollection.graphs.length > 4){
			var which = parseInt(curY/graphCollection.defaultGraphHeight);
			graphCollection.graphs[which].addCategory(touch.dragCat);
			graphCollection.updateMenuOptions();
		} else {
			var which = parseInt(curY/(graphCollection.h/graphCollection.graphs.length));
			graphCollection.graphs[which].addCategory(touch.dragCat);
			graphCollection.updateMenuOptions();
		}
	}
	touch.reset();
	constructVis();
}

function graphCatTouchEnd(event){
	var curX = touch.finalX;
	var curY = touch.finalY;
	
	touch.draggedObj.visible(false);
	if(curX > 0 && curX < graphCollection.w && curY > 0 && curY < graphCollection.h){
		if (graphCollection.graphs.length > 4){
			var which = parseInt(curY/graphCollection.defaultGraphHeight);
			
			if (graphCollection.graphs[which].addCategory(touch.dragCat))
				graphCollection.graphs[touch.dragGraphIndex].removeCategory(touch.dragCat);
			
			graphCollection.updateMenuOptions();
		} else {
			var which = parseInt(curY/(graphCollection.h/graphCollection.graphs.length));
			
			if (graphCollection.graphs[which].addCategory(touch.dragCat))
				graphCollection.graphs[touch.dragGraphIndex].removeCategory(touch.dragCat);
			
			graphCollection.updateMenuOptions();
		}
	} else {
		graphCollection.graphs[touch.dragGraphIndex].removeCategory(touch.dragCat);
	}
	
	touch.reset();
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

/* Add Data Set Menu */
function positionDatasetAddMenu(){
	$('#dataSetAdd').css('position', 'absolute')
										 .css('top', parseInt(window.innerHeight/2 - $('#dataSetAdd').height()/2)+"px")
										 .css('left',parseInt(window.innerWidth/2 - $('#dataSetAdd').width()/2)+"px");
}
positionDatasetAddMenu();

$('#dataSetAdd').hide();

$('#addNonNumWarning').hide();
$('#addNoTitleWarning').hide();
$('#addNoLabelWarning').hide();
$('#addNoValueWarning').hide();
$('#addNoDataWarning').hide();
$('#addDupTitleWarning').hide();
$('#addPasteFormatWarning').hide();


var addNextRow = 1;

$('#addLabLast').change(function(){
	$('#addValLast').focus();
});

var firstKey = true;
$('#addValLast').keyup(function(evt){
	if (isNaN(parseFloat($('#addValLast').val()))){
		if ($('#addValLast').val() != "-" && $('#addValLast').val() != ".")
			$('#addValLast').val("");
		if (event.keyCode != '9'){
			$('#addNonNumWarning').show();
			$('#dataSetAdd').scrollTop(0);
		}
	} else {
		$('#addNonNumWarning').hide();
		
		$('#addDatasetEntry tr:last').before(
			"<tr id='addRow" +
			addNextRow +
			"'><td><input type='text' id='addLab" +
			addNextRow +
			"'></td><td><input type='text' onChange ='addEntryValidate(this)' id='addVal" +
			addNextRow +
			"'></td>"+
			"<td><input type='image' src='img/garbage.png' id='addGarbage"+
			addNextRow +
			"' onclick='delAddField()' width='20' height='20'></td></tr>");
			
		$('#addLab'+addNextRow).val($('#addLabLast').val());
		$('#addVal'+addNextRow).val(parseFloat($('#addValLast').val()));
		$('#addValLast').val("");
		$('#addLabLast').val("");
		$('#addVal'+addNextRow).focus();
		addNextRow++;
	}
});


$("#addFormAdd").click(function(){
	var labelError = false;
	var titleError = false;
	var valueError = false;
	var noDataError = false;
	var addConfirm = false;
	var dupTitle = false;
	
	$('#addNoTitleWarning').hide();
	$('#addNoLabelWarning').hide();
	$('#addNoValueWarning').hide();
	$('#addNoDataWarning').hide();
	$('#addDupTitleWarning').hide();
	$('#addPasteFormatWarning').hide();
	
	var datasetTitle;
	var data = [];
	if ($('#addDataSetTitle').val() == ""){
		titleError = true;
		$('#addNoTitleWarning').show();
		$('#addDataSetTitle').focus();
	} else {
		$('#addNoTitleWarning').hide();
		datasetTitle = $('#addDataSetTitle').val()
	}
	
	for (var key in graphCollection.worksheet.data){
		if (datasetTitle == key){
			dupTitle = true;
			$('#addDupTitleWarning').show();
			$('#addDataSetTitle').focus();
		}
	}
	
	for (var i=1; i<addNextRow; i++){
		var label = $('#addLab'+i).val();
		var value = $('#addVal'+i).val();
		if (label == "" && value != ""){
			labelError = true;
			$('#addNoLabelWarning').show();
			$('#addLab'+i).focus();
		}
		if (value == "" && label != ""){
			valueError = true;
		}
		if (!isNaN(parseFloat(value)) && label != "")
			data.push({"label":label, "value":parseFloat(value)})
	}
	
	var label = $('#addLabLast').val();
	var value = $('#addValLast').val();
	
	if (label == "" && value != ""){
		labelError = true;
		$('#addNoLabelWarning').show();
		$('#addLabLast').focus();
	}
	if (value == "" && label != ""){
		valueError = true;
		$('#addNoValueWarning').show();
		$('#addValLast').focus();
	}
	
	if (!isNaN(parseFloat(value)) && label != "")
		data.push({"label":label, "value":parseFloat(value)})

	if (data.length == 0){
		$('#addNoDataWarning').show();
		noDataError = true;
	}
	
	if (!labelError && !titleError && !noDataError && !dupTitle){
		if (valueError) addConfirm = confirm("Entries with a label and no value will not be included in the dataset.  Are you sure you wish to add this dataset?");
		else addConfirm = confirm("Are you sure you wish to add this dataset?");
	}
		
	if(!labelError && !titleError && addConfirm && !noDataError && !dupTitle){
		$('#addNoTitleWarning').hide();
		$('#addNoLabelWarning').hide();
		$('#addNoValueWarning').hide();
		graphCollection.addData(datasetTitle, data);
		vis.render();
		$('#dataSetAdd').slideUp();
		resetAddDataSetMenu();
	}
	
	constructVis();
});

$('#addFormClose').click(function(){
	resetAddDataSetMenu();
	$('#dataSetAdd').slideUp();
});

$('#addFormReset').click(function(){
	resetAddDataSetMenu();
	populateAddMenuLabelsFromExisting();
});

function resetAddDataSetMenu(){
	$('#addNonNumWarning').hide();
	$('#addNoTitleWarning').hide();
	$('#addNoLabelWarning').hide();
	$('#addNoValueWarning').hide();
	$('#addNoDataWarning').hide();
	$('#addDupTitleWarning').hide();
	$('#addPasteFormatWarning').hide();
	
	$('#addDataSetTitle').val("");
	$('#addValLast').val("");
	$('#addLabLast').val("");
	$('#addPaste').val("");
	$('#addLabLast').focus();
	for (var i=0; i<addNextRow; i++)
		$('#addRow'+i).remove();
	addNextRow = 1;
}

function addEntryValidate(elem){
	if (isNaN(parseFloat(elem.value))){
		$('#addNonNumWarning').show();
		$('#dataSetAdd').scrollTop(0);
		elem.value = "";
	} else {
		$('#addNonNumWarning').hide();
	}
}

function populateAddMenuLabelsFromExisting(){
	graphCollection.worksheet.labelMasterList.forEach(function(label){
		$('#addDatasetEntry tr:last').before(
			"<tr id='addRow" +addNextRow +
			"'><td><input type='text' id='addLab"+addNextRow +
			"' value='"+label +
			"'></td><td><input type='text' onChange ='addEntryValidate(this)' id='addVal"+addNextRow +
			"'></td>"+
			"<td><input type='image' src='img/garbage.png' id='addGarbage"+
			addNextRow +
			"' onclick='delAddField()' width='20' height='20'></td></tr>");
			
			addNextRow++;
	});
}

function delAddField(){
	var which = parseInt((event.target.id).slice(10))
	$('#addRow'+which).remove();
	for (var i = which+1; i < addNextRow; i++){
		$('#addRow'+i).attr("id","addRow"+(i-1));
		$('#addLab'+i).attr("id","addLab"+(i-1));
		$('#addVal'+i).attr("id","addVal"+(i-1));
		$('#addGarbage'+i).attr("id","addGarbage"+(i-1));
	}
	addNextRow--;
	if (addNextRow < 1)
		addNextRow = 1;
	
}

$('#addFormPaste').click(function(e){
	$('#dataSetAdd').slideUp();
	$('#dataSetPaste').slideDown();
})


/* Paste Data Set Menu */
$('#dataSetPaste').hide();
function positionDatasetPaste(){
	$('#dataSetPaste').css('position', 'absolute')
										 .css('top', parseInt(window.innerHeight/2 - $('#dataSetPaste').height()/2)+"px")
										 .css('left',parseInt(window.innerWidth/2 - $('#dataSetPaste').width()/2)+"px");
}
positionDatasetPaste();

$('#pasteClose').click(function(){
	$('#addPasteText').val("");
	$('#dataSetPaste').slideUp();
	$('#dataSetAdd').slideDown();
});

$('#pasteImport').click(function(){
	var rawText = $('#addPasteText').val();
	var cells = [];
	rawText.split('\n').forEach(function(line){
		cells.push(line.split('\t'));
	});
	
	resetAddDataSetMenu();
	if (!populateAddMenuFromPaste(cells))
		$('#addPasteFormatWarning').show();
	$('#addPasteText').val("");
	$('#dataSetPaste').slideUp();
	$('#dataSetAdd').slideDown();
	
});

function populateAddMenuFromPaste(cells){
	var noFormatError = true;
	if ($('#pasteHeading').is(':checked')){
		if (cells[0].length == 1)
			$('#addDataSetTitle').val(cells[0][0]);
		else if (cells[0].length >= 2)
			$('#addDataSetTitle').val(cells[0][1]);
		else{
			noFormatError = false;
		}
			
		cells.slice(1).forEach(function(line){
			if (line.length >= 2){
				if (line.length > 2) noFormatError = false;
				
				$('#addDatasetEntry tr:last').before(
					"<tr id='addRow" +addNextRow +
					"'><td><input type='text' id='addLab"+addNextRow +
					"' value='"+line[0] +
					"'></td><td><input type='text' onChange ='addEntryValidate(this)' id='addVal"+addNextRow +
					"' value='"+line[1] +
					"'></td>"+
					"<td><input type='image' src='img/garbage.png' id='addGarbage"+
					addNextRow +
					"' onclick='delAddField()' width='20' height='20'></td></tr>");
					
				addNextRow++;
			} else if(line.length != 1 || line[0] != ""){
				noFormatError = false;
			}
		});
	} else {
		cells.forEach(function(line){
			if (line.length >= 2){
				if (line.length > 2) noFormatError = false;
				
				$('#addDatasetEntry tr:last').before(
					"<tr id='addRow" +addNextRow +
					"'><td><input type='text' id='addLab"+addNextRow +
					"' value='"+line[0] +
					"'></td><td><input type='text' onChange ='addEntryValidate(this)' id='addVal"+addNextRow +
					"' value='"+line[1] +
					"'></td>"+
					"<td><input type='image' src='img/garbage.png' id='addGarbage"+
					addNextRow +
					"' onclick='delAddField()' width='20' height='20'></td></tr>");
					
				addNextRow++;
			} else if(line.length != 1 || line[0] != ""){
				noFormatError = false;
			}
		});
	}
	return noFormatError;
}


/* Edit Data Set Menu */
function positionDatasetEditMenu(){
	$('#dataSetEdit').css('position', 'absolute')
										 .css('top', parseInt(window.innerHeight/2 - $('#dataSetEdit').height()/2)+"px")
										 .css('left',parseInt(window.innerWidth/2 - $('#dataSetEdit').width()/2)+"px");
}
positionDatasetEditMenu();

$('#dataSetEdit').hide();

$('#editNonNumWarning').hide();
$('#editNoTitleWarning').hide();
$('#editNoLabelWarning').hide();
$('#editNoValueWarning').hide();
$('#editNoDataWarning').hide();
$('#editDupTitleWarning').hide();


var editNextRow = 1;

$('#editLabLast').change(function(){
	$('#editValLast').focus();
});

var firstKey = true;
$('#editValLast').keyup(function(evt){
	if (isNaN(parseFloat($('#editValLast').val()))){
		if ($('#editValLast').val() != "-" && $('#editValLast').val() != ".")
			$('#editValLast').val("");
		if (event.keyCode != '9'){
			$('#editNonNumWarning').show();
			$('#dataSetEdit').scrollTop(0);
		}
	} else {
		$('#editNonNumWarning').hide();
		
		$('#editDatasetEntry tr:last').before(
			"<tr id='editRow" +
			editNextRow +
			"'><td><input type='text' id='editLab" +
			editNextRow +
			"'></td><td><input type='text' onChange ='editEntryValidate(this)' id='editVal" +
			editNextRow +
			"'></td>"+
			"<td><input type='image' src='img/garbage.png' id='editGarbage"+
			editNextRow +
			"' onclick='delEditField()' width='20' height='20'></td></tr>");
			
		$('#editLab'+editNextRow).val($('#editLabLast').val());
		$('#editVal'+editNextRow).val(parseFloat($('#editValLast').val()));
		$('#editValLast').val("");
		$('#editLabLast').val("");
		$('#editVal'+editNextRow).focus();
		editNextRow++;
	}
});

$("#editFormApply").click(function(){
	var labelError = false;
	var titleError = false;
	var valueError = false;
	var noDataError = false;
	var applyConfirm = false;
	
	$('#editNoTitleWarning').hide();
	$('#editNoLabelWarning').hide();
	$('#editNoValueWarning').hide();
	$('#editNoDataWarning').hide();
	
	var oldDatasetTitle = $('#datasetTitle').html();
	var datasetTitle;
	var data = [];
	if ($('#editDataSetTitle').val() == ""){
		titleError = true;
		$('#editNoTitleWarning').show();
		$('#editDataSetTitle').focus();
	} else {
		$('#editNoTitleWarning').hide();
		datasetTitle = $('#editDataSetTitle').val()
	}
	
	for (var i=1; i<editNextRow; i++){
		var label = $('#editLab'+i).val();
		var value = $('#editVal'+i).val();
		
		if (label == "" && value != ""){
			labelError = true;
			$('#editNoLabelWarning').show();
			$('#editLab'+i).focus();
		}
		if (value == "" && label != ""){
			valueError = true;
		}
		if (!isNaN(parseFloat(value)) && label != "")
			data.push({"label":label, "value":parseFloat(value)})
	}
	
	var label = $('#editLabLast').val();
	var value = $('#editValLast').val();
	
	if (label == "" && value != ""){
		labelError = true;
		$('#editNoLabelWarning').show();
		$('#editLabLast').focus();
	}
	if (value == "" && label != ""){
		valueError = true;
		$('#editNoValueWarning').show();
		$('#editValLast').focus();
	}
	
	if (!isNaN(parseFloat(value)) && label != "")
		data.push({"label":label, "value":parseFloat(value)})

	if (data.length == 0){
		$('#editNoDataWarning').show();
		noDataError = true;
	}
	
	if (!labelError && !titleError && !noDataError){
		if (valueError) applyConfirm = confirm("Entries with a label and no value will not be included in the dataset.  Are you sure you wish to apply these changes?");
		else applyConfirm = confirm("Are you sure you wish to apply these changes?");
	}
		
	if(!labelError && !titleError && applyConfirm && !noDataError){
		$('#editNoTitleWarning').hide();
		$('#editNoLabelWarning').hide();
		$('#editNoValueWarning').hide();
		graphCollection.editData(oldDatasetTitle, datasetTitle, data);
		
		var red = parseInt(document.getElementById('editDataSetColor').color.rgb[0]*255);
		var green = parseInt(document.getElementById('editDataSetColor').color.rgb[1]*255);
		var blue = parseInt(document.getElementById('editDataSetColor').color.rgb[2]*255);
		
		graphCollection.categoryColors[datasetTitle] = pv.rgb(red,green,blue,1);
		vis.render();
		$('#dataSetEdit').slideUp();
		resetEditDataSetMenu();
	}
});

$('#editFormClose').click(function(){
	resetEditDataSetMenu();
	$('#dataSetEdit').slideUp();
});

$('#editFormReset').click(function(){
	resetEditDataSetMenu();
	populateEditMenuFromExisting($('#datasetTitle').html());
});

$('#editFormDelete').click(function(){
	var datasetTitle = $('#datasetTitle').html();
	if (confirm("Are you sure you want to delete this dataset?")){
		graphCollection.deleteData(datasetTitle);
		$('#dataSetEdit').slideUp();
		constructVis();
	}
	
});

function resetEditDataSetMenu(){
	$('#editDataSetTitle').val("");
	$('#editValLast').val("");
	$('#editLabLast').val("");
	$('#editLabLast').focus();
	for (var i=1; i<editNextRow; i++)
		$('#editRow'+i).remove();
	editNextRow = 1;
}

function editEntryValidate(elem){
	if (isNaN(parseFloat(elem.value))){
		$('#editNonNumWarning').show();
		$('#dataSetEdit').scrollTop(0);
		elem.value = "";
	} else {
		$('#editNonNumWarning').hide();
	}
}

function populateEditMenuFromExisting(dataset){
	$('#datasetTitle').html(dataset);
	
	$('#editDataSetTitle').val(dataset);
	
	var color = graphCollection.categoryColors[dataset];
	document.getElementById('editDataSetColor').color.fromRGB(color.r/255, color.g/255, color.b/255);
	
	graphCollection.worksheet.data[dataset].forEach(function(data){
		$('#editDatasetEntry tr:last').before(
			"<tr id='editRow" +editNextRow +
			"'><td><input type='text' id='editLab"+editNextRow +
			"' value='"+data.label +
			"'></td><td><input type='text' onChange ='editEntryValidate(this)' id='editVal"+editNextRow +
			"' value='"+data.value.toFixed(2) + 
			"'></td>"+
			"<td><input type='image' src='img/garbage.png' id='editGarbage"+
			editNextRow +
			"' onclick='delEditField()' width='20' height='20'></td></tr>");
			
			editNextRow++;
		
	});
}

function delEditField(){
	var which = parseInt((event.target.id).slice(11))
	$('#editRow'+which).remove();
	for (var i = which+1; i < editNextRow; i++){
		$('#editRow'+i).attr("id","editRow"+(i-1));
		$('#editLab'+i).attr("id","editLab"+(i-1));
		$('#editVal'+i).attr("id","editVal"+(i-1));
		$('#editGarbage'+i).attr("id","editGarbage"+(i-1));
	}
	editNextRow--;
	if (editNextRow < 1)
		editNextRow = 1;
	
}

/* Create Worksheet Menu */
function positionCreateWorksheetMenu(){
	$('#worksheetCreate').css('position', 'absolute')
										 .css('top', parseInt(window.innerHeight/2 - $('#worksheetCreate').height()/2)+"px")
										 .css('left',parseInt(window.innerWidth/2 - $('#worksheetCreate').width()/2)+"px");
}
positionCreateWorksheetMenu();

$('#worksheetCreate').hide();

$('#wcNoTitleWarning').hide();
$('#wcNoLabelTypeWarning').hide();
$('#wcDupTitleWarning').hide();
$('#wcDupLabelWarning').hide();
	

var wcNextRow = 1;
$('#wcLabLast').keydown(function(evt){
	$('#wcLabelEntry tr:last').before(
		"<tr id='wcRow" +
		wcNextRow +
		"'><td><input type='text' id='wcLab" +
		wcNextRow +
		"'></td><td><input type='image' src='img/garbage.png' id='wcGarbage"+
		wcNextRow +
		"' onclick='delWCField()' width='20' height='20'></td></tr>");
			
		$('#wcLab'+wcNextRow).val($('#wcLabLast').val());
		$('#wcLabLast').val("");
		$('#wcLab'+wcNextRow).focus();
		wcNextRow++;
});

$("#wcAdd").click(function(){
	var dupLabelError = false;
	var dupTitleError = false;
	var noTitleError = false;
	var noLabelTypeError = false;
	
	
	var wcLabelMasterlist = [];
	var wcTitle = $('#wcTitle').val();
	var wcLabelType = $('#wcLabelType').val();
	
	if (wcTitle == ""){
		noTitleError = true;
		$('#wcNoTitleWarning').show();
		$('#wcTitle').focus();
	}
	
	if (wcLabelType == ""){
		noLabelTypeError = true;
		$('#wcNoLabelTypeWarning').show();
		$('#wcLabelType').focus();
	}
	
	$("#workSheetSelector option").each(function(){
		if (wcTitle == $(this).html()){
			dupTitleError = true;
			$('#wcDupTitleWarning').show();
			$('#wcTitle').focus();
		}
	});
	
	for (var i=1; i<wcNextRow; i++){
		var label = $('#wcLab'+i).val();
		
		if(wcLabelMasterlist.indexOf(label) != -1){
			dupLabelError = true;
			$('#wcDupLabelWarning').show();
			$('#wcLab'+i).focus();
		}
		
		if (label != "")
			wcLabelMasterlist.push(label);
	}
	
	if (!dupLabelError && !dupTitleError && !noTitleError && !noLabelTypeError){
		if (confirm("Are you sure you wish to add this worksheet?")){
			var attr = {"title": wcTitle,
									"labelType": wcLabelType,
									"labelMasterlist": wcLabelMasterlist};
			exampleSpreadsheets.push(new Spreadsheet(attr));
			resetWCMenu();
			$('#worksheetCreate').slideUp();
			
			jQuery('body').trigger({ type:'WorksheetLoaded', worksheet:userCreatedWorksheet});
		}
	}
});

$('#wcClose').click(function(){
	resetWCMenu();
	$('#worksheetCreate').slideUp();
	$('#workSheetSelector').val(lastSelectedWorksheet);
});

$('#wcReset').click(function(){
	resetWCMenu();
});

function resetWCMenu(){
	$('#wcTitle').val("");
	$('#wcLabelType').val("");
	$('#wcLabLast').val("");
	$('#wcLabLast').focus();
	for (var i=0; i<wcNextRow; i++)
		$('#wcRow'+i).remove();
	wcNextRow = 1;
}

function delWCField(){
	var which = parseInt((event.target.id).slice(9))
	$('#wcRow'+which).remove();
	for (var i = which+1; i < wcNextRow; i++){
		$('#wcRow'+i).attr("id","wcRow"+(i-1));
		$('#wcLab'+i).attr("id","wcLab"+(i-1));
		$('#wcGarbage'+i).attr("id","wcGarbage"+(i-1));
	}
	wcNextRow--;
	if (wcNextRow < 1)
		wcNextRow = 1;
	
}



/* Clipboard Prompt */
function positionClipboardPrompt(){
	$('#clipboardPrompt').css('position', 'absolute')
										 .css('top', parseInt(window.innerHeight/2 - $('#clipboardPrompt').height()/2)+"px")
										 .css('left',parseInt(window.innerWidth/2 - $('#clipboardPrompt').width()/2)+"px");
}
positionClipboardPrompt();

$('#clipboardPrompt').hide();

$('#cbText').keydown(function(event){
	if (event.keyCode == '13')
		$('#clipboardPrompt').slideUp();
});

$('#cbClose').click(function(){
	$('#clipboardPrompt').slideUp();
});


/* Worksheet Description Popup */
function positionWorksheetDescriptionPopup(){
	$('#worksheetDescriptionPopup').css('position', 'absolute')
										 .css('top', parseInt(window.innerHeight/2 - $('#worksheetDescriptionPopup').height()/2)+"px")
										 .css('left',parseInt(window.innerWidth/2 - $('#worksheetDescriptionPopup').width()/2)+"px");
}
positionWorksheetDescriptionPopup();


$('#worksheetDescriptionPopup').hide();

$('#worksheetDescriptionButton').click(function(){
	$('#worksheetDescriptionParagraph').html(graphCollection.worksheet.description);
	$('#worksheetDescriptionTitle').html(graphCollection.worksheet.title + "<br>by " + graphCollection.worksheet.labelType);
	positionWorksheetDescriptionPopup();
	$('#worksheetDescriptionPopup').slideToggle();
});

