import { describe, it, expect, beforeEach } from "vitest";
import { loadJSON, saveJSON, KEYS } from "./storage";

beforeEach(() => {
  localStorage.clear();
});

describe("KEYS", () => {
  it("contient les bonnes clés localStorage", () => {
    expect(KEYS.activites).toBe("catalogue_activites");
    expect(KEYS.panier).toBe("catalogue_panier_ordre");
    expect(KEYS.corbeille).toBe("catalogue_corbeille");
    expect(KEYS.titreSeance).toBe("catalogue_panier_titre");
    expect(KEYS.favoris).toBe("catalogue_favoris");
  });
});

describe("loadJSON", () => {
  it("retourne le fallback si la clé est absente", () => {
    expect(loadJSON("inexistante", [])).toEqual([]);
    expect(loadJSON("inexistante", null)).toBeNull();
    expect(loadJSON("inexistante", "défaut")).toBe("défaut");
  });

  it("retourne la valeur parsée si la clé existe", () => {
    localStorage.setItem("k", JSON.stringify({ a: 1 }));
    expect(loadJSON("k", null)).toEqual({ a: 1 });
  });

  it("retourne un tableau parsé", () => {
    localStorage.setItem("k", JSON.stringify([1, 2, 3]));
    expect(loadJSON("k", [])).toEqual([1, 2, 3]);
  });

  it("retourne le fallback si le JSON est invalide", () => {
    localStorage.setItem("k", "pas{du}json");
    expect(loadJSON("k", "fb")).toBe("fb");
  });

  it("retourne le fallback si la valeur stockée est null JSON", () => {
    localStorage.setItem("k", "null");
    expect(loadJSON("k", "fb")).toBe("fb");
  });

  it("retourne false si stocké et fallback est false", () => {
    localStorage.setItem("k", "false");
    expect(loadJSON("k", true)).toBe(false);
  });

  it("retourne 0 si stocké", () => {
    localStorage.setItem("k", "0");
    expect(loadJSON("k", 42)).toBe(0);
  });
});

describe("saveJSON", () => {
  it("stocke la valeur sérialisée", () => {
    saveJSON("k", [1, 2, 3]);
    expect(JSON.parse(localStorage.getItem("k"))).toEqual([1, 2, 3]);
  });

  it("stocke un objet", () => {
    saveJSON("k", { titre: "Test", id: "A01" });
    expect(JSON.parse(localStorage.getItem("k"))).toEqual({ titre: "Test", id: "A01" });
  });

  it("stocke une chaîne vide", () => {
    saveJSON("k", "");
    expect(JSON.parse(localStorage.getItem("k"))).toBe("");
  });

  it("stocke false", () => {
    saveJSON("k", false);
    expect(JSON.parse(localStorage.getItem("k"))).toBe(false);
  });
});

describe("saveJSON + loadJSON (aller-retour)", () => {
  it("préserve un tableau d'activités", () => {
    const activites = [
      { id: "A01", titre: "Test", public: ["11-15"], duree: "30-60min", groupe: ["Moyen"], themes: ["IA"] },
    ];
    saveJSON(KEYS.activites, activites);
    expect(loadJSON(KEYS.activites, [])).toEqual(activites);
  });

  it("préserve un Set converti en tableau", () => {
    const favoris = ["A01", "A02", "A03"];
    saveJSON(KEYS.favoris, favoris);
    const lu = loadJSON(KEYS.favoris, []);
    expect(new Set(lu)).toEqual(new Set(favoris));
  });
});
