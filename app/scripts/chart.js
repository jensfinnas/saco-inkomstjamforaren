
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
        self.data = data.incomeGroupData;
        self.percentileData = data.percentileData;
        self.income = income;

        // Append chart container
        self.chartContainer = self.container.append("div")
            .attr("class", "chart-container");

        // Init description container
        /*self.description = self.container.append("div")
            .attr("class", "description")
            .html('Men en månadslön på <span class="income"></span> tjänar du mer än <span class="amount"></span> av <span class="profession"></span> inom <span class="publicprivate"></span>.');*/

        // Init chart
        self.xOrdinal = d3.scale.ordinal()
            .domain(self.data.map(function(d) { return d.income; }));

        self.minIncome = self.data[0].incomeUpper - 999;
        self.maxIncome = self.data[self.data.length - 1].incomeLower + 999;
        self.xLinear = d3.scale.linear()
            .domain([self.minIncome, self.maxIncome]);

        self.y = d3.scale.linear()
            .domain([0, self.opts.yMax]);

        self.drawChart();

        // Make responsize
        d3.select(window).on('resize', function() {
            self.resize();
        });
    }

    function isActiveBin(bin, selectedIncome) {
        return selectedIncome >= bin.incomeLower ;
    }

    // Draw all DOM elements
    IncomeChart.prototype.drawChart = function() {
        var self = this;
        var containerWidth = self.container[0][0].offsetWidth;

        // Setup sizing
        self.margins = m = {
            top: 5,
            right: 25,
            bottom: 45,
            left: 35 
        };
        self.width = w = containerWidth - m.left - m.right;
        self.height = h = w * 0.5;
        self.pointRadius = containerWidth * 0.01;
        var fontSize = m.bottom * 0.7 + "px";

        //Position description container
        /*self.description
            .style("left", m.left + w * 0.6 + "px")
            .style("top", m.top + h * 0.05 + "px")
            .style("max-width", m.left + w * 0.25 + "px")*/


        // Create SVG container
        self.svg = self.chartContainer.append('svg')
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
            var lower = formatLargeNum(d.incomeLower);
            var upper = d.incomeUpper ? formatLargeNum(d.incomeUpper) : "";
            var amount = d.value < 0.01 ? "Färre än en procent" : formatPercentText(d.value);
            return amount + " tjänar <br/>" + lower + "-" + upper + " kr";
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
            .attr("class","income-line")
            .attr("transform", "translate(" + self.xLinear(self.income) + "," + (-m.top) + ")");

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
            .on("mouseout", tooltip.hide);

        // Income marker
        self.incomeMarker = self.chart.append("g")
            .attr("class","income-marker")
            .attr("transform", "translate(" + self.xLinear(self.income) + "," + (0) + ")");

        var _mW = Math.max(9, self.xOrdinal.rangeBand() * 0.8);
        var _mH = _mW * 0.9;
        var _points = [[-_mW / 2,0], [_mW/2,0], [0, _mH] ];
        var _path = "M " + _points.join(" L ") + " Z";
        self.incomeMarker.append("path")
            .attr("d", _path)
            .attr("class", "marker")
            .attr("transform", "translate(" + [0, -_mH - 2] + ")")

        self.incomeMarker.append("text")
            .attr("dy",".35em")
            .attr("transform", "rotate(270)")
            .attr("x", _mH + 6)
            .attr("class","label")
            .text("Din lön")

        // Highlight bars below income
        self.highlightBars(self.income);

        // Send resize signal to parent page
        if (self.isIframe) {
            pymChild.sendHeight();
        }
    }

    // Transitions only
    IncomeChart.prototype.updateData = function(data) {
        var self = this;
        self.data = data.incomeGroupData;
        self.percentileData = data.percentileData;
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

        // Update marker
        var lastHighlighted = self.chart.selectAll(".highlighted").last();
        var _d = lastHighlighted[0][0].__data__;
        self.incomeMarker
            .transition()
            .duration(animationDuration)
            .attr("transform", "translate("+[self.xLinear(self.income), self.y(_d.value)]+")");
        self.updatePercentile();
    }

    // Transitions only
    IncomeChart.prototype.updateIncomeLine = function(income) {
        var self = this;
        // Make sure that the income is within range
        income = Math.max(Math.min(self.maxIncome, income), self.minIncome);

        // Store the previuos income for calculations
        var _prevIncome = self.income;
        self.income = income;

        // Make animation length depend on size of change
        var animationDuration = 1000 * Math.abs(income - _prevIncome) / (self.maxIncome - self.minIncome);

        // Animate change if income has changed
        // Couldn't find a d3 way to animate this transition so we do it "manually"
        // with setInterval()
        if (_prevIncome !== income) {
            var frames = 100;
            var frame = 0;

            // Stop ongoing animation
            clearInterval(self.animation);

            self.animation = setInterval(function() {
                // Get the income and x value of the current state of the animation
                var _income = _prevIncome + (income - _prevIncome) * frame/frames; 

                self.highlightBars(_income); 

                frame++;
                if (frame == frames) clearInterval(self.animation);
            }, animationDuration / frames);            
        }


        

        // 
        self.updatePercentile();
    }

    // Update the percentile text
    IncomeChart.prototype.updatePercentile = function() {
        var self  = this;
        var percentile = self.getPercentile(self.income);
        d3.selectAll(".percentile").text(percentile);
    }

    /*IncomeChart.prototype.updateDescription = function() {
        var self = this;
        var profession = self.data[0].profession;
        var publicprivate = self.data[0].publicprivate == "public" ? "offentlig sektor" : "privat sektor";
        var percentile = self.getPercentile(self.income);

        self.description.select(".income").text(formatLargeNum(self.income) + " kronor");
        self.description.select(".amount").text(percentile);
        self.description.select(".profession").text(pluralize(profession).toLowerCase());
        self.description.select(".publicprivate").text(publicprivate);

    }*/

    // Calculate how many percent have lower income
    // This is done using the percentile dataset
    IncomeChart.prototype.getPercentile = function(income) {
        var self = this;
        var percentile
        var i=0;
        for (i=0; i<self.percentileData.length; i++) {
            var d = self.percentileData[i];
            if (i == self.percentileData.length - 1) {
                return "över " + d.percentile + " procent";
            }
            if (d.income > income) {
                if (i==0) {
                    return "under " + d.percentile + " procent";
                }
                else {
                    return d.percentile + " procent";
                }
            }
        }
        return "";
    }

    // Highlight all bars below a given income
    IncomeChart.prototype.highlightBars = function(income) {
        var self = this; 

        // Highlight income groups below current income level
        var _numerOfHighlighted = 0;
        self.barGroups.classed("highlighted", function(d) { 
            var isActive = isActiveBin(d, income)
            if (isActive) _numerOfHighlighted++;
            return isActive; 
        });

        // Get the last highlighted income groups height for
        // positioning of marker
        var lastHighlighted = self.barGroups[0][_numerOfHighlighted - 1];
        
        var _y = self.y(lastHighlighted.__data__.value);
        var _x = self.xLinear(income);
        self.incomeMarker
            .attr("transform", "translate(" + _x + "," + _y + ")")
    }


    IncomeChart.prototype.resize = function() {
        var self = this;
        self.svg.remove();
        self.drawChart();
    }
    return IncomeChart;
})();