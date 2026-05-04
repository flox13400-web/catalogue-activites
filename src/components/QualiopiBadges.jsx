import React, { useMemo } from "react";
import "../styles/qualiopi.css";

function hasValue(v) {
  if (Array.isArray(v)) return v.length > 0;
  return v != null && String(v).trim().length > 0;
}

function computeConformite(programme, activites) {
  const activitesIds = new Set();
  for (const seq of programme.sequences ?? []) {
    for (const sea of seq.seances ?? []) {
      for (const fiche of sea.fiches ?? []) {
        if (fiche.activite_id) activitesIds.add(fiche.activite_id);
      }
    }
  }
  const activitesProgramme = activites.filter(a => activitesIds.has(a.id));
  const hasActivites = activitesProgramme.length > 0;

  const allSeances = (programme.sequences ?? []).flatMap(seq => seq.seances ?? []);
  const hasSeances = allSeances.length > 0;

  return {
    ind1: hasValue(programme.prerequis),
    ind5: hasValue(programme.objectif_final) && hasValue(programme.objectif_bloom),
    ind6: hasActivites && activitesProgramme.every(a =>
      hasValue(a.age_public ?? a.public) &&
      hasValue(a.taille_groupe ?? a.groupe) &&
      hasValue(a.modalite)
    ),
    ind7: hasActivites && activitesProgramme.every(a =>
      hasValue(a.description) && hasValue(a.themes)
    ),
    ind11: hasSeances && allSeances.every(sea =>
      (sea.fiches ?? []).some(fiche => {
        const act = activites.find(a => a.id === fiche.activite_id);
        return act?.type_fiche === "Activite_Evaluation";
      })
    ),
    ind19: hasActivites && activitesProgramme.every(a => hasValue(a.materiels)),
    ind26: hasActivites && activitesProgramme.every(a => hasValue(a.adaptation_psh)),
  };
}

const BADGES_CONFIG = [
  {
    key: "ind1",
    num: 1,
    label: "Prérequis",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4h12v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4z"/>
        <path d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1"/>
        <path d="M5.5 8.5h5M5.5 10.5h3"/>
      </svg>
    ),
  },
  {
    key: "ind5",
    num: 5,
    label: "Objectifs",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="6"/>
        <circle cx="8" cy="8" r="3"/>
        <circle cx="8" cy="8" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    key: "ind6",
    num: 6,
    label: "Public & modalité",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="5" r="2"/>
        <circle cx="10" cy="5" r="2"/>
        <path d="M2 13c0-2.2 1.8-4 4-4h4c2.2 0 4 1.8 4 4"/>
      </svg>
    ),
  },
  {
    key: "ind7",
    num: 7,
    label: "Description & thèmes",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="12" height="12" rx="1"/>
        <path d="M5 6h6M5 9h4"/>
        <circle cx="11" cy="9" r="1.5" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    key: "ind11",
    num: 11,
    label: "Évaluation par séance",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 8l3.5 3.5L13 4.5"/>
        <circle cx="8" cy="8" r="6"/>
      </svg>
    ),
  },
  {
    key: "ind19",
    num: 19,
    label: "Matériel",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="12" height="7" rx="1"/>
        <path d="M5 7V5a3 3 0 016 0v2"/>
        <circle cx="8" cy="10.5" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    key: "ind26",
    num: 26,
    label: "Accessibilité PSH",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="3" r="1.5"/>
        <path d="M6 6h4M8 6v4"/>
        <path d="M5 14c0-1.7 1.3-3 3-3s3 1.3 3 3"/>
      </svg>
    ),
  },
];

export default function QualiopiBadges({ programme, activites }) {
  const conformite = useMemo(
    () => computeConformite(programme, activites),
    [programme, activites]
  );

  return (
    <div className="qualiopi-badges" aria-label="Voyants de conformité Qualiopi">
      {BADGES_CONFIG.map(({ key, num, label, icon }) => (
        <div
          key={key}
          className={`qualiopi-badge${conformite[key] ? " qualiopi-badge--conforme" : ""}`}
          title={`Indicateur ${num} — ${label}${conformite[key] ? " ✓ Conforme" : " ✗ Non conforme"}`}
        >
          <span className="qualiopi-badge__num">{num}</span>
          <span className="qualiopi-badge__icon">{icon}</span>
        </div>
      ))}
    </div>
  );
}
