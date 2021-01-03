export class LexOccultumArmorSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["forbidden-lands", "sheet", "item"],
      template: "systems/lexoccultum/templates/armor.html",
      width: 600,
      height: 500,
      resizable: false,
    });
  }

  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();
    return buttons;
  }

  getData() {
    const data = super.getData();
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);
  }
}
