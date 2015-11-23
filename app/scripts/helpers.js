function initHelpers() {
    console.log()
    d3.selectAll(".helper").each(function(elem) {
        var elem = this;
        var target = d3.select(elem.getAttribute("data-target"));
        var targetBB = target.node().getBoundingClientRect();
        var helperBB = elem.getBoundingClientRect();

        d3.selectAll(elem)
          .classed("show", true);

        var x = (targetBB.left + targetBB.width / 2 - helperBB.width / 2);
        var y = d3.select(elem).classed("bottom") ? (targetBB.top - helperBB.height - 14) : (targetBB.top + helperBB.height)

        console.log(y);
        d3.select(elem)
          .style("left", x + "px")
          .style("top", y + "px");

      })
      d3.select("body").on("click", function() {
        d3.selectAll(".helper").classed("show", false);
      })
}