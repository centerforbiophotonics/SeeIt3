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
		   .text(graphics.x.tickFormat);

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
			.fillStyle(pv.rgb(255,165,0,0.05));

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
		 .data([[graphics.xMin, graphics.farLeftYVal], [graphics.xMax, graphics.farRightYVal]])
		 .left(function(d) { return graphics.x(d[0]) })
		 .bottom(function(d) { return graphics.y(d[1]) })
		 .title("Median-median line")
		 .add(pv.Label)
			.visible(function () { return (jQuery('#checkboxShowMMEqn').is(':checked') 
											&& jQuery('#checkboxShowMMLine').is(':checked') )})
			.text(function(d) {
				if (this.index == 0) { return "y = "+graphics.slope.toFixed(3)+"x + "+graphics.intercept.toFixed(3);}
				else{return "";}
			})
			.textAlign("left")
			.textBaseline("top")
			.textStyle("#1f77b4")
			.textAngle(function () {
				if (graphics.slope <= 0){
					return Math.atan(Math.abs(
											graphics.y(graphics.farRightYVal) - graphics.y(graphics.farLeftYVal)
										) / Math.abs(
											graphics.x(graphics.xMax) - graphics.x(graphics.xMin)
										)
									);
				} else {
					return -Math.atan(Math.abs(
											graphics.y(graphics.farRightYVal) - graphics.y(graphics.farLeftYVal)
										) / Math.abs(
											graphics.x(graphics.xMax) - graphics.x(graphics.xMin)
										)
									);
				}
									
			});
		 
		 
		 
	  /* Least Squares Regression Line */
	  vis.add(pv.Line)
		 .visible(function() { return jQuery('#checkboxShowLeastSquaresLine').is(':checked') })
		 .data([[graphics.xMin, graphics.lsFarLeftYVal], [graphics.xMax, graphics.lsFarRightYVal]])
		 .left(function(d) { return graphics.x(d[0]) })
		 .bottom(function(d) { return graphics.y(d[1]) })
		 .title("Least-Squares Regression Line")
		 .strokeStyle("green")
		 .add(pv.Label)
			.visible(function () { return (jQuery('#checkboxShowLeastSquaresEquation').is(':checked')
											&& jQuery('#checkboxShowLeastSquaresLine').is(':checked') )})
			.text(function(d) {
				if (this.index == 0) { return "y = "+graphics.lsSlope.toFixed(3)+"x + "+graphics.lsIntercept.toFixed(3);}
				else{return "";}
			})
			.textAlign("left")
			.textBaseline("top")
			.textStyle("green")
			.textAngle(function () {
				if (graphics.lsSlope <= 0){
					return Math.atan(Math.abs(
											graphics.y(graphics.lsFarRightYVal) - graphics.y(graphics.lsFarLeftYVal)
										) / Math.abs(
											graphics.x(graphics.xMax) - graphics.x(graphics.xMin)
										)
									);
				} else {
					return -Math.atan(Math.abs(
											graphics.y(graphics.lsFarRightYVal) - graphics.y(graphics.lsFarLeftYVal)
										) / Math.abs(
											graphics.x(graphics.xMax) - graphics.x(graphics.xMin)
										)
									);
				}
									
			});


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
			.event("drag", vis)
			
	  

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

	/* Contains variables required for graphics
	 * DO NOT MODIFY DIRECTLY */
	function Graphics(worksheet, width, height){
		var graphics = this;
		this.worksheet = worksheet;
		
		this.data = worksheet.data;

		this.w = width || 600;
		this.h = height || 300;
		this.xMax = pv.max(this.data, function(d) { return d.incidence });
		this.yMax = pv.max(this.data, function(d) { return d.otherFactor });
		this.xMin = pv.min(this.data, function(d) { return d.incidence });
		this.yMin = pv.min(this.data, function(d) { return d.otherFactor });
		this.x = pv.Scale.linear(0, Math.ceil(this.xMax)).range(0, this.w);
		this.y = pv.Scale.linear(0, Math.ceil(this.yMax)).range(0, this.h);
		this.colorScale = pv.Scale.linear(0, 1/4, 1/2, 3/4, 1).range("red", "blue", "green", "yellow", "black");
		this.c = jQuery.map(this.data, function() { return graphics.colorScale(Math.random()) });
		
		/* User Drawn Line*/
		this.userDrawnLinePoints = [{ x:this.w * 0.2, y:this.h / 2 }, 
								 { x:this.w * 0.8, y:this.h / 2 }];
								 
		/* median median crosses and squares */
		this.groups = divideDataInto3(this.data);
		this.medians = getMedianValuesFrom(this.groups);
		
		/* median-median line */
		this.slope = findSlope(this.medians[0][0], this.medians[2][0], this.medians[0][1], this.medians[2][1]);
		this.intercept = findIntercept(this.medians[0][0], this.medians[0][1], this.slope);
		this.medianYDelta = ((this.medians[1][1] - getYValue(this.medians[1][0], this.slope, this.intercept)) / 3);
		this.adjustedIntercept = this.intercept + this.medianYDelta;
		this.farLeftYVal = getYValue(this.xMin, this.slope, this.adjustedIntercept);
		this.farRightYVal = getYValue(this.xMax, this.slope, this.adjustedIntercept);
		
		/* Least-Squares Regression Line */
		var incidences = [];
		var otherFactors = [];
		for (var i = 0; i < this.data.length; i++){
			incidences.push(this.data[i].incidence);
			otherFactors.push(this.data[i].otherFactor);
		}
		this.lsSlope = getR(this.data)*(getSD(otherFactors)/getSD(incidences));
		this.lsIntercept = getMean(otherFactors) - this.lsSlope*getMean(incidences);
		this.lsFarLeftYVal = getYValue(this.xMin, this.lsSlope, this.lsIntercept);
		this.lsFarRightYVal = getYValue(this.xMax, this.lsSlope, this.lsIntercept);
		
		/* user ellipse */
		this.angle = 0;
		this.xRadius = this.w/4;
		this.yRadius = this.w/4;
		this.fullRot = pv.range(0, 2 * Math.PI, 0.01);
		this.ellipseCX = this.x((this.xMin + this.xMax) / 2);
		this.ellipseCY = this.y((this.yMin + this.yMax) / 2);
	}
	
	Graphics.prototype = {
		setW: function(wVal){		//updates the scale and the user defined ellipse and line
			var oldW = this.w;
			this.w = wVal;
			if (jQuery('#fitScalesToData').is(':checked')) {
				this.x = pv.Scale.linear(Math.floor(this.xMin), Math.ceil(this.xMax)).range(0, this.w);	
			}else{			
				this.x = pv.Scale.linear(0, Math.ceil(this.xMax)).range(0, this.w);
			}
			this.ellipseCX = this.x((this.xMin + this.xMax) / 2);
			this.xRadius = (this.xRadius)*(this.w/oldW);//*Math.cos(this.angle);
			//this.yRadius = (this.yRadius)*(this.w/oldW);//*Math.sin(this.angle);
			this.userDrawnLinePoints[0].x = (this.userDrawnLinePoints[0].x)*(this.w/oldW);
			this.userDrawnLinePoints[1].x = (this.userDrawnLinePoints[1].x)*(this.w/oldW);
		},
		
		setH: function(hVal){		//updates the scale and the user defined ellipse and line
			var oldH = this.h;
			this.h = hVal;			
			if (jQuery('#fitScalesToData').is(':checked')) {
				this.y = pv.Scale.linear(Math.floor(this.yMin), Math.ceil(this.yMax)).range(0, this.h);	
			}else{
				this.y = pv.Scale.linear(0, Math.ceil(this.yMax)).range(0, this.h);
			}
			this.ellipseCY = this.y((this.yMin + this.yMax) / 2);
			this.yRadius = (this.yRadius)*(this.h/oldH);//*Math.cos(this.angle);
			//this.xRadius = (this.xRadius)*(this.h/oldH);//*Math.sin(this.angle);
			this.userDrawnLinePoints[0].y = (this.userDrawnLinePoints[0].y)*(this.h/oldH);
			this.userDrawnLinePoints[1].y = (this.userDrawnLinePoints[1].y)*(this.h/oldH);
		},
		
		setXScale: function(){		//updates the scale and the user defined ellipse and line		
			if (jQuery('#fitScalesToData').is(':checked')) {
				this.x = pv.Scale.linear(Math.floor(this.xMin), Math.ceil(this.xMax)).range(0, this.w);	
			}else{			
				this.x = pv.Scale.linear(0, Math.ceil(this.xMax)).range(0, this.w);
			}
			this.ellipseCX = this.x((this.xMin + this.xMax) / 2);
			this.xRadius = (this.xRadius);//*Math.cos(this.angle);
			//this.yRadius = (this.yRadius)*(this.w/oldW);//*Math.sin(this.angle);
			this.userDrawnLinePoints[0].x = (this.userDrawnLinePoints[0].x);
			this.userDrawnLinePoints[1].x = (this.userDrawnLinePoints[1].x);
		},
		
		setYScale: function(){		//updates the scale and the user defined ellipse and line		
			if (jQuery('#fitScalesToData').is(':checked')) {
				this.y = pv.Scale.linear(Math.floor(this.yMin), Math.ceil(this.yMax)).range(0, this.h);	
			}else{
				this.y = pv.Scale.linear(0, Math.ceil(this.yMax)).range(0, this.h);
			}
			this.ellipseCY = this.y((this.yMin + this.yMax) / 2);
			this.yRadius = (this.yRadius);//*Math.cos(this.angle);
			//this.xRadius = (this.xRadius)*(this.h/oldH);//*Math.sin(this.angle);
			this.userDrawnLinePoints[0].y = this.y(this.userDrawnLinePoints[0].y);
			this.userDrawnLinePoints[1].y = this.y(this.userDrawnLinePoints[1].y);
		},
		
	}
	
	function Spreadsheet(key) {
	  this.key = key;
	  this.worksheets = [];
	  this.fetchWorksheets();
	}

	Spreadsheet.prototype = {
	  getWorksheetURLs: function(callback) {
		jQuery.jsonp({ url:'https://spreadsheets.google.com/feeds/worksheets/' + this.key + '/public/basic?alt=json',
		  callbackParameter: "callback",
		  success:callback,
		  error:function() {
			alert("Could not retrieve worksheets from the spreadsheet. Is it published?");
		  }});
	  },
	  
	  fetchWorksheets: function() {
		var spreadsheet = this;
		this.getWorksheetURLs(function(feedData) {
		  for (var i = 0; i < feedData.feed.entry.length; i++) {
			spreadsheet.worksheets.push(new Worksheet(feedData.feed.entry[i].link[0].href));
		  }
		});
	  },
	  
	};

	function Worksheet(URL) {
	  this.URL = URL;
	  this.fetchWorksheetData();
	}

	Worksheet.prototype = {
	  fetchWorksheetData: function() {
		var worksheet = this;
		jQuery.jsonp({ url:this.URL + '?alt=json', callbackParameter: "callback", 
		  success:function(feedData) {
			worksheet.data = worksheet.transformFeedData(feedData);
			worksheet.xAxisTitle = worksheet.getXAxisTitle(feedData);
			worksheet.yAxisTitle = worksheet.getYAxisTitle(feedData);        
			worksheet.title = feedData.feed.title.$t;
			jQuery('body').trigger({ type:'WorksheetLoaded', worksheet:worksheet });
		  },
		  error:function() {
			alert("Could not retrieve worksheet. Is it published?");
		  }
		});
	  },
	  getXAxisTitle: function(feedData) {
		var titles = feedData.feed.entry[0].content.$t.split(",");
		return /[\w|\d]+/.exec(titles[0]);
	  },
	  getYAxisTitle: function(feedData) {
		var titles = feedData.feed.entry[0].content.$t.split(",");
		return /[\w|\d]+/.exec(titles[1]);
	  },
	  transformFeedData: function(feedData) {
		var data = [];
		for (var i = 0; i < feedData.feed.entry.length; i++) {
		  var cells = feedData.feed.entry[i].content.$t.split(',');
		  var firstMatch = /\:\s+([\d|\.]+)/.exec(cells[0]);
		  var secondMatch = /\:\s+([\d|\.]+)/.exec(cells[1]);
		  if (!firstMatch || !secondMatch)
			; // ignore bad or blank data
		  else
			data.push({state: feedData.feed.entry[i].title.$t, incidence: firstMatch[1], otherFactor: secondMatch[1]});
		}
		return data;
	  },
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
	  var URL = jQuery('#dataSelector').val();
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
	  jQuery('#dataSelector').append(jQuery("<option value='" + event.worksheet.URL + "'>" + event.worksheet.title + "</option>")).val(event.worksheet.URL);
	  graphics = new Graphics(getWorksheet(), calcGraphWidth(), calcGraphHeight());
	  constructVis();
	});

	jQuery('#menu').change(function(event) {
	  constructVis();
	  event.stopPropagation();
	})

	jQuery('#editInGoogleDocs').click(function(event) {
	  var URL = jQuery('#dataSelector').val();
	  var matches = /feeds\/list\/([A-Z|a-z|0-9|_|-]+)/.exec(URL);
	  window.open('https://spreadsheets.google.com/ccc?key=' + matches[1]);
	  event.preventDefault();
	});

	jQuery('#menuOptions').change(function(event) {
	  constructVis();
	  //event.stopPropagation();
	});
	
	jQuery('#dataSelector').change(function(event) {
	  graphics = new Graphics(getWorksheet(), calcGraphWidth(), calcGraphHeight());
	  constructVis();
	});
	
	
	jQuery('#fitScalesToData').change(function(event) {
	  graphics.setXScale();
	  graphics.setYScale();
	  constructVis();
	});
	
});
