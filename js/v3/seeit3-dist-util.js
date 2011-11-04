/*Visualization Settings*/
function pointFillStyle(set){
	if (jQuery('#checkboxFillDots').is(':checked')){
		if (jQuery('#checkboxBWView').is(':checked')){
			var color = graphCollection.categoryColors[set];
			//var greyVal = parseInt((0.21 * color.r  + 0.71 * color.g + 0.07 * color.b)/3);  //luminosity
			//var greyVal = parseInt((color.r  + color.g + color.b)/3);												//average
			var greyVal = parseInt((Math.max(color.r, color.g, color.b) + Math.min(color.r,color.g,color.b))/2)  //lightness
			return pv.rgb(greyVal, greyVal, greyVal, 1);
		}else{ 
			return graphCollection.categoryColors[set]
		}
	}else{
		return "white";
	}
}


function updateColor(category, color){
	var r = parseInt(color.rgb[0]*255);
	var g = parseInt(color.rgb[1]*255);
	var b = parseInt(color.rgb[2]*255);
	graphCollection.categoryColors[category]= new pv.Color.Rgb(r,g,b,1);
	vis.render();
	for (var i=0; i<graphCollection.graphs.length; i++){
		for (var j=0; j<graphCollection.graphs[i].includedCategories.length; j++){
			var text = graphCollection.graphs[i].includedCategories[j];
			if (trim(text) == trim(category)){
				$('#lgndColor'+i+'-'+j).css('background-color','#'+color.toString());
			}
		}
	}
	
	//constructVis();
}

//Takes out characters that don't work in jquery selectors
//probably misses a lot
function convertToID(set){
	return set.replace(/ /g,"_")
						.replace(/\//g,"")
						.replace(/,/g,"")
						.split('.').join('')
						.replace(/%/g,"")
						.split(')').join('')
						.split('(').join('')+"div";
}

function toggleDataSubtree(id,i,title){
	$('#'+id).slideToggle(null,resizeVis);
	graphCollection.datasetsVisible[title] ? 
		graphCollection.datasetsVisible[title] = false :
		graphCollection.datasetsVisible[title] = true;
	if ($('#subtreeToggle'+i).attr("src") == "img/downTriangle.png")
		$('#subtreeToggle'+i).attr("src","img/rightTriangle.png");
	else
		$('#subtreeToggle'+i).attr("src","img/downTriangle.png");
	
	//setTimeout("resizeVis()",1000); 
	
}

function resizeVis(){
	$('span').css('position', 'absolute')
					 .css('left',$('#datasets').width()+29)
					 .css('z-index', -1);
	graphCollection.setW(graphCollection.calcGraphWidth());
	vis.render();
	positionGroupingMenuOverGraph(graphCollection.selectedGraphIndex, graphCollection);
	
	positionDisplayMenu();
}

function trim(stringToTrim) {
	return stringToTrim.replace(/^\s+|\s+$/g,"");
}

function colorToHex(color) {
    if (color.substr(0, 1) === '#') {
        return color;
    }
    var digits = /(.*?)rgb\((\d+),(\d+),(\d+)\)/.exec(color);
    
    var red = parseInt(digits[2]);
    var green = parseInt(digits[3]);
    var blue = parseInt(digits[4]);
    
    var rgb = blue | (green << 8) | (red << 16);
    return digits[1] + '#' + rgb.toString(16);
};

function pointStrokeStyle(set){
	if (jQuery('#checkboxFillDots').is(':checked')){
		return "black";
	} else {
		if (jQuery('#checkboxBWView').is(':checked')){
			var color = graphCollection.categoryColors[set];
			//var greyVal = parseInt((0.21 * color.r  + 0.71 * color.g + 0.07 * color.b)/3);  //luminosity
			//var greyVal = parseInt((color.r  + color.g + color.b)/3);												//average
			var greyVal = parseInt((Math.max(color.r, color.g, color.b) + Math.min(color.r,color.g,color.b))/2)  //lightness
			return pv.rgb(greyVal, greyVal, greyVal, 1);
		} else { 
			return graphCollection.categoryColors[set]
		}
	}
}

function pixelWidth(text){
	$('#textWidthTest').html(text);
	$('#textWidthTest').css("font", fontString);
	return $('#textWidthTest').width();
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


function partitionDataInTwo(graph){
	var data = graph.dataVals();
	
	if (data.length % 2 == 0)
		return [getMinOfArray(data),
						(data[data.length/2-1]+data[data.length/2])/2,
						getMaxOfArray(data)];
	else
		return [getMinOfArray(data), 
						(data[Math.floor(data.length/2)]+data[Math.floor(data.length/2+1)])/2,
						getMaxOfArray(data)];
}

function partitionDataInFour(graph){
	var data = graph.dataVals();
	var divs = [getMinOfArray(data)];
	
	if (data.length >= 4){
		divs.push((data[Math.floor(data.length/4)] + data[Math.floor(data.length/4) - 1])/2);
		divs.push((data[Math.floor(data.length/4)*2] + data[Math.floor(data.length/4)*2 - 1])/2);
		divs.push((data[Math.floor(data.length/4)*3] + data[Math.floor(data.length/4)*3 - 1])/2);
		divs.push(getMaxOfArray(data));
	}
	return divs;
}

function countsInFourGroups(length){
	var counts = [0,0,0,0];
	if (Math.floor(length/4) == 0){
		for (var i=0; i<length; i++){
			if (i+1 <= length)
				counts[i] = 1
		}
		return counts;
	} else {
		counts[0] = Math.floor(length/4);
		counts[1] = Math.floor(length/4);
		counts[2] = Math.floor(length/4);
		counts[3] = Math.floor(length/4) + length%4;
		return counts;
	}
}

function partitionDataInFixedSizeGroups(graph){
	var data = graph.dataVals(),
			size = graph.partitionGroupSize,
			divs = [graph.xMin],
			count = 0;
	for (var i = 0; i<data.length-1; i++){
		count++;
		if (count == size){
			count = 0;
			divs.push((data[i]+data[i+1])/2);
		}
	}
	divs.push(graph.xMax);
	return divs;
}

function partitionDataByIntervalWidth(graph){
	var divs = [],
			xDom = graph.x.domain();
			curr = xDom[0];
	
	while (curr <= xDom[1]){
		divs.push(curr)
		curr += graph.partitionIntervalWidth;
	}
	divs.push(curr);
	return divs;
}

/*HTML Element Manipulation*/
function toggleNetworkOptions(graph) {
	if (graph.worksheet.local == true){
		$('#refreshWorksheet').hide();
		$('#editInGoogleDocs').hide();
	} else {
		$('#refreshWorksheet').show();
		$('#editInGoogleDocs').show();
	}
}

function showHideAdvancedOptions(){
	//graphCollection.advancedUser = !(graphCollection.advancedUser);
	if (graphCollection.advancedUser){
		$('#fixedSizeOptions').show();
		$('#fixedIntervalOptions').show();
		$('#boxPlotOptions').show();
		$('#scaleOptions').show();
		if ($('#drawMode option:selected').text() != "Gravity")
			$('#divisionsCell').show();
		$('#stackAndButtonTable').show();
	} else {
		$('#fixedSizeOptions').hide();
		$('#fixedIntervalOptions').hide();
		$('#boxPlotOptions').hide();
		$('#scaleOptions').hide();
		$('#divisionsCell').hide();
		$('#stackAndButtonTable').hide();
		graphCollection.editModeEnabled = false;
		//hideMenus();
		graphCollection.buttonIcon = true;
		graphCollection.buttonText = true;
		$("#drawMode option[value='gravity']").attr('selected', 'selected');
		graphCollection.buckets = 30;
		$("#divisionsValue").html(graphCollection.buckets);
		
		graphCollection.graphs.forEach(function(g){
			if (g.groupingMode != "NoGroups" &&
					g.groupingMode != "UserDefGroups" &&
					g.groupingMode != "TwoEqualGroups" &&
					g.groupingMode != "FourEqualGroups")
			g.groupingMode = "NoGroups";
		});
		graphCollection.updateMenuOptions();
	}
	vis.render();
}

function hideMenus(){
	$('#groupingOptions').slideUp();
	$('#displayOptions').slideUp();
	$('#worksheetMenu').slideUp();
	$('#worksheetURLMenu').slideUp();
	$('#aboutPopup').slideUp();
	$('#worksheetDescriptionPopup').slideUp();
}

function positionGroupingMenuOverGraph(index, graphCollection){
	var yPos = $('span').offset().top +
							graphCollection.padTop +
							(index == 0 ? 0 : 1) +
							index*graphCollection.graphs[0].h;
	
	var xPos = $('span').offset().left +
							graphCollection.padLeft - 35;
					
	if (yPos + $('#groupingOptions').height() > graphCollection.h){
		yPos -= (yPos + $('#groupingOptions').height()) - graphCollection.h - graphCollection.padBot - graphCollection.padTop - 20 ;
	}
		
	$('#groupingOptions')
		.css('position', 'absolute')
		.css('top', yPos + "px")
		.css('left', xPos + "px")
		.css('z-index', 1);
	
}

function positionDisplayMenu(){
	$('#displayOptions').css('position', 'absolute')
										 .css('top', $('span').offset().top +"px")
										 .css('left',$('span').offset().left +
													graphCollection.padLeft - 35 +"px")
										 .css('z-index', 1);
}


/* Data Manipulation Functions */
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


function magnitude(number){
	var mag = 0;
	while(number > 10) { 
		mag++; 
		number = number / 10; 
	}
	return mag;
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

//function calcGraphWidth(){
//	if (graphCollection.datasetsMenuShowing)
//		return window.innerWidth - $('#datasets').width() - 111;
//	else
//		return window.innerWidth - 90;
//}

function countDataInPartitions(graph, partitions){
	var counts = [];
	var partLength = partitions.length;
	for (var index=0; index< partLength-1; index++){
		var count = 0;
		var data = graph.dataVals();
		for (var i=0; i<data.length; i++){
			if (data[i] >= partitions[index] && data[i] <= partitions[index+1])
				count++;
		}	
		counts.push(count);
	}
	return counts;
}

function countDataInUserDefPartitions(graph){
	var udPartXVals = getSortedUDPartitionXVals(graph);
	return countDataInPartitions(graph, udPartXVals);	
}

function getSortedUDPartitionXVals(graph){
	var udPartXVals = [graph.x.domain()[0]];
	udPartXVals = udPartXVals.concat(graph.udPartitions.map(function(d){
		return graph.x.invert(d.x)}).sort(function(a,b){return a - b}));
	udPartXVals = udPartXVals.concat(graph.x.domain()[1]);
	return udPartXVals;
}

function fiwHistogram(graph, partitions){
	var counts = countDataInPartitions(graph, partitions);
	var maxCount = getMaxOfArray(counts);
	var rectangles = [];

	for (var i=0;i<counts.length;i++){
		rectangles.push({"left": graph.x(partitions[i]),
										 "width": graph.x(partitions[i+1])-graph.x(partitions[i]),
										 "height": graph.h * 0.75 * counts[i]/maxCount});
	}

	return rectangles;
}

function getMaxOfArray(numArray) {
  return Math.max.apply(null, numArray);
}

function getMinOfArray(numArray) {
  return Math.min.apply(null, numArray);
}

function removeOutliers(graph){
	var fp = partitionDataInFour(graph);
	var numArray = graph.dataVals();
	var IQR = fp[3] - fp[1];
	var retVal = [];
	
	numArray.forEach(function(num){
		if (num >= fp[1]-1.5*IQR  && num <= fp[3]+1.5*IQR)
			retVal.push(num);
	});
	
	return retVal;
}

function getOutlierDrawPositions(graph){
	var min = graph.x(removeOutliers(graph)[0]);
	var max = graph.x(removeOutliers(graph)[removeOutliers(graph).length-1]);
	var outliers = [];
	
	graph.getDataDrawObjects().forEach(function(d){
		if (d.x < min || d.x > max)
			outliers.push(d);
	});
	
	return outliers;
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

function getSDLinePoints(graph){
	var sd = getSD(graph.dataVals());
	var mean = getMean(graph.dataVals());
	
	return [mean-sd,mean+sd];
	
}


function objectToString(o){
	var parse = function(_o){
		var a = [], t;
		for(var p in _o){
			if(_o.hasOwnProperty(p)){
				t = _o[p];
				if(t && typeof t == "object"){
					a[a.length]= p + ":{ " + arguments.callee(t).join(", ") + "}";
				}
				else {
					if(typeof t == "string"){
						a[a.length] = [ p+ ": \"" + t.toString() + "\"" ];
					}
					else{
						a[a.length] = [ p+ ": " + t.toString()];
					}           
				}
			}
		}
		return a;   
	}
	return "{" + parse(o).join(", ") + "}";   
}
