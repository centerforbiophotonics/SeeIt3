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
  return $.map(data, function(elem, index) {
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



function renderIt(data, options) {
    if (!options)
      options = {};
      
    data = removeInvalidData(data);
  
    var w = 600,
        h = 500,
        xMax = pv.max(data, function(d) { return d.incidence }),
        yMax = pv.max(data, function(d) { return d.otherFactor }),
        x = pv.Scale.linear(0, xMax).range(0, w),
        y = pv.Scale.linear(0, yMax).range(0, h);

    var xMin = pv.min(data, function(d) { return d.incidence }),
        yMin = pv.min(data, function(d) { return d.otherFactor });
        
    if (options.fitScalesToData) {
      x = pv.Scale.linear(xMin, xMax).range(0, w);
      y = pv.Scale.linear(yMin, yMax).range(0, h);
    }
  
    /* the main panel */
    var vis = new pv.Panel()
        .width(w)
        .height(h)
        .bottom(20)
        .left(20)
        .right(10)
        .top(5);
  
    /* Y-axis ticks */
    vis.add(pv.Rule)
       .data(y.ticks())
       .bottom(y)
       .strokeStyle(function(d) { return d ? "#eee" : "#000" })
       .anchor('left').add(pv.Label)
         .visible(function(d) { return d > 0 && d < 100 })
         .text(x.tickFormat);
         
    vis.anchor('left')
       .add(pv.Label)
       .textAngle(0.5 * Math.PI)
       .textBaseline('bottom')
       .text('Other factor');
   
    /* X-axis ticks */
    vis.add(pv.Rule)
       .data(x.ticks())
       .left(x)
       .strokeStyle(function(d) { return d ? "#eee" : "#000" })
       .anchor("bottom").add(pv.Label)
         .visible(function(d) { return d >= 0 && d < 100 })
         .text(x.tickFormat);

    vis.anchor("bottom")
       .add(pv.Label)
       .text('Incidence per 100k');


     if (options.drawMedianMedian) {
       var groups = divideDataInto3(data);
       var medians = getMedianValuesFrom(groups);
       for (var i = 0; i < groups.length; i++) {
         var bounds = getBounds(groups[i]);
         var coords = getBoundingCoords(bounds);

         /* rectangle around group */
         vis.add(pv.Line)
            .data(coords)
            .left(function(d) { return x(d[0]) })
            .bottom(function(d) { return y(d[1]) })
            .lineWidth(1)
            .fillStyle(pv.rgb(255,165,0,0.15));

         /* median dot */
         vis.add(pv.Dot)
            .data([medians[i]]) // extra brackets so not to use x and y as seperate points
            .left(function(d) { return x(d[0]) })
            .bottom(function(d) { return y(d[1]) })
            .radius(10)
            .angle(Math.PI/4)
            .shape('cross')
            .fillStyle(pv.rgb(255,165,0,1))
            .title("Median dot");
       }
       
       var slope = findSlope(medians[0][0], medians[2][0], medians[0][1], medians[2][1]);
       var intercept = findIntercept(medians[0][0], medians[0][1], slope);
       
       /* Is middle median dot higher or lower than line through outer median dots? 
          That is, middle median dot's y value - y value at same x of original median line 
          divided by three */
       var medianYDelta = ((medians[1][1] - getYValue(medians[1][0], slope, intercept)) / 3);
       var adjustedIntercept = intercept + medianYDelta;
       
       var farLeftYVal = getYValue(xMin, slope, adjustedIntercept);
       var farRightYVal = getYValue(xMax, slope, adjustedIntercept);
       
        /* media-median line */
        vis.add(pv.Line)
           .data([[xMin, farLeftYVal], [xMax, farRightYVal]])
           .left(function(d) { return x(d[0]) })
           .bottom(function(d) { return y(d[1]) })
           .title("Median-median line");
     }

    /* dot plot */
    vis.add(pv.Panel)
       .data(data)
       .add(pv.Dot)
         .left(function(d) { return x(d.incidence) })
         .bottom(function(d) { return y(d.otherFactor) })
         .radius(3)
         .fillStyle("#eee")
         .title(function(d) { return d.state + ": " + d.incidence + ", " + d.otherFactor });
         
    vis.render();
}

var datasetNames = [
  'lungCancervsAtLeastBachelors',
  'lungCancervsAtLeastHS',
  'lungCancervsDivorceRate',
  'lungCancervsLessThanHS',
  'lungCancervsLifeExpectancy',
  'lungCancervsLungCancerMortality',
  'lungCancervsMedianEarnings',
  'lungCancervsPercentChildrenNoSmokers',
  'lungCancervsPercentSmoker',
  'lungCancervsSchoolEnroll'
];

/* populate dataset drop down menu */
$.each(datasetNames, function() {
  // $.getScript("data/" + this + ".js");
  $('#dataSelector').append($("<option value='" + this + "'>" + this + "</option>"));
});

$('body').bind('eventMenuChange', function(event) {
  $('body span').remove();
  renderIt(eval($('#dataSelector').val()), { drawMedianMedian:$('#checkboxMedianMedian').is(':checked'),
                                             fitScalesToData:$('#fitScalesToData').is(':checked') });
});

$('#dataSelector').change(function() {
  $('body').trigger('eventMenuChange');
});

$('#checkboxMedianMedian').change(function() {
  $('body').trigger('eventMenuChange');
});

$('#fitScalesToData').change(function() {
  $('body').trigger('eventMenuChange');
});


$('body').trigger('eventMenuChange'); // draw the initial plot