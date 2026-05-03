import { describe, it, expect } from "vitest";
import { FILTRES_INIT, applyFilters } from "./filters";

const ACT = [
  {
    id: "A01", titre: "Bingo IA", age_public: ["Collège", "Lycée"],
    duree: "30-45min", taille_groupe: ["7-12"], themes: ["IA déconnecté"],
    materiels: ["Cartes", "Tableau"], contexte: ["Scolaire"], modalite: ["Présentielle"],
    apprentissage_cle: "Comprendre les biais",
  },
  {
    id: "A02", titre: "Grand débat éthique", age_public: ["Lycée", "Adultes"],
    duree: ">60min", taille_groupe: [">12"], themes: ["Éthique", "IA générative"],
    materiels: ["Tableau"], contexte: ["Entreprise", "Scolaire"], modalite: ["Présentielle", "Distanciel"],
    apprentissage_cle: "Argumenter",
  },
  {
    id: "A03", titre: "Classement d'images", age_public: ["Primaire"],
    duree: "0-15min", taille_groupe: ["1", "2-6"], themes: ["IA déconnecté"],
    materiels: ["Cartes"], contexte: ["Scolaire"], modalite: ["Présentielle"],
    apprentissage_cle: "Classer",
  },
];

describe("FILTRES_INIT", () => {
  it("est vide par défaut", () => {
    expect(FILTRES_INIT.age_public).toEqual([]);
    expect(FILTRES_INIT.duree).toEqual([]);
    expect(FILTRES_INIT.taille_groupe).toEqual([]);
    expect(FILTRES_INIT.themes).toEqual([]);
    expect(FILTRES_INIT.materiels).toEqual([]);
    expect(FILTRES_INIT.contexte).toEqual([]);
    expect(FILTRES_INIT.modalite).toEqual([]);
    expect(FILTRES_INIT.search).toBe("");
    expect(FILTRES_INIT.favorisOnly).toBe(false);
  });
});

describe("applyFilters — sans filtres", () => {
  it("retourne toutes les activités", () => {
    expect(applyFilters(ACT, FILTRES_INIT)).toHaveLength(3);
  });

  it("liste vide reste vide", () => {
    expect(applyFilters([], FILTRES_INIT)).toHaveLength(0);
  });
});

describe("applyFilters — recherche texte", () => {
  it("filtre par titre (insensible à la casse)", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, search: "BINGO" });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe("A01");
  });

  it("filtre par titre (mot isolé)", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, search: "débat" });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe("A02");
  });

  it("filtre par apprentissage_cle", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, search: "classer" });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe("A03");
  });

  it("filtre par ID", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, search: "A02" });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe("A02");
  });

  it("retourne vide si aucune correspondance", () => {
    expect(applyFilters(ACT, { ...FILTRES_INIT, search: "xyz_inexistant_42" })).toHaveLength(0);
  });
});

describe("applyFilters — âge du public (OR entre valeurs)", () => {
  it("filtre une seule valeur", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, age_public: ["Adultes"] });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe("A02");
  });

  it("plusieurs valeurs = union", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, age_public: ["Primaire", "Adultes"] });
    expect(res).toHaveLength(2);
    expect(res.map(a => a.id)).toContain("A02");
    expect(res.map(a => a.id)).toContain("A03");
  });

  it("valeur absente = aucun résultat", () => {
    expect(applyFilters(ACT, { ...FILTRES_INIT, age_public: ["Post-bac"] })).toHaveLength(0);
  });
});

describe("applyFilters — durée", () => {
  it("filtre par une durée exacte", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, duree: ["0-15min"] });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe("A03");
  });

  it("plusieurs durées = union", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, duree: ["0-15min", ">60min"] });
    expect(res).toHaveLength(2);
  });
});

describe("applyFilters — taille de groupe", () => {
  it("filtre par taille", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, taille_groupe: [">12"] });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe("A02");
  });

  it("plusieurs valeurs = union", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, taille_groupe: ["1", ">12"] });
    expect(res).toHaveLength(2);
  });
});

describe("applyFilters — contexte (OR entre valeurs)", () => {
  it("filtre par contexte unique", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, contexte: ["Entreprise"] });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe("A02");
  });

  it("plusieurs valeurs = union", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, contexte: ["Scolaire", "Entreprise"] });
    expect(res).toHaveLength(3);
  });
});

describe("applyFilters — modalité (OR entre valeurs)", () => {
  it("filtre par modalité unique", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, modalite: ["Distanciel"] });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe("A02");
  });
});

describe("applyFilters — thèmes (OR entre valeurs)", () => {
  it("un seul thème = filtre normal", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, themes: ["IA déconnecté"] });
    expect(res).toHaveLength(2);
  });

  it("deux thèmes = union (OR)", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, themes: ["IA déconnecté", "Éthique"] });
    expect(res).toHaveLength(3);
  });

  it("thème absent = aucun résultat", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, themes: ["Inexistant"] });
    expect(res).toHaveLength(0);
  });
});

describe("applyFilters — matériels (OR entre valeurs)", () => {
  it("filtre par matériel unique", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, materiels: ["Tableau"] });
    expect(res).toHaveLength(2);
  });

  it("deux matériels = union (OR)", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, materiels: ["Cartes", "Tableau"] });
    expect(res).toHaveLength(3);
  });

  it("matériel absent = aucun résultat", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, materiels: ["Vidéoprojecteur"] });
    expect(res).toHaveLength(0);
  });
});

describe("applyFilters — favoris", () => {
  it("favorisOnly=true ne retourne que les favoris", () => {
    const favoris = new Set(["A01", "A03"]);
    const res = applyFilters(ACT, { ...FILTRES_INIT, favorisOnly: true }, favoris);
    expect(res).toHaveLength(2);
    expect(res.map(a => a.id)).not.toContain("A02");
  });

  it("favorisOnly=true sans favoris = liste vide", () => {
    expect(applyFilters(ACT, { ...FILTRES_INIT, favorisOnly: true })).toHaveLength(0);
  });

  it("favorisOnly=false ignore le Set de favoris", () => {
    const favoris = new Set(["A01"]);
    expect(applyFilters(ACT, FILTRES_INIT, favoris)).toHaveLength(3);
  });
});

describe("applyFilters — filtres combinés (AND entre catégories)", () => {
  it("âge ET thème", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, age_public: ["Lycée"], themes: ["Éthique"] });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe("A02");
  });

  it("recherche ET durée", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, search: "classement", duree: ["0-15min"] });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe("A03");
  });

  it("âge ET durée incompatibles = vide", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, age_public: ["Primaire"], duree: [">60min"] });
    expect(res).toHaveLength(0);
  });

  it("matériels ET contexte", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, materiels: ["Tableau"], contexte: ["Entreprise"] });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe("A02");
  });

  it("thèmes (OR) ET âge (OR)", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, themes: ["Éthique", "IA générative"], age_public: ["Lycée"] });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe("A02");
  });
});
