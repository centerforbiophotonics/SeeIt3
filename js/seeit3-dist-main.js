var vis = {};
var graphics = {};
var deleteUDPFlag = true;

$('#textYMin').hide();
$('#textYMax').hide();
$('#textXMin').hide();
$('#textXMax').hide();

function constructVis() {
	positionAxisMinMaxWidgets();
	selectAUserDefPartition("none", graphics, null);
	if (jQuery('#checkboxSplitData').is(':checked')) {
		constructSplitVis();
	} else {
		constructSingleVis();
	}
}

/*Padding around main panel*/
var padBot = 70,
	padTop = 60,
	padLeft = 20,
	padRight = 20;


function constructSingleVis(){
	jQuery('span').remove();
	graphics.graphOverflowFlag = false;
	
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
					selectAUserDefPartition("both", graphics, graphics.udPartitionsBoth.push(this.mouse())-1);
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
		.bottom(-40)
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
		.data([-40,-20])
		.left(function(){return 20})
		.top(function(d){return d})
		.fillStyle(function(){return legendPointFillStyle(this.index)})
		.strokeStyle(function(d){return legendPointStrokeStyle(this.index)})
		.anchor("right").add(pv.Label)
			.text(function(d){
				if (this.index == 0) return "= "+graphics.worksheet.dataType1
				else return "= "+graphics.worksheet.dataType2
			})
	
	/* User Defined Partitions */
	vis.add(pv.Rule)
    .data(function(){return graphics.udPartitionsBoth})
    .left(function(d){return d.x})
    .strokeStyle("green")
    .visible(function(){return jQuery('#radioUserDefGroups').attr('checked')})
    .anchor("top").add(pv.Dot)
			.title(function(d){return graphics.x.invert(d.x)})
			.events("painted")
			.cursor("move")
			.shape("square")
			.fillStyle(function() {
				if (graphics.selectedUDPartBoth == this.index)  return "yellow";
				else return "green";
			})
			.strokeStyle("green")
			.radius(4)
			.event("mousedown", pv.Behavior.drag())
			.event("dragstart", function() {
				selectAUserDefPartition("both", graphics, this.index);
			})
			.event("drag", vis)
			
		/* UD Edge of the graph partition lines */
		vis.add(pv.Rule)
			.left(0)
			.strokeStyle("green")
			.visible(function(){return jQuery('#radioUserDefGroups').attr('checked')})
		
		vis.add(pv.Rule)
			.right(0)
			.strokeStyle("green")
			.visible(function(){return jQuery('#radioUserDefGroups').attr('checked')})
			
		/* UD Partition Data Count Label */
		vis.add(pv.Label)
			.data(function(){return countDataInUserDefPartitions(graphics, "both")})
			.textAlign("center")
			.textStyle("green")
			.top(10)
			.left(function(d){
				var udPartXVals = getSortedUDPartitionXVals(graphics, "both");
				if (this.index != udPartXVals.length-1){
					return graphics.x((udPartXVals[this.index]+udPartXVals[this.index+1])/2);
				} else return 0;
			})
			.visible(function(){
				var udPartXVals = getSortedUDPartitionXVals(graphics, "both");
				return this.index != udPartXVals.length-1 &&
							 jQuery('#radioUserDefGroups').attr('checked');
			});


    /* Listeners for user defined partition deletion */
    pv.listen(window, "mousedown", function() {self.focus()});
		pv.listen(window, "keydown", function(e) {
			// code 8 is backspace, code 46 is delete
			if ((e.keyCode == 8 || e.keyCode == 46) && graphics.selectedUDPartBoth >= 0) {
				if(deleteUDPFlag){				//the event gets triggered twice somehow.  This prevents multiple deletions.
					deleteUDPFlag = false;  
					graphics.udPartitionsBoth.splice(graphics.selectedUDPartBoth, 1);
					selectAUserDefPartition("none", graphics, null);
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
			.data(countDataInPartitions(graphics,fiwPartitions, "both"))
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
		var histRects = fiwHistogram(graphics,fiwPartitions, "both");
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
	var fgPartitions = partitionDataInFixedSizeGroups(graphics,"both");
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
			.visible(function(){return jQuery('#radioFourEqualGroups').attr('checked') &&
																 jQuery('#checkboxBoxPlot').attr('checked') == false; })
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
							 jQuery('#radioFourEqualGroups').attr('checked') &&
							 jQuery('#checkboxBoxPlot').attr('checked') == false;
			})
			.text(function(){
				var dataLength = parseData(graphics,"both").length;
				if (dataLength >= 8){
					if (dataLength % 4 == 0)
						return dataLength/4;
					else if(this.index != fourPartitions.length-2)
						return Math.ceil(dataLength/4);
					else
						return dataLength % Math.ceil(dataLength/4);
				} else {
					if(this.index != fourPartitions.length-2)
						return 1;
					else
						return dataLength - 3;
				}
			})
			
		/* Box Plot Extra Lines */
		vis.add(pv.Line)
			.data([[fourPartitions[0], graphics.h/2],
						 [fourPartitions[1], graphics.h/2]])
			.left(function(d) { return graphics.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return jQuery('#radioFourEqualGroups').attr('checked') &&
																 jQuery('#checkboxBoxPlot').attr('checked'); })
			
		vis.add(pv.Line)
			.data([[fourPartitions[1], graphics.h],
						 [fourPartitions[3], graphics.h]])
			.left(function(d) { return graphics.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return jQuery('#radioFourEqualGroups').attr('checked') &&
																 jQuery('#checkboxBoxPlot').attr('checked'); })
			
		vis.add(pv.Line)
			.data([[fourPartitions[1], 2],
						 [fourPartitions[3], 2]])
			.left(function(d) { return graphics.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return jQuery('#radioFourEqualGroups').attr('checked') &&
																 jQuery('#checkboxBoxPlot').attr('checked'); })
			
		vis.add(pv.Line)
			.data([[fourPartitions[3], graphics.h/2],
						 [fourPartitions[4], graphics.h/2]])
			.left(function(d) { return graphics.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return jQuery('#radioFourEqualGroups').attr('checked') &&
																 jQuery('#checkboxBoxPlot').attr('checked'); })
			
			
	/* Dots */
	vis.add(pv.Dot)
		.data(function() {return singleDistPoints(graphics)})
		.visible(function() { return $('#checkboxHideData').attr('checked') == false })
		.left(function(d) { return d.x })
		.bottom(function(d) {
			if (d.y > graphics.h + padTop)
				graphics.graphOverflowFlag = true;
			return d.y 
		})
		.radius(function() {return graphics.bucketDotSize})
		.fillStyle(function(d) {return dataPointFillStyle(d)})
		.strokeStyle(function(d) {return dataPointStrokeStyle(d)})
		.title(function(d) { return d.label+", "+graphics.x.invert(d.x).toFixed(1) });
	
	/* Overflow Warning Message */
	vis.add(pv.Label)
		.text("Warning! Data Exceeds Graph Height")
		.top(-10)
		.left(graphics.w/2)
		.textStyle("red")
		.textAlign("center")
		.visible(function() {return graphics.graphOverflowFlag})

	
	vis.render();
}
	
function constructSplitVis(){
	jQuery('span').remove();
	
	graphics.graphOverflowFlag = false;
	topGraphBase = graphics.h/2 + 50
	
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
					if(this.mouse().y < topGraphBase){
						selectAUserDefPartition("set1",graphics, graphics.udPartitionsSet1.push(this.mouse())-1);
					} else {
						selectAUserDefPartition("set2", graphics, graphics.udPartitionsSet2.push(this.mouse())-1);
					}
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
	
	/* Legend */
	vis.add(pv.Dot)
		.data([-40,-20])
		.left(function(){return 20})
		.top(function(d){return d})
		.fillStyle(function(){return legendPointFillStyle(this.index)})
		.strokeStyle(function(d){return legendPointStrokeStyle(this.index)})
		.anchor("right").add(pv.Label)
			.text(function(d){
				if (this.index == 0) return "= "+graphics.worksheet.dataType1
				else return "= "+graphics.worksheet.dataType2
			})
			
	/* Listeners for user defined partition deletion */
	pv.listen(window, "mousedown", function() {self.focus()});
	pv.listen(window, "keydown", function(e) {
		// code 8 is backspace, code 46 is delete
		if (e.keyCode == 8 || e.keyCode == 46) {
			if (graphics.selectedUDPartInWhichSet == "set1"){
				if(deleteUDPFlag){				//the event gets triggered twice somehow.  This prevents multiple deletions.
					deleteUDPFlag = false;  
					graphics.udPartitionsSet1.splice(graphics.selectedUDPartSet1, 1);
					selectAUserDefPartition("none", graphics, null);
					vis.render();
					e.preventDefault();
				} else {
					deleteUDPFlag = true;
				}
			} else if (graphics.selectedUDPartInWhichSet == "set2") {
				if(deleteUDPFlag){				//the event gets triggered twice somehow.  This prevents multiple deletions.
					deleteUDPFlag = false;  
					graphics.udPartitionsSet2.splice(graphics.selectedUDPartSet2, 1);
					selectAUserDefPartition("none", graphics, null);
					vis.render();
					e.preventDefault();
				} else {
					deleteUDPFlag = true;
				}
			}
		}
	});
			
/*|||||||||||||||||||||TOP GRAPH STUFF BELOW HERE|||||||||||||||||||||*/
	
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
		  
	/* Top Graph User Defined Partitions */
	vis.add(pv.Rule)
    .data(function(){return graphics.udPartitionsSet1})
    .left(function(d){return d.x})
    .bottom(topGraphBase)
		.height(graphics.h/2 - 50)
    .strokeStyle("green")
    .visible(function(){return jQuery('#radioUserDefGroups').attr('checked')})
    .anchor("top").add(pv.Dot)
			.title(function(d){return graphics.x.invert(d.x)})
			.events("painted")
			.cursor("move")
			.shape("square")
			.fillStyle(function() {
				if (graphics.selectedUDPartSet1 == this.index)  return "yellow";
				else return "green";
			})
			.strokeStyle("green")
			.radius(4)
			.event("mousedown", pv.Behavior.drag())
			.event("dragstart", function() {
				selectAUserDefPartition("set1", graphics, this.index);
			})
			.event("drag", vis)
			
		/* Top Graph UD Edge of the graph partition lines */
		vis.add(pv.Rule)
			.left(0)
			.bottom(topGraphBase)
			.height(graphics.h/2 - 50)
			.strokeStyle("green")
			.visible(function(){return jQuery('#radioUserDefGroups').attr('checked')})
		
		vis.add(pv.Rule)
			.right(0)
			.bottom(topGraphBase)
			.height(graphics.h/2 - 50)
			.strokeStyle("green")
			.visible(function(){return jQuery('#radioUserDefGroups').attr('checked')})
			
		/* Top Graph UD Partition Data Count Label */
		vis.add(pv.Label)
			.data(function(){return countDataInUserDefPartitions(graphics, "set1")})
			.textAlign("center")
			.textStyle("green")
			.top(10)
			.left(function(d){
				var udPartXVals = getSortedUDPartitionXVals(graphics, "set1");
				if (this.index != udPartXVals.length-1){
					return graphics.x((udPartXVals[this.index]+udPartXVals[this.index+1])/2);
				} else return 0;
			})
			.visible(function(){
				var udPartXVals = getSortedUDPartitionXVals(graphics, "set1");
				return this.index != udPartXVals.length-1 &&
							 jQuery('#radioUserDefGroups').attr('checked');
			});
	
	/* Top Graph Fixed Interval Width Partitions */
	var fiwPartitions = partitionDataByIntervalWidth(graphics);
	vis.add(pv.Rule)
		.data(fiwPartitions)
		.left(function(d){return graphics.x(d)})
		.bottom(topGraphBase)
		.height(graphics.h/2 - 50)
		.visible(function(){return jQuery('#radioFixedIntervalGroups').attr('checked')})
		.strokeStyle("green")
		.title(function(d){return d})
		.anchor("top").add(pv.Dot)
			.title(function(d){return d})
			.shape("square")
			.fillStyle("green")
			.strokeStyle("green")
			.size(4);
			
		/* Top Graph Fixed Interval Width Partitions Size Labels*/
		vis.add(pv.Label)
			.data(countDataInPartitions(graphics,fiwPartitions, "set1"))
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
			
		/* Top Graph Fixed Interval Width Histogram */
		var histRectsSet1 = fiwHistogram(graphics,fiwPartitions, "set1");
		for (var i=0; i < histRectsSet1.length; i++){	  									   
			vis.add(pv.Line)
				.data(histRectsSet1[i])
				.visible(function(d) { 
					return (jQuery('#radioFixedIntervalGroups').is(':checked') &&
									jQuery('#checkboxHistogram').is(':checked')
									) 
				})
				.left(function(d) { return graphics.x(d[0]) })
				.bottom(function(d) { return topGraphBase + d[1] })
				.lineWidth(0.5)
				.strokeStyle("green")
				.fillStyle(pv.rgb(0,225,0,0.05));
		}
	
	/* Top Graph Fixed Group Size Partitions */
	var fgPartitionsSet1 = partitionDataInFixedSizeGroups(graphics,"set1");
	vis.add(pv.Rule)
		.data(fgPartitionsSet1)
		.left(function(d){return graphics.x(d)})
		.bottom(topGraphBase)
		.height(graphics.h/2 - 50)
		.visible(function(){return jQuery('#radioFixedSizeGroups').attr('checked')})
		.strokeStyle("green")
		.title(function(d){return d})
		.anchor("top").add(pv.Dot)
			.title(function(d){return d})
			.shape("square")
			.fillStyle("green")
			.strokeStyle("green")
			.size(4);
			
		/* Top Graph Fixed Size Partition Size Labels*/
		vis.add(pv.Label)
			.data(fgPartitionsSet1)
			.textAlign("center")
			.textStyle("green")
			.top(10)
			.left(function(){
				if (this.index != fgPartitionsSet1.length-1){
					return graphics.x((fgPartitionsSet1[this.index]+fgPartitionsSet1[this.index+1])/2);
				} else return 0;
			})
			.visible(function(){
				return this.index != fgPartitionsSet1.length-1 &&
							 jQuery('#radioFixedSizeGroups').attr('checked');
			})
			.text(function(){
				if (parseData(graphics,"set1").length % graphics.partitionGroupSize == 0 ||
						this.index != fgPartitionsSet1.length-2)
					return graphics.partitionGroupSize;
				
				else return parseData(graphics,"set1").length % graphics.partitionGroupSize;
				
			})
	
	/* Top Graph Two Equal Partitions */
	var twoPartitionsSet1 = partitionDataInTwo(graphics,"set1");
	vis.add(pv.Rule)
		.data(twoPartitionsSet1)
		.left(function(d){return graphics.x(d)})
		.bottom(topGraphBase)
		.height(graphics.h/2 - 50)
		.visible(function(){return jQuery('#radioTwoEqualGroups').attr('checked')})
		.strokeStyle("green")
		.title(function(d){return d})
		.anchor("top").add(pv.Dot)
			.title(function(d){return d})
			.shape("square")
			.fillStyle("green")
			.strokeStyle("green")
			.size(4);
			
		/* Top Graph Two Partition Size Labels*/
		vis.add(pv.Label)
			.data(twoPartitionsSet1)
			.textAlign("center")
			.textStyle("green")
			.top(10)
			.left(function(){
				if (this.index != twoPartitionsSet1.length-1){
					return graphics.x((twoPartitionsSet1[this.index]+twoPartitionsSet1[this.index+1])/2);
				} else return 0;
			})
			.visible(function(){
				return this.index != twoPartitionsSet1.length-1 &&
							 jQuery('#radioTwoEqualGroups').attr('checked');
			})
			.text(function(){
				if (parseData(graphics,"set1").length % 2 == 0)
					return parseData(graphics,"set1").length/2;
				else if(this.index != twoPartitionsSet1.length-2)
					return Math.ceil(parseData(graphics,"set1").length/2);
				else
					return Math.floor(parseData(graphics,"set1").length/2);
				
			})
			
	/* Top Graph Four Equal Partitions */
	var fourPartitionsSet1 = partitionDataInFour(graphics,"set1");
	vis.add(pv.Rule)
		.data(fourPartitionsSet1)
		.left(function(d){return graphics.x(d)})
		.bottom(topGraphBase)
		.height(graphics.h/2 - 50)
		.visible(function(){return jQuery('#radioFourEqualGroups').attr('checked')})
		.strokeStyle("green")
		.title(function(d){return d})
		.anchor("top").add(pv.Dot)
			.visible(function(){return jQuery('#radioFourEqualGroups').attr('checked') &&
																 jQuery('#checkboxBoxPlot').attr('checked') == false; })
			.title(function(d){return d})
			.shape("square")
			.fillStyle("green")
			.strokeStyle("green")
			.size(4);
			
		/* Top Graph Four Partition Size Labels*/
		vis.add(pv.Label)
			.data(fourPartitionsSet1)
			.textAlign("center")
			.textStyle("green")
			.top(10)
			.left(function(){
				if (this.index != fourPartitionsSet1.length-1){
					return graphics.x((fourPartitionsSet1[this.index]+fourPartitionsSet1[this.index+1])/2);
				} else return 0;
			})
			.visible(function(){
				return this.index != fourPartitionsSet1.length-1 &&
							 jQuery('#radioFourEqualGroups').attr('checked') &&
							 jQuery('#checkboxBoxPlot').attr('checked') == false;
			})
			.text(function(){
				var dataLength = parseData(graphics,"set1").length;
				if (dataLength >= 8){
					if (dataLength % 4 == 0)
						return dataLength/4;
					else if(this.index != fourPartitionsSet1.length-2)
						return Math.ceil(dataLength/4);
					else
						return dataLength % Math.ceil(dataLength/4);
				} else {
					if(this.index != fourPartitionsSet1.length-2)
						return 1;
					else
						return dataLength - 3;
				}
			})
			
		/* Top Graph Box Plot Extra Lines */
		vis.add(pv.Line)
			.data([[fourPartitionsSet1[0], graphics.h/4*3],
						 [fourPartitionsSet1[1], graphics.h/4*3]])
			.left(function(d) { return graphics.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return jQuery('#radioFourEqualGroups').attr('checked') &&
																 jQuery('#checkboxBoxPlot').attr('checked'); })
			
		vis.add(pv.Line)
			.data([[fourPartitionsSet1[1], graphics.h],
						 [fourPartitionsSet1[3], graphics.h]])
			.left(function(d) { return graphics.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return jQuery('#radioFourEqualGroups').attr('checked') &&
																 jQuery('#checkboxBoxPlot').attr('checked'); })
			
		vis.add(pv.Line)
			.data([[fourPartitionsSet1[1], topGraphBase+2],
						 [fourPartitionsSet1[3], topGraphBase+2]])
			.left(function(d) { return graphics.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return jQuery('#radioFourEqualGroups').attr('checked') &&
																 jQuery('#checkboxBoxPlot').attr('checked'); })
			
		vis.add(pv.Line)
			.data([[fourPartitionsSet1[3], graphics.h/4*3],
						 [fourPartitionsSet1[4], graphics.h/4*3]])
			.left(function(d) { return graphics.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return jQuery('#radioFourEqualGroups').attr('checked') &&
																 jQuery('#checkboxBoxPlot').attr('checked'); })
	
		  
	/* Top Graph Dots */
	vis.add(pv.Dot)
		.data(function() {return setOnePoints(graphics)})
		.visible(function() { return $('#checkboxHideData').attr('checked') == false })
		.left(function(d) { return d.x })
		.bottom(function(d) {
			if ((topGraphBase + d.y) > graphics.h+padTop-10)
				graphics.graphOverflowFlag = true;
			return topGraphBase + d.y 
		})
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
	
	/* Bottom Graph User Defined Partitions */
	vis.add(pv.Rule)
    .data(function(){return graphics.udPartitionsSet2})
    .left(function(d){return d.x})
    .bottom(0)
		.height(graphics.h/2 - 50)
    .strokeStyle("green")
    .visible(function(){return jQuery('#radioUserDefGroups').attr('checked')})
    .anchor("top").add(pv.Dot)
			.title(function(d){return graphics.x.invert(d.x)})
			.events("painted")
			.cursor("move")
			.shape("square")
			.fillStyle(function() {
				if (graphics.selectedUDPartSet2 == this.index)  return "yellow";
				else return "green";
			})
			.strokeStyle("green")
			.radius(4)
			.event("mousedown", pv.Behavior.drag())
			.event("dragstart", function() {
				selectAUserDefPartition("set2", graphics, this.index);
			})
			.event("drag", vis)
			
		/* Bottom Graph UD Edge of the graph partition lines */
		vis.add(pv.Rule)
			.left(0)
			.bottom(0)
			.height(graphics.h/2 - 50)
			.strokeStyle("green")
			.visible(function(){return jQuery('#radioUserDefGroups').attr('checked')})
		
		vis.add(pv.Rule)
			.right(0)
			.bottom(0)
			.height(graphics.h/2 - 50)
			.strokeStyle("green")
			.visible(function(){return jQuery('#radioUserDefGroups').attr('checked')})
			
		/* Bottom Graph UD Partition Data Count Label */
		vis.add(pv.Label)
			.data(function(){return countDataInUserDefPartitions(graphics, "set2")})
			.textAlign("center")
			.textStyle("green")
			.bottom(topGraphBase - 110)
			.left(function(d){
				var udPartXVals = getSortedUDPartitionXVals(graphics, "set2");
				if (this.index != udPartXVals.length-1){
					return graphics.x((udPartXVals[this.index]+udPartXVals[this.index+1])/2);
				} else return 0;
			})
			.visible(function(){
				var udPartXVals = getSortedUDPartitionXVals(graphics, "set2");
				return this.index != udPartXVals.length-1 &&
							 jQuery('#radioUserDefGroups').attr('checked');
			});
	
	
	/* Bottom Graph Fixed Interval Width Partitions */
	vis.add(pv.Rule)
		.data(fiwPartitions)
		.left(function(d){return graphics.x(d)})
		.bottom(0)
		.height(graphics.h/2 - 50)
		.visible(function(){return jQuery('#radioFixedIntervalGroups').attr('checked')})
		.strokeStyle("green")
		.title(function(d){return d})
		.anchor("top").add(pv.Dot)
			.title(function(d){return d})
			.shape("square")
			.fillStyle("green")
			.strokeStyle("green")
			.size(4);
			
		/* Bottom Graph Fixed Interval Width Partitions Size Labels*/
		vis.add(pv.Label)
			.data(countDataInPartitions(graphics,fiwPartitions, "set2"))
			.textAlign("center")
			.textStyle("green")
			.bottom(topGraphBase - 110)
			.left(function(){
				if (this.index != fiwPartitions.length-1){
					return graphics.x((fiwPartitions[this.index]+fiwPartitions[this.index+1])/2);
				} else return 0;
			})
			.visible(function(){
				return this.index != fiwPartitions.length-1 &&
							 jQuery('#radioFixedIntervalGroups').attr('checked');
			});
			
		/* Bottom Graph Fixed Interval Width Histogram */
		var histRectsSet2 = fiwHistogram(graphics,fiwPartitions, "set2");
		for (var i=0; i < histRectsSet2.length; i++){	  									   
			vis.add(pv.Line)
				.data(histRectsSet2[i])
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
		  
	/* Bottom Graph Fixed Group Size Partitions */
	var fgPartitionsSet2 = partitionDataInFixedSizeGroups(graphics,"set2");
	vis.add(pv.Rule)
		.data(function(){ fgPartitionsSet2 = partitionDataInFixedSizeGroups(graphics,"set2");
											return fgPartitionsSet2; })
		.left(function(d){return graphics.x(d)})
		.height(graphics.h/2 - 50)
		.bottom(0)
		.visible(function(){return jQuery('#radioFixedSizeGroups').attr('checked')})
		.strokeStyle("green")
		.title(function(d){return d})
		.anchor("top").add(pv.Dot)
			.title(function(d){return d})
			.shape("square")
			.fillStyle("green")
			.strokeStyle("green")
			.size(4);
			
		/* Bottom Graph Fixed Size Partition Size Labels*/
		vis.add(pv.Label)
			.data(fgPartitionsSet2)
			.textAlign("center")
			.textStyle("green")
			.bottom(topGraphBase-110)
			.left(function(){
				if (this.index != fgPartitionsSet2.length-1){
					return graphics.x((fgPartitionsSet2[this.index]+fgPartitionsSet2[this.index+1])/2);
				} else return 0;
			})
			.visible(function(){
				return this.index != fgPartitionsSet2.length-1 &&
							 jQuery('#radioFixedSizeGroups').attr('checked');
			})
			.text(function(){
				if (parseData(graphics,"set2").length % graphics.partitionGroupSize == 0 ||
						this.index != fgPartitionsSet2.length-2)
					return graphics.partitionGroupSize;
				
				else return parseData(graphics,"set2").length % graphics.partitionGroupSize;
				
			})
			
	/* Bottom Graph Two Equal Partitions */
	var twoPartitionsSet2 = partitionDataInTwo(graphics,"set2");
	vis.add(pv.Rule)
		.data(twoPartitionsSet2)
		.left(function(d){return graphics.x(d)})
		.bottom(0)
		.height(graphics.h/2 - 50)
		.visible(function(){return jQuery('#radioTwoEqualGroups').attr('checked')})
		.strokeStyle("green")
		.title(function(d){return d})
		.anchor("top").add(pv.Dot)
			.title(function(d){return d})
			.shape("square")
			.fillStyle("green")
			.strokeStyle("green")
			.size(4);
			
		/* Bottom Graph Two Partition Size Labels*/
		vis.add(pv.Label)
			.data(twoPartitionsSet2)
			.textAlign("center")
			.textStyle("green")
			.bottom(topGraphBase - 110)
			.left(function(){
				if (this.index != twoPartitionsSet2.length-1){
					return graphics.x((twoPartitionsSet2[this.index]+twoPartitionsSet2[this.index+1])/2);
				} else return 0;
			})
			.visible(function(){
				return this.index != twoPartitionsSet2.length-1 &&
							 jQuery('#radioTwoEqualGroups').attr('checked');
			})
			.text(function(){
				if (parseData(graphics,"set2").length % 2 == 0)
					return parseData(graphics,"set2").length/2;
				else if(this.index != twoPartitionsSet2.length-2)
					return Math.ceil(parseData(graphics,"set2").length/2);
				else
					return Math.floor(parseData(graphics,"set2").length/2);
				
			})
			
	/* Bottom Graph Four Equal Partitions */
	var fourPartitionsSet2 = partitionDataInFour(graphics,"set2");
	vis.add(pv.Rule)
		.data(fourPartitionsSet2)
		.left(function(d){return graphics.x(d)})
		.bottom(0)
		.height(graphics.h/2 - 50)
		.visible(function(){return jQuery('#radioFourEqualGroups').attr('checked')})
		.strokeStyle("green")
		.title(function(d){return d})
		.anchor("top").add(pv.Dot)
			.visible(function(){return jQuery('#radioFourEqualGroups').attr('checked') &&
																 jQuery('#checkboxBoxPlot').attr('checked') == false; })
			.title(function(d){return d})
			.shape("square")
			.fillStyle("green")
			.strokeStyle("green")
			.size(4);
			
		/*Bottom Graph Four Partition Size Labels*/
		vis.add(pv.Label)
			.data(fourPartitionsSet2)
			.textAlign("center")
			.textStyle("green")
			.bottom(topGraphBase - 110)
			.left(function(){
				if (this.index != fourPartitionsSet2.length-1){
					return graphics.x((fourPartitionsSet2[this.index]+fourPartitionsSet2[this.index+1])/2);
				} else return 0;
			})
			.visible(function(){
				return this.index != fourPartitionsSet2.length-1 &&
							 jQuery('#radioFourEqualGroups').attr('checked') &&
							 jQuery('#checkboxBoxPlot').attr('checked') == false;
			})
			.text(function(){
				var dataLength = parseData(graphics,"set2").length;
				if (dataLength >= 8){
					if (dataLength % 4 == 0)
						return dataLength/4;
					else if(this.index != fourPartitionsSet2.length-2)
						return Math.ceil(dataLength/4);
					else
						return dataLength % Math.ceil(dataLength/4);
				} else {
					if(this.index != fourPartitionsSet2.length-2)
						return 1;
					else
						return dataLength - 3;
				}
			})
			
		/* Bottom Graph Box Plot Extra Lines */
		vis.add(pv.Line)
			.data([[fourPartitionsSet2[0], graphics.h/4],
						 [fourPartitionsSet2[1], graphics.h/4]])
			.left(function(d) { return graphics.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return jQuery('#radioFourEqualGroups').attr('checked') &&
																 jQuery('#checkboxBoxPlot').attr('checked'); })
			
		vis.add(pv.Line)
			.data([[fourPartitionsSet2[1], graphics.h/2 - 50],
						 [fourPartitionsSet2[3], graphics.h/2 - 50]])
			.left(function(d) { return graphics.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return jQuery('#radioFourEqualGroups').attr('checked') &&
																 jQuery('#checkboxBoxPlot').attr('checked'); })
			
		vis.add(pv.Line)
			.data([[fourPartitionsSet2[1], 2],
						 [fourPartitionsSet2[3], 2]])
			.left(function(d) { return graphics.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return jQuery('#radioFourEqualGroups').attr('checked') &&
																 jQuery('#checkboxBoxPlot').attr('checked'); })
			
		vis.add(pv.Line)
			.data([[fourPartitionsSet2[3], graphics.h/4],
						 [fourPartitionsSet2[4], graphics.h/4]])
			.left(function(d) { return graphics.x(d[0]) })
			.bottom(function(d) { return d[1] })
			.lineWidth(1)
			.strokeStyle("darkgreen")
			.visible(function(){return jQuery('#radioFourEqualGroups').attr('checked') &&
																 jQuery('#checkboxBoxPlot').attr('checked'); })
		  
	/* Bottom Graph Dots */
	vis.add(pv.Dot)
		.data(function() {return setTwoPoints(graphics)})
		.visible(function() { return $('#checkboxHideData').attr('checked') == false })
		.left(function(d) { return d.x })
		.bottom(function(d) { 
			if (d.y > topGraphBase)
				graphics.graphOverflowFlag = true;
			return d.y;
		})
		.radius(function() {return graphics.bucketDotSize})
		.fillStyle(function(d) {return dataPointFillStyle(d)})
		.strokeStyle(function(d) {return dataPointStrokeStyle(d)})
		.title(function(d) { return d.label+", "+graphics.x.invert(d.x).toFixed(1) });
	
	/* Overflow Warning Message */
	vis.add(pv.Label)
		.text("Warning! Data Exceeds Graph Height")
		.top(-10)
		.left(graphics.w/2)
		.textStyle("red")
		.textAlign("center")
		.visible(function() {return graphics.graphOverflowFlag})
	
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

/* Sliders */

jQuery('#sliderTextSize').slider({ 
	orientation:'vertical', min:12, max:20, value:parseInt(graphics.tickTextSize), step:1,
	slide:function(event, ui) { 
		graphics.labelTextSize = (ui.value + 4).toString();
		graphics.tickTextSize = ui.value.toString();
		vis.render(); 
	}
});
	
jQuery('#sliderDotSize').slider({ 
	orientation:'vertical', min:1, max:10, value:graphics.bucketDotSize, step:1,
	slide:function(event, ui) {
		graphics.bucketDotSize = ui.value; 
		vis.render(); 
	}
});

jQuery('#sliderDivisions').slider({ 
	orientation:'vertical', min:2, max:40, value:30, step:1,
	slide:function(event, ui) { 
		graphics.buckets = ui.value;
		graphics.singleDistPoints = singleDistPoints(graphics);
		constructVis();
	}
});
