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
		this.c = jQuery.map(this.data, function() { return graphics.colorScale(Math.random()) }),
		this.normViewDotSize = 3,
		this.normViewAxisDivisions = 20;
			
		/* Variables defined in normalized coordinates */						 
		/* median median crosses and squares */
		this.groups = divideDataInto3(this.data);
		this.medians = getMedianValuesFrom(this.groups);
		
		/* median-median line */ 
		this.mmSlope = findSlope(this.medians[0][0], this.medians[2][0], this.medians[0][1], this.medians[2][1]); 
		this.mmIntercept = findIntercept(this.medians[0][0], this.medians[0][1], this.mmSlope);
		this.medianYDelta = ((this.medians[1][1] - getYValue(this.medians[1][0], this.mmSlope, this.mmIntercept)) / 3); 
		this.adjustedIntercept = this.mmIntercept + this.medianYDelta; 
		this.mmFarLeftYVal = getYValue(this.xMin, this.mmSlope, this.adjustedIntercept); 
		this.mmFarRightYVal = getYValue(this.xMax, this.mmSlope, this.adjustedIntercept);
		
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
		
		/* User Drawn Line*/
		this.userDrawnLinePoints = [{ x:this.xMin, y:this.yMin + (this.yMax - this.yMin)/2 }, 
								 { x:this.xMax, y:this.yMin + (this.yMax - this.yMin)/2 }];
								 
		/* User Ellipse */
		this.angle = 0;
		this.xRadius = this.w/4;
		this.yRadius = this.h/4;
		this.fullRot = pv.range(0, 2 * Math.PI, 0.01);
		this.ellipseCX = this.w/2;
		this.ellipseCY = this.h/2;
		this.pointsInEllipse = numPointsInEllipse(this);
		
		/* X/Y Distribution Variables */
		this.buckets = 40;
		this.bucketDotSize = 10;
	}
	
	Graphics.prototype = {
		setW: function(wVal){		
			var oldW = this.w;
			this.w = wVal;
			this.setXScale();
		},
		
		setH: function(hVal){
			var oldH = this.h;
			this.h = hVal;
			this.setYScale();
		},
		
		setXScale: function(min, max){
			var newMin = min || 0;
			var newMax = max || Math.ceil(this.xMax);
			
			if (jQuery('#fitScalesToData').is(':checked')) {
				this.x = pv.Scale.linear(Math.floor(this.xMin), Math.ceil(this.xMax)).range(0, this.w);	
			}else{			
				this.x = pv.Scale.linear(newMin, newMax).range(0, this.w);
			}
		},
		
		setYScale: function(min, max){
			var newMin = min || 0;
			var newMax = max || Math.ceil(this.yMax);
			
			if (jQuery('#fitScalesToData').is(':checked')) {
				this.y = pv.Scale.linear(Math.floor(this.yMin), Math.ceil(this.yMax)).range(0, this.h);	
			}else{
				this.y = pv.Scale.linear(newMin, newMax).range(0, this.h);
			}			
		},
	}
	
	var numWorksheets = 0;
	
	function Spreadsheet(key) {
	  this.worksheets = [];
	  if( typeof key == 'string'){
		this.key = key;
		this.fetchWorksheets();
	  } else {
		this.constructLocalWorksheets(key);
	  }
	}

	Spreadsheet.prototype = {
	  getWorksheetURLs: function(callback) {
		var spreadsheet = this;
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
		  numWorksheets += feedData.feed.entry.length;
		});
	  },
	  
	  constructLocalWorksheets: function(local) {
		for (var i = 0; i < local.length; i++){
			this.worksheets.push(new Worksheet(localData[i]));
		}
		numWorksheets += local.length;  
	  },
	  
	};
	
	var exampleSpreadsheets = [
	  new Spreadsheet('0AlqUG_LhxDPZdGk0ODFNcmxXV243dThtV2RvQTZTeGc'),
	  new Spreadsheet(localData),
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

	function Worksheet(worksheet) {
	  if (typeof worksheet == 'string'){
		this.URL = worksheet;
		this.fetchWorksheetData();
	  } else {
		this.parseLocalData(worksheet);
	  }
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
	  
	  parseLocalData: function(feedData) {
			var worksheet = this;
			worksheet.data = worksheet.transformFeedData(feedData);
			worksheet.xAxisTitle = worksheet.getXAxisTitle(feedData);
			worksheet.yAxisTitle = worksheet.getYAxisTitle(feedData);        
			worksheet.title = feedData.feed.title.$t;
			jQuery('body').trigger({ type:'WorksheetLoaded', worksheet:worksheet });
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
