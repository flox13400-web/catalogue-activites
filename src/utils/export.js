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
  const titreAffiche = titre.trim() || "Fiche de séance — IA générative";
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
    lignes.push(`**Public :** ${a.public.join(", ")}  `);
    lignes.push(`**Durée :** ${a.duree_detail || a.duree}  `);
    lignes.push(`**Groupe :** ${a.groupe.join(", ")}  `);
    lignes.push(`**Thèmes :** ${a.themes.join(", ")}  `);
    lignes.push(`**Contexte :** ${a.contexte.join(", ")}`);
    lignes.push(``);
    lignes.push(`### Description`);
    lignes.push(``);
    lignes.push(a.description);
    lignes.push(``);
    lignes.push(`### Apprentissage clé`);
    lignes.push(``);
    lignes.push(`> ${a.apprentissage_cle}`);
    lignes.push(``);
    lignes.push(`---`);
    lignes.push(``);
  });

  telecharger(lignes.join("\n"), "seance-ia.md", "text/markdown;charset=utf-8");
}

export function exportCSV(activites, _titre = "") {
  const entetes = ["id", "titre", "public", "duree", "duree_detail", "groupe", "themes", "contexte", "description_courte", "apprentissage_cle"];
  const echapper = (v) => `"${String(v).replace(/"/g, '""')}"`;

  const lignes = [
    entetes.join(";"),
    ...activites.map((a) =>
      [
        a.id,
        a.titre,
        a.public.join(" | "),
        a.duree,
        a.duree_detail || "",
        a.groupe.join(" | "),
        a.themes.join(" | "),
        a.contexte.join(" | "),
        a.description_courte,
        a.apprentissage_cle,
      ]
        .map(echapper)
        .join(";")
    ),
  ];

  telecharger("﻿" + lignes.join("\n"), "seance-ia.csv", "text/csv;charset=utf-8");
}
