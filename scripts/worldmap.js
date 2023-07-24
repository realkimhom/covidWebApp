var format = d3.format(",");

// Set tooltips
var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([200, -20])
    .html(function (d) {
        return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" +
            "<strong>Population: </strong><span class='details'>" + format(d.population) + "<br></span>" +
            "<strong>Total Confirmed: </strong><span class='details'>" + format(d.totalconfirmed) + "<br></span>" +
            "<strong>New Confirmed: </strong><span class='details'>" + format(d.newconfirmed) + "<br></span>" +
            "<strong>Case Ratio: </strong><span class='details'>" + format(((d.totalconfirmed * 100 /
                d.population).toPrecision(4))) + "%<br></span>" +
            "<strong>Mutant Count: </strong><span class='details'>" + format(d.mutant_count) + "<br></span>";

    })

var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var color = d3.scaleThreshold()
    .domain([10000, 100000, 500000, 1000000, 5000000, 10000000, 50000000, 100000000, 500000000, 1500000000])
    .range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)", "rgb(33,113,181)", "rgb(8,81,156)", "rgb(8,48,107)", "rgb(3,19,43)"]);

var path = d3.geoPath();

var svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append('g')
    .attr('class', 'map');

var projection = d3.geoMercator()
    .scale(130)
    .translate([width / 2, height / 1.5]);

var path = d3.geoPath().projection(projection);

svg.call(tip);
queue()
    .defer(d3.json, "../assets/world_countries_with_code.json")
    .defer(d3.tsv, "../assets/world_population.tsv")
    .defer(d3.json, "https://api.covid19api.com/summary")
    .defer(d3.tsv, "../assets/mutant_per_country.tsv")
    .await(map_initialisation);
var populationById = {};
var TotalConfirmed = {};
var NewConfirmed = {};
var MutantPerCountry = {}
var out_data;

function data_initialise(error, data, population, covid_data, mutant_data) {
    out_data = data;
    population.forEach(function (d) {
        populationById[d.id] = +d.population;
    });
    covid_data.Countries.forEach(function (d) {
        NewConfirmed[d.CountryCode] = d.NewConfirmed;
        TotalConfirmed[d.CountryCode] = d.TotalConfirmed;
    })
    mutant_data.forEach(function (d) {
        MutantPerCountry[d.CountryCode] = d.mutant_count;
    });
    data.forEach(function (d) {
        d.population = populationById[d.id]
        d.newconfirmed = NewConfirmed[d.CountryCode]
        d.totalconfirmed = TotalConfirmed[d.CountryCode]
        d.mutant_count = MutantPerCountry[d.CountryCode]
    });
    // console.log(MutantPerCountry)
}

function map_initialisation(error, data, population, covid_data, mutant_data) {
    data_initialise(error, data, population, covid_data, mutant_data);
    svg.append("g")
        .attr("class", "countries")
        .selectAll("path")
        .data(out_data)
        .enter().append("path")
        .attr("d", path)
        .style("fill", function (d) {
            return color(populationById[d.id]);
        })
        .style('stroke', 'white')
        .style('stroke-width', 1.5)
        .style("opacity", 0.8)
        // tooltips
        .style("stroke", "white")
        .style('stroke-width', 0.3)
        .on('mouseover', function (d) {
            tip.show(d);

            d3.select(this)
                .style("opacity", 1)
                .style("stroke", "white")
                .style("stroke-width", 3);
        })
        .on('mouseout', function (d) {
            tip.hide(d);

            d3.select(this)
                .style("opacity", 0.8)
                .style("stroke", "white")
                .style("stroke-width", 0.3);
        });
}

$("#scales").change(function () {
        self = $(this);
        // d3.select("g").remove();
        svg.select("g")
            .selectAll("path")
            .data(out_data)
            .style("fill", function (d) {
                if (self.val() === "new confirmed") {
                    return color(NewConfirmed[d.CountryCode] * 100);
                } else if (self.val() === "total confirmed") {
                    return color(TotalConfirmed[d.CountryCode]);
                } else if (self.val() === "population") {
                    return color(populationById[d.id]);
                } else if (self.val() === "total confirmed / new population")
                    return color(TotalConfirmed[d.CountryCode] * 1e+8 / populationById[d.id])
                else
                    return color(MutantPerCountry[d.CountryCode] * 1e+4)
            })
            .style('stroke', 'white')
            .style('stroke-width', 1.5)
            .style("opacity", 0.8)
            // tooltips
            .style("stroke", "white")
            .style('stroke-width', 0.3)
            .on('mouseover', function (d) {
                tip.show(d);

                d3.select(this)
                    .style("opacity", 1)
                    .style("stroke", "white")
                    .style("stroke-width", 3);
            })
            .on('mouseout', function (d) {
                tip.hide(d);

                d3.select(this)
                    .style("opacity", 0.8)
                    .style("stroke", "white")
                    .style("stroke-width", 0.3);
            });
    }
);
var svg = d3.select("svg"),
    margin = 200,
    width = svg.attr("width") - margin,
    height = svg.attr("height") - margin;
svg.style("fill",1000)


var xScale = d3.scaleBand().range([0, width]).padding(0.4),
    yScale = d3.scaleLinear().range([height, 0]);

var g = svg.append("g")
    .attr("transform", "translate(" + 100 + "," + 100 + ")");
