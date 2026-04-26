import { describe, it, expect } from "vitest";
import { FILTRES_INIT, applyFilters } from "./filters";

const ACT = [
  {
    id: "A01", titre: "Bingo IA", public: ["11-15", "16-20"],
    duree: "30-60min", groupe: ["Moyen"], themes: ["IA déconnecté"],
    description_courte: "Jeu de cartes", apprentissage_cle: "Comprendre les biais",
  },
  {
    id: "A02", titre: "Grand débat éthique", public: ["16-20", "Adultes"],
    duree: "1-2h", groupe: ["Grand"], themes: ["Éthique", "IA générative"],
    description_courte: "Discussion collective", apprentissage_cle: "Argumenter",
  },
  {
    id: "A03", titre: "Classement d'images", public: ["7-10"],
    duree: "<30min", groupe: ["Petit"], themes: ["IA déconnecté"],
    description_courte: "Tri visuel", apprentissage_cle: "Classer",
  },
];

describe("FILTRES_INIT", () => {
  it("est vide par défaut", () => {
    expect(FILTRES_INIT.public).toEqual([]);
    expect(FILTRES_INIT.duree).toEqual([]);
    expect(FILTRES_INIT.groupe).toEqual([]);
    expect(FILTRES_INIT.themes).toEqual([]);
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

  it("filtre par description_courte", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, search: "Discussion" });
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

describe("applyFilters — public (OR entre valeurs)", () => {
  it("filtre une seule valeur", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, public: ["Adultes"] });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe("A02");
  });

  it("plusieurs valeurs = union", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, public: ["7-10", "Adultes"] });
    expect(res).toHaveLength(2);
    expect(res.map(a => a.id)).toContain("A02");
    expect(res.map(a => a.id)).toContain("A03");
  });

  it("valeur absente = aucun résultat", () => {
    expect(applyFilters(ACT, { ...FILTRES_INIT, public: ["Post-bac"] })).toHaveLength(0);
  });
});

describe("applyFilters — durée", () => {
  it("filtre par une durée exacte", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, duree: ["<30min"] });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe("A03");
  });

  it("plusieurs durées = union", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, duree: ["<30min", "1-2h"] });
    expect(res).toHaveLength(2);
  });
});

describe("applyFilters — groupe", () => {
  it("filtre par groupe", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, groupe: ["Grand"] });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe("A02");
  });
});

describe("applyFilters — thèmes (OR entre valeurs)", () => {
  it("filtre par thème unique", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, themes: ["IA déconnecté"] });
    expect(res).toHaveLength(2);
  });

  it("filtre par thème non partagé", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, themes: ["IA générative"] });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe("A02");
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
  it("public ET thème", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, public: ["16-20"], themes: ["Éthique"] });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe("A02");
  });

  it("recherche ET durée", () => {
    // "classement" est dans le titre de A03, qui a aussi duree "<30min"
    const res = applyFilters(ACT, { ...FILTRES_INIT, search: "classement", duree: ["<30min"] });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe("A03");
  });

  it("public ET durée incompatibles = vide", () => {
    const res = applyFilters(ACT, { ...FILTRES_INIT, public: ["7-10"], duree: ["1-2h"] });
    expect(res).toHaveLength(0);
  });
});
