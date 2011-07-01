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

function pointStrokeStyle(set){
	if (jQuery('#checkboxFillDots').is(':checked')){
		return "black";
	}else{
		if (jQuery('#checkboxBWView').is(':checked')){
			var color = graphCollection.categoryColors[set];
			//var greyVal = parseInt((0.21 * color.r  + 0.71 * color.g + 0.07 * color.b)/3);  //luminosity
			//var greyVal = parseInt((color.r  + color.g + color.b)/3);												//average
			var greyVal = parseInt((Math.max(color.r, color.g, color.b) + Math.min(color.r,color.g,color.b))/2)  //lightness
			return pv.rgb(greyVal, greyVal, greyVal, 1);
		}else{ 
			return graphCollection.categoryColors[set]
		}
	}
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
	var data = graph.dataVals(),
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
			curr = graph.x.domain()[0];
	
	while (curr <= graph.x.domain()[1]){
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

function positionGroupingMenuOverGraph(index, graphCollection){
	var yPos = $('span').offset().top +
							graphCollection.padTop +
							(index == 0 ? 0 : 1) +
							index*graphCollection.graphs[0].h;
	
	var xPos = $('span').offset().left +
							graphCollection.padLeft - 34;
					
	if (yPos + $('#groupingOptions').height() > graphCollection.h){
		//console.log("reposition");
		yPos -= (yPos + $('#groupingOptions').height()) - graphCollection.h ;//- 62;
	}
		
	$('#groupingOptions')
		.css('position', 'absolute')
		.css('top', yPos + "px")
		.css('left', xPos + "px")
	
}

function positionDisplayMenu(){
	$('#displayOptions').css('position', 'absolute')
										 .css('top', $('span').offset().top +"px")
										 .css('left',$('span').offset().left +
																	graphCollection.padLeft - 34 +"px");
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
	return window.innerWidth - 255;
}

function calcGraphHeight(){
	return (window.innerHeight - jQuery('div#notGraph').height()) - 90; 
}

function countDataInPartitions(graph, partitions){
	var counts = [];
	for (var index=0; index<partitions.length; index++){
		var count = 0;
		var data = graph.dataVals();
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

function countDataInUserDefPartitions(graph){
	var udPartXVals = getSortedUDPartitionXVals(graph);
	return countDataInPartitions(graph, udPartXVals);	
}

function getSortedUDPartitionXVals(graph){
	var udPartXVals = [graph.x.domain()[0]];
	udPartXVals = udPartXVals.concat(graph.udPartitions.map(function(d){return graph.x.invert(d.x)}).sort(function(a,b){return a - b}));
	udPartXVals = udPartXVals.concat(graph.x.domain()[1]);
	return udPartXVals;
}

function fiwHistogram(graph, partitions, mode){
	var counts = countDataInPartitions(graph, partitions);
	var maxCount = getMaxOfArray(counts);
	var rectangles = [];

	for (var i=0;i<counts.length;i++){
		rectangles.push([[partitions[i], graph.baseLine],
										 [partitions[i], graph.h * 0.75 * counts[i]/maxCount + graph.baseLine],
										 [partitions[i+1], graph.h * 0.75 * counts[i]/maxCount + graph.baseLine],
										 [partitions[i+1], graph.baseLine],
										 [partitions[i], graph.baseLine]]);
	}

	return rectangles;
}

function getMaxOfArray(numArray) {
  return Math.max.apply(null, numArray);
}

function getMinOfArray(numArray) {
  return Math.min.apply(null, numArray);
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
