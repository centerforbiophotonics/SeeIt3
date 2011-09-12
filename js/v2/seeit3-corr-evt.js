/* Events */	

/* Touch Events */
document.addEventListener("touchstart", touchStart, false);

function touchStart(event){
  if (!touch.dragging) return;
	
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
		case "sideCat":
			sideCatTouchStart(event);
			break;
		case "graphXCat":
			graphXCatTouchStart(event);
			break;
		case "graphYCat":
			graphYCatTouchStart(event);
			break;
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
	
	if (graphCollection.editModeEnabled &&
			mouseX >= 0 &&
			mouseX <= graph.w &&
			mouseY >= 0 &&
			mouseY <= graph.h){
		
		graphCollection.editSinglePoint(graph.xData, d.label, graph.x.invert(mouseX));
		graphCollection.editSinglePoint(graph.yData, d.label, graph.y.invert(mouseY));
		
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
}

function dataXTouchStart(event){
	
}

function dataYTouchStart(event){
	
}

function dataBothTopTouchStart(event){
	
}

function dataBothBottomTouchStart(event){
	
}

function sideCatTouchStart(event){
	var curX = event.targetTouches[0].pageX -
							$('span').offset().left -
							graphCollection.padLeft + 14;
							
	var curY = event.targetTouches[0].pageY - 
							$('span').offset().top - 
							graphCollection.padTop;
	touch.draggedObj.left(curX);
	touch.draggedObj.top(curY);
	touch.draggedObj.visible(true);
	touch.draggedObj.render();
}

function graphXCatTouchStart(event){
	var curX = event.targetTouches[0].pageX -
							$('span').offset().left -
							graphCollection.padLeft + 14;
							
	var curY = event.targetTouches[0].pageY - 
							$('span').offset().top - 
							graphCollection.padTop;
	touch.draggedObj.left(curX);
	touch.draggedObj.top(curY);
	touch.draggedObj.visible(true);
	touch.draggedObj.render();
}

function graphYCatTouchStart(event){
	var curX = event.targetTouches[0].pageX -
							$('span').offset().left -
							graphCollection.padLeft + 14;
							
	var curY = event.targetTouches[0].pageY - 
							$('span').offset().top - 
							graphCollection.padTop;
	touch.draggedObj.left(curX);
	touch.draggedObj.top(curY);
	touch.draggedObj.visible(true);
	touch.draggedObj.render();
}

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
		case "sideCat":
			sideCatTouchMove(event);
			break;
		case "graphXCat":
			graphXCatTouchMove(event);
			break;
		case "graphYCat":
			graphYCatTouchMove(event);
			break;
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
		
		graphCollection.editSinglePoint(graph.xData, d.label, graph.x.invert(mouseX));
		graphCollection.editSinglePoint(graph.yData, d.label, graph.y.invert(mouseY));
		
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
		
		graphCollection.editSinglePoint(graph.xData, d.label, graph.x.invert(mouseX));
		
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
	
	if (graphCollection.editModeEnabled &&
			mouseX >= 0 &&
			mouseX <= graph.w &&
			mouseY >= 0 &&
			mouseY <= graph.h){
		
		graphCollection.editSinglePoint(graph.yData, d.label, graph.y.invert(mouseY));
		
		dragLabel.text(graph.y.invert(mouseY).toFixed(1));
		dragLabel.left(mouseX)
		dragLabel.bottom(mouseY+20)
		dragLabel.visible(true)
		vis.render();
	} else {
		dragLabel.text("Delete");
		vis.render();
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
		graphCollection.editSinglePoint(graph.yData, d.label, graph.yHoriz.invert(mouseX));
		
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
		
		graphCollection.editSinglePoint(graph.xData, d.label, graph.x.invert(mouseX));
		
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

function sideCatTouchMove(event){
	var curX = event.targetTouches[0].pageX -
							$('span').offset().left -
							graphCollection.padLeft + 14;
							
	var curY = event.targetTouches[0].pageY - 
							$('span').offset().top - 
							graphCollection.padTop;
							
	var which = whichDropZone(curX,curY);
	
	graphCollection.graphs.forEach(function(g){
		g.yAxisPanel.fillStyle(pv.rgb(0,0,0,0));
		g.xAxisPanel.fillStyle(pv.rgb(0,0,0,0));
	})
	
	if (which != false){
		which.gPan.fillStyle(pv.rgb(50,50,50,0.25));
	}
	
	graphCollection.graphs.forEach(function(g){
		g.yAxisPanel.render();
		g.xAxisPanel.render();
	})
	
	touch.draggedObj.left(curX);
	touch.draggedObj.top(curY);
	touch.draggedObj.render();
	touch.finalX = curX;
	touch.finalY = curY;
}

function graphXCatTouchMove(event){
	var curX = event.targetTouches[0].pageX -
							$('span').offset().left -
							graphCollection.padLeft + 14;
							
	var curY = event.targetTouches[0].pageY - 
							$('span').offset().top - 
							graphCollection.padTop;
							
	var which = whichDropZone(curX,curY);
	
	graphCollection.graphs.forEach(function(g){
		g.yAxisPanel.fillStyle(pv.rgb(0,0,0,0));
		g.xAxisPanel.fillStyle(pv.rgb(0,0,0,0));
	})
	
	if (which != false){
		which.gPan.fillStyle(pv.rgb(50,50,50,0.25));
	}
	
	graphCollection.graphs.forEach(function(g){
		g.yAxisPanel.render();
		g.xAxisPanel.render();
	})
	
	touch.draggedObj.left(curX);
	touch.draggedObj.top(curY);
	touch.draggedObj.render();
	touch.finalX = curX;
	touch.finalY = curY;
}

function graphYCatTouchMove(event){
	var curX = event.targetTouches[0].pageX -
							$('span').offset().left -
							graphCollection.padLeft + 14;
							
	var curY = event.targetTouches[0].pageY - 
							$('span').offset().top - 
							graphCollection.padTop;
							
	var which = whichDropZone(curX,curY);
	
	graphCollection.graphs.forEach(function(g){
		g.yAxisPanel.fillStyle(pv.rgb(0,0,0,0));
		g.xAxisPanel.fillStyle(pv.rgb(0,0,0,0));
	})
	
	if (which != false){
		which.gPan.fillStyle(pv.rgb(50,50,50,0.25));
	}
	
	graphCollection.graphs.forEach(function(g){
		g.yAxisPanel.render();
		g.xAxisPanel.render();
	})
	
	touch.draggedObj.left(curX);
	touch.draggedObj.top(curY);
	touch.draggedObj.render();
	touch.finalX = curX;
	touch.finalY = curY;
}

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
		case "sideCat":
			sideCatTouchEnd(event);
			break;
		case "graphXCat":
			graphXCatTouchEnd(event);
			break;
		case "graphYCat":
			graphYCatTouchEnd(event);
			break;
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
		
		var newXData = graphCollection.worksheet.data[graph.xData];
		var newYData = graphCollection.worksheet.data[graph.yData];
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
		graphCollection.editData(graph.xData,graph.xData,newXData);
		
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
		graphCollection.editData(graph.yData,graph.yData,newYData);
		
		dragLabel.visible(false);
		touch.reset();
		//vis.render();
		constructVis();
	}
}

function dataXTouchEnd(event){
	if (graphCollection.editModeEnabled){
		var graph = graphCollection.graphs[touch.graphIndex];
		var graphPanel = touch.graphPanel;
	
		var mouseX = touch.finalX;
		var mouseY = touch.finalY;
								
		var d = touch.dataObj;
		var dragLabel = touch.dragLabel;
		
		var newXData = graphCollection.worksheet.data[graph.xData];
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
		graphCollection.editData(graph.xData,graph.xData,newXData);
				
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
		
		var newYData = graphCollection.worksheet.data[graph.yData];
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
		graphCollection.editData(graph.yData,graph.yData,newYData);
		
		dragLabel.visible(false);
		touch.reset();
		vis.render();
	}
}

function dataBothTopTouchEnd(event){
	if (graphCollection.editModeEnabled){
		var graph = graphCollection.graphs[touch.graphIndex];
		var graphPanel = touch.graphPanel;
	
		var mouseX = touch.finalX;
		var mouseY = touch.finalY;
								
		var d = touch.dataObj;
		var dragLabel = touch.dragLabel;
		
		var newYData = graphCollection.worksheet.data[graph.yData];
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
		graphCollection.editData(graph.yData,graph.yData,newYData);
				
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
		
		var newXData = graphCollection.worksheet.data[graph.xData];
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
		graphCollection.editData(graph.xData,graph.xData,newXData);
				
		dragLabel.visible(false);
		touch.reset();
		vis.render();
	}
}

function sideCatTouchEnd(event){
	var curX = touch.finalX;
							
	var curY = touch.finalY;
							
	var which = whichDropZone(curX,curY);
	
	graphCollection.graphs.forEach(function(g){
		g.yAxisPanel.fillStyle(pv.rgb(0,0,0,0));
		g.xAxisPanel.fillStyle(pv.rgb(0,0,0,0));
	});
	
	if (which != false){
		if (which.gAxis == "y")
			graphCollection.graphs[which.gInd].assignY(touch.dragCat);
		else if (which.gAxis == "x")
			graphCollection.graphs[which.gInd].assignX(touch.dragCat);
			
		graphCollection.updateMenuOptions();
	}
	
	
	touch.draggedObj.visible(false);
	touch.reset();
}

function graphXCatTouchEnd(event){
	var curX = touch.finalX;
							
	var curY = touch.finalY;
							
	var which = whichDropZone(curX,curY);
	
	graphCollection.graphs.forEach(function(g){
		g.yAxisPanel.fillStyle(pv.rgb(0,0,0,0));
		g.xAxisPanel.fillStyle(pv.rgb(0,0,0,0));
	});
	
	if ((curX > 0 && curX < graphCollection.w && curY > 0 && curY < graphCollection.h) || which != false){
		if (which.gAxis == "y"){
			if (which.gInd == touch.graphIndex){
				var xCat = graphCollection.graphs[which.gInd].xData;
				graphCollection.graphs[which.gInd].assignX(graphCollection.graphs[which.gInd].yData);
				graphCollection.graphs[which.gInd].assignY(xCat);
			} else {
				graphCollection.graphs[which.gInd].assignY(graphCollection.graphs[touch.graphIndex].xData);
				graphCollection.graphs[touch.graphIndex].assignX(null);
			}
		} else if (which.gAxis == "x" && which.gInd != touch.graphIndex){
			graphCollection.graphs[which.gInd].assignX(graphCollection.graphs[touch.graphIndex].xData);
			graphCollection.graphs[touch.graphIndex].assignX(null);
		}
	} else if (which == false){
		graphCollection.graphs[touch.graphIndex].assignX(null);
	}
	
	graphCollection.updateMenuOptions();
	
	touch.draggedObj.visible(false);
	touch.reset();
}

function graphYCatTouchEnd(event){
	var curX = touch.finalX;
							
	var curY = touch.finalY;
							
	var which = whichDropZone(curX,curY);
	
	graphCollection.graphs.forEach(function(g){
		g.yAxisPanel.fillStyle(pv.rgb(0,0,0,0));
		g.xAxisPanel.fillStyle(pv.rgb(0,0,0,0));
	});
	
	if ((curX > 0 && curX < graphCollection.w && curY > 0 && curY < graphCollection.h) || which != false){
		if (which.gAxis == "x"){
			if (which.gInd == touch.graphIndex){
				var xCat = graphCollection.graphs[which.gInd].xData;
				graphCollection.graphs[which.gInd].assignX(graphCollection.graphs[which.gInd].yData);
				graphCollection.graphs[which.gInd].assignY(xCat);
			} else {
				graphCollection.graphs[which.gInd].assignX(graphCollection.graphs[touch.graphIndex].yData);
				graphCollection.graphs[touch.graphIndex].assignY(null);
			}
		} else if (which.gAxis == "y" && which.gInd != touch.graphIndex){
			graphCollection.graphs[which.gInd].assignY(graphCollection.graphs[touch.graphIndex].yData);
			graphCollection.graphs[touch.graphIndex].assignY(null);
		}
	} else if (which == false){
		graphCollection.graphs[touch.graphIndex].assignY(null);
	}
	
	graphCollection.updateMenuOptions();
	
	touch.draggedObj.visible(false);
	touch.reset();
}

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


function whichDropZone(x,y){
	if (graphCollection.graphs.length == 1){
		var gpX = x-graphCollection.graphs[0].graphPanel.left();
		var gpY = y-graphCollection.graphs[0].graphPanel.top();
		
		if (gpX > graphCollection.graphs[0].yAxisPanel.left() && 
				gpX < graphCollection.graphs[0].yAxisPanel.left() + graphCollection.graphs[0].yAxisPanel.width() &&
				gpY > graphCollection.graphs[0].yAxisPanel.top() &&
				gpY < graphCollection.graphs[0].yAxisPanel.top() + graphCollection.graphs[0].yAxisPanel.height())
		{
			return {"gInd":0,
							"gAxis":"y",
							"gPan":graphCollection.graphs[0].yAxisPanel};
		}
		
		if (gpX > graphCollection.graphs[0].xAxisPanel.left() && 
				gpX < graphCollection.graphs[0].xAxisPanel.left() + graphCollection.graphs[0].xAxisPanel.width() &&
				gpY > graphCollection.graphs[0].xAxisPanel.top() &&
				gpY < graphCollection.graphs[0].xAxisPanel.top() + graphCollection.graphs[0].xAxisPanel.height())
		{
			return {"gInd":0,
							"gAxis":"x",
							"gPan":graphCollection.graphs[0].xAxisPanel};
		}
		
		return false;
	} else if (graphCollection.graphs.length > 1) {
		var gp0X = x-graphCollection.graphs[0].graphPanel.left();
		var gp0Y = y-graphCollection.graphs[0].graphPanel.top();
		
		if (gp0X > graphCollection.graphs[0].yAxisPanel.left() && 
				gp0X < graphCollection.graphs[0].yAxisPanel.left() + graphCollection.graphs[0].yAxisPanel.width() &&
				gp0Y > graphCollection.graphs[0].yAxisPanel.top() &&
				gp0Y < graphCollection.graphs[0].yAxisPanel.top() + graphCollection.graphs[0].yAxisPanel.height())
		{
			return {"gInd":0,
							"gAxis":"y",
							"gPan":graphCollection.graphs[0].yAxisPanel};
		}
		
		if (gp0X > graphCollection.graphs[0].xAxisPanel.left() && 
				gp0X < graphCollection.graphs[0].xAxisPanel.left() + graphCollection.graphs[0].xAxisPanel.width() &&
				gp0Y > graphCollection.graphs[0].xAxisPanel.top() &&
				gp0Y < graphCollection.graphs[0].xAxisPanel.top() + graphCollection.graphs[0].xAxisPanel.height())
		{
			return {"gInd":0,
							"gAxis":"x",
							"gPan":graphCollection.graphs[0].xAxisPanel};
		}
		
		var gp1X = x-graphCollection.graphs[1].graphPanel.left();
		var gp1Y = y-graphCollection.graphs[1].graphPanel.top();
		
		if (gp1X > graphCollection.graphs[1].yAxisPanel.left() && 
				gp1X < graphCollection.graphs[1].yAxisPanel.left() + graphCollection.graphs[1].yAxisPanel.width() &&
				gp1Y > graphCollection.graphs[1].yAxisPanel.top() &&
				gp1Y < graphCollection.graphs[1].yAxisPanel.top() + graphCollection.graphs[1].yAxisPanel.height())
		{
			return {"gInd":1,
							"gAxis":"y",
							"gPan":graphCollection.graphs[1].yAxisPanel};
		}
		
		if (gp1X > graphCollection.graphs[1].xAxisPanel.left() && 
				gp1X < graphCollection.graphs[1].xAxisPanel.left() + graphCollection.graphs[1].xAxisPanel.width() &&
				gp1Y > graphCollection.graphs[1].xAxisPanel.top() &&
				gp1Y < graphCollection.graphs[1].xAxisPanel.top() + graphCollection.graphs[1].xAxisPanel.height())
		{
			return {"gInd":1,
							"gAxis":"x",
							"gPan":graphCollection.graphs[1].xAxisPanel};
		}
		
		return false;
	}
	
}


/* Dynamic Graph Resizing */
$(window).resize(function() {
	if (graphCollection.hasOwnProperty("worksheet")){
		graphCollection.setW(calcGraphWidth());
		graphCollection.setH(graphCollection.calcGraphHeight());
		//constructVis();
		vis.render();
	}
})


//Top Bar
jQuery('#newSpreadsheetURL').keyup(function(event) {
  if (event.keyCode == '13') {
	var key = parseSpreadsheetKeyFromURL($(this).val());
	$(this).val('');
	exampleSpreadsheets.push(new Spreadsheet(key));
  }
});


$('#refreshWorksheet').click(function(event){
	getWorksheet().fetchWorksheetData();
	if ($('#fitScalesToData').is(':checked')){
		jQuery('#fitScalesToData').attr('checked', false);
	}
	
});

jQuery('#editInGoogleDocs').click(function(event) {
  var URL = jQuery('#workSheetSelector').val();
  console.log(URL);
  var matches = /feeds\/cells\/([A-Z|a-z|0-9|_|-]+)/.exec(URL);
  window.open('https://spreadsheets.google.com/ccc?key=' + matches[1]);
  event.preventDefault();
});

jQuery('#workSheetSelector').change(function(event) {
	if (jQuery('#workSheetSelector').val() == "New"){
		hideMenus();
		$('#worksheetCreate').slideDown();
	} else {
		graphCollection = new GraphCollection();
		lastSelectedWorksheet = jQuery('#workSheetSelector').val();
		constructVis();
	}
});


$('#about').click(function(){
	$('#aboutPopup').slideToggle();
});

$('#aboutPopup').hide();

function positionAboutPopup(){
	$('#aboutPopup').css('position', 'absolute')
										 .css('top', parseInt(window.innerHeight/2 - $('#aboutPopup').height()/2)+"px")
										 .css('left',parseInt(window.innerWidth/2 - $('#aboutPopup').width()/2)+"px");
}
positionAboutPopup();

/* Worksheet Description Popup */
function positionWorksheetDescriptionPopup(){
	$('#worksheetDescriptionPopup').css('position', 'absolute')
										 .css('top', parseInt(window.innerHeight/2 - $('#worksheetDescriptionPopup').height()/2)+"px")
										 .css('left',parseInt(window.innerWidth/2 - $('#worksheetDescriptionPopup').width()/2)+"px");
}
positionWorksheetDescriptionPopup();


$('#worksheetDescriptionPopup').hide();

$('#worksheetDescriptionButton').click(function(){
	$('#worksheetDescriptionParagraph').html(graphCollection.worksheet.description);
	$('#worksheetDescriptionTitle').html(graphCollection.worksheet.title + "<br>by " + graphCollection.worksheet.labelType);
	positionWorksheetDescriptionPopup();
	$('#worksheetDescriptionPopup').slideToggle();
});


//Graph Options
$('#graphOptions').hide();

$('#graphOptions')
		.css('position', 'absolute')
		.css('top', "0px")
		.css('left', "0px")
		
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
					graphCollection.padLeft - 34 +"px")
}
		
$('#displayOptClose').click(function(){
	hideMenus();
});

$('#displayOptions').change(function(){
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

/* Add Data Set Menu */
function positionDatasetAddMenu(){
	$('#dataSetAdd').css('position', 'absolute')
										 .css('top', parseInt(window.innerHeight/2 - $('#dataSetAdd').height()/2)+"px")
										 .css('left',parseInt(window.innerWidth/2 - $('#dataSetAdd').width()/2)+"px");
}
positionDatasetAddMenu();

$('#dataSetAdd').hide();

$('#addNonNumWarning').hide();
$('#addNoTitleWarning').hide();
$('#addNoLabelWarning').hide();
$('#addNoValueWarning').hide();
$('#addNoDataWarning').hide();
$('#addDupTitleWarning').hide();
$('#addPasteFormatWarning').hide();


var addNextRow = 1;

$('#addLabLast').change(function(){
	$('#addValLast').focus();
});

var firstKey = true;
$('#addValLast').keyup(function(evt){
	if (isNaN(parseFloat($('#addValLast').val()))){
		if ($('#addValLast').val() != "-" && $('#addValLast').val() != ".")
			$('#addValLast').val("");
		if (event.keyCode != '9'){
			$('#addNonNumWarning').show();
			$('#dataSetAdd').scrollTop(0);
		}
	} else {
		$('#addNonNumWarning').hide();
		
		$('#addDatasetEntry tr:last').before(
			"<tr id='addRow" +
			addNextRow +
			"'><td><input type='text' id='addLab" +
			addNextRow +
			"'></td><td><input type='text' onChange ='addEntryValidate(this)' id='addVal" +
			addNextRow +
			"'></td>"+
			"<td><input type='image' src='img/garbage.png' id='addGarbage"+
			addNextRow +
			"' onclick='delAddField()' width='20' height='20'></td></tr>");
			
		$('#addLab'+addNextRow).val($('#addLabLast').val());
		$('#addVal'+addNextRow).val(parseFloat($('#addValLast').val()));
		$('#addValLast').val("");
		$('#addLabLast').val("");
		$('#addVal'+addNextRow).focus();
		addNextRow++;
	}
});


$("#addFormAdd").click(function(){
	var labelError = false;
	var titleError = false;
	var valueError = false;
	var noDataError = false;
	var addConfirm = false;
	var dupTitle = false;
	
	$('#addNoTitleWarning').hide();
	$('#addNoLabelWarning').hide();
	$('#addNoValueWarning').hide();
	$('#addNoDataWarning').hide();
	$('#addDupTitleWarning').hide();
	$('#addPasteFormatWarning').hide();
	
	var datasetTitle;
	var data = [];
	if ($('#addDataSetTitle').val() == ""){
		titleError = true;
		$('#addNoTitleWarning').show();
		$('#addDataSetTitle').focus();
	} else {
		$('#addNoTitleWarning').hide();
		datasetTitle = $('#addDataSetTitle').val()
	}
	
	for (var key in graphCollection.worksheet.data){
		if (datasetTitle == key){
			dupTitle = true;
			$('#addDupTitleWarning').show();
			$('#addDataSetTitle').focus();
		}
	}
	
	for (var i=1; i<addNextRow; i++){
		var label = $('#addLab'+i).val();
		var value = $('#addVal'+i).val();
		if (label == "" && value != ""){
			labelError = true;
			$('#addNoLabelWarning').show();
			$('#addLab'+i).focus();
		}
		if (value == "" && label != ""){
			valueError = true;
		}
		if (!isNaN(parseFloat(value)) && label != "")
			data.push({"label":label, "value":parseFloat(value)})
	}
	
	var label = $('#addLabLast').val();
	var value = $('#addValLast').val();
	
	if (label == "" && value != ""){
		labelError = true;
		$('#addNoLabelWarning').show();
		$('#addLabLast').focus();
	}
	if (value == "" && label != ""){
		valueError = true;
		$('#addNoValueWarning').show();
		$('#addValLast').focus();
	}
	
	if (!isNaN(parseFloat(value)) && label != "")
		data.push({"label":label, "value":parseFloat(value)})

	if (data.length == 0){
		$('#addNoDataWarning').show();
		noDataError = true;
	}
	
	if (!labelError && !titleError && !noDataError && !dupTitle){
		if (valueError) addConfirm = confirm("Entries with a label and no value will not be included in the dataset.  Are you sure you wish to add this dataset?");
		else addConfirm = confirm("Are you sure you wish to add this dataset?");
	}
		
	if(!labelError && !titleError && addConfirm && !noDataError && !dupTitle){
		$('#addNoTitleWarning').hide();
		$('#addNoLabelWarning').hide();
		$('#addNoValueWarning').hide();
		graphCollection.addData(datasetTitle, data);
		vis.render();
		$('#dataSetAdd').slideUp();
		resetAddDataSetMenu();
	}
	
	constructVis();
});

$('#addFormClose').click(function(){
	resetAddDataSetMenu();
	$('#dataSetAdd').slideUp();
});

$('#addFormReset').click(function(){
	resetAddDataSetMenu();
	populateAddMenuLabelsFromExisting();
});

function resetAddDataSetMenu(){
	$('#addNonNumWarning').hide();
	$('#addNoTitleWarning').hide();
	$('#addNoLabelWarning').hide();
	$('#addNoValueWarning').hide();
	$('#addNoDataWarning').hide();
	$('#addDupTitleWarning').hide();
	$('#addPasteFormatWarning').hide();
	
	$('#addDataSetTitle').val("");
	$('#addValLast').val("");
	$('#addLabLast').val("");
	$('#addPaste').val("");
	$('#addLabLast').focus();
	for (var i=0; i<addNextRow; i++)
		$('#addRow'+i).remove();
	addNextRow = 1;
}

function addEntryValidate(elem){
	if (isNaN(parseFloat(elem.value))){
		$('#addNonNumWarning').show();
		$('#dataSetAdd').scrollTop(0);
		elem.value = "";
	} else {
		$('#addNonNumWarning').hide();
	}
}

function populateAddMenuLabelsFromExisting(){
	graphCollection.worksheet.labelMasterList.forEach(function(label){
		$('#addDatasetEntry tr:last').before(
			"<tr id='addRow" +addNextRow +
			"'><td><input type='text' id='addLab"+addNextRow +
			"' value='"+label +
			"'></td><td><input type='text' onChange ='addEntryValidate(this)' id='addVal"+addNextRow +
			"'></td>"+
			"<td><input type='image' src='img/garbage.png' id='addGarbage"+
			addNextRow +
			"' onclick='delAddField()' width='20' height='20'></td></tr>");
			
			addNextRow++;
	});
}

function delAddField(){
	var which = parseInt((event.target.id).slice(10))
	$('#addRow'+which).remove();
	for (var i = which+1; i < addNextRow; i++){
		$('#addRow'+i).attr("id","addRow"+(i-1));
		$('#addLab'+i).attr("id","addLab"+(i-1));
		$('#addVal'+i).attr("id","addVal"+(i-1));
		$('#addGarbage'+i).attr("id","addGarbage"+(i-1));
	}
	addNextRow--;
	if (addNextRow < 1)
		addNextRow = 1;
	
}

$('#addFormPaste').click(function(e){
	$('#dataSetAdd').slideUp();
	$('#dataSetPaste').slideDown();
})


/* Paste Data Set Menu */
$('#dataSetPaste').hide();
function positionDatasetPaste(){
	$('#dataSetPaste').css('position', 'absolute')
										 .css('top', parseInt(window.innerHeight/2 - $('#dataSetPaste').height()/2)+"px")
										 .css('left',parseInt(window.innerWidth/2 - $('#dataSetPaste').width()/2)+"px");
}
positionDatasetPaste();

$('#pasteClose').click(function(){
	$('#addPasteText').val("");
	$('#dataSetPaste').slideUp();
	$('#dataSetAdd').slideDown();
});

$('#pasteImport').click(function(){
	var rawText = $('#addPasteText').val();
	var cells = [];
	rawText.split('\n').forEach(function(line){
		cells.push(line.split('\t'));
	});
	
	resetAddDataSetMenu();
	if (!populateAddMenuFromPaste(cells))
		$('#addPasteFormatWarning').show();
	$('#addPasteText').val("");
	$('#dataSetPaste').slideUp();
	$('#dataSetAdd').slideDown();
	
});

function populateAddMenuFromPaste(cells){
	var noFormatError = true;
	if ($('#pasteHeading').is(':checked')){
		if (cells[0].length == 1)
			$('#addDataSetTitle').val(cells[0][0]);
		else if (cells[0].length >= 2)
			$('#addDataSetTitle').val(cells[0][1]);
		else{
			noFormatError = false;
		}
			
		cells.slice(1).forEach(function(line){
			if (line.length >= 2){
				if (line.length > 2) noFormatError = false;
				
				$('#addDatasetEntry tr:last').before(
					"<tr id='addRow" +addNextRow +
					"'><td><input type='text' id='addLab"+addNextRow +
					"' value='"+line[0] +
					"'></td><td><input type='text' onChange ='addEntryValidate(this)' id='addVal"+addNextRow +
					"' value='"+line[1] +
					"'></td>"+
					"<td><input type='image' src='img/garbage.png' id='addGarbage"+
					addNextRow +
					"' onclick='delAddField()' width='20' height='20'></td></tr>");
					
				addNextRow++;
			} else if(line.length != 1 || line[0] != ""){
				noFormatError = false;
			}
		});
	} else {
		cells.forEach(function(line){
			if (line.length >= 2){
				if (line.length > 2) noFormatError = false;
				
				$('#addDatasetEntry tr:last').before(
					"<tr id='addRow" +addNextRow +
					"'><td><input type='text' id='addLab"+addNextRow +
					"' value='"+line[0] +
					"'></td><td><input type='text' onChange ='addEntryValidate(this)' id='addVal"+addNextRow +
					"' value='"+line[1] +
					"'></td>"+
					"<td><input type='image' src='img/garbage.png' id='addGarbage"+
					addNextRow +
					"' onclick='delAddField()' width='20' height='20'></td></tr>");
					
				addNextRow++;
			} else if(line.length != 1 || line[0] != ""){
				noFormatError = false;
			}
		});
	}
	return noFormatError;
}


/* Edit Data Set Menu */
function positionDatasetEditMenu(){
	$('#dataSetEdit').css('position', 'absolute')
										 .css('top', parseInt(window.innerHeight/2 - $('#dataSetEdit').height()/2)+"px")
										 .css('left',parseInt(window.innerWidth/2 - $('#dataSetEdit').width()/2)+"px");
}
positionDatasetEditMenu();

$('#dataSetEdit').hide();

$('#editNonNumWarning').hide();
$('#editNoTitleWarning').hide();
$('#editNoLabelWarning').hide();
$('#editNoValueWarning').hide();
$('#editNoDataWarning').hide();
$('#editDupTitleWarning').hide();


var editNextRow = 1;

$('#editLabLast').change(function(){
	$('#editValLast').focus();
});

var firstKey = true;
$('#editValLast').keyup(function(evt){
	if (isNaN(parseFloat($('#editValLast').val()))){
		if ($('#editValLast').val() != "-" && $('#editValLast').val() != ".")
			$('#editValLast').val("");
		if (event.keyCode != '9'){
			$('#editNonNumWarning').show();
			$('#dataSetEdit').scrollTop(0);
		}
	} else {
		$('#editNonNumWarning').hide();
		
		$('#editDatasetEntry tr:last').before(
			"<tr id='editRow" +
			editNextRow +
			"'><td><input type='text' id='editLab" +
			editNextRow +
			"'></td><td><input type='text' onChange ='editEntryValidate(this)' id='editVal" +
			editNextRow +
			"'></td>"+
			"<td><input type='image' src='img/garbage.png' id='editGarbage"+
			editNextRow +
			"' onclick='delEditField()' width='20' height='20'></td></tr>");
			
		$('#editLab'+editNextRow).val($('#editLabLast').val());
		$('#editVal'+editNextRow).val(parseFloat($('#editValLast').val()));
		$('#editValLast').val("");
		$('#editLabLast').val("");
		$('#editVal'+editNextRow).focus();
		editNextRow++;
	}
});

$("#editFormApply").click(function(){
	var labelError = false;
	var titleError = false;
	var valueError = false;
	var noDataError = false;
	var applyConfirm = false;
	
	$('#editNoTitleWarning').hide();
	$('#editNoLabelWarning').hide();
	$('#editNoValueWarning').hide();
	$('#editNoDataWarning').hide();
	
	var oldDatasetTitle = $('#datasetTitle').html();
	var datasetTitle;
	var data = [];
	if ($('#editDataSetTitle').val() == ""){
		titleError = true;
		$('#editNoTitleWarning').show();
		$('#editDataSetTitle').focus();
	} else {
		$('#editNoTitleWarning').hide();
		datasetTitle = $('#editDataSetTitle').val()
	}
	
	for (var i=1; i<editNextRow; i++){
		var label = $('#editLab'+i).val();
		var value = $('#editVal'+i).val();
		
		if (label == "" && value != ""){
			labelError = true;
			$('#editNoLabelWarning').show();
			$('#editLab'+i).focus();
		}
		if (value == "" && label != ""){
			valueError = true;
		}
		if (!isNaN(parseFloat(value)) && label != "")
			data.push({"label":label, "value":parseFloat(value)})
	}
	
	var label = $('#editLabLast').val();
	var value = $('#editValLast').val();
	
	if (label == "" && value != ""){
		labelError = true;
		$('#editNoLabelWarning').show();
		$('#editLabLast').focus();
	}
	if (value == "" && label != ""){
		valueError = true;
		$('#editNoValueWarning').show();
		$('#editValLast').focus();
	}
	
	if (!isNaN(parseFloat(value)) && label != "")
		data.push({"label":label, "value":parseFloat(value)})

	if (data.length == 0){
		$('#editNoDataWarning').show();
		noDataError = true;
	}
	
	if (!labelError && !titleError && !noDataError){
		if (valueError) applyConfirm = confirm("Entries with a label and no value will not be included in the dataset.  Are you sure you wish to apply these changes?");
		else applyConfirm = confirm("Are you sure you wish to apply these changes?");
	}
		
	if(!labelError && !titleError && applyConfirm && !noDataError){
		$('#editNoTitleWarning').hide();
		$('#editNoLabelWarning').hide();
		$('#editNoValueWarning').hide();
		graphCollection.editData(oldDatasetTitle, datasetTitle, data);
		
		vis.render();
		$('#dataSetEdit').slideUp();
		resetEditDataSetMenu();
	}
});

$('#editFormClose').click(function(){
	resetEditDataSetMenu();
	$('#dataSetEdit').slideUp();
});

$('#editFormReset').click(function(){
	resetEditDataSetMenu();
	populateEditMenuFromExisting($('#datasetTitle').html());
});

$('#editFormDelete').click(function(){
	var datasetTitle = $('#datasetTitle').html();
	if (confirm("Are you sure you want to delete this dataset?")){
		graphCollection.deleteData(datasetTitle);
		$('#dataSetEdit').slideUp();
		constructVis();
	}
	
});

function resetEditDataSetMenu(){
	$('#editDataSetTitle').val("");
	$('#editValLast').val("");
	$('#editLabLast').val("");
	$('#editLabLast').focus();
	for (var i=1; i<editNextRow; i++)
		$('#editRow'+i).remove();
	editNextRow = 1;
}

function editEntryValidate(elem){
	if (isNaN(parseFloat(elem.value))){
		$('#editNonNumWarning').show();
		$('#dataSetEdit').scrollTop(0);
		elem.value = "";
	} else {
		$('#editNonNumWarning').hide();
	}
}

function populateEditMenuFromExisting(dataset){
	$('#datasetTitle').html(dataset);
	
	$('#editDataSetTitle').val(dataset);
	
	graphCollection.worksheet.data[dataset].forEach(function(data){
		$('#editDatasetEntry tr:last').before(
			"<tr id='editRow" +editNextRow +
			"'><td><input type='text' id='editLab"+editNextRow +
			"' value='"+data.label +
			"' ></td><td><input type='text' onChange ='editEntryValidate(this)' id='editVal"+editNextRow +
			"' value='"+data.value.toFixed(2) + 
			"'></td>"+
			"<td><input type='image' src='img/garbage.png' id='editGarbage"+
			editNextRow +
			"' onclick='delEditField()' width='20' height='20'></td></tr>");
			
			editNextRow++;
		
	});
}

function delEditField(){
	var which = parseInt((event.target.id).slice(11))
	$('#editRow'+which).remove();
	for (var i = which+1; i < editNextRow; i++){
		$('#editRow'+i).attr("id","editRow"+(i-1));
		$('#editLab'+i).attr("id","editLab"+(i-1));
		$('#editVal'+i).attr("id","editVal"+(i-1));
		$('#editGarbage'+i).attr("id","editGarbage"+(i-1));
	}
	editNextRow--;
	if (editNextRow < 1)
		editNextRow = 1;
	
}

/* Create Worksheet Menu */
function positionCreateWorksheetMenu(){
	$('#worksheetCreate').css('position', 'absolute')
										 .css('top', parseInt(window.innerHeight/2 - $('#worksheetCreate').height()/2)+"px")
										 .css('left',parseInt(window.innerWidth/2 - $('#worksheetCreate').width()/2)+"px");
}
positionCreateWorksheetMenu();

$('#worksheetCreate').hide();

$('#wcNoTitleWarning').hide();
$('#wcNoLabelTypeWarning').hide();
$('#wcDupTitleWarning').hide();
$('#wcDupLabelWarning').hide();
	

var wcNextRow = 1;
$('#wcLabLast').keydown(function(evt){
	$('#wcLabelEntry tr:last').before(
		"<tr id='wcRow" +
		wcNextRow +
		"'><td><input type='text' id='wcLab" +
		wcNextRow +
		"'></td><td><input type='image' src='img/garbage.png' id='wcGarbage"+
		wcNextRow +
		"' onclick='delWCField()' width='20' height='20'></td></tr>");
			
		$('#wcLab'+wcNextRow).val($('#wcLabLast').val());
		$('#wcLabLast').val("");
		$('#wcLab'+wcNextRow).focus();
		wcNextRow++;
});

$("#wcAdd").click(function(){
	var dupLabelError = false;
	var dupTitleError = false;
	var noTitleError = false;
	var noLabelTypeError = false;
	
	
	var wcLabelMasterlist = [];
	var wcTitle = $('#wcTitle').val();
	var wcLabelType = $('#wcLabelType').val();
	
	if (wcTitle == ""){
		noTitleError = true;
		$('#wcNoTitleWarning').show();
		$('#wcTitle').focus();
	}
	
	if (wcLabelType == ""){
		noLabelTypeError = true;
		$('#wcNoLabelTypeWarning').show();
		$('#wcLabelType').focus();
	}
	
	$("#workSheetSelector option").each(function(){
		if (wcTitle == $(this).html()){
			dupTitleError = true;
			$('#wcDupTitleWarning').show();
			$('#wcTitle').focus();
		}
	});
	
	for (var i=1; i<wcNextRow; i++){
		var label = $('#wcLab'+i).val();
		
		if(wcLabelMasterlist.indexOf(label) != -1){
			dupLabelError = true;
			$('#wcDupLabelWarning').show();
			$('#wcLab'+i).focus();
		}
		
		if (label != "")
			wcLabelMasterlist.push(label);
	}
	
	if (!dupLabelError && !dupTitleError && !noTitleError && !noLabelTypeError){
		if (confirm("Are you sure you wish to add this worksheet?")){
			var attr = {"title": wcTitle,
									"labelType": wcLabelType,
									"labelMasterlist": wcLabelMasterlist};
			exampleSpreadsheets.push(new Spreadsheet(attr));
			resetWCMenu();
			$('#worksheetCreate').slideUp();
			
			jQuery('body').trigger({ type:'WorksheetLoaded', worksheet:userCreatedWorksheet});
		}
	}
});

$('#wcClose').click(function(){
	resetWCMenu();
	$('#worksheetCreate').slideUp();
	$('#workSheetSelector').val(lastSelectedWorksheet);
});

$('#wcReset').click(function(){
	resetWCMenu();
});

function resetWCMenu(){
	$('#wcTitle').val("");
	$('#wcLabelType').val("");
	$('#wcLabLast').val("");
	$('#wcLabLast').focus();
	for (var i=0; i<wcNextRow; i++)
		$('#wcRow'+i).remove();
	wcNextRow = 1;
}

function delWCField(){
	var which = parseInt((event.target.id).slice(9))
	$('#wcRow'+which).remove();
	for (var i = which+1; i < wcNextRow; i++){
		$('#wcRow'+i).attr("id","wcRow"+(i-1));
		$('#wcLab'+i).attr("id","wcLab"+(i-1));
		$('#wcGarbage'+i).attr("id","wcGarbage"+(i-1));
	}
	wcNextRow--;
	if (wcNextRow < 1)
		wcNextRow = 1;
}



/* Clipboard Prompt */
function positionClipboardPrompt(){
	$('#clipboardPrompt').css('position', 'absolute')
										 .css('top', parseInt(window.innerHeight/2 - $('#clipboardPrompt').height()/2)+"px")
										 .css('left',parseInt(window.innerWidth/2 - $('#clipboardPrompt').width()/2)+"px");
}
positionClipboardPrompt();

$('#clipboardPrompt').hide();

$('#cbText').keydown(function(event){
	if (event.keyCode == '13')
		$('#clipboardPrompt').slideUp();
});

$('#cbClose').click(function(){
	$('#clipboardPrompt').slideUp();
});

