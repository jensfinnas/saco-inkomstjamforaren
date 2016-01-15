// Funcitons for managing data
var columnFormats =  {
    incomeGroup: function(d) {
        d.value = +d.value.replace(",",".");
        return d;
    },
    percentile: function(d) {
        d.income = +d.income;
        return d;
    },
}

var dsv = d3.dsv(";", "text/plain");

function getProfessionData(professionSlug, callback) {
    var incomeGroupFile = "data/by_profession/incomegroup-" + professionSlug + ".csv";
    var percentileFile = "data/by_profession/percentile-" + professionSlug + ".csv";
    dsv(incomeGroupFile, columnFormats.incomeGroup, function(error, incomeGroupData) {
        
        // Fetch upper and lower boundry of income group
        incomeGroupData = incomeGroupData.map(function(d) {
            d.incomeLower = +d.income.split("-")[0];
            d.incomeUpper = +d.income.split("-")[1];
            return d;
        })
        // Nest by public/private
        var nestedData = {
            incomeGroup: {},
            percentile: {}
        };
        d3.nest()
            .key(function(d) { return d.publicprivate; })
            .entries(incomeGroupData)
            .forEach(function(d) {
                nestedData.incomeGroup[d.key] = d.values;
            });

        d3.csv(percentileFile, columnFormats.percentile, function(error, percentileData) {
            d3.nest()
                .key(function(d) { return d.publicprivate; })
                .entries(percentileData)
                .forEach(function(d) {
                    nestedData.percentile[d.key] = d.values;
                });
            callback({
                "private": {
                    incomeGroupData: nestedData.incomeGroup["private"],
                    percentileData: nestedData.percentile["private"]
                },
                "public": {
                    incomeGroupData: nestedData.incomeGroup["public"],
                    percentileData: nestedData.percentile["public"]
                }
            })
        })
    })
}

// Get a list of available professions from json file
function getProfessionList(filePath, callback) {
    d3.json(filePath, function(error, data) {
        callback(data)
    })
}

