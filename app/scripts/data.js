// Funcitons for managing data
var columnFormats =  {
    incomeGroup: function(d) {
        d.value = +d.value;
        return d;
    },
    percentile: function(d) {
        d.income = +d.income;
        return d;
    },
}

function getData(professionSlug, publicprivate, callback) {
    var incomeGroupFile = "data/by_profession/incomegroup-" + professionSlug + "-" + publicprivate + ".csv";
    var percentileFile = "data/by_profession/percentile-" + professionSlug + "-" + publicprivate + ".csv";
    d3.csv(incomeGroupFile, columnFormats.incomeGroup, function(error, incomeGroupData) {
        
        // Fetch upper and lower boundry of income group
        incomeGroupData = incomeGroupData.map(function(d) {
            d.incomeLower = +d.income.split("-")[0];
            d.incomeUpper = +d.income.split("-")[1];
            return d;
        })
        d3.csv(percentileFile, columnFormats.percentile, function(error, percentileData) {
            callback({
                incomeGroupData: incomeGroupData,
                percentileData: percentileData
            })
        });
    });
}

// Get a list of available professions from json file
function getProfessionList(filePath, callback) {
    d3.json(filePath, function(error, data) {
        callback(data)
    })
}

