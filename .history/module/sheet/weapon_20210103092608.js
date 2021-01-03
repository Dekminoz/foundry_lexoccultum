export class LexOccultumWeaponSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["forbidden-lands", "sheet", "item"],
      template: "systems/lexoccultum/templates/weapon.html",
      width: 600,
      height: 500,
      resizable: false,
    });
  }

  getData() {
    const data = super.getData();
    return data;
  }

  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();
    return buttons;
  }

  activateListeners(html) {
    super.activateListeners(html);
  }
}
