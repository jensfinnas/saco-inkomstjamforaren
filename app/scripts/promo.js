
function initPromo() {
    var elem = d3.select("#promo");
    var sentences = [
        "Vad tjänar personer födda samma år som du?",
        "Vad har andra akademiker från ditt län för lön?",
        "Vad tjänar personer som tog examen samma år som du?"
    ]
    var randomSentence = sentences[Math.floor(Math.random()*sentences.length)];
    elem.selectAll(".random-sentence").text(randomSentence);
    elem.classed("show", true);
}