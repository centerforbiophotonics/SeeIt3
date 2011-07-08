/* Events */	

/* Dynamic Graph Resizing */
$(window).resize(function() {
	graphCollection.setW(calcGraphWidth());
	if (graphCollection.graphs.length <= 4)
		graphCollection.setH(calcGraphHeight());
	constructVis();
	positionGroupingMenuOverGraph(graphCollection.selectedGraphIndex, graphCollection);
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
  graphCollection = new GraphCollection();
  graph.setXScale();
  updateScaleTextBoxes(graph);
  toggleNetworkOptions(graph);
  constructVis();
});

$('#refreshWorksheet').click(function(event){
	getWorksheet().fetchWorksheetData();
	if ($('#fitScaleToData').is(':checked')){
		jQuery('#fitScaleToData').attr('checked', false);
	}
});



/* Grouping Menu */
$('#groupingOptions').hide();

jQuery('#groupingOptions').change(function(event) {
	graphCollection.graphs[graphCollection.selectedGraphIndex].groupingMode = $('input:radio[name=mode]:checked').attr('id').slice(5);
	graphCollection.graphs[graphCollection.selectedGraphIndex].histogram = $('#checkboxHistogram').is(':checked');
	graphCollection.graphs[graphCollection.selectedGraphIndex].boxPlot = $('#checkboxBoxPlot').is(':checked');
  constructVis();
  event.stopPropagation();
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

$('#fitScaleToData').change(function() {
	graphCollection.graphs[graphCollection.selectedGraphIndex].fitScaleToData = jQuery('#fitScaleToData').is(':checked');
	graphCollection.graphs[graphCollection.selectedGraphIndex].setXScale();
	graphCollection.updateMenuOptions();
	constructVis();
});

$('#applyOptionsToAll').click(function(event){
	var selGraph = graphCollection.graphs[graphCollection.selectedGraphIndex];
	
	graphCollection.graphs.forEach(function(graph, index){
		graph.histogram = selGraph.histogram;
		graph.boxPlot = selGraph.boxPlot;
		graph.fitScaleToData = selGraph.fitScaleToData;
		graph.groupingMode = selGraph.groupingMode;
		graph.partitionGroupSize = selGraph.partitionGroupSize;
		graph.partitionIntervalWidth = selGraph.partitionIntervalWidth;
		
		//Old way which caused udpartitions to share a reference.  Make this an option?
		//graph.udPartitions = selGraph.udPartitions;
		
		//clone udPartitions
		if (index != graphCollection.selectedGraphIndex){
			graph.udPartitions = [];
			for (var i = 0; i < selGraph.udPartitions.length; i++){
				graph.udPartitions.push(pv.vector(selGraph.udPartitions[i].x, selGraph.udPartitions[i].y))
			}
		}

		graph.setXScale();
	});
	//vis.render();
	constructVis();
});

$('#closeGroupingMenu').click(function(){
	$('#groupingOptions').slideUp();
});



/* Visualization Options */
$('#displayOptions').hide();

$('#checkboxBWView').change(function() { return constructVis(); });

jQuery('#sliderTextSize').slider({ 
	orientation:'vertical', min:12, max:20, value:12, step:1,
	slide:function(event, ui) { 
		graphCollection.labelTextSize = (ui.value + 4).toString();
		graphCollection.tickTextSize = ui.value.toString();
		vis.render(); 
	}
});
	
jQuery('#sliderDotSize').slider({ 
	orientation:'vertical', min:1, max:20, value:5, step:1,
	slide:function(event, ui) {
		graphCollection.bucketDotSize = ui.value; 
		//vis.render();
		constructVis(); 
	}
});

jQuery('#sliderDivisions').slider({ 
	orientation:'vertical', min:2, max:40, value:30, step:1,
	slide:function(event, ui) { 
		graphCollection.buckets = ui.value;
		constructVis();
	}
});

$('#checkboxHideData').change(function() { constructVis();});

//$('#addGraph').click(function(event){
//	graphCollection.addGraph();
//	constructVis();
//});

$('#displayOptions').change(function(){
	vis.render();
})

$('#displayMenuClose').click(function(){
	$('#displayOptions').slideUp();
});


/* Touch Events */
document.addEventListener("touchstart", touchStart, false);

function touchStart(event){
	//event.preventDefault(); 
  if (!touch.dragging) return;
   
	var targetTouches = event.targetTouches;  
	var curX = event.targetTouches[0].pageX -
							$('span').offset().left -
							graphCollection.padLeft + 14;
							
	var curY = event.targetTouches[0].pageY - 
							$('span').offset().top - 
							graphCollection.padTop;
	touch.draggedObj.left(curX);
	touch.draggedObj.top(curY);
	touch.draggedObj.visible(true);
	//vis.render();
	touch.draggedObj.render();
}

document.addEventListener("touchmove", touchMove, false);

function touchMove(event){
	//event.preventDefault(); 
  if (!touch.dragging) return;
  
	var targetTouches = event.targetTouches;  
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
	//vis.render();
	touch.draggedObj.render();
}

document.addEventListener("touchend", touchEnd, false);

function touchEnd(event){
	//event.preventDefault(); 
  if (!touch.dragging) return;

  var curX = touch.finalX;
	var curY = touch.finalY;
	
	touch.draggedObj.visible(false);
	if(curX > 0 && curX < graphCollection.w && curY > 0 && curY < graphCollection.h){
		if (graphCollection.graphs.length > 4){
			var which = parseInt(curY/graphCollection.defaultGraphHeight);
			if (touch.dragGraphIndex == -1)
				graphCollection.graphs[which].addCategory(touch.dragCat);
			else {
				if (graphCollection.graphs[which].addCategory(touch.dragCat))
					graphCollection.graphs[touch.dragGraphIndex].removeCategory(touch.dragCat);
			}
			graphCollection.updateMenuOptions();
		} else {
			var which = parseInt(curY/(graphCollection.h/graphCollection.graphs.length));
			if (touch.dragGraphIndex == -1)
				graphCollection.graphs[which].addCategory(touch.dragCat);
			else {
				if (graphCollection.graphs[which].addCategory(touch.dragCat))
					graphCollection.graphs[touch.dragGraphIndex].removeCategory(touch.dragCat);
			}
			graphCollection.updateMenuOptions();
		}
	} else if (touch.dragGraphIndex != -1) {
		graphCollection.graphs[touch.dragGraphIndex].removeCategory(touch.dragCat);
	}
	
	//draggedObj = undefined;
	//dragging = false;
	//dragCat = undefined;
	//dragGraphIndex = undefined;
	//finalX = undefined;
	//finalY = undefined; 
	touch.reset();
	constructVis();
}


/* Add Data Set Menu */
$('#dataSetAdd').css('position', 'absolute')
										 .css('top', parseInt(window.innerHeight/2 - $('#dataSetAdd').height()/2)+"px")
										 .css('left',parseInt(window.innerWidth/2 - $('#dataSetAdd').width()/2)+"px");

$('#dataSetAdd').hide();

$('#nonNumWarning').hide();
$('#noTitleWarning').hide();
$('#noLabelWarning').hide();
$('#noValueWarning').hide();
$('#noDataWarning').hide();

var nextRow = 1;

$('#labLast').change(function(){
	$('#valLast').focus();
});

var firstKey = true;
$('#valLast').keyup(function(evt){
	if (isNaN(parseFloat($('#valLast').val()))){
		if ($('#valLast').val() != "-" && $('#valLast').val() != ".")
			$('#valLast').val("");
		$('#valLast').focus();
		if (event.keyCode != '9')
			$('#noNnumWarning').show();
	} else {
		$('#nonNumWarning').hide();
		
		$('#dataSetEntry tr:last').before(
			"<tr id='row" +
			nextRow +
			"'><td><input type='text' id='lab" +
			nextRow +
			"'></td><td><input type='text' onChange ='entryValidate(this)' id='val" +
			nextRow +
			"'></td></tr>");
			
		$('#lab'+nextRow).val($('#labLast').val());
		$('#val'+nextRow).val(parseFloat($('#valLast').val()));
		$('#valLast').val("");
		$('#labLast').val("");
		$('#val'+nextRow).focus();
		nextRow++;
	}
});

//$('#valLast').change(function(){
//	if (isNaN(parseFloat($('#valLast').val()))){
//		$('#valLast').val("");
//		$('#valLast').focus();
//		$('#nonnumWarning').show();
//	} else {
//		$('#nonnumWarning').hide();
//		//$('#otherEntryRows').prepend("<tr><td><input type='text' id='lab"+nextRow+"'></td><td><input type='text' onChange ='entryValidate(this)' id='val"+nextRow+"'></td></tr>");
//		$('#dataSetEntry tr:last').before("<tr id='row"+nextRow+"'><td><input type='text' id='lab"+nextRow+"'></td><td><input type='text' onChange ='entryValidate(this)' id='val"+nextRow+"'></td></tr>");
//		$('#lab'+nextRow).val($('#labLast').val());
//		$('#val'+nextRow).val(parseFloat($('#valLast').val()));
//		$('#valLast').val("");
//		$('#labLast').val("");
//		$('#labLast').focus();
//		nextRow++;
//	}
//});

$("#entryFormAdd").click(function(){
	var labelError = false;
	var titleError = false;
	var valueError = false;
	var noDataError = false;
	$('#noTitleWarning').hide();
	$('#noLabelWarning').hide();
	$('#noValueWarning').hide();
	$('#noDataWarning').hide();
	
	var datasetTitle;
	var data = [];
	if ($('#dataSetTitle').val() == ""){
		titleError = true;
		$('#noTitleWarning').show();
		$('#dataSetTitle').focus();
	} else {
		$('#noTitleWarning').hide();
		datasetTitle = $('#dataSetTitle').val()
	}
	
	for (var i=1; i<nextRow; i++){
		var label = $('#lab'+i).val();
		var value = $('#val'+i).val();
		//console.log("label: "+label);
		//console.log("value: "+value);
		if (label == "" && value != ""){
			labelError = true;
			$('#noLabelWarning').show();
			$('#lab'+i).focus();
		}
		if (value == "" && label != ""){
			valueError = true;
			$('#noValueWarning').show();
			$('#val'+i).focus();
		}
		if (!isNaN(parseFloat(value)) && label != "")
			data.push({"label":label, "value":parseFloat(value)})
	}
	
	var label = $('#labLast').val();
	var value = $('#valLast').val();
	//console.log("label: "+label);
	//console.log("value: "+value);
	
	if (label == "" && value != ""){
		labelError = true;
		$('#noLabelWarning').show();
		$('#labLast').focus();
	}
	if (value == "" && label != ""){
		valueError = true;
		$('#noValueWarning').show();
		$('#valLast').focus();
	}
	
	if (!isNaN(parseFloat(value)) && label != "")
		data.push({"label":label, "value":parseFloat(value)})

	if (data.length == 0){
		$('#noDataWarning').show();
		noDataError = true;
	}
		
	if(!labelError && !titleError && !valueError && !noDataError){
		$('#noTitleWarning').hide();
		$('#noLabelWarning').hide();
		$('#noValueWarning').hide();
		graphCollection.addData(datasetTitle, data);
		constructVis();
		$('#dataSetAdd').slideUp();
		clearAddDataSetMenu();
	}
});

$('#entryFormCancel').click(function(){
	clearAddDataSetMenu();
	$('#dataSetAdd').slideUp();
});

$('#entryFormClear').click(function(){
	clearAddDataSetMenu();
});

function clearAddDataSetMenu(){
	$('#dataSetTitle').val("");
	$('#valLast').val("");
	$('#labLast').val("");
	$('#labLast').focus();
	for (var i=0; i<nextRow; i++)
		$('#row'+i).remove();
	nextRow = 1;
}

function entryValidate(elem){
	if (isNaN(parseFloat(elem.value))){
		$('#nonNumWarning').show();
		elem.value = "";
	} else {
		$('#nonNumWarning').hide();
	}
}

function populateLabelsFromExisting(){
	
}
