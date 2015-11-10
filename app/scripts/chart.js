function extend(a, b){
    for(var key in b)
        if(b.hasOwnProperty(key))
            a[key] = b[key];
    return a;
}

IncomeChart = (function() {
    function IncomeChart(selector, data, income, opts) {
        var self = this;
        self.container = d3.select(selector);
        defaultOpts = {
            yMax: 1,
            isIframe: false
        }
        self.opts = extend(defaultOpts, opts);

        // Inital state
        self.data = data;
        self.income = income;

        // Init description container
        self.description = self.container.append("div")
            .attr("class", "description")
            .html('Men en månadslön på <span class="income"></span> tjänar du mer än <span class="amount"></span> av <span class="profession"></span> inom <span class="publicprivate"></span>.');

        // Init chart
        self.xOrdinal = d3.scale.ordinal()
            .domain(data.map(function(d) { return d.income; }));

        var xMin = data[0].incomeUpper;
        var xMax = data[data.length - 1].incomeLower;
        self.xLinear = d3.scale.linear()
            .domain([xMin, xMax]);

        self.y = d3.scale.linear()
            .domain([0, self.opts.yMax]);

        self.drawChart();

        // Make responsize
        d3.select(window).on('resize', function() {
            self.resize();
        });
    }

    IncomeChart.prototype.drawChart = function() {
        var self = this;
        var containerWidth = self.container[0][0].offsetWidth;

        // Setup sizing
        self.margins = m = {
            top: 40,
            right: containerWidth * 0.1,
            bottom: 45,
            left: 50
        };
        self.width = w = containerWidth - m.left - m.right;
        self.height = h = w * 0.5;
        self.pointRadius = containerWidth * 0.01;
        var fontSize = m.bottom * 0.7 + "px";

        //Position description container
        self.description
            .style("left", m.left + w * 0.6 + "px")
            .style("top", m.top + h * 0.05 + "px")
            .style("max-width", m.left + w * 0.25 + "px")


        // Create SVG container
        self.svg = self.container.append('svg')
            .attr('width', w + m.left + m.right)
            .attr('height', h + m.top + m.bottom);
        self.chart = self.svg.append('g')
            .attr('transform', 'translate(' + m.left + ', ' + m.top + ')');


        // Functions for calculations
        self.xOrdinal.rangeBands([0, w], 0, 0);
        self.xLinear.range([0,w]);

        self.y.range([h, 0]);

        var xAxis = d3.svg.axis()
            .scale(self.xOrdinal)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(self.y)
            .tickFormat(formatPercent)
            .orient("left");

        // Setup tooltip
        var tooltip = d3.tip()
          .attr('class', 'd3-tip')
          .direction("n")
          .offset([-10,0])
          .html(function(d) {
            return formatLargeNum(d.incomeLower) + "-" + formatLargeNum(d.incomeUpper) + " kr";
          });
        self.chart.call(tooltip);

        // Draw y axis
        self.chart.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        // Draw x axis
        var xAxisGroup = self.chart.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + h + ")")
            .call(xAxis);
        
        xAxisGroup.selectAll(".tick text")
            .text(function(d) {
                var lowerIncome = d.split("-")[0];
                return lowerIncome % 10000 == 0 ? formatLargeNum(lowerIncome) : ""; 
            });

        /*xAxisGroup.selectAll("text")
                .attr("y", 0)
                .attr("x", 9)
                .attr("dy", ".35em")
                .attr("transform", "rotate(90)")
                .style("text-anchor", "start");*/

        xAxisGroup.append("text")
          .attr("x", w / 2)
          .attr("y", m.bottom - 20)
          .attr("dy", ".7em")
          .style("text-anchor", "middle")
          .attr("class", "title")
          .text("Månadslön");

        // Income line
        self.incomeLine = self.chart.append("g")
            .attr("class","income-line");
            //.attr("transform", "translate(" + self.xLinear(self.income) + "," + (-m.top) + ")")

        self.incomeLine.append("line")
            .attr("class", "line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", 0)
            .attr("y2", h + m.top)

        self.incomeLine.append("text")
            .attr("transform", "rotate(90)")
            .attr("y", -5)
            .attr("class", "label")
            .text("Din lön")

        // Draw bars
        self.barGroups = self.chart.selectAll(".bar-group")
            .data(self.data, function(d) { return d.income })
            .enter()
            .append("g")
            .attr("class", "bar-group")
            .attr("transform", function(d) {
                var x = self.xOrdinal(d.income);
                var y = self.y(d.value);
                return "translate(" + x + "," + y + ")";
            })
        
        self.barGroups.append("rect")
            .attr("class", "bar")
            .attr("width", self.xOrdinal.rangeBand())
            .attr("height", function(d) { return h - self.y(d.value); })
            .on("mouseover", tooltip.show)
            .on("mouseout", tooltip.hide);;

        self.updateIncomeLine(self.income);

        // Send resize signal to parent page
        if (self.isIframe) {
            pymChild.sendHeight();
        }
    }

    IncomeChart.prototype.updateData = function(data) {
        var self = this;
        self.data = data;
        var animationDuration = 700;

        var barGroups = self.barGroups
            .data(self.data, function(d) { return d.income })
            .transition()
            .duration(animationDuration);
        
        barGroups
            .attr("transform", function(d) {
                var x = self.xOrdinal(d.income);
                var y = self.y(d.value);
                return "translate(" + x + "," + y + ")";
            })

        barGroups.select(".bar")
            .attr("height", function(d) { return h - self.y(d.value); })

        self.updateDescription();
    }

    IncomeChart.prototype.updateIncomeLine = function(income) {
        var self = this;
        self.income = income;
        var incomeLineX = self.xLinear(self.income);
        incomeLineX = Math.min(Math.max(incomeLineX, 0), w);
        self.incomeLine
            .transition()
            .duration(500)
            .attr("transform", "translate(" + incomeLineX + "," + (-m.top) + ")")

        // Update coloring of bars
        self.barGroups.classed("highlighted", function(d) { 
            return self.income > d.incomeLower && d.incomeUpper; 
        })

        // 
        self.updateDescription();
    }

    IncomeChart.prototype.updateDescription = function() {
        var self = this;
        var profession = self.data[0].profession;
        var publicprivate = self.data[0].publicprivate == "public" ? "offentlig sektor" : "privat sektor";
        var amount = d3.sum(self.data
                .filter(function(d) { return self.income > d.incomeLower && d.incomeUpper })
                .map(function(d) { return d.value; })
                );

        self.description.select(".income").text(formatLargeNum(self.income) + " kronor");
        self.description.select(".amount").text(formatPercentText(amount));
        self.description.select(".profession").text(pluralize(profession).toLowerCase());
        self.description.select(".publicprivate").text(publicprivate);

    }

    IncomeChart.prototype.resize = function() {
        var self = this;
        self.svg.remove();
        self.drawChart();
    }
    return IncomeChart;
})();