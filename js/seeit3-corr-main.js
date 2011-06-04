var vis = {};
var graphics = {};

$('#textYMin').hide();
$('#textYMax').hide();
$('#textXMin').hide();
$('#textXMax').hide();

function constructVis() {
	positionAxisMinMaxWidgets();
		
	if (jQuery('#checkboxNormalView').is(':checked')) {
		constructNormVis();
		toggleNormalViewOptions();
	}else if (jQuery('#checkboxDropDataOntoX').is(':checked')) {
		constructXStackedVis();
		toggleNormalViewOptions();
	}else if (jQuery('#checkboxDropDataOntoY').is(':checked')) {
		constructYStackedVis();
		toggleNormalViewOptions();
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
	padLeft = 90,
	padRight = 20;



function constructNormVis(){
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

  /* Y-axis label */		  
  vis.add(pv.Label)
	.data(graphics.worksheet.yAxisTitle)
	.left(-65)
	.top(graphics.h / 2)
	.textAlign("center")
	.textAngle(-Math.PI / 2)
	.font(function(){return "bold "+graphics.labelTextSize+"px sans-serif"});

  /* Y-axis ticks */
  vis.add(pv.Rule)
	 .data(function() { return graphics.y.ticks(graphics.normViewAxisDivisions) })
	 .bottom(graphics.y)
	 .strokeStyle(function(d) { return d ? "#eee" : "#000" })
	 .anchor('left').add(pv.Label)
	   .text(graphics.y.tickFormat)
	   .font(function(){return "bold "+graphics.tickTextSize+"px sans-serif"})
	   .visible(function(){return this.index != 0});

  /* X-axis ticks */
  vis.add(pv.Rule)
	 .data(function() { return graphics.x.ticks(graphics.normViewAxisDivisions) })
	 .left(graphics.x)
	 .strokeStyle(function(d) { return d ? "#eee" : "#000" })
	 .anchor("bottom").add(pv.Label)
	   .text(graphics.x.tickFormat)
	   .font(function(){return "bold "+graphics.tickTextSize+"px sans-serif"})
	   .visible(function(){return this.index != 0});
	   
  /* X-axis label */
  vis.add(pv.Label)
	.data(graphics.worksheet.xAxisTitle)
	.left(graphics.w / 2)
	.bottom(-50)
	.textAlign("center")
	.textAngle(0)
	.font(function(){return "bold "+graphics.labelTextSize+"px sans-serif"});
	
	  
  /* median median crosses and squares */
  for (var i = 0; i < graphics.groups.length; i++) {
	 var bounds = getBounds(graphics.groups[i]);
	 var coords = getBoundingCoords(bounds);
	 var n = graphics.groups[i].length;

	 /* rectangle around median group */
	 vis.add(pv.Line)
		.visible(function() { return jQuery('#checkboxShowMMRects').is(':checked') })
		.data(coords)
		.left(function(d) { return graphics.x(d[0]) })
		.bottom(function(d) { return graphics.y(d[1]) })
		.lineWidth(0.5)
		.strokeStyle("blue")
		.fillStyle(pv.rgb(0,0,255,0.05))
		.add(pv.Label)								
			.text(function(d) {
				if (this.index == 0) { return "N = "+ n;}
				else {return ""}
			})
			.textAlign("left")
			.textBaseline("top")
			.textStyle("blue")
			.textAngle(0)
			.font("bold 12px sans-serif");

	 /* median cross */
	 vis.add(pv.Dot)
		.visible(function() { return jQuery('#checkboxShowMMDots').is(':checked') })
		.data([graphics.medians[i]]) // extra brackets so not to use x and y as seperate points
		.left(function(d) { return graphics.x(d[0]) })
		.bottom(function(d) { return graphics.y(d[1]) })
		.radius(10)
		.angle(Math.PI / 4)
		.shape('cross')
		.strokeStyle(pv.rgb(0,0,255,0.90));
		//.title("Median dot");
  }


  /* median-median line:
	   Is middle median dot higher or lower than line through outer median dots? 
	   That is, middle median dot's y value - y value at same x of original median line 
	   divided by three */
  vis.add(pv.Line)
	 .visible(function() { return jQuery('#checkboxShowMMLine').is(':checked') })
	 .data([[graphics.xMin, graphics.mmFarLeftYVal], [graphics.xMax, graphics.mmFarRightYVal]])
	 .left(function(d) { return graphics.x(d[0]) })
	 .bottom(function(d) { return graphics.y(d[1]) })
	 .title("Median-median line")
	 .strokeStyle("blue")
	 .lineWidth(2)
	 .add(pv.Label)
		.visible(function () { return (jQuery('#checkboxShowMMEqn').is(':checked') 
										&& jQuery('#checkboxShowMMLine').is(':checked') )})
		.text(function(d) {
			if (this.index == 0) { return "Y = "+graphics.mmSlope.toFixed(3)+"X + "+graphics.mmIntercept.toFixed(3);}
			else{return "";}
		})
		.textAlign("left")
		.textBaseline("top")
		.textStyle("blue")
		.textAngle(getMMLineLabelAngle(graphics))
		.font("bold 12px sans-serif");
	 
	 
	 
  /* Least Squares Regression Line */  
  vis.add(pv.Line)
	.visible(function() { return jQuery('#checkboxShowLeastSquaresLine').is(':checked') })
	.data([[graphics.xMin, graphics.lsFarLeftYVal], [graphics.xMax, graphics.lsFarRightYVal]])
	.left(function(d) { return graphics.x(d[0]) })
	.bottom(function(d) { return graphics.y(d[1]) })
	.title("Least-Squares Regression Line")
	.strokeStyle(pv.rgb(0,225,0,1))
	.lineWidth(2)
	.add(pv.Label)									//Line Equation
		.visible(function () { return (jQuery('#checkboxShowLeastSquaresEquation').is(':checked')
										&& jQuery('#checkboxShowLeastSquaresLine').is(':checked') )})
		.text(function(d) {
			if (this.index == 0) { return "Y = "+graphics.lsSlope.toFixed(3)+"X + "+graphics.lsIntercept.toFixed(3);}
			else {return ""}
		})
		.textAlign("left")
		.textBaseline("top")
		.textStyle(pv.rgb(0,225,0,1))
		.textAngle(getLSLineLabelAngle(graphics))
		.font("bold 12px sans-serif")
	.add(pv.Label)									//R Value
		.visible(function () { return (jQuery('#checkboxShowLeastSquaresRValue').is(':checked')
										&& jQuery('#checkboxShowLeastSquaresLine').is(':checked') )})
		.text(function(d) {
			if (this.index == 0) { return "R = "+ getR(graphics.data).toFixed(2);}
			else {return ""}
		})
		.textAlign("left")
		.textBaseline("bottom")
		.textStyle(pv.rgb(0,225,0,1))
		.textAngle(getLSLineLabelAngle(graphics))
		.font("bold 12px sans-serif");
		
  /*R Squares*/
  for (var i=0; i < graphics.data.length; i++){	
	var sqrBounds = getRSquareBounds(graphics, i);  									   
	vis.add(pv.Line)
		.visible(function() { return (jQuery('#checkboxShowLeastSquaresSquares').is(':checked')
								&& jQuery('#checkboxShowLeastSquaresLine').is(':checked')) })
		.data(sqrBounds)
		.left(function(d) { return d[0] })
		.bottom(function(d) { return d[1] })
		.lineWidth(0.5)
		.strokeStyle("green")
		.fillStyle(pv.rgb(0,225,0,0.05));
  }
	 
  /* user drawn line */
  vis.add(pv.Line)
	.data(graphics.userDrawnLinePoints)
	.left(function(d) { return graphics.x(d.x) })
	.bottom(function(d) { return graphics.y(d.y) })
	.visible(function() { return jQuery('#checkboxShowUserLine').is(':checked') })
	.fillStyle("red")
	.strokeStyle("red")
	.lineWidth(2)
	.add(pv.Label)									//Line Equation
		.visible(function () { return jQuery('#checkboxShowUserLine').is(':checked') })
		.text(function(d) {
			if (this.index == 0) { return "Y = "+getUserLineSlope(graphics).toFixed(3)+"X + "+getUserLineIntercept(graphics).toFixed(3);}
			else {return ""}
		})
		.textAlign("left")
		.textBaseline("top")
		.textStyle("red")
		.textAngle(function() { return getUserLineLabelAngle(graphics)})
		.font("bold 12px sans-serif")
	.add(pv.Label)									//R Squared Value
		.visible(function () { return jQuery('#checkboxShowUserLine').is(':checked') })
		.text(function(d) {
			if (this.index == 0) { return "Sum of Squares = "+ getUserLineR(graphics).toFixed(2);}
			else {return ""}
		})
		.textAlign("left")
		.textBaseline("bottom")
		.textStyle("red")
		.textAngle(function() {return getUserLineLabelAngle(graphics)})
		.font("bold 12px sans-serif")
	.add(pv.Dot)									//Endpoints
		.fillStyle("red")
		.shape('square')
		.cursor('move')
		.event("mousedown", pv.Behavior.drag())
		.event("drag", function() {
			var mouseX = graphics.x.invert(vis.mouse().x),
				mouseY = graphics.y.invert(graphics.h - vis.mouse().y);
			
			graphics.userDrawnLinePoints[this.index].x = mouseX;
			graphics.userDrawnLinePoints[this.index].y = mouseY;
			
			vis.render();
		})		
	.add(pv.Dot)									//Midpoint
		.data(function() {return getUserLineMidpoint(graphics)})
		.left(function(d) { return graphics.x(d.x) })
		.bottom(function(d) { return graphics.y(d.y) })
		.fillStyle(pv.rgb(255,0,0,0.1))
		.strokeStyle(pv.rgb(255,0,0,0.5))
		.shape('diamond')
		.cursor('move')
		.event("mousedown", pv.Behavior.drag())
		.event("drag", function() {
			var mouseX = graphics.x.invert(vis.mouse().x),
				mouseY = graphics.y.invert(graphics.h - vis.mouse().y),
				handle = getUserLineMidpoint(graphics);
				
			graphics.userDrawnLinePoints[0].x += mouseX - handle[0].x;
			graphics.userDrawnLinePoints[1].x += mouseX - handle[0].x;
			graphics.userDrawnLinePoints[0].y += mouseY - handle[0].y;
			graphics.userDrawnLinePoints[1].y += mouseY - handle[0].y;
						
			vis.render();
		});		
	
  /* user ellipse */
  vis.add(pv.Line)
	 .visible(function() { return jQuery('#checkboxShowMMEllipse').is(':checked') })
	 .data(function() { return getRotatedEllipseCoords(graphics) })
	 .left(function(d) { return d[0] })
	 .bottom(function(d) { return d[1] })
	 .strokeStyle("red");
	 
  function getEllipseManipCoords(){
	var cardinalAngs = pv.range(0, 2 * Math.PI, Math.PI/2)
	var ellipseXRadius = graphics.xRadius;
	var ellipseYRadius = graphics.yRadius;
	
	var coords = [];
	for (i = 0; i < cardinalAngs.length; i++) {
	  coords.push([ ellipseXRadius * Math.cos(cardinalAngs[i]),
					ellipseYRadius * Math.sin(cardinalAngs[i]) ]);
	}
	
	for (var i = 0; i < coords.length; i++) {
	  coords[i] = ([ coords[i][0] * Math.cos(graphics.angle) - coords[i][1] * Math.sin(graphics.angle) + graphics.ellipseCX,
					 coords[i][0] * Math.sin(graphics.angle) + coords[i][1] * Math.cos(graphics.angle) + graphics.ellipseCY ]);
	}
	return coords;
  }
  
 
  vis.add(pv.Dot)
	 .visible(function() { return jQuery('#checkboxShowMMEllipse').is(':checked') })
	 .data(getEllipseManipCoords)
	 .left(function(d) { return d[0] })
	 .bottom(function(d) { return d[1] })
	 .cursor('move')
	 .shape('square')
	 .radius(5)
	 .fillStyle("red")
	 .strokeStyle("red")
	 .event("mousedown", pv.Behavior.drag())
	 .event("drag", function(){
		var mouseX = vis.mouse().x,
			mouseY = graphics.h - vis.mouse().y,
			handleX = getEllipseManipCoords()[this.index][0],
			handleY = getEllipseManipCoords()[this.index][1],
			
			mouseVec = pv.vector(graphics.ellipseCX - mouseX
								,graphics.ellipseCY - mouseY),
			
			handleVec = pv.vector(graphics.ellipseCX - handleX
								,graphics.ellipseCY - handleY).norm();

		var detHndlMs = determinantBtwnVec(handleVec, mouseVec);
		var rotDist = angleBtwnVec(mouseVec, handleVec);			
		
		if (mouseX > (0 - padLeft) 
			&& mouseX < (graphics.w + padRight) 
			&& mouseY > (0 - padBot) 
			&& mouseY < (graphics.h + padTop)){
			
			//Rotation
			if (!isNaN(rotDist)){
				if (detHndlMs > 0){
					graphics.angle = (graphics.angle + rotDist) % (2*Math.PI);
				}else{
					graphics.angle = (graphics.angle - rotDist) % (2*Math.PI);
				}
			}
			 
			//Radius Inc/Dec
			if (this.index % 2 == 0){
				graphics.xRadius = mouseVec.length();
			}else{
				graphics.yRadius = mouseVec.length();
			}
		}
		
		graphics.pointsInEllipse = numPointsInEllipse(graphics);
				
		vis.render();
	 })
	 .add(pv.Label)								
		.text(function(d) {
			if (this.index == 3) { return "# of Points Inside = "+ numPointsInEllipse(graphics) }
			else {return "";}
		})
		.textAlign("center")
		.textBaseline("bottom")
		.textStyle("red")
		.textAngle(0)
		.textMargin(10)
		.font("bold 12px sans-serif");
	 
   vis.add(pv.Dot)
	 .visible(function() { return jQuery('#checkboxShowMMEllipse').is(':checked') })
	 .data(function() {return [[graphics.ellipseCX, graphics.ellipseCY]]})
	 .left(function(d) { return d[0] })
	 .bottom(function(d) { return d[1] })
	 .cursor('move')
	 .shape('cross')
	 .radius(8)
	 .fillStyle(pv.rgb(255,0,0,0.20))
	 .strokeStyle(pv.rgb(255,0,0,0.50))
	 .event("mousedown", pv.Behavior.drag())
	 .event("drag", function(){
		var mouseX = vis.mouse().x,
			mouseY = graphics.h - vis.mouse().y;
		
		if (mouseX > 0 && mouseX < graphics.w && mouseY > 0 && mouseY < graphics.h){
			graphics.ellipseCX = mouseX;
			graphics.ellipseCY = mouseY;
		}
		
		graphics.pointsInEllipse = numPointsInEllipse(graphics);
				
		vis.render();
	 });
	 
  /* dot plot */
  vis.add(pv.Dot)
	 .data(graphics.data)
	 .visible(function() { return jQuery('#checkboxShowData').is(':checked') })
	 .event("point", function() { return this.active(this.index).parent })
	 .event("unpoint", function() { return this.active(-1).parent })
	 .left(function(d) { return graphics.x(d.incidence) })
	 .bottom(function(d) { return graphics.y(d.otherFactor) })
	 .radius(function() { return graphics.normViewDotSize })
	 .fillStyle(function(){ if (jQuery('#checkboxFillDots').is(':checked')){
								if (jQuery('#checkboxBWView').is(':checked'))
									return "black";
								else 
									return graphics.c[this.index];
								
							} else {
								return pv.rgb(0,0,0,0.10);
							}})
	 .strokeStyle(function() {  if (jQuery('#checkboxBWView').is(':checked')){
										return "black";
									} else {
										return graphics.c[this.index];
									}})
	 .title(function(d) { return d.state + ": " + d.incidence + ", " + d.otherFactor })
	 .def('active', -1)
	 .event("point", function() { return this.active(this.index).parent })
	 .event("unpoint", function() { return this.active(-1).parent });
	 
  
  jQuery('#sliderDotSize').slider({ 
	orientation:'vertical', min:1, max:10, value:graphics.normViewDotSize, step:1,
	slide:function(event, ui) {
		graphics.normViewDotSize = ui.value; 
		vis.render(); 
	}
  });
  
  jQuery('#sliderDivisions').slider({ 
	orientation:'vertical', min:2, max:40, value:graphics.normViewAxisDivisions, step:1,
	slide:function(event, ui) { 
		graphics.normViewAxisDivisions = ui.value;
		vis.render(); 
	}
  });
  
  
  vis.render();
		
}

function constructXStackedVis(){
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
		.text(graphics.worksheet.title + " (Dropped onto X-axis)")
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
		.strokeStyle("#aaa")
		.anchor("bottom").add(pv.Label)
		  .text(function(d) {return d.toFixed(1)})
		  .font(function(){return "bold "+graphics.tickTextSize+"px sans-serif"})
		  .visible(function(){return this.index != 0});
		   
	/* X-axis label */
	vis.add(pv.Label)
		.data(graphics.worksheet.xAxisTitle)
		.left(graphics.w / 2)
		.bottom(-50)
		.textAlign("center")
		.textAngle(0)
		.font(function(){return "bold "+graphics.labelTextSize+"px sans-serif"});
		
	/* Y-axis ticks */
	vis.add(pv.Rule)
		.bottom(0)
		.strokeStyle("#000")
	
	/* Dots */	
	vis.add(pv.Dot)
		.data(function() {return xDistributionPoints(graphics)})
		.left(function(d) { return d[0] })
		.bottom(function(d) { return d[1] })
		.radius(function() {return graphics.bucketDotSize})
		.fillStyle(function(){ if (jQuery('#checkboxFillDots').is(':checked')){
								if (jQuery('#checkboxBWView').is(':checked'))
									return "black";
								else 
									return graphics.c[this.index];
								
							} else {
								return "#eee";
							}})
		.strokeStyle(function(d) { if (jQuery('#checkboxBWView').is(':checked')){
										return "black";
									} else {
										return graphics.c[this.index];
									}})
		.title(function(d) { return d[2] });
		
	jQuery('#sliderDotSize').slider({ 
		orientation:'vertical', min:1, max:10, value:graphics.bucketDotSize, step:1,
		slide:function(event, ui) {
			graphics.bucketDotSize = ui.value; 
			vis.render(); 
		}
	});
  
	jQuery('#sliderDivisions').slider({ 
		orientation:'vertical', min:2, max:40, value:graphics.buckets, step:1,
		slide:function(event, ui) { 
			graphics.buckets = ui.value;
			vis.render(); 
		}
	});
					
	vis.render();
}
	
function constructYStackedVis(){
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
		.text(graphics.worksheet.title + " (Dropped onto Y-axis)")
		.font("bold 20px sans-serif");
		
	/* Number of datapoints N */
	vis.add(pv.Label)
		.right(0)
		.top(-10)
		.textAlign("right")
		.textAngle(0)
		.text("N = " + graphics.data.length)
		.font("bold 14px sans-serif");

		
	/* Y-axis label */		  
	vis.add(pv.Label)
		.data(graphics.worksheet.yAxisTitle)
		.left(-65)
		.top(graphics.h / 2)
		.textAlign("center")
		.textAngle(-Math.PI / 2)
		.font(function(){return "bold "+graphics.labelTextSize+"px sans-serif"});

	/* Y-axis ticks */
	vis.add(pv.Rule)
		.data(function() { return getYBuckets(graphics) })
		.bottom(function(d) {return graphics.y(d)})
		.strokeStyle("#aaa")
		.anchor("left").add(pv.Label)
		  .text(function(d) {return d.toFixed(1)})
		  .font(function(){return "bold "+graphics.tickTextSize+"px sans-serif"})
		  .visible(function(){return this.index != 0});
		
	/* X-axis ticks */
	vis.add(pv.Rule)
		.left(0)
		.strokeStyle("#000");
	
	/* Dots */	
	vis.add(pv.Dot)
		.data(function() {return yDistributionPoints(graphics)})
		.left(function(d) {return d[0]})
		.bottom(function(d) {return d[1]})
		.radius(function() {return graphics.bucketDotSize})
		.fillStyle(function(){ if (jQuery('#checkboxFillDots').is(':checked')){
								if (jQuery('#checkboxBWView').is(':checked'))
									return "black";
								else 
									return graphics.c[this.index];
								
							} else {
								return "#eee";
							}})
		.strokeStyle(function(d) { if (jQuery('#checkboxBWView').is(':checked')){
										return "black"; 
									} else {
										return graphics.c[this.index];
									}})
		.title(function(d) { return d[2] });
		
	jQuery('#sliderDotSize').slider({ 
		orientation:'vertical', min:1, max:10, value:graphics.bucketDotSize, step:1,
		slide:function(event, ui) {
			graphics.bucketDotSize = ui.value; 
			vis.render(); 
		}
	});
  
	jQuery('#sliderDivisions').slider({ 
		orientation:'vertical', min:2, max:40, value:graphics.buckets, step:1,
		slide:function(event, ui) { 
			graphics.buckets = ui.value;
			vis.render(); 
		}
	});
			
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


/* Updates value of x/y-axis scale text boxes */
function updateScaleTextBoxes(graphics){
	$('#textYMin').val(graphics.y.domain()[0]);
	$('#textYMax').val(graphics.y.domain()[1]);
	$('#textXMin').val(graphics.x.domain()[0]);
	$('#textXMax').val(graphics.x.domain()[1]);	
}


/* populate dataset drop down menu */
var numWorksheetsLoaded = 0;
jQuery('body').bind('WorksheetLoaded', function(event) {
  jQuery('#workSheetSelector').append(jQuery("<option value='" + event.worksheet.URL + "'>" + event.worksheet.title + "</option>")).val(event.worksheet.URL);
  numWorksheetsLoaded++;
  if (numWorksheetsLoaded >= numWorksheets){
	jQuery('p#loadingMsg').hide();	
	$('#textYMin').show();
	$('#textYMax').show();
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


jQuery('#fitScalesToData').change(function(event) {
  graphics.setXScale();
  graphics.setYScale();
  updateScaleTextBoxes(graphics);
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
		updateScaleTextBoxes(graphics);
	} else {
		jQuery('#fitScalesToData').attr('checked', false);
		graphics.setYScale(textBoxVal, curMax);
		constructVis();
	}	
});

$('#textYMax').change(function(event) {
	var textBoxVal = parseFloat($('#textYMax').val());
	var curMin = graphics.y.domain()[0];
	if (isNaN(textBoxVal) || textBoxVal <= curMin){
		updateScaleTextBoxes(graphics);
	} else {
		jQuery('#fitScalesToData').attr('checked', false);
		graphics.setYScale(curMin, textBoxVal);
		constructVis();
	}

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
