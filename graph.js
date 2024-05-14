const margin = { top: 100, right: 50, bottom: 50, left: 80 };
const height = 700 - margin.top - margin.bottom;
const width = 900 - margin.left - margin.right;

const svg = d3
  .select(".canvas")
  .append("svg")
  .attr("height", height + margin.top + margin.bottom)
  .attr("width", width + margin.left + margin.right)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

// gradent #ef4444

const gradient = svg
  .append("defs")
  .append("linearGradient")
  .attr("id", "gradient")
  .attr("x1", "0%")
  .attr("y1", "0%")
  .attr("x2", "0%")
  .attr("y2", "100%")
  .attr("spreadMethod", "pad");

gradient
  .append("stop")
  .attr("offset", "0%")
  .attr("stop-color", "#ef4444")
  .attr("stop-opacity", 1);

gradient
  .append("stop")
  .attr("offset", "100%")
  .attr("stop-color", "#ef4444")
  .attr("stop-opacity", 0);

// create tooltip div

const tooltip = d3.select("body").append("div").attr("class", "tooltip");

// Circle on hover

const circle = svg
  .append("circle")
  .attr("r", 0)
  .attr("fill", "#0ea5e9")
  .style("stroke", "white")
  .attr("opacity", 0.7)
  .attr("pointer-events", "none");

d3.json("data.json").then((data) => {
  const parseDate = d3.timeParse("%Y-%m-%d");

  data.forEach((d) => {
    d.date = parseDate(d.date);
    d.price = +d.price;
  });

  x.domain(d3.extent(data, (d) => d.date));
  y.domain([0, d3.max(data, (d) => d.price)]);
  const area = d3
    .area()
    .x((d) => x(d.date))
    .y0(height)
    .y1((d) => y(d.price));

  const line = d3
    .line()
    .x((d) => x(d.date))
    .y((d) => y(d.price));

  // Area
  svg
    .append("path")
    .datum(data)
    .attr("d", area)
    .style("fill", "url(#gradient)")
    .style("opacity", 0.25);
  svg
    .append("path")
    .datum(data)
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 2);

  const xAxis = svg.append("g").attr("transform", `translate(0, ${height})`);
  const yAxis = svg.append("g").attr("transform", `translate(${width}, 0)`);
  xAxis.call(d3.axisBottom(x));
  yAxis.call(d3.axisRight(y).tickFormat((d) => `$${d}`));

  // Add vertical gridlines
  svg
    .selectAll("xGrid")
    .data(x.ticks())
    .join("line")
    .attr("x1", (d) => x(d))
    .attr("x2", (d) => x(d))
    .attr("y1", 0)
    .attr("y2", height)
    .attr("stroke", "#cdcdcd")
    .attr("stroke-width", 0.5);

  // // Add horizontal gridlines

  svg
    .selectAll("yGrid")
    .data(y.ticks())
    .join("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", (d) => y(d))
    .attr("y2", (d) => y(d))
    .attr("stroke", "#cdcdcd")
    .attr("stroke-width", 0.5);

  const listeningRect = svg
    .append("rect")
    .attr("class", "hoverContainer")
    .attr("width", width)
    .attr("height", height);
  listeningRect.on("mousemove", (e) => {
    const [xCoord] = d3.pointer(e);
    const bisectDate = d3.bisector((d) => d.date).left;
    const x0 = x.invert(xCoord);
    const i = bisectDate(data, x0, 1);
    const d0 = data[i - 1];
    const d1 = data[i];
    const d = x0 - d0.date > d1.date - x0 ? d1 : d0;
    const xPos = x(d.date);
    const yPos = y(d.price);

    circle
      .attr("cx", xPos)
      .attr("cy", yPos)
      .transition()
      .duration(50)
      .attr("r", 5);

    // add in  our tooltip

    tooltip
      .style("display", "block")
      .style("left", `${xPos + 100}px`)
      .style("top", `${yPos + 50}px`)
      .html(
        `<strong>Date:</strong> ${d.date.toLocaleDateString()}<br><strong>Population:</strong> ${
          d.price !== undefined ? d.price : "N/A"
        }`
      );
  });
  // listening rectangle mouse leave function

  listeningRect.on("mouseleave", function () {
    circle.transition().duration(50).attr("r", 0);

    tooltip.style("display", "none");
  });
});
