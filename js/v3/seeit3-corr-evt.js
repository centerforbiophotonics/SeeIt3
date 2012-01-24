/* Events */	

/* Touch Events */
document.addEventListener("touchstart", touchStart, false);

function touchStart(event){
  if (!touch.dragging) return;
	//console.log("test");
	switch (touch.dragType){
		case "dataCorr":
			dataCorrTouchStart(event);
			break;
		case "dataX":
			dataXTouchStart(event);
			break;
		case "dataY":
			dataYTouchStart(event);
			break;
		case "dataBothTop":
			dataBothTopTouchStart(event);
			break;
		case "dataBothBottom":
			dataBothBottomTouchStart(event);
			break;
//		case "sideCat":
//			sideCatTouchStart(event);
//			break;
//		case "graphXCat":
//			graphXCatTouchStart(event);
//			break;
//		case "graphYCat":
//			graphYCatTouchStart(event);
//			break;
		case "ellipseMove":
			ellipseMoveTouchStart(event);
			break;
		case "ellipseAdjust":
			ellipseAdjustTouchStart(event);
			break;
		case "udLineMove":
			udLineMoveTouchStart(event);
			break;
		case "udLineAdjust":
			udLineAdjustTouchStart(event);
			break;
	}
}

function 	dataCorrTouchStart(event){
	var graph = graphCollection.graphs[touch.graphIndex];
	
	var mouseX = event.targetTouches[0].pageX -
							$('span').offset().left -
							graphCollection.padLeft + 14 - 
							touch.graphPanel.left();
							
	var mouseY = graph.h - (event.targetTouches[0].pageY - 
													$('span').offset().top - 
													graphCollection.padTop - 
													touch.graphPanel.top());
							
	var d = touch.dataObj;
	var dragLabel = touch.dragLabel;
	
	if (graphCollection.editModeEnabled) {
		if(	mouseX >= 0 &&
				mouseX <= graph.w &&
				mouseY >= 0 &&
				mouseY <= graph.h){
		
			var worksheetX = null;
			for (key in graphCollection.worksheets){
				if (graphCollection.worksheets[key].data[graph.xData] != undefined)
					worksheetX = graphCollection.worksheets[key];
			}
			var worksheetY = null;
			for (key in graphCollection.worksheets){
				if (graphCollection.worksheets[key].data[graph.yData] != undefined)
					worksheetY = graphCollection.worksheets[key];
			}
			
			graphCollection.editSinglePoint(worksheetX, graph.xData, d.label, graph.x.invert(mouseX));
			graphCollection.editSinglePoint(worksheetY, graph.yData, d.label, graph.y.invert(mouseY));
			
			dragLabel.text(graph.x.invert(mouseX).toFixed(1) +
											", " +
										graph.y.invert(mouseY).toFixed(1));
			dragLabel.left(mouseX)
			dragLabel.bottom(mouseY)
			dragLabel.visible(true)
			
			vis.render();
		} else {
			dragLabel.text("Delete");
			vis.render();
		}
	} else {
		$('#dragFeedback').html(d.label + ": " + d.x.toFixed(1) + ", " + d.y.toFixed(1));
		//console.log(d.label + ": " + d.x.toFixed(1) + ", " + d.y.toFixed(1));
		$('#dragFeedback').show();
		$('#dragFeedback').css('position', 'absolute')
									 .css('left',event.targetTouches[0].pageX-$('#dragFeedback').width()/2)
									 .css('top',event.targetTouches[0].pageY-30)
									 .css('z-index', 10000);
	}
}

function dataXTouchStart(event){
	if (!graphCollection.editModeEnabled){
		var curX = event.targetTouches[0].clientX;
		var curY = event.targetTouches[0].clientY;
								
		$('#dragFeedback').html(category);
		$('#dragFeedback').show();
		$('#dragFeedback').css('position', 'absolute')
											 .css('left',curX)
											 .css('top',curY)
											 .css('z-index', 10);
	}
}

function dataYTouchStart(event){
	if (!graphCollection.editModeEnabled){
		var curX = event.targetTouches[0].clientX-$('#dragFeedback').width()/2;
		var curY = event.targetTouches[0].clientY-30;
		var d = touch.dataObj;
		
		$('#dragFeedback').html(d.label + ", " + graph.y.invert(d.y).toFixed(1));
		$('#dragFeedback').show();
		$('#dragFeedback').css('position', 'absolute')
											 .css('left',curX)
											 .css('top',curY)
											 .css('z-index', 10);
	}
}

function dataBothTopTouchStart(event){
	if (!graphCollection.editModeEnabled){
		var curX = event.targetTouches[0].clientX;
		var curY = event.targetTouches[0].clientY;
								
		$('#dragFeedback').html(category);
		$('#dragFeedback').show();
		$('#dragFeedback').css('position', 'absolute')
											 .css('left',curX)
											 .css('top',curY)
											 .css('z-index', 10);
	}
}

function dataBothBottomTouchStart(event){
	if (!graphCollection.editModeEnabled){
		var curX = event.targetTouches[0].clientX;
		var curY = event.targetTouches[0].clientY;
								
		$('#dragFeedback').html(category);
		$('#dragFeedback').show();
		$('#dragFeedback').css('position', 'absolute')
											 .css('left',curX)
											 .css('top',curY)
											 .css('z-index', 10);
	}
}

function sideCatTouchStart(event, category){
	var curX = event.targetTouches[0].clientX;
	var curY = event.targetTouches[0].clientY;
							
	$('#dragFeedback').html(category);
	$('#dragFeedback').show();
	$('#dragFeedback').css('position', 'absolute')
										 .css('left',curX)
										 .css('top',curY)
										 .css('z-index', 10);
}

//function graphXCatTouchStart(event){
	//var curX = event.targetTouches[0].pageX -
							//$('span').offset().left -
							//graphCollection.padLeft + 14;
							
	//var curY = event.targetTouches[0].pageY - 
							//$('span').offset().top - 
							//graphCollection.padTop;
	//touch.draggedObj.left(curX);
	//touch.draggedObj.top(curY);
	//touch.draggedObj.visible(true);
	//touch.draggedObj.render();
//}

//function graphYCatTouchStart(event){
	//var curX = event.targetTouches[0].pageX -
							//$('span').offset().left -
							//graphCollection.padLeft + 14;
							
	//var curY = event.targetTouches[0].pageY - 
							//$('span').offset().top - 
							//graphCollection.padTop;
	//touch.draggedObj.left(curX);
	//touch.draggedObj.top(curY);
	//touch.draggedObj.visible(true);
	//touch.draggedObj.render();
//}

function ellipseMoveTouchStart(event){
	
}

function ellipseAdjustTouchStart(event){
	
}

function udLineMoveTouchStart(event){
	
}

function udLineAdjustTouchStart(event){
	
}

document.addEventListener("touchmove", touchMove, false);

function touchMove(event){
  if (!touch.dragging) return;
	
	switch (touch.dragType){
		case "dataCorr":
			dataCorrTouchMove(event);
			break;
		case "dataX":
			dataXTouchMove(event);
			break;
		case "dataY":
			dataYTouchMove(event);
			break;
		case "dataBothTop":
			dataBothTopTouchMove(event);
			break;
		case "dataBothBottom":
			dataBothBottomTouchMove(event);
			break;
//		case "sideCat":
//			sideCatTouchMove(event);
//			break;
//		case "graphXCat":
//			graphXCatTouchMove(event);
//			break;
//		case "graphYCat":
//			graphYCatTouchMove(event);
//			break;
		case "ellipseMove":
			ellipseMoveTouchMove(event);
			break;
		case "ellipseAdjust":
			ellipseAdjustTouchMove(event);
			break;
		case "udLineMove":
			udLineMoveTouchMove(event);
			break;
		case "udLineAdjust":
			udLineAdjustTouchMove(event);
			break;
	}
}

function 	dataCorrTouchMove(event){
	var graph = graphCollection.graphs[touch.graphIndex];
	
	var mouseX = event.targetTouches[0].pageX -
							$('span').offset().left -
							graphCollection.padLeft - 
							touch.graphPanel.left();
							
	var mouseY = graph.h - (event.targetTouches[0].pageY - 
													$('span').offset().top - 
													graphCollection.padTop - 
													touch.graphPanel.top());
													
	touch.finalX = mouseX;
	touch.finalY = mouseY;
							
	var d = touch.dataObj;
	var dragLabel = touch.dragLabel;
	
	if (graphCollection.editModeEnabled &&
			mouseX >= 0 &&
			mouseX <= graph.w &&
			mouseY >= 0 &&
			mouseY <= graph.h){
		
		var worksheetX = null;
		for (key in graphCollection.worksheets){
			if (graphCollection.worksheets[key].data[graph.xData] != undefined)
				worksheetX = graphCollection.worksheets[key];
		}
		var worksheetY = null;
		for (key in graphCollection.worksheets){
			if (graphCollection.worksheets[key].data[graph.yData] != undefined)
				worksheetY = graphCollection.worksheets[key];
		}
		
		graphCollection.editSinglePoint(worksheetX, graph.xData, d.label, graph.x.invert(mouseX));
		graphCollection.editSinglePoint(worksheetY, graph.yData, d.label, graph.y.invert(mouseY));
		
		dragLabel.text(graph.x.invert(mouseX).toFixed(1) +
										", " +
									graph.y.invert(mouseY).toFixed(1));
		dragLabel.left(mouseX)
		dragLabel.bottom(mouseY + 20)
		dragLabel.visible(true)
		
		vis.render();
	} else {
		dragLabel.text("Delete");
		vis.render();
	}
	$('#dragFeedback').css('position', 'absolute')
									 .css('left',event.targetTouches[0].pageX - $('#dragFeedback').width()/2)
									 .css('top',event.targetTouches[0].pageY - 30)
									 .css('z-index', 10000);
}

function dataXTouchMove(event){
	var graph = graphCollection.graphs[touch.graphIndex];
	
	var mouseX = event.targetTouches[0].pageX -
							$('span').offset().left -
							graphCollection.padLeft + 14 - 
							touch.graphPanel.left();
							
	var mouseY = graph.h - (event.targetTouches[0].pageY - 
													$('span').offset().top - 
													graphCollection.padTop - 
													touch.graphPanel.top());
													
	touch.finalX = mouseX;
	touch.finalY = mouseY;
							
	var d = touch.dataObj;
	var dragLabel = touch.dragLabel;
	
	if (graphCollection.editModeEnabled &&
			mouseX >= 0 &&
			mouseX <= graph.w &&
			mouseY >= 0 &&
			mouseY <= graph.h){
		
		var worksheet = null;
		for (key in graphCollection.worksheets){
			if (graphCollection.worksheets[key].data[graph.xData] != undefined)
				worksheet = graphCollection.worksheets[key];
		}
		
		graphCollection.editSinglePoint(worksheet, graph.xData, d.label, graph.x.invert(mouseX));
		
		dragLabel.text(graph.x.invert(mouseX).toFixed(1));
		dragLabel.left(mouseX)
		dragLabel.bottom(mouseY + 20)
		dragLabel.visible(true)
		
		vis.render();
	} else {
		dragLabel.text("Delete");
		vis.render();
	}
}

function dataYTouchMove(event){
	var graph = graphCollection.graphs[touch.graphIndex];
	
	var mouseX = event.targetTouches[0].pageX -
							$('span').offset().left -
							graphCollection.padLeft + 14 - 
							touch.graphPanel.left();
							
	var mouseY = graph.h - (event.targetTouches[0].pageY - 
													$('span').offset().top - 
													graphCollection.padTop - 
													touch.graphPanel.top());
													
	touch.finalX = mouseX;
	touch.finalY = mouseY;
							
	var d = touch.dataObj;
	var dragLabel = touch.dragLabel;
	
	if (graphCollection.editModeEnabled){
		if (mouseX >= 0 &&
				mouseX <= graph.w &&
				mouseY >= 0 &&
				mouseY <= graph.h){
				
			var worksheet = null;
			for (key in graphCollection.worksheets){
				if (graphCollection.worksheets[key].data[graph.yData] != undefined)
					worksheet = graphCollection.worksheets[key];
			}
			
			graphCollection.editSinglePoint(worksheet, graph.yData, d.label, graph.y.invert(mouseY));
			
			dragLabel.text(graph.y.invert(mouseY).toFixed(1));
			dragLabel.left(mouseX)
			dragLabel.bottom(mouseY+20)
			dragLabel.visible(true)
			vis.render();
		} else {
			dragLabel.text("Delete");
			vis.render();
		}
	} else {
		var curX = event.targetTouches[0].clientX-$('#dragFeedback').width()/2;
		var curY = event.targetTouches[0].clientY-30;
		
		$('#dragFeedback').html(d.label + ", " + graph.y.invert(d.y).toFixed(1));
		$('#dragFeedback').show();
		$('#dragFeedback').css('position', 'absolute')
											 .css('left',curX)
											 .css('top',curY)
											 .css('z-index', 10);
	}
}

function dataBothTopTouchMove(event){
	var graph = graphCollection.graphs[touch.graphIndex];
	
	var mouseX = event.targetTouches[0].pageX -
							$('span').offset().left -
							graphCollection.padLeft + 14 - 
							touch.graphPanel.left() -
							touch.topSubgraph.left();
							
	var mouseY = touch.topSubgraph.height() - 
												 (event.targetTouches[0].pageY - 
													$('span').offset().top - 
													graphCollection.padTop - 
													touch.graphPanel.top());
													
	var height = touch.topSubgraph.height();
												
	touch.finalX = mouseX;
	touch.finalY = mouseY;
							
	var d = touch.dataObj;
	var dragLabel = touch.dragLabel;
	if (graphCollection.editModeEnabled &&
			mouseX >= 0 &&
			mouseX <= graph.w &&
			mouseY >= 0 &&
			mouseY <= height){
				
		var worksheet = null;
		for (key in graphCollection.worksheets){
			if (graphCollection.worksheets[key].data[graph.yData] != undefined)
				worksheet = graphCollection.worksheets[key];
		}
		graphCollection.editSinglePoint(worksheet, graph.yData, d.label, graph.yHoriz.invert(mouseX));
		
		dragLabel.text(graph.yHoriz.invert(mouseX).toFixed(1));
		dragLabel.left(mouseX)
		dragLabel.bottom(mouseY + 20)
		dragLabel.visible(true)
		
		vis.render();
	} else {
		dragLabel.text("Delete");
		vis.render();
	}
}

function dataBothBottomTouchMove(event){
	var graph = graphCollection.graphs[touch.graphIndex];
	
	var mouseX = event.targetTouches[0].pageX -
							$('span').offset().left -
							graphCollection.padLeft + 14 - 
							touch.graphPanel.left() - 
							touch.bottomSubgraph.left();
							
	var mouseY = touch.bottomSubgraph.height() - 
												 (event.targetTouches[0].pageY - 
													$('span').offset().top - 
													graphCollection.padTop - 
													touch.graphPanel.top() -
													touch.bottomSubgraph.top());
													
	touch.finalX = mouseX;
	touch.finalY = mouseY;
							
	var d = touch.dataObj;
	var dragLabel = touch.dragLabel;
	
	if (graphCollection.editModeEnabled &&
			mouseX >= 0 &&
			mouseX <= graph.w &&
			mouseY >= 0 &&
			mouseY <= touch.bottomSubgraph.height()){
				
		var worksheet = null;
		for (key in graphCollection.worksheets){
			if (graphCollection.worksheets[key].data[graph.xData] != undefined)
				worksheet = graphCollection.worksheets[key];
		}
		
		graphCollection.editSinglePoint(worksheet, graph.xData, d.label, graph.x.invert(mouseX));
		
		dragLabel.text(graph.x.invert(mouseX).toFixed(1));
		dragLabel.left(mouseX)
		dragLabel.bottom(mouseY + 20)
		dragLabel.visible(true)
		
		vis.render();
	} else {
		dragLabel.text("Delete");
		vis.render();
	}
}

function sideCatTouchMove(event, category){
	event.preventDefault();

	var curX = event.targetTouches[0].clientX;
	var curY = event.targetTouches[0].clientY;
							
	touch.finalX = curX;
	touch.finalY = curY;
							
	$('#dragFeedback').html(category);
	$('#dragFeedback').show();
	$('#dragFeedback').css('position', 'absolute')
								 .css('left',curX)
								 .css('top',curY)
								 .css('z-index', 10000);
								 
	for (var i=0; i<graphCollection.graphs.length; i++){
		var graph = graphCollection.graphs[i]; 
		if (curX - $('#XAxis'+i).offset().left >= 0 &&
				curX - $('#XAxis'+i).offset().left <= graph.w &&
				curY - $('#XAxis'+i).offset().top >= 0 &&
				curY - $('#XAxis'+i).offset().top <= 40)
		{
			$('#XAxis'+i).attr('class','axisOver');
		} else {
			$('#XAxis'+i).attr('class','axisDef');
		}
		
		if (graph.twoDistView && graph.xData != null && graph.yData != null){
			if (curX - ($('#YAxisHorizontal'+i).offset().left) >= 0 &&
					curX - ($('#YAxisHorizontal'+i).offset().left) <= graph.w &&
					curY - ($('#YAxisHorizontal'+i).offset().top) >= 0 &&
					curY - ($('#YAxisHorizontal'+i).offset().top) <= 40)
			{
				$('#YAxisHorizontal'+i).attr('class','axisOver');
			} else {
				$('#YAxisHorizontal'+i).attr('class','axisDef');
			}
		} 
		else {
			if (curX - ($('#YAxis'+i).offset().left) >= 0 &&
					curX - ($('#YAxis'+i).offset().left) <= 40 &&
					curY - ($('#YAxis'+i).offset().top) >= 0 &&
					curY - ($('#YAxis'+i).offset().top) <= graph.h)
			{
				$('#YAxis'+i).attr('class','axisOver');
			} else {
				$('#YAxis'+i).attr('class','axisDef');
			}
		}
	}
}

//function graphXCatTouchMove(event){
	//var curX = event.targetTouches[0].pageX -
							//$('span').offset().left -
							//graphCollection.padLeft + 14;
							
	//var curY = event.targetTouches[0].pageY - 
							//$('span').offset().top - 
							//graphCollection.padTop;
							
	//var which = whichDropZone(curX,curY);
	
	//graphCollection.graphs.forEach(function(g){
		//g.yAxisPanel.fillStyle(pv.rgb(0,0,0,0));
		//g.xAxisPanel.fillStyle(pv.rgb(0,0,0,0));
	//})
	
	//if (which != false){
		//which.gPan.fillStyle(pv.rgb(50,50,50,0.25));
	//}
	
	//graphCollection.graphs.forEach(function(g){
		//g.yAxisPanel.render();
		//g.xAxisPanel.render();
	//})
	
	//touch.draggedObj.left(curX);
	//touch.draggedObj.top(curY);
	//touch.draggedObj.render();
	//touch.finalX = curX;
	//touch.finalY = curY;
//}

//function graphYCatTouchMove(event){
	//var curX = event.targetTouches[0].pageX -
							//$('span').offset().left -
							//graphCollection.padLeft + 14;
							
	//var curY = event.targetTouches[0].pageY - 
							//$('span').offset().top - 
							//graphCollection.padTop;
							
	//var which = whichDropZone(curX,curY);
	
	//graphCollection.graphs.forEach(function(g){
		//g.yAxisPanel.fillStyle(pv.rgb(0,0,0,0));
		//g.xAxisPanel.fillStyle(pv.rgb(0,0,0,0));
	//})
	
	//if (which != false){
		//which.gPan.fillStyle(pv.rgb(50,50,50,0.25));
	//}
	
	//graphCollection.graphs.forEach(function(g){
		//g.yAxisPanel.render();
		//g.xAxisPanel.render();
	//})
	
	//touch.draggedObj.left(curX);
	//touch.draggedObj.top(curY);
	//touch.draggedObj.render();
	//touch.finalX = curX;
	//touch.finalY = curY;
//}

function ellipseMoveTouchMove(event){
	var graph = graphCollection.graphs[touch.graphIndex];
	
	var mouseX = event.targetTouches[0].pageX -
							$('span').offset().left -
							graphCollection.padLeft + 14 - 
							touch.graphPanel.left();
							
	var mouseY = event.targetTouches[0].pageY - 
							$('span').offset().top - 
							graphCollection.padTop - 
							touch.graphPanel.top();

	if (mouseX > 0 && mouseX < graph.w && mouseY > 0 && mouseY < graph.h){
		graph.ellipseCX = mouseX;
		graph.ellipseCY = graph.h - mouseY;
	}

	graph.pointsInEllipse = numPointsInEllipse(graph);
			
	touch.graphPanel.render();
}

function ellipseAdjustTouchMove(event){
	var graph = graphCollection.graphs[touch.graphIndex];
	var index = touch.ellipseHandleIndex;
	
	var mouseX = event.targetTouches[0].pageX -
							$('span').offset().left -
							graphCollection.padLeft + 14 - 
							touch.graphPanel.left();
							
	var mouseY = event.targetTouches[0].pageY - 
							$('span').offset().top - 
							graphCollection.padTop - 
							touch.graphPanel.top();
							
	mouseY = graph.h - mouseY;
	
	
		handleX = getEllipseManipCoords(graph)[index][0],
		handleY = getEllipseManipCoords(graph)[index][1],
		
		mouseVec = pv.vector(graph.ellipseCX - mouseX
							,graph.ellipseCY - mouseY),
		
		handleVec = pv.vector(graph.ellipseCX - handleX
							,graph.ellipseCY - handleY).norm();

	var detHndlMs = determinantBtwnVec(handleVec, mouseVec);
	var rotDist = angleBtwnVec(mouseVec, handleVec);			

	if (mouseX > (0 - graphCollection.padLeft) 
		&& mouseX < (graph.w + graphCollection.padRight) 
		&& mouseY > (0 - graphCollection.padBot) 
		&& mouseY < (graph.h + graphCollection.padTop)){
		
		//Rotation
		if (!isNaN(rotDist)){
			if (detHndlMs > 0){
				graph.angle = (graph.angle + rotDist) % (2*Math.PI);
			}else{
				graph.angle = (graph.angle - rotDist) % (2*Math.PI);
			}
		}
		 
		//Radius Inc/Dec
		if (index % 2 == 0){
			graph.xRadius = mouseVec.length();
		}else{
			graph.yRadius = mouseVec.length();
		}
	}

	graph.pointsInEllipse = numPointsInEllipse(graph);
			
	touch.graphPanel.render();
}

function udLineMoveTouchMove(event){
	var graph = graphCollection.graphs[touch.graphIndex];
	
	
	var	handle = getUserLineMidpoint(graph);
		
	var panelX = event.targetTouches[0].pageX -
							$('span').offset().left -
							graphCollection.padLeft + 14 - 
							touch.graphPanel.left();
							
	var panelY = event.targetTouches[0].pageY - 
							$('span').offset().top - 
							graphCollection.padTop - 
							touch.graphPanel.top();
							
	var mouseX = graph.x.invert(panelX);
	var	mouseY = graph.y.invert(panelY);
		
	if (panelX > 0 && panelX < graph.w && panelY > 0 && panelY < graph.h){					
		graph.userDrawnLinePoints[0].x += mouseX - handle[0].x;
		graph.userDrawnLinePoints[1].x += mouseX - handle[0].x;
		graph.userDrawnLinePoints[0].y += mouseY - handle[0].y;
		graph.userDrawnLinePoints[1].y += mouseY - handle[0].y;
	}
	
	if (graph.userDrawnLinePoints[0].x > graph.x.domain()[1])
		graph.userDrawnLinePoints[0].x = graph.x.domain()[1]
		
	if (graph.userDrawnLinePoints[0].x < graph.x.domain()[0])
		graph.userDrawnLinePoints[0].x = graph.x.domain()[0]
		
	if (graph.userDrawnLinePoints[0].y > graph.y.domain()[1])
		graph.userDrawnLinePoints[0].y = graph.y.domain()[1]
		
	if (graph.userDrawnLinePoints[0].y < graph.y.domain()[0])
		graph.userDrawnLinePoints[0].y = graph.y.domain()[0]
		
	if (graph.userDrawnLinePoints[1].x > graph.x.domain()[1])
		graph.userDrawnLinePoints[1].x = graph.x.domain()[1]
		
	if (graph.userDrawnLinePoints[1].x < graph.x.domain()[0])
		graph.userDrawnLinePoints[1].x = graph.x.domain()[0]
		
	if (graph.userDrawnLinePoints[1].y > graph.y.domain()[1])
		graph.userDrawnLinePoints[1].y = graph.y.domain()[1]
		
	if (graph.userDrawnLinePoints[1].y < graph.y.domain()[0])
		graph.userDrawnLinePoints[1].y = graph.y.domain()[0]
	
	
	touch.graphPanel.render();
}

function udLineAdjustTouchMove(event){
	var graph = graphCollection.graphs[touch.graphIndex];
	var index = touch.udLineHandleIndex;
	
	var panelX = event.targetTouches[0].pageX -
							$('span').offset().left -
							graphCollection.padLeft + 14 - 
							touch.graphPanel.left();
							
	var panelY = event.targetTouches[0].pageY - 
							$('span').offset().top - 
							graphCollection.padTop - 
							touch.graphPanel.top();
							
	var mouseX = graph.x.invert(panelX);
	var	mouseY = graph.y.invert(panelY);
		
	if (panelX > 0 && panelX < graph.w && panelY > 0 && panelY < graph.h){
		graph.userDrawnLinePoints[index].x = mouseX;
		graph.userDrawnLinePoints[index].y = mouseY;
	} else {
		graph.userDrawnLinePoints[index].x = mouseX;
		graph.userDrawnLinePoints[index].y = mouseY;
		if (panelX < 0)
			graph.userDrawnLinePoints[index].x = graph.x.domain()[0];
		if (panelX > graph.w)
			graph.userDrawnLinePoints[index].x = graph.x.domain()[1];
		if (panelY < 0)
			graph.userDrawnLinePoints[index].y = graph.y.domain()[0];
		if (panelY > graph.h)
			graph.userDrawnLinePoints[index].y = graph.y.domain()[1];
	}
	
	touch.graphPanel.render();
}

document.addEventListener("touchend", touchEnd, false);

function touchEnd(event){
  if (!touch.dragging) return;
	
	switch (touch.dragType){
		case "dataCorr":
			dataCorrTouchEnd(event);
			break;
		case "dataX":
			dataXTouchEnd(event);
			break;
		case "dataY":
			dataYTouchEnd(event);
			break;
		case "dataBothTop":
			dataBothTopTouchEnd(event);
			break;
		case "dataBothBottom":
			dataBothBottomTouchEnd(event);
			break;
//		case "sideCat":
//			sideCatTouchEnd(event);
//			break;
//		case "graphXCat":
//			graphXCatTouchEnd(event);
//			break;
//		case "graphYCat":
//			graphYCatTouchEnd(event);
//			break;
		case "ellipseMove":
			ellipseMoveTouchEnd(event);
			break;
		case "ellipseAdjust":
			ellipseAdjustTouchEnd(event);
			break;
		case "udLineMove":
			udLineMoveTouchEnd(event);
			break;
		case "udLineAdjust":
			udLineAdjustTouchEnd(event);
			break;
	}
}

function	dataCorrTouchEnd(event){
	if (graphCollection.editModeEnabled){
		var graph = graphCollection.graphs[touch.graphIndex];
		var graphPanel = touch.graphPanel;
	
		var mouseX = touch.finalX;
		var mouseY = touch.finalY;
								
		var d = touch.dataObj;
		var dragLabel = touch.dragLabel;
		
		var worksheetX = null;
		for (key in graphCollection.worksheets){
			if (graphCollection.worksheets[key].data[graph.xData] != undefined)
				worksheetX = graphCollection.worksheets[key];
		}
		var worksheetY = null;
		for (key in graphCollection.worksheets){
			if (graphCollection.worksheets[key].data[graph.yData] != undefined)
				worksheetY = graphCollection.worksheets[key];
		}
		
		var newXData = worksheetX.data[graph.xData];
		var newYData = worksheetY.data[graph.yData];
		var remIndex = null;
		newXData.forEach(function(data, index){
			if (data.label == d.label && 
			(mouseX < 0 ||
			 mouseX > graph.w ||
			 mouseY < 0 ||
			 mouseY > graph.h))
			{
				remIndex = index;
			}
		});
		if (remIndex != null)
			newXData.splice(remIndex,1);
		graphCollection.editData(worksheetX, graph.xData,graph.xData,newXData);
		
		remIndex = null;
		newYData.forEach(function(data, index){
			if (data.label == d.label && 
			(mouseX < 0 ||
			 mouseX > graph.w ||
			 mouseY < 0 ||
			 mouseY > graph.h))
			{
				remIndex = index;
			}
		});
		if (remIndex != null)
			newYData.splice(remIndex,1);
		graphCollection.editData(worksheetY, graph.yData,graph.yData,newYData);
		
		dragLabel.visible(false);
		touch.reset();
		//vis.render();
		constructVis();
	}
	$('#dragFeedback').hide();
	touch.reset();
}

function dataXTouchEnd(event){
	if (graphCollection.editModeEnabled){
		var graph = graphCollection.graphs[touch.graphIndex];
		var graphPanel = touch.graphPanel;
	
		var mouseX = touch.finalX;
		var mouseY = touch.finalY;
								
		var d = touch.dataObj;
		var dragLabel = touch.dragLabel;
		
		var worksheet = null;
		for (key in graphCollection.worksheets){
			if (graphCollection.worksheets[key].data[graph.xData] != undefined)
				worksheet = graphCollection.worksheets[key];
		}
		
		var newXData = worksheet.data[graph.xData];
		var remIndex = null;
		newXData.forEach(function(data, index){
			if (data.label == d.label && 
			(mouseX < 0 ||
			 mouseX > graph.w ||
			 mouseY < 0 ||
			 mouseY > graph.h))
			{
				remIndex = index;
			}
		});
		if (remIndex != null)
			newXData.splice(remIndex,1);
		graphCollection.editData(worksheet, graph.xData,graph.xData,newXData);
				
		dragLabel.visible(false);
		touch.reset();
		vis.render();
	}
}

function dataYTouchEnd(event){
	if (graphCollection.editModeEnabled){
		var graph = graphCollection.graphs[touch.graphIndex];
		var graphPanel = touch.graphPanel;
	
		var mouseX = touch.finalX;
		var mouseY = touch.finalY;
								
		var d = touch.dataObj;
		var dragLabel = touch.dragLabel;
		
		var worksheet = null;
		for (key in graphCollection.worksheets){
			if (graphCollection.worksheets[key].data[graph.yData] != undefined)
				worksheet = graphCollection.worksheets[key];
		}
		
		var newYData = worksheet.data[graph.yData];
		var remIndex = null;
		newYData.forEach(function(data, index){
			if (data.label == d.label && 
			(mouseX < 0 ||
			 mouseX > graph.w ||
			 mouseY < 0 ||
			 mouseY > graph.h))
			{
				remIndex = index;
			}
		});
		if (remIndex != null)
			newYData.splice(remIndex,1);
		graphCollection.editData(worksheet, graph.yData,graph.yData,newYData);
		
		dragLabel.visible(false);
		touch.reset();
		vis.render();
	}
	touch.reset();
}

function dataBothTopTouchEnd(event){
	if (graphCollection.editModeEnabled){
		var graph = graphCollection.graphs[touch.graphIndex];
		var graphPanel = touch.graphPanel;
	
		var mouseX = touch.finalX;
		var mouseY = touch.finalY;
								
		var d = touch.dataObj;
		var dragLabel = touch.dragLabel;
		
		var worksheet = null;
		for (key in graphCollection.worksheets){
			if (graphCollection.worksheets[key].data[graph.yData] != undefined)
				worksheet = graphCollection.worksheets[key];
		}
		
		var newYData = worksheet.data[graph.yData];
		var remIndex = null;
		newYData.forEach(function(data, index){
			if (data.label == d.label && 
			(mouseX < 0 ||
			 mouseX > graph.w ||
			 mouseY < 0 ||
			 mouseY > touch.topSubgraph.height()))
			{
				remIndex = index;
			}
		});
		if (remIndex != null)
			newYData.splice(remIndex,1);
		graphCollection.editData(worksheet, graph.yData,graph.yData,newYData);
				
		dragLabel.visible(false);
		touch.reset();
		vis.render();
	}
}

function dataBothBottomTouchEnd(event){
	if (graphCollection.editModeEnabled){
		var graph = graphCollection.graphs[touch.graphIndex];
		var graphPanel = touch.graphPanel;
	
		var mouseX = touch.finalX;
		var mouseY = touch.finalY;
								
		var d = touch.dataObj;
		var dragLabel = touch.dragLabel;
		
		var worksheet = null;
		for (key in graphCollection.worksheets){
			if (graphCollection.worksheets[key].data[graph.xData] != undefined)
				worksheet = graphCollection.worksheets[key];
		}
		
		var newXData = worksheet.data[graph.xData];
		var remIndex = null;
		newXData.forEach(function(data, index){
			if (data.label == d.label && 
			(mouseX < 0 ||
			 mouseX > graph.w ||
			 mouseY < 0 ||
			 mouseY > touch.bottomSubgraph.height()))
			{
				remIndex = index;
			}
		});
		if (remIndex != null)
			newXData.splice(remIndex,1);
		graphCollection.editData(worksheet, graph.xData,graph.xData,newXData);
				
		dragLabel.visible(false);
		touch.reset();
		vis.render();
	}
}

function sideCatTouchEnd(event, category){
	var curX = touch.finalX;
	var curY = touch.finalY; 
	
	$('#dragFeedback').hide();
	
	for (var i=0; i<graphCollection.graphs.length; i++){	
		var graph = graphCollection.graphs[i];			 
		if (curX - $('#XAxis'+i).offset().left >= 0 &&
				curX - $('#XAxis'+i).offset().left <= graph.w &&
				curY - $('#XAxis'+i).offset().top >= 0 &&
				curY - $('#XAxis'+i).offset().top <= 40)
		{
			graph.assignX(category);
			constructVis();
		}
		
		if (graph.twoDistView && graph.xData != null && graph.yData != null){
			if (curX - ($('#YAxisHorizontal'+i).offset().left) >= 0 &&
					curX - ($('#YAxisHorizontal'+i).offset().left) <= graph.w &&
					curY - ($('#YAxisHorizontal'+i).offset().top) >= 0 &&
					curY - ($('#YAxisHorizontal'+i).offset().top) <= 40)
			{
				graph.assignY(category);
				constructVis();
			}
		} 
		else {
			if (curX - ($('#YAxis'+i).offset().left) >= 0 &&
					curX - ($('#YAxis'+i).offset().left) <= 80 &&
					curY - ($('#YAxis'+i).offset().top) >= 0 &&
					curY - ($('#YAxis'+i).offset().top) <= graph.h)
			{
				graph.assignY(category);
				constructVis();
			}
		}
	}
	
	touch.touch = true;
	constructVis();
	touch.reset();
}

//function graphXCatTouchEnd(event){
	//var curX = touch.finalX;
							
	//var curY = touch.finalY;
							
	//var which = whichDropZone(curX,curY);
	
	//graphCollection.graphs.forEach(function(g){
		//g.yAxisPanel.fillStyle(pv.rgb(0,0,0,0));
		//g.xAxisPanel.fillStyle(pv.rgb(0,0,0,0));
	//});
	
	//if ((curX > 0 && curX < graphCollection.w && curY > 0 && curY < graphCollection.h) || which != false){
		//if (which.gAxis == "y"){
			//if (which.gInd == touch.graphIndex){
				//var xCat = graphCollection.graphs[which.gInd].xData;
				//graphCollection.graphs[which.gInd].assignX(graphCollection.graphs[which.gInd].yData);
				//graphCollection.graphs[which.gInd].assignY(xCat);
			//} else {
				//graphCollection.graphs[which.gInd].assignY(graphCollection.graphs[touch.graphIndex].xData);
				//graphCollection.graphs[touch.graphIndex].assignX(null);
			//}
		//} else if (which.gAxis == "x" && which.gInd != touch.graphIndex){
			//graphCollection.graphs[which.gInd].assignX(graphCollection.graphs[touch.graphIndex].xData);
			//graphCollection.graphs[touch.graphIndex].assignX(null);
		//}
	//} else if (which == false){
		//graphCollection.graphs[touch.graphIndex].assignX(null);
	//}
	
	//graphCollection.updateMenuOptions();
	
	//touch.draggedObj.visible(false);
	//touch.reset();
//}

//function graphYCatTouchEnd(event){
	//var curX = touch.finalX;
							
	//var curY = touch.finalY;
							
	//var which = whichDropZone(curX,curY);
	
	//graphCollection.graphs.forEach(function(g){
		//g.yAxisPanel.fillStyle(pv.rgb(0,0,0,0));
		//g.xAxisPanel.fillStyle(pv.rgb(0,0,0,0));
	//});
	
	//if ((curX > 0 && curX < graphCollection.w && curY > 0 && curY < graphCollection.h) || which != false){
		//if (which.gAxis == "x"){
			//if (which.gInd == touch.graphIndex){
				//var xCat = graphCollection.graphs[which.gInd].xData;
				//graphCollection.graphs[which.gInd].assignX(graphCollection.graphs[which.gInd].yData);
				//graphCollection.graphs[which.gInd].assignY(xCat);
			//} else {
				//graphCollection.graphs[which.gInd].assignX(graphCollection.graphs[touch.graphIndex].yData);
				//graphCollection.graphs[touch.graphIndex].assignY(null);
			//}
		//} else if (which.gAxis == "y" && which.gInd != touch.graphIndex){
			//graphCollection.graphs[which.gInd].assignY(graphCollection.graphs[touch.graphIndex].yData);
			//graphCollection.graphs[touch.graphIndex].assignY(null);
		//}
	//} else if (which == false){
		//graphCollection.graphs[touch.graphIndex].assignY(null);
	//}
	
	//graphCollection.updateMenuOptions();
	
	//touch.draggedObj.visible(false);
	//touch.reset();
//}

function ellipseMoveTouchEnd(event){
	touch.reset();
}

function ellipseAdjustTouchEnd(event){
	touch.reset();
}

function udLineMoveTouchEnd(event){
	touch.reset();
}

function udLineAdjustTouchEnd(event){
	touch.reset();
}

function legPanTouchStart(event, category, index, axis){
	var curX = event.targetTouches[0].clientX;
	var curY = event.targetTouches[0].clientY;
	
	touch.category = category;
	touch.fromGraph = index;
	touch.fromAxis = axis;
	$('#dragFeedback').html(category);
	$('#dragFeedback').show();
	$('#dragFeedback').css('position', 'absolute')
								 .css('left',curX)
								 .css('top',curY)
								 .css('z-index', 10);
}

function legPanTouchMove(event){
	event.preventDefault();
	var curX = event.targetTouches[0].clientX;
	var curY = event.targetTouches[0].clientY;
	
	$('#dragFeedback').css('position', 'absolute')
								 .css('left',curX)
								 .css('top',curY)
								 .css('z-index', 10000);
	
	touch.finalX = curX;
	touch.finalY = curY;
								 
	for (var i=0; i<graphCollection.graphs.length; i++){
		var graph = graphCollection.graphs[i];				 
		if (curX - $('#XAxis'+i).offset().left >= 0 &&
				curX - $('#XAxis'+i).offset().left <= graph.w &&
				curY - $('#XAxis'+i).offset().top >= 0 &&
				curY - $('#XAxis'+i).offset().top <= 40)
		{
			$('#XAxis'+i).attr('class','axisOver');
		} else {
			$('#XAxis'+i).attr('class','axisDef');
		}
		
		if (graph.twoDistView && graph.xData != null && graph.yData != null){
			if (curX - ($('#YAxisHorizontal'+i).offset().left) >= 0 &&
					curX - ($('#YAxisHorizontal'+i).offset().left) <= graph.w &&
					curY - ($('#YAxisHorizontal'+i).offset().top) >= 0 &&
					curY - ($('#YAxisHorizontal'+i).offset().top) <= 40)
			{
				$('#YAxisHorizontal'+i).attr('class','axisOver');
			} else {
				$('#YAxisHorizontal'+i).attr('class','axisDef');
			}
		} 
		else {
			if (curX - ($('#YAxis'+i).offset().left) >= 0 &&
					curX - ($('#YAxis'+i).offset().left) <= 40 &&
					curY - ($('#YAxis'+i).offset().top) >= 0 &&
					curY - ($('#YAxis'+i).offset().top) <= graph.h)
			{
				$('#YAxis'+i).attr('class','axisOver');
			} else {
				$('#YAxis'+i).attr('class','axisDef');
			}
		}
	}
}

function legPanTouchEnd(event){
	$('#dragFeedback').hide();
	
	var curX = touch.finalX;
	var curY = touch.finalY;
	
	var visX = curX -
						 $('span').offset().left -
						 graphCollection.padLeft + 40;
							
	var visY = curY - 
						 $('span').offset().top - 
						 graphCollection.padTop;
	
	if (visX > 0 && 
			visX < graphCollection.w+graphCollection.padRight && 
			visY > 0 && 
			visY < graphCollection.h+graphCollection.padBot)
	{
		for (var i=0; i<graphCollection.graphs.length; i++){
			var graph = graphCollection.graphs[i];
			if (curX - $('#XAxis'+i).offset().left >= 0 &&
					curX - $('#XAxis'+i).offset().left <= graph.w &&
					curY - $('#XAxis'+i).offset().top >= 0 &&
					curY - $('#XAxis'+i).offset().top <= 40)
			{
				var tempX = graph.xData;
				graph.assignX(touch.category);
				if (touch.fromAxis == 'y'){
					if (touch.fromGraph == i)
						graphCollection.graphs[touch.fromGraph].assignY(tempX);
					else
						graphCollection.graphs[touch.fromGraph].assignY(null);
				}else if (touch.fromGraph != i){
					graphCollection.graphs[touch.fromGraph].assignX(null);
				}
				constructVis();
			}
			
			if (graph.twoDistView && graph.xData != null && graph.yData != null){
				if (curX - ($('#YAxisHorizontal'+i).offset().left) >= 0 &&
						curX - ($('#YAxisHorizontal'+i).offset().left) <= graph.w &&
						curY - ($('#YAxisHorizontal'+i).offset().top) >= 0 &&
						curY - ($('#YAxisHorizontal'+i).offset().top) <= 40)
				{
					var tempY = graph.yData;
					graph.assignY(touch.category);
					if (touch.fromAxis == 'y' && touch.fromGraph != i){
						graphCollection.graphs[touch.fromGraph].assignY(null);
					} else {
						if (touch.fromGraph == i)
							graphCollection.graphs[touch.fromGraph].assignX(tempY);
						else
							graphCollection.graphs[touch.fromGraph].assignX(null);
					}
					constructVis();
				}
			} 
			else {
				if (curX - ($('#YAxis'+i).offset().left) >= 0 &&
						curX - ($('#YAxis'+i).offset().left) <= 80 &&
						curY - ($('#YAxis'+i).offset().top) >= 0 &&
						curY - ($('#YAxis'+i).offset().top) <= graph.h)
				{
					var tempY = graph.yData;
					graph.assignY(touch.category);
					if (touch.fromAxis == 'y' && touch.fromGraph != i){
						graphCollection.graphs[touch.fromGraph].assignY(null);
					} else {
						if (touch.fromGraph == i)
							graphCollection.graphs[touch.fromGraph].assignX(tempY);
						else
							graphCollection.graphs[touch.fromGraph].assignX(null);
					}
					constructVis();
				}
			}
		}
	} else {
		if (touch.fromAxis == 'y')
			graphCollection.graphs[touch.fromGraph].assignY(null);
		else
			graphCollection.graphs[touch.fromGraph].assignX(null);
		constructVis();
	}
	touch.touch = true;
}


//function whichDropZone(x,y){
	//if (graphCollection.graphs.length == 1){
		//var gpX = x-graphCollection.graphs[0].graphPanel.left();
		//var gpY = y-graphCollection.graphs[0].graphPanel.top();
		
		//if (gpX > graphCollection.graphs[0].yAxisPanel.left() && 
				//gpX < graphCollection.graphs[0].yAxisPanel.left() + graphCollection.graphs[0].yAxisPanel.width() &&
				//gpY > graphCollection.graphs[0].yAxisPanel.top() &&
				//gpY < graphCollection.graphs[0].yAxisPanel.top() + graphCollection.graphs[0].yAxisPanel.height())
		//{
			//return {"gInd":0,
							//"gAxis":"y",
							//"gPan":graphCollection.graphs[0].yAxisPanel};
		//}
		
		//if (gpX > graphCollection.graphs[0].xAxisPanel.left() && 
				//gpX < graphCollection.graphs[0].xAxisPanel.left() + graphCollection.graphs[0].xAxisPanel.width() &&
				//gpY > graphCollection.graphs[0].xAxisPanel.top() &&
				//gpY < graphCollection.graphs[0].xAxisPanel.top() + graphCollection.graphs[0].xAxisPanel.height())
		//{
			//return {"gInd":0,
							//"gAxis":"x",
							//"gPan":graphCollection.graphs[0].xAxisPanel};
		//}
		
		//return false;
	//} else if (graphCollection.graphs.length > 1) {
		//var gp0X = x-graphCollection.graphs[0].graphPanel.left();
		//var gp0Y = y-graphCollection.graphs[0].graphPanel.top();
		
		//if (gp0X > graphCollection.graphs[0].yAxisPanel.left() && 
				//gp0X < graphCollection.graphs[0].yAxisPanel.left() + graphCollection.graphs[0].yAxisPanel.width() &&
				//gp0Y > graphCollection.graphs[0].yAxisPanel.top() &&
				//gp0Y < graphCollection.graphs[0].yAxisPanel.top() + graphCollection.graphs[0].yAxisPanel.height())
		//{
			//return {"gInd":0,
							//"gAxis":"y",
							//"gPan":graphCollection.graphs[0].yAxisPanel};
		//}
		
		//if (gp0X > graphCollection.graphs[0].xAxisPanel.left() && 
				//gp0X < graphCollection.graphs[0].xAxisPanel.left() + graphCollection.graphs[0].xAxisPanel.width() &&
				//gp0Y > graphCollection.graphs[0].xAxisPanel.top() &&
				//gp0Y < graphCollection.graphs[0].xAxisPanel.top() + graphCollection.graphs[0].xAxisPanel.height())
		//{
			//return {"gInd":0,
							//"gAxis":"x",
							//"gPan":graphCollection.graphs[0].xAxisPanel};
		//}
		
		//var gp1X = x-graphCollection.graphs[1].graphPanel.left();
		//var gp1Y = y-graphCollection.graphs[1].graphPanel.top();
		
		//if (gp1X > graphCollection.graphs[1].yAxisPanel.left() && 
				//gp1X < graphCollection.graphs[1].yAxisPanel.left() + graphCollection.graphs[1].yAxisPanel.width() &&
				//gp1Y > graphCollection.graphs[1].yAxisPanel.top() &&
				//gp1Y < graphCollection.graphs[1].yAxisPanel.top() + graphCollection.graphs[1].yAxisPanel.height())
		//{
			//return {"gInd":1,
							//"gAxis":"y",
							//"gPan":graphCollection.graphs[1].yAxisPanel};
		//}
		
		//if (gp1X > graphCollection.graphs[1].xAxisPanel.left() && 
				//gp1X < graphCollection.graphs[1].xAxisPanel.left() + graphCollection.graphs[1].xAxisPanel.width() &&
				//gp1Y > graphCollection.graphs[1].xAxisPanel.top() &&
				//gp1Y < graphCollection.graphs[1].xAxisPanel.top() + graphCollection.graphs[1].xAxisPanel.height())
		//{
			//return {"gInd":1,
							//"gAxis":"x",
							//"gPan":graphCollection.graphs[1].xAxisPanel};
		//}
		
		//return false;
	//}
	
//}


/* Dynamic Graph Resizing */
$(window).resize(function() {
	if (graphCollection.hasOwnProperty("worksheets")){
		graphCollection.setW(graphCollection.calcGraphWidth());
		graphCollection.setH(graphCollection.calcGraphHeight());
		//constructVis();
		vis.render();
		
		positionAndSizeGraph();
		graphCollection.graphs.forEach(function(graph, index){
			positionAndSizeAxisPanels(graph,index);
			positionAndSizeGraphTitle(graph,index);
		});
	}
})


//Top Bar
//jQuery('#newSpreadsheetURL').keyup(function(event) {
  //if (event.keyCode == '13') {
	//var key = parseSpreadsheetKeyFromURL($(this).val());
	//$(this).val('');
	//exampleSpreadsheets.push(new Spreadsheet(key));
  //}
//});

function editInGoogleDocs(title){
	var URL = graphCollection.worksheets[title].URL;
	var matches = /feeds\/cells\/([A-Z|a-z|0-9|_|-]+)/.exec(URL);
	window.open('https://spreadsheets.google.com/ccc?key=' + matches[1]);
}

function refreshWorksheet(title){
	graphCollection.worksheets[title].fetchWorksheetData();
	exampleSpreadsheets.forEach(function(s){
		s.worksheets.forEach(function(w){
			if (w.title == title){
				graphCollection.addWorksheet(w);
			}
		})
	})
	if ($('#fitScaleToData').is(':checked')){
		jQuery('#fitScaleToData').attr('checked', false);
	}
	graphCollection.graphs.forEach(function(g){
		g.xData = null;
		g.yData = null;
	});
};

$('#about').click(function(){
	$('#aboutPopup').slideToggle();
});

$('#aboutPopup').hide();

function positionAboutPopup(){
	$('#aboutPopup').css('position', 'absolute')
										 .css('top', parseInt(window.innerHeight/2 - $('#aboutPopup').height()/2)+"px")
										 .css('left',parseInt(window.innerWidth/2 - $('#aboutPopup').width()/2)+"px")
										 .css('z-index',2);
}
positionAboutPopup();

/*Worksheet Menu*/
var worksheetNew;
var worksheetToEdit;
function positionWorksheetMenu(){
	$('#worksheetMenu').css('position', 'absolute')
										 .css('top', parseInt(window.innerHeight/2 - $('#worksheetMenu').height()/2)+"px")
										 .css('left',parseInt(window.innerWidth/2 - $('#worksheetMenu').width()/2)+"px")
										 .css("z-index",2);
}

$('#worksheetMenu').hide();

function openWorksheetMenu(worksheetTitle){
	var text, title;
	
	if (worksheetTitle == undefined){
		title = "*** Enter Worksheet Title ***";
		text = "*** Enter Worksheet Text ***";
		worksheetNew = true;
		$('#loadFromURL').show();
		$('#deleteWorksheet').hide();
	} else {
		title = worksheetTitle;
		text = graphCollection.worksheets[worksheetTitle].toString();
		worksheetNew = false;
		worksheetToEdit = worksheetTitle;
		$('#loadFromURL').hide();
		$('#deleteWorksheet').show();
	}
	
	$('#worksheetTitle').val(title);
	$('#worksheetText').val(text);
	positionWorksheetMenu();
	hideMenus();
	$('#worksheetMenu').slideDown();
	$('#worksheetText').focus();
	$('#worksheetText').select();
	$('#worksheetMenu').scrollTop(0);
}

$('#worksheetMenuClose').click(function(){
	$('#worksheetMenu').slideUp();
});

$('#loadFromURL').click(function(){
	hideMenus();
	positionWorksheetURLMenu();
	$('#worksheetURLMenu').slideDown();
});

$('#loadFromForm').click(function(){
	var title = $('#worksheetTitle').val();
	var rawText = $('#worksheetText').val();
	var cells = [];
	rawText.split('\n').forEach(function(line){
		cells.push(line.split('\t'));
	});
	if (validateWorksheetForm(title, cells)){
		if (worksheetNew)
			addWorksheet(title, cells);
		else
			updateWorksheet(worksheetToEdit,title,cells);
		$('#worksheetMenu').slideUp();
	}
	
});

$('#deleteWorksheet').click(function(){
	if (confirm("Are you sure you want to delete "+worksheetToEdit+"?")) { 
		hideMenus();
		graphCollection.removeWorksheet(worksheetToEdit);
		constructVis();
	}
	
	
});

function validateWorksheetForm(title, cells){
	//Check for blank or default title
	if (trim(title) == "" || title == "*** Enter Worksheet Title ***"){
		alert("Error: Dataset requires a title.");
		return false;
	}
	
	//Check for blank label type
	if(cells[0][0] == ""){
		alert("Error: Label type is blank.");
		return false;
	}
	
	//Check for more than two columns
	if (cells[0].length < 2){
		alert("Error: Data contains less than two columns.  The first column is for labels.");
		return false;
	}
	
	//Check Duplicate Labels
	for (var i=0; i<cells.length; i++){
		for (var j=0; j<cells.length; j++){
			if (cells[i][0] == cells[j][0] && i!=j && cells[i][0] != ""){
				alert("Error: Data contains duplicate labels. Duplicate label is \""+cells[j][0]+"\"");
				return false;
			}
		}
	}
	
	//Check Duplicate Dataset Titles
	for (var i=0; i<cells[0].length; i++){
		for (var j=0; j<cells[0].length; j++){
			if (cells[0][i] == cells[0][j] && i!=j){
				alert("Error: Data contains duplicate dataset titles. Duplicate title is \""+cells[0][j]+"\"");
				return false;
			}
		}
	}
	
	//Check Duplicate Worksheet Titles
	for (var key in graphCollection.worksheets){
		if (title == key && key != worksheetToEdit){
			alert("Error: Worksheet title is already used.");
			return false;
		}
	}
	
	//Check Duplicate Dataset Titles
	if (worksheetNew){
		for (var i=1; i<cells.length; i++){
			for (var key in graphCollection.data){
				if (cells[0][i] == key){
					alert("Error: a dataset already exists with the title \""+cells[0][i]+"\"");
					return false;
				}
			}
		}
	}
	
	//Check for data without label
	for (var i=0; i<cells.length; i++){
		if (cells[i][0] == "" && cells[i].length > 1){
			alert("Error: Data exists without a label.");
			return false;
		}
	}
	
	return true;
}

function addWorksheet(title, cells){
	var obj = {"title": title};
	var labelType = trim(cells[0][0]);
	var labelMasterList = [];
	var data = {};
	var edited = {};
	
	//create labelMasterList
	for (var y=1; y<cells.length; y++){
		if (trim(cells[y][0]) != "")
			labelMasterList.push(trim(cells[y][0]));
	}
	obj.labelMasterList = labelMasterList;
	obj.labelType = labelType;
	
	//create data and edited hash
	for (var x=1; x<cells[0].length; x++){
		if (trim(cells[0][x]) != ""){
			data[trim(cells[0][x])] = [];
			edited[trim(cells[0][x])] = true;
			for (var y=1; y<cells.length; y++){
				if (cells[y][0] != "" && cells[y][x] != ""){
					data[trim(cells[0][x])].push({
						"label":trim(cells[y][0]),
						"value":parseFloat(cells[y][x])
					});
				}
			}
		}
	}
	obj.data = data;
	obj.edited = edited;
	obj.userDefined = true;
	
	exampleSpreadsheets.push(new Spreadsheet(obj));
	constructVis();
};

function updateWorksheet(oldTitle, newTitle, cells){
	var URL;
	
	for (var key in graphCollection.worksheets){
		if (graphCollection.worksheets[key].title == oldTitle)
			URL = graphCollection.worksheets[key].URL;
	}
	graphCollection.removeWorksheet(oldTitle);
	addWorksheet(newTitle, cells);
	exampleSpreadsheets[exampleSpreadsheets.length-1].worksheets[0].URL = URL;
	constructVis();
}

/*Worksheet URL Menu*/
function positionWorksheetURLMenu(){
	$('#worksheetURLMenu').css('position', 'absolute')
										 .css('top', parseInt(window.innerHeight/2 - $('#worksheetURLMenu').height()/2)+"px")
										 .css('left',parseInt(window.innerWidth/2 - $('#worksheetURLMenu').width()/2)+"px")
										 .css("z-index",2);
}
$('#worksheetURLMenu').hide();

$('#backToWorksheetMenu').click(function(){
	$('#worksheetURLMenu').slideUp();
	$('#worksheetMenu').slideDown();
});

$('#submitURL').click(function(){
	var key = parseSpreadsheetKeyFromURL($('#worksheetURL').val());
	var exists = false;
	exampleSpreadsheets.forEach(function(s){
		if (s.key == key) exists = true;
	});
	if (!exists) exampleSpreadsheets.push(new Spreadsheet(key));
	else alert("Error: that worksheet has already been loaded.");
	$('#worksheetURLMenu').slideUp();
	$('#worksheetMenu').slideUp();
	constructVis();
});



/* Worksheet Description Popup */
function positionWorksheetDescriptionPopup(){
	$('#worksheetDescriptionPopup').css('position', 'absolute')
										 .css('top', parseInt(window.innerHeight/2 - $('#worksheetDescriptionPopup').height()/2)+"px")
										 .css('left',parseInt(window.innerWidth/2 - $('#worksheetDescriptionPopup').width()/2)+"px")
										 .css('z-index',2);
}
positionWorksheetDescriptionPopup();


$('#worksheetDescriptionPopup').hide();

function showWorksheetDescription(title){
	var worksheet = graphCollection.worksheets[title];
	
	$('#worksheetDescriptionParagraph').html(worksheet.description);
	$('#worksheetDescriptionTitle').html(worksheet.title + "<br>by " + worksheet.labelType);
	positionWorksheetDescriptionPopup();
	$('#worksheetDescriptionPopup').slideToggle();
}


//Graph Options
$('#graphOptions').hide();

$('#graphOptions')
		.css('position', 'absolute')
		.css('top', "0px")
		.css('left', "0px")
		.css('z-index',2)
		
$('#graphOptClose').click(function(){
	hideMenus();
});

jQuery('#graphOptions').change(function(event) {
	var oldMMEQ = graphCollection.graphs[graphCollection.selectedGraphIndex].mmEQ;
	var oldLSR = graphCollection.graphs[graphCollection.selectedGraphIndex].lsR;
	var oldLSEQ = graphCollection.graphs[graphCollection.selectedGraphIndex].lsEQ;
	var oldTwoDist = graphCollection.graphs[graphCollection.selectedGraphIndex].twoDistView;
	
	graphCollection.graphs[graphCollection.selectedGraphIndex].udLine = $("#checkboxShowUserLine").is(':checked');
	graphCollection.graphs[graphCollection.selectedGraphIndex].udSquares = $("#checkboxUDSquares").is(':checked');
	graphCollection.graphs[graphCollection.selectedGraphIndex].udEllipse = $("#checkboxShowEllipse").is(':checked');
	graphCollection.graphs[graphCollection.selectedGraphIndex].showData = $("#checkboxShowData").is(':checked');
	graphCollection.graphs[graphCollection.selectedGraphIndex].fitScaleToData = $("#fitScalesToData").is(':checked');
		
	graphCollection.graphs[graphCollection.selectedGraphIndex].mmDots = $("#checkboxShowMMDots").is(':checked');
	graphCollection.graphs[graphCollection.selectedGraphIndex].mmDivs = $("#checkboxShowMMRects").is(':checked');
	graphCollection.graphs[graphCollection.selectedGraphIndex].mmLine = $("#checkboxShowMMLine").is(':checked');
	graphCollection.graphs[graphCollection.selectedGraphIndex].mmEQ = $("#checkboxShowMMEqn").is(':checked');
	
	graphCollection.graphs[graphCollection.selectedGraphIndex].lsLine = $("#checkboxShowLeastSquaresLine").is(':checked');
	graphCollection.graphs[graphCollection.selectedGraphIndex].lsSquares = $("#checkboxShowLeastSquaresSquares").is(':checked');
	graphCollection.graphs[graphCollection.selectedGraphIndex].lsEQ = $("#checkboxShowLeastSquaresEquation").is(':checked');
	graphCollection.graphs[graphCollection.selectedGraphIndex].lsR = $("#checkboxShowLeastSquaresRValue").is(':checked');
	graphCollection.graphs[graphCollection.selectedGraphIndex].twoDistView = $("#showBothDist").is(':checked');
	graphCollection.graphs[graphCollection.selectedGraphIndex].labelPrompt = $("#promptForLabel").is(':checked');
	
	if (oldMMEQ == false && oldMMEQ != graphCollection.graphs[graphCollection.selectedGraphIndex].mmEQ)
		graphCollection.graphs[graphCollection.selectedGraphIndex].mmLine = true;
		
	if (oldLSR == false && oldLSR != graphCollection.graphs[graphCollection.selectedGraphIndex].lsR)
		graphCollection.graphs[graphCollection.selectedGraphIndex].lsLine = true;
		
	if (oldLSEQ == false && oldLSEQ != graphCollection.graphs[graphCollection.selectedGraphIndex].lsEQ)
		graphCollection.graphs[graphCollection.selectedGraphIndex].lsLine = true;
	
	if (oldTwoDist != graphCollection.graphs[graphCollection.selectedGraphIndex].twoDistView)
		constructVis();
	else
		vis.render();

  //event.stopPropagation();
});



$('#fitScalesToData').change(function() {
	graphCollection.graphs[graphCollection.selectedGraphIndex].fitScaleToData = jQuery('#fitScalesToData').is(':checked');
	graphCollection.graphs[graphCollection.selectedGraphIndex].setXScale();
	graphCollection.graphs[graphCollection.selectedGraphIndex].setYScale();
	graphCollection.updateMenuOptions();
	vis.render();
});

$('#textYMin').change(function(event) {
	var textBoxVal = parseFloat($('#textYMin').val());
	var curMax = graphCollection.graphs[graphCollection.selectedGraphIndex].y.domain()[1];
	if (isNaN(textBoxVal) || textBoxVal >= curMax){
		$('#textYMin').val(graphCollection.graphs[graphCollection.selectedGraphIndex].y.domain()[0]);
	} else {
		graphCollection.graphs[graphCollection.selectedGraphIndex].fitScaleToData = false;
		graphCollection.graphs[graphCollection.selectedGraphIndex].setYScale(textBoxVal, curMax);
		graphCollection.graphs[graphCollection.selectedGraphIndex].customScale = true;
		graphCollection.updateMenuOptions();
		vis.render();
	}	
});

$('#textYMax').change(function(event) {
	var textBoxVal = parseFloat($('#textYMax').val());
	var curMin = graphCollection.graphs[graphCollection.selectedGraphIndex].y.domain()[0];
	if (isNaN(textBoxVal) || textBoxVal <= curMin){
		$('#textYMax').val(graphCollection.graphs[graphCollection.selectedGraphIndex].y.domain()[1]);
	} else {
		graphCollection.graphs[graphCollection.selectedGraphIndex].fitScaleToData = false;
		graphCollection.graphs[graphCollection.selectedGraphIndex].setYScale(curMin, textBoxVal);
		graphCollection.graphs[graphCollection.selectedGraphIndex].customScale = true;
		graphCollection.updateMenuOptions();
		vis.render();
	}

});

$('#textXMin').change(function(event) {
	var textBoxVal = parseFloat($('#textXMin').val());
	var curMax = graphCollection.graphs[graphCollection.selectedGraphIndex].x.domain()[1];
	if (isNaN(textBoxVal) || textBoxVal >= curMax){
		$('#textXMin').val(graphCollection.graphs[graphCollection.selectedGraphIndex].x.domain()[0]);
	} else {
		graphCollection.graphs[graphCollection.selectedGraphIndex].fitScaleToData = false;
		graphCollection.graphs[graphCollection.selectedGraphIndex].setXScale(textBoxVal, curMax);
		graphCollection.graphs[graphCollection.selectedGraphIndex].customScale = true;
		graphCollection.updateMenuOptions();
		vis.render();
	}
});

$('#textXMax').change(function(event) {
	var textBoxVal = parseFloat($('#textXMax').val());
	var curMin = graphCollection.graphs[graphCollection.selectedGraphIndex].x.domain()[0];
	if (isNaN(textBoxVal) || textBoxVal <= curMin){
		$('#textXMax').val(graphCollection.graphs[graphCollection.selectedGraphIndex].x.domain()[1]);
	} else {
		graphCollection.graphs[graphCollection.selectedGraphIndex].fitScaleToData = false;
		graphCollection.graphs[graphCollection.selectedGraphIndex].setXScale(curMin, textBoxVal);
		graphCollection.graphs[graphCollection.selectedGraphIndex].customScale = true;
		graphCollection.updateMenuOptions();
		vis.render();
	}
});

$('#applyToAll').click(function(event){
	var selGraph = graphCollection.graphs[graphCollection.selectedGraphIndex];
	
	graphCollection.graphs.forEach(function(graph, index){
		graph.fitScaleToData = selGraph.fitScaleToData;
		graph.showData = selGraph.showData;
		graph.udLine = selGraph.udLine;
		graph.udEllipse = selGraph.udEllipse;
		graph.twoDistView = selGraph.twoDistView;
		graph.labelPromt = selGraph.labelPrompt;
		
		graph.mmLine = selGraph.mmLine;
		graph.mmDots = selGraph.mmDots;
		graph.mmDivs = selGraph.mmDivs;
		graph.mmEQ = selGraph.mmEQ;
		
		graph.lsLine = selGraph.lsLine;
		graph.lsSquares = selGraph.lsSquares;
		graph.lsEQ = selGraph.lsEQ;
		graph.lsR = selGraph.lsR;

		graph.setXScale();
	});
	constructVis();
});


//Display Options
$('#displayOptions').hide();

function positionDisplayMenu(){		
	$('#displayOptions')
			.css('position', 'absolute')
			.css('top', $('span').offset().top +"px")
			.css('left', $('span').offset().left +
					graphCollection.padLeft - 35 +"px")
			.css('z-index',2)
}
		
$('#displayOptClose').click(function(){
	hideMenus();
});

$('#displayOptions').change(function(){
	if ($('#drawMode option:selected').text() != "Gravity"){
		$('#divisionsCell').show();
	} else {
		$('#divisionsCell').hide();
	}
	vis.render();
})

$('#checkboxBWView').change(function() { return constructVis(); });

$("#divisionsInc").click(function(){
	if (graphCollection.buckets < 40)
		graphCollection.buckets++;
	$("#divisionsValue").html(graphCollection.buckets);
	vis.render();
})

$("#divisionsDec").click(function(){
	if (graphCollection.buckets > 2)
		graphCollection.buckets--;
	$("#divisionsValue").html(graphCollection.buckets);
	vis.render();
})

$("#dotSizeInc").click(function(){
	if (graphCollection.dotSize < 12)
		graphCollection.dotSize++;
	$("#dotSizeValue").html(graphCollection.dotSize);
	vis.render();
})

$("#dotSizeDec").click(function(){
	if (graphCollection.dotSize > 2)
		graphCollection.dotSize--;
	$("#dotSizeValue").html(graphCollection.dotSize);
	vis.render();
})

$("#textSizeInc").click(function(){
	if (parseInt(graphCollection.tickTextSize) < 20){
		graphCollection.tickTextSize = (parseInt(graphCollection.tickTextSize)+1)+"";
		graphCollection.labelTextSize = (parseInt(graphCollection.labelTextSize)+1)+"";
		$("#textSizeValue").html(graphCollection.tickTextSize);
		vis.render();
	}
})

$("#textSizeDec").click(function(){
	if (parseInt(graphCollection.tickTextSize) > 12){
		graphCollection.tickTextSize = (parseInt(graphCollection.tickTextSize)-1)+"";
		graphCollection.labelTextSize = (parseInt(graphCollection.labelTextSize)-1)+"";
		$("#textSizeValue").html(graphCollection.tickTextSize);
		vis.render();
	}
})

$("#buttonMode").change(function(){
	var val = jQuery("#buttonMode option:selected").val();
	
	if (val == "both"){
		graphCollection.buttonText = true;
		graphCollection.buttonIcon = true;
	} else if (val == "icon"){
		graphCollection.buttonText = false;
		graphCollection.buttonIcon = true;
	} else if (val == "text"){
		graphCollection.buttonText = true;
		graphCollection.buttonIcon = false;
	}
	vis.render();
});

