function ramp(div, color, n = 256) {
  const canvas = div.append("canvas");
  const context = canvas.node().getContext("2d");
  for (let i = 0; i < n; ++i) {
    context.fillStyle = color(i / (n - 1));
    context.fillRect(i, 0, 10, 10);
  }
  return canvas.node();
}

function legend2({
  div,
  color,
  title,
  tickSize = 6,
  width = 250, 
  height = 100 + tickSize,
  marginTop = 0,
  marginRight = 0,
  marginBottom = -20 + tickSize,
  marginLeft = 0,
  ticks = width / 64,
  tickFormat,
  tickValues
} = {}) {
  const svg = div.append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .style("overflow", "visible")
      .style("display", "block");

  let tickAdjust = g => g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);
  let x;


 // Sequential
 if (color.interpolator) {
  x = Object.assign(color.copy()
      .interpolator(d3.interpolateRound(marginLeft, width - marginRight)),
      {range() { return [marginLeft, width - marginRight]; }});

  svg.append("image")
      .attr("x", marginLeft)
      .attr("y", marginTop)
      .attr("width", width - marginLeft - marginRight)
      .attr("height", height - marginTop - marginBottom)
      .attr("preserveAspectRatio", "none")
      .attr("xlink:href", ramp(div, color.interpolator()));

  // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
  if (!x.ticks) {
    if (tickValues === undefined) {
      const n = Math.round(ticks + 1);
      tickValues = d3.range(n).map(i => d3.quantile(color.domain(), i / (n - 1)));
    }
    if (typeof tickFormat !== "function") {
      tickFormat = d3.format(tickFormat === undefined ? ",f" : tickFormat);
    }
  }
}


  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x)
        .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
        .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
        .tickSize(tickSize)
        .tickValues(tickValues))
      .call(g => g.select(".domain").remove())
      .call(g => g.append("text")
        .attr("x", marginLeft)
        .attr("y", marginTop + marginBottom - height - 6)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text(title));
}

function vis2(geoJSON, data, div) {

var donor_data = Array.from(d3.rollup(data, rec=>d3.sum(rec.map(c=>c.commitment_amount_usd_constant)), d=>d.donor), ([country, amount])=>({country,amount})).sort((a, b) => d3.descending(a.amount, b.amount));
var recipient_data = Array.from(d3.rollup(data, rec=>-d3.sum(rec.map(c=>c.commitment_amount_usd_constant)), d=>d.recipient), ([country, amount])=>({country,amount})).sort((a, b) => d3.descending(a.amount, b.amount));

var donor_map = Object.fromEntries(donor_data.map(item => [item.country, item.amount]));
var recipient_map = Object.fromEntries(recipient_data.map(item => [item.country, item.amount]));
var merged_data = donor_data.concat(recipient_data).sort((a, b) => d3.descending(
    ( a.country in donor_map ? donor_map[a.country]: 0 )+ (a.country in recipient_map ? recipient_map[a.country] : 0), 
    ( b.country in donor_map ? donor_map[b.country]: 0 )+ (b.country in recipient_map ? recipient_map[b.country] : 0)
  ));
console.log(merged_data)
var total_data_map = d3.rollup(merged_data, rec=> d3.sum(rec.map(d=>d.amount)), d=>d.country);
var total_data_array = Array.from(total_data_map, ([country, amount])=>({country, amount}));

countryToGeo = geoJSON.features.reduce((result, d) => {
  result[d.properties.sovereignt] = d;
  return result;})
countryToGeo['United States'] = countryToGeo['United States of America']

const percentChangeExtent = d3.extent(total_data_array, d => d.amount);

const colorProb3 = d3.scaleDiverging()
  .domain([percentChangeExtent[0], 0, percentChangeExtent[1]])
  .interpolator(d3.interpolateRdYlBu);

legend2({
  div:div, 
  color: colorProb3,
  tickFormat: function(d){return d/1000000 + " M"},
  title: "Net Amounts" ,
});

// margin convention
const margin = {top: 10, right: 0, bottom: 0, left: 0};
const visWidth = 900 - margin.left - margin.right;
const visHeight = 400 - margin.top - margin.bottom;

const svg = div.append('svg')
      .attr("viewBox", [0, 0, visWidth ,visHeight])

const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

const projection =  d3.geoNaturalEarth1()
    .fitSize([visWidth, visHeight], geoJSON);

const path = d3.geoPath().projection(projection);

g.append("path")
    .datum(geoJSON)
    .attr("d", path)
    .attr("stroke", "white");



var countries_map = Object.fromEntries(total_data_map);
console.log(total_data_map)
countries_map['United States of America'] = countries_map['United States'];

const g3= svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

g3.selectAll('.border')
  .data(geoJSON.features)
  .join('path')
    .attr('class', 'border')
    .attr('d', path)
    .attr('fill', d=>countries_map.hasOwnProperty(d.properties.sovereignt) ? colorProb3(countries_map[d.properties.sovereignt]) : '#ffffff')
    .attr('stroke', '#dcdcdc')
    .attr('stroke-width', 0.5);

}