function initHelpers() {
    d3.selectAll(".helper").each(function(elem) {
        var elem = d3.select(this);
        var target = d3.select(elem.attr("data-target"));
        var targetBB = target.node().getBoundingClientRect();
        var helperBB = elem.node().getBoundingClientRect();

        // Show income helper on init
        if (elem.attr("data-target") == "#income") {
           elem.classed("show", true);
        }
 
        var x = (targetBB.left + targetBB.width / 2 - helperBB.width / 2);
        var y = elem.classed("bottom") ? (targetBB.top - helperBB.height - 14) : (targetBB.top + helperBB.height)

        elem
          .style("left", x + "px")
          .style("top", y + "px");

      })
      d3.select("body").on("click", function() {
        d3.selectAll(".helper").classed("show", false);
      })
}