function initHelpers() {
    d3.selectAll(".helper").forEach(function(elem) {
        var target = d3.select(elem[0].getAttribute("data-target"));
        var targetBB = target.node().getBoundingClientRect();
        var helperBB = elem[0].getBoundingClientRect();

        d3.selectAll(elem)
          .classed("show", true);

        d3.selectAll(elem)
          .style("left", (targetBB.left + targetBB.width / 2 - helperBB.width / 2) + "px")
          .style("top", (targetBB.top - helperBB.height - 14) + "px");

      })
      d3.select("body").on("click", function() {
        d3.selectAll(".helper").classed("show", false);
      })
}