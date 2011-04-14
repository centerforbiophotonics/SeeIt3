/*HTML Element Manipulation*/
function toggleNormalViewOptions(){
	if (jQuery('#checkboxNormalView').is(':checked')) { 
		$('#checkboxShowUserLine').removeAttr('disabled');
		$('#checkboxShowMMEllipse').removeAttr('disabled');
		$('#checkboxShowData').removeAttr('disabled');
		$('#fitScalesToData').removeAttr('disabled');
		
		$('#checkboxShowMMDots').removeAttr('disabled');
		$('#checkboxShowMMRects').removeAttr('disabled');
		$('#checkboxShowMMLine').removeAttr('disabled');
		$('#checkboxShowMMEqn').removeAttr('disabled');
		
		$('#checkboxShowLeastSquaresLine').removeAttr('disabled');
		$('#checkboxShowLeastSquaresSquares').removeAttr('disabled');
		$('#checkboxShowLeastSquaresEquation').removeAttr('disabled');
		$('#checkboxShowLeastSquaresRValue').removeAttr('disabled');
	} else {
		$('#checkboxShowUserLine').attr('disabled', true);
		$('#checkboxShowMMEllipse').attr('disabled', true);
		$('#checkboxShowData').attr('disabled', true);
		$('#fitScalesToData').attr('disabled', true);
		
		$('#checkboxShowMMDots').attr('disabled', true);
		$('#checkboxShowMMRects').attr('disabled', true);
		$('#checkboxShowMMLine').attr('disabled', true);
		$('#checkboxShowMMEqn').attr('disabled', true);
		
		$('#checkboxShowLeastSquaresLine').attr('disabled', true);
		$('#checkboxShowLeastSquaresSquares').attr('disabled', true);
		$('#checkboxShowLeastSquaresEquation').attr('disabled', true);
		$('#checkboxShowLeastSquaresRValue').attr('disabled', true);
	}
}

/*Drawing Related Functions*/
function getRotatedEllipseCoords(graphics) {
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


function getVertDistToLS (graphics, i){
	var dataX = parseFloat(graphics.data[i].incidence);
	var dataY = parseFloat(graphics.data[i].otherFactor);
	return Math.abs(dataY - getYOnLSByX(dataX, graphics));
}

function getRSquareBounds(graphics, i){

	var dataX = parseFloat(graphics.data[i].incidence);
	var dataY = parseFloat(graphics.data[i].otherFactor);
	var vertDistToLS = getVertDistToLS(graphics,i);
	
	var above = (dataY - getYOnLSByX(dataX, graphics)) >= 0;
	
	var dataXWindow = graphics.x(dataX);
	var dataYWindow = graphics.y(dataY);
	var vertDistToLSWindow = Math.abs(dataYWindow - graphics.y(getYOnLSByX(dataX, graphics)));
	
	var sqrBounds = [];
	
	if (graphics.lsSlope >=0){
		if (above){
			sqrBounds = [[dataXWindow, dataYWindow],
						[dataXWindow, dataYWindow - vertDistToLSWindow],
						[dataXWindow - vertDistToLSWindow, dataYWindow - vertDistToLSWindow],
						[dataXWindow - vertDistToLSWindow, dataYWindow],
						[dataXWindow, dataYWindow]];
		} else {
			sqrBounds = [[dataXWindow, dataYWindow],
						[dataXWindow, dataYWindow + vertDistToLSWindow],
						[dataXWindow + vertDistToLSWindow, dataYWindow + vertDistToLSWindow],
						[dataXWindow + vertDistToLSWindow, dataYWindow],
						[dataXWindow, dataYWindow]];
		}
	} else {
		if (above){
			sqrBounds = [[dataXWindow, dataYWindow],
						[dataXWindow, dataYWindow - vertDistToLSWindow],
						[dataXWindow + vertDistToLSWindow, dataYWindow - vertDistToLSWindow],
						[dataXWindow + vertDistToLSWindow, dataYWindow],
						[dataXWindow, dataYWindow]];
		} else {
			sqrBounds = [[dataXWindow, dataYWindow],
						[dataXWindow, dataYWindow + vertDistToLSWindow],
						[dataXWindow - vertDistToLSWindow, dataYWindow + vertDistToLSWindow],
						[dataXWindow - vertDistToLSWindow, dataYWindow],
						[dataXWindow, dataYWindow]]; 
		}			  
	} 
	return sqrBounds;
}



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

function getUserLineLabelAngle(graphics) {
	var angle = Math.atan(
						Math.abs(
							graphics.y(graphics.userDrawnLinePoints[1].y) 
							- graphics.y(graphics.userDrawnLinePoints[0].y)
						) 
						/ Math.abs(
							graphics.x(graphics.userDrawnLinePoints[1].x) 
							- graphics.x(graphics.userDrawnLinePoints[0].x)
						)
					);
					
	if (getUserLineSlope(graphics) <= 0){
		return angle;
	} else {
		return -angle;
	}	
}


function getXBuckets(graphics){
	var xDomain = graphics.x.domain();
	var bucketSize = (xDomain[1]-xDomain[0])/graphics.buckets;
	var points = [];
	
	points.push(xDomain[0]);
	
	for (var i = 1; i <= graphics.buckets; i++){
		points.push(xDomain[0] + (bucketSize * i));
	}
	
	return points;
}

function getYBuckets(graphics){
	var yDomain = graphics.y.domain();
	var bucketSize = (yDomain[1]-yDomain[0])/graphics.buckets;
	var points = [];
	
	points.push(yDomain[0]);
	
	for (var i = 1; i <= graphics.buckets; i++){
		points.push(yDomain[0] + (bucketSize * i));
	}
	
	return points;
}

function xDistributionPoints(graphics){
	var xDomain = graphics.x.domain();
	var bucketSize = (xDomain[1]-xDomain[0])/graphics.buckets;
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
		
		pointsInBucket = shuffle(pointsInBucket);
		
		for (var j = 0; j < pointsInBucket.length; j++){
			points.push([pointsInBucket[j][0], graphics.dotSize + j*2*graphics.dotSize]);
		}
	}
	
	return points;
}

function yDistributionPoints(graphics){
	var yDomain = graphics.y.domain();
	var bucketSize = (yDomain[1]-yDomain[0])/graphics.buckets;
	var points = [];
	
	for (var i = 0; i < graphics.buckets; i++){
		var bucketMin = yDomain[0] + (bucketSize * i);
		var bucketMax = yDomain[0] + (bucketSize * (i+1));
		var pointsInBucket = [];
		
		//finds data points in the bucket
		for (var j = 0; j < graphics.data.length; j++){
			var dataPoint = graphics.data[j],
				yVal = parseFloat(dataPoint.otherFactor);
				
			if (yVal >= bucketMin 
				&& yVal < bucketMax)
			{
				pointsInBucket.push([0, graphics.y(yVal)]);   //Converts to window coordinates here to simplify stacking computation
			}
		}
		
		pointsInBucket = shuffle(pointsInBucket);
		
		
		//Computes Stack height for each point in the bucket
		for (var j = 0; j < pointsInBucket.length; j++){
			points.push([graphics.dotSize + j*2*graphics.dotSize, pointsInBucket[j][1] ]);
			
		}
	}
	
	return points;
	
}
/* Data Manipulation Functions */

function shuffle(o){
	for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
};


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

function invertEllipseCoords(graphics, coords){
	var invertedCoords = [];
	for (var i = 0; i < coords.length; i++){
		invertedCoords.push([graphics.x.invert(coords[i][0])
								,graphics.y.invert(coords[i][1])]);
	}
	return invertedCoords;
}

function isPointBetweenTwoPoints(testPoint, refPoint1, refPoint2){
	var lineSlope = findSlope(refPoint1[0], refPoint2[0],
							  refPoint1[1], refPoint2[1]);						  
	var lineIntercept = findIntercept(refPoint1[0], refPoint1[1], lineSlope);
	
	var yValOfLineAtTestX = lineSlope * testPoint[0] + lineIntercept;
	
	var tolerance = 22;  //tolerance for considering a point on the line
	if (Math.abs(testPoint[1] - yValOfLineAtTestX) < tolerance){  
		if((testPoint[0] <= refPoint1[0] && testPoint[0] >= refPoint2[0]
				|| testPoint[0] >= refPoint1[0] && testPoint[0] <= refPoint2[0])
			&& (testPoint[1] <= refPoint1[1] && testPoint[1] >= refPoint2[1]
				|| testPoint[1] >= refPoint1[1] && testPoint[1] <= refPoint2[1])){
					
					return true;
		} else return false;
	}
}


function numPointsInEllipse(graphics){
	var tolerance = 10;
	var count = 0;
	var ellipsePoints = getRotatedEllipseCoords(graphics);
	for (var i = 0; i < graphics.data.length; i++){
		var dataPoint = [graphics.x(parseFloat(graphics.data[i].incidence))
						 ,graphics.y(parseFloat(graphics.data[i].otherFactor))];
		var left = right = above = below = false; 
		for (var j = 0; j < ellipsePoints.length; j++){
			if (dataPoint[0] <= ellipsePoints[j][0]  && Math.abs(dataPoint[1] - ellipsePoints[j][1]) < tolerance){
				right = true;
			}
			if (dataPoint[0] >= ellipsePoints[j][0]  && Math.abs(dataPoint[1] - ellipsePoints[j][1]) < tolerance){
				left = true;
			}
			if (dataPoint[1] <= ellipsePoints[j][1]  && Math.abs(dataPoint[0] - ellipsePoints[j][0]) < tolerance){
				above = true;
			}
			if (dataPoint[1] >= ellipsePoints[j][1]  && Math.abs(dataPoint[0] - ellipsePoints[j][0]) < tolerance){
				below = true;
			}
		}
		
		if (right && left && below && above) count++;
	}
	
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

function getUserLineR(graphics){
	var r = 0;
	for (var i = 0; i < graphics.data.length; i++)
		r += Math.pow(getVertDistToUserLine(graphics, i), 2);
	
	return r;
}

function getYOnUserLineByX(x, graphics){
	 var y = getUserLineSlope(graphics) * x + getUserLineIntercept(graphics);
	 return y;
}

function getVertDistToUserLine(graphics, i){
	var dataX = parseFloat(graphics.data[i].incidence);
	var dataY = parseFloat(graphics.data[i].otherFactor);
	return Math.abs(dataY - getYOnUserLineByX(dataX, graphics));
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

function getUserLineSlope(graphics){
	return findSlope(graphics.userDrawnLinePoints[0].x
			 ,graphics.userDrawnLinePoints[1].x
			 ,graphics.userDrawnLinePoints[0].y
			 ,graphics.userDrawnLinePoints[1].y);
}

function getUserLineIntercept(graphics){
	return findIntercept(graphics.userDrawnLinePoints[0].x
						,graphics.userDrawnLinePoints[0].y
						,getUserLineSlope(graphics));
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

function positionAxisMinMaxWidgets() {
  $('#xMin input,#xMax input,#yMin input,#yMax input').css('width', '40px');
  $('#yMin').css('position', 'absolute').css('bottom', '70px').css('left', '22px');
  $('#yMax').css('position', 'absolute').css('top', '227px').css('left', '22px');
  $('#xMin').css('position', 'absolute').css('bottom', '50px').css('left', '68px');
  $('#xMax').css('position', 'absolute').css('bottom', '50px').css('right', '20px')
}
