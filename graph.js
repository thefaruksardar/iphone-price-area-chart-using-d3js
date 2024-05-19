const MARGIN = { top: 100, right: 60, bottom: 60, left: 100 };

const HEIGHT = 600 - MARGIN.top - MARGIN.bottom;
const WIDTH = 600 - MARGIN.right - MARGIN.left;

const svg = d3
  .select(".canvas")
  .append("svg")
  .attr("height", HEIGHT + MARGIN.top + MARGIN.bottom)
  .attr("width", WIDTH + MARGIN.right + MARGIN.left)
  .append("g")
  .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

// Line Graph
const lineGraph = svg.append("g");

// X-Axis

const y = d3.scaleLinear().range([HEIGHT, 0]);
svg.append("g").call(d3.axisLeft(y));

// Y-Axis

const x = d3.scaleLinear().range([0, WIDTH]);
svg
  .append("g")
  .call(d3.axisBottom(x))
  .attr("transform", `translate(${0}, ${HEIGHT})`);

d3.csv("data.csv").then((data) => {
  data.forEach((d) => {
    d.Petal_Length = +d.Petal_Length;
    d.Sepal_Length = +d.Sepal_Length;
  });

  // Domains

  y.domain([0, d3.max(data, (d) => d.Petal_Length)]);
  x.domain([4, d3.max(data, (d) => d.Sepal_Length)]);

  // Color Scale

  const colorScale = d3
    .scaleOrdinal()
    .domain([data.map((d) => d.Species)])
    .range(["#22c55e", "#0ea5e9", "#e11d48"]);
  console.log(data);

  // Dots

  svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cy", (d) => y(d.Petal_Length))
    .attr("cx", (d) => x(d.Sepal_Length))
    .attr("r", 5)
    .attr("fill", (d) => colorScale(d.Species));
});
