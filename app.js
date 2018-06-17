var svgWidth = 1160;
var svgHeight = 800;

var margin = {
  top: 100,
  right: 100,
  bottom: 120,
  left: 120
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "Poverty";
var chosenYAxis = "Depressed";

///  Linear Scales ///

// function used for updating x-scale var upon click on axis label
function xScale(StateData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(StateData, d => d[chosenXAxis]) * 0.5,
    d3.max(StateData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}
// function used for updating y-scale var upon click on axis label
function yScale(StateData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(StateData, d => d[chosenYAxis]) * .5,
    d3.max(StateData, d => d[chosenYAxis]) * 1.2
    ])
    .range([0, height]);
  return yLinearScale;
}

///  AXES 

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}
// function used for updating circles group with a transition to
// new circles
function renderXCircles(circlesGroup, newXScale, chosenXaxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));
  return circlesGroup;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  return yAxis;
}
// function used for updating circles group with a transition to
// new circles y
function renderYCircles(circlesGroup, newYScale, chosenYaxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenYAxis, chosenXAxis, circlesGroup) {
  if (chosenXAxis == "Unemployment") {
    var xlabel = "Unemployment (%)";
  }
  if (chosenXAxis == "Poverty") {
    var xlabel = "Poverty (%)";
  }
  if (chosenXAxis == "High_school") {
    var xlabel = "High school Graduate (%)";
  }
  if (chosenXAxis == "College") {
    var xlabel = "Bachelor's degree or higher (%)";
  }

  if (chosenYAxis == "Depressed") {
    var ylabel = "Ever Depressed (%)";
  }
  if (chosenYAxis == "Diabetes") {
    var ylabel = "Diabetes (%)";
  }
  if (chosenYAxis == "Internet30") {
    var ylabel = "Internet in last 30 Days (%)";
  }
  if (chosenYAxis == "Diff_concentrate") {
    var ylabel = "Difficulty Concentrating (%)";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([100, -80])
    .html(function (d) {
     var stateName = d.State;
      return (`${stateName}<br>${d[chosenXAxis]} ${xlabel}<br>${d[chosenYAxis]} ${ylabel})`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function (data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function (data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("data.csv", function (err, StateData) {
  if (err) throw err;

  // parse data
  StateData.forEach(function (data) {
    data.State = data.State;
    data.Unemployment = +data.Unemployment;
    data.Poverty = +data.Poverty;
    data.High_school = +data.High_school;
    data.College = +data.College;
    data.Depressed = +data.Depressed;
    data.Diabetes = +data.Diabetes;
    data.Internet30 = +data.Internet30;
    data.Diff_concentrate = +data.Diff_concentrate;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(StateData, chosenXAxis);
  // Create y scale function
  var yLinearScale = yScale(StateData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .attr("transform", `translate(1-${width}, 0)`)
    .call(leftAxis);

  var circlesGroup = chartGroup.selectAll("circle")
    .data(StateData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .attr("fill", "green")
    .attr("opacity", ".8");

  // Create group for  4 y- axis labels
  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width + 20}, ${height / 2})`)
    .attr("y", 0 - margin.left)
    .attr("x", 1 - (height / 2))
    .attr("transform", "rotate(-90)")
    .classed("axis-text", true)
    .attr("dy", "1em");
  var DepressedLabel = ylabelsGroup.append("text")
    .attr("value", "Depressed") // value to grab for event listener
    .attr("x", -250)
    .attr("y", -25)
    .classed("active", true)
    .classed("inactive", false)
    .text("Ever Depressed (%)");
  var DiabetesLabel = ylabelsGroup.append("text")
    .attr("value", "Diabetes") // value to grab for event listener
    .attr("x", -250)
    .attr("y", -45)
    .classed("active", false)
    .classed("inactive", true)
    .text("Diabetes (%)");
  var Internet30Label = ylabelsGroup.append("text")
    .attr("value", "Internet30") // value to grab for event listener
    .attr("x", -250)
    .attr("y", -65)
    .classed("active", false)
    .classed("inactive", true)
    .text("Internet in last 30 Days (%)");
  var Diff_concentrateLabel = ylabelsGroup.append("text")
    .attr("value", "Diff_concentrate") // value to grab for event listener
    .attr("x", -250)
    .attr("y", -85)
    .classed("active", false)
    .classed("inactive", true)
    .text("Difficulty Concentrating (%)");

  // Create group for  4 x- axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`)
    .attr("dx", "1em")
    .classed("axis-text", true);
  var PovertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "Poverty") // value to grab for event listener
    .classed("active", true)
    .classed("inactive", false)
    .text("Poverty (%)");
  var UnemploymentLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "Unemployment") // value to grab for event listener
    .classed("active", false)
    .classed("inactive", true)
    .text("Unemployment (%)");
  var High_schoolLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "High_school") // value to grab for event listener
    .classed("active", false)
    .classed("inactive", true)
    .text("High school Graduate (%)");
  var CollegeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 80)
    .attr("value", "College") // value to grab for event listener
    .classed("active", false)
    .classed("inactive", true)
    .text("Bachelor's degree or higher (%)");
  // updateXToolTip function above csv import
  var circlesGroup = updateToolTip(chosenYAxis ,chosenXAxis, circlesGroup);
  // Y axis labels event listener
  ylabelsGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value != chosenYAxis) {
        // replaces chosenXAxis with value
        chosenYAxis = value;
        console.log(chosenYAxis)
        // updates y scale for new data
        yLinearScale = yScale(StateData, chosenYAxis);
        // updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);
        // updates circles with new y values
        circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenYAxis, chosenXAxis, circlesGroup);
        // changes classes to change bold text
        if (chosenYAxis == "Diabetes") {
          DiabetesLabel
            .classed("active", true)
            .classed("inactive", false);
          DepressedLabel
            .classed("active", false)
            .classed("inactive", true);
          Internet30Label
            .classed("active", false)
            .classed("inactive", true);
          Diff_concentrateLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        if (chosenYAxis == "Internet30") {
          Internet30Label
            .classed("active", true)
            .classed("inactive", false);
          DepressedLabel
            .classed("active", false)
            .classed("inactive", true);
          DiabetesLabel
            .classed("active", false)
            .classed("inactive", true);
          Diff_concentrateLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        if (chosenYAxis == "Diff_concentrate") {
          Diff_concentrateLabel
            .classed("active", true)
            .classed("inactive", false);
          Internet30Label
            .classed("active", false)
            .classed("inactive", true);
          DepressedLabel
            .classed("active", false)
            .classed("inactive", true);
          DiabetesLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          DepressedLabel
            .classed("active", true)
            .classed("inactive", false);
          Internet30Label
            .classed("active", false)
            .classed("inactive", true);
          DiabetesLabel
            .classed("active", false)
            .classed("inactive", true);
          Diff_concentrateLabel
            .classed("active", false)
            .classed("inactive", true);
        }
      }
    });
  xlabelsGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value != chosenXAxis) {
        // replaces chosenXAxis with value
        chosenXAxis = value;
        console.log(chosenXAxis)
        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(StateData, chosenXAxis);
        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);
        // updates circles with new x values
        circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenYAxis, chosenXAxis, circlesGroup);
        // changes classes to change bold text
        if (chosenXAxis == "Unemployment") {
          UnemploymentLabel
            .classed("active", true)
            .classed("inactive", false);
          PovertyLabel
            .classed("active", false)
            .classed("inactive", true);
          High_schoolLabel
            .classed("active", false)
            .classed("inactive", true);
          CollegeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        if (chosenXAxis == "High_school") {
          High_schoolLabel
            .classed("active", true)
            .classed("inactive", false);
          PovertyLabel
            .classed("active", false)
            .classed("inactive", true);
          UnemploymentLabel
            .classed("active", false)
            .classed("inactive", true);
          CollegeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        if (chosenXAxis == "College") {
          High_schoolLabel
            .classed("active", false)
            .classed("inactive", false);
          PovertyLabel
            .classed("active", false)
            .classed("inactive", true);
          UnemploymentLabel
            .classed("active", false)
            .classed("inactive", true);
          CollegeLabel
            .classed("active", true)
            .classed("inactive", true);
        }
        else {
          PovertyLabel
            .classed("active", true)
            .classed("inactive", false);
          UnemploymentLabel
            .classed("active", false)
            .classed("inactive", true);
          High_schoolLabel
            .classed("active", false)
            .classed("inactive", true);
          CollegeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
      }
    });
});
