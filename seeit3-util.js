/*Drawing Related Functions*/
function getMMLineLabelAngle(graphics) {
	var angle = Math.atan(
						Math.abs(
							graphics.y(graphics.mmFarRightYVal) 
							- graphics.y(graphics.mmFarLeftYVal)
						) 
						/ Math.abs(
							graphics.x(graphics.xMax) 
							- graphics.x(graphics.xMin)
						)
					);

	if (graphics.mmSlope <= 0){
		return angle; 
	} else {
		return -angle;
	}	
}

function getLSLineLabelAngle(graphics) {
	var angle = Math.atan(
						Math.abs(
							graphics.y(graphics.lsFarRightYVal) 
							- graphics.y(graphics.lsFarLeftYVal)
						) 
						/ Math.abs(
							graphics.x(graphics.xMax) 
							- graphics.x(graphics.xMin)
						)
					);
					
	if (graphics.lsSlope <= 0){
		return angle;
	} else {
		return -angle;
	}	
}

function getXBuckets(graphics){
	var xDomain = graphics.x.domain();
	var bucketSize = xDomain[1]/graphics.buckets;
	var points = [];
	
	points.push(xDomain[0]);
	
	for (var i = 1; i <= graphics.buckets; i++){
		points.push(xDomain[0] + (bucketSize * i));
	}
	
	return points;
}

function getYBuckets(graphics){
	var yDomain = graphics.y.domain();
	var bucketSize = yDomain[1]/graphics.buckets;
	var points = [];
	
	points.push(yDomain[0]);
	
	for (var i = 1; i <= graphics.buckets; i++){
		points.push(yDomain[0] + (bucketSize * i));
	}
	
	return points;
}

function xDistributionPoints(graphics){
	var xDomain = graphics.x.domain();
	var bucketSize = xDomain[1]/graphics.buckets;
	var points = [];
	
	for (var i = 0; i < graphics.buckets; i++){
		var bucketMin = xDomain[0] + (bucketSize * i);
		var bucketMax = xDomain[0] + (bucketSize * (i+1));
		var pointsInBucket = [];
		
		for (var j = 0; j < graphics.data.length; j++){
			var dataPoint = graphics.data[j],
				xVal = parseFloat(dataPoint.incidence);
				
			if (xVal >= bucketMin 
				&& xVal < bucketMax)
			{
				pointsInBucket.push([graphics.x(xVal), 0]);
			}
		}
		
		for (var j = 0; j < pointsInBucket.length; j++){
			var comparePoint = pointsInBucket[j];
			for (k = (j-1); k > 0; k--){
				var otherPoint = pointsInBucket[k];
				if (Math.abs(comparePoint[0]-otherPoint[0]) < 10
					&& otherPoint[1] >= comparePoint[1])
				{
					comparePoint[1] = otherPoint[1] + 1;
				}
			}
			//comparePoint[1] = graphics.dotSize 
							  //+ comparePoint[1]*graphics.dotSize;
			points.push(comparePoint);
		}
	}
	
	return points;
}

function yDistributionPoints(graphics){
	var yDomain = graphics.y.domain();
	var bucketSize = yDomain[1]/graphics.buckets;
	var points = [];
	
	for (var i = 0; i < graphics.buckets; i++){
		var bucketMin = yDomain[0] + (bucketSize * i);
		var bucketMax = yDomain[0] + (bucketSize * (i+1));
		var pointsInBucket = [];
		
		for (var j = 0; j < graphics.data.length; j++){
			var dataPoint = graphics.data[j],
				yVal = parseFloat(dataPoint.otherFactor);
				
			if (yVal >= bucketMin 
				&& yVal < bucketMax)
			{
				pointsInBucket.push([0, graphics.y(yVal)]);
			}
		}
		
		for (var j = 0; j < pointsInBucket.length; j++){
			var comparePoint = pointsInBucket[j];
			for (k = (j-1); k > 0; k--){
				var otherPoint = pointsInBucket[k];
				if (Math.abs(comparePoint[1]-otherPoint[1]) < 10
					&& otherPoint[0] >= comparePoint[0])
				{
					comparePoint[0] = otherPoint[0] + 1;
				}
			}
			//comparePoint[1] = graphics.dotSize 
							  //+ comparePoint[1]*graphics.dotSize;
			points.push(comparePoint);
		}
	}
	
	return points;
	
}
/* Data Manipulation Functions */
function angleBtwnVec(vec1, vec2){
	return Math.acos(vec1.dot(vec2.x, vec2.y)
					/(vec1.length() * vec2.length()));
}

function determinantBtwnVec(vec1, vec2){
	return vec1.x*vec2.y - vec2.x*vec1.y;
}


function ellipseRadiusAtAngle(graphics, angle){
	var ellipseXRadius = graphics.xRadius,
		ellipseYRadius = graphics.yRadius,
		
		pointOnEllipse = [ ellipseXRadius * Math.cos(angle),
				ellipseYRadius * Math.sin(angle) ];
				
		return calcDistance(graphics.ellipseCX, graphics.ellipseCY
							, pointOnEllipse[0], pointOnEllipse[1]);
}

/* note: vectors originate from ellipse center */
function numPointsInEllipse(graphics){
	var count = 0;
	for (var i = 0; i < graphics.data.length; i++){
		var dataVec = pv.vector(graphics.data[i].incidence - graphics.ellipseCX
								,graphics.data[i].otherFactor - graphics.ellipseCY),
								
			rotAngleVec = pv.vector(Math.cos(graphics.angle), Math.sin(graphics.angle)).norm(),
			
			relAngle = angleBtwnVec(dataVec, rotAngleVec),
			
			ellipseR = ellipseRadiusAtAngle(graphics, relAngle);
			
		//console.log(relAngle + " " + ellipseR);
			
		if (ellipseR >= dataVec.length()){
			count++;
		}
	}
	
	//console.log(count);
	return count;
}



function getYOnLSByX(x, graphics){
	 var y = graphics.lsSlope * x + graphics.lsIntercept;
	 return y;
}


function getClosestPointOnLSLine(point, graphics){
	
	var x = parseFloat(point.incidence);
	var y = parseFloat(point.otherFactor);
	var pntOnLine = [(graphics.lsSlope*y + x
						- graphics.lsSlope*graphics.lsIntercept
					)
					/(Math.pow(graphics.lsSlope,2)+1),
					
					(Math.pow(graphics.lsSlope,2)*y 
						+ graphics.lsSlope*x
						+ graphics.lsIntercept
					)
					/(Math.pow(graphics.lsSlope,2)+1)]
					
	return pntOnLine;
}



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
