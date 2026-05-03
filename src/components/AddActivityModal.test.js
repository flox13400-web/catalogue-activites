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
  age_public: ["Collège"],
  duree: "30-45min",
  taille_groupe: ["7-12"],
  themes: ["IA déconnecté"],
  contexte: ["Scolaire"],
  modalite: ["Présentielle"],
  materiels: ["Cartes"],
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
    const act = { ...ACT_BASE, age_public: "Collège", taille_groupe: "7-12", themes: "IA déconnecté" };
    const res = parserJSON(JSON.stringify([act]));
    expect(res[0].age_public).toEqual(["Collège"]);
    expect(res[0].taille_groupe).toEqual(["7-12"]);
  });

  it("accepte les anciens noms de champs (public, groupe)", () => {
    const act = { titre: "Test", duree: "30-45min", public: ["Lycée"], groupe: ["Moyen"] };
    const res = parserJSON(JSON.stringify([act]));
    expect(res[0].age_public).toEqual(["Lycée"]);
    expect(res[0].taille_groupe).toEqual(["Moyen"]);
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

  it("accepte une activité avec seulement titre et duree", () => {
    const res = parserJSON(JSON.stringify([{ titre: "Minimal", duree: "0-15min" }]));
    expect(res).toHaveLength(1);
    expect(res[0].titre).toBe("Minimal");
    expect(res[0].age_public).toEqual([]);
    expect(res[0].themes).toEqual([]);
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

  it("lève une erreur si titre manque", () => {
    const actSansTitre = { ...ACT_BASE };
    delete actSansTitre.titre;
    expect(() => parserJSON(JSON.stringify([actSansTitre]))).toThrow(/titre/);
  });

  it("lève une erreur si duree manque", () => {
    const actSansDuree = { ...ACT_BASE };
    delete actSansDuree.duree;
    expect(() => parserJSON(JSON.stringify([actSansDuree]))).toThrow(/duree/);
  });
});

// ── parserCSV ─────────────────────────────────────────────────

const ENTETES = "titre;age_public;duree;taille_groupe;themes;materiels;contexte;modalite;description;apprentissage_cle";

function csv(...lignes) {
  return [ENTETES, ...lignes].join("\n");
}

const LIGNE_BASE = '"Mon activité";"Collège | Lycée";"30-45min";"";"7-12";"IA déconnecté";"Cartes";"Scolaire";"Présentielle";"Résumé";"Description complète";"Ce que l\'on retient"';

describe("parserCSV — structure valide", () => {
  it("parse une ligne basique (séparateur ;)", () => {
    const res = parserCSV(csv(LIGNE_BASE));
    expect(res).toHaveLength(1);
    expect(res[0].titre).toBe("Mon activité");
    expect(res[0].duree).toBe("30-45min");
  });

  it("parse les valeurs multi (| comme séparateur)", () => {
    const res = parserCSV(csv(LIGNE_BASE));
    expect(res[0].age_public).toEqual(["Collège", "Lycée"]);
  });

  it("détecte le séparateur virgule automatiquement", () => {
    const entetes = "titre,age_public,duree,taille_groupe,themes,materiels,contexte,modalite,description,apprentissage_cle";
    const ligne = '"Activité A","Adultes","45-60min","",">12","Éthique","","Entreprise","Distanciel","Résumé","Desc","Apprentissage"';
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
    const ligne = '"L\'activité ""spéciale""";"Adultes";"15-30min";"";"2-6";"Test";"";"";"Présentielle";"Résumé";"Desc";"App"';
    const res = parserCSV(csv(ligne));
    expect(res[0].titre).toBe('L\'activité "spéciale"');
  });

  it("ignore les lignes sans titre", () => {
    const ligneVide = '"";"Collège";"30-45min";"";"7-12";"IA";"";"";"Présentielle";"Résumé";"Desc";"App"';
    const res = parserCSV(csv(LIGNE_BASE, ligneVide));
    expect(res).toHaveLength(1);
  });

  it("parse plusieurs lignes", () => {
    const res = parserCSV(csv(LIGNE_BASE, LIGNE_BASE, LIGNE_BASE));
    expect(res).toHaveLength(3);
  });

  it("accepte un fichier avec seulement titre et duree", () => {
    const res = parserCSV("titre;duree\n\"Simple\";\"0-15min\"");
    expect(res).toHaveLength(1);
    expect(res[0].titre).toBe("Simple");
    expect(res[0].age_public).toEqual([]);
  });
});

describe("parserCSV — colonnes reconnues", () => {
  it("accepte toutes les valeurs de durée valides", () => {
    const durees = ["0-15min", "15-30min", "30-45min", "45-60min", ">60min"];
    for (const d of durees) {
      const ligne = `"Test";"Collège";"${d}";"";"7-12";"IA";"";"";"Présentielle";"R";"D";"A"`;
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
    const mauvaisEntetes = "titre\n\"Test\"";
    expect(() => parserCSV(mauvaisEntetes)).toThrow(/duree/);
  });

  it("lève une erreur si toutes les lignes ont un titre vide", () => {
    const ligneVide = '"";"Collège";"30-45min";"";"7-12";"IA";"";"";"Présentielle";"R";"D";"A"';
    expect(() => parserCSV(csv(ligneVide))).toThrow(/Aucune activité/);
  });
});

// ── parserMarkdown ────────────────────────────────────────────

describe("parserMarkdown", () => {
  const MD_VALIDE = `
## 1. Mon activité \`A01\`

**Âge du public :** Collège, Lycée
**Durée :** 30-45min
**Taille de groupe :** 7-12
**Thèmes :** IA déconnecté
**Matériels :** Cartes, Tableau
**Contexte :** Scolaire
**Modalité :** Présentielle

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
    expect(res[0].duree).toBe("30-45min");
  });

  it("extrait les tableaux (âge, taille, matériels)", () => {
    const res = parserMarkdown(MD_VALIDE);
    expect(res[0].age_public).toContain("Collège");
    expect(res[0].age_public).toContain("Lycée");
    expect(res[0].taille_groupe).toContain("7-12");
    expect(res[0].materiels).toContain("Cartes");
    expect(res[0].materiels).toContain("Tableau");
  });

  it("extrait la description et l'apprentissage clé", () => {
    const res = parserMarkdown(MD_VALIDE);
    expect(res[0].description).toContain("Déroulé");
    expect(res[0].apprentissage_cle).toContain("participants");
  });

  it("accepte les anciens labels (Public, Groupe) pour la compatibilité", () => {
    const mdAncien = `
## 1. Ancienne activité \`A99\`

**Public :** Adultes
**Durée :** 30-45min
**Groupe :** Moyen

### Description

Texte.

---
`.trim();
    const res = parserMarkdown(mdAncien);
    expect(res[0].age_public).toContain("Adultes");
    expect(res[0].taille_groupe).toContain("Moyen");
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
