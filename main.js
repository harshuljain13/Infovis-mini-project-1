// Load the datasets and call the functions to make the visualizations


Promise.all([
  d3.csv('data/aiddata-countries-only.csv', d3.autoType),
  d3.json('data/countries.json'),
  d3.csv('data/aiddata-countries-only.csv', d3.autoType),
]).then(([data, geoJSON,data2]) => {
  vis1(data, d3.select('#vis1'));
  vis2(geoJSON, data2, d3.select('#vis2'));
});