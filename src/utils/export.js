function telecharger(contenu, nomFichier, typeMime) {
  const blob = new Blob([contenu], { type: typeMime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomFichier;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCatalogue(activites) {
  const date = new Date().toLocaleDateString("fr-FR").replace(/\//g, "-");
  telecharger(JSON.stringify(activites, null, 2), `catalogue-sequencia-${date}.json`, "application/json");
}

export function exportJSON(activites, titre = "") {
  const data = {
    export: titre.trim() || "Catalogue IA — Panier de séance",
    date: new Date().toLocaleDateString("fr-FR"),
    nombre: activites.length,
    activites: activites,
  };
  telecharger(JSON.stringify(data, null, 2), "seance-ia.json", "application/json");
}

export function exportMarkdown(activites, titre = "") {
  const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const titreAffiche = titre.trim() || "Fiche de séance";
  const lignes = [
    `# ${titreAffiche}`,
    ``,
    `*Exporté le ${date} · ${activites.length} activité${activites.length > 1 ? "s" : ""}*`,
    ``,
    `---`,
    ``,
  ];

  activites.forEach((a, i) => {
    lignes.push(`## ${i + 1}. ${a.titre} \`${a.id}\``);
    lignes.push(``);
    if ((a.age_public || a.public || []).length > 0)
      lignes.push(`**Âge du public :** ${(a.age_public || a.public || []).join(", ")}  `);
    lignes.push(`**Durée :** ${a.duree}  `);
    if ((a.taille_groupe || a.groupe || []).length > 0)
      lignes.push(`**Taille de groupe :** ${(a.taille_groupe || a.groupe || []).join(", ")}  `);
    if ((a.themes || []).length > 0)
      lignes.push(`**Thèmes :** ${(a.themes || []).join(", ")}  `);
    if ((a.materiels || []).length > 0)
      lignes.push(`**Matériels :** ${(a.materiels || []).join(", ")}  `);
    if ((a.contexte || []).length > 0)
      lignes.push(`**Contexte :** ${(a.contexte || []).join(", ")}  `);
    if ((a.modalite || []).length > 0)
      lignes.push(`**Modalité :** ${(a.modalite || []).join(", ")}`);
    lignes.push(``);
    if (a.description) {
      lignes.push(`### Description`);
      lignes.push(``);
      lignes.push(a.description);
      lignes.push(``);
    }
    if (a.apprentissage_cle) {
      lignes.push(`### Apprentissage clé`);
      lignes.push(``);
      lignes.push(`> ${a.apprentissage_cle}`);
      lignes.push(``);
    }
    if (a.problematique) {
      lignes.push(`### Problématique`);
      lignes.push(``);
      lignes.push(a.problematique);
      lignes.push(``);
    }
    if (a.remediation) {
      lignes.push(`### Remédiation`);
      lignes.push(``);
      lignes.push(a.remediation);
      lignes.push(``);
    }
    lignes.push(`---`);
    lignes.push(``);
  });

  telecharger(lignes.join("\n"), "seance-ia.md", "text/markdown;charset=utf-8");
}

export function exportCSV(activites, _titre = "") {
  const entetes = ["id", "titre", "age_public", "duree", "taille_groupe", "themes", "materiels", "contexte", "modalite", "description_courte", "description", "apprentissage_cle", "problematique", "remediation"];
  const echapper = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

  const lignes = [
    entetes.join(";"),
    ...activites.map((a) =>
      [
        a.id,
        a.titre,
        (a.age_public || a.public || []).join(" | "),
        a.duree,
        (a.taille_groupe || a.groupe || []).join(" | "),
        (a.themes || []).join(" | "),
        (a.materiels || []).join(" | "),
        (a.contexte || []).join(" | "),
        (a.modalite || []).join(" | "),
        a.description_courte || "",
        a.description || "",
        a.apprentissage_cle || "",
        a.problematique || "",
        a.remediation || "",
      ]
        .map(echapper)
        .join(";")
    ),
  ];

  telecharger("﻿" + lignes.join("\n"), "seance-ia.csv", "text/csv;charset=utf-8");
}
