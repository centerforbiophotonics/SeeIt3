/* Events */	

/* Dynamic Graph Resizing */
$(window).resize(function() {
	graphCollection.setW(calcGraphWidth());
	if (graphCollection.graphs.length <= 4)
		graphCollection.setH(calcGraphHeight());
	constructVis();
	positionGroupingMenuOverGraph(graphCollection.selectedGraphIndex, graphCollection);
	positionDatasetAddMenu();
	positionDatasetEditMenu();
	positionDisplayMenu();
	positionCreateWorksheetMenu();
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

$('#displayOptions').change(function(){
	vis.render();
})

$('#displayMenuClose').click(function(){
	$('#displayOptions').slideUp();
});

$("#buttonMode").change(function(){
	console.log("test");
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
			"'></td></tr>");
			
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
		constructVis();
		$('#dataSetAdd').slideUp();
		resetAddDataSetMenu();
	}
});

$('#addFormCancel').click(function(){
	resetAddDataSetMenu();
	$('#dataSetAdd').slideUp();
});

$('#addFormReset').click(function(){
	resetAddDataSetMenu();
	populateAddMenuLabelsFromExisting();
});

function resetAddDataSetMenu(){
	$('#addDataSetTitle').val("");
	$('#addValLast').val("");
	$('#addLabLast').val("");
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
			"'></td></tr>");
			
			addNextRow++;
	});
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
			"'></td></tr>");
			
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
		constructVis();
		$('#dataSetEdit').slideUp();
		resetEditDataSetMenu();
	}
});

$('#editFormCancel').click(function(){
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
	
	graphCollection.worksheet.data[dataset].forEach(function(data){
		$('#editDatasetEntry tr:last').before(
			"<tr id='editRow" +editNextRow +
			"'><td><input type='text' id='editLab"+editNextRow +
			"' value='"+data.label +
			"'></td><td><input type='text' onChange ='editEntryValidate(this)' id='editVal"+editNextRow +
			"' value='"+data.value.toFixed(2) + 
			"'></td></tr>");
			
			editNextRow++;
		
	});
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
$('#wcLabLast').keyup(function(evt){
	$('#wcLabelEntry tr:last').before(
		"<tr id='wcRow" +
		wcNextRow +
		"'><td><input type='text' id='wcLab" +
		wcNextRow +
		"'></td></tr>");
			
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

$('#wcCancel').click(function(){
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
