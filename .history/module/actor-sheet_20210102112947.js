import { EntitySheetHelper } from "./helper.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class SimpleActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["lexoccultum", "sheet", "actor"],
      template: "systems/lexoccultum/templates/actor-sheet.html",
      width: 1000,
      height: 600,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "main",
        },
      ],
      scrollY: [".biography", ".items", ".skills"],
      dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();

    data.dtypes = ["String", "Number", "Boolean"];
    return data;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Update Inventory Item
    html.find(".item-edit").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find(".item-delete").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(li.data("itemId"));
      li.slideUp(200, () => this.render(false));
    });

    // Rollable skill
    html.find("a.rollable").click(this._onRollSkill.bind(this));

    // Rollable Init
    html.find("a#rollInit").click(this._onRollInitiative.bind(this));

    //CreateItems
    html.find(".item-create").click((ev) => {
      this.onItemCreate(ev);
    });

    //ActivateWeapon
    html.find(".activateWeapon").click((ev) => {
      this.onWeaponActivate(ev);
    });
    //ActivateArmor
    html.find(".activateArmor").click((ev) => {
      this.onArmorActivate(ev);
    });
    //Search in skills
    html.find("#search").keypress((ev) => {
      this.onSearch(ev);
    });
    html.find("#resetSearch").click((ev) => {
      this.onSearchReset(ev);
    });
        //changeHealthLevelDamage
        html.find("#currentHealth").click((ev) => {
          this.onArmorActivate(ev);
        });
            //ActivateArmor
    html.find("#currentSanity").click((ev) => {
      this.onArmorActivate(ev);
    });
    this.calcultateCp();
  }

  /* -------------------------------------------- */

  /**
   * Listen for items.
   * @param {Event} event    The originating click event
   */
  onItemCreate(event) {
    event.preventDefault();
    let header = event.currentTarget;
    let data = duplicate(header.dataset);
    data["name"] = `New ${data.type.capitalize()}`;
    this.actor.createEmbeddedEntity("OwnedItem", data, { renderSheet: true });
  }
  /**
   * Listen for items.
   * @param {Event} event    The originating click event
   */
  onWeaponActivate(event) {
    let check = $(event.currentTarget);
    let pa = check.data("pa");
    localStorage.setItem("weaponPa", pa);
    this.calcultateCp();
  }
  /**
   * Listen for items.
   * @param {Event} event    The originating click event
   */
  onArmorActivate(event) {
    let check = $(event.currentTarget);
    let mm = check.data("mm");
    localStorage.setItem("armorMM", mm);
    this.calcultateCp();
  }
  /**
   * Search throught skills.
   * @param {Event} event    The originating click event
   */
  onSearch(event) {
    let str = $(event.currentTarget).val().toLowerCase();
    if (str.length > 2) {
      $(".skill-label").each(function () {
        if ($($(this).children()[0]).text().toLowerCase().indexOf(str) == -1) {
          $(this).parent().hide();
        } else {
          $(this).parent().show();
        }
      });
    } else {
      $(".skill-label").each(function () {
        $(this).parent().show();
      });
    }
  }
  /**
   * Search throught skills.
   * @param {Event} event    The originating click event
   */
  onSearchReset(event) {
    $(".skill-label").each(function () {
      $(this).parent().show();
    });
  }
  /**
   * Handle clickable Roll Button for skill .
   * @param {Event} event   The originating click event
   * @private
   */
  _onRollSkill(event) {
    let button = $(event.currentTarget);
    var formula = "1d20";
    /* CALCULATE DIF HERE , COMPETENCES + DESICIPLINES  + (SPECIALITIESx2)  */
    let d = Dialog.prompt({
      title: "Modificator",
      content: "<p><input type='number' id='modificator' value='0' /></p>",
      label: "Validate",
      callback: () => {
        var parentSkill = $("input[name='" + button.data("skill") + "']");
        var parentDiscipline = $(
          "input[name='" + button.data("discipline") + "']"
        );
        var skillValue = parentSkill.length > 0 ? parentSkill.val() : 0;
        var disciplineValue =
          parentDiscipline.length > 0 ? parentDiscipline.val() : 0;

        //ROLL FOR SKILL
        if (skillValue == 0 && disciplineValue == 0) {
          var difficulty =
            Number(button.data("value")) + Number($("#modificator").val());
        }
        //ROLL FOR DISCIPLINE
        if (skillValue != 0 && disciplineValue == 0) {
          var difficulty =
            Number(skillValue) +
            Number(button.data("value")) +
            Number($("#modificator").val());
        }
        //ROLL FOR SPECIALITY
        if (skillValue != 0 && disciplineValue != 0) {
          var difficulty =
            Number(skillValue) +
            Number(disciplineValue) +
            Number(button.data("value")) * 2 +
            Number($("#modificator").val());
        }

        let r = new Roll("1d20");
        r.roll();
        const result = r.terms[0].results.find((r) => r.active).result;
        if (r.total <= difficulty) {
          this._msgFlavor =
            "<p>" + r.total + " VS " + difficulty + "</p><h2>SUCESS</h2>";
        } else {
          this._msgFlavor =
            "<p>" + r.total + " VS " + difficulty + "</p><h2>FAIL</h2>";
        }
        r.toMessage({
          user: game.user._id,
          flavor: this._msgFlavor,
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        });
      },
      defaultYes: false,
    });
  }
  /**
   * Handle clickable Roll Button for initiative .
   * @param {Event} event   The originating click event
   * @private
   */
  _onRollInitiative(event) {
    let charisma = Number($('input[name="data.traits.charisma.value"]').val());
    let combatExperience = Number(
      $('input[name="data.skills.battle_exp.value"]').val()
    );
    let combatReaction = Number(
      $('input[name="data.skills.combat_reaction.value"]').val()
    );
    let weaponIm = Number($("#weaponPts").data("im"));
    let weaponOm = Number($("#weaponPts").data("om"));
    let formula =
      "1D10+" +
      charisma +
      "+" +
      combatExperience +
      "+" +
      combatReaction +
      "+" +
      weaponIm +
      "+" +
      weaponOm;
    let r = new Roll(formula);
    r.roll();
    this._msgFlavor = "<h2>INITIATIVE:</h2>";
    r.toMessage({
      user: game.user._id,
      flavor: this._msgFlavor,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
    });
  }
  /* Initialise Combat Point */
  calcultateCp() {
    let combatAction = Number(
      $('input[name="data.skills.combat_actions.value"]').val()
    );
    let ccAction = Number(
      $('input[name="data.skills.cc_weapons.value"]').val()
    );
    let rangedAction = Number(
      $('input[name="data.skills.ranged_weapons.value"]').val()
    );
    let weaponPoints = Number(localStorage.getItem('weaponPt'));
    let armorPoints = Number(localStorage.getItem('armorMM'));
    let move =
      10 +
      Number($('input[name="data.skills.body_control.value"]').val()) +
      Number($('input[name="data.traits.dexterity.value"]').val()) -
      armorPoints;
    $("#closeCombatPts").html(combatAction + ccAction);
    $("#rangedCombatPts").html(combatAction + rangedAction);
    $("#move").html(move);
    $("#weaponPts").html(weaponPoints);
  }
  /* -------------------------------------------- */

  /** @override */
  _updateObject(event, formData) {
    return this.object.update(formData);
  }
}
