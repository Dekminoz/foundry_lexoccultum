/**
 * Create a Macro from an item drop.
 * Get an existing lexoccultum macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
export async function createLexOccultumMacro(data, slot) {
    const command = `const roll = new Roll("${data.roll}", actor ? actor.getRollData() : {});
  roll.toMessage({speaker, flavor: "${data.label}"});`;
    let macro = game.macros.entities.find(m => (m.name === item.label) && (m.command === command));
    if (!macro) {
        macro = await Macro.create({
            name: data.label,
            type: "script",
            command: command,
            flags: { "lexoccultum.attrMacro": true }
        });
    }
    game.user.assignHotbarMacro(macro, slot);
    return false;
}