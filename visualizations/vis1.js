function vis1(data, div) {

  var donor_data = Array.from(d3.rollup(data, rec=>d3.sum(rec.map(c=>c.commitment_amount_usd_constant)), d=>d.donor), ([country, amount])=>({country,amount})).sort((a, b) => d3.descending(a.amount, b.amount));
  var recipient_data = Array.from(d3.rollup(data, rec=>-d3.sum(rec.map(c=>c.commitment_amount_usd_constant)), d=>d.recipient), ([country, amount])=>({country,amount})).sort((a, b) => d3.descending(a.amount, b.amount));
  
  var donor_map = Object.fromEntries(donor_data.map(item => [item.country, item.amount]));
  var recipient_map = Object.fromEntries(recipient_data.map(item => [item.country, item.amount]));

  var merged_data = donor_data.concat(recipient_data).sort((a, b) => d3.descending(
    ( a.country in donor_map ? donor_map[a.country]: 0 )+ (a.country in recipient_map ? recipient_map[a.country] : 0), 
    ( b.country in donor_map ? donor_map[b.country]: 0 )+ (b.country in recipient_map ? recipient_map[b.country] : 0)
  ));

  var countries = Array.from(new Set(merged_data.map(d => d.country)));
  
  const margin = ({top: 30, right: 60, bottom: 10, left: 60});
  const width = 1000;
  var barHeight = 25;
  const height = Math.ceil((Math.max(donor_data.length, recipient_data.length) + 0.1) * barHeight) + margin.top + margin.bottom;
  console.log(height);
  var x = d3.scaleLinear()
    .domain(d3.extent(merged_data, d => d.amount))
    .rangeRound([margin.left, width - margin.right]);
  
  var t= margin.bottom;
  var y = d3.scaleBand()
    .domain(countries)
    .rangeRound([margin.top, height - t])
    .padding(0.1);
  
  var xAxis = g => g
  .attr("transform", `translate(0,${margin.top})`)
  .call(d3.axisTop(x).ticks(width / 80).tickFormat(function(d){return d/1000000 + " M"}))
  .call(g => g.select(".domain").remove());

  var yAxis = g => g
    .attr("transform", `translate(${x(0)},0)`)
    .call(d3.axisLeft(y));

  
  

  const svg = div.append('svg')
      .attr("viewBox", [0, 0, width, height]);
  
  svg.append("g")
    .selectAll("rect")
    .data(merged_data)
    .join("rect")
      .attr("fill", d => d3.schemeSet1[d.amount > 0 ? 1 : 0])
      .attr("x", d => x(Math.min(d.amount, 0)))
      .attr("y", d=>y(d.country))
      .attr("width", d => Math.abs(x(d.amount) - x(0)))
      .attr("height", y.bandwidth());

  svg.append("g")
      .call(xAxis);

  svg.append("g")
      .call(yAxis);
}
