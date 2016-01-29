function getData(a,b,c){var d="data/by_profession/incomegroup-"+a+"-"+b+".csv",e="data/by_profession/percentile-"+a+"-"+b+".csv";d3.csv(d,columnFormats.incomeGroup,function(a,b){b=b.map(function(a){return a.incomeLower=+a.income.split("-")[0],a.incomeUpper=+a.income.split("-")[1],a}),d3.csv(e,columnFormats.percentile,function(a,d){c({incomeGroupData:b,percentileData:d})})})}function getProfessionList(a,b){d3.json(a,function(a,c){b(c)})}function initHelpers(){d3.selectAll(".helper").each(function(a){var a=d3.select(this),b=d3.select(a.attr("data-target")),c=b.node().getBoundingClientRect(),d=a.node().getBoundingClientRect();"#income"==a.attr("data-target")&&a.classed("show-at-start",!0);var e=c.left+c.width/2-d.width/2,f=a.classed("tip-bottom")?c.top-d.height-8:c.top+d.height;a.style("left",e+"px").style("top",f+"px"),a.classed("initiated",!0)}),d3.select("body").on("click",function(){d3.selectAll(".helper").classed("show-at-start",!1)})}function initPromo(){var a=d3.select("#promo"),b=["Vad tjänar personer födda samma år som du?","Vad har andra akademiker från ditt län för lön?","Vad tjänar personer som tog examen samma år som du?"],c=b[Math.floor(Math.random()*b.length)];a.selectAll(".random-sentence").text(c),a.classed("show",!0)}function extend(a,b){for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c]);return a}IncomeChart=function(){function a(a,b,c,d){var e=this;e.container=d3.select(a),defaultOpts={yMax:1,isIframe:!1},e.opts=extend(defaultOpts,d),e.data=b,e.income=c,e.chartContainer=e.container.append("div").attr("class","chart-container"),e.xOrdinal=d3.scale.ordinal(),e.xLinear=d3.scale.linear(),e.defineXScale(e.data.incomeGroupData),e.y=d3.scale.linear().domain([0,e.opts.yMax]),e.drawChart(),e.update(b),d3.select(window).on("resize",function(){e.resize()})}function b(a,b){return b>=a.incomeLower}return a.prototype.drawChart=function(){var a=this,b=a.container[0][0].offsetWidth;a.margins=m={top:5,right:25,bottom:45,left:35},a.width=w=b-m.left-m.right,a.height=h=.5*w,a.pointRadius=.01*b;.7*m.bottom+"px";a.svg=a.chartContainer.append("svg").attr("width",w+m.left+m.right).attr("height",h+m.top+m.bottom),a.chart=a.svg.append("g").attr("transform","translate("+m.left+", "+m.top+")"),a.xOrdinal.rangeBands([0,w],0,0),a.xLinear.range([0,w]),a.y.range([h,0]),a.xAxis=d3.svg.axis().scale(a.xOrdinal).orient("bottom"),a.yAxis=d3.svg.axis().scale(a.y).tickFormat(formatPercent).orient("left"),a.tooltip=d3.tip().attr("class","d3-tip").direction("n").offset([-10,0]).html(function(a){var b=formatLargeNum(a.incomeLower),c=a.incomeUpper?formatLargeNum(a.incomeUpper):"",d=a.value<.01?"Färre än en procent":formatPercentText(a.value);return d+" tjänar <br/>"+b+"-"+c+" kr"}),a.chart.call(a.tooltip),a.yAxisGroup=a.chart.append("g").attr("class","y axis").call(a.yAxis),a.xAxisGroup=a.chart.append("g").attr("class","x axis").attr("transform","translate(0,"+h+")").call(a.xAxis),a.xAxisGroup.append("text").attr("x",w/2).attr("y",m.bottom-20).attr("dy",".7em").style("text-anchor","middle").attr("class","title").text("Månadslön"),a.incomeLine=a.chart.append("g").attr("class","income-line").attr("transform","translate("+a.xLinear(a.income)+","+-m.top+")"),a.incomeLine.append("line").attr("class","line").attr("x1",0).attr("x2",0).attr("y1",0).attr("y2",h+m.top),a.incomeLine.append("text").attr("transform","rotate(90)").attr("y",-5).attr("class","label").text("Din lön"),a.incomeMarker=a.chart.append("g").attr("class","income-marker").attr("transform","translate("+a.xLinear(a.income)+",0)");var c=Math.max(9,.8*a.xOrdinal.rangeBand()),d=.9*c,e=[[-c/2,0],[c/2,0],[0,d]],f="M "+e.join(" L ")+" Z";a.incomeMarker.append("path").attr("d",f).attr("class","marker").attr("transform","translate("+[0,-d-2]+")"),a.incomeMarker.append("text").attr("dy",".35em").attr("transform","rotate(270)").attr("x",d+6).attr("class","label").text("Din lön"),a.isIframe&&pymChild.sendHeight()},a.prototype.update=function(a){var b=this;b.data=a,b.defineXScale(b.data.incomeGroupData);var c=700;b.barGroups=b.chart.selectAll(".bar-group").data(b.data.incomeGroupData,function(a){return a.income});var d=b.barGroups.enter().append("g").attr("class","bar-group").attr("transform",function(a){var c=b.xOrdinal(a.income),d=b.y(a.value);return"translate("+c+","+d+")"});d.append("rect").attr("class","bar").attr("width",b.xOrdinal.rangeBand()).attr("height",function(a){return h-b.y(a.value)}).on("mouseover",b.tooltip.show).on("mouseout",b.tooltip.hide);var e=b.barGroups.transition().duration(c);e.attr("transform",function(a){var c=b.xOrdinal(a.income),d=b.y(a.value);return"translate("+c+","+d+")"}),e.select(".bar").attr("height",function(a){return h-b.y(a.value)}).attr("width",b.xOrdinal.rangeBand()),b.barGroups.exit().remove(),b.xAxisGroup.transition().duration(c).call(b.xAxis);var f=b.maxIncome-b.minIncome>25e3?1e4:5e3;b.xAxisGroup.selectAll(".tick text").text(function(a){var b=a.split("-")[0];return b%f==0?formatLargeNum(b):""}),b.highlightBars(b.income,c);var g=b.chart.selectAll(".highlighted").last(),i=g[0][0].__data__;b.incomeMarker.transition().duration(c).attr("transform","translate("+[b.xLinear(b.income),b.y(i.value)]+")"),b.updatePercentile()},a.prototype.updateIncomeLine=function(a){var b=this;a=Math.max(Math.min(b.maxIncome,a),b.minIncome);var c=b.income;b.income=a;var d=1e3*Math.abs(a-c)/(b.maxIncome-b.minIncome);if(c!==a){var e=100,f=0;clearInterval(b.animation),b.animation=setInterval(function(){var d=c+(a-c)*f/e;b.highlightBars(d,0),f++,f>e&&clearInterval(b.animation)},d/e)}b.updatePercentile()},a.prototype.updatePercentile=function(){var a=this,b=a.getPercentile(a.income);d3.selectAll(".percentile").text(b)},a.prototype.defineXScale=function(a){var b=this;b.xOrdinal.domain(a.map(function(a){return a.income})),b.minIncome=a[0].incomeUpper-999,b.maxIncome=a[a.length-1].incomeLower+999,b.xLinear.domain([b.minIncome,b.maxIncome])},a.prototype.getPercentile=function(a){var b=this,c=0;for(c=0;c<b.data.percentileData.length;c++){var d=b.data.percentileData[c];if(c==b.data.percentileData.length-1)return"över "+d.percentile+" procent";if(d.income>a)return 0==c?"under "+d.percentile+" procent":d.percentile+" procent"}return""},a.prototype.highlightBars=function(a,c){var d=this,e=0;d.barGroups.classed("highlighted",function(c){var d=b(c,a);return d&&e++,d});var f=d.barGroups[0][e-1],g=d.y(f.__data__.value),h=d.xLinear(a);d.incomeMarker.transition().duration(c).attr("transform","translate("+h+","+g+")")},a.prototype.resize=function(){var a=this;a.svg.remove(),a.drawChart(),a.update(a.data)},a}();var columnFormats={incomeGroup:function(a){return a.value=+a.value,a},percentile:function(a){return a.income=+a.income,a}},locale=d3.locale({decimal:",",thousands:" ",grouping:[3],currency:["","SEK"],dateTime:"%A den %d %B %Y %X",date:"%Y-%m-%d",time:"%H:%M:%S",periods:["fm","em"],days:["Söndag","Måndag","Tisdag","Onsdag","Torsdag","Fredag","Lördag"],shortDays:["Sön","Mån","Tis","Ons","Tor","Fre","Lör"],months:["Januari","Februari","Mars","April","Maj","Juni","Juli","Augusti","September","Oktober","November","December"],shortMonths:["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Aug","Sep","Okt","Nov","Dec"]}),formatPercent=locale.numberFormat("%"),formatPercentDecimal=locale.numberFormat(".1%"),formatPercentText=function(a){return formatPercent(a).replace("%"," procent")},formatLargeNum=locale.numberFormat(","),pluralize=function(a){return a?"e"==a.slice(-1)?a+"rna":a+"erna":""};UI=function(){function a(a,b){var c=this;c.data=b,c.elem=d3.select(a),c.elems={profession:c.elem.select("#profession"),income:c.elem.select("#income"),publicprivate:c.elem.select("#publicprivate")}}return a.prototype.renderProfessions=function(){var a=this,b=a.data.map(function(a){return a.profession}).sort();a.elems.profession.selectAll("option").data(b,function(a){return a}).enter().append("option").attr("value",function(a){return a}).text(function(a){return a.toLowerCase()})},a.prototype.select=function(a,b){var c=this;c.elems[a].node().value=b},a.prototype.profession=function(){var a=this,b=a.elems.profession.node().value;return{value:b,valid:""!==b}},a.prototype.income=function(){var a=this,b=+a.elems.income.node().value.trim();return{value:b,valid:!isNaN(b)}},a.prototype.publicprivate=function(){var a=this,b=a.elems.publicprivate.node().value;return{value:b,valid:""!==b}},a.prototype.validate=function(){var a=this,b=["income","profession","publicprivate"],c=[];return b.forEach(function(b){var d=a[b]().valid;d3.select(".helper[data-target='#"+b+"']").classed("show",!d),c.push(d)}),[c].every(Boolean)},a}(),d3.selection.prototype.first=function(){return d3.select(this[0][0])},d3.selection.prototype.last=function(){var a=this.size()-1;return d3.select(this[0][a])};