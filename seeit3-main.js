jQuery('p#loadingMsg').show();

$(document).ready(function(){
	jQuery('p#loadingMsg').hide();	
	var vis = {}

	function constructVis(worksheet, width, height) {
	  
	  var data = worksheet.data;

	  var w = width || 600,
		  h = height || 300,
		  
		  
		  xMax = pv.max(data, function(d) { return d.incidence }),
		  yMax = pv.max(data, function(d) { return d.otherFactor }),
		  xMin = pv.min(data, function(d) { return d.incidence }),
		  yMin = pv.min(data, function(d) { return d.otherFactor }),
		  x = pv.Scale.linear(0, Math.ceil(xMax)).range(0, w),
		  y = pv.Scale.linear(0, Math.ceil(yMax)).range(0, h),
		  colorScale = pv.Scale.linear(0, 1/4, 1/2, 3/4, 1).range("red", "blue", "green", "yellow", "black")
		  c = jQuery.map(data, function() { return colorScale(Math.random()) });

	  if (jQuery('#fitScalesToData').is(':checked')) {
		x = pv.Scale.linear(Math.floor(xMin), Math.ceil(xMax)).range(0, w);
		y = pv.Scale.linear(Math.floor(yMin), Math.ceil(yMax)).range(0, h);
	  }

	  var userDrawnLinePoints = [{ x:w * 0.2, y:h / 2 }, 
								 { x:w * 0.8, y:h / 2 }];

	  vis = new pv.Panel()
			  .width(w)
			  .height(h)
			  .bottom(60)
			  .left(60)
			  .right(20)
			  .top(60)
			  .events("all");
	  
	  /*Graph Title*/		  
	  vis.add(pv.Label)
		.left(w / 2)
		.top(-40)
		.textAlign("center")
		.textAngle(0)
		.text(worksheet.title)
		.font("bold 20px sans-serif");

	  /* Y-axis label */		  
	  vis.add(pv.Label)
		.data(worksheet.yAxisTitle)
		.left(-40)
		.top(h / 2)
		.textAlign("center")
		.textAngle(-Math.PI / 2)
		.font("bold 14px sans-serif");

	  /* Y-axis ticks */
	  vis.add(pv.Rule)
		 .data(function() { return y.ticks() })
		 .bottom(y)
		 .strokeStyle(function(d) { return Math.floor(d) ? "#eee" : "#000" })
		 .anchor('left').add(pv.Label)
		   .text(x.tickFormat);

	  /* X-axis ticks */
	  vis.add(pv.Rule)
		 .data(function() { return x.ticks() })
		 .left(x)
		 .strokeStyle(function(d) { return Math.floor(d) ? "#eee" : "#000" })
		 .anchor("bottom").add(pv.Label)
		   .text(x.tickFormat);
		   
	  /* X-axis label */
	  vis.add(pv.Label)
		.data(worksheet.xAxisTitle)
		.left(w / 2)
		.bottom(-40)
		.textAlign("center")
		.textAngle(0)
		.font("bold 14px sans-serif");
		 
	   
	  /* median median crosses and squares */
	  var groups = divideDataInto3(data);
	  var medians = getMedianValuesFrom(groups);

	  for (var i = 0; i < groups.length; i++) {
		 var bounds = getBounds(groups[i]);
		 var coords = getBoundingCoords(bounds);

		 /* rectangle around median group */
		 vis.add(pv.Line)
			.visible(function() { return jQuery('#checkboxShowMMRects').is(':checked') })
			.data(coords)
			.left(function(d) { return x(d[0]) })
			.bottom(function(d) { return y(d[1]) })
			.lineWidth(0.5)
			.fillStyle(pv.rgb(255,165,0,0.05));

		 /* median cross */
		 vis.add(pv.Dot)
			.visible(function() { return jQuery('#checkboxShowMMDots').is(':checked') })
			.data([medians[i]]) // extra brackets so not to use x and y as seperate points
			.left(function(d) { return x(d[0]) })
			.bottom(function(d) { return y(d[1]) })
			.radius(10)
			.angle(Math.PI / 4)
			.shape('cross')
			.fillStyle(pv.rgb(255,165,0,1))
			.title("Median dot");
	  }


	  /* media-median line:
		   Is middle median dot higher or lower than line through outer median dots? 
		   That is, middle median dot's y value - y value at same x of original median line 
		   divided by three */
	  var slope = findSlope(medians[0][0], medians[2][0], medians[0][1], medians[2][1]);
	  var intercept = findIntercept(medians[0][0], medians[0][1], slope);
	  var medianYDelta = ((medians[1][1] - getYValue(medians[1][0], slope, intercept)) / 3);
	  var adjustedIntercept = intercept + medianYDelta;
	  var farLeftYVal = getYValue(xMin, slope, adjustedIntercept);
	  var farRightYVal = getYValue(xMax, slope, adjustedIntercept);

	  vis.add(pv.Line)
		 .visible(function() { return jQuery('#checkboxShowMMLine').is(':checked') })
		 .data([[xMin, farLeftYVal], [xMax, farRightYVal]])
		 .left(function(d) { return x(d[0]) })
		 .bottom(function(d) { return y(d[1]) })
		 .title("Median-median line");


	  /* dot plot */
	  vis.add(pv.Dot)
		 .data(data)
		 .visible(function() { return jQuery('#checkboxShowData').is(':checked') })
		 .event("point", function() { return this.active(this.index).parent })
		 .event("unpoint", function() { return this.active(-1).parent })
		 .left(function(d) { return x(d.incidence) })
		 .bottom(function(d) { return y(d.otherFactor) })
		 .radius(function() { return 3 / this.scale })
		 .fillStyle("#eee")
		 .strokeStyle(function(d) { return c[this.index] })
		 .title(function(d) { return d.state + ": " + d.incidence + ", " + d.otherFactor })
		 .def('active', -1)
		 .event("point", function() { return this.active(this.index).parent })
		 .event("unpoint", function() { return this.active(-1).parent });
		 
		 
	  /* user drawn line */
	  vis.add(pv.Line)
		 .data(userDrawnLinePoints)
		 .left(function(d) { return d.x })
		 .top(function(d) { return d.y })
		 .visible(function() { return jQuery('#checkboxShowUserLine').is(':checked') })
		 .add(pv.Dot)
			.fillStyle("blue")
			.shape('square')
			.event("mousedown", pv.Behavior.drag())
			.event("drag", vis)
			
	  

	  /* user ellipse */
	  jQuery('#sliderEllipseRotation').slider({ 
		orientation:'vertical', min:0, max:Math.PI, value:0, step:0.01,
		slide:function(event, ui) { vis.render(); }
	  });

	  jQuery('div#sliderEllipseXRadius').slider({
		orientation:'vertical', min:5, max:w / 2, value:w / 4,
		slide:function(event, ui) { vis.render(); }
	  });
	  
	  jQuery('div#sliderEllipseYRadius').slider({
		orientation:'vertical', min:5, max:w / 2, value:w / 4,
		slide:function(event, ui) { vis.render(); }
	  });
	  
	  var fullRot = pv.range(0, 2 * Math.PI, 0.01);
	  var ellipseCX = x((xMin + xMax) / 2);
	  var ellipseCY = y((yMin + yMax) / 2);
		   
	  
	  function getRotatedEllipseCoords() {
		var ellipseXRadius = jQuery('#sliderEllipseXRadius').slider('value');
		var ellipseYRadius = jQuery('#sliderEllipseYRadius').slider('value');
		
		var coords = [];
		for (i = 0; i < fullRot.length; i++) {
		  coords.push([ ellipseXRadius * Math.cos(fullRot[i]),
						ellipseYRadius * Math.sin(fullRot[i]) ]);
		}
		var angle = jQuery('#sliderEllipseRotation').slider('value');
		
		for (var i = 0; i < coords.length; i++) {
		  coords[i] = ([ coords[i][0] * Math.cos(angle) - coords[i][1] * Math.sin(angle) + ellipseCX,
						 coords[i][0] * Math.sin(angle) + coords[i][1] * Math.cos(angle) + ellipseCY ]);
		}
		return coords;
	  }
	  
	  vis.add(pv.Line)
		 .visible(function() { return jQuery('#checkboxShowMMEllipse').is(':checked') })
		 .data(getRotatedEllipseCoords)
		 .left(function(i) { return i[0] })
		 .bottom(function(i) { return i[1] });
		 
	  vis.render();
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
		$('span').remove();
		constructVis(getWorksheet(), calcGraphWidth(), calcGraphHeight());
	})

	/* populate dataset drop down menu */
	jQuery('body').bind('WorksheetLoaded', function(event) {
	  jQuery('#dataSelector').append(jQuery("<option value='" + event.worksheet.URL + "'>" + event.worksheet.title + "</option>")).val(event.worksheet.URL);
	  jQuery('span').remove();
	  constructVis(getWorksheet(), calcGraphWidth(), calcGraphHeight());
	});

	jQuery('#menu').change(function(event) {
	  jQuery('span').remove();
	  constructVis(getWorksheet(), calcGraphWidth(), calcGraphHeight());
	  event.stopPropagation();
	})

	jQuery('#editInGoogleDocs').click(function(event) {
	  var URL = jQuery('#dataSelector').val();
	  var matches = /feeds\/list\/([A-Z|a-z|0-9|_|-]+)/.exec(URL);
	  window.open('https://spreadsheets.google.com/ccc?key=' + matches[1]);
	  event.preventDefault();
	});

	jQuery('#menuOptions').change(function(event) {
	  vis.render();
	  jQuery('span').remove();
	  constructVis(getWorksheet(), calcGraphWidth(), calcGraphHeight());
	  event.stopPropagation();
	});

	
	toggleEllipseSliders(); // in case the page loads with the ellipse checkbox checked
	jQuery('#checkboxShowMMEllipse').change(toggleEllipseSliders);
});
