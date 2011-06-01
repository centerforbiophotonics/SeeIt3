	/* Contains variables required for graphics
	 * DO NOT MODIFY DIRECTLY */
	function Graphics(worksheet, width, height){
		var graphics = this;

		this.worksheet = worksheet;
		this.data = worksheet.data;

		this.w = width || 600;
		this.h = height || 300;
		this.xMax = pv.max(this.data, function(d) { return d.value });
		this.xMin = pv.min(this.data, function(d) { return d.value });
		this.x = pv.Scale.linear(0, Math.ceil(this.xMax)).range(0, this.w);
		this.y = pv.Scale.linear(0, Math.ceil(this.yMax)).range(0, this.h);
		this.colorScale = pv.Scale.linear(0, 1/4, 1/2, 3/4, 1).range("red", "blue", "green", "yellow", "black");
		this.c = jQuery.map(this.data, function() { return graphics.colorScale(Math.random()) });
		this.labelTextSize = "16";
		this.tickTextSize = "12";
			
		
		/* X/Y Distribution Variables */
		this.buckets = 40;
		this.bucketDotSize = 5;
		
		this.singleDistPoints = singleDistPoints(this);
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
	
	

	function getWorksheetByURL(URL) {
	  for (var h = 0; h < exampleSpreadsheets.length; h++) {
		for (var i = 0; i < exampleSpreadsheets[h].worksheets.length; i++) {
		  if (exampleSpreadsheets[h].worksheets[i].URL == URL){
			return exampleSpreadsheets[h].worksheets[i];
		  }
		}
	  }
	}

	function getWorksheet(){
	  var URL = jQuery('#workSheetSelector').val();
	  var worksheet = getWorksheetByURL(URL);
	  return worksheet;
	}
	

	var numWorksheets = 0;

	function Worksheet(param) {
	  if (typeof param == 'string'){
		this.URL = param;
		this.local = false;
		this.fetchWorksheetData();
	  } else {
		this.URL = param.feed.link[1].href + "***";
		this.local = true;
		this.fetchLocalData(param);
	  }
	}

	Worksheet.prototype = {
	  fetchWorksheetData: function() {
		var worksheet = this;
		jQuery.jsonp({ url:this.URL + '?alt=json', callbackParameter: "callback", 
		  success:function(feedData) {
			worksheet.data = worksheet.transformFeedData(feedData);
			worksheet.dataType1 = worksheet.getDataType1(feedData);
			worksheet.dataType2 = worksheet.getDataType2(feedData);
			worksheet.labelType = worksheet.getLabelType(feedData);        
			worksheet.title = feedData.feed.title.$t;
			jQuery('body').trigger({ type:'WorksheetLoaded', worksheet:worksheet });
		  },
		  error:function() {
			alert("Could not retrieve worksheet. Is it published?");
		  }
		});
	  },
	  
	  fetchLocalData: function(feedData) {
			var worksheet = this;
			worksheet.data = worksheet.transformFeedData(feedData);
			worksheet.dataType1 = worksheet.getDataType1(feedData);
			worksheet.dataType2 = worksheet.getDataType2(feedData);
			worksheet.labelType = worksheet.getLabelType(feedData);        
			worksheet.title = feedData.feed.title.$t;
			jQuery('body').trigger({ type:'WorksheetLoaded', worksheet:worksheet });
	  },
	  
	  getDataType1: function(feedData) {
		var titles = feedData.feed.entry[0].content.$t.split(",");
		return /\:\s+.+/.exec(titles[0])[0].replace(/\:\s+/, "");
	  },
	  
	  getDataType2: function(feedData) {
		var titles = feedData.feed.entry[0].content.$t.split(",");
		return /\:\s+.+/.exec(titles[2])[0].replace(/\:\s+/, "");
	  },
	  
	  getLabelType: function(feedData) {
		var titles = feedData.feed.entry[0].content.$t.split(",");
		return /\:\s+.+/.exec(titles[1])[0].replace(/\:\s+/, "");
	  },
	  
	  transformFeedData: function(feedData) {
		var data = [];
		//console.log(feedData);
		for (var i = 1; i < feedData.feed.entry.length; i++) {
			var cells = feedData.feed.entry[i].content.$t.split(',');
			var firstMatch = /\:\s+([\d|\.]+)/.exec(cells[0]);
			var secondMatch = /\:\s+([\d|\.]+)/.exec(cells[2]);
			if (!firstMatch || !secondMatch)
				; // ignore bad or blank data
			else{
				var one = 1;
				var two = 2;
				data.push({label: feedData.feed.entry[i].title.$t, value: firstMatch[1], set1: true});
				data.push({label: feedData.feed.entry[i].title.$t, value: secondMatch[1], set1: false})
			}
		}
		return data;
	  },
	};

	
	function Spreadsheet(key) {
	  this.worksheets = [];
	  if( typeof key == 'string'){
		this.key = key;
		this.fetchWorksheets();
		this.local = false;
	  } else {
		this.key == 'local'
		this.constructLocalWorksheets(key);
		this.local = true;
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
			this.worksheets.push(new Worksheet(local[i]));
		}
		numWorksheets += local.length;  
	  },
	  
	};
	
	var exampleSpreadsheets = [
	  new Spreadsheet('0AuGPdilGXQlBdHlYdkZ0a0tlZ1F4N1FQc2luOTNtZUE'),
	];

