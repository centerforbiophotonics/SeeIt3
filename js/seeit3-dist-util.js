/*Visualization Settings*/
function dataPointFillStyle(d){
	if (jQuery('#checkboxFillDots').is(':checked')){
		if (jQuery('#checkboxBWView').is(':checked')){
			if (d.isInSet1) return "black";
			else return "grey";
		}else{ 
			if (d.isInSet1) return "blue";
			else return "red";
		}
	}else{
		if (jQuery('#checkboxBWView').is(':checked')){
			if (d.isInSet1) return "aaa";
			else return "eee";
		}else{ 
			if (d.isInSet1)return "eee";
			else return "eee";
		}
	}
}

function dataPointStrokeStyle(d){
	if (jQuery('#checkboxBWView').is(':checked')){
		if (d.isInSet1) return "black";
		else return "grey";
	}else{
		if (d.isInSet1) return "blue";
		else return "red";
	}
}

function legendPointFillStyle(index){
	if (jQuery('#checkboxFillDots').is(':checked')){
		if (jQuery('#checkboxBWView').is(':checked')){
			if (index == 0) return "black";
			else return "grey";
		}else{ 
			if (index == 0) return "blue";
			else return "red";
		}
	}else{
		if (jQuery('#checkboxBWView').is(':checked')){
			if (index == 0) return "aaa";
			else return "eee";
		}else{ 
			if (index == 0) return "eee";
			else return "eee";
		}
	}
}

function legendPointStrokeStyle(index){
	if (jQuery('#checkboxBWView').is(':checked')){
		if (index == 0) return "black";
		else return "grey";	
	} else {
		if (index == 0) return "blue";
		else return "red";
		
	}
}

/*HTML Element Manipulation*/
function toggleNetworkOptions(graphics) {
	if (graphics.worksheet.local == true){
		$('#refreshWorksheet').hide();
		$('#editInGoogleDocs').hide();
	} else {
		$('#refreshWorksheet').show();
		$('#editInGoogleDocs').show();
	}
	
}

function updateScaleTextBoxes(graphics){
	$('#textXMin').val(graphics.x.domain()[0]);
	$('#textXMax').val(graphics.x.domain()[1]);	
}

function positionAxisMinMaxWidgets() {
  $('#xMin input,#xMax input,#yMin input,#yMax input').css('width', '40px');
  //$('#yMin').css('position', 'absolute').css('bottom', '75px').css('left', '52px');
  //$('#yMax').css('position', 'absolute').css('top', '235px').css('left', '52px');
  $('#xMin').css('position', 'absolute').css('bottom', '30px').css('left', '15px');
  $('#xMax').css('position', 'absolute').css('bottom', '30px').css('right', '24px')
}


/* Data Manipulation Functions */
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

function singleDistPoints(graphics){
	var xDomain = graphics.x.domain();
	var bucketSize = (xDomain[1]-xDomain[0])/graphics.buckets;
	var points = [];
	
	for (var i = 0; i < graphics.buckets; i++){
		var bucketMin = xDomain[0] + (bucketSize * i);
		var bucketMax = xDomain[0] + (bucketSize * (i+1));
		var pointsInBucket = [];
		
		for (var j = 0; j < graphics.data.length; j++){
			var dataPoint = graphics.data[j],
				xVal = parseFloat(dataPoint.value),
				label = dataPoint.label;
				set1 = dataPoint.set1;
				
			if (xVal >= bucketMin 
				&& xVal < bucketMax)
			{
				pointsInBucket.push([graphics.x(xVal), 0, label, set1]);
			}
		}
		
		randomIndex = 20;
		pointsInBucket = shuffle(pointsInBucket);
		
		for (var j = 0; j < pointsInBucket.length; j++){
			points.push({"x":pointsInBucket[j][0],
									 "y":graphics.bucketDotSize + j*2*graphics.bucketDotSize,
									 "label":pointsInBucket[j][2],
									 "isInSet1":pointsInBucket[j][3]
								 });
		}
	}
	
	return points;
}

function setOnePoints(graphics){
	var xDomain = graphics.x.domain();
	var bucketSize = (xDomain[1]-xDomain[0])/graphics.buckets;
	var points = [];
	
	for (var i = 0; i < graphics.buckets; i++){
		var bucketMin = xDomain[0] + (bucketSize * i);
		var bucketMax = xDomain[0] + (bucketSize * (i+1));
		var pointsInBucket = [];
		
		for (var j = 0; j < graphics.data.length; j++){
			if (graphics.data[j].set1){
				var dataPoint = graphics.data[j],
					xVal = parseFloat(dataPoint.value),
					label = dataPoint.label;
					set1 = dataPoint.set1;
					
				if (xVal >= bucketMin 
					&& xVal < bucketMax)
				{
					pointsInBucket.push([graphics.x(xVal), 0, label, set1]);
				}
			}
		}
		
		randomIndex = 20;
		pointsInBucket = shuffle(pointsInBucket);
		
		for (var j = 0; j < pointsInBucket.length; j++){
			points.push({"x":pointsInBucket[j][0],
									 "y":graphics.bucketDotSize + j*2*graphics.bucketDotSize,
									 "label":pointsInBucket[j][2],
									 "isInSet1":pointsInBucket[j][3]
								 });
		}
	}
	
	return points;
}

function setTwoPoints(graphics){
	var xDomain = graphics.x.domain();
	var bucketSize = (xDomain[1]-xDomain[0])/graphics.buckets;
	var points = [];
	
	for (var i = 0; i < graphics.buckets; i++){
		var bucketMin = xDomain[0] + (bucketSize * i);
		var bucketMax = xDomain[0] + (bucketSize * (i+1));
		var pointsInBucket = [];
		
		for (var j = 0; j < graphics.data.length; j++){
			if (graphics.data[j].set1 == false){
				var dataPoint = graphics.data[j],
					xVal = parseFloat(dataPoint.value),
					label = dataPoint.label;
					set1 = dataPoint.set1;
					
				if (xVal >= bucketMin 
					&& xVal < bucketMax)
				{
					pointsInBucket.push([graphics.x(xVal), 0, label, set1]);
				}
			}
		}
		
		randomIndex = 20;
		pointsInBucket = shuffle(pointsInBucket);
		
		for (var j = 0; j < pointsInBucket.length; j++){
			points.push({"x":pointsInBucket[j][0],
									 "y":graphics.bucketDotSize + j*2*graphics.bucketDotSize,
									 "label":pointsInBucket[j][2],
									 "isInSet1":pointsInBucket[j][3]
								 });
		}
	}
	
	return points;
}

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

function parseSpreadsheetKeyFromURL(URL) {
  var matches = /key\=([A-Z|a-z|0-9|_|-]+)/.exec(URL);
  if (!matches)
	alert("That doesn't appear to be a valid URL");
  else
	return matches[1];
}

function calcGraphWidth(){
	return window.innerWidth - 65;
}

function calcGraphHeight(){
	return (window.innerHeight - jQuery('div#notGraph').height()) - 165; 
}

function sortByXValues(data) {
  data.sort(function(a, b) {
	return a.value - b.value;
  });
  return data;
}

function sortByYValues(data) {
  data.sort(function(a, b) {
	return a.otherFactor - b.otherFactor;
  });
  return data;
}



