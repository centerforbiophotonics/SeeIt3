/* Events */	

/* Dynamic Graph Resizing */
$(window).resize(function() {
	graphCollection.setW(calcGraphWidth());
	graphCollection.setH(graphCollection.calcGraphHeight());
	constructVis();
})


//Top Bar
jQuery('#newSpreadsheetURL').keyup(function(event) {
  if (event.keyCode == '13') {
	var key = parseSpreadsheetKeyFromURL($(this).val());
	$(this).val('');
	exampleSpreadsheets.push(new Spreadsheet(key));
  }
});



jQuery('#menu').change(function(event) {
  constructVis();
  event.stopPropagation();
});

$('#refreshWorksheet').click(function(event){
	getWorksheet().fetchWorksheetData();
	if ($('#fitScalesToData').is(':checked')){
		jQuery('#fitScalesToData').attr('checked', false);
	}
	
});

jQuery('#editInGoogleDocs').click(function(event) {
  var URL = jQuery('#workSheetSelector').val();
  var matches = /feeds\/list\/([A-Z|a-z|0-9|_|-]+)/.exec(URL);
  window.open('https://spreadsheets.google.com/ccc?key=' + matches[1]);
  event.preventDefault();
});

jQuery('#workSheetSelector').change(function(event) {
  graphCollection = new GraphCollection();
  //graphics.setXScale();
  //graphics.setYScale();
  constructVis();
});


//Graph Options
$('#graphOptions').hide();

$('#graphOptions')
		.css('position', 'absolute')
		.css('top', "0px")
		.css('left', "0px")
		
$('#graphOptClose').click(function(){
	hideMenus();
});


jQuery('#graphOptions').change(function(event) {
	graphCollection.graphs[graphCollection.selectedGraphIndex].udLine = $("#checkboxShowUserLine").is(':checked');
	graphCollection.graphs[graphCollection.selectedGraphIndex].udEllipse = $("#checkboxShowEllipse").is(':checked');
	graphCollection.graphs[graphCollection.selectedGraphIndex].showData = $("#checkboxShowData").is(':checked');
	graphCollection.graphs[graphCollection.selectedGraphIndex].fitScaleToData = $("#fitScalesToData").is(':checked');
		
	graphCollection.graphs[graphCollection.selectedGraphIndex].mmDots = $("#checkboxShowMMDots").is(':checked');
	graphCollection.graphs[graphCollection.selectedGraphIndex].mmDivs = $("#checkboxShowMMRects").is(':checked');
	graphCollection.graphs[graphCollection.selectedGraphIndex].mmLine = $("#checkboxShowMMLine").is(':checked');
	graphCollection.graphs[graphCollection.selectedGraphIndex].mmEQ = $("#checkboxShowMMEqn").is(':checked');
	
	graphCollection.graphs[graphCollection.selectedGraphIndex].lsLine = $("#checkboxShowLeastSquaresLine").is(':checked');
	graphCollection.graphs[graphCollection.selectedGraphIndex].lsSquares = $("#checkboxShowLeastSquaresSquares").is(':checked');
	graphCollection.graphs[graphCollection.selectedGraphIndex].lsEQ = $("#checkboxShowLeastSquaresEquation").is(':checked');
	graphCollection.graphs[graphCollection.selectedGraphIndex].lsR = $("#checkboxShowLeastSquaresRValue").is(':checked');
	
  constructVis();
  event.stopPropagation();
});

jQuery('#fitScalesToData').change(function(event) {
  //graphics.setXScale();
  //graphics.setYScale();
  constructVis();
});

jQuery('#checkboxShowMMEqn').change(function(event) {
  if (jQuery('#checkboxShowMMEqn').is(':checked'))
	jQuery('#checkboxShowMMLine').attr('checked', true);
  constructVis();
});

jQuery('#checkboxShowLeastSquaresEquation').change(function(event) {
  if (jQuery('#checkboxShowLeastSquaresEquation').is(':checked'))
	jQuery('#checkboxShowLeastSquaresLine').attr('checked', true);
  constructVis();
});

jQuery('#checkboxShowLeastSquaresRValue').change(function(event) {
  if (jQuery('#checkboxShowLeastSquaresRValue').is(':checked'))
	jQuery('#checkboxShowLeastSquaresLine').attr('checked', true);
  constructVis();
});

$('#textYMin').change(function(event) {
	var textBoxVal = parseFloat($('#textYMin').val());
	var curMax = graphics.y.domain()[1];
	if (isNaN(textBoxVal) || textBoxVal >= curMax){
		$('#textYMin').val(graphCollection.graphs[graphCollection.selectedGraphIndex].y.domain()[0]);
	} else {
		graphCollection.graphs[graphCollection.selectedGraphIndex].fitScaleToData = false;
		graphCollection.graphs[graphCollection.selectedGraphIndex].setYScale(textBoxVal, curMax);
		graphCollection.graphs[graphCollection.selectedGraphIndex].customScale = true;
		graphCollection.updateMenuOptions();
		vis.render();
	}	
});

$('#textYMax').change(function(event) {
	var textBoxVal = parseFloat($('#textYMax').val());
	var curMin = graphics.y.domain()[0];
	if (isNaN(textBoxVal) || textBoxVal <= curMin){
		$('#textYMax').val(graphCollection.graphs[graphCollection.selectedGraphIndex].y.domain()[1]);
	} else {
		graphCollection.graphs[graphCollection.selectedGraphIndex].fitScaleToData = false;
		graphCollection.graphs[graphCollection.selectedGraphIndex].setYScale(curMin, textBoxVal);
		graphCollection.graphs[graphCollection.selectedGraphIndex].customScale = true;
		graphCollection.updateMenuOptions();
		vis.render();
	}

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


//Display Options
$('#displayOptions').hide();

//$('#displayOptions')
//		.css('position', 'absolute')
//		.css('top', "0px")
//		.css('left', "0px")
function positionDisplayMenu(){		
	$('#displayOptions')
			.css('position', 'absolute')
			.css('top', $('span').offset().top +"px")
			.css('left', $('span').offset().left +
					graphCollection.padLeft - 34 +"px")
}
		
$('#displayOptClose').click(function(){
	hideMenus();
});

$('#displayOptions').change(function(){
	vis.render();
})


$('#checkboxBWView').change(function() { return constructVis(); });

jQuery('#sliderTextSize').slider({ 
	orientation:'vertical', min:12, max:20, value:12, step:1,
	slide:function(event, ui) { 
		graphCollection.labelTextSize = (ui.value + 4).toString();
		graphCollection.tickTextSize = ui.value.toString();
		vis.render(); 
	}
});
