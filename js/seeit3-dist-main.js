var vis = {};
var graphics = {};

$('#textYMin').hide();
$('#textYMax').hide();
$('#textXMin').hide();
$('#textXMax').hide();

function constructVis() {
	positionAxisMinMaxWidgets();
		
	if (jQuery('#checkboxSplitData').is(':checked')) {
		constructSplitVis();
	} else {
		constructSingleVis();
	}
	
	jQuery('#sliderTextSize').slider({ 
	orientation:'vertical', min:12, max:20, value:parseInt(graphics.tickTextSize), step:1,
	slide:function(event, ui) { 
		graphics.labelTextSize = (ui.value + 4).toString();
		graphics.tickTextSize = ui.value.toString();
		vis.render(); 
	}
	});
}

/*Padding around main panel*/
var padBot = 70,
	padTop = 60,
	padLeft = 20,
	padRight = 20;


function constructSingleVis(){
	jQuery('span').remove();
	
	vis = new pv.Panel()
		  .width(graphics.w)
		  .height(graphics.h)
		  .bottom(padBot)
		  .left(padLeft)
		  .right(padRight)
		  .top(padTop)
		  .events("all");
		  
	/*Graph Title*/		  
	vis.add(pv.Label)
		.left(graphics.w / 2)
		.top(-40)
		.textAlign("center")
		.textAngle(0)
		.text(graphics.worksheet.title)
		.font("bold 20px sans-serif");
	
	/* Number of datapoints N */
	vis.add(pv.Label)
		.right(0)
		.top(-10)
		.textAlign("right")
		.textAngle(0)
		.text("N = " + graphics.data.length)
		.font("bold 14px sans-serif");

		
	/* X-axis ticks */
	vis.add(pv.Rule)
		.data(function() { return getXBuckets(graphics) })
		.left(function(d) {return graphics.x(d)})
		.bottom(0)
		.strokeStyle("#aaa")
		.height(5)
		.anchor("bottom").add(pv.Label)
		  .text(function(d) {return d.toFixed(1)})
		  .font(function(){return "bold "+graphics.tickTextSize+"px sans-serif"})
		   
	/* X-axis label */
	vis.add(pv.Label)
		.data([graphics])
		.left(graphics.w / 2)
		.bottom(-50)
		.text(function(d){return d.worksheet.dataType1 + " and " + d.worksheet.dataType2 + " by " + d.worksheet.labelType})
		.textAlign("center")
		.textAngle(0)
		.font(function(){return "bold "+graphics.labelTextSize+"px sans-serif"});
		
	/* Y-axis ticks */
	vis.add(pv.Rule)
		.bottom(0)
		.strokeStyle("#000");
	
	/* Legend */
	vis.add(pv.Dot)
		.data([[400,-40],[400,-20]])
		.right(function(d){return d[0]})
		.top(function(d){return d[1]})
		.fillStyle(function(){return legendPointFillStyle(this.index)})
		.strokeStyle(function(d){return legendPointStrokeStyle(this.index)})
		.anchor("right").add(pv.Label)
			.text(function(d){
				if (this.index == 0) return "= "+graphics.worksheet.dataType1
				else return "= "+graphics.worksheet.dataType2
			})
	
	
	/* Dots */
	vis.add(pv.Dot)
		.data(function() {return singleDistPoints(graphics)})
		.left(function(d) { return d.x })
		.bottom(function(d) { return d.y })
		.radius(function() {return graphics.bucketDotSize})
		.fillStyle(function(d) {return dataPointFillStyle(d)})
		.strokeStyle(function(d) {return dataPointStrokeStyle(d)})
		.title(function(d) { return d.label+", "+graphics.x.invert(d.x).toFixed(1) });
		
	jQuery('#sliderDotSize').slider({ 
		orientation:'vertical', min:1, max:10, value:graphics.bucketDotSize, step:1,
		slide:function(event, ui) {
			graphics.bucketDotSize = ui.value; 
			vis.render(); 
		}
	});
  
	jQuery('#sliderDivisions').slider({ 
		orientation:'vertical', min:2, max:graphics.buckets, value:graphics.buckets, step:1,
		slide:function(event, ui) { 
			graphics.buckets = ui.value;
			graphics.singleDistPoints = singleDistPoints(graphics);
			vis.render(); 
		}
	});
					
	vis.render();
}
	
function constructSplitVis(){
	jQuery('span').remove();
	
	topGraphBase = graphics.h/2 + 50
	
	vis = new pv.Panel()
		  .width(graphics.w)
		  .height(graphics.h)
		  .bottom(padBot)
		  .left(padLeft)
		  .right(padRight)
		  .top(padTop)
		  .events("all");
		  
	/*Graph Title*/		  
	vis.add(pv.Label)
		.left(graphics.w / 2)
		.top(-40)
		.textAlign("center")
		.textAngle(0)
		.text(graphics.worksheet.title)
		.font("bold 20px sans-serif");
	
	/* Legend */
	vis.add(pv.Dot)
		.data([[400,-40],[400,-20]])
		.right(function(d){return d[0]})
		.top(function(d){return d[1]})
		.fillStyle(function(){return legendPointFillStyle(this.index)})
		.strokeStyle(function(d){return legendPointStrokeStyle(this.index)})
		.anchor("right").add(pv.Label)
			.text(function(d){
				if (this.index == 0) return "= "+graphics.worksheet.dataType1
				else return "= "+graphics.worksheet.dataType2
			})
	
	/* Top Graph N */
	vis.add(pv.Label)
		.right(0)
		.top(-10)
		.textAlign("right")
		.textAngle(0)
		.text("N = " + graphics.data.filter(function(d){return d.set1}).length)
		.font("bold 14px sans-serif");
	
	/* Top Graph X-Axis Label */
	vis.add(pv.Label)
		.data([graphics])
		.left(graphics.w / 2)
		.bottom(topGraphBase - 40)
		.text(function(d){return d.worksheet.dataType1 + " by " + d.worksheet.labelType})
		.textAlign("center")
		.textAngle(0)
		.font(function(){return "bold "+graphics.labelTextSize+"px sans-serif"});
	
	/* Top Graph X-Axis */
	vis.add(pv.Rule)
		.bottom(topGraphBase)
		.strokeStyle("#000");
		
	/* Top Graph X-Axis Ticks */
	vis.add(pv.Rule)
		.data(function() { return getXBuckets(graphics) })
		.left(function(d) {return graphics.x(d)})
		.height(5)
		.bottom(function() {return topGraphBase})
		.strokeStyle("#aaa")
		.anchor("bottom").add(pv.Label)
		  .text(function(d) {return d.toFixed(1)})
		  .font(function(){return "bold "+graphics.tickTextSize+"px sans-serif"})
		  
	/* Top Graph Dots */
	vis.add(pv.Dot)
		.data(function() {return setOnePoints(graphics)})
		.left(function(d) { return d.x })
		.bottom(function(d) { return topGraphBase + d.y })
		.radius(function() {return graphics.bucketDotSize})
		.fillStyle(function(d) {return dataPointFillStyle(d)})
		.strokeStyle(function(d) {return dataPointStrokeStyle(d)})
		.title(function(d) { return d.label+", "+graphics.x.invert(d.x).toFixed(1) });

/*|||||||||||||||||||BOTTOM GRAPH STUFF BELOW HERE||||||||||||||||||||*/
	
	/* Bottom Graph N */
	vis.add(pv.Label)
		.right(0)
		.bottom(topGraphBase - 60)
		.textAlign("right")
		.textAngle(0)
		.text("N = " + graphics.data.filter(function(d){return !(d.set1)}).length)
		.font("bold 14px sans-serif");

	/* Bottom Graph X-Axis Label */
	vis.add(pv.Label)
		.data([graphics])
		.left(graphics.w / 2)
		.bottom(-40)
		.text(function(d){return d.worksheet.dataType2 + " by " + d.worksheet.labelType})
		.textAlign("center")
		.textAngle(0)
		.font(function(){return "bold "+graphics.labelTextSize+"px sans-serif"});
		
	/* Bottom Graph X-Axis */
	vis.add(pv.Rule)
		.bottom(0)
		.strokeStyle("#000");
		
	/* Bottom Graph X-Axis Ticks */
	vis.add(pv.Rule)
		.data(function() { return getXBuckets(graphics) })
		.left(function(d) {return graphics.x(d)})
		.height(5)
		.bottom(0)
		.strokeStyle("#aaa")
		.anchor("bottom").add(pv.Label)
		  .text(function(d) {return d.toFixed(1)})
		  .font(function(){return "bold "+graphics.tickTextSize+"px sans-serif"})
		  
	/* Bottom Graph Dots */
	vis.add(pv.Dot)
		.data(function() {return setTwoPoints(graphics)})
		.left(function(d) { return d.x })
		.bottom(function(d) { return d.y })
		.radius(function() {return graphics.bucketDotSize})
		.fillStyle(function(d) {return dataPointFillStyle(d)})
		.strokeStyle(function(d) {return dataPointStrokeStyle(d)})
		.title(function(d) { return d.label+", "+graphics.x.invert(d.x).toFixed(1) });
	
	vis.render();
}


/* Events */	
jQuery('#newSpreadsheetURL').keyup(function(event) {
  if (event.keyCode == '13') {
	var key = parseSpreadsheetKeyFromURL($(this).val());
	$(this).val('');
	exampleSpreadsheets.push(new Spreadsheet(key));
  }
});


/* Dynamic Graph Resizing */
$(window).resize(function() {
	graphics.setW(calcGraphWidth());
	graphics.setH(calcGraphHeight());
	constructVis();
})




/* populate dataset drop down menu */
var numWorksheetsLoaded = 0;
jQuery('body').bind('WorksheetLoaded', function(event) {
  jQuery('#workSheetSelector').append(jQuery("<option value='" + event.worksheet.URL + "'>" + event.worksheet.title + "</option>")).val(event.worksheet.URL);
  numWorksheetsLoaded++;
  if (numWorksheetsLoaded >= numWorksheets){
	jQuery('p#loadingMsg').hide();	
	$('#textXMin').show();
	$('#textXMax').show();
	graphics = new Graphics(event.worksheet, calcGraphWidth(), calcGraphHeight());
	updateScaleTextBoxes(graphics);
	toggleNetworkOptions(graphics);
	constructVis();
  }
});


jQuery('#menu').change(function(event) {
  constructVis();
  event.stopPropagation();
})

jQuery('#editInGoogleDocs').click(function(event) {
  var URL = jQuery('#workSheetSelector').val();
  var matches = /feeds\/list\/([A-Z|a-z|0-9|_|-]+)/.exec(URL);
  window.open('https://spreadsheets.google.com/ccc?key=' + matches[1]);
  event.preventDefault();
});

jQuery('#menuOptions').change(function(event) {
  constructVis();
  event.stopPropagation();
});



jQuery('#workSheetSelector').change(function(event) {
  graphics = new Graphics(getWorksheet(), calcGraphWidth(), calcGraphHeight());
  graphics.setXScale();
  graphics.setYScale();
  updateScaleTextBoxes(graphics);
  toggleNetworkOptions(graphics);
  constructVis();
});


$('#textXMin').change(function(event) {
	var textBoxVal = parseFloat($('#textXMin').val());
	var curMax = graphics.x.domain()[1];
	if (isNaN(textBoxVal) || textBoxVal >= curMax){
		updateScaleTextBoxes(graphics);
	} else {
		jQuery('#fitScalesToData').attr('checked', false);
		graphics.setXScale(textBoxVal, curMax);
		constructVis();
	}
});

$('#textXMax').change(function(event) {
	var textBoxVal = parseFloat($('#textXMax').val());
	var curMin = graphics.x.domain()[0];
	if (isNaN(textBoxVal) || textBoxVal <= curMin){
		updateScaleTextBoxes(graphics);
	} else {
		jQuery('#fitScalesToData').attr('checked', false);
		graphics.setXScale(curMin, textBoxVal);
		constructVis();
	}
	
});

$('#refreshWorksheet').click(function(event){
	getWorksheet().fetchWorksheetData();
	if ($('#fitScalesToData').is(':checked')){
		jQuery('#fitScalesToData').attr('checked', false);
	}
	
});

$('#checkboxBWView').change(function() { return constructVis(); });
