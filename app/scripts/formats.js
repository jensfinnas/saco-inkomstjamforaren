var locale = d3.locale({
  decimal: ",",
  thousands: " ",
  grouping: [3],
  currency: ["", "SEK"],
  dateTime: "%A den %d %B %Y %X",
  date: "%Y-%m-%d",
  time: "%H:%M:%S",
  periods: ["fm", "em"],
  days: ["Söndag", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag"],
  shortDays: ["Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"],
  months: ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"],
  shortMonths: ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"]
});

var formatPercent = locale.numberFormat("%");
var formatPercentDecimal = locale.numberFormat(".1%");
var formatPercentText = function(value) {
    return formatPercent(value).replace("%", " procent");
}
var formatLargeNum = locale.numberFormat(",");

var pluralize = function(noun) {
    if (noun) {
        if (noun.slice(-1) == "e") {
            return noun + "rna";
        }
        else {
            return noun + "erna";
        }        
    }
    else {
        return "";
    }

}