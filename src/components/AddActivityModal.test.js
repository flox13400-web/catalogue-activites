import { describe, it, expect } from "vitest";
import { genererIdActivite, parserJSON, parserCSV, parserMarkdown } from "./AddActivityModal";

// ── genererIdActivite ──────────────────────────────────────────

describe("genererIdActivite", () => {
  it("génère CUS-001 pour une liste vide", () => {
    expect(genererIdActivite([])).toBe("CUS-001");
  });

  it("génère CUS-002 si CUS-001 existe", () => {
    expect(genererIdActivite([{ id: "CUS-001" }])).toBe("CUS-002");
  });

  it("prend le max existant + 1", () => {
    expect(genererIdActivite([{ id: "CUS-001" }, { id: "CUS-005" }, { id: "CUS-003" }])).toBe("CUS-006");
  });

  it("ignore les IDs non-CUS", () => {
    expect(genererIdActivite([{ id: "A01" }, { id: "B02" }])).toBe("CUS-001");
  });

  it("padde correctement à 3 chiffres", () => {
    const activites = Array.from({ length: 9 }, (_, i) => ({ id: `CUS-00${i + 1}` }));
    expect(genererIdActivite(activites)).toBe("CUS-010");
  });
});

// ── parserJSON ────────────────────────────────────────────────

const ACT_BASE = {
  titre: "Mon activité",
  public: ["11-15"],
  duree: "30-60min",
  groupe: ["Moyen"],
  themes: ["IA déconnecté"],
  contexte: ["Scolaire"],
  description_courte: "Résumé",
  description: "Description complète",
  apprentissage_cle: "Ce que l'on retient",
};

describe("parserJSON — structure valide", () => {
  it("parse un tableau JSON d'activités", () => {
    const res = parserJSON(JSON.stringify([ACT_BASE]));
    expect(res).toHaveLength(1);
    expect(res[0].titre).toBe("Mon activité");
  });

  it("parse un objet avec clé activites", () => {
    const res = parserJSON(JSON.stringify({ activites: [ACT_BASE] }));
    expect(res).toHaveLength(1);
  });

  it("normalise les tableaux encodés en string", () => {
    const act = { ...ACT_BASE, public: "11-15", groupe: "Moyen", themes: "IA déconnecté", contexte: "Scolaire" };
    const res = parserJSON(JSON.stringify([act]));
    expect(res[0].public).toEqual(["11-15"]);
    expect(res[0].groupe).toEqual(["Moyen"]);
  });

  it("préserve l'ID si présent", () => {
    const act = { ...ACT_BASE, id: "A99" };
    const res = parserJSON(JSON.stringify([act]));
    expect(res[0].id).toBe("A99");
  });

  it("laisse id null si absent", () => {
    const res = parserJSON(JSON.stringify([ACT_BASE]));
    expect(res[0].id).toBeNull();
  });

  it("accepte plusieurs activités", () => {
    const res = parserJSON(JSON.stringify([ACT_BASE, ACT_BASE, ACT_BASE]));
    expect(res).toHaveLength(3);
  });
});

describe("parserJSON — erreurs", () => {
  it("lève une erreur si JSON invalide", () => {
    expect(() => parserJSON("pas du json")).toThrow();
  });

  it("lève une erreur si format non reconnu (objet sans activites)", () => {
    expect(() => parserJSON(JSON.stringify({ foo: "bar" }))).toThrow();
  });

  it("lève une erreur si un champ obligatoire manque", () => {
    const actSansDescription = { ...ACT_BASE };
    delete actSansDescription.description;
    expect(() => parserJSON(JSON.stringify([actSansDescription]))).toThrow(/description/);
  });

  it("lève une erreur si titre manque", () => {
    const actSansTitre = { ...ACT_BASE };
    delete actSansTitre.titre;
    expect(() => parserJSON(JSON.stringify([actSansTitre]))).toThrow(/titre/);
  });
});

// ── parserCSV ─────────────────────────────────────────────────

const ENTETES = "titre;public;duree;duree_detail;groupe;themes;description_courte;description;apprentissage_cle";

function csv(...lignes) {
  return [ENTETES, ...lignes].join("\n");
}

const LIGNE_BASE = '"Mon activité";"11-15 | 16-20";"30-60min";"";"Moyen";"IA déconnecté";"Résumé";"Description complète";"Ce que l\'on retient"';

describe("parserCSV — structure valide", () => {
  it("parse une ligne basique (séparateur ;)", () => {
    const res = parserCSV(csv(LIGNE_BASE));
    expect(res).toHaveLength(1);
    expect(res[0].titre).toBe("Mon activité");
    expect(res[0].duree).toBe("30-60min");
  });

  it("parse les valeurs multi (| comme séparateur)", () => {
    const res = parserCSV(csv(LIGNE_BASE));
    expect(res[0].public).toEqual(["11-15", "16-20"]);
  });

  it("détecte le séparateur virgule automatiquement", () => {
    const entetes = "titre,public,duree,duree_detail,groupe,themes,description_courte,description,apprentissage_cle";
    const ligne = '"Activité A","Adultes","1-2h","","Grand","Éthique","Résumé","Desc","Apprentissage"';
    const res = parserCSV(`${entetes}\n${ligne}`);
    expect(res).toHaveLength(1);
    expect(res[0].titre).toBe("Activité A");
  });

  it("strip le BOM UTF-8", () => {
    const res = parserCSV("﻿" + csv(LIGNE_BASE));
    expect(res).toHaveLength(1);
  });

  it("accepte les fins de ligne Windows (CRLF)", () => {
    const res = parserCSV(csv(LIGNE_BASE).replace(/\n/g, "\r\n"));
    expect(res).toHaveLength(1);
  });

  it("parse les guillemets doubles échappés dans un champ", () => {
    const ligne = '"L\'activité ""spéciale""";"Adultes";"<30min";"";"Petit";"Test";"Résumé";"Desc";"App"';
    const res = parserCSV(csv(ligne));
    expect(res[0].titre).toBe('L\'activité "spéciale"');
  });

  it("normalise une durée invalide en <30min", () => {
    const ligne = '"Test";"11-15";"durée-inconnue";"";"Moyen";"IA";"Résumé";"Desc";"App"';
    const res = parserCSV(csv(ligne));
    expect(res[0].duree).toBe("<30min");
  });

  it("ignore les lignes sans titre", () => {
    const ligneVide = '"";"11-15";"30-60min";"";"Moyen";"IA";"Résumé";"Desc";"App"';
    const res = parserCSV(csv(LIGNE_BASE, ligneVide));
    expect(res).toHaveLength(1);
  });

  it("parse plusieurs lignes", () => {
    const res = parserCSV(csv(LIGNE_BASE, LIGNE_BASE, LIGNE_BASE));
    expect(res).toHaveLength(3);
  });
});

describe("parserCSV — colonnes reconnues", () => {
  it("accepte toutes les valeurs de durée valides", () => {
    const durees = ["<30min", "30-60min", "1-2h", "2-4h", "Projet"];
    for (const d of durees) {
      const ligne = `"Test";"11-15";"${d}";"";"Moyen";"IA";"R";"D";"A"`;
      const res = parserCSV(csv(ligne));
      expect(res[0].duree).toBe(d);
    }
  });
});

describe("parserCSV — erreurs", () => {
  it("lève une erreur si moins de 2 lignes", () => {
    expect(() => parserCSV(ENTETES)).toThrow();
  });

  it("lève une erreur si colonnes obligatoires manquantes", () => {
    const mauvaisEntetes = "titre;public;duree\n\"Test\";\"11-15\";\"30-60min\"";
    expect(() => parserCSV(mauvaisEntetes)).toThrow(/description_courte/);
  });

  it("lève une erreur si toutes les lignes ont un titre vide", () => {
    const ligneVide = '"";"11-15";"30-60min";"";"Moyen";"IA";"R";"D";"A"';
    expect(() => parserCSV(csv(ligneVide))).toThrow(/Aucune activité/);
  });
});

// ── parserMarkdown ────────────────────────────────────────────

describe("parserMarkdown", () => {
  const MD_VALIDE = `
## 1. Mon activité \`A01\`

**Public :** 11-15, 16-20
**Durée :** 30-60min
**Groupe :** Moyen
**Thèmes :** IA déconnecté
**Contexte :** Scolaire

### Description

Déroulé de l'activité en détail.

### Apprentissage clé

> Ce que les participants retiennent.

---
`.trim();

  it("parse une section Markdown valide", () => {
    const res = parserMarkdown(MD_VALIDE);
    expect(res).toHaveLength(1);
    expect(res[0].titre).toBe("Mon activité");
    expect(res[0].id).toBe("A01");
  });

  it("extrait la durée", () => {
    const res = parserMarkdown(MD_VALIDE);
    expect(res[0].duree).toBe("30-60min");
  });

  it("extrait les tableaux (public, groupe, thèmes)", () => {
    const res = parserMarkdown(MD_VALIDE);
    expect(res[0].public).toContain("11-15");
    expect(res[0].public).toContain("16-20");
    expect(res[0].groupe).toContain("Moyen");
  });

  it("extrait la description et l'apprentissage clé", () => {
    const res = parserMarkdown(MD_VALIDE);
    expect(res[0].description).toContain("Déroulé");
    expect(res[0].apprentissage_cle).toContain("participants");
  });

  it("parse plusieurs sections séparées par ---", () => {
    const md2 = `${MD_VALIDE}\n\n---\n\n${MD_VALIDE.replace("A01", "A02").replace("1. Mon activité", "2. Autre activité")}`;
    const res = parserMarkdown(md2);
    expect(res).toHaveLength(2);
  });

  it("lève une erreur si aucune activité reconnue", () => {
    expect(() => parserMarkdown("# Titre sans section valide\n\nTexte quelconque.")).toThrow(/Aucune activité/);
  });
});
