import { LexOccultumWeaponSheet } from "../sheet/weapon.js";
import { LexOccultumArmorSheet } from "../sheet/armor.js";
import { LexOccultumRawMaterialSheet } from "../sheet/raw-material.js";

export function registerSheets() {
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("lex-occultum", LexOccultumWeaponSheet, { types: ["weapon"], makeDefault: true });
  Items.registerSheet("lex-occultum", LexOccultumArmorSheet, { types: ["armor"], makeDefault: true });
  Items.registerSheet("lex-occultum", LexOccultumRawMaterialSheet, { types: ["rawMaterial"], makeDefault: true });
}
