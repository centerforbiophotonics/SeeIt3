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
    var middle1 = dataSet[(dataSet.length / 2) - 1]; // round up
    var middle2 = dataSet[dataSet.length / 2]; // round down
    return (middle1.incidence + middle2.incidence) / 2;
  } else {
    var middle = dataSet[parseInt(dataSet.length / 2)];
    return middle.incidence;
  }
}

function medianYValue(dataSet) {
  sortByYValues(dataSet);
  if (dataSet.length % 2 == 0) {
    var middle1 = dataSet[(dataSet.length / 2) - 1]; // round up
    var middle2 = dataSet[dataSet.length / 2]; // round down
    return (middle1.otherFactor + middle2.otherFactor) / 2;
  } else {
    var middle = dataSet[parseInt(dataSet.length / 2)];
    return middle.otherFactor;
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



/* the main panel */

var vis = {}

function constructVis(data) {
  
  //var data = removeInvalidData(eval(jQuery('#dataSelector').val()));

  var w = 600,
      h = 500,
      xMax = pv.max(data, function(d) { return d.incidence }),
      yMax = pv.max(data, function(d) { return d.otherFactor }),
      xMin = pv.min(data, function(d) { return d.incidence }),
      yMin = pv.min(data, function(d) { return d.otherFactor }),
      x = pv.Scale.linear(0, xMax).range(0, w),
      y = pv.Scale.linear(0, yMax).range(0, h),
      colorScale = pv.Scale.linear(0, 1/4, 1/2, 3/4, 1).range("red", "blue", "green", "yellow", "black");
      c = jQuery.map(data, function() { return colorScale(Math.random()) })

  if (jQuery('#fitScalesToData').is(':checked')) {
    x = pv.Scale.linear(xMin, xMax).range(0, w);
    y = pv.Scale.linear(yMin, yMax).range(0, h);
  }

  var userDrawnLinePoints = [{ x:w * 0.2, y:h / 2 }, 
                             { x:w * 0.8, y:h / 2 }];

  vis = new pv.Panel()
          .width(w)
          .height(h)
          .bottom(20)
          .left(20)
          .right(10)
          .top(5)
          .events("all")
          .event("mousemove", pv.Behavior.point());

  /* Y-axis ticks */
  vis.add(pv.Rule)
     .data(function() { return y.ticks() })
     .bottom(y)
     .strokeStyle(function(d) { return d ? "#eee" : "#000" })
     .anchor('left').add(pv.Label)
       .text(x.tickFormat);

  /* Y-axis label */
  vis.anchor('left')
     .add(pv.Label)
     .textAngle(0.5 * Math.PI)
     .textBaseline('bottom')
     .text('Other factor');

  /* X-axis ticks */
  vis.add(pv.Rule)
     .data(function() { return x.ticks() })
     .left(x)
     .strokeStyle(function(d) { return d ? "#eee" : "#000" })
     .anchor("bottom").add(pv.Label)
       .text(x.tickFormat);
       
  /* X-axis label */
  vis.anchor("bottom")
     .add(pv.Label)
     .text('Incidence per 100k');
     
   
  /* median median crosses and squares */
  var groups = divideDataInto3(data);
  var medians = getMedianValuesFrom(groups);

  for (var i = 0; i < groups.length; i++) {
     var bounds = getBounds(groups[i]);
     var coords = getBoundingCoords(bounds);

     /* rectangle around median group */
     vis.add(pv.Line)
        .visible(function() { return jQuery('#checkboxShowMMRects').is(':checked') })
        .data(coords)
        .left(function(d) { return x(d[0]) })
        .bottom(function(d) { return y(d[1]) })
        .lineWidth(0.5)
        .fillStyle(pv.rgb(255,165,0,0.05));

     /* median cross */
     vis.add(pv.Dot)
        .visible(function() { return jQuery('#checkboxShowMMDots').is(':checked') })
        .data([medians[i]]) // extra brackets so not to use x and y as seperate points
        .left(function(d) { return x(d[0]) })
        .bottom(function(d) { return y(d[1]) })
        .radius(10)
        .angle(Math.PI / 4)
        .shape('cross')
        .fillStyle(pv.rgb(255,165,0,1))
        .title("Median dot");
  }


  /* media-median line:
       Is middle median dot higher or lower than line through outer median dots? 
       That is, middle median dot's y value - y value at same x of original median line 
       divided by three */
  var slope = findSlope(medians[0][0], medians[2][0], medians[0][1], medians[2][1]);
  var intercept = findIntercept(medians[0][0], medians[0][1], slope);
  var medianYDelta = ((medians[1][1] - getYValue(medians[1][0], slope, intercept)) / 3);
  var adjustedIntercept = intercept + medianYDelta;
  var farLeftYVal = getYValue(xMin, slope, adjustedIntercept);
  var farRightYVal = getYValue(xMax, slope, adjustedIntercept);

  vis.add(pv.Line)
     .visible(function() { return jQuery('#checkboxShowMMLine').is(':checked') })
     .data([[xMin, farLeftYVal], [xMax, farRightYVal]])
     .left(function(d) { return x(d[0]) })
     .bottom(function(d) { return y(d[1]) })
     .title("Median-median line");


  /* dot plot */
  vis.add(pv.Dot)
     .data(data)
     .visible(function() { return jQuery('#checkboxShowData').is(':checked') })
     .event("point", function() { return this.active(this.index).parent })
     .event("unpoint", function() { return this.active(-1).parent })
     .left(function(d) { return x(d.incidence) })
     .bottom(function(d) { return y(d.otherFactor) })
     .radius(function() { return 3 / this.scale })
     .fillStyle("#eee")
     .strokeStyle(function(d) { return c[this.index] })
     .title(function(d) { return d.state + ": " + d.incidence + ", " + d.otherFactor })
     .def('active', -1)
     .event("point", function() { return this.active(this.index).parent })
     .event("unpoint", function() { return this.active(-1).parent })
     .anchor("right").add(pv.Label)
       .visible(function() { return this.anchorTarget().active() == this.index })
       .text(function(d) { return d.state + ": " + d.incidence + ", " + d.otherFactor });

     
  /* user drawn line */
  vis.add(pv.Line)
     .data(userDrawnLinePoints)
     .left(function(d) { return d.x })
     .top(function(d) { return d.y })
     .visible(function() { return jQuery('#checkboxShowUserLine').is(':checked') })
     .add(pv.Dot)
        .fillStyle("blue")
        .shape('square')
        .event("mousedown", pv.Behavior.drag())
        .event("drag", vis)
        
  
  function calcDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2))
  }
  

  /* user ellipse */
  jQuery('#sliderEllipseRotation').slider({ 
    orientation:'vertical', min:0, max:Math.PI, value:0, step:0.01,
    slide:function(event, ui) { vis.render(); }
  });

  jQuery('div#sliderEllipseXRadius').slider({
    orientation:'vertical', min:5, max:w / 2, value:w / 4,
    slide:function(event, ui) { vis.render(); }
  });
  
  jQuery('div#sliderEllipseYRadius').slider({
    orientation:'vertical', min:5, max:w / 2, value:w / 4,
    slide:function(event, ui) { vis.render(); }
  });
  
  var fullRot = pv.range(0, 2 * Math.PI, 0.01);
  var ellipseCX = x((xMin + xMax) / 2);
  var ellipseCY = y((yMin + yMax) / 2);
  
  function getRotatedEllipseCoords() {
    var ellipseXRadius = jQuery('#sliderEllipseXRadius').slider('value');
    var ellipseYRadius = jQuery('#sliderEllipseYRadius').slider('value');
    
    var coords = [];
    for (i = 0; i < fullRot.length; i++) {
      coords.push([ ellipseXRadius * Math.cos(fullRot[i]),
                    ellipseYRadius * Math.sin(fullRot[i]) ]);
    }
    var angle = jQuery('#sliderEllipseRotation').slider('value');
    
    for (var i = 0; i < coords.length; i++) {
      coords[i] = ([ coords[i][0] * Math.cos(angle) - coords[i][1] * Math.sin(angle) + ellipseCX,
                     coords[i][0] * Math.sin(angle) + coords[i][1] * Math.cos(angle) + ellipseCY ]);
    }
    return coords;
  }
  
  vis.add(pv.Line)
     .visible(function() { return jQuery('#checkboxShowMMEllipse').is(':checked') })
     .data(getRotatedEllipseCoords)
     .left(function(i) { return i[0] })
     .bottom(function(i) { return i[1] });
     
  vis.render();
}


function Spreadsheet(key) {
  this.key = key;
  this.fetchWorksheet();
}

Spreadsheet.prototype = { 
  listFeedURL: function() {
    return 'https://spreadsheets.google.com/feeds/list/' + this.key + '/od6/public/basic?alt=json&callback=?'
  },
  
  transformFeedData: function(feedData) {
    var data = [];
    for (var i = 0; i < feedData.feed.entry.length; i++) {
      var cells = feedData.feed.entry[i].content.$t.split(',');
      var firstMatch = /\:\s+([\d|\.]+)/.exec(cells[0]);
      var secondMatch = /\:\s+([\d|\.]+)/.exec(cells[1]);
      if (!firstMatch || !secondMatch)
        ; // ignore bad or blank data
      else
        data.push({state: feedData.feed.entry[i].title.$t, incidence: firstMatch[1], otherFactor: secondMatch[1]});
    }
    return data;
  },
  
  fetchWorksheet: function() {
    var worksheet = this;
    jQuery.getJSON(worksheet.listFeedURL(), function(feedData) {
      worksheet.data = worksheet.transformFeedData(feedData);
      worksheet.title = feedData.feed.title.$t;
      jQuery('body').trigger({ type:'WorksheetLoaded', worksheet:worksheet });
    });
  }
  
};

var exampleSpreadsheets = [
  new Spreadsheet('0AlqUG_LhxDPZdDlJSHFoc3M0Mzg4ZnZRZHNVYllCX1E'),
  new Spreadsheet('0AlqUG_LhxDPZdEJWZDBjcXhZZXcwMlVONWR3VlhqU0E'),
  new Spreadsheet('0AlqUG_LhxDPZdGk0ODFNcmxXV243dThtV2RvQTZTeGc'),
  new Spreadsheet('0AlqUG_LhxDPZdFdDMFJwNmsyel8xNkh6bk1tUFBqalE'),
  new Spreadsheet('0AlqUG_LhxDPZdEtwbmduS3hOeGhSS29HZXZFZU1CTlE'),
  new Spreadsheet('0AlqUG_LhxDPZdER5X3RkZ3VKYnpGU1lVRXJOa0JJYkE'),
  new Spreadsheet('0AlqUG_LhxDPZdElOOU4wWExSdl9uUjZOcmc5UnhjeXc'),
  new Spreadsheet('0AlqUG_LhxDPZdEJyRUVKa2RRSHhEZm0zRTlzSlZ0MVE'),
  new Spreadsheet('0AlqUG_LhxDPZdGpnSHh4THREZEtlNGxCRTVsUWN2aFE'),
  new Spreadsheet('0AlqUG_LhxDPZdGppdDh6Z01TeTM3eGRlbkJQM09JSUE')
]

function getWorksheetByKey(key) {
  for (var i = 0; i < exampleSpreadsheets.length; i++) {
    if (exampleSpreadsheets[i].key == key)
      return exampleSpreadsheets[i];
  }
}

jQuery('#newSpreadsheetURL').keyup(function(event) {
  if (event.keyCode == '13') {
    var matches = /key\=([A-Z|a-z|0-9|_|-]+)/.exec($(this).val());
    if (!matches)
      alert("That doesn't appear to be a valid URL");
    else {
      var key = matches[1];
      $(this).val('');
      exampleSpreadsheets.push(new Spreadsheet(key));
    }
  }
});

/* populate dataset drop down menu */
jQuery('body').bind('WorksheetLoaded', function(event) {
  jQuery('#dataSelector').append(jQuery("<option value='" + event.worksheet.key + "'>" + event.worksheet.title + "</option>"));
  constructVis(event.worksheet.data);
});

jQuery('#menu').change(function(event) {
  jQuery('span').remove();
  var key = jQuery('#dataSelector').val();
  constructVis(getWorksheetByKey(key).data);
  event.stopPropagation();
})

jQuery('#editInGoogleDocs').click(function(event) {
  var key = jQuery('#dataSelector').val();
  if (!key || key == "")
    alert("There is no worksheet loaded");
  else
    window.open('https://spreadsheets.google.com/ccc?key=' + key);
  event.preventDefault();
});

jQuery('#menuOptions').change(function(event) {
  vis.render();
  event.stopPropagation();
});

function toggleEllipseSliders() {
  if (jQuery('#checkboxShowMMEllipse').is(':checked')) {
    jQuery('#ellipseSliders').show();
  } else {
    jQuery('#ellipseSliders').hide();
  }
}
toggleEllipseSliders(); // in case the page loads with the ellipse checkbox checked
jQuery('#checkboxShowMMEllipse').change(toggleEllipseSliders);