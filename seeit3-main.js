jQuery('p#loadingMsg').show();

$(document).ready(function(){
	jQuery('p#loadingMsg').hide();	
	var vis = {};
	var graphics = {};

	function constructVis() {
	  jQuery('span').remove();

	  vis = new pv.Panel()
			  .width(graphics.w)
			  .height(graphics.h)
			  .bottom(60)
			  .left(60)
			  .right(20)
			  .top(60)
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
		.font("bold 12px sans-serif");

	  /* Y-axis label */		  
	  vis.add(pv.Label)
		.data(graphics.worksheet.yAxisTitle)
		.left(-40)
		.top(graphics.h / 2)
		.textAlign("center")
		.textAngle(-Math.PI / 2)
		.font("bold 14px sans-serif");

	  /* Y-axis ticks */
	  vis.add(pv.Rule)
		 .data(function() { return graphics.y.ticks() })
		 .bottom(graphics.y)
		 .strokeStyle(function(d) { return Math.floor(d) ? "#eee" : "#000" })
		 .anchor('left').add(pv.Label)
		   .text(graphics.y.tickFormat);

	  /* X-axis ticks */
	  vis.add(pv.Rule)
		 .data(function() { return graphics.x.ticks() })
		 .left(graphics.x)
		 .strokeStyle(function(d) { return Math.floor(d) ? "#eee" : "#000" })
		 .anchor("bottom").add(pv.Label)
		   .text(graphics.x.tickFormat);
		   
	  /* X-axis label */
	  vis.add(pv.Label)
		.data(graphics.worksheet.xAxisTitle)
		.left(graphics.w / 2)
		.bottom(-40)
		.textAlign("center")
		.textAngle(0)
		.font("bold 14px sans-serif");
		 
	   
	  /* median median crosses and squares */
	  for (var i = 0; i < graphics.groups.length; i++) {
		 var bounds = getBounds(graphics.groups[i]);
		 var coords = getBoundingCoords(bounds);

		 /* rectangle around median group */
		 vis.add(pv.Line)
			.visible(function() { return jQuery('#checkboxShowMMRects').is(':checked') })
			.data(coords)
			.left(function(d) { return graphics.x(d[0]) })
			.bottom(function(d) { return graphics.y(d[1]) })
			.lineWidth(0.5)
			.strokeStyle("#1f77b4")
			.fillStyle(pv.rgb(31,119,180,0.05));

		 /* median cross */
		 vis.add(pv.Dot)
			.visible(function() { return jQuery('#checkboxShowMMDots').is(':checked') })
			.data([graphics.medians[i]]) // extra brackets so not to use x and y as seperate points
			.left(function(d) { return graphics.x(d[0]) })
			.bottom(function(d) { return graphics.y(d[1]) })
			.radius(10)
			.angle(Math.PI / 4)
			.shape('cross')
			.fillStyle(pv.rgb(255,165,0,1))
			.title("Median dot");
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
		 .add(pv.Label)
			.visible(function () { return (jQuery('#checkboxShowMMEqn').is(':checked') 
											&& jQuery('#checkboxShowMMLine').is(':checked') )})
			.text(function(d) {
				if (this.index == 0) { return "Y = "+graphics.mmSlope.toFixed(3)+"X + "+graphics.mmIntercept.toFixed(3);}
				else{return "";}
			})
			.textAlign("left")
			.textBaseline("top")
			.textStyle("#1f77b4")
			.textAngle(getMMLineLabelAngle(graphics))
			.font("bold 12px sans-serif");
		 
		 
		 
	  /* Least Squares Regression Line */  
	  vis.add(pv.Line)
		.visible(function() { return jQuery('#checkboxShowLeastSquaresLine').is(':checked') })
		.data([[graphics.xMin, graphics.lsFarLeftYVal], [graphics.xMax, graphics.lsFarRightYVal]])
		.left(function(d) { return graphics.x(d[0]) })
		.bottom(function(d) { return graphics.y(d[1]) })
		.title("Least-Squares Regression Line")
		.strokeStyle("green")
		.add(pv.Label)				//Line Equation
			.visible(function () { return (jQuery('#checkboxShowLeastSquaresEquation').is(':checked')
											&& jQuery('#checkboxShowLeastSquaresLine').is(':checked') )})
			.text(function(d) {
				if (this.index == 0) { return "Y = "+graphics.lsSlope.toFixed(3)+"X + "+graphics.lsIntercept.toFixed(3);}
				else {return ""}
			})
			.textAlign("left")
			.textBaseline("top")
			.textStyle("green")
			.textAngle(getLSLineLabelAngle(graphics))
			.font("bold 12px sans-serif")
		.add(pv.Label)				//R Value
			.visible(function () { return (jQuery('#checkboxShowLeastSquaresRValue').is(':checked')
											&& jQuery('#checkboxShowLeastSquaresLine').is(':checked') )})
			.text(function(d) {
				if (this.index == 0) { return "R = "+ getR(graphics.data).toFixed(2);}
				else {return ""}
			})
			.textAlign("left")
			.textBaseline("bottom")
			.textStyle("green")
			.textAngle(getLSLineLabelAngle(graphics))
			.font("bold 12px sans-serif");
			
	  /*R Squares*/
	  for (var i=0; i < graphics.data.length; i++){
		  var dataX = parseFloat(graphics.data[i].incidence);
		  var dataY = parseFloat(graphics.data[i].otherFactor);
		  var vertDistToLS = dataY - getYOnLSByX(dataX, graphics);
		  var sqrBounds = [];
		  
		  if (graphics.lsSlope >=0){
			  sqrBounds = [[dataX, dataY],
						   [dataX, dataY - vertDistToLS],
						   [dataX - vertDistToLS, dataY - vertDistToLS],
						   [dataX - vertDistToLS, dataY],
						   [dataX, dataY]];
		  } else {
			  sqrBounds = [[dataX, dataY],
						   [dataX, dataY - vertDistToLS],
						   [dataX + vertDistToLS, dataY - vertDistToLS],
						   [dataX + vertDistToLS, dataY],
						   [dataX, dataY]];			  
		  } 
						  						   
		  vis.add(pv.Line)
			.visible(function() { return (jQuery('#checkboxShowLeastSquaresSquares').is(':checked')
									&& jQuery('#checkboxShowLeastSquaresLine').is(':checked')) })
			.data(sqrBounds)
			.left(function(d) { return graphics.x(d[0]) })
			.bottom(function(d) { return graphics.y(d[1]) })
			.lineWidth(0.5)
			.strokeStyle("green")
			.fillStyle(pv.rgb(0,255,0,0.05));
		  	  
	 }



	  /* dot plot */
	  vis.add(pv.Dot)
		 .data(graphics.data)
		 .visible(function() { return jQuery('#checkboxShowData').is(':checked') })
		 .event("point", function() { return this.active(this.index).parent })
		 .event("unpoint", function() { return this.active(-1).parent })
		 .left(function(d) { return graphics.x(d.incidence) })
		 .bottom(function(d) { return graphics.y(d.otherFactor) })
		 .radius(function() { return 3 / this.scale })
		 .fillStyle("#eee")
		 .strokeStyle(function(d) { return graphics.c[this.index] })
		 .title(function(d) { return d.state + ": " + d.incidence + ", " + d.otherFactor })
		 .def('active', -1)
		 .event("point", function() { return this.active(this.index).parent })
		 .event("unpoint", function() { return this.active(-1).parent });
		 
		 
	  /* user drawn line */
	  vis.add(pv.Line)
		 .data(graphics.userDrawnLinePoints)
		 .left(function(d) { return d.x })
		 .top(function(d) { return d.y })
		 .visible(function() { return jQuery('#checkboxShowUserLine').is(':checked') })
		 .add(pv.Dot)
			.fillStyle("#1f77b4")
			.shape('square')
			.event("mousedown", pv.Behavior.drag())
			.event("drag", vis);
	  
	   
	   
	  /* user ellipse */
	  function getRotatedEllipseCoords() {
		var ellipseXRadius = graphics.xRadius;
		var ellipseYRadius = graphics.yRadius;
		
		var coords = [];
		for (i = 0; i < graphics.fullRot.length; i++) {
		  coords.push([ ellipseXRadius * Math.cos(graphics.fullRot[i]),
						ellipseYRadius * Math.sin(graphics.fullRot[i]) ]);
		}
		
		for (var i = 0; i < coords.length; i++) {
		  coords[i] = ([ coords[i][0] * Math.cos(graphics.angle) - coords[i][1] * Math.sin(graphics.angle) + graphics.ellipseCX,
						 coords[i][0] * Math.sin(graphics.angle) + coords[i][1] * Math.cos(graphics.angle) + graphics.ellipseCY ]);
		}
		return coords;
	  }
	  
	  vis.add(pv.Line)
		 .visible(function() { return jQuery('#checkboxShowMMEllipse').is(':checked') })
		 .data(getRotatedEllipseCoords)
		 .left(function(i) { return i[0] })
		 .bottom(function(i) { return i[1] });
		 
	  function getEllipseManipCoords(){
		  var coords = getRotatedEllipseCoords();
		  var manipCoords = [];
		  manipCoords.push([coords[0][0], coords[0][1]]);
		  manipCoords.push([coords[Math.floor(coords.length * 0.25)][0], coords[parseInt(coords.length * 0.25)][1]]);
		  manipCoords.push([coords[Math.floor(coords.length * 0.50)][0], coords[parseInt(coords.length * 0.50)][1]]);
		  manipCoords.push([coords[Math.floor(coords.length * 0.75)][0], coords[parseInt(coords.length * 0.75)][1]]);
		  return manipCoords;
	  }
	  
	 
	  vis.add(pv.Dot)
	     .visible(function() { return jQuery('#checkboxShowMMEllipse').is(':checked') })
	     .data(getEllipseManipCoords)
	     .left(function(i) { return i[0] })
	     .bottom(function(i) { return i[1] })
	     .cursor('move')
	     .shape('square')
	     .radius(5)
	     .fillStyle("#1f77b4")
	     .event("mousedown", pv.Behavior.drag())
		 .event("drag", function(){
			var mouseX = vis.mouse().x,
				mouseY = graphics.h - vis.mouse().y,
				handleX = getEllipseManipCoords()[this.index][0],
				handleY = getEllipseManipCoords()[this.index][1],
				mouseVec = pv.vector(graphics.ellipseCX - mouseX, graphics.ellipseCY - mouseY), 
				handleVec = pv.vector(graphics.ellipseCX - handleX, graphics.ellipseCY - handleY).norm(),
				referenceVec = pv.vector(1,0);
			 
			var detHndlMs = handleVec.x*mouseVec.y - mouseVec.x*handleVec.y;
			
			var rotDist = Math.acos(mouseVec.norm().dot(handleVec.x, handleVec.y));
			
			
			if (mouseX > 0 && mouseX < graphics.w && mouseY > 0 && mouseY < graphics.h){
				if (!isNaN(rotDist)){
					if (detHndlMs > 0){
						graphics.angle = (graphics.angle + rotDist) % (2*Math.PI);
					}else{
						graphics.angle = (graphics.angle - rotDist) % (2*Math.PI);
					}
				}
				 
				if (this.index % 2 == 0){
					graphics.xRadius = mouseVec.length();
				}else{
					graphics.yRadius = mouseVec.length();
				}
			}
			vis.render();
		 });
	  
	  
	  vis.render();
	}

	

	var exampleSpreadsheets = [
	  new Spreadsheet('0AlqUG_LhxDPZdGk0ODFNcmxXV243dThtV2RvQTZTeGc'),
	]

	function getWorksheetByURL(URL) {
	  for (var h = 0; h < exampleSpreadsheets.length; h++) {
		for (var i = 0; i < exampleSpreadsheets[h].worksheets.length; i++) {
		  if (exampleSpreadsheets[h].worksheets[i].URL == URL)
			return exampleSpreadsheets[h].worksheets[i];
		}
	  }
	}

	function getWorksheet(){
	  var URL = jQuery('#workSheetSelector').val();
	  var worksheet = getWorksheetByURL(URL);
	  return worksheet;
	}

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
	jQuery('body').bind('WorksheetLoaded', function(event) {
	  jQuery('#workSheetSelector').append(jQuery("<option value='" + event.worksheet.URL + "'>" + event.worksheet.title + "</option>")).val(event.worksheet.URL);
	  graphics = new Graphics(getWorksheet(), calcGraphWidth(), calcGraphHeight());
	  constructVis();
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
	  constructVis();
	});
	
	
	jQuery('#fitScalesToData').change(function(event) {
	  graphics.setXScale();
	  graphics.setYScale();
	  constructVis();
	});
	
});
