import React from "react";
import "../styles/card.css";

import { sumDureeItems, formatDureeGlobale } from "../utils/duree";

function isEvaluation(a) {
  return a.type_fiche === "Activite_Evaluation";
}

function joinList(value) {
  if (!value) return "—";
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "—";
  return String(value).trim() || "—";
}

function bloomPhrase(bloom, action) {
  const parts = [bloom, action].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "—";
}

function QualiopiHeader({ programme, dureeTotal, date }) {
  const titreProgramme = programme.titre || "Mon programme";
  const titreLength = titreProgramme.length;
  const titreFontSize = titreLength > 45 ? Math.max(11, Math.floor(20 * (45 / titreLength))) : 20;

  return (
    <header className="qualiopi-doc-header">
      <div className="qualiopi-doc-eyebrow">SEQUENCIA · Grille de conformité pédagogique Qualiopi</div>
      <h1 className="qualiopi-doc-title" style={{ fontSize: `${titreFontSize}pt`, whiteSpace: 'nowrap' }}>{titreProgramme}</h1>
      <table className="qualiopi-meta-table">
        <tbody>
          <tr>
            <th>Date d'édition</th>
            <td>{date}</td>
            <th>Durée totale</th>
            <td>{dureeTotal || "—"}</td>
          </tr>
          <tr>
            <th>Objectif opérationnel global</th>
            <td colSpan={3}>
              À l'issue de cette formation, l'apprenant sera capable de :{" "}
              <strong>{bloomPhrase(programme.objectif_bloom, programme.objectif_action)}</strong>
            </td>
          </tr>
          <tr>
            <th>Critères d'acquisition</th>
            <td colSpan={3}>{programme.objectif_final?.trim() || "—"}</td>
          </tr>
          <tr className="qualiopi-prerequis-row">
            <th>Prérequis <span className="qualiopi-indicateur">Indicateur 1</span></th>
            <td colSpan={3}>{programme.prerequis?.trim() || "— Non renseigné —"}</td>
          </tr>
        </tbody>
      </table>
    </header>
  );
}

function FicheGrid({ activite: a, num }) {
  const evalMode = isEvaluation(a);
  return (
    <div className={`qualiopi-fiche${evalMode ? " qualiopi-fiche-eval" : ""}`}>
      <div className="qualiopi-fiche-header">
        <span className="qualiopi-fiche-num">Activité {num}</span>
        <h4 className="qualiopi-fiche-titre">{a.titre}</h4>
        {evalMode && <span className="qualiopi-fiche-badge">Activité d'évaluation</span>}
        <span className="qualiopi-fiche-duree">{a.duree || "—"}</span>
      </div>

      <table className="qualiopi-fiche-grid">
        <tbody>
          <tr>
            <th>Public visé <span className="qualiopi-indicateur">Ind. 6</span></th>
            <td>{joinList(a.age_public ?? a.public)}</td>
            <th>Taille de groupe <span className="qualiopi-indicateur">Ind. 6</span></th>
            <td>{joinList(a.taille_groupe ?? a.groupe)}</td>
          </tr>
          <tr>
            <th>Modalités <span className="qualiopi-indicateur">Ind. 10</span></th>
            <td>{joinList(a.modalite)}</td>
            <th>Ressources matérielles <span className="qualiopi-indicateur">Ind. 19</span></th>
            <td>{joinList(a.materiels)}</td>
          </tr>
          <tr>
            <th>Adaptation Handicap (PSH) <span className="qualiopi-indicateur">Ind. 26</span></th>
            <td colSpan={3} className={a.adaptation_psh?.trim() ? "" : "qualiopi-cell-vide"}>
              {a.adaptation_psh?.trim() || "— Non renseigné —"}
            </td>
          </tr>
          {!evalMode && a.description?.trim() && (
            <tr>
              <th>Description</th>
              <td colSpan={3}>{a.description}</td>
            </tr>
          )}
          {!evalMode && a.apprentissage_cle?.trim() && (
            <tr>
              <th>Apprentissage clé</th>
              <td colSpan={3}><em>« {a.apprentissage_cle} »</em></td>
            </tr>
          )}
        </tbody>
      </table>

      {evalMode && (
        <div className="qualiopi-eval-bloc">
          <div className="qualiopi-eval-titre">
            Preuve d'évaluation <span className="qualiopi-indicateur">Indicateur 11</span>
          </div>
          <table className="qualiopi-eval-grid">
            <tbody>
              <tr>
                <th>Type d'évaluation</th>
                <td>{a.eval_type?.trim() || "— Non renseigné —"}</td>
              </tr>
              <tr>
                <th>Modalité</th>
                <td>{a.eval_modalite?.trim() || "— Non renseigné —"}</td>
              </tr>
              <tr>
                <th>Conditions de réalisation</th>
                <td>{a.eval_conditions?.trim() || "— Non renseigné —"}</td>
              </tr>
              <tr>
                <th>Critères de réussite</th>
                <td>{a.eval_criteres?.trim() || "— Non renseigné —"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EncartTexteGrid({ fiche, num }) {
  return (
    <div className="qualiopi-fiche qualiopi-fiche-texte">
      <div className="qualiopi-fiche-header">
        <span className="qualiopi-fiche-num">Encart {num}</span>
        <h4 className="qualiopi-fiche-titre">{fiche.titre || "Encart"}</h4>
        {fiche.duree_min > 0 && (
          <span className="qualiopi-fiche-duree">{fiche.duree_min} min</span>
        )}
      </div>
      {fiche.contenu?.trim() && (
        <p className="qualiopi-fiche-texte-body">{fiche.contenu}</p>
      )}
    </div>
  );
}

function SeanceBlock({ seance, seqIdx, seaIdx, activites, dureeSea }) {
  const opoPhrase = bloomPhrase(seance.opo_bloom, seance.opo_verbe);
  const ficheItems = (seance.fiches ?? []).map(f => {
    if (f.type === "texte") return { key: f.id, type: "texte", fiche: f };
    const a = activites.find(x => x.id === f.activite_id);
    return a ? { key: f.id, type: "activite", activite: a } : null;
  }).filter(Boolean);

  return (
    <div className="qualiopi-seance">
      <table className="qualiopi-alignement-table">
        <thead>
          <tr>
            <th className="qualiopi-col-num">Séance {seqIdx + 1}.{seaIdx + 1}</th>
            <th>Intitulé</th>
            <th>Verbe Bloom (OPO)</th>
            <th>Type</th>
            <th className="qualiopi-col-duree">Durée</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="qualiopi-col-num">{seqIdx + 1}.{seaIdx + 1}</td>
            <td>{seance.titre}</td>
            <td className={seance.opo_bloom ? "qualiopi-bloom" : "qualiopi-cell-vide"}>{opoPhrase}</td>
            <td>{seance.opo_type || "Savoir"}</td>
            <td className="qualiopi-col-duree">{dureeSea || "—"}</td>
          </tr>
        </tbody>
      </table>

      <div className="qualiopi-fiches-list">
        {ficheItems.length === 0 ? (
          <p className="qualiopi-seance-vide">Aucune activité assignée à cette séance.</p>
        ) : (
          ficheItems.map((item, i) =>
            item.type === "texte"
              ? <EncartTexteGrid key={item.key} fiche={item.fiche} num={i + 1} />
              : <FicheGrid key={item.key} activite={item.activite} num={i + 1} />
          )
        )}
      </div>
    </div>
  );
}

export default function PrintViewQualiopi({ programme, activites }) {
  if (!programme || (programme.sequences ?? []).length === 0) return null;

  const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  const allFiches = (programme.sequences ?? []).flatMap(seq =>
    (seq.seances ?? []).flatMap(sea => sea.fiches ?? [])
  );
  const dureeTotal = formatDureeGlobale(sumDureeItems(allFiches, activites));

  return (
    <div className="print-view print-view-qualiopi">
      <QualiopiHeader programme={programme} dureeTotal={dureeTotal} date={date} />

      {programme.sequences.map((seq, seqIdx) => {
        const seqFiches = (seq.seances ?? []).flatMap(sea => sea.fiches ?? []);
        const dureeSeq = formatDureeGlobale(sumDureeItems(seqFiches, activites));

        return (
          <section key={seq.id} className="qualiopi-sequence">
            <div className="qualiopi-sequence-header">
              <span className="qualiopi-sequence-eyebrow">Séquence {seqIdx + 1}</span>
              <h2 className="qualiopi-sequence-titre">{seq.titre}</h2>
              {dureeSeq && <span className="qualiopi-sequence-duree">{dureeSeq}</span>}
            </div>

            <table className="qualiopi-sequence-objectif">
              <tbody>
                <tr>
                  <th>Objectif opérationnel</th>
                  <td>
                    À l'issue de cette séquence, l'apprenant sera capable de :{" "}
                    <strong className={seq.objectif_bloom ? "qualiopi-bloom" : "qualiopi-cell-vide"}>
                      {bloomPhrase(seq.objectif_bloom, seq.objectif_action)}
                    </strong>
                  </td>
                </tr>
                <tr>
                  <th>Critères d'acquisition</th>
                  <td>{seq.objectif_competence?.trim() || "—"}</td>
                </tr>
              </tbody>
            </table>

            {(seq.seances ?? []).map((sea, seaIdx) => {
              const dureeSea = formatDureeGlobale(sumDureeItems(sea.fiches ?? [], activites));
              return (
                <SeanceBlock
                  key={sea.id}
                  seance={sea}
                  seqIdx={seqIdx}
                  seaIdx={seaIdx}
                  activites={activites}
                  dureeSea={dureeSea}
                />
              );
            })}
          </section>
        );
      })}

      <footer className="qualiopi-doc-footer">
        Grille de conformité pédagogique — {programme.titre || "Mon programme"}
        {dureeTotal ? ` · ${dureeTotal}` : ""} · Édité le {date}
      </footer>
    </div>
  );
}
