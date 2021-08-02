export function registerHandlebarHelpers() {
    Handlebars.registerHelper('ifeq', function(a, b, options) {
        if (a == b) { return options.fn(this); }
        return options.inverse(this);
    });

    Handlebars.registerHelper('ifnoteq', function(a, b, options) {
        if (a != b) { return options.fn(this); }
        return options.inverse(this);
    });
    Handlebars.registerHelper("setVar", function(varName, varValue, options) {
        options.data.root[varName] = varValue;
    });
}