/* Data Manipulation Functions */
	function getMean(data){
		var sum = 0;
		for (var i = 0; i < data.length; i++){
			sum += parseFloat(data[i]);
		}
		return sum/data.length;
	}
	
	function getSD(data){
		var mean = getMean(data);
		var deviations = [];
		for (var i = 0; i < data.length; i++){
			deviations.push(parseFloat(data[i]) - mean);
		}
		var sqrDeviations = [];
		for (var i = 0; i < deviations.length; i++){
			sqrDeviations.push(Math.pow(deviations[i],2));
		}
		var sum = 0;
		for (var i = 0; i < sqrDeviations.length; i++){
			sum += sqrDeviations[i];
		}
		
		return Math.sqrt(sum/(data.length - 1));
	}
	
	function getR(data){
		var sumXY = 0,
			sumX = 0,
			sumY = 0,
			sumXsqrd = 0,
			sumYsqrd = 0,
			n = data.length;
			
		for (var i = 0; i < data.length; i++){
			sumXY += parseFloat(data[i].incidence) * parseFloat(data[i].otherFactor);
			sumX += parseFloat(data[i].incidence);
			sumY += parseFloat(data[i].otherFactor);
			sumXsqrd += Math.pow(parseFloat(data[i].incidence), 2);
			sumYsqrd += Math.pow(parseFloat(data[i].otherFactor), 2);
		}
		
		var r = (sumXY - (sumX * sumY)/n)/Math.sqrt((sumXsqrd-Math.pow(sumX,2)/n)*(sumYsqrd-Math.pow(sumY,2)/n))
		return r;
	}
	
	function calcDistance(x1, y1, x2, y2) {
		return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2))
	}

	function parseSpreadsheetKeyFromURL(URL) {
	  var matches = /key\=([A-Z|a-z|0-9|_|-]+)/.exec(URL);
	  if (!matches)
		alert("That doesn't appear to be a valid URL");
	  else
		return matches[1];
	}
	
	function calcGraphWidth(){
		return window.innerWidth - 100;
	}
	
	function calcGraphHeight(){
		return (window.innerHeight - jQuery('div#notGraph').height()) - 155; 
	}

	function sortByXValues(data) {
	  data.sort(function(a, b) {
		return a.incidence - b.incidence;
	  });
	  return data;
	}

	function sortByYValues(data) {
	  data.sort(function(a, b) {
		return a.otherFactor - b.otherFactor;
	  });
	  return data;
	}

	/* Divides data into three groups, sorted by their X values */
	function divideDataInto3(data) {
	  sortByXValues(data);
	  
	  var modulo = data.length % 3,
		  delta = parseInt(data.length / 3);
	  var groups = [];
	  
	  if (data.length < 3) {
		alert("The data selected has less than three rows of data.  Please add more.")
		console.error('Data length must be greater than 3')
		return;
	  }

	  if (modulo == 0) {
		groups[0] = data.slice(0, delta);
		groups[1] = data.slice(delta, delta * 2);
		groups[2] = data.slice(delta * 2);
	  } else if (modulo == 1) {
		groups[0] = data.slice(0, delta);
		groups[1] = data.slice(delta, delta * 2 + 1);
		groups[2] = data.slice(delta * 2 + 1);
	  } else if (modulo == 2) {
		groups[0] = data.slice(0, delta + 1);
		groups[1] = data.slice(delta + 1, delta * 2 + 1);
		groups[2] = data.slice(delta * 2 + 1);
	  }
	  return groups;
	}

	/* Get the minX, maxX, minY, maxY to surround a data group */
	function getBounds(group) {
	  var minX = pv.min(group, function(d) { return d.incidence || 0 }); // or 0 in case falsy value in data
	  var maxX = pv.max(group, function(d) { return d.incidence || 0 });
	  var minY = pv.min(group, function(d) { return d.otherFactor || 0 });
	  var maxY = pv.max(group, function(d) { return d.otherFactor || 0 });
	  return { minX:minX, minY:minY, maxX:maxX, maxY:maxY };
	}

	function getBoundingCoords(minsAndMaxs) {
	  return [[minsAndMaxs.minX, minsAndMaxs.maxY],
			  [minsAndMaxs.maxX, minsAndMaxs.maxY],
			  [minsAndMaxs.maxX, minsAndMaxs.minY],
			  [minsAndMaxs.minX, minsAndMaxs.minY],
			  [minsAndMaxs.minX, minsAndMaxs.maxY]]; // repeated last line to close the square
	}

	function removeInvalidData(data) {
	  return jQuery.map(data, function(elem, index) {
		if (!elem.incidence || !elem.otherFactor || 
		  elem.incidence == "" || elem.otherFactor == "")
		  return null;
		else {
		  elem.incidence = parseFloat(elem.incidence);
		  elem.otherFactor = parseFloat(elem.otherFactor);
		  return elem;
		}
	  });
	}

	function medianXValue(dataSet) {
	  sortByXValues(dataSet);
	  if (dataSet.length % 2 == 0) {
		var middle1 = dataSet[Math.floor((dataSet.length / 2)) - 1]; // round up
		var middle2 = dataSet[Math.floor(dataSet.length / 2)]; // round down
		return (parseFloat(middle1.incidence) + parseFloat(middle2.incidence)) / 2;
	  } else {
		var middle = dataSet[parseInt(dataSet.length / 2)];
		return parseFloat(middle.incidence);
	  }
	}

	function medianYValue(dataSet) {
	  sortByYValues(dataSet);
	  if (dataSet.length % 2 == 0) {
		var middle1 = dataSet[Math.floor((dataSet.length / 2)) - 1]; // round up
		var middle2 = dataSet[Math.floor(dataSet.length / 2)]; // round down
		return (parseFloat(middle1.otherFactor) + parseFloat(middle2.otherFactor)) / 2;
	  } else {
		var middle = dataSet[parseInt(dataSet.length / 2)];
		return parseFloat(middle.otherFactor);
	  }
	}

	function getMedianValuesFrom(groups) {
	  var results = [];
	  for (var i = 0; i < groups.length; i++) {
		var medX = medianXValue(groups[i]);
		var medY = medianYValue(groups[i]);
		results.push([medX, medY]);
	  }
	  return results;
	}

	function findSlope(x1, x2, y1, y2) {
	  return (y1 - y2)/(x1 - x2);
	}

	function findIntercept(x, y, slope) {
	  return y - (slope * x);
	}

	function getYValue(x, slope, intercept) {
	  return slope * x + intercept;
	}

	function getXValue(y, slope, intercept) {
	  return (y - intercept) / slope;
	}
