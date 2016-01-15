function getProfessionData(a,b){var c="data/by_profession/incomegroup-"+a+".csv",d="data/by_profession/percentile-"+a+".csv";dsv(c,columnFormats.incomeGroup,function(a,c){c=c.map(function(a){return a.incomeLower=+a.income.split("-")[0],a.incomeUpper=+a.income.split("-")[1],a});var e={incomeGroup:{},percentile:{}};d3.nest().key(function(a){return a.publicprivate}).entries(c).forEach(function(a){e.incomeGroup[a.key]=a.values}),d3.csv(d,columnFormats.percentile,function(a,c){d3.nest().key(function(a){return a.publicprivate}).entries(c).forEach(function(a){e.percentile[a.key]=a.values}),b({"private":{incomeGroupData:e.incomeGroup["private"],percentileData:e.percentile["private"]},"public":{incomeGroupData:e.incomeGroup["public"],percentileData:e.percentile["public"]}})})})}function getProfessionList(a,b){d3.json(a,function(a,c){b(c)})}function initHelpers(){d3.selectAll(".helper").each(function(a){var a=d3.select(this),b=d3.select(a.attr("data-target")),c=b.node().getBoundingClientRect(),d=a.node().getBoundingClientRect();"#income"==a.attr("data-target")&&a.classed("show-at-start",!0);var e=c.left+c.width/2-d.width/2,f=a.classed("tip-bottom")?c.top-d.height-8:c.top+d.height;a.style("left",e+"px").style("top",f+"px"),a.classed("initiated",!0)}),d3.select("body").on("click",function(){d3.selectAll(".helper").classed("show-at-start",!1)})}function initPromo(){var a=d3.select("#promo"),b=["Vad tjänar personer födda samma år som du?","Vad har andra akademiker från ditt län för lön?","Vad tjänar personer som tog examen samma år som du?"],c=b[Math.floor(Math.random()*b.length)];a.selectAll(".random-sentence").text(c),a.classed("show",!0)}function extend(a,b){for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c]);return a}IncomeChart=function(){function a(a,b,c,d){var e=this;e.container=d3.select(a),defaultOpts={yMax:1,isIframe:!1},e.opts=extend(defaultOpts,d),e.data=b.incomeGroupData,e.percentileData=b.percentileData,e.income=c,e.chartContainer=e.container.append("div").attr("class","chart-container"),e.xOrdinal=d3.scale.ordinal().domain(e.data.map(function(a){return a.income})),e.minIncome=e.data[0].incomeUpper-999,e.maxIncome=e.data[e.data.length-1].incomeLower+999,e.xLinear=d3.scale.linear().domain([e.minIncome,e.maxIncome]),e.y=d3.scale.linear().domain([0,e.opts.yMax]),e.drawChart(),d3.select(window).on("resize",function(){e.resize()})}function b(a,b){return b>=a.incomeLower}return a.prototype.drawChart=function(){var a=this,b=a.container[0][0].offsetWidth;a.margins=m={top:5,right:25,bottom:45,left:35},a.width=w=b-m.left-m.right,a.height=h=.5*w,a.pointRadius=.01*b;.7*m.bottom+"px";a.svg=a.chartContainer.append("svg").attr("width",w+m.left+m.right).attr("height",h+m.top+m.bottom),a.chart=a.svg.append("g").attr("transform","translate("+m.left+", "+m.top+")"),a.xOrdinal.rangeBands([0,w],0,0),a.xLinear.range([0,w]),a.y.range([h,0]);var c=d3.svg.axis().scale(a.xOrdinal).orient("bottom"),d=d3.svg.axis().scale(a.y).tickFormat(formatPercent).orient("left"),e=d3.tip().attr("class","d3-tip").direction("n").offset([-10,0]).html(function(a){var b=formatLargeNum(a.incomeLower),c=a.incomeUpper?formatLargeNum(a.incomeUpper):"",d=a.value<.01?"Färre än en procent":formatPercentText(a.value);return d+" tjänar <br/>"+b+"-"+c+" kr"});a.chart.call(e),a.chart.append("g").attr("class","y axis").call(d);var f=a.chart.append("g").attr("class","x axis").attr("transform","translate(0,"+h+")").call(c);f.selectAll(".tick text").text(function(a){var b=a.split("-")[0];return b%1e4==0?formatLargeNum(b):""}),f.append("text").attr("x",w/2).attr("y",m.bottom-20).attr("dy",".7em").style("text-anchor","middle").attr("class","title").text("Månadslön"),a.incomeLine=a.chart.append("g").attr("class","income-line").attr("transform","translate("+a.xLinear(a.income)+","+-m.top+")"),a.incomeLine.append("line").attr("class","line").attr("x1",0).attr("x2",0).attr("y1",0).attr("y2",h+m.top),a.incomeLine.append("text").attr("transform","rotate(90)").attr("y",-5).attr("class","label").text("Din lön"),a.barGroups=a.chart.selectAll(".bar-group").data(a.data,function(a){return a.income}).enter().append("g").attr("class","bar-group").attr("transform",function(b){var c=a.xOrdinal(b.income),d=a.y(b.value);return"translate("+c+","+d+")"}),a.barGroups.append("rect").attr("class","bar").attr("width",a.xOrdinal.rangeBand()).attr("height",function(b){return h-a.y(b.value)}).on("mouseover",e.show).on("mouseout",e.hide),a.incomeMarker=a.chart.append("g").attr("class","income-marker").attr("transform","translate("+a.xLinear(a.income)+",0)");var g=Math.max(9,.8*a.xOrdinal.rangeBand()),i=.9*g,j=[[-g/2,0],[g/2,0],[0,i]],k="M "+j.join(" L ")+" Z";a.incomeMarker.append("path").attr("d",k).attr("class","marker").attr("transform","translate("+[0,-i-2]+")"),a.incomeMarker.append("text").attr("dy",".35em").attr("transform","rotate(270)").attr("x",i+6).attr("class","label").text("Din lön"),a.highlightBars(a.income),a.isIframe&&pymChild.sendHeight()},a.prototype.updateData=function(a){var b=this;b.data=a.incomeGroupData,b.percentileData=a.percentileData;var c=700,d=b.barGroups.data(b.data,function(a){return a.income}).transition().duration(c);d.attr("transform",function(a){var c=b.xOrdinal(a.income),d=b.y(a.value);return"translate("+c+","+d+")"}),d.select(".bar").attr("height",function(a){return h-b.y(a.value)});var e=b.chart.selectAll(".highlighted").last(),f=e[0][0].__data__;b.incomeMarker.transition().duration(c).attr("transform","translate("+[b.xLinear(b.income),b.y(f.value)]+")"),b.updatePercentile()},a.prototype.updateIncomeLine=function(a){var b=this;a=Math.max(Math.min(b.maxIncome,a),b.minIncome);var c=b.income;b.income=a;var d=1e3*Math.abs(a-c)/(b.maxIncome-b.minIncome);if(c!==a){var e=100,f=0;clearInterval(b.animation),b.animation=setInterval(function(){var d=c+(a-c)*f/e;b.highlightBars(d),f++,f==e&&clearInterval(b.animation)},d/e)}b.updatePercentile()},a.prototype.updatePercentile=function(){var a=this,b=a.getPercentile(a.income);d3.selectAll(".percentile").text(b)},a.prototype.getPercentile=function(a){var b=this,c=0;for(c=0;c<b.percentileData.length;c++){var d=b.percentileData[c];if(c==b.percentileData.length-1)return"över "+d.percentile+" procent";if(d.income>a)return 0==c?"under "+d.percentile+" procent":d.percentile+" procent"}return""},a.prototype.highlightBars=function(a){var c=this,d=0;c.barGroups.classed("highlighted",function(c){var e=b(c,a);return e&&d++,e});var e=c.barGroups[0][d-1],f=c.y(e.__data__.value),g=c.xLinear(a);c.incomeMarker.attr("transform","translate("+g+","+f+")")},a.prototype.resize=function(){var a=this;a.svg.remove(),a.drawChart()},a}();var columnFormats={incomeGroup:function(a){return a.value=+a.value.replace(",","."),a},percentile:function(a){return a.income=+a.income,a}},dsv=d3.dsv(";","text/plain"),locale=d3.locale({decimal:",",thousands:" ",grouping:[3],currency:["","SEK"],dateTime:"%A den %d %B %Y %X",date:"%Y-%m-%d",time:"%H:%M:%S",periods:["fm","em"],days:["Söndag","Måndag","Tisdag","Onsdag","Torsdag","Fredag","Lördag"],shortDays:["Sön","Mån","Tis","Ons","Tor","Fre","Lör"],months:["Januari","Februari","Mars","April","Maj","Juni","Juli","Augusti","September","Oktober","November","December"],shortMonths:["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Aug","Sep","Okt","Nov","Dec"]}),formatPercent=locale.numberFormat("%"),formatPercentDecimal=locale.numberFormat(".1%"),formatPercentText=function(a){return formatPercent(a).replace("%"," procent")},formatLargeNum=locale.numberFormat(","),pluralize=function(a){return a?"e"==a.slice(-1)?a+"rna":a+"erna":""};UI=function(){function a(a,b){var c=this;c.data=b,c.elem=d3.select(a),c.elems={profession:c.elem.select("#profession"),income:c.elem.select("#income"),publicprivate:c.elem.select("#publicprivate")}}return a.prototype.renderProfessions=function(){var a=this,b=a.data.map(function(a){return a.profession}).sort();a.elems.profession.selectAll("option").data(b,function(a){return a}).enter().append("option").attr("value",function(a){return a}).text(function(a){return a.toLowerCase()})},a.prototype.select=function(a,b){var c=this;c.elems[a].node().value=b},a.prototype.profession=function(){var a=this,b=a.elems.profession.node().value;return{value:b,valid:""!==b}},a.prototype.income=function(){var a=this,b=+a.elems.income.node().value.trim();return{value:b,valid:!isNaN(b)}},a.prototype.publicprivate=function(){var a=this,b=a.elems.publicprivate.node().value;return{value:b,valid:""!==b}},a.prototype.validate=function(){var a=this,b=["income","profession","publicprivate"],c=[];return b.forEach(function(b){var d=a[b]().valid;d3.select(".helper[data-target='#"+b+"']").classed("show",!d),c.push(d)}),[c].every(Boolean)},a}(),d3.selection.prototype.first=function(){return d3.select(this[0][0])},d3.selection.prototype.last=function(){var a=this.size()-1;return d3.select(this[0][a])};