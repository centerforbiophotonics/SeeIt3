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

function partitionDataInTwo(graphics, mode){
	var data = parseData(graphics, mode);
	
	if (data.length % 2 == 0)
		return [getMinOfArray(data),
						(data[data.length/2-1]+data[data.length/2])/2,
						getMaxOfArray(data)];
	else
		return [getMinOfArray(data), 
						(data[Math.floor(data.length/2)]+data[Math.floor(data.length/2+1)])/2,
						getMaxOfArray(data)];
}

function partitionDataInFour(graphics, mode){
	var data = parseData(graphics, mode),
			size = (data.length >= 8) ? Math.ceil(data.length/4) : Math.floor(data.length/4);
			divs = [getMinOfArray(data)],
			count = 0,
			numInteriorDivs = 0;
	for (var i = 0; i<data.length-1; i++){
		count++;
		if (count == size){
			count = 0;
			divs.push((data[i]+data[i+1])/2);
			numInteriorDivs++;
		}
		if (numInteriorDivs == 3) break;
	}
	divs.push(getMaxOfArray(data));
	return divs;
}

function partitionDataInFixedSizeGroups(graphics, mode){
	var data = parseData(graphics, mode),
			size = graphics.partitionGroupSize,
			divs = [graphics.xMin],
			count = 0;
	for (var i = 0; i<data.length-1; i++){
		count++;
		if (count == size){
			count = 0;
			divs.push((data[i]+data[i+1])/2);
		}
	}
	divs.push(graphics.xMax);
	return divs;
}

function partitionDataByIntervalWidth(graphics){
	var divs = [],
			curr = graphics.x.domain()[0];
	
	while (curr <= graphics.x.domain()[1]){
		divs.push(curr)
		curr += graphics.partitionIntervalWidth;
	}
	divs.push(curr);
	return divs;
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

function parseData(graphics, mode){
	var data;
	if (mode == "set1"){
		data = graphics.data.filter(function(d){return d.set1})
												.map(function(d){return parseFloat(d.value)});
	} else if (mode == "set2"){
		data = graphics.data.filter(function(d){return !(d.set1)})
												.map(function(d){return parseFloat(d.value)});
	} else if (mode == "both"){
		data = graphics.data.map(function(d){return parseFloat(d.value)});
	}
	
	data.sort(function(a,b){return a - b})
	
	return data;
}

function countDataInPartitions(graphics, partitions, mode){
	var counts = [];
	for (var index=0; index<partitions.length; index++){
		var count = 0;
		var data = parseData(graphics,mode);
		if(index != partitions.length-1){
			for (var i=0; i<data.length; i++){
				if (data[i] >= partitions[index] && data[i] < partitions[index+1])
					count++;
			}
		}
		counts.push(count);
	}
	return counts;
}

function countDataInUserDefPartitions(graphics, mode){
	var udPartXVals = getSortedUDPartitionXVals(graphics, mode);
	return countDataInPartitions(graphics, udPartXVals, mode);	
}

function getSortedUDPartitionXVals(graphics, mode){
	var udPartXVals = [graphics.x.domain()[0]];
	
	if (mode == "both")
		udPartXVals = udPartXVals.concat(graphics.udPartitionsBoth.map(function(d){return graphics.x.invert(d.x)}).sort(function(a,b){return a - b}));
	else if (mode == "set1")
		udPartXVals = udPartXVals.concat(graphics.udPartitionsSet1.map(function(d){return graphics.x.invert(d.x)}).sort(function(a,b){return a - b}));
	else if (mode == "set2")
		udPartXVals = udPartXVals.concat(graphics.udPartitionsSet2.map(function(d){return graphics.x.invert(d.x)}).sort(function(a,b){return a - b}));
	
	udPartXVals = udPartXVals.concat(graphics.x.domain()[1]);
	return udPartXVals;
}

function fiwHistogram(graphics, partitions, mode){
	var counts = countDataInPartitions(graphics, partitions, mode);
	var maxCount = getMaxOfArray(counts);
	var rectangles = [];
	if (mode == "both"){
		for (var i=0;i<counts.length;i++){
			rectangles.push([[partitions[i], 0],
											 [partitions[i], graphics.h * counts[i]/maxCount],//counts[i]*graphics.bucketDotSize*2],
											 [partitions[i+1], graphics.h * counts[i]/maxCount],//counts[i]*graphics.bucketDotSize*2],
											 [partitions[i+1], 0],
											 [partitions[i], 0]]);
		}
	} else if (mode == "set1") {
		for (var i=0;i<counts.length;i++){
			rectangles.push([[partitions[i], 0],
											 [partitions[i], (graphics.h/2 - 50) * counts[i]/maxCount],//counts[i]*graphics.bucketDotSize*2],
											 [partitions[i+1], (graphics.h/2 - 50) * counts[i]/maxCount],//counts[i]*graphics.bucketDotSize*2],
											 [partitions[i+1], 0],
											 [partitions[i], 0]]);
		}
	} else if (mode == "set2") {
		for (var i=0;i<counts.length;i++){
			rectangles.push([[partitions[i], 0],
											 [partitions[i], (graphics.h/2 - 50) * counts[i]/maxCount],//counts[i]*graphics.bucketDotSize*2],
											 [partitions[i+1], (graphics.h/2 - 50) * counts[i]/maxCount],//counts[i]*graphics.bucketDotSize*2],
											 [partitions[i+1], 0],
											 [partitions[i], 0]]);
		}
		
	} 
	return rectangles;
}

function selectAUserDefPartition(mode, graphics, index){
	if (mode == "both") {
		graphics.selectedUDPartBoth = index;
		graphics.selectedUDPartSet1 = -1;
		graphics.selectedUDPartSet2 = -1;
		graphics.selectedUDPartInWhichSet = "both";
	} else if (mode == "set1") {
		graphics.selectedUDPartBoth = -1;
		graphics.selectedUDPartSet1 = index;
		graphics.selectedUDPartSet2 = -1;
		graphics.selectedUDPartInWhichSet = "set1";
	} else if (mode == "set2") {
		graphics.selectedUDPartBoth = -1;
		graphics.selectedUDPartSet1 = -1;
		graphics.selectedUDPartSet2 = index;
		graphics.selectedUDPartInWhichSet = "set2";
	} else if (mode == "none") {
		graphics.selectedUDPartBoth = -1;
		graphics.selectedUDPartSet1 = -1;
		graphics.selectedUDPartSet2 = -1;
		graphics.selectedUDPartInWhichSet = "";
	}
}

function getMaxOfArray(numArray) {
  return Math.max.apply(null, numArray);
}

function getMinOfArray(numArray) {
  return Math.min.apply(null, numArray);
}


