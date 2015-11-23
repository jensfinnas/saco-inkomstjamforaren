UI = (function(){
    function UI(selector, data) {
        var self = this;
        self.data = data;
        self.elem = d3.select(selector);
        self.elems = {
            profession: self.elem.select("#profession"),
            income: self.elem.select("#income"),
            publicprivate: self.elem.select("#publicprivate")
        }

        
    }

    UI.prototype.renderProfessions = function() {
        var self = this;
        // Build UI
        var professions = d3.set(self.data.map(function(d) { return d.profession; }))
          .values()
          .sort();

        self.elems.profession.selectAll("option")
          .data(professions, function(d) { return d; })
          .enter()
          .append("option")
          .attr("value", function(d) { return d; })
          .text(function(d) { return d.toLowerCase(); });
    }

    UI.prototype.select = function(field, value) {
        var self = this;
        self.elems[field].node().value = value;
    }

    UI.prototype.profession = function() {
        var self = this;
        var value = self.elems.profession.node().value;
        return {
            value: value,
            valid: value !== ""
        }
    }
    UI.prototype.income = function() {
        var self = this;
        var value = +self.elems.income.node().value.trim();
        return {
            value: value,
            valid: !isNaN(value)
        }
    }

    UI.prototype.publicprivate = function() {
        var self = this;
        var value = self.elems.publicprivate.node().value;
        return {
            value: value,
            valid: value !== ""
        }
    }

    UI.prototype.validate = function() {
        var self = this;
        var fields = ["income", "profession", "publicprivate"];
        var validations = [];
        fields.forEach(function(field) {
            var validField = self[field]().valid;
            d3.select(".helper[data-target='#" + field + "']").classed("show", !validField);
            validations.push(validField)
        })
        return [validations].every(Boolean)
    }
    return UI;
})();