var n = 300,
    accXData = d3.range(n),
    accYData = d3.range(n),
    accZData = d3.range(n);

var margin = {top: 20, right: 20, bottom: 20, left: 40},
    width = 600 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;
var x = d3.scale.linear()
    .domain([0, n - 1])
    .range([0, width]);
var y = d3.scale.linear()
    .domain([-2, 2])
    .range([height, 0]);
var line = d3.svg.line()
    .x(function(d, i) { return x(i); })
    .y(function(d, i) { return y(d); });
var svg = d3.select("#graph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
svg.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", width)
    .attr("height", height);
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + y(0) + ")")
    .call(d3.svg.axis().scale(x).orient("bottom"));
svg.append("g")
    .attr("class", "y axis")
    .call(d3.svg.axis().scale(y).orient("left"));

var path = svg.append("g")
    .attr("clip-path", "url(#clip)")
    .append("path")
    .datum(accXData)
    .attr("class", "line line-x")
    .attr("d", line);

var path2 = svg.append("g")
    .attr("clip-path", "url(#clip)")
    .append("path")
    .datum(accYData)
    .attr("class", "line line-y")
    .attr("d", line);

var path3 = svg.append("g")
    .attr("clip-path", "url(#clip)")
    .append("path")
    .datum(accZData)
    .attr("class", "line line-z")
    .attr("d", line);

var ipc = require('ipc');
var updateIntervalEl = document.querySelector("#rate-value");
var el = {};
var elInitialized = false;
var lastUpdate = 0;
var prevSlope = 0;
var buffer = [];
var isPrevSlopePositive = false;
var curSlope = 0;
var isCurSlopePositive = false;
var lastInverse = 0;
var curInverse = 0;
var rpm = 0;
var rpmEl = document.querySelector('#rpm');

ipc.on('imu-changed', function(message) {
    if (!elInitialized) {
      _.forIn(message, function(val, key) {
          el[key] = document.querySelector('#'+key);
      });
      elInitialized = true;
    }

    buffer.push(message.accX);

    if (buffer.length === 20) {
      curSlope = buffer[19] - buffer[0];
      isCurSlopePositive = curSlope > 0;

      if (isCurSlopePositive !== isPrevSlopePositive) {
        curInverse = Date.now();

        rpm = 60000 / (2 * (curInverse - lastInverse));

        lastInverse = curInverse;
      }

      isPrevSlopePositive = isCurSlopePositive;

      buffer.shift();
    }

    accXData.push(message.accX);
    accYData.push(message.accY);
    accZData.push(message.accZ);

    _.forIn(message, function(val, key) {
      if (!el[key]) {el[key] = document.querySelector('#'+key);}
      el[key].innerHTML = val;
    });

    path
      .attr("d", line)
      .attr("transform", null)
    .transition()
      .duration(10)
      .ease("linear")
      .attr("transform", "translate(" + x(-1) + ",0)");

    path2
      .attr("d", line)
      .attr("transform", null)
    .transition()
      .duration(10)
      .ease("linear")
      .attr("transform", "translate(" + x(-1) + ",0)");

    path3
      .attr("d", line)
      .attr("transform", null)
    .transition()
      .duration(10)
      .ease("linear")
      .attr("transform", "translate(" + x(-1) + ",0)");

    accXData.shift();
    accYData.shift();
    accZData.shift();

    rpmEl.innerHTML = Math.abs(rpm);
    updateIntervalEl.innerHTML = Date.now() - lastUpdate + " ms" ;
    lastUpdate = Date.now();
});

var connectBtn = document.querySelector("#connect-btn");
connectBtn.onmouseup = function() {
  ipc.send('connect');
};