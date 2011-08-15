/*HTML Element Manipulation*/
function toggleNormalViewOptions(){
	if (jQuery('#checkboxNormalView').is(':checked')) { 
		$('#checkboxShowUserLine').removeAttr('disabled');
		$('#checkboxShowMMEllipse').removeAttr('disabled');
		$('#checkboxShowData').removeAttr('disabled');
		
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
function getUserLineMidpoint(graph){
	return [{x: (graph.userDrawnLinePoints[0].x + graph.userDrawnLinePoints[1].x)/2,
			y: (graph.userDrawnLinePoints[0].y + graph.userDrawnLinePoints[1].y)/2}];
	
}

function getRotatedEllipseCoords(graph) {
	var ellipseXRadius = graph.xRadius;
	var ellipseYRadius = graph.yRadius;
	
	var coords = [];
	for (i = 0; i < graph.fullRot.length; i++) {
	  coords.push([ ellipseXRadius * Math.cos(graph.fullRot[i]),
					ellipseYRadius * Math.sin(graph.fullRot[i]) ]);
	}
	
	for (var i = 0; i < coords.length; i++) {
	  coords[i] = ([ coords[i][0] * Math.cos(graph.angle) - coords[i][1] * Math.sin(graph.angle) + graph.ellipseCX,
					 coords[i][0] * Math.sin(graph.angle) + coords[i][1] * Math.cos(graph.angle) + graph.ellipseCY ]);
	}
	return coords;
}

function pointFillStyle(label){
	if (jQuery('#checkboxFillDots').is(':checked')){
		if (jQuery('#checkboxBWView').is(':checked')){
			var color = graphCollection.labelColors[label];
			//var greyVal = parseInt((0.21 * color.r  + 0.71 * color.g + 0.07 * color.b)/3);  //luminosity
			//var greyVal = parseInt((color.r  + color.g + color.b)/3);												//average
			var greyVal = parseInt((Math.max(color.r, color.g, color.b) + Math.min(color.r,color.g,color.b))/2)  //lightness
			return pv.rgb(greyVal, greyVal, greyVal, 1);
		}else{ 
			return graphCollection.labelColors[label]
		}
	}else{
		return "white";
	}
}

function pointStrokeStyle(label){
	if (jQuery('#checkboxFillDots').is(':checked')){
		return "black";
	} else {
		if (jQuery('#checkboxBWView').is(':checked')){
			var color = graphCollection.labelColors[label];
			//var greyVal = parseInt((0.21 * color.r  + 0.71 * color.g + 0.07 * color.b)/3);  //luminosity
			//var greyVal = parseInt((color.r  + color.g + color.b)/3);												//average
			var greyVal = parseInt((Math.max(color.r, color.g, color.b) + Math.min(color.r,color.g,color.b))/2)  //lightness
			return pv.rgb(greyVal, greyVal, greyVal, 1);
		} else { 
			return graphCollection.labelColors[label]
		}
	}
}


function getVertDistToLS (graph, i){
	var dataX = parseFloat(graph.getData()[i].x);
	var dataY = parseFloat(graph.getData()[i].y);
	return Math.abs(dataY - getYOnLSByX(dataX, graph));
}

function getRSquares(graph){
	var squares = [];
	for (var i=0; i < graph.getData().length; i++){
		var sqrBounds = getRSquareBounds(graph, i);   
		
		var left = Math.min(sqrBounds[0][0],sqrBounds[2][0]);
		var bottom = Math.min(sqrBounds[0][1],sqrBounds[2][1]);
		var size = Math.abs(sqrBounds[0][0] - sqrBounds[2][0]);
		
		squares.push({"left": left,
									"bottom":bottom,
									"size":size});
  }
  return squares;
}

function getUDSquares(graph){
	var max = Math.max(graph.userDrawnLinePoints[1].x, graph.userDrawnLinePoints[0].x)
	var right, left;
	
	if (max == graph.userDrawnLinePoints[1].x){
		right = 1;
		left = 0;
	} else {
		right = 0;
		left = 1;
	}
	
	var m = (graph.userDrawnLinePoints[right].y-graph.userDrawnLinePoints[left].y)/
				  (graph.userDrawnLinePoints[right].x-graph.userDrawnLinePoints[left].x);
				  
	var b = graph.userDrawnLinePoints[1].y - m*(graph.userDrawnLinePoints[1].x);
	
	var squares = [];
	(graph.getData()).forEach(function(d){
		if (d.x >= graph.userDrawnLinePoints[left ? 1:0].x &&
				d.x <= graph.userDrawnLinePoints[right ? 1:0].x){
			var size = Math.abs(graph.y(d.y) - graph.y((m*d.x+b)));
			var left, bottom;
			if (d.y - (m*d.x+b) >= 0){
				if (m >= 0){
					left = graph.x(d.x) - size;
					bottom = graph.y(d.y) - size;
				} else{
					left = graph.x(d.x);
					bottom = graph.y(d.y) - size;
				}
			} else {
				if (m >= 0){
					left = graph.x(d.x);
					bottom = graph.y(d.y);
				} else{
					left = graph.x(d.x) - size;
					bottom = graph.y(d.y);
				}
			}
			squares.push({"left": left,
										"bottom":bottom,
										"size":size});
		}
  });
  return squares;
}

function getRSquareBounds(graph, i){

	var dataX = parseFloat(graph.getData()[i].x);
	var dataY = parseFloat(graph.getData()[i].y);
	var vertDistToLS = getVertDistToLS(graph,i);
	
	var above = (dataY - getYOnLSByX(dataX, graph)) >= 0;
	
	var dataXWindow = graph.x(dataX);
	var dataYWindow = graph.y(dataY);
	var vertDistToLSWindow = Math.abs(dataYWindow - graph.y(getYOnLSByX(dataX, graph)));
	
	var sqrBounds = [];
	
	if (graph.lsSlope >=0){
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



function getMMLineLabelAngle(graph) {
	var angle = Math.atan(
						Math.abs(
							graph.y(graph.mmFarRightYVal) 
							- graph.y(graph.mmFarLeftYVal)
						) 
						/ Math.abs(
							graph.x(graph.xMax) 
							- graph.x(graph.xMin)
						)
					);

	if (graph.mmSlope <= 0){
		return angle; 
	} else {
		return -angle;
	}	
}

function getLSLineLabelAngle(graph) {
	var angle = Math.atan(
						Math.abs(
							graph.y(graph.lsFarRightYVal) 
							- graph.y(graph.lsFarLeftYVal)
						) 
						/ Math.abs(
							graph.x(graph.xMax) 
							- graph.x(graph.xMin)
						)
					);
					
	if (graph.lsSlope <= 0){
		return angle;
	} else {
		return -angle;
	}	
}

function getUserLineLabelAngle(graph) {
	var angle = Math.atan(
						Math.abs(
							graph.y(graph.userDrawnLinePoints[1].y) 
							- graph.y(graph.userDrawnLinePoints[0].y)
						) 
						/ Math.abs(
							graph.x(graph.userDrawnLinePoints[1].x) 
							- graph.x(graph.userDrawnLinePoints[0].x)
						)
					);
					
	if (getUserLineSlope(graph) <= 0){
		return angle;
	} else {
		return -angle;
	}	
}


function getXBuckets(graph){
	var xDomain = graph.x.domain();
	var bucketSize = (xDomain[1]-xDomain[0])/graph.graphCollection.buckets;
	var points = [];
	
	points.push(xDomain[0]);
	
	for (var i = 1; i <= graph.graphCollection.buckets; i++){
		points.push(xDomain[0] + (bucketSize * i));
	}
	
	return points;
}

function getYBuckets(graph){
	var yDomain = graph.y.domain();
	var bucketSize = (yDomain[1]-yDomain[0])/graph.graphCollection.buckets;
	var points = [];
	
	points.push(yDomain[0]);
	
	for (var i = 1; i <= graph.graphCollection.buckets; i++){
		points.push(yDomain[0] + (bucketSize * i));
	}
	
	return points;
}
/*
function xDistributionPoints(graph, data){
	var xDomain = graph.x.domain();
	var bucketSize = (xDomain[1]-xDomain[0])/graph.graphCollection.buckets;
	var points = [];
	var drawMode = jQuery("#drawMode option:selected").val();
	
	for (var i = 0; i < graph.graphCollection.buckets; i++){
		var bucketMin = xDomain[0] + (bucketSize * i);
		var bucketMax = xDomain[0] + (bucketSize * (i+1));
		var pointsInBucket = [];
		
		for (var j = 0; j < data.length; j++){
			var dataPoint = data[j],
				xVal = parseFloat(dataPoint.value),
				label = data[j].label;
				
			if (xVal >= bucketMin 
				&& xVal < bucketMax)
			{
				pointsInBucket.push([xVal, 0, label]);
			}
		}
		
		pointsInBucket = shuffle(pointsInBucket);
		
		switch (drawMode)
		{
		case "floating":
			for (var j = 0; j < pointsInBucket.length; j++){
				points.push({"x":pointsInBucket[j][0],
										 "xReal":pointsInBucket[j][0],
										 "y":graph.graphCollection.dotSize + j*2*graph.graphCollection.dotSize,
										 "label":pointsInBucket[j][1],
										 "set":pointsInBucket[j][2]
									 });
			}
			break;
		case "center":
			for (var j = 0; j < pointsInBucket.length; j++){
				points.push({"x":(graph.x(bucketMin)+graph.x(bucketMax))/2,
										 "xReal":pointsInBucket[j][0],
										 "y":graph.graphCollection.dotSize + j*2*graph.graphCollection.dotSize,
										 "label":pointsInBucket[j][1],
										 "set":pointsInBucket[j][2]
									 });
			}
			break;
		case "gravity":
			if ( i == 0 ) {
				for (var j = 0; j < pointsInBucket.length; j++){
					var candidatePoint = {
						"x":pointsInBucket[j][0],
						"xReal":pointsInBucket[j][0],
						"y":graphCollection.dotSize,
						"label":pointsInBucket[j][1],
						"set":pointsInBucket[j][2]
						};
						
					var collisionPoints = [];
					for (var k = 0; k < points.length; k++){
						if (Math.abs(points[k].x-candidatePoint.x) < graphCollection.dotSize*2) {
							collisionPoints.push(points[k]);
						}
					}
					
					if (collisionPoints.length > 0)
						candidatePoint.y = fitPointInGraph(candidatePoint, collisionPoints, graphCollection.dotSize);
					
					points.push(candidatePoint);
				}
			}
			
			break;
		}
	}
	return points;
		
		//for (var j = 0; j < pointsInBucket.length; j++){
		//	points.push([pointsInBucket[j][0], graph.graphCollection.dotSize + j*2*graph.graphCollection.dotSize, pointsInBucket[j][2]]);
		//}
	//}
	
	//return points;
}
*/

function xDistributionPoints(graph, data, scale){
	var xDomain = graph.x.domain();
	var bucketSize = (xDomain[1]-xDomain[0])/graph.graphCollection.buckets;
	var points = [];
	//var data = graph.dataObjects();
	var drawMode = jQuery("#drawMode option:selected").val();
	
	for (var i = 0; i < graph.graphCollection.buckets; i++){
		var bucketMin = xDomain[0] + (bucketSize * i);
		var bucketMax = xDomain[0] + (bucketSize * (i+1));
		var pointsInBucket = [];
		
		for (var j = 0; j < data.length; j++){
			var dataObj = data[j],
				xVal = scale(dataObj.value),
				label = dataObj.label;
				//set = dataObj.set;
				
			if ((xVal >= scale(bucketMin) && xVal < scale(bucketMax)) 
					|| drawMode == "gravity")
			{
				pointsInBucket.push([xVal, label, 0]);
			}
		}
		randomIndex = 20;
		pointsInBucket = shuffle(pointsInBucket);
		
		switch (drawMode)
		{
		case "floating":
			for (var j = 0; j < pointsInBucket.length; j++){
				points.push({"x":pointsInBucket[j][0],
										 "xReal":pointsInBucket[j][0],
										 "y":graph.graphCollection.dotSize + j*2*graph.graphCollection.dotSize,
										 "label":pointsInBucket[j][1],
										 //"set":pointsInBucket[j][2]
									 });
			}
			break;
		case "center":
			for (var j = 0; j < pointsInBucket.length; j++){
				points.push({"x":(scale(bucketMin)+scale(bucketMax))/2,
										 "xReal":pointsInBucket[j][0],
										 "y":graphCollection.dotSize + j*2*graph.graphCollection.dotSize,
										 "label":pointsInBucket[j][1],
										 //"set":pointsInBucket[j][2]
									 });
			}
			break;
		case "gravity":
			if ( i == 0 ) {
				for (var j = 0; j < pointsInBucket.length; j++){
					var candidatePoint = {
						"x":pointsInBucket[j][0],
						"xReal":pointsInBucket[j][0],
						"y":graphCollection.dotSize,
						"label":pointsInBucket[j][1],
						//"set":pointsInBucket[j][2]
						};
						
					var collisionPoints = [];
					for (var k = 0; k < points.length; k++){
						if (Math.abs(points[k].x-candidatePoint.x) < graphCollection.dotSize*2) {
							collisionPoints.push(points[k]);
						}
					}
					
					if (collisionPoints.length > 0)
						candidatePoint.y = fitPointInGraph(candidatePoint, collisionPoints, graphCollection.dotSize);
					
					points.push(candidatePoint);
				}
			}
			
			break;
		}
	}
	return points;
	
}

function fitPointInGraph(candidate, collisions, radius){
	var collides = false;
	for (var i = 0; i < collisions.length; i++){
		var dist = Math.sqrt(Math.pow(candidate.x-collisions[i].x,2) +
												 Math.pow(candidate.y-collisions[i].y,2))
		if (dist < radius*2)
			collides = true;			
	}
	while (collides){
		candidate.y++;
		collides = false;
		for (var i = 0; i < collisions.length; i++){
			var dist = Math.sqrt(Math.pow(candidate.x-collisions[i].x,2) +
													 Math.pow(candidate.y-collisions[i].y,2))
			if (dist < radius*2)
				collides = true;			
		}
	}
	
	return candidate.y
}

function fitPointInYGraph(candidate, collisions, radius){
	var collides = false;
	for (var i = 0; i < collisions.length; i++){
		var dist = Math.sqrt(Math.pow(candidate.x-collisions[i].x,2) +
												 Math.pow(candidate.y-collisions[i].y,2))
		if (dist < radius*2)
			collides = true;			
	}
	while (collides){
		candidate.x++;
		collides = false;
		for (var i = 0; i < collisions.length; i++){
			var dist = Math.sqrt(Math.pow(candidate.x-collisions[i].x,2) +
													 Math.pow(candidate.y-collisions[i].y,2))
			if (dist < radius*2)
				collides = true;			
		}
	}
	
	return candidate.x
}

/*
function yDistributionPoints(graph){
	var yDomain = graph.y.domain();
	var bucketSize = (yDomain[1]-yDomain[0])/graph.graphCollection.buckets;
	var points = [];
	
	for (var i = 0; i < graph.graphCollection.buckets; i++){
		var bucketMin = yDomain[0] + (bucketSize * i);
		var bucketMax = yDomain[0] + (bucketSize * (i+1));
		var pointsInBucket = [];
		
		//finds data points in the bucket
		for (var j = 0; j < graph.worksheet.data[graph.yData].length; j++){
			var dataPoint = graph.worksheet.data[graph.yData][j],
				yVal = parseFloat(dataPoint.value),
				label = graph.worksheet.data[graph.yData][j].label;
				
			if (yVal >= bucketMin 
				&& yVal < bucketMax)
			{
				pointsInBucket.push([0, graph.y(yVal), label]);   //Converts to window coordinates here to simplify stacking computation
			}
		}
		
		pointsInBucket = shuffle(pointsInBucket);
		
		
		//Computes Stack height for each point in the bucket
		for (var j = 0; j < pointsInBucket.length; j++){
			points.push([graph.graphCollection.dotSize + j*2*graph.graphCollection.dotSize, pointsInBucket[j][1], pointsInBucket[j][2] ]);
			
		}
	}
	
	return points;
	
}
*/

function yDistributionPoints(graph){//, data, scale){
	var yDomain = graph.y.domain();
	var bucketSize = (yDomain[1]-yDomain[0])/graph.graphCollection.buckets;
	var points = [];
	var data = graph.worksheet.data[graph.yData];
	var drawMode = jQuery("#drawMode option:selected").val();
	
	for (var i = 0; i < graph.graphCollection.buckets; i++){
		var bucketMin = yDomain[0] + (bucketSize * i);
		var bucketMax = yDomain[0] + (bucketSize * (i+1));
		var pointsInBucket = [];
		
		for (var j = 0; j < data.length; j++){
			var dataObj = data[j],
				yVal = graph.y(dataObj.value),
				label = dataObj.label;
				//set = dataObj.set;
				
			if ((yVal >= graph.y(bucketMin) && yVal < graph.y(bucketMax)) 
					|| drawMode == "gravity")
			{
				pointsInBucket.push([yVal, label, 0]);
			}
		}
		randomIndex = 20;
		pointsInBucket = shuffle(pointsInBucket);
		
		switch (drawMode)
		{
		case "floating":
			for (var j = 0; j < pointsInBucket.length; j++){
				points.push({"x":graph.graphCollection.dotSize + j*2*graph.graphCollection.dotSize,
										 "xReal":pointsInBucket[j][0],
										 "y":pointsInBucket[j][0],
										 "label":pointsInBucket[j][1],
										 //"set":pointsInBucket[j][2]
									 });
			}
			break;
		case "center":
			for (var j = 0; j < pointsInBucket.length; j++){
				points.push({"x":graphCollection.dotSize + j*2*graph.graphCollection.dotSize,
										 "yReal":pointsInBucket[j][0],
										 "y":(graph.y(bucketMin)+graph.y(bucketMax))/2,
										 "label":pointsInBucket[j][1],
										 //"set":pointsInBucket[j][2]
									 });
			}
			break;
		case "gravity":
			if ( i == 0 ) {
				for (var j = 0; j < pointsInBucket.length; j++){
					var candidatePoint = {
						"x":graphCollection.dotSize,
						"xReal":pointsInBucket[j][0],
						"y":pointsInBucket[j][0],
						"label":pointsInBucket[j][1],
						//"set":pointsInBucket[j][2]
						};
						
					var collisionPoints = [];
					for (var k = 0; k < points.length; k++){
						if (Math.abs(points[k].y-candidatePoint.y) < graphCollection.dotSize*2) {
							collisionPoints.push(points[k]);
						}
					}
					
					if (collisionPoints.length > 0)
						candidatePoint.x = fitPointInYGraph(candidatePoint, collisionPoints, graphCollection.dotSize);
					
					points.push(candidatePoint);
				}
			}
			
			break;
		}
	}
	return points;
	
}


/* Data Manipulation Functions */
function shuffle(o){
	for(var j, x, i = o.length; i; j = parseInt(nextNotSoRandom() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
};

function nextNotSoRandom(){
	var val = randoms[randomIndex];
	randomIndex++;
	if (randomIndex == randoms.length) randomIndex = 0;
	return val;
}


function angleBtwnVec(vec1, vec2){
	return Math.acos(vec1.dot(vec2.x, vec2.y)
					/(vec1.length() * vec2.length()));
}

function determinantBtwnVec(vec1, vec2){
	return vec1.x*vec2.y - vec2.x*vec1.y;
}


function ellipseRadiusAtAngle(graph, angle){
	var ellipseXRadius = graph.xRadius,
		ellipseYRadius = graph.yRadius,
		
		pointOnEllipse = [ ellipseXRadius * Math.cos(angle),
				ellipseYRadius * Math.sin(angle) ];
				
		return calcDistance(graph.ellipseCX, graph.ellipseCY
							, pointOnEllipse[0], pointOnEllipse[1]);
}

function invertEllipseCoords(graph, coords){
	var invertedCoords = [];
	for (var i = 0; i < coords.length; i++){
		invertedCoords.push([graph.x.invert(coords[i][0])
								,graph.y.invert(coords[i][1])]);
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


function numPointsInEllipse(graph){
	var tolerance = 10;
	var count = 0;
	var ellipsePoints = getRotatedEllipseCoords(graph);
	for (var i = 0; i < graph.getData().length; i++){
		var dataPoint = [graph.x(parseFloat(graph.getData()[i].x))
						 ,graph.y(parseFloat(graph.getData()[i].y))];
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



function getYOnLSByX(x, graph){
	 var y = graph.lsSlope * x + graph.lsIntercept;
	 return y;
}


function getClosestPointOnLSLine(point, graph){
	
	var x = parseFloat(point.x);
	var y = parseFloat(point.y);
	var pntOnLine = [(graph.lsSlope*y + x
						- graph.lsSlope*graph.lsIntercept
					)
					/(Math.pow(graph.lsSlope,2)+1),
					
					(Math.pow(graph.lsSlope,2)*y 
						+ graph.lsSlope*x
						+ graph.lsIntercept
					)
					/(Math.pow(graph.lsSlope,2)+1)]
					
	return pntOnLine;
}

function nextNotSoRandom(){
	var val = randoms[randomIndex];
	randomIndex++;
	if (randomIndex == randoms.length) randomIndex = 0;
	return val;
}

function getPixelWidthOfText(font, text){
	$("#textWidthTest").html("<p style=\"font:"+font+"\">"+text+"</p>");
	return $("#textWidthTest").outerWidth();
}

function getPixelHeightOfText(font, text){
	$("#textWidthTest").html("<p style=\"font:"+font+"\">"+text+"</p>");
	return $("#textWidthTest").outerHeight() - 20;
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
		sumXY += parseFloat(data[i].x) * parseFloat(data[i].y);
		sumX += parseFloat(data[i].x);
		sumY += parseFloat(data[i].y);
		sumXsqrd += Math.pow(parseFloat(data[i].x), 2);
		sumYsqrd += Math.pow(parseFloat(data[i].y), 2);
	}
	
	var r = (sumXY - (sumX * sumY)/n)/Math.sqrt((sumXsqrd-Math.pow(sumX,2)/n)*(sumYsqrd-Math.pow(sumY,2)/n))
	return r;
}

function getUserLineR(graph){
	var r = 0;
	for (var i = 0; i < graph.getData().length; i++)
		r += Math.pow(getVertDistToUserLine(graph, i), 2);
	
	return r;
}

function getYOnUserLineByX(x, graph){
	 var y = getUserLineSlope(graph) * x + getUserLineIntercept(graph);
	 return y;
}

function getVertDistToUserLine(graph, i){
	var dataX = parseFloat(graph.getData()[i].x);
	var dataY = parseFloat(graph.getData()[i].y);
	return Math.abs(dataY - getYOnUserLineByX(dataX, graph));
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
	return window.innerWidth - 290;
}

//function calcGraphHeight(){
//	return (window.innerHeight - jQuery('div#notGraph').height()) - 165; 
//}

function sortByXValues(data) {
  data.sort(function(a, b) {
	return a.x - b.x;
  });
  return data;
}

function sortByYValues(data) {
  data.sort(function(a, b) {
	return a.y - b.y;
  });
  return data;
}

function hideMenus(){
	$('#dataSetAdd').slideUp();
	$('#dataSetEdit').slideUp();
	$('#graphOptions').slideUp();
	$('#displayOptions').slideUp();
	$('#worksheetCreate').slideUp();
	$('#clipboardPrompt').slideUp();
	$('#aboutPopup').slideUp();
	$('#worksheetDescriptionPopup').slideUp();
	$('#dataSetPaste').slideUp();
}

/* Divides data into three groups, sorted by their X values */
function divideDataInto3(data) {
  sortByXValues(data);
  
  var modulo = data.length % 3,
	  delta = parseInt(data.length / 3);
  var groups = [];
  
  if (data.length < 3) {
		alert("The data selected has less than three rows of data.  Please add more.")
		//console.error('Data length must be greater than 3')
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

function getMedianRectangles(graph) {
	var rects = [];
	for (var i = 0; i < graph.groups.length; i++) {
		var bounds = getBounds(graph.groups[i]);
		var coords = getBoundingCoords(bounds);
		var n = graph.groups[i].length;
		
		var left = graph.x(coords[0][0]);
		var bottom = graph.y(coords[2][1]);
		var width = graph.x(coords[1][0]) - graph.x(coords[0][0]);
		var height = graph.y(coords[0][1]) - graph.y(coords[2][1]); 
		
		rects.push({"left":left,
								"bottom":bottom,
								"width":width,
								"height":height,
								"n":n});
	}
	return rects;
}

/* Get the minX, maxX, minY, maxY to surround a data group */
function getBounds(group) {
  var minX = pv.min(group, function(d) { return d.x || 0 }); // or 0 in case falsy value in data
  var maxX = pv.max(group, function(d) { return d.x || 0 });
  var minY = pv.min(group, function(d) { return d.y || 0 });
  var maxY = pv.max(group, function(d) { return d.y || 0 });
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
	if (!elem.x || !elem.y || 
	  elem.x == "" || elem.y == "")
	  return null;
	else {
	  elem.x = parseFloat(elem.x);
	  elem.y = parseFloat(elem.y);
	  return elem;
	}
  });
}

function medianXValue(dataSet) {
  sortByXValues(dataSet);
  if (dataSet.length % 2 == 0) {
	var middle1 = dataSet[Math.floor((dataSet.length / 2)) - 1]; // round up
	var middle2 = dataSet[Math.floor(dataSet.length / 2)]; // round down
	return (parseFloat(middle1.x) + parseFloat(middle2.x)) / 2;
  } else {
	var middle = dataSet[parseInt(dataSet.length / 2)];
	return parseFloat(middle.x);
  }
}

function medianYValue(dataSet) {
  sortByYValues(dataSet);
  if (dataSet.length % 2 == 0) {
	var middle1 = dataSet[Math.floor((dataSet.length / 2)) - 1]; // round up
	var middle2 = dataSet[Math.floor(dataSet.length / 2)]; // round down
	return (parseFloat(middle1.y) + parseFloat(middle2.y)) / 2;
  } else {
	var middle = dataSet[parseInt(dataSet.length / 2)];
	return parseFloat(middle.y);
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

function getUserLineSlope(graph){
	return findSlope(graph.userDrawnLinePoints[0].x
			 ,graph.userDrawnLinePoints[1].x
			 ,graph.userDrawnLinePoints[0].y
			 ,graph.userDrawnLinePoints[1].y);
}

function getUserLineIntercept(graph){
	return findIntercept(graph.userDrawnLinePoints[0].x
						,graph.userDrawnLinePoints[0].y
						,getUserLineSlope(graph));
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
  $('#yMin').css('position', 'absolute').css('bottom', '75px').css('left', '52px');
  $('#yMax').css('position', 'absolute').css('top', '235px').css('left', '52px');
  $('#xMin').css('position', 'absolute').css('bottom', '60px').css('left', '99px');
  $('#xMax').css('position', 'absolute').css('bottom', '60px').css('right', '24px')
}

function trim(stringToTrim) {
	return stringToTrim.replace(/^\s+|\s+$/g,"");
}

function positionGraphMenuOverGraph(index, graphCollection){
	var yPos = $('span').offset().top +
							graphCollection.padTop - 29;
	
	var xPos = $('span').offset().left +
							graphCollection.padLeft - 34 +
							index * (graphCollection.graphs[index].w + 110);
							
	//if (xPos + $('#graphOptions').width() > graphCollection.w){
	//	xPos -= (xPos + $('#graphOptions').width()) - graphCollection.w - graphCollection.padRight - graphCollection.padLeft - 20 ;
	//}
					
	if (yPos + $('#graphOptions').height() > graphCollection.h){
		yPos -= (yPos + $('#graphOptions').height()) - graphCollection.h - graphCollection.padBot - graphCollection.padTop - 20 ;
	}
		
	$('#graphOptions')
		.css('position', 'absolute')
		.css('top', yPos + "px")
		.css('left', xPos + "px")
	
}
