var vis = {};
var graphics = {};
var deleteUDPFlag = true;

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
		  .events("all")
		  .event("mousedown", function() {
				if (jQuery('#radioUserDefGroups').attr('checked')){
					graphics.selectedUDPart = graphics.udPartitions.push(this.mouse())-1;
				}
				vis.render();
			});
		  
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
	
	/* User Defined Partitions */
	vis.add(pv.Rule)
    .data(function(){return graphics.udPartitions})
    .left(function(d){return d.x})
    .strokeStyle("green")
    .visible(function(){return jQuery('#radioUserDefGroups').attr('checked')})
    .anchor("top").add(pv.Dot)
			.title(function(d){return graphics.x.invert(d.x)})
			.events("painted")
			.cursor("move")
			.shape("square")
			.fillStyle(function() {
				if (graphics.selectedUDPart == this.index)  return "yellow";
				else return "green";
			})
			.strokeStyle("green")
			.radius(4)
			.event("mousedown", pv.Behavior.drag())
			.event("dragstart", function() {graphics.selectedUDPart = this.index})
			.event("drag", vis)
			
		/* Edge of the graph partition lines */
		vis.add(pv.Rule)
			.left(0)
			.strokeStyle("green")
			.visible(function(){return jQuery('#radioUserDefGroups').attr('checked')})
		
		vis.add(pv.Rule)
			.right(0)
			.strokeStyle("green")
			.visible(function(){return jQuery('#radioUserDefGroups').attr('checked')})
			
		/* Partition Data Count Label */
		vis.add(pv.Label)
			.data(function(){return countDataInUserDefPartitions(graphics)})
			.textAlign("center")
			.textStyle("green")
			.top(10)
			.left(function(d){
				var udPartXVals = getSortedUDPartitionXVals(graphics);
				if (this.index != udPartXVals.length-1){
					return graphics.x((udPartXVals[this.index]+udPartXVals[this.index+1])/2);
				} else return 0;
			})
			.visible(function(){
				var udPartXVals = getSortedUDPartitionXVals(graphics);
				return this.index != udPartXVals.length-1 &&
							 jQuery('#radioUserDefGroups').attr('checked');
			});


    /* Listeners for user defined partition deletion */
    pv.listen(window, "mousedown", function() {self.focus()});
		pv.listen(window, "keydown", function(e) {
			// code 8 is backspace, code 46 is delete
			if ((e.keyCode == 8 || e.keyCode == 46) && graphics.selectedUDPart >= 0) {
				if(deleteUDPFlag){				//the event gets triggered twice somehow.  This prevents multiple deletions.
					deleteUDPFlag = false;  
					graphics.udPartitions.splice(graphics.selectedUDPart, 1);
					graphics.selectedUDPart = -1;
					vis.render();
					e.preventDefault();
				} else {
					deleteUDPFlag = true;
				}
			}
		});
	
	
	
		
	/* Fixed Interval Width Partitions */
	var fiwPartitions = partitionDataByIntervalWidth(graphics);
	vis.add(pv.Rule)
		.data(fiwPartitions)
		.left(function(d){return graphics.x(d)})
		.visible(function(){return jQuery('#radioFixedIntervalGroups').attr('checked')})
		.strokeStyle("green")
		.title(function(d){return d})
		.anchor("top").add(pv.Dot)
			.title(function(d){return d})
			.shape("square")
			.fillStyle("green")
			.strokeStyle("green")
			.size(4);
			
		/*Fixed Interval Width Partitions Size Labels*/
		vis.add(pv.Label)
			.data(countDataInPartitions(graphics,fiwPartitions))
			.textAlign("center")
			.textStyle("green")
			.top(10)
			.left(function(){
				if (this.index != fiwPartitions.length-1){
					return graphics.x((fiwPartitions[this.index]+fiwPartitions[this.index+1])/2);
				} else return 0;
			})
			.visible(function(){
				return this.index != fiwPartitions.length-1 &&
							 jQuery('#radioFixedIntervalGroups').attr('checked');
			});
			
		/* Fixed Interval Width Histogram */
		var histRects = fiwHistogram(graphics,fiwPartitions);
		for (var i=0; i < histRects.length; i++){	  									   
			vis.add(pv.Line)
				.data(histRects[i])
				.visible(function(d) { 
					return (jQuery('#radioFixedIntervalGroups').is(':checked') &&
									jQuery('#checkboxHistogram').is(':checked')
									) 
				})
				.left(function(d) { return graphics.x(d[0]) })
				.bottom(function(d) { return d[1] })
				.lineWidth(0.5)
				.strokeStyle("green")
				.fillStyle(pv.rgb(0,225,0,0.05));
		}
	
		
	/* Fixed Group Size Partitions */
	var fgPartitions = partitionDataInUserDefGroups(graphics,"both");
	vis.add(pv.Rule)
		.data(fgPartitions)
		.left(function(d){return graphics.x(d)})
		.visible(function(){return jQuery('#radioFixedSizeGroups').attr('checked')})
		.strokeStyle("green")
		.title(function(d){return d})
		.anchor("top").add(pv.Dot)
			.title(function(d){return d})
			.shape("square")
			.fillStyle("green")
			.strokeStyle("green")
			.size(4);
			
		/*Fixed Size Partition Size Labels*/
		vis.add(pv.Label)
			.data(fgPartitions)
			.textAlign("center")
			.textStyle("green")
			.top(10)
			.left(function(){
				if (this.index != fgPartitions.length-1){
					return graphics.x((fgPartitions[this.index]+fgPartitions[this.index+1])/2);
				} else return 0;
			})
			.visible(function(){
				return this.index != fgPartitions.length-1 &&
							 jQuery('#radioFixedSizeGroups').attr('checked');
			})
			.text(function(){
				if (graphics.data.length % graphics.partitionGroupSize == 0 ||
						this.index != fgPartitions.length-2)
					return graphics.partitionGroupSize;
				
				else return graphics.data.length % graphics.partitionGroupSize;
				
			})
				
		
	/* Two Equal Partitions */
	var twoPartitions = partitionDataInTwo(graphics,"both");
	vis.add(pv.Rule)
		.data(twoPartitions)
		.left(function(d){return graphics.x(d)})
		.visible(function(){return jQuery('#radioTwoEqualGroups').attr('checked')})
		.strokeStyle("green")
		.title(function(d){return d})
		.anchor("top").add(pv.Dot)
			.title(function(d){return d})
			.shape("square")
			.fillStyle("green")
			.strokeStyle("green")
			.size(4);
			
		/*Two Partition Size Labels*/
		vis.add(pv.Label)
			.data(twoPartitions)
			.textAlign("center")
			.textStyle("green")
			.top(10)
			.left(function(){
				if (this.index != twoPartitions.length-1){
					return graphics.x((twoPartitions[this.index]+twoPartitions[this.index+1])/2);
				} else return 0;
			})
			.visible(function(){
				return this.index != twoPartitions.length-1 &&
							 jQuery('#radioTwoEqualGroups').attr('checked');
			})
			.text(function(){
				if (graphics.data.length % 2 == 0)
					return graphics.data.length/2;
				else if(this.index != twoPartitions.length-2)
					return Math.ceil(graphics.data.length/2);
				else
					return Math.floor(graphics.data.length/2);
				
			})
	
	/* Four Equal Partitions */
	var fourPartitions = partitionDataInFour(graphics,"both");
	vis.add(pv.Rule)
		.data(fourPartitions)
		.left(function(d){return graphics.x(d)})
		.visible(function(){return jQuery('#radioFourEqualGroups').attr('checked')})
		.strokeStyle("green")
		.title(function(d){return d})
		.anchor("top").add(pv.Dot)
			.title(function(d){return d})
			.shape("square")
			.fillStyle("green")
			.strokeStyle("green")
			.size(4);
			
		/*Four Partition Size Labels*/
		vis.add(pv.Label)
			.data(fourPartitions)
			.textAlign("center")
			.textStyle("green")
			.top(10)
			.left(function(){
				if (this.index != fourPartitions.length-1){
					return graphics.x((fourPartitions[this.index]+fourPartitions[this.index+1])/2);
				} else return 0;
			})
			.visible(function(){
				return this.index != fourPartitions.length-1 &&
							 jQuery('#radioFourEqualGroups').attr('checked');
			})
			.text(function(){
				if (graphics.data.length % 4 == 0)
					return graphics.data.length/4;
				else if(this.index != fourPartitions.length-2)
					return Math.ceil(graphics.data.length/4);
				else
					return graphics.data.length % Math.ceil(graphics.data.length/4);
			})
			
	/* Dots */
	vis.add(pv.Dot)
		.data(function() {return singleDistPoints(graphics)})
		.visible(function() { return $('#checkboxHideData').attr('checked') == false })
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

$('#fixedGroupSize').change(function(event) {
	var textBoxVal = parseFloat($('#fixedGroupSize').val());
	if (isNaN(textBoxVal) || textBoxVal <= 0){
		$('#fixedGroupSize').val(graphics.partitionGroupSize);
	} else {
		graphics.partitionGroupSize = textBoxVal;
		constructVis();
	}
});

$('#fixedIntervalWidth').change(function(event) {
	var textBoxVal = parseFloat($('#fixedIntervalWidth').val());
	if (isNaN(textBoxVal) || textBoxVal <= 0){
		$('#fixedIntervalWidth').val(graphics.partitionIntervalWidth);
	} else {
		graphics.partitionIntervalWidth = textBoxVal;
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

$('#fitScalesToData').change(function() {
	graphics.setXScale();
	constructVis();
});
