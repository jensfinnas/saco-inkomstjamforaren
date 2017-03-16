function getData(a,b,c,d){var e="data/prepared-data/"+b+"-incomegroups-"+a+"-"+c+".csv",f="data/prepared-data/"+b+"-percentile-"+a+"-"+c+".csv";d3.csv(e,columnFormats.incomeGroup,function(a,b){b=b.map(function(a){return a.incomeLower=+a.income.split("-")[0],a.incomeUpper=+a.income.split("-")[1],a.id=(a.incomeLower||a.incomeUpper-999)+"-"+(a.incomeUpper||a.incomeLower+999),a}),d3.csv(f,columnFormats.percentile,function(a,c){d({incomeGroupData:b,percentileData:c})})})}function initHelpers(){d3.selectAll(".helper").each(function(a){var a=d3.select(this),b=d3.select(a.attr("data-target")),c=b.node().getBoundingClientRect(),d=a.node().getBoundingClientRect();"#income"==a.attr("data-target")&&a.classed("show-at-start",!0);var e=c.left+c.width/2-d.width/2;e=Math.max(0,e);var f=a.classed("tip-bottom")?c.top-d.height-8:c.top+d.height;a.style("left",e+"px").style("top",f+"px"),a.classed("initiated",!0)}),d3.select("body").on("click",function(){d3.selectAll(".helper").classed("show-at-start",!1)})}function initPromo(){var a=d3.select("#promo"),b=["Vad tjänar personer födda samma år som du?","Vad har andra akademiker från ditt län för lön?","Vad tjänar personer som tog examen samma år som du?"],c=b[Math.floor(Math.random()*b.length)];a.selectAll(".random-sentence").text(c),a.classed("show",!0)}function extend(a,b){for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c]);return a}IncomeChart=function(){function a(a,b,c,d){var e=this;e.container=d3.select(a),defaultOpts={yMax:"auto",isIframe:!1},e.opts=extend(defaultOpts,d),e.data=b,e.income=c,e.setIncomeToShow(c),e.chartContainer=e.container.append("div").attr("class","chart-container"),e.xOrdinal=d3.scale.ordinal(),e.xLinear=d3.scale.linear(),e.defineXScale(e.data.incomeGroupData),e.y=d3.scale.linear(),e.defineYScale(e.data.incomeGroupData),e.drawChart(),e.update(b),d3.select(window).on("resize",function(){e.resize()})}function b(a,b){return b>=a.incomeLower}return a.prototype.drawChart=function(){var a=this,b=a.container[0][0].offsetWidth;a.margins=m={top:70,right:25,bottom:45,left:35},a.width=w=b-m.left-m.right,a.height=h=.5*w,a.pointRadius=.01*b;.7*m.bottom+"px";a.svg=a.chartContainer.append("svg").attr("width",w+m.left+m.right).attr("height",h+m.top+m.bottom),a.chart=a.svg.append("g").attr("transform","translate("+m.left+", "+m.top+")"),a.xOrdinal.rangeBands([0,w],.2,0),a.xLinear.range([0,w]),a.y.range([h,0]),a.xAxis=d3.svg.axis().scale(a.xOrdinal).orient("bottom"),a.yAxis=d3.svg.axis().scale(a.y).tickFormat(formatPercent).orient("left");var c=function(a,b){var c=150,d=a.getBoundingClientRect().left;return c/2>d?"e":d>b-c/2?"w":"n"};a.tooltip=d3.tip().attr("class","d3-tip").direction(function(){var b=c(this,a.width);return b}).offset(function(b,d){var e=c(this,a.width);return"e"==e?[0,5]:"w"==e?[0,-5]:[-10,0]}).html(function(a){var b,c=formatLargeNum(a.incomeLower),d=a.incomeUpper?formatLargeNum(a.incomeUpper):"",e=a.value<.01?"Färre än en procent":formatPercentText(a.value);if(0==a.incomeLower){var f=formatLargeNum(a.incomeUpper+1);b="mindre än "+f+" kr"}else b=""==a.incomeUpper?c+" kr eller mer":c+"-"+d+" kr";return e+" tjänar <br/>"+b}),a.chart.call(a.tooltip),a.yAxisGroup=a.chart.append("g").attr("class","y axis").call(a.yAxis),a.xAxisGroup=a.chart.append("g").attr("class","x axis").attr("transform","translate(0,"+h+")").call(a.xAxis),a.xAxisGroup.append("text").attr("x",w/2).attr("y",m.bottom-20).attr("dy",".7em").style("text-anchor","middle").attr("class","title").text("Månadslön"),a.incomeMarker=a.chart.append("g").attr("class","income-marker").attr("transform","translate("+a.xLinear(a.income)+",0)");var d=20,e=61,f=9,g=.9*f,i=[[-d/2,-e],[-d/2,0],[-f/2,0],[0,g],[f/2,0],[d/2,0],[d/2,-e]],j="M "+i.join(" L ")+" Z";a.incomeMarker.append("path").attr("d",j).attr("class","marker secondary-fill").attr("transform","translate("+[0,-g-2]+")"),a.incomeMarker.append("text").attr("dy",".35em").attr("transform","rotate(270)").attr("x",g+8).attr("class","label").text("Din lön"),a.isIframe&&pymChild.sendHeight()},a.prototype.update=function(a){var b=this;b.data=a;var c=700;b.barGroups=b.chart.selectAll(".bar-group").data(b.data.incomeGroupData,function(a){return 0==a.incomeLower?a.incomeUpper-9999:a.incomeLower});var d=b.barGroups.exit().transition().duration(c);d.attr("transform",function(a){var c=b.xOrdinal(a.id),d=b.height;return"translate("+c+","+d+")"}).remove(),d.select(".bar").attr("height",0),b.defineXScale(b.data.incomeGroupData),b.defineYScale(b.data.incomeGroupData),b.setIncomeToShow(b.income);var e=d[0].filter(function(a){return a}).length;setTimeout(function(){var a=b.barGroups.enter(),d=a.append("g").attr("class","bar-group");d.attr("transform",function(a){var c=b.xOrdinal(a.id),d=b.y(0);return"translate("+c+","+d+")"}),d.append("rect").attr("class","bar").attr("width",b.xOrdinal.rangeBand()).attr("height",0).on("mouseover",b.tooltip.show).on("mouseout",b.tooltip.hide);var e=b.barGroups.transition().duration(c);e.attr("transform",function(a){var c=b.xOrdinal(a.id),d=b.y(a.value);return"translate("+c+","+d+")"}),e.select(".bar").attr("height",function(a){return h-b.y(a.value)}).attr("width",b.xOrdinal.rangeBand()),b.highlightBars(b.incomeToShow,c);var f=b.getIncomeGroup(b.income);b.incomeMarker.transition().duration(c).attr("transform","translate("+[b.xLinear(b.incomeToShow),b.y(f.value)]+")"),b.updatePercentile(),b.incomeMarker.moveToFront(),b.xAxisGroup.transition().duration(c).call(b.xAxis),b.yAxis.ticks(b.yMax<=.06?4:8),b.yAxisGroup.transition().duration(c).call(b.yAxis);var g=b.maxIncome-b.minIncome>25e3?1e4:5e3;b.xAxisGroup.selectAll(".tick text").text(function(a){var b=a.split("-")[0],c=b%g==0?formatLargeNum(b):"";return"0"==c?"":c})},e>0?c:0)},a.prototype.updateIncomeLine=function(a){var b=this,c=b.incomeToShow;b.income=a,b.setIncomeToShow(b.income),b.income=a;var d=1e3*Math.abs(b.incomeToShow-c)/(b.maxIncome-b.minIncome);if(c!==b.incomeToShow){var e=100,f=0;clearInterval(b.animation),b.animation=setInterval(function(){var a=c+(b.incomeToShow-c)*f/e;b.highlightBars(a,0),f++,f>e&&clearInterval(b.animation)},d/e)}b.updatePercentile()},a.prototype.updatePercentile=function(){var a=this,b=a.getPercentileSentence(a.income);d3.selectAll(".percentile-sentence").html(b)},a.prototype.defineXScale=function(a){var b=this,c=a.sort(function(a,b){return d3.ascending(a.incomeLower,b.incomeLower)}).map(function(a){return a.id});b.xOrdinal.domain(c),b.minIncome=a[0].incomeUpper-999,b.maxIncome=a[a.length-1].incomeLower+999,b.xLinear.domain([b.minIncome,b.maxIncome])},a.prototype.defineYScale=function(a){var b=this;"auto"==b.opts.yMax?b.yMax=d3.max(a.map(function(a){return a.value})):b.yMax=b.opts.yMax,b.y.domain([0,b.yMax])},a.prototype.getPercentileSentence=function(a){var b=this,c=0,d=function(a){return'<span class="percentile primary-border">'+a+"</span>"};for(c=0;c<b.data.percentileData.length;c++){var e=b.data.percentileData[c],f=b.data.percentileData[c+1];if(c==b.data.percentileData.length-1)return"tjänar du mer än "+d("över "+e.percentile+" procent");if(f.income>a)return 0==c?"tillhör du de "+d(e.percentile+" procent")+" med lägst månadslön":"tjänar du mer än "+d(e.percentile+" procent")}return""},a.prototype.getIncomeGroup=function(a){var b,c=this;for(b=0;b<c.data.incomeGroupData.length;b++){var d=c.data.incomeGroupData[b];if(a<=d.incomeUpper)return d}return c.data.incomeGroupData[b-1]},a.prototype.setIncomeToShow=function(a){var b=this;b.incomeToShow=Math.max(Math.min(b.maxIncome,a),b.minIncome)},a.prototype.highlightBars=function(a,c){var d=this,e=0;d.barGroups.classed("highlighted",function(c){var d=b(c,a);return d&&e++,d});var f=d.barGroups[0][e-1],g=d.y(f.__data__.value),h=d.xLinear(a);d.incomeMarker.transition().duration(c).attr("transform","translate("+h+","+g+")")},a.prototype.resize=function(){var a=this;a.svg.remove(),a.drawChart(),a.update(a.data)},a}();var columnFormats={incomeGroup:function(a){return a.value=+a.value,a},percentile:function(a){return a.income=+a.income,a}},locale=d3.locale({decimal:",",thousands:" ",grouping:[3],currency:["","SEK"],dateTime:"%A den %d %B %Y %X",date:"%Y-%m-%d",time:"%H:%M:%S",periods:["fm","em"],days:["Söndag","Måndag","Tisdag","Onsdag","Torsdag","Fredag","Lördag"],shortDays:["Sön","Mån","Tis","Ons","Tor","Fre","Lör"],months:["Januari","Februari","Mars","April","Maj","Juni","Juli","Augusti","September","Oktober","November","December"],shortMonths:["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Aug","Sep","Okt","Nov","Dec"]}),formatPercent=locale.numberFormat("%"),formatPercentDecimal=locale.numberFormat(".1%"),formatPercentText=function(a){return formatPercent(a).replace("%"," procent")},formatLargeNum=locale.numberFormat(","),pluralize=function(a){return a?"e"==a.slice(-1)?a+"rna":a+"erna":""};UI=function(){function a(a,b){var c=this;c.data=b,c.elem=d3.select(a),c.elems={profession:c.elem.select("#profession"),income:c.elem.select("#income"),publicprivate:c.elem.select("#publicprivate")}}function b(a){return a.selectAll("option").filter(function(a,b){return!this.disabled}).first()}function c(a,b){a.selectAll("option").each(function(){var a=d3.select(this).attr("value"),c=b.indexOf(a)>-1;this.disabled=!c})}return a.prototype.renderProfessions=function(){var a=this,b=a.data.map(function(a){return a.profession}).sort();a.elems.profession.selectAll("option").data(b,function(a){return a}).enter().append("option").attr("value",function(a){return a}).text(function(a){return a.toLowerCase()})},a.prototype.select=function(a,b){var c=this;c.elems[a].node().value=b},a.prototype.profession=function(){var a=this,b=a.elems.profession.node().value;return{value:b,valid:""!==b}},a.prototype.income=function(){var a=this,b=+a.elems.income.node().value.trim();return{value:b,valid:!isNaN(b)}},a.prototype.publicprivate=function(){var a=this,d=a.elems.publicprivate.node().value,e=a.profession().value,f=a.data.filter(function(a){return a.publicprivate==d&&a.profession==e}).length>0,g=a.data.filter(function(a){return a.profession==e}).map(function(a){return a.publicprivate});if(c(a.elems.publicprivate,g),!f){var h=b(a.elems.publicprivate);a.elems.publicprivate.node().value=h.attr("value")}return{value:d,valid:""!==d}},a.prototype.validate=function(){var a=this,b=["income","profession","publicprivate"],c=[];b.forEach(function(b){var d=a[b]().valid;d3.select(".helper[data-target='#"+b+"']").classed("show",!d),c.push(d)});var d=c.every(Boolean);return a.valid=d,c.every(Boolean)},a}(),d3.selection.prototype.first=function(){return d3.select(this[0][0])},d3.selection.prototype.last=function(){var a=this.size()-1;return d3.select(this[0][a])},d3.selection.prototype.moveToFront=function(){return this.each(function(){this.parentNode.appendChild(this)})},d3.selection.prototype.moveToBack=function(){return this.each(function(){var a=this.parentNode.firstChild;a&&this.parentNode.insertBefore(this,a)})};