/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {

    // Define template paths to load
    const templatePaths = [
        "systems/lexoccultum/templates/tabs/main.html",
        "systems/lexoccultum/templates/tabs/gear.html",
        "systems/lexoccultum/templates/tabs/skills.html",
        "systems/lexoccultum/templates/tabs/infos.html",
    ];

    // Load the template parts
    return loadTemplates(templatePaths);
};