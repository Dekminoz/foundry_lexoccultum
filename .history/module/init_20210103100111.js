/**
 * Unoficial game system for lex occultum
 * Author: Hectelyon
 * Software License: GNU GPLv3
 */

// Import Modules
import { Character } from "./actor.js";
import { CharacterSheet } from "./actor-sheet.js";
import { preloadHandlebarsTemplates } from "./templates.js";
import { createLexOccultumMacro } from "./macro.js";
import { registerHandlebarHelpers } from "./handlebarHelpers.js";
import { registerSheets } from "./hooks/sheets.js";
/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

/**
 * Init hook.
 */
Hooks.once("init", async function () {
  console.log(`Initializing Lexoccultum System`);

  /**
   * Set an initiative formula for the system. This will be updated later.
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "1d20",
    decimals: 2,
  };

  game.lexoccultum = {
    Character,
    createLexOccultumMacro,
  };

  // Define custom Entity classes
  CONFIG.Actor.entityClass = Character;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("lexoccultum", CharacterSheet, { makeDefault: true });

  // Register system settings
  game.settings.register("lexoccultum", "macroShorthand", {
    name: "SETTINGS.SimpleMacroShorthandN",
    hint: "SETTINGS.SimpleMacroShorthandL",
    scope: "world",
    type: Boolean,
    default: true,
    config: true,
  });

  // Register initiative setting.
  game.settings.register("lexoccultum", "initFormula", {
    name: "SETTINGS.SimpleInitFormulaN",
    hint: "SETTINGS.SimpleInitFormulaL",
    scope: "world",
    type: String,
    default: "1d20",
    config: true,
    onChange: (formula) => _simpleUpdateInit(formula, true),
  });

  // Retrieve and assign the initiative formula setting.
  const initFormula = game.settings.get("lexoccultum", "initFormula");
  _simpleUpdateInit(initFormula);

  /**
   * Update the initiative formula.
   * @param {string} formula - Dice formula to evaluate.
   * @param {boolean} notify - Whether or not to post nofications.
   */
  function _simpleUpdateInit(formula, notify = false) {
    // If the formula is valid, use it.
    try {
      new Roll(formula).roll();
      CONFIG.Combat.initiative.formula = formula;
      if (notify) {
        ui.notifications.notify(
          game.i18n.localize("LEXOCCULTUM.NotifyInitFormulaUpdated") + ` ${formula}`
        );
      }
    } catch (error) {
      // Otherwise, fall back to a d20.
      CONFIG.Combat.initiative.formula = "1d20";
      if (notify) {
        ui.notifications.error(
          game.i18n.localize("LEXOCCULTUM.NotifyInitFormulaInvalid") + ` ${formula}`
        );
      }
    }
  }

  /**
   * Slugify a string.
   */
  Handlebars.registerHelper("slugify", function (value) {
    return value.slugify({ strict: true });
  });
  Handlebars.registerHelper("ifeq", function (a, b, options) {
    if (a == b) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Handlebars.registerHelper("ifnoteq", function (a, b, options) {
    if (a != b) {
      return options.fn(this);
    }
    return options.inverse(this);
  });
  registerHandlebarHelpers();
  // Preload template partials.
  preloadHandlebarsTemplates();
  registerSheets();
});

/**
 * Macrobar hook.
 */
Hooks.on("hotbarDrop", (bar, data, slot) => createLexOccultumMacro(data, slot));

/**
 * Adds the actor template context menu.
 */
Hooks.on("getActorDirectoryEntryContext", (html, options) => {
  // Define an actor as a template.
  options.push({
    name: game.i18n.localize("LEXOCCULTUM.DefineTemplate"),
    icon: '<i class="fas fa-stamp"></i>',
    condition: (li) => {
      const actor = game.actors.get(li.data("entityId"));
      return !actor.getFlag("lexoccultum", "isTemplate");
    },
    callback: (li) => {
      const actor = game.actors.get(li.data("entityId"));
      actor.setFlag("lexoccultum", "isTemplate", true);
    },
  });

  // Undefine an actor as a template.
  options.push({
    name: game.i18n.localize("LEXOCCULTUM.UnsetTemplate"),
    icon: '<i class="fas fa-times"></i>',
    condition: (li) => {
      const actor = game.actors.get(li.data("entityId"));
      return actor.getFlag("lexoccultum", "isTemplate");
    },
    callback: (li) => {
      const actor = game.actors.get(li.data("entityId"));
      actor.setFlag("lexoccultum", "isTemplate", false);
    },
  });
});

/**
 * Adds the item template context menu.
 */
Hooks.on("getItemDirectoryEntryContext", (html, options) => {
  // Define an item as a template.
  options.push({
    name: game.i18n.localize("LEXOCCULTUM.DefineTemplate"),
    icon: '<i class="fas fa-stamp"></i>',
    condition: (li) => {
      const item = game.items.get(li.data("entityId"));
      return !item.getFlag("lexoccultum", "isTemplate");
    },
    callback: (li) => {
      const item = game.items.get(li.data("entityId"));
      item.setFlag("lexoccultum", "isTemplate", true);
    },
  });

  // Undefine an item as a template.
  options.push({
    name: game.i18n.localize("LEXOCCULTUM.UnsetTemplate"),
    icon: '<i class="fas fa-times"></i>',
    condition: (li) => {
      const item = game.items.get(li.data("entityId"));
      return item.getFlag("lexoccultum", "isTemplate");
    },
    callback: (li) => {
      const item = game.items.get(li.data("entityId"));
      item.setFlag("lexoccultum", "isTemplate", false);
    },
  });
});

async function _onCreateEntity(event) {
  event.preventDefault();
  event.stopPropagation();
  return _simpleDirectoryTemplates(this, event);
}
ActorDirectory.prototype._onCreateEntity = _onCreateEntity; // For 0.7.x+
ItemDirectory.prototype._onCreateEntity = _onCreateEntity;
ActorDirectory.prototype._onCreate = _onCreateEntity; // TODO: for 0.6.6
ItemDirectory.prototype._onCreate = _onCreateEntity;

/**
 * Display the entity template dialog.
 *
 * Helper function to display a dialog if there are multiple template types defined for the entity type.
 * TODO: Refactor in 0.7.x to play more nicely with the Entity.createDialog method
 *1
 * @param {EntityCollection} entityType - The sidebar tab
 * @param {MouseEvent} event - Triggering event
 */
async function _simpleDirectoryTemplates(collection, event) {
  // Retrieve the collection and find any available templates
  const entityCollection =
    collection.tabName === "actors" ? game.actors : game.items;
  const cls = collection.tabName === "actors" ? Actor : Item;
  let templates = entityCollection.filter((a) =>
    a.getFlag("lexoccultum", "isTemplate")
  );
  let ent = game.i18n.localize(cls.config.label);

  // Setup default creation data
  let type = collection.tabName === "actors" ? "character" : "item";
  let createData = {
    name: `${game.i18n.localize("LEXOCCULTUM.New")} ${ent}`,
    type: type,
    folder: event.currentTarget.dataset.folder,
  };
  if (!templates.length) return cls.create(createData, { renderSheet: true });

  // Build an array of types for the form, including an empty default.
  let types = [
    {
      value: null,
      label: game.i18n.localize("LEXOCCULTUM.NoTemplate"),
    },
  ].concat(
    templates.map((a) => {
      return { value: a.id, label: a.name };
    })
  );

  // Render the confirmation dialog window
  const templateData = { upper: ent, lower: ent.toLowerCase(), types: types };
  const dlg = await renderTemplate(
    `systems/lexoccultum/templates/sidebar/entity-create.html`,
    templateData
  );
  return Dialog.confirm({
    title: `${game.i18n.localize("LEXOCCULTUM.Create")} ${createData.name}`,
    content: dlg,
    yes: (html) => {
      const form = html[0].querySelector("form");
      const template = entityCollection.get(form.type.value);
      if (template) {
        createData = mergeObject(template.data, createData, { inplace: false });
        createData.type = template.data.type;
        delete createData.flags.lexoccultum.isTemplate;
      }
      createData.name = form.name.value;
      return cls.create(createData, { renderSheet: true });
    },
    no: () => {},
    defaultYes: false,
  });
}
