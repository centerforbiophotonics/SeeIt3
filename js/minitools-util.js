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
				xVal = parseFloat(dataPoint.value),
				label = dataPoint.label;
				set1 = dataPoint.set1;
				
			if (xVal >= bucketMin 
				&& xVal < bucketMax)
			{
				pointsInBucket.push([graphics.x(xVal), 0, label, set1]);
			}
		}
		
		pointsInBucket = shuffle(pointsInBucket);
		
		for (var j = 0; j < pointsInBucket.length; j++){
			points.push([pointsInBucket[j][0]
						, graphics.bucketDotSize + j*2*graphics.bucketDotSize
						, pointsInBucket[j][2]
						, pointsInBucket[j][3]]);
		}
	}
	
	return points;
}

/* Data Manipulation Functions */
function shuffle(o){
	for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
};

function parseSpreadsheetKeyFromURL(URL) {
  var matches = /key\=([A-Z|a-z|0-9|_|-]+)/.exec(URL);
  if (!matches)
	alert("That doesn't appear to be a valid URL");
  else
	return matches[1];
}

function calcGraphWidth(){
	return window.innerWidth - 135;
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


function positionAxisMinMaxWidgets() {
  $('#xMin input,#xMax input,#yMin input,#yMax input').css('width', '40px');
  $('#yMin').css('position', 'absolute').css('bottom', '75px').css('left', '52px');
  $('#yMax').css('position', 'absolute').css('top', '235px').css('left', '52px');
  $('#xMin').css('position', 'absolute').css('bottom', '60px').css('left', '99px');
  $('#xMax').css('position', 'absolute').css('bottom', '60px').css('right', '24px')
}
