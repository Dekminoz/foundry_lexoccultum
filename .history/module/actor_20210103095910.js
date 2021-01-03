import { EntitySheetHelper } from "./helper.js";

/**
 * Extend the base Actor entity
 * @extends {Actor}
 */
export class Character extends Actor {

    /** @override */
    prepareData() {
        super.prepareData();
    }

    /* -------------------------------------------- */

    /** @override */
    getRollData() {
        const data = super.getRollData();
        const shorthand = game.settings.get("lexoccultum", "macroShorthand");
        const formulaAttributes = [];
        const itemAttributes = [];

        return data;
    }


}