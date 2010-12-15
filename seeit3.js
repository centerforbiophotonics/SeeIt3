/* make SVG tag (must use createElementNS to work in FF) */
var ATTR_MAP = {"className": "class", "svgHref": "href"};
var NS_MAP = {"svgHref": "http://www.w3.org/1999/xlink"};

function makeSVGTag(tag, attributes) {
    var elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var attribute in attributes) {
        var name = (attribute in ATTR_MAP ? ATTR_MAP[attribute] : attribute);
        var value = attributes[attribute];
        if (attribute in NS_MAP)
            elem.setAttributeNS(NS_MAP[attribute], name, value);
        else
            elem.setAttribute(name, value);
    }
    return elem;
}

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
        xMin = pv.min(data, function(d) { return d.incidence }),
        yMin = pv.min(data, function(d) { return d.otherFactor }),
        x = pv.Scale.linear(0, xMax).range(0, w),
        y = pv.Scale.linear(0, yMax).range(0, h),
        c = pv.Scale.linear(0, xMax).range("brown", "orange");

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
        .top(5)
        .events("all")
        .event("mousemove", pv.Behavior.point());
  
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
       
    var groups = divideDataInto3(data);
    var medians = getMedianValuesFrom(groups);
    for (var i = 0; i < groups.length; i++) {
       var bounds = getBounds(groups[i]);
       var coords = getBoundingCoords(bounds);

       /* rectangle around group */
       if (options.showMMRects) {
         vis.add(pv.Line)
            .data(coords)
            .left(function(d) { return x(d[0]) })
            .bottom(function(d) { return y(d[1]) })
            .lineWidth(1)
            .fillStyle(pv.rgb(255,165,0,0.15));
       }

       /* median dot */
       if (options.showMMDots) {
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
    if (options.showMMLine) {
      vis.add(pv.Line)
         .data([[xMin, farLeftYVal], [xMax, farRightYVal]])
         .left(function(d) { return x(d[0]) })
         .bottom(function(d) { return y(d[1]) })
         .title("Median-median line");
    }

    /* dot plot */
    if (options.showData) {
      vis.add(pv.Dot)
         .data(data)
         .def("active", -1)
         .event("point", function() { return this.active(this.index).parent })
         .event("unpoint", function() { return this.active(-1).parent })
         .left(function(d) { return x(d.incidence) })
         .bottom(function(d) { return y(d.otherFactor) })
         .radius(3)
         .fillStyle("#eee")
         .strokeStyle(function(d) { return c(d.incidence) })
         .title(function(d) { return d.state + ": " + d.incidence + ", " + d.otherFactor })
         .anchor('right')
            .add(pv.Label)
              .visible(function() { return this.anchorTarget().active() == this.index })
              .text(function(d) { return d.state + ": " + d.incidence + ", " + d.otherFactor })
              .fillStyle('white');
    }
    
    vis.render();
    renderUserDrawnLine();
    
    /* median-median ellipse, after vis.render() because we need to access $('svg') */
    if (options.showMMEllipse) {
      function calcDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2))
      }
      /* width of ellipse is the length of the median median line */
      var radius = calcDistance(xMin, farLeftYVal, xMax, farRightYVal) / 2;
      
      var cx = (xMin + xMax) / 2;
      var cy = (farLeftYVal + farRightYVal) / 2;

      $('svg').svg();
      var svg = $('svg').svg('get');

      /* h - y(cy) because we need to invert the y coordinate system: (0,0) is lower left not upper left;
         translate(20,5) because of protovis (unknown why) */
      var degreeSlope = -Math.atan(slope) * 180 / Math.PI;
      var ellipse = svg.ellipse(x(cx), h - y(cy), x(radius), 10, { 
                          strokeWidth:2, stroke:'black', 
                          transform:'translate(20,5) rotate(' + degreeSlope + ' ' + x(cx) + ' ' + (h - y(cy)) + ')' });
      $(ellipse).appendTo('svg');
      
      $('<div id="ellipseSliders"></div>').appendTo('span');
      
      $('<div id="sliderEllipseRotation">Rotate ellipse</div>').appendTo('#ellipseSliders');
      $('#sliderEllipseRotation').slider({ 
        orientation:'vertical', min:0, max:180, value:degreeSlope,
        slide:function(event, ui) {
          $(ellipse).attr('transform', 'translate(20,5) rotate(' + 
              (degreeSlope + ui.value) + ' ' + x(cx) + ' ' + (h - y(cy)) + ')');
        }
      });
      
      $('<div id="sliderEllipseYRadius">Ellipse y-radius</div>').appendTo('#ellipseSliders');
      $('div#sliderEllipseYRadius').slider({
        orientation:'vertical', min:10, max:y(yMax), value:10,
        slide:function(event, ui) {
          $(ellipse).attr('ry', ui.value);
        }
      });
    }
    
}


/* allow the user to draw their own line */
var $userDrawnLine; // store the line so we can add it back in after protovis redraws

function renderUserDrawnLine() {

  /* if we've stored a line, add it back in */
  if ($userDrawnLine && $('line.userDrawn').length == 0) {
    $('svg').append($userDrawnLine);
  }
  
  $('svg').mousedown(function(event) {
    $svg = $(this);
    if (event.which == 1) {
      var xStart = event.pageX - $svg.offset().left;
      var yStart = event.pageY - $svg.offset().top;
      $userDrawnLine = $('line.userDrawn');
      
      if ($userDrawnLine.length > 0)
        $userDrawnLine.remove();
      
      
      $userDrawnLine = $(makeSVGTag('line', { x1:xStart, y1:yStart, x2:xStart, y2:yStart, stroke:'black', 
                                           strokeWidth:2, class:'userDrawn' }))
                              .appendTo($svg);
      event.stopPropagation();
    
      $svg.mousemove(function(event) {
        var x = event.pageX - $svg.offset().left;
        var y = event.pageY - $svg.offset().top;
        $userDrawnLine.attr('x2', x).attr('y2', y);
        event.stopPropagation();
      })
    }
  }).mouseup(function(event) {
    $(this).unbind('mousemove');
  });
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
  renderIt(eval($('#dataSelector').val()), { fitScalesToData:$('#fitScalesToData').is(':checked'),
                                             showData:$('#checkboxShowData').is(':checked'),
                                             showMMLine:$('#checkboxMMLine').is(':checked'),
                                             showMMDots:$('#checkboxMMDots').is(':checked'),
                                             showMMRects:$('#checkboxMMRects').is(':checked'),
                                             showMMEllipse:$('#checkboxMMEllipse').is(':checked') });
});

$('#menuOptions').change(function() {
  $('body').trigger('eventMenuChange');
});

$('input#checkboxShowUserShapes').change(function() {
  if ($(this).is(':checked'))
    $('.userDrawn').show();
  else
    $('.userDrawn').hide();
})

$('body').trigger('eventMenuChange'); // draw the initial plot