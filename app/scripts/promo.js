
function initPromo() {
    var elem = d3.select("#promo");
    var sentences = [
        "Vill du också veta vad personer födda samma år som du tjänar?",
        "Också nyfiken på vad akademiker från samma del av landet som du tjänar?",
        "Vill du också veta vad personer som tog examen samma år som du tjänar?"
    ]
    var randomSentence = sentences[Math.floor(Math.random()*sentences.length)];
    elem.selectAll(".random-sentence").text(randomSentence);
    elem.classed("show", true);
}