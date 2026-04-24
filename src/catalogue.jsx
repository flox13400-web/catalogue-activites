import React, { useState, useMemo, useEffect } from "react";

// ============================================================
// DONNÉES — 105 activités (injectées en dur pour l'Étape B)
// Sera remplacé par un import / fetch dans une étape ultérieure
// ============================================================

const ACTIVITES_NATIVES = [
  {
    "id": "A01",
    "titre": "L'aspirateur à mots",
    "phase": "Avant",
    "public": [
      "7-10",
      "11-15"
    ],
    "duree": "<30min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Légère",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire"
    ],
    "description_courte": "Chaque enfant reçoit un livre et lit à voix basse pendant 5 minutes.",
    "description": "Chaque enfant reçoit un livre et lit à voix basse pendant 5 minutes. Ils sont des \"petits cerveaux\" qui s'entraînent en absorbant du texte. Vivent physiquement la phase d'entraînement.",
    "apprentissage_cle": "Une IA ne sait que ce qu'elle a \"lu\". Sa connaissance dépend de ce avec quoi on l'a nourrie."
  },
  {
    "id": "A02",
    "titre": "Le jeu des cartes-mots",
    "phase": "Avant",
    "public": [
      "7-10",
      "11-15"
    ],
    "duree": "30-60min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire"
    ],
    "description_courte": "Les enfants regroupent physiquement dans la pièce des cartes-mots qui \"se ressemblent\" par le sens.",
    "description": "Les enfants regroupent physiquement dans la pièce des cartes-mots qui \"se ressemblent\" par le sens. Pour les 11-15 ans, version avancée avec mots abstraits et plusieurs axes de regroupement (sens, connotation, registre).",
    "apprentissage_cle": "L'IA \"range\" les mots selon leur proximité de sens dans un espace à des centaines de dimensions."
  },
  {
    "id": "A03",
    "titre": "Le bibliothécaire aveugle",
    "phase": "Avant",
    "public": [
      "7-10",
      "11-15"
    ],
    "duree": "<30min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Légère",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire"
    ],
    "description_courte": "Un enfant joue le \"bibliothécaire\" qui n'a lu que 5 livres précis. Les autres lui posent des questions.",
    "description": "Un enfant joue le \"bibliothécaire\" qui n'a lu que 5 livres précis. Les autres lui posent des questions. S'il ne sait pas, il doit soit dire \"je ne sais pas\", soit inventer une réponse plausible.",
    "apprentissage_cle": "Une IA ne sait pas tout, et quand elle ne sait pas, elle invente parfois sans le dire."
  },
  {
    "id": "A04",
    "titre": "L'analyse comparative de corpus",
    "phase": "Avant",
    "public": [
      "11-15",
      "16-20",
      "Post-bac"
    ],
    "duree": "30-60min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Importante",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire",
      "Études sup."
    ],
    "description_courte": "Trois sous-groupes reçoivent trois corpus différents (presse people, manuels scientifiques, romans XIXe) et répondent…",
    "description": "Trois sous-groupes reçoivent trois corpus différents (presse people, manuels scientifiques, romans XIXe) et répondent aux mêmes 5 questions. Les visions du monde produites divergent radicalement.",
    "apprentissage_cle": "Deux IA entraînées sur des corpus différents produisent des visions du monde radicalement différentes."
  },
  {
    "id": "A05",
    "titre": "L'archéologie des biais",
    "phase": "Avant",
    "public": [
      "11-15",
      "16-20",
      "Post-bac"
    ],
    "duree": "<30min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Importante",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire",
      "Études sup."
    ],
    "description_courte": "Séries de données présentées : contributeurs Wikipédia par genre, langues sur internet, pays d'origine des contenus.",
    "description": "Séries de données présentées : contributeurs Wikipédia par genre, langues sur internet, pays d'origine des contenus. Les participants prédisent les conséquences puis vérifient. Version post-bac : enquête par groupes sur langues, genres, temporalité, classes sociales.",
    "apprentissage_cle": "Les biais de l'IA ne sortent pas de nulle part : ils sont le reflet mathématique des biais de ceux qui ont produit les données."
  },
  {
    "id": "A06",
    "titre": "Le débat \"l'IA pense-t-elle ?\"",
    "phase": "Avant",
    "public": [
      "11-15",
      "16-20",
      "Post-bac"
    ],
    "duree": "30-60min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire",
      "Études sup."
    ],
    "description_courte": "Deux camps défendent des positions tirées au sort : \"l'IA comprend vraiment\" vs \"l'IA simule la compréhension\".",
    "description": "Deux camps défendent des positions tirées au sort : \"l'IA comprend vraiment\" vs \"l'IA simule la compréhension\". Introduction à la chambre chinoise de Searle. Version post-bac : séminaire de 3 séances sur textes primaires (Turing, Searle, Dennett).",
    "apprentissage_cle": "La question \"l'IA comprend-elle ?\" est une vraie question philosophique, débattue par les chercheurs eux-mêmes."
  },
  {
    "id": "A07",
    "titre": "Anatomie d'un modèle LLM",
    "phase": "Avant",
    "public": [
      "16-20",
      "Post-bac"
    ],
    "duree": "2-4h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Importante",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire",
      "Études sup."
    ],
    "description_courte": "4 groupes incarnent les 4 étapes de fabrication : corpus brut, fine-tuning, alignement, RLHF.",
    "description": "4 groupes incarnent les 4 étapes de fabrication : corpus brut, fine-tuning, alignement, RLHF. Chaque groupe présente son travail et ses choix. Version post-bac étendue avec pipeline complet (cahier des charges, pré-traitement, architecture, évaluation, déploiement).",
    "apprentissage_cle": "Un LLM n'est pas \"juste entraîné sur internet\". C'est le produit d'une chaîne de décisions humaines à plusieurs étapes."
  },
  {
    "id": "A08",
    "titre": "Cartographie géopolitique des acteurs IA",
    "phase": "Avant",
    "public": [
      "16-20",
      "Post-bac"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Importante",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire",
      "Études sup."
    ],
    "description_courte": "Cartographier l'écosystème IA mondial : acteurs, localisations, financements, modèles économiques, alliances.",
    "description": "Cartographier l'écosystème IA mondial : acteurs, localisations, financements, modèles économiques, alliances. Production : fresque murale collective. Quelles implications pour notre discipline, notre pays ?",
    "apprentissage_cle": "L'IA n'est pas neutre géopolitiquement. C'est un enjeu de souveraineté."
  },
  {
    "id": "A09",
    "titre": "Lecture critique de papers fondateurs",
    "phase": "Avant",
    "public": [
      "Post-bac"
    ],
    "duree": "2-4h",
    "duree_detail": null,
    "groupe": [
      "Petit"
    ],
    "preparation": "Importante",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Études sup."
    ],
    "description_courte": "Lecture critique en groupes de 3 papers fondateurs : *Attention Is All You Need* (Vaswani 2017), *Language Models are…",
    "description": "Lecture critique en groupes de 3 papers fondateurs : *Attention Is All You Need* (Vaswani 2017), *Language Models are Few-Shot Learners* (Brown 2020), *Training language models with RLHF* (Ouyang 2022). Note critique par groupe.",
    "apprentissage_cle": "Savoir lire la littérature primaire est la première compétence d'un utilisateur expert."
  },
  {
    "id": "A10",
    "titre": "L'IA dans ma discipline",
    "phase": "Avant",
    "public": [
      "Post-bac"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Études sup."
    ],
    "description_courte": "Regroupement par discipline (médecine, droit, ingénierie, SHS, arts, commerce).",
    "description": "Regroupement par discipline (médecine, droit, ingénierie, SHS, arts, commerce). Chaque groupe analyse : usages actuels, promesses, controverses, chercheurs de référence, angles morts collectifs. Présentation croisée interdisciplinaire.",
    "apprentissage_cle": "Chaque discipline développe un rapport spécifique à l'IA. Sortir de son silo éclaire les enjeux communs."
  },
  {
    "id": "A11",
    "titre": "La démystification factuelle",
    "phase": "Avant",
    "public": [
      "Adultes"
    ],
    "duree": "30-60min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "20 affirmations sur l'IA, moitié vraies, moitié fausses…",
    "description": "20 affirmations sur l'IA, moitié vraies, moitié fausses (\"L'IA apprend de nos conversations en temps réel\", \"L'IA va remplacer 50% des emplois\"). Vote à main levée avant révélation. Débriefing sur les sources des mythes et leurs conséquences opérationnelles.",
    "apprentissage_cle": "Beaucoup de croyances largement partagées sur l'IA sont fausses ou exagérées. Partir des faits est la première étape pour prendre des décisions rationnelles."
  },
  {
    "id": "A12",
    "titre": "Ce que l'IA ne peut PAS faire",
    "phase": "Avant",
    "public": [
      "Adultes"
    ],
    "duree": "30-60min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "Brainstorming collectif sur les limites.",
    "description": "Brainstorming collectif sur les limites. L'animateur complète : accès aux données privées, données récentes, calculs précis, jugement éthique contextuel, confidentialité, cohérence long texte. Production : liste des limites à afficher sur son poste.",
    "apprentissage_cle": "Un collaborateur qui connaît les limites de l'IA est 10x plus productif qu'un qui les ignore."
  },
  {
    "id": "A13",
    "titre": "Panorama de l'écosystème IA",
    "phase": "Avant",
    "public": [
      "16-20",
      "Post-bac",
      "Adultes"
    ],
    "duree": "30-60min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Études sup.",
      "Entreprise"
    ],
    "description_courte": "Présentation du paysage : grands modèles (ChatGPT, Claude, Gemini, Mistral, Copilot, DeepSeek), solutions intégrées,…",
    "description": "Présentation du paysage : grands modèles (ChatGPT, Claude, Gemini, Mistral, Copilot, DeepSeek), solutions intégrées, open source, outils no-code d'agents. Chacun identifie les 2-3 outils les plus pertinents pour son contexte.",
    "apprentissage_cle": "L'IA n'est pas un seul outil mais un écosystème. Choisir les bons outils pour les bons usages est une compétence stratégique."
  },
  {
    "id": "A14",
    "titre": "Diagnostic de maturité personnelle",
    "phase": "Avant",
    "public": [
      "Adultes"
    ],
    "duree": "<30min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Légère",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "Grille de maturité en 5 niveaux (ignorant, curieux, testeur, usager régulier, expert) évaluée sur plusieurs dimensions.",
    "description": "Grille de maturité en 5 niveaux (ignorant, curieux, testeur, usager régulier, expert) évaluée sur plusieurs dimensions. Auto-positionnement. Discussion binômes sur les niveaux suivants à viser.",
    "apprentissage_cle": "Savoir où on en est, c'est pouvoir choisir où aller."
  },
  {
    "id": "C01",
    "titre": "Analyse des tâches de ma fonction",
    "phase": "Construire",
    "public": [
      "16-20",
      "Post-bac",
      "Adultes"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire",
      "Études sup.",
      "Entreprise"
    ],
    "description_courte": "Décomposition de sa fonction en 15-20 tâches.",
    "description": "Décomposition de sa fonction en 15-20 tâches. Pour chacune : potentiel d'augmentation IA (de \"aucun\" à \"révolutionnaire\"). Identification des tâches-cibles pour transformation prioritaire. Carte de transformation du métier.",
    "apprentissage_cle": "Chaque métier se transforme différemment. L'analyse fine révèle où est le levier réel."
  },
  {
    "id": "C02",
    "titre": "Workflows augmentés",
    "phase": "Construire",
    "public": [
      "Adultes"
    ],
    "duree": "2-4h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "Redesign d'un processus-clé (cycle de vente, onboarding client, reporting mensuel). Comparaison avant/après.",
    "description": "Redesign d'un processus-clé (cycle de vente, onboarding client, reporting mensuel). Comparaison avant/après. Workflow augmenté documenté, testable dès la semaine suivante.",
    "apprentissage_cle": "L'IA ne bénéficie pleinement que dans des processus repensés. La greffer sur l'ancien donne peu de valeur."
  },
  {
    "id": "C03",
    "titre": "Automatisation légère et agents",
    "phase": "Construire",
    "public": [
      "Adultes"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "Outils no-code : Zapier + IA, Make, Power Automate, Custom GPTs, Claude Projects, agents no-code.",
    "description": "Outils no-code : Zapier + IA, Make, Power Automate, Custom GPTs, Claude Projects, agents no-code. Conception d'un workflow automatisé simple pour sa fonction. Prototype papier.",
    "apprentissage_cle": "L'automatisation avec IA est accessible sans coder. Les collaborateurs qui s'en emparent gagnent 10-20% de leur temps."
  },
  {
    "id": "C04",
    "titre": "Déléguer à l'IA",
    "phase": "Construire",
    "public": [
      "Adultes"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Petit"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "Déléguer une tâche complète à l'IA (pas juste une sous-étape).",
    "description": "Déléguer une tâche complète à l'IA (pas juste une sous-étape). Matrice de délégation : brief, critères de réussite, contrôle, validation finale. Binômes délégant / \"IA\". Résistances personnelles à déléguer.",
    "apprentissage_cle": "Déléguer à une IA ressemble à déléguer à un collaborateur : ça s'apprend."
  },
  {
    "id": "C05",
    "titre": "Ma voix, mon jugement, ma valeur",
    "phase": "Construire",
    "public": [
      "16-20",
      "Post-bac",
      "Adultes"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire",
      "Études sup.",
      "Entreprise"
    ],
    "description_courte": "Dans un monde de livrables IA standardisés, quelle est ma valeur propre ?",
    "description": "Dans un monde de livrables IA standardisés, quelle est ma valeur propre ? 3-5 éléments irréductibles (expertise pointue, jugement contextuel, relations de confiance, créativité signée). Version post-bac : manifeste stylistique professionnel disciplinaire.",
    "apprentissage_cle": "L'IA augmente la valeur de ce qui est uniquement humain. La voix singulière devient un capital rare."
  },
  {
    "id": "C06",
    "titre": "Entretien d'embauche à l'ère IA",
    "phase": "Construire",
    "public": [
      "16-20",
      "Post-bac"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Petit"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire",
      "Études sup."
    ],
    "description_courte": "Jeu de rôle en 3 temps : entretien par \"IA de screening\", par recruteur humain, comparaison.",
    "description": "Jeu de rôle en 3 temps : entretien par \"IA de screening\", par recruteur humain, comparaison. Usage IA dans le recrutement (screening CV, analyse vidéo). Formation pratique à aborder un entretien mené par IA.",
    "apprentissage_cle": "Les processus de recrutement utilisent massivement l'IA. Comprendre leurs logiques est essentiel pour se préparer."
  },
  {
    "id": "C07",
    "titre": "Identité numérique et CV à l'ère IA",
    "phase": "Construire",
    "public": [
      "16-20",
      "Post-bac"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire",
      "Études sup."
    ],
    "description_courte": "Analyse critique de son propre CV et trace numérique comme le ferait une IA.",
    "description": "Analyse critique de son propre CV et trace numérique comme le ferait une IA. Reformulation pour être \"lu correctement\" sans trahir son identité. Où est la limite entre optimisation légitime et déformation de soi ?",
    "apprentissage_cle": "Notre identité professionnelle est de plus en plus médiée par les IA. Se présenter clairement sans céder à l'uniformisation est un exercice d'équilibre."
  },
  {
    "id": "C08",
    "titre": "Entreprendre avec l'IA",
    "phase": "Construire",
    "public": [
      "16-20",
      "Post-bac"
    ],
    "duree": "Projet",
    "duree_detail": "1-2h (ados) / Projet (post-bac)",
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire",
      "Études sup."
    ],
    "description_courte": "Brainstorming : quels services/produits deviennent possibles ? Nouveaux métiers (prompt engineer, IA auditor).",
    "description": "Brainstorming : quels services/produits deviennent possibles ? Nouveaux métiers (prompt engineer, IA auditor). Pitch de 3 minutes sur une idée entrepreneuriale. Version post-bac : méthodologie de détection d'opportunités dans un secteur, prototype conceptuel.",
    "apprentissage_cle": "L'IA ouvre un cycle d'innovation comparable à internet. Les opportunités sont accessibles à qui les cherche avec méthode."
  },
  {
    "id": "C09",
    "titre": "Créer avec l'IA (projet créatif préservant la voix)",
    "phase": "Construire",
    "public": [
      "16-20",
      "Post-bac"
    ],
    "duree": "Projet",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire",
      "Études sup."
    ],
    "description_courte": "Projet d'écriture ou de création sur sujet libre.",
    "description": "Projet d'écriture ou de création sur sujet libre. Contrainte : utiliser l'IA comme assistant (brainstorming, reformulation, critique), mais produire une œuvre à voix propre identifiable. Évaluation par les pairs. Version post-bac : livrable professionnel de haut niveau avec journal de co-production détaillé.",
    "apprentissage_cle": "Utiliser l'IA sans perdre sa singularité est un art qui demande de la pratique. La qualité dépend autant du livrable que de la capacité à documenter la démarche."
  },
  {
    "id": "C10",
    "titre": "Compétences d'avenir 2030",
    "phase": "Construire",
    "public": [
      "16-20",
      "Post-bac"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire",
      "Études sup."
    ],
    "description_courte": "Analyse prospective : compétences remplaçables par l'IA vs compétences complémentaires à l'IA.",
    "description": "Analyse prospective : compétences remplaçables par l'IA vs compétences complémentaires à l'IA. Portfolio personnel des compétences à développer en priorité. Version post-bac : plan de développement sur 3-5 ans.",
    "apprentissage_cle": "Le marché valorisera ce qui résiste à l'automatisation : jugement, créativité contextuelle, relation humaine, éthique."
  },
  {
    "id": "C11",
    "titre": "Plan d'action et contrat personnel",
    "phase": "Construire",
    "public": [
      "16-20",
      "Post-bac",
      "Adultes"
    ],
    "duree": "1-2h",
    "duree_detail": "30-60min (adultes) / 1-2h (ados/post-bac)",
    "groupe": [
      "Moyen"
    ],
    "preparation": "Légère",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire",
      "Études sup.",
      "Entreprise"
    ],
    "description_courte": "Version adultes : plan à 30 jours — 3 usages semaine 1, 2 formations, 1 projet, critères mesurables, engagement public…",
    "description": "Version adultes : plan à 30 jours — 3 usages semaine 1, 2 formations, 1 projet, critères mesurables, engagement public + binôme. Version 16-20 / post-bac : contrat professionnel personnel (5-10 pages en 5 parties : études, avenir pro, compétences, lignes rouges, critères de relecture annuelle).",
    "apprentissage_cle": "Sans plan d'action précis, une formation ne change rien. S'engager par écrit est le moyen le plus puissant d'orienter son développement."
  },
  {
    "id": "C12",
    "titre": "Réseau professionnel IA",
    "phase": "Construire",
    "public": [
      "Post-bac"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Études sup."
    ],
    "description_courte": "Méthodologie : identification des communautés pertinentes (académiques, pro, associatives), veille efficace, présence…",
    "description": "Méthodologie : identification des communautés pertinentes (académiques, pro, associatives), veille efficace, présence publique (publications, prises de parole, open source), ressources partageables. Plan de développement réseau à 2 ans.",
    "apprentissage_cle": "Dans un champ en évolution rapide, le réseau bat l'expertise solitaire."
  },
  {
    "id": "D01",
    "titre": "La phrase mystère",
    "phase": "Demander",
    "public": [
      "7-10",
      "11-15"
    ],
    "duree": "<30min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Légère",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire"
    ],
    "description_courte": "On lit une seule phrase prise au hasard dans un livre. Débat sur ce qu'elle peut vouloir dire.",
    "description": "On lit une seule phrase prise au hasard dans un livre. Débat sur ce qu'elle peut vouloir dire. Puis lecture du paragraphe entier : la compréhension change radicalement. Version 11-15 : textes littéraires ambigus (ironie, métaphore).",
    "apprentissage_cle": "Une phrase isolée peut vouloir dire mille choses. Plus on donne de contexte à l'IA, mieux elle comprend."
  },
  {
    "id": "D02",
    "titre": "Consignes floues vs précises",
    "phase": "Demander",
    "public": [
      "7-10",
      "11-15"
    ],
    "duree": "<30min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Légère",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire"
    ],
    "description_courte": "Deux groupes reçoivent deux consignes : \"Dessine un animal\" vs \"Dessine un petit chat roux endormi sur un coussin bleu…",
    "description": "Deux groupes reçoivent deux consignes : \"Dessine un animal\" vs \"Dessine un petit chat roux endormi sur un coussin bleu près d'une fenêtre\". Comparaison des résultats.",
    "apprentissage_cle": "Un prompt vague produit des résultats imprévisibles. Plus je suis précis, plus j'obtiens ce que je veux."
  },
  {
    "id": "D03",
    "titre": "Atelier prompt engineering",
    "phase": "Demander",
    "public": [
      "11-15",
      "16-20"
    ],
    "duree": "30-60min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire"
    ],
    "description_courte": "Concours en binômes : obtenir de l'animateur-IA une production précise.",
    "description": "Concours en binômes : obtenir de l'animateur-IA une production précise. L'animateur répond \"littéralement\" à chaque prompt, révélant les imprécisions. Gagnants : ceux qui aboutissent en le moins d'essais.",
    "apprentissage_cle": "Un bon prompt contient : rôle, contexte, tâche, format, contraintes. C'est une vraie compétence."
  },
  {
    "id": "D04",
    "titre": "Le prompt inversé",
    "phase": "Demander",
    "public": [
      "11-15",
      "16-20"
    ],
    "duree": "30-60min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire"
    ],
    "description_courte": "L'animateur présente une production (texte, dessin, poème).",
    "description": "L'animateur présente une production (texte, dessin, poème). Les participants doivent rédiger le prompt qui aurait pu la produire. Version 16-20 : 3 prompts différents pour la même production, comparaison de l'équifinalité.",
    "apprentissage_cle": "Plusieurs chemins mènent au même résultat. Mais plus le prompt est précis, moins la zone de hasard est grande."
  },
  {
    "id": "D05",
    "titre": "Le prompt contaminé / injection",
    "phase": "Demander",
    "public": [
      "11-15",
      "16-20",
      "Post-bac"
    ],
    "duree": "1-2h",
    "duree_detail": "<30min (ados) / 1-2h (post-bac)",
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire",
      "Études sup."
    ],
    "description_courte": "L'animateur glisse discrètement une instruction cachée à un enfant-IA. Les autres détectent le moment de bascule.",
    "description": "L'animateur glisse discrètement une instruction cachée à un enfant-IA. Les autres détectent le moment de bascule. Version post-bac : conception de scénarios d'attaque sur chatbot fictif, analyse des contre-mesures.",
    "apprentissage_cle": "Une IA peut être manipulée par des instructions cachées dans des textes qu'elle traite. Le prompt injection est un vrai enjeu de sécurité."
  },
  {
    "id": "D06",
    "titre": "Masterclass prompt professionnel",
    "phase": "Demander",
    "public": [
      "16-20",
      "Post-bac"
    ],
    "duree": "2-4h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Importante",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire",
      "Études sup."
    ],
    "description_courte": "Atelier en 4 temps : analyse de prompts existants, production de prompts complexes sur cahier des charges, test croisé,…",
    "description": "Atelier en 4 temps : analyse de prompts existants, production de prompts complexes sur cahier des charges, test croisé, itération. Grille d'évaluation professionnelle (clarté, précision, contraintes, format, robustesse).",
    "apprentissage_cle": "Le prompt engineering est une ingénierie qui peut s'apprendre, se mesurer, se standardiser."
  },
  {
    "id": "D07",
    "titre": "Prompt pour études supérieures",
    "phase": "Demander",
    "public": [
      "16-20"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire"
    ],
    "description_courte": "Cas concrets : préparer un oral Parcoursup sans tricher, comprendre un chapitre non compris, préparer une dissertation,…",
    "description": "Cas concrets : préparer un oral Parcoursup sans tricher, comprendre un chapitre non compris, préparer une dissertation, s'entraîner à un examen. Où est la frontière aide / triche ?",
    "apprentissage_cle": "Un bon prompt scolaire cherche à apprendre, pas à contourner l'apprentissage."
  },
  {
    "id": "D08",
    "titre": "Prompt pour la recherche",
    "phase": "Demander",
    "public": [
      "Post-bac"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Études sup."
    ],
    "description_courte": "Cas concrets : synthèse de littérature, reformulation d'hypothèses, génération de contre-exemples, critique…",
    "description": "Cas concrets : synthèse de littérature, reformulation d'hypothèses, génération de contre-exemples, critique méthodologique, exploration interdisciplinaire. Production : guide de prompts pour chercheur.",
    "apprentissage_cle": "L'IA peut être un puissant amplificateur de recherche à condition d'être utilisée avec méthode."
  },
  {
    "id": "D09",
    "titre": "Bibliothèque de prompts métier",
    "phase": "Demander",
    "public": [
      "Post-bac",
      "Adultes"
    ],
    "duree": "2-4h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Études sup.",
      "Entreprise"
    ],
    "description_courte": "Participants regroupés par fonction/discipline.",
    "description": "Participants regroupés par fonction/discipline. Chaque groupe construit une bibliothèque de 15 prompts pour les tâches-clés : prompt + cas d'usage + résultat attendu + précautions. Production collective : playbook par fonction.",
    "apprentissage_cle": "Chaque métier a ses propres patterns de prompts efficaces. Les construire collectivement accélère toute l'organisation."
  },
  {
    "id": "D10",
    "titre": "10 prompts qui changent ma journée",
    "phase": "Demander",
    "public": [
      "Adultes"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "Chaque participant identifie 10 tâches récurrentes de sa semaine.",
    "description": "Chaque participant identifie 10 tâches récurrentes de sa semaine. Pour chacune, rédaction d'un prompt-modèle réutilisable, testé et affiné en temps réel. Production : bibliothèque personnelle de 10 prompts utilisables dès le lendemain.",
    "apprentissage_cle": "Le gain de productivité vient des prompts réutilisés, pas improvisés."
  },
  {
    "id": "D11",
    "titre": "Structure canonique du prompt",
    "phase": "Demander",
    "public": [
      "Adultes"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "Structure en 7 composants (rôle, contexte, tâche, contraintes, format, exemples, critères de succès) avec exemples…",
    "description": "Structure en 7 composants (rôle, contexte, tâche, contraintes, format, exemples, critères de succès) avec exemples métier. Atelier : production sur demande complexe (ex : synthèse pour comité de direction). Canevas de prompt professionnel.",
    "apprentissage_cle": "Le prompt n'est pas une question posée, c'est une commande passée."
  },
  {
    "id": "D12",
    "titre": "L'itération comme discipline",
    "phase": "Demander",
    "public": [
      "Adultes"
    ],
    "duree": "30-60min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Légère",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "Tâche complexe à résoudre en 20 minutes. Tenir un journal d'itération : prompt, résultat, critique, prompt amélioré.",
    "description": "Tâche complexe à résoudre en 20 minutes. Tenir un journal d'itération : prompt, résultat, critique, prompt amélioré. Restitution collective : cycles d'amélioration partagés.",
    "apprentissage_cle": "Les utilisateurs experts itèrent 3-5 fois ; les débutants abandonnent après 1."
  },
  {
    "id": "E01",
    "titre": "Le qui-dit-vrai",
    "phase": "Évaluer",
    "public": [
      "7-10",
      "11-15",
      "16-20",
      "Post-bac",
      "Adultes"
    ],
    "duree": "30-60min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Légère",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire",
      "Études sup.",
      "Entreprise"
    ],
    "description_courte": "Une personne pose une question. Une seule personne connaît la vraie réponse, les autres inventent.",
    "description": "Une personne pose une question. Une seule personne connaît la vraie réponse, les autres inventent. Le questionneur doit retrouver qui a dit la vérité. **Adaptations** : 7-10 : questions simples / 11-15 : questions sur leur orientation réelle / 16-20 : sujets pointus avec 2 min chrono / Post-bac : questions disciplinaires pointues / Adultes : questions pro (TVA, procédure légale, formule Excel). **Variantes** : indices de doute / sources à inventer / thème connu vs inconnu / à l'aveugle (écrit seul).",
    "apprentissage_cle": "Une réponse qui sonne vraie n'est pas forcément vraie. Plus le sujet est technique, plus il est difficile de détecter l'hallucination."
  },
  {
    "id": "E02",
    "titre": "Le vrai-faux-plausible",
    "phase": "Évaluer",
    "public": [
      "7-10",
      "11-15"
    ],
    "duree": "<30min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire"
    ],
    "description_courte": "15 affirmations : 5 vraies, 5 fausses, 5 plausibles mais fausses. Vote puis vérification en sources fiables.",
    "description": "15 affirmations : 5 vraies, 5 fausses, 5 plausibles mais fausses. Vote puis vérification en sources fiables.",
    "apprentissage_cle": "Beaucoup de \"vérités\" qu'on tient pour acquises sont en fait fausses. Il faut vérifier, même ce qui semble évident."
  },
  {
    "id": "E03",
    "titre": "Le perroquet inventeur",
    "phase": "Évaluer",
    "public": [
      "7-10"
    ],
    "duree": "<30min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire"
    ],
    "description_courte": "L'animateur joue un \"Super Robot\" qui répond aux questions sur les dinosaures.",
    "description": "L'animateur joue un \"Super Robot\" qui répond aux questions sur les dinosaures. Il donne 2 vraies réponses puis invente la 3e avec aplomb (\"Le T-Rex adorait manger des fraises sauvages\"). Les enfants vérifient dans un livre documentaire.",
    "apprentissage_cle": "Quand une affirmation est étonnante, on vérifie dans une vraie source. La confiance n'est pas une preuve."
  },
  {
    "id": "E04",
    "titre": "L'expert imposteur",
    "phase": "Évaluer",
    "public": [
      "7-10",
      "11-15",
      "16-20"
    ],
    "duree": "<30min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Légère",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire"
    ],
    "description_courte": "Un participant joue un \"grand expert\" sur un sujet qu'il ne connaît pas.",
    "description": "Un participant joue un \"grand expert\" sur un sujet qu'il ne connaît pas. Il répond avec assurance, vocabulaire technique, chiffres précis, références inventées. Les autres repèrent ce qui leur semble suspect.",
    "apprentissage_cle": "Le ton confiant et le vocabulaire technique ne sont jamais des preuves de véracité."
  },
  {
    "id": "E05",
    "titre": "La chasse aux contradictions",
    "phase": "Évaluer",
    "public": [
      "7-10",
      "11-15",
      "16-20"
    ],
    "duree": "30-60min",
    "duree_detail": "<30min (petits) / 30-60min (ados+)",
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire"
    ],
    "description_courte": "L'animateur raconte une histoire avec 3-4 contradictions volontaires. Les participants repèrent.",
    "description": "L'animateur raconte une histoire avec 3-4 contradictions volontaires. Les participants repèrent. Version 11-15 : contradictions à longue portée sur texte de 2 pages. Version 16-20 : texte de 5 pages avec failles précises, audit structuré en binômes.",
    "apprentissage_cle": "Plus une production d'IA est longue, plus elle risque d'être incohérente avec elle-même."
  },
  {
    "id": "E06",
    "titre": "Test de complaisance",
    "phase": "Évaluer",
    "public": [
      "7-10",
      "11-15"
    ],
    "duree": "<30min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Légère",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire"
    ],
    "description_courte": "Un participant joue une IA complaisante qui abonde toujours dans le sens de l'utilisateur (même sur l'absurde).",
    "description": "Un participant joue une IA complaisante qui abonde toujours dans le sens de l'utilisateur (même sur l'absurde). Puis on rejoue avec la consigne \"réponds honnêtement, même si ça ne fait pas plaisir\".",
    "apprentissage_cle": "Une IA complaisante peut nous conforter dans des opinions fausses ou dangereuses."
  },
  {
    "id": "E07",
    "titre": "Tribunal des sources",
    "phase": "Évaluer",
    "public": [
      "7-10",
      "11-15",
      "16-20",
      "Post-bac"
    ],
    "duree": "30-60min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire",
      "Études sup."
    ],
    "description_courte": "Une affirmation surprenante + plusieurs sources de qualité variable. Classement par fiabilité.",
    "description": "Une affirmation surprenante + plusieurs sources de qualité variable. Classement par fiabilité. **Adaptations** : 7-10 : 4 sources (blog, ami, article scientifique, pub) / 11-15 : sources de réseaux sociaux + conflit fiabilité/accessibilité / 16-20 : affirmation polémique + 8 sources dont IA / Post-bac : construction d'une doctrine personnelle de la source.",
    "apprentissage_cle": "Il y a un conflit entre facilité d'accès et fiabilité des sources."
  },
  {
    "id": "E08",
    "titre": "Confrontation multi-IA",
    "phase": "Évaluer",
    "public": [
      "11-15",
      "16-20",
      "Post-bac",
      "Adultes"
    ],
    "duree": "1-2h",
    "duree_detail": "30-60min (ados) / 1-2h (sup+)",
    "groupe": [
      "Moyen"
    ],
    "preparation": "Importante",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire",
      "Études sup.",
      "Entreprise"
    ],
    "description_courte": "L'animateur joue plusieurs IA avec biais différents sur la même question. Réponses divergentes.",
    "description": "L'animateur joue plusieurs IA avec biais différents sur la même question. Réponses divergentes. Analyse des convergences, divergences, angles morts. Production d'une synthèse critique supérieure aux réponses individuelles.",
    "apprentissage_cle": "Croiser sans intelligence ne fait qu'additionner les biais. Il faut une méthode d'analyse."
  },
  {
    "id": "E09",
    "titre": "Les questions piégées (biais)",
    "phase": "Évaluer",
    "public": [
      "7-10",
      "11-15"
    ],
    "duree": "<30min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Légère",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire"
    ],
    "description_courte": "Questions pour faire émerger les stéréotypes : \"Dessine un scientifique\" → souvent un homme à lunettes, \"Imagine une…",
    "description": "Questions pour faire émerger les stéréotypes : \"Dessine un scientifique\" → souvent un homme à lunettes, \"Imagine une infirmière\" → souvent une femme. Discussion sur les images mentales spontanées.",
    "apprentissage_cle": "L'IA n'est pas neutre, elle reflète les stéréotypes des textes et images sur lesquels elle a été entraînée."
  },
  {
    "id": "E10",
    "titre": "Détective des intentions cachées",
    "phase": "Évaluer",
    "public": [
      "7-10",
      "11-15"
    ],
    "duree": "<30min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire"
    ],
    "description_courte": "3 textes sur le même sujet (ex : les bonbons) avec intentions différentes : neutre, publicité, avertissement de…",
    "description": "3 textes sur le même sujet (ex : les bonbons) avec intentions différentes : neutre, publicité, avertissement de dentiste. Deviner qui a écrit quoi en repérant les mots qui trahissent l'intention.",
    "apprentissage_cle": "Selon comment on lui demande, une IA peut orienter ses réponses sans qu'on s'en rende compte."
  },
  {
    "id": "E11",
    "titre": "Et si je me trompais ? (humilité épistémique)",
    "phase": "Évaluer",
    "public": [
      "7-10",
      "11-15",
      "16-20"
    ],
    "duree": "30-60min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Légère",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire"
    ],
    "description_courte": "Chaque participant écrit une opinion dont il est sûr. Tirage au sort.",
    "description": "Chaque participant écrit une opinion dont il est sûr. Tirage au sort. Le groupe cherche sincèrement les meilleurs arguments contre. Version 16-20 : 3 convictions, analyse de leur origine (algorithmes, médias, pairs).",
    "apprentissage_cle": "Nos convictions sont souvent le produit de notre environnement informationnel. Les interroger est une hygiène intellectuelle."
  },
  {
    "id": "E12",
    "titre": "Prouve-le-moi",
    "phase": "Évaluer",
    "public": [
      "7-10",
      "11-15"
    ],
    "duree": "<30min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Légère",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire"
    ],
    "description_courte": "Un participant fait une affirmation.",
    "description": "Un participant fait une affirmation. Les autres ne peuvent répondre que par \"Comment tu le sais ?\", \"Peux-tu le prouver ?\", \"Source ?\". Version 11-15 : exercice continu pendant 30 minutes sur tout sujet.",
    "apprentissage_cle": "La demande de justification doit devenir un réflexe automatique avec une IA."
  },
  {
    "id": "E13",
    "titre": "Analyse stylistique des textes IA",
    "phase": "Évaluer",
    "public": [
      "11-15",
      "16-20",
      "Post-bac",
      "Adultes"
    ],
    "duree": "30-60min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Importante",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire",
      "Études sup.",
      "Entreprise"
    ],
    "description_courte": "Textes courts mélangés (humains et IA).",
    "description": "Textes courts mélangés (humains et IA). Identifier lesquels et justifier par les indices : structure trop régulière, vocabulaire lisse, absence d'opinion tranchée, tournures récurrentes (\"il est important de noter que…\"). Version Post-bac : 50 textes de 6-8 modèles différents, profil stylistique de chacun.",
    "apprentissage_cle": "Les textes d'IA ont des marqueurs stylistiques reconnaissables. Les repérer est devenu une compétence sociale et professionnelle."
  },
  {
    "id": "E14",
    "titre": "Le paradoxe du \"trop parfait\"",
    "phase": "Évaluer",
    "public": [
      "11-15",
      "16-20"
    ],
    "duree": "<30min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire"
    ],
    "description_courte": "Deux versions du même contenu : une avec imperfections (répétitions, tournures maladroites) et une parfaitement lisse.",
    "description": "Deux versions du même contenu : une avec imperfections (répétitions, tournures maladroites) et une parfaitement lisse. Laquelle inspire plus confiance ? Dans un contexte humain, les imperfections rassurent.",
    "apprentissage_cle": "La perfection formelle n'est pas un gage de vérité. Parfois, elle signale une production artificielle."
  },
  {
    "id": "E15",
    "titre": "Fact-checking compétitif",
    "phase": "Évaluer",
    "public": [
      "11-15",
      "16-20",
      "Post-bac"
    ],
    "duree": "30-60min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire",
      "Études sup."
    ],
    "description_courte": "L'animateur affirme 20-30 faits en temps limité (vrais, faux, déformés). Accès CDI/bibliothèque.",
    "description": "L'animateur affirme 20-30 faits en temps limité (vrais, faux, déformés). Accès CDI/bibliothèque. Vérification en équipes. Points selon rapidité, justesse, qualité des sources. Débriefing sur les méthodes gagnantes.",
    "apprentissage_cle": "Le fact-checking professionnel exige des méthodes adaptées. Elles s'apprennent et se partagent."
  },
  {
    "id": "E16",
    "titre": "Audit professionnel de production IA",
    "phase": "Évaluer",
    "public": [
      "16-20",
      "Post-bac",
      "Adultes"
    ],
    "duree": "2-4h",
    "duree_detail": "1-2h (ados/adultes) / 2-4h+ (post-bac)",
    "groupe": [
      "Petit"
    ],
    "preparation": "Importante",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire",
      "Études sup.",
      "Entreprise"
    ],
    "description_courte": "Document long (5-10 pages pour adultes, 20-30 pour post-bac) généré par IA avec erreurs volontaires : fausses…",
    "description": "Document long (5-10 pages pour adultes, 20-30 pour post-bac) généré par IA avec erreurs volontaires : fausses citations, chiffres faux, raisonnements défaillants, références fictives. Audit structuré par équipes avec accès documentaire. Rapport d'audit avec recommandations.",
    "apprentissage_cle": "Dans un monde où les productions IA vont proliférer, le fact-checking devient une compétence transversale critique. Valider sans vérifier engage votre responsabilité."
  },
  {
    "id": "E17",
    "titre": "Biais en pleine nature",
    "phase": "Évaluer",
    "public": [
      "11-15",
      "16-20",
      "Post-bac",
      "Adultes"
    ],
    "duree": "30-60min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Importante",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire",
      "Études sup.",
      "Entreprise"
    ],
    "description_courte": "Productions IA réelles (descriptions de métiers, histoires, recommandations, fiches de poste, évaluations).",
    "description": "Productions IA réelles (descriptions de métiers, histoires, recommandations, fiches de poste, évaluations). Identifier les biais (genre, âge, culture, classe sociale). Impact sur les décisions RH, commerciales, stratégiques.",
    "apprentissage_cle": "Les biais des IA sont partout dans ses productions, mais invisibles tant qu'on ne les cherche pas."
  },
  {
    "id": "E18",
    "titre": "IA et neutralité politique",
    "phase": "Évaluer",
    "public": [
      "11-15",
      "16-20",
      "Post-bac"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Importante",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire",
      "Études sup."
    ],
    "description_courte": "Questions sensibles (SMIC, immigration, jeunesse) avec réponses de plusieurs IA.",
    "description": "Questions sensibles (SMIC, immigration, jeunesse) avec réponses de plusieurs IA. Analyse des inflexions, tournures, points aveugles. Débat en plénière.",
    "apprentissage_cle": "Aucune IA n'est politiquement neutre. Ses biais reflètent les choix de ses concepteurs, les corpus d'entraînement et les garde-fous."
  },
  {
    "id": "E19",
    "titre": "Épistémologie de l'IA",
    "phase": "Évaluer",
    "public": [
      "Post-bac"
    ],
    "duree": "Projet",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Importante",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Études sup."
    ],
    "description_courte": "Textes de philosophie des sciences (Popper, Kuhn, Feyerabend). Qu'est-ce qu'un fait à l'ère des IA ?",
    "description": "Textes de philosophie des sciences (Popper, Kuhn, Feyerabend). Qu'est-ce qu'un fait à l'ère des IA ? Comment valider une connaissance produite par IA ? Prise de position épistémologique argumentée de 5 pages.",
    "apprentissage_cle": "L'IA pose un problème épistémologique inédit : distinguer le savoir validé du bruit statistiquement cohérent."
  },
  {
    "id": "E20",
    "titre": "Test de Turing inversé",
    "phase": "Évaluer",
    "public": [
      "16-20",
      "Post-bac"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Importante",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire",
      "Études sup."
    ],
    "description_courte": "20-30 textes mélangés (humains, IA, hybrides). Tri avec confidence score. Comptabilisation des taux de reconnaissance.",
    "description": "20-30 textes mélangés (humains, IA, hybrides). Tri avec confidence score. Comptabilisation des taux de reconnaissance. Comment classer les textes hybrides humain-IA ?",
    "apprentissage_cle": "Notre intuition à reconnaître \"l'IA vs l'humain\" est moins fiable qu'on ne le croit. La frontière devient floue dans les productions pro de qualité."
  },
  {
    "id": "E21",
    "titre": "Rhétorique et analyse discursive des LLM",
    "phase": "Évaluer",
    "public": [
      "Post-bac"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Études sup."
    ],
    "description_courte": "Corpus de réponses IA sur sujets polémiques.",
    "description": "Corpus de réponses IA sur sujets polémiques. Identification des procédés : équilibrage systématique, énumérations ternaires, modalisations (\"il est important de noter que...\"), clôtures consensuelles, évitements éthiques.",
    "apprentissage_cle": "Les LLM ont une rhétorique apprise, optimisée pour l'acceptabilité. Cette rhétorique peut lisser des enjeux qui mériteraient des prises de position."
  },
  {
    "id": "E22",
    "titre": "Forensique IA et médias synthétiques",
    "phase": "Évaluer",
    "public": [
      "16-20",
      "Post-bac"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Importante",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire",
      "Études sup."
    ],
    "description_courte": "Catégories : deepfakes, voice cloning, textes générés.",
    "description": "Catégories : deepfakes, voice cloning, textes générés. Méthodes de détection par modalité : stylométrie (texte), incohérences anatomiques/reflets (image), prosodie/respirations (audio). Collection d'exemples à classer.",
    "apprentissage_cle": "La détection des médias synthétiques est une course aux armements permanente. Il faut développer un réflexe de vigilance structurelle."
  },
  {
    "id": "E23",
    "titre": "Grand débat \"IA et démocratie\"",
    "phase": "Évaluer",
    "public": [
      "16-20",
      "Post-bac"
    ],
    "duree": "2-4h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Importante",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire",
      "Études sup."
    ],
    "description_courte": "Tables rondes simultanées : manipulation des élections, deepfakes politiques, positions politiques des IA, régulation.",
    "description": "Tables rondes simultanées : manipulation des élections, deepfakes politiques, positions politiques des IA, régulation. Production collective : déclaration citoyenne / article de tribune argumenté.",
    "apprentissage_cle": "L'IA est devenue un enjeu démocratique majeur. Les décisions structurantes se prennent maintenant."
  },
  {
    "id": "E24",
    "titre": "Détecter l'IA dans mes échanges",
    "phase": "Évaluer",
    "public": [
      "Adultes"
    ],
    "duree": "30-60min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Importante",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "Corpus d'emails, propositions commerciales, rapports, CV, réponses AO (mix humain/IA). Tenter de distinguer.",
    "description": "Corpus d'emails, propositions commerciales, rapports, CV, réponses AO (mix humain/IA). Tenter de distinguer. Quand ça compte-t-il ? Quelles conséquences pour la relation client, fournisseur, collaborateur ?",
    "apprentissage_cle": "De plus en plus de documents pro sont générés par IA. Savoir le suspecter influence nos décisions et négociations."
  },
  {
    "id": "E25",
    "titre": "Sources et responsabilité",
    "phase": "Évaluer",
    "public": [
      "Adultes"
    ],
    "duree": "2-4h",
    "duree_detail": "2-4h (réparti)",
    "groupe": [
      "Moyen"
    ],
    "preparation": "Légère",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "Exercice en continu sur une demi-journée : chaque affirmation produite par l'IA doit être accompagnée de : d'où vient…",
    "description": "Exercice en continu sur une demi-journée : chaque affirmation produite par l'IA doit être accompagnée de : d'où vient l'info, comment la vérifier, quelle est la responsabilité en cas d'erreur.",
    "apprentissage_cle": "Le réflexe de vérification doit devenir automatique, comme le fait de sauvegarder un document."
  },
  {
    "id": "M01",
    "titre": "Diagnostic maturité IA de mon équipe",
    "phase": "Piloter",
    "public": [
      "Adultes"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Petit"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "Grille de diagnostic en 6 dimensions : usages actuels, compétences, résistances, besoins, opportunités, risques.",
    "description": "Grille de diagnostic en 6 dimensions : usages actuels, compétences, résistances, besoins, opportunités, risques. Chaque manager établit le diagnostic de son équipe. Comparaison : quels écarts ? Quels leviers ? Diagnostic avec pistes d'action.",
    "apprentissage_cle": "Un manager qui agit sur un diagnostic fin déploie mieux qu'un manager uniformiste."
  },
  {
    "id": "M02",
    "titre": "Rôle du manager dans la diffusion IA",
    "phase": "Piloter",
    "public": [
      "Adultes"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Petit"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "Postures : sceptique, prescripteur, pionnier, facilitateur, régulateur.",
    "description": "Postures : sceptique, prescripteur, pionnier, facilitateur, régulateur. Jeu de rôle : un collaborateur avec demande IA (formation, refus, usage non autorisé, projet). Bonnes pratiques managériales.",
    "apprentissage_cle": "Le manager est le premier catalyseur ou le premier frein à la diffusion de l'IA."
  },
  {
    "id": "M03",
    "titre": "Identifier les opportunités de transformation",
    "phase": "Piloter",
    "public": [
      "Adultes"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Petit"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "Matrice de priorisation : impact / effort / risque. Notation des cas d'usage de l'équipe.",
    "description": "Matrice de priorisation : impact / effort / risque. Notation des cas d'usage de l'équipe. Sélection des 3 projets prioritaires. Portefeuille de projets IA priorisé.",
    "apprentissage_cle": "Face à l'infinité des usages IA possibles, prioriser est la compétence managériale clé. Faire 3 projets bien vaut mieux que 10 mal."
  },
  {
    "id": "M04",
    "titre": "Acculturer son équipe",
    "phase": "Piloter",
    "public": [
      "Adultes"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Petit"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "Dispositifs : formation, ateliers internes, communautés de pratique, champions IA, démonstrations, newsletters, projets…",
    "description": "Dispositifs : formation, ateliers internes, communautés de pratique, champions IA, démonstrations, newsletters, projets pilotes. Construction d'un plan d'acculturation sur 6 mois.",
    "apprentissage_cle": "L'acculturation n'est pas un événement mais un processus combinant plusieurs dispositifs."
  },
  {
    "id": "M05",
    "titre": "Gestion des résistances",
    "phase": "Piloter",
    "public": [
      "Adultes"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Petit"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "Typologie des résistances : peur de l'obsolescence, éthique, qualité, effort d'apprentissage, identité, idéologie.",
    "description": "Typologie des résistances : peur de l'obsolescence, éthique, qualité, effort d'apprentissage, identité, idéologie. Comment écouter, accompagner, refuser ? Jeux de rôle : conversations difficiles avec des résistants.",
    "apprentissage_cle": "Les résistances ne sont pas des obstacles à contourner mais des signaux à écouter. Beaucoup sont légitimes."
  },
  {
    "id": "M06",
    "titre": "Pilotage des investissements IA",
    "phase": "Piloter",
    "public": [
      "Adultes"
    ],
    "duree": "2-4h",
    "duree_detail": null,
    "groupe": [
      "Petit"
    ],
    "preparation": "Importante",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "Décisions : outils, licences, formations, recrutements, R&D, partenariats. Grille d'aide à la décision.",
    "description": "Décisions : outils, licences, formations, recrutements, R&D, partenariats. Grille d'aide à la décision. Business case d'un déploiement IA avec chiffrage réaliste. Présentation à un \"comité d'investissement\" simulé.",
    "apprentissage_cle": "Les investissements IA requièrent une analyse spécifique : ROI réels mais difficiles à chiffrer, risques non linéaires."
  },
  {
    "id": "M07",
    "titre": "Culture d'expérimentation",
    "phase": "Piloter",
    "public": [
      "Adultes"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Petit"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "Pratiques : droits à l'erreur, budget temps dédié, restitution rapide, partage systématique.",
    "description": "Pratiques : droits à l'erreur, budget temps dédié, restitution rapide, partage systématique. Conception d'un rituel d'équipe (mensuel ou trimestriel) dédié à l'expérimentation IA.",
    "apprentissage_cle": "Les équipes qui progressent ne sont pas celles qui forment le plus, mais celles qui expérimentent le plus, dans un cadre protégeant l'erreur."
  },
  {
    "id": "M08",
    "titre": "Construire sa vision IA",
    "phase": "Piloter",
    "public": [
      "Adultes"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Petit"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "Chaque manager/dirigeant rédige sa vision IA à 2-3 ans : ambitions, principes, lignes rouges, investissements,…",
    "description": "Chaque manager/dirigeant rédige sa vision IA à 2-3 ans : ambitions, principes, lignes rouges, investissements, trajectoire. Format : 1 page. Partage, confrontation, ajustement.",
    "apprentissage_cle": "Sans vision IA explicite, un dirigeant subit. Avec une vision, il oriente."
  },
  {
    "id": "O01",
    "titre": "Communautés de pratique",
    "phase": "Contribuer",
    "public": [
      "Post-bac",
      "Adultes"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Études sup.",
      "Entreprise"
    ],
    "description_courte": "Format \"communauté de pratique\" appliqué à l'IA : objectifs, rythme, animation, productions.",
    "description": "Format \"communauté de pratique\" appliqué à l'IA : objectifs, rythme, animation, productions. Constituer une communauté dans son organisation. Construction de la première rencontre. Charte et calendrier.",
    "apprentissage_cle": "La formation individuelle plafonne rapidement. La communauté fait progresser tout le monde en continu, sans dépendre des budgets."
  },
  {
    "id": "O02",
    "titre": "Champions IA",
    "phase": "Contribuer",
    "public": [
      "Adultes"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Petit"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "Sélection et formation des \"champions IA\" : rôle, légitimité, temps alloué, animation, reconnaissance.",
    "description": "Sélection et formation des \"champions IA\" : rôle, légitimité, temps alloué, animation, reconnaissance. Qui seraient les bons champions dans l'entreprise ? Charte des champions IA.",
    "apprentissage_cle": "Les champions sont le maillon manquant entre formation officielle et usage quotidien. Bien organisés, ils multiplient la diffusion par 3-5."
  },
  {
    "id": "O03",
    "titre": "Partage d'expérience structuré",
    "phase": "Contribuer",
    "public": [
      "Adultes"
    ],
    "duree": "30-60min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "Format régulier (mensuel/bimensuel) de partage IA : format, durée, animation, productions.",
    "description": "Format régulier (mensuel/bimensuel) de partage IA : format, durée, animation, productions. Test en direct : chacun partage un cas concret en 5 minutes. Débriefing sur ce qui fonctionne.",
    "apprentissage_cle": "Le partage structuré transforme l'expérience individuelle en ressource commune."
  },
  {
    "id": "O04",
    "titre": "Évaluation continue des usages",
    "phase": "Contribuer",
    "public": [
      "Adultes"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Petit"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "Indicateurs pertinents pour l'adoption et l'impact de l'IA : usage (fréquence, typologie), qualité…",
    "description": "Indicateurs pertinents pour l'adoption et l'impact de l'IA : usage (fréquence, typologie), qualité (satisfaction, erreurs), impact (gains mesurés, projets), risques (incidents, non-conformités). Tableau de bord IA adapté.",
    "apprentissage_cle": "Ce qui n'est pas mesuré n'est pas piloté."
  },
  {
    "id": "O05",
    "titre": "Mentorat croisé intergénérationnel",
    "phase": "Contribuer",
    "public": [
      "Adultes"
    ],
    "duree": "30-60min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Légère",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "Juniors digitaux accompagnent les seniors sur l'usage ; seniors accompagnent les juniors sur le jugement métier et les…",
    "description": "Juniors digitaux accompagnent les seniors sur l'usage ; seniors accompagnent les juniors sur le jugement métier et les risques. Constitution de binômes pilotes. Charte de mentorat croisé.",
    "apprentissage_cle": "Le mentorat croisé transforme les écarts générationnels en ressources mutuelles."
  },
  {
    "id": "O06",
    "titre": "Formation continue personnelle",
    "phase": "Contribuer",
    "public": [
      "Adultes"
    ],
    "duree": "30-60min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Légère",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "Méthodologie : sources de qualité, rythme, formats, évaluation personnelle.",
    "description": "Méthodologie : sources de qualité, rythme, formats, évaluation personnelle. Plan personnel d'apprentissage continu à 12 mois. L'IA évolue trop vite pour qu'une formation ponctuelle suffise.",
    "apprentissage_cle": "La compétence du futur est celle d'apprendre en continu."
  },
  {
    "id": "O07",
    "titre": "Contribuer à la recherche et à la vulgarisation",
    "phase": "Contribuer",
    "public": [
      "Post-bac"
    ],
    "duree": "Projet",
    "duree_detail": null,
    "groupe": [
      "Petit"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Études sup."
    ],
    "description_courte": "Contribution écrite à l'écosystème : abstract/plan d'article de recherche, étude empirique disciplinaire, veille…",
    "description": "Contribution écrite à l'écosystème : abstract/plan d'article de recherche, étude empirique disciplinaire, veille organisée publiable, contribution open source pédagogique (fiche, module, tutoriel, dataset, benchmark), tribune professionnelle, engagement dans un collectif existant.",
    "apprentissage_cle": "Contribuer à la connaissance collective sur l'IA est à la fois un acte citoyen, un levier de visibilité professionnelle, et une manière concrète de faire évoluer les pratiques."
  },
  {
    "id": "P01",
    "titre": "La suite logique contextuelle",
    "phase": "Produire",
    "public": [
      "7-10",
      "11-15"
    ],
    "duree": "<30min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire"
    ],
    "description_courte": "À partir d'un contexte donné, les enfants ordonnent des mots/images pour créer une suite logique.",
    "description": "À partir d'un contexte donné, les enfants ordonnent des mots/images pour créer une suite logique. Le même jeu peut produire des ordres différents selon le contexte. Version 11-15 : estimation de probabilités chiffrées.",
    "apprentissage_cle": "L'IA prédit la suite la plus probable en fonction de ce qui précède. Le contexte change la prédiction."
  },
  {
    "id": "P02",
    "titre": "La chaîne de prédiction collective",
    "phase": "Produire",
    "public": [
      "7-10",
      "11-15"
    ],
    "duree": "<30min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Légère",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire"
    ],
    "description_courte": "L'animateur écrit le début d'une phrase. Chaque participant propose le mot suivant avec justification.",
    "description": "L'animateur écrit le début d'une phrase. Chaque participant propose le mot suivant avec justification. Version 11-15 : on note toutes les options à chaque étape et on trace l'arbre complet (3^10 = 59 049 possibilités).",
    "apprentissage_cle": "L'IA construit ses phrases mot par mot. L'espace des réponses possibles est astronomique."
  },
  {
    "id": "P03",
    "titre": "Le téléphone arabe sémantique",
    "phase": "Produire",
    "public": [
      "7-10",
      "11-15"
    ],
    "duree": "<30min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Légère",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire"
    ],
    "description_courte": "Variante du téléphone arabe : chaque participant ne peut transmettre que 5 mots maximum.",
    "description": "Variante du téléphone arabe : chaque participant ne peut transmettre que 5 mots maximum. Comparaison du message original et final. Version 11-15 : traduction successive en langues étrangères.",
    "apprentissage_cle": "L'IA doit \"compresser\" l'information. Chaque passage par une couche induit des pertes."
  },
  {
    "id": "P04",
    "titre": "La machine humaine à compléter",
    "phase": "Produire",
    "public": [
      "7-10"
    ],
    "duree": "<30min",
    "duree_detail": null,
    "groupe": [
      "Petit"
    ],
    "preparation": "Légère",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire"
    ],
    "description_courte": "Une file de 4-5 enfants : chacun reçoit une phrase, chuchote 3 suggestions avec probabilités au suivant qui choisit et…",
    "description": "Une file de 4-5 enfants : chacun reçoit une phrase, chuchote 3 suggestions avec probabilités au suivant qui choisit et enrichit. Architecture en couches incarnée.",
    "apprentissage_cle": "À chaque étape, plusieurs choix sont possibles. L'IA choisit toujours selon des probabilités."
  },
  {
    "id": "P05",
    "titre": "Le détective des indices (few-shot)",
    "phase": "Produire",
    "public": [
      "7-10",
      "11-15"
    ],
    "duree": "<30min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Légère",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire"
    ],
    "description_courte": "L'animateur donne 3 exemples (chat→chats, maison→maisons, oiseau→oiseaux). Les enfants déduisent la règle.",
    "description": "L'animateur donne 3 exemples (chat→chats, maison→maisons, oiseau→oiseaux). Les enfants déduisent la règle. Puis exception piégeuse (cheval→chevaux). Version 11-15 : multiples contre-exemples successifs.",
    "apprentissage_cle": "L'IA apprend par exemples. Si elle n'en a pas vu assez, elle généralise à faux."
  },
  {
    "id": "P06",
    "titre": "La température réglable",
    "phase": "Produire",
    "public": [
      "7-10",
      "11-15"
    ],
    "duree": "30-60min",
    "duree_detail": "<30min (petits) / 30-60min (ados)",
    "groupe": [
      "Moyen"
    ],
    "preparation": "Légère",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire"
    ],
    "description_courte": "Même question ouverte avec 3 réponses successives : sage / moyenne / folle.",
    "description": "Même question ouverte avec 3 réponses successives : sage / moyenne / folle. Version 11-15 : 4 niveaux explicites (0, 0.3, 0.7, 1.5) sur tâche d'écriture. Quand voudrais-je chaque niveau ?",
    "apprentissage_cle": "La \"créativité\" d'une IA est un paramètre réglable. Pour un devoir scientifique : basse. Pour brainstormer : haute."
  },
  {
    "id": "P07",
    "titre": "Le perroquet savant",
    "phase": "Produire",
    "public": [
      "7-10",
      "11-15",
      "16-20"
    ],
    "duree": "<30min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Légère",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire"
    ],
    "description_courte": "Un enfant joue le \"perroquet\". Les autres lisent des extraits pendant 5 minutes.",
    "description": "Un enfant joue le \"perroquet\". Les autres lisent des extraits pendant 5 minutes. Le perroquet répond aux questions en piochant uniquement dans ce qu'il a entendu. Version 11-15 : questions qui nécessitent de combiner deux domaines. Version 16-20 : défi créatif avec contrainte inédite, comparaison avec production IA.",
    "apprentissage_cle": "L'IA recombine ce qu'elle a vu, parfois brillamment, parfois absurdement. Elle excelle en recombinaison, échoue sur la vraie originalité."
  },
  {
    "id": "P08",
    "titre": "Le raisonnement à voix haute",
    "phase": "Produire",
    "public": [
      "11-15",
      "16-20",
      "Post-bac"
    ],
    "duree": "30-60min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Scolaire",
      "Études sup."
    ],
    "description_courte": "Problème logique. Deux conditions : réponse instantanée vs verbalisation étape par étape.",
    "description": "Problème logique. Deux conditions : réponse instantanée vs verbalisation étape par étape. Comparaison des taux de réussite. Version post-bac : ajout du tree-of-thought (exploration de plusieurs pistes).",
    "apprentissage_cle": "Forcer l'IA (et nous-mêmes) à raisonner étape par étape améliore la qualité. D'où l'efficacité du chain-of-thought prompting."
  },
  {
    "id": "P09",
    "titre": "Plongée dans le transformer",
    "phase": "Produire",
    "public": [
      "Post-bac"
    ],
    "duree": "2-4h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Importante",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Études sup."
    ],
    "description_courte": "Animation concrète du mécanisme d'attention. Chaque mot est un participant.",
    "description": "Animation concrète du mécanisme d'attention. Chaque mot est un participant. Pour chaque mot : \"avec quels autres dois-tu dialoguer ?\". On trace des flèches pondérées. Discussion : que se passe-t-il pour une phrase longue ou ambiguë ?",
    "apprentissage_cle": "Le mécanisme d'attention, au cœur des LLM modernes, permet à chaque mot de \"regarder\" simultanément tous les autres."
  },
  {
    "id": "P10",
    "titre": "Échantillonnage et décodage",
    "phase": "Produire",
    "public": [
      "Post-bac"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Études sup."
    ],
    "description_courte": "Exploration des méthodes de décodage : greedy, beam search, top-k, top-p (nucleus), min-p, contrastive decoding.",
    "description": "Exploration des méthodes de décodage : greedy, beam search, top-k, top-p (nucleus), min-p, contrastive decoding. Simulation manuelle sur un même prompt. Pour quel usage, quelle méthode ?",
    "apprentissage_cle": "Le \"choix\" du mot suivant par un LLM est une décision technique paramétrable."
  },
  {
    "id": "P11",
    "titre": "Atelier RAG (Retrieval-Augmented Generation)",
    "phase": "Produire",
    "public": [
      "Post-bac",
      "Adultes"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Petit"
    ],
    "preparation": "Importante",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Études sup.",
      "Entreprise"
    ],
    "description_courte": "Simulation d'un système RAG. Un \"LLM humain\" doit répondre à des questions pointues.",
    "description": "Simulation d'un système RAG. Un \"LLM humain\" doit répondre à des questions pointues. Un \"retriever humain\" avec 30 fiches sélectionne les 3 plus pertinentes. Observation des succès et échecs (mauvaise fiche, contradictions, absence).",
    "apprentissage_cle": "Un LLM \"augmenté\" par RAG est aujourd'hui l'architecture la plus performante pour les usages pro. Mais la qualité dépend entièrement du retriever."
  },
  {
    "id": "P12",
    "titre": "Scaling laws et émergence",
    "phase": "Produire",
    "public": [
      "Post-bac"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Importante",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Études sup."
    ],
    "description_courte": "Papers clés (Kaplan, Chinchilla, \"Are Emergent Abilities a Mirage?\"). Débats : plafond des scaling laws ?",
    "description": "Papers clés (Kaplan, Chinchilla, \"Are Emergent Abilities a Mirage?\"). Débats : plafond des scaling laws ? Émergence réelle ou artefact ? Prochaines ruptures ? AGI proches ou mirage ? Prise de position argumentée.",
    "apprentissage_cle": "Les trajectoires de progrès des LLM sont débattues parmi les experts. Se forger une opinion argumentée oriente ses choix d'investissement."
  },
  {
    "id": "P13",
    "titre": "Reasoning models et multimodalité",
    "phase": "Produire",
    "public": [
      "Post-bac"
    ],
    "duree": "2-4h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Importante",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Études sup."
    ],
    "description_courte": "Présentation des reasoning models (o1, o3, DeepSeek R1, Claude extended thinking) et de la multimodalité…",
    "description": "Présentation des reasoning models (o1, o3, DeepSeek R1, Claude extended thinking) et de la multimodalité (GPT-4o, Claude vision, Gemini). Comparatifs sur même problème. Typologie des tâches par type de modèle optimal.",
    "apprentissage_cle": "Les reasoning models changent la donne pour les tâches complexes. La multimodalité transforme les possibles professionnels."
  },
  {
    "id": "P14",
    "titre": "Benchmarks et évaluation",
    "phase": "Produire",
    "public": [
      "Post-bac"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Importante",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Études sup."
    ],
    "description_courte": "Principaux benchmarks (MMLU, HellaSwag, HumanEval, GSM8K) et leurs limites.",
    "description": "Principaux benchmarks (MMLU, HellaSwag, HumanEval, GSM8K) et leurs limites. Contamination des données, \"teaching to the test\". Concevoir un benchmark personnalisé pour un cas d'usage disciplinaire.",
    "apprentissage_cle": "Savoir évaluer un modèle pour son usage propre est plus utile que suivre les classements généraux."
  },
  {
    "id": "P15",
    "titre": "Hackathon productivité",
    "phase": "Produire",
    "public": [
      "Adultes"
    ],
    "duree": "2-4h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "Chaque participant chronométrée une tâche régulière sans IA, puis tente de l'accomplir avec IA.",
    "description": "Chaque participant chronométrée une tâche régulière sans IA, puis tente de l'accomplir avec IA. Comparaison des gains en temps ET en qualité. Tableau personnel des gains documenté.",
    "apprentissage_cle": "Le gain de l'IA n'est pas toujours là où on l'attend. Mesurer plutôt que croire est une hygiène professionnelle."
  },
  {
    "id": "P16",
    "titre": "Rédaction augmentée",
    "phase": "Produire",
    "public": [
      "Adultes"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "Matrice des usages : rédiger de zéro, améliorer un brouillon, reformuler, traduire, résumer, allonger, structurer.",
    "description": "Matrice des usages : rédiger de zéro, améliorer un brouillon, reformuler, traduire, résumer, allonger, structurer. Techniques et prompts-modèles pour chaque usage. Travail sur un vrai document en cours.",
    "apprentissage_cle": "L'IA est un collaborateur de rédaction puissant, mais le résultat final doit rester vôtre."
  },
  {
    "id": "P17",
    "titre": "Analyse et synthèse de volumes",
    "phase": "Produire",
    "public": [
      "Adultes"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Importante",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "Corpus de 5 rapports de 20 pages. Défi : synthèse comparative utile en 45 minutes.",
    "description": "Corpus de 5 rapports de 20 pages. Défi : synthèse comparative utile en 45 minutes. Techniques : résumé par document, comparaison structurée, extraction de données, identification de consensus/dissensus.",
    "apprentissage_cle": "L'IA excelle dans le traitement de volume. 2 jours → 2 heures, à condition de savoir orchestrer."
  },
  {
    "id": "P18",
    "titre": "Création et brainstorming",
    "phase": "Produire",
    "public": [
      "Adultes"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "Défi créatif métier : 30 angles de campagne, 20 objections, 15 scénarios de marché.",
    "description": "Défi créatif métier : 30 angles de campagne, 20 objections, 15 scénarios de marché. IA comme partenaire de divergence : température haute, changements de perspectives, mise en tension.",
    "apprentissage_cle": "Beaucoup utilisent l'IA comme un oracle (1 bonne réponse) alors qu'elle excelle en mode divergent (50 pistes)."
  },
  {
    "id": "P19",
    "titre": "Préparer réunions et décisions",
    "phase": "Produire",
    "public": [
      "Adultes"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "Cas concrets : entretien annuel difficile, questions d'un comité de direction, argumentaire de négociation.",
    "description": "Cas concrets : entretien annuel difficile, questions d'un comité de direction, argumentaire de négociation. Workflows détaillés avec IA (contexte, rôles, simulation, synthèse, points de vigilance). Canevas de préparation réutilisables.",
    "apprentissage_cle": "L'IA transforme la préparation des interactions humaines à haute valeur."
  },
  {
    "id": "S01",
    "titre": "Confidentialité et données sensibles",
    "phase": "Sécuriser",
    "public": [
      "Adultes"
    ],
    "duree": "30-60min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "Niveaux de confidentialité selon les outils (grand public, entreprise, API, déploiement privé).",
    "description": "Niveaux de confidentialité selon les outils (grand public, entreprise, API, déploiement privé). Classification des données de l'entreprise et matrice \"quelles données avec quels outils ?\". Politique personnelle de confidentialité.",
    "apprentissage_cle": "Toutes les IA ne se valent pas en matière de confidentialité. Chaque donnée a son outil."
  },
  {
    "id": "S02",
    "titre": "Panorama réglementaire (RGPD, AI Act)",
    "phase": "Sécuriser",
    "public": [
      "Post-bac",
      "Adultes"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Importante",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Études sup.",
      "Entreprise"
    ],
    "description_courte": "Présentation pratique : RGPD et IA, AI Act européen (catégories de risque, obligations), secteurs réglementés…",
    "description": "Présentation pratique : RGPD et IA, AI Act européen (catégories de risque, obligations), secteurs réglementés (santé, finance, RH), droit du travail et IA. Checklist de conformité par fonction. Version Post-bac : approche comparée UE/US/Chine.",
    "apprentissage_cle": "Le cadre réglementaire se structure rapidement. La conformité est un avantage compétitif autant qu'une obligation."
  },
  {
    "id": "S03",
    "titre": "Prompts à risques",
    "phase": "Sécuriser",
    "public": [
      "Adultes"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "15 prompts-exemples à évaluer (vert/orange/rouge) sur : confidentialité, RGPD, biais, PI, réputation.",
    "description": "15 prompts-exemples à évaluer (vert/orange/rouge) sur : confidentialité, RGPD, biais, PI, réputation. Discussion et production d'une charte des prompts responsables adaptée à l'entreprise.",
    "apprentissage_cle": "Savoir ce qu'on ne doit PAS demander à une IA est aussi important que savoir ce qu'on peut."
  },
  {
    "id": "S04",
    "titre": "Prompts et données d'entreprise",
    "phase": "Sécuriser",
    "public": [
      "Adultes"
    ],
    "duree": "30-60min",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Moyenne",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "Modalités d'usage : copier-coller (attention), upload, RAG intégré (Copilot, NotebookLM, Claude Projects), plateformes…",
    "description": "Modalités d'usage : copier-coller (attention), upload, RAG intégré (Copilot, NotebookLM, Claude Projects), plateformes privées. Pour plusieurs cas métier concrets, identifier la meilleure modalité selon les règles de confidentialité.",
    "apprentissage_cle": "Utiliser l'IA avec les données d'entreprise démultiplie la valeur — mais ouvre des risques spécifiques."
  },
  {
    "id": "S05",
    "titre": "Red-teaming et vulnérabilités",
    "phase": "Sécuriser",
    "public": [
      "Post-bac",
      "Adultes"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Importante",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Études sup.",
      "Entreprise"
    ],
    "description_courte": "Attaques : prompt injection directe/indirecte, jailbreaking, data exfiltration, model inversion, adversarial examples.",
    "description": "Attaques : prompt injection directe/indirecte, jailbreaking, data exfiltration, model inversion, adversarial examples. Atelier : conception d'attaques sur système fictif (instructions système, outils connectés, données). Évaluation des mitigations.",
    "apprentissage_cle": "Le red-teaming IA est un métier émergent. Comprendre les attaques est la condition pour concevoir des systèmes robustes."
  },
  {
    "id": "S06",
    "titre": "Charte d'usage collective",
    "phase": "Sécuriser",
    "public": [
      "Adultes"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Légère",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "Élaboration collective d'une charte d'usage pour l'entreprise ou l'équipe.",
    "description": "Élaboration collective d'une charte d'usage pour l'entreprise ou l'équipe. Structure : principes, ce qu'on fait, ce qu'on ne fait pas, transparence, responsabilité, ressources. Débat et production v1.0.",
    "apprentissage_cle": "Une charte n'est pas un document administratif mais une conversation continue."
  },
  {
    "id": "S07",
    "titre": "Propriété intellectuelle et IA",
    "phase": "Sécuriser",
    "public": [
      "Post-bac",
      "Adultes"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Moyen"
    ],
    "preparation": "Importante",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Études sup.",
      "Entreprise"
    ],
    "description_courte": "Productions IA et droit d'auteur, usage de données protégées en entrée, contamination IP, signature des productions.",
    "description": "Productions IA et droit d'auteur, usage de données protégées en entrée, contamination IP, signature des productions. Cas pratiques et règles IP adaptées. Version Post-bac : étude des procès en cours (NYT v. OpenAI, artistes v. Stability AI).",
    "apprentissage_cle": "La PI à l'ère IA est un terrain juridique encore instable. Anticiper limite fortement les risques."
  },
  {
    "id": "S08",
    "titre": "Workshop incident IA",
    "phase": "Sécuriser",
    "public": [
      "Adultes"
    ],
    "duree": "1-2h",
    "duree_detail": null,
    "groupe": [
      "Petit"
    ],
    "preparation": "Importante",
    "themes": [
      "IA déconnecté"
    ],
    "contexte": [
      "Entreprise"
    ],
    "description_courte": "Études de cas réels d'incidents : fuite de données, biais discriminatoire public, hallucination ayant causé un dommage,…",
    "description": "Études de cas réels d'incidents : fuite de données, biais discriminatoire public, hallucination ayant causé un dommage, usage non déclaré découvert. Qu'aurait-il fallu faire avant / pendant / après ? Protocole d'incident minimal.",
    "apprentissage_cle": "Les incidents IA vont se multiplier. Les entreprises qui s'y préparent limitent les dégâts."
  }
];

// ============================================================
// CONSTANTES VISUELLES
// ============================================================

const PHASE_ORDER = [
  "Avant",
  "Demander",
  "Produire",
  "Évaluer",
  "Sécuriser",
  "Piloter",
  "Construire",
  "Contribuer",
];

const PHASE_DESCRIPTIONS = {
  Avant: "Comprendre ce qu'est l'IA",
  Demander: "Formuler des prompts",
  Produire: "Comprendre et utiliser le traitement",
  Évaluer: "Exercer son esprit critique",
  Sécuriser: "Risques et conformité",
  Piloter: "Managers et dirigeants",
  Construire: "Se positionner professionnellement",
  Contribuer: "Soutenir dans la durée et partager",
};

const FILTRES_INIT = {
  public: [],
  duree: [],
  groupe: [],
  preparation: [],
  themes: [],
  contexte: [],
  search: "",
};

// ============================================================
// COMPOSANTS
// ============================================================


// ============================================================
// COMPOSANTS
// ============================================================

function Header({ totalActivites, filteredCount, onNouvelleActivite, onReinitialiser, nbNativesModifiees, nbNativesSupprimees }) {
  const aDesModifs = nbNativesModifiees > 0 || nbNativesSupprimees > 0;
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-left">
          <div className="header-eyebrow">Ressources pédagogiques · IA générative</div>
          <h1 className="header-title">
            Catalogue des <em>activités</em> sans écran
          </h1>
          <p className="header-subtitle">
            Une bibliothèque éditoriale de {totalActivites} activités pour enseigner
            le fonctionnement, les usages et les limites des IA génératives.
          </p>
        </div>
        <div className="header-right">
          <div className="header-stat">
            <div className="header-stat-num">{filteredCount}</div>
            <div className="header-stat-label">affichées</div>
          </div>
          <div className="header-stat">
            <div className="header-stat-num">{totalActivites}</div>
            <div className="header-stat-label">activités</div>
          </div>
          <div className="header-stat">
            <div className="header-stat-num">{PHASE_ORDER.length}</div>
            <div className="header-stat-label">phases</div>
          </div>
          <button className="btn-nouvelle-activite" onClick={onNouvelleActivite}>
            ✚ Nouvelle activité
          </button>
          {aDesModifs && (
            <button className="btn-reinitialiser" onClick={onReinitialiser} title="Remettre les 105 activités d'origine">
              ↺ Réinitialiser
              <span className="btn-reinitialiser-badge">
                {nbNativesModifiees > 0 && `${nbNativesModifiees} modif.`}
                {nbNativesModifiees > 0 && nbNativesSupprimees > 0 && " · "}
                {nbNativesSupprimees > 0 && `${nbNativesSupprimees} supprimée${nbNativesSupprimees > 1 ? "s" : ""}`}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function FiltersPanel({ filtres, setFiltres, filteredCount, totalActivites, tousThemes }) {
  function toggle(key, value) {
    setFiltres((prev) => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  }

  function resetAll() {
    setFiltres(FILTRES_INIT);
  }

  const hasActive =
    Object.entries(filtres)
      .filter(([k]) => k !== "search")
      .some(([, arr]) => arr.length > 0) || filtres.search.trim() !== "";

  return (
    <aside className="panel panel-filters">
      <div className="panel-header">
        <h2 className="panel-title">Filtres</h2>
        <span className="panel-subtitle">{filteredCount} / {totalActivites}</span>
      </div>
      <div className="panel-body">
        {/* Recherche libre */}
        <div className="search-box">
          <span className="search-icon">⌕</span>
          <input
            className="search-input"
            type="text"
            placeholder="Recherche libre…"
            value={filtres.search}
            onChange={(e) => setFiltres((prev) => ({ ...prev, search: e.target.value }))}
          />
          {filtres.search && (
            <button className="search-clear" onClick={() => setFiltres((prev) => ({ ...prev, search: "" }))}>×</button>
          )}
        </div>

        <FilterGroup
          label="Public"
          values={["7-10", "11-15", "16-20", "Post-bac", "Adultes"]}
          active={filtres.public}
          onToggle={(v) => toggle("public", v)}
        />
        <FilterGroup
          label="Durée"
          values={["<30min", "30-60min", "1-2h", "2-4h", "Projet"]}
          active={filtres.duree}
          onToggle={(v) => toggle("duree", v)}
        />
        <FilterGroup
          label="Taille du groupe"
          values={["Petit", "Moyen", "Grand"]}
          active={filtres.groupe}
          onToggle={(v) => toggle("groupe", v)}
        />
        <FilterGroup
          label="Préparation"
          values={["Légère", "Moyenne", "Importante"]}
          active={filtres.preparation}
          onToggle={(v) => toggle("preparation", v)}
        />

        {/* THÈMES — filtre dynamique */}
        <ThemeFilterGroup
          active={filtres.themes}
          tousThemes={tousThemes}
          onToggle={(v) => toggle("themes", v)}
          onClear={() => setFiltres((prev) => ({ ...prev, themes: [] }))}
        />

        <FilterGroup
          label="Contexte"
          values={["Scolaire", "Études sup.", "Entreprise"]}
          active={filtres.contexte}
          onToggle={(v) => toggle("contexte", v)}
        />
      </div>
      <div className="panel-footer">
        {hasActive ? (
          <button className="btn-reset" onClick={resetAll}>Réinitialiser les filtres</button>
        ) : (
          <span className="panel-footnote">Sélectionnez des filtres ci-dessus</span>
        )}
      </div>
    </aside>
  );
}

function ThemeFilterGroup({ active, tousThemes, onToggle, onClear }) {
  // Tri alphabétique, "IA déconnecté" en premier
  const themesTriés = [...tousThemes].sort((a, b) => {
    if (a === "IA déconnecté") return -1;
    if (b === "IA déconnecté") return 1;
    return a.localeCompare(b, "fr");
  });

  return (
    <div className="filter-group">
      <div className="filter-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Thèmes</span>
        {active.length > 0 && (
          <button className="theme-filter-clear" onClick={onClear}>× effacer</button>
        )}
      </div>

      {/* Select pour ajouter un thème */}
      <select
        className="theme-filter-select"
        value=""
        onChange={(e) => { if (e.target.value) onToggle(e.target.value); }}
      >
        <option value="">— Sélectionner un thème —</option>
        {themesTriés.map((t) => (
          <option key={t} value={t} disabled={active.includes(t)}>
            {active.includes(t) ? `✓ ${t}` : t}
          </option>
        ))}
      </select>

      {/* Chips des thèmes actifs */}
      {active.length > 0 && (
        <div className="theme-filter-active">
          {active.map((t) => (
            <button
              key={t}
              className="theme-filter-chip"
              onClick={() => onToggle(t)}
              title="Retirer ce filtre"
            >
              {t} ×
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, values, active, onToggle }) {
  return (
    <div className="filter-group">
      <div className="filter-label">{label}</div>
      <div className="filter-values">
        {values.map((v) => (
          <button
            key={v}
            className={`filter-chip ${active.includes(v) ? "filter-chip-active" : ""}`}
            onClick={() => onToggle(v)}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// FONCTIONS D'EXPORT
// ============================================================

function telecharger(contenu, nomFichier, typeMime) {
  const blob = new Blob([contenu], { type: typeMime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomFichier;
  a.click();
  URL.revokeObjectURL(url);
}

function exportJSON(activites) {
  const data = {
    export: "Catalogue IA — Panier de séance",
    date: new Date().toLocaleDateString("fr-FR"),
    nombre: activites.length,
    activites: activites,
  };
  telecharger(JSON.stringify(data, null, 2), "seance-ia.json", "application/json");
}

function exportMarkdown(activites) {
  const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const lignes = [
    `# Fiche de séance — IA générative`,
    ``,
    `*Exporté le ${date} · ${activites.length} activité${activites.length > 1 ? "s" : ""}*`,
    ``,
    `---`,
    ``,
  ];

  activites.forEach((a, i) => {
    lignes.push(`## ${i + 1}. ${a.titre} \`${a.id}\``);
    lignes.push(``);
    lignes.push(`**Phase :** ${a.phase}  `);
    lignes.push(`**Public :** ${a.public.join(", ")}  `);
    lignes.push(`**Durée :** ${a.duree_detail || a.duree}  `);
    lignes.push(`**Groupe :** ${a.groupe.join(", ")}  `);
    lignes.push(`**Préparation :** ${a.preparation}  `);
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

function exportCSV(activites) {
  const entetes = ["id", "titre", "phase", "public", "duree", "groupe", "preparation", "themes", "contexte", "description_courte", "apprentissage_cle"];
  const echapper = (v) => `"${String(v).replace(/"/g, '""')}"`;

  const lignes = [
    entetes.join(";"),
    ...activites.map((a) =>
      [
        a.id,
        a.titre,
        a.phase,
        a.public.join(" | "),
        a.duree_detail || a.duree,
        a.groupe.join(" | "),
        a.preparation,
        a.themes.join(" | "),
        a.contexte.join(" | "),
        a.description_courte,
        a.apprentissage_cle,
      ]
        .map(echapper)
        .join(";")
    ),
  ];

  telecharger("\uFEFF" + lignes.join("\n"), "seance-ia.csv", "text/csv;charset=utf-8");
}

// ============================================================
// COMPOSANT CARTPANEL
// ============================================================

function CartPanel({ panier, setPanier, panierOrdre, setPanierOrdre, toutesActivites }) {
  const [exportOuvert, setExportOuvert] = React.useState(false);

  // Activités dans l'ordre du panier
  const activitesPanier = panierOrdre
    .filter((id) => panier.has(id))
    .map((id) => toutesActivites.find((a) => a.id === id))
    .filter(Boolean);

  const total = activitesPanier.length;

  function retirer(id) {
    setPanier((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setPanierOrdre((prev) => prev.filter((x) => x !== id));
  }

  function viderPanier() {
    setPanier(new Set());
    setPanierOrdre([]);
  }

  function monter(index) {
    if (index === 0) return;
    setPanierOrdre((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function descendre(index) {
    if (index === activitesPanier.length - 1) return;
    setPanierOrdre((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }

  return (
    <aside className="panel panel-cart">
      <div className="panel-header">
        <h2 className="panel-title">Panier de séance</h2>
        <span className="panel-subtitle">{total} activité{total !== 1 ? "s" : ""}</span>
      </div>
      <div className={`panel-body ${total === 0 ? "panel-body-empty" : ""}`}>
        {total === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">⊕</div>
            <p className="empty-state-text">
              Épinglez des activités depuis le catalogue pour composer votre séance.
            </p>
            <p className="empty-state-hint">Cliquez sur une carte puis "Épingler"</p>
          </div>
        ) : (
          <div className="cart-list">
            {activitesPanier.map((a, i) => (
              <div key={a.id} className="cart-item">
                <div className="cart-item-top">
                  <div className="cart-item-order">
                    <button
                      className="cart-order-btn"
                      onClick={() => monter(i)}
                      disabled={i === 0}
                      title="Monter"
                    >↑</button>
                    <span className="cart-item-num">{i + 1}</span>
                    <button
                      className="cart-order-btn"
                      onClick={() => descendre(i)}
                      disabled={i === total - 1}
                      title="Descendre"
                    >↓</button>
                  </div>
                  <span className="cart-item-id">{a.id}</span>
                  <button className="cart-item-remove" onClick={() => retirer(a.id)} title="Retirer">×</button>
                </div>
                <div className="cart-item-titre">{a.titre}</div>
                <div className="cart-item-meta">{a.duree} · {a.groupe.join(", ")} · {a.preparation}</div>
              </div>
            ))}
            {total > 1 && (
              <button className="btn-reset" style={{ marginTop: "12px" }} onClick={viderPanier}>
                Vider le panier
              </button>
            )}
          </div>
        )}
      </div>
      <div className="panel-footer">
        {total === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button className="btn btn-disabled" disabled>Exporter</button>
            <button className="btn btn-disabled" disabled>Imprimer / PDF</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div className="export-wrapper">
              <button
                className="btn"
                onClick={() => setExportOuvert((v) => !v)}
              >
                {exportOuvert ? "Fermer ▲" : "Exporter ▼"}
              </button>
              {exportOuvert && (
                <div className="export-menu">
                  <button
                    className="export-option"
                    onClick={() => { exportJSON(activitesPanier); setExportOuvert(false); }}
                  >
                    <span className="export-option-icon">&#123;&#125;</span>
                    <div>
                      <div className="export-option-label">JSON</div>
                      <div className="export-option-desc">Toutes les données · seance-ia.json</div>
                    </div>
                  </button>
                  <button
                    className="export-option"
                    onClick={() => { exportMarkdown(activitesPanier); setExportOuvert(false); }}
                  >
                    <span className="export-option-icon">&#9776;</span>
                    <div>
                      <div className="export-option-label">Markdown</div>
                      <div className="export-option-desc">Fiche lisible · seance-ia.md</div>
                    </div>
                  </button>
                  <button
                    className="export-option"
                    onClick={() => { exportCSV(activitesPanier); setExportOuvert(false); }}
                  >
                    <span className="export-option-icon">&#9783;</span>
                    <div>
                      <div className="export-option-label">CSV</div>
                      <div className="export-option-desc">Tableau Excel · seance-ia.csv</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
            <button className="btn btn-print" onClick={() => window.print()}>
              &#128438; Imprimer / PDF
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

function ActivityCard({ activite, onClick, estEpingle }) {
  return (
    <article
      className={`card ${estEpingle ? "card-epingle" : ""}`}
      onClick={() => onClick(activite)}
    >
      <div className="card-top">
        <span className="card-id">{activite.id}</span>
        <span className={`card-phase phase-${activite.phase.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}>
          {activite.phase}
        </span>
        {estEpingle && <span className="card-epingle-badge" title="Dans le panier">📌</span>}
        {activite._custom && <span className="card-custom-badge">✎ perso</span>}
        {activite._modifiee && !activite._custom && <span className="card-modifiee-badge">✎ modifiée</span>}
      </div>
      <h3 className="card-title">{activite.titre}</h3>
      <p className="card-desc">{activite.description_courte}</p>
      <div className="card-meta">
        <MetaItem label="Durée" value={activite.duree_detail || activite.duree} />
        <MetaItem label="Groupe" value={activite.groupe.join(" · ")} />
        <MetaItem label="Préparation" value={activite.preparation} />
      </div>
      <div className="card-tags">
        <div className="card-tags-row">
          {activite.public.map((p) => (
            <span key={p} className="tag tag-public">{p}</span>
          ))}
        </div>
        <div className="card-tags-row">
          {activite.themes.map((c) => (
            <span key={c} className="tag tag-theme">{c}</span>
          ))}
          {activite.contexte.map((c) => (
            <span key={c} className="tag tag-contexte">{c}</span>
          ))}
        </div>
      </div>
    </article>
  );
}

function MetaItem({ label, value }) {
  return (
    <div className="meta-item">
      <div className="meta-label">{label}</div>
      <div className="meta-value">{value}</div>
    </div>
  );
}

function PhaseSection({ phase, activites, onCardClick, panier }) {
  return (
    <section className="phase-section">
      <header className="phase-header">
        <div className="phase-header-left">
          <h2 className="phase-title">{phase}</h2>
          <p className="phase-desc">{PHASE_DESCRIPTIONS[phase]}</p>
        </div>
        <div className="phase-count">{activites.length}</div>
      </header>
      <div className="cards-grid">
        {activites.map((a) => (
          <ActivityCard
            key={a.id}
            activite={a}
            onClick={onCardClick}
            estEpingle={panier.has(a.id)}
          />
        ))}
      </div>
    </section>
  );
}

function DetailModal({ activite, onClose, panier, setPanier, panierOrdre, setPanierOrdre, onEdit, onDelete }) {
  if (!activite) return null;

  const estEpingle = panier.has(activite.id);

  function togglePanier() {
    if (panier.has(activite.id)) {
      setPanier((prev) => {
        const next = new Set(prev);
        next.delete(activite.id);
        return next;
      });
      setPanierOrdre((prev) => prev.filter((x) => x !== activite.id));
    } else {
      setPanier((prev) => {
        const next = new Set(prev);
        next.add(activite.id);
        return next;
      });
      setPanierOrdre((prev) => [...prev, activite.id]);
    }
  }

  function handleDelete() {
    if (window.confirm(`Supprimer définitivement "${activite.titre}" ?\n\nCette action est irréversible.`)) {
      onDelete(activite.id);
      onClose();
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-eyebrow">{activite.id} · {activite.phase}</div>
        <h2 className="modal-title">{activite.titre}</h2>
        <div className="modal-meta-row">
          <span className="modal-meta"><strong>Durée</strong> · {activite.duree_detail || activite.duree}</span>
          <span className="modal-meta"><strong>Groupe</strong> · {activite.groupe.join(", ")}</span>
          <span className="modal-meta"><strong>Préparation</strong> · {activite.preparation}</span>
        </div>
        <div className="modal-section">
          <h3 className="modal-section-title">Public</h3>
          <div className="modal-tags">
            {activite.public.map((p) => (
              <span key={p} className="tag tag-public tag-large">{p}</span>
            ))}
          </div>
        </div>
        <div className="modal-section">
          <h3 className="modal-section-title">Description</h3>
          <p className="modal-text">{activite.description}</p>
        </div>
        <div className="modal-section modal-apprentissage">
          <h3 className="modal-section-title">Apprentissage clé</h3>
          <p className="modal-text modal-text-italic">« {activite.apprentissage_cle} »</p>
        </div>
        <div className="modal-section">
          <h3 className="modal-section-title">Mots-clés</h3>
          <div className="modal-tags">
            {activite.themes.map((c) => (
              <span key={c} className="tag tag-theme tag-large">{c}</span>
            ))}
            {activite.contexte.map((c) => (
              <span key={c} className="tag tag-contexte tag-large">{c}</span>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className={`btn ${estEpingle ? "btn-retirer" : ""}`} onClick={togglePanier}>
            {estEpingle ? "✓ Retirer du panier" : "📌 Épingler au panier de séance"}
          </button>
          <div className="modal-custom-actions">
            <button className="btn-custom-edit" onClick={() => { onClose(); onEdit(activite); }}>
              ✎ Modifier
            </button>
            <button className="btn-custom-delete" onClick={handleDelete}>
              🗑 Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT FICHE IMPRIMABLE
// ============================================================

// ============================================================
// MODALE DE CHOIX : SAISIE MANUELLE OU IMPORT
// ============================================================

function ChoixImportModal({ onClose, onManuel, onImport }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-choix" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-eyebrow">Nouvelle activité</div>
        <h2 className="modal-title">Comment voulez-vous ajouter ?</h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "28px", lineHeight: "1.6" }}>
          Créez une activité en la saisissant manuellement, ou importez un fichier JSON ou Markdown contenant plusieurs activités à la fois.
        </p>
        <div className="choix-import-grid">
          <button className="choix-import-card" onClick={onManuel}>
            <span className="choix-import-icon">✍️</span>
            <span className="choix-import-label">Saisie manuelle</span>
            <span className="choix-import-desc">Remplir le formulaire pour créer une seule activité</span>
          </button>
          <button className="choix-import-card" onClick={onImport}>
            <span className="choix-import-icon">📂</span>
            <span className="choix-import-label">Importer un fichier</span>
            <span className="choix-import-desc">Charger un fichier .json ou .md avec plusieurs activités</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PARSERS D'IMPORT
// ============================================================

function parserJSON(texte) {
  const data = JSON.parse(texte);
  // Accepte { activites: [...] } (format export du catalogue) ou directement un tableau
  const liste = Array.isArray(data) ? data : (Array.isArray(data.activites) ? data.activites : null);
  if (!liste) throw new Error("Format JSON non reconnu. Attendu : un tableau ou { activites: [...] }");

  const CHAMPS_REQUIS = ["titre", "phase", "public", "duree", "groupe", "preparation", "themes", "contexte", "description_courte", "description", "apprentissage_cle"];
  return liste.map((a, i) => {
    for (const c of CHAMPS_REQUIS) {
      if (a[c] === undefined || a[c] === null) throw new Error(`Activité ${i + 1} : champ manquant « ${c} »`);
    }
    // Normalise les champs tableau
    const normaliserTableau = (v) => Array.isArray(v) ? v : (v ? [v] : []);
    return {
      id: a.id || null,
      titre: String(a.titre).trim(),
      phase: String(a.phase).trim(),
      public: normaliserTableau(a.public),
      duree: String(a.duree).trim(),
      duree_detail: a.duree_detail || null,
      groupe: normaliserTableau(a.groupe),
      preparation: String(a.preparation).trim(),
      themes: normaliserTableau(a.themes),
      contexte: normaliserTableau(a.contexte),
      description_courte: String(a.description_courte).trim(),
      description: String(a.description).trim(),
      apprentissage_cle: String(a.apprentissage_cle).trim(),
    };
  });
}

function parserMarkdown(texte) {
  // Format attendu : le même que celui produit par exportMarkdown()
  // ## N. Titre `ID`
  // **Phase :** X
  // **Public :** X, Y
  // **Durée :** X
  // **Groupe :** X
  // **Préparation :** X
  // **Thèmes :** X
  // **Contexte :** X
  // ### Description
  // texte
  // ### Apprentissage clé
  // > texte
  // ---

  const sections = texte.split(/\n---+\n/).map((s) => s.trim()).filter(Boolean);
  const activites = [];

  for (const section of sections) {
    const lignes = section.split("\n");

    // Cherche la ligne de titre ## N. Titre `ID`
    const ligneTitre = lignes.find((l) => /^##\s/.test(l));
    if (!ligneTitre) continue;

    const mTitre = ligneTitre.match(/^##\s+\d+\.\s+(.+?)(?:\s+`([^`]+)`)?$/);
    if (!mTitre) continue;

    const titre = mTitre[1].trim();
    const id = mTitre[2] || null;

    function extraireChamp(label) {
      const re = new RegExp(`\\*\\*${label}\\s*:\\*\\*\\s*(.+)`);
      const l = lignes.find((x) => re.test(x));
      return l ? l.match(re)[1].trim() : "";
    }

    const phase = extraireChamp("Phase");
    const publicStr = extraireChamp("Public");
    const dureeStr = extraireChamp("Durée");
    const groupeStr = extraireChamp("Groupe");
    const preparation = extraireChamp("Préparation");
    const themesStr = extraireChamp("Thèmes");
    const contexteStr = extraireChamp("Contexte");

    // Description : entre ### Description et ### Apprentissage clé
    const idxDesc = lignes.findIndex((l) => /^###\s+Description/.test(l));
    const idxApp = lignes.findIndex((l) => /^###\s+Apprentissage/.test(l));
    let description = "";
    if (idxDesc !== -1 && idxApp !== -1) {
      description = lignes.slice(idxDesc + 1, idxApp).join("\n").trim();
    }

    // Apprentissage clé : lignes après ### Apprentissage clé (souvent préfixées par "> ")
    let apprentissage_cle = "";
    if (idxApp !== -1) {
      apprentissage_cle = lignes.slice(idxApp + 1)
        .map((l) => l.replace(/^>\s*/, "").trim())
        .filter(Boolean)
        .join(" ");
    }

    const splitter = (s) => s ? s.split(/\s*[,|]\s*/).map((x) => x.trim()).filter(Boolean) : [];

    // Durée : peut être "duree_detail (duree)" ou juste "duree"
    // On prend la valeur brute comme duree ; si elle correspond à une valeur connue on l'utilise, sinon on met dans duree_detail
    const DUREES_OK = ["<30min", "30-60min", "1-2h", "2-4h", "Projet"];
    const duree = DUREES_OK.includes(dureeStr) ? dureeStr : (DUREES_OK.find((d) => dureeStr.includes(d)) || "<30min");
    const duree_detail = dureeStr !== duree ? dureeStr : null;

    if (!titre || !phase) continue;

    activites.push({
      id,
      titre,
      phase,
      public: splitter(publicStr),
      duree,
      duree_detail,
      groupe: splitter(groupeStr),
      preparation,
      themes: splitter(themesStr),
      contexte: splitter(contexteStr),
      description_courte: description.split(".")[0]?.trim() || description.slice(0, 100),
      description,
      apprentissage_cle,
    });
  }

  if (activites.length === 0) throw new Error("Aucune activité reconnue dans ce fichier Markdown.");
  return activites;
}

// ============================================================
// MODALE D'IMPORT DE FICHIER
// ============================================================

function ImportFichierModal({ onClose, onImport, activitesCustom }) {
  const [etat, setEtat] = React.useState("idle"); // idle | lecture | preview | erreur
  const [erreur, setErreur] = React.useState("");
  const [preview, setPreview] = React.useState([]);
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef(null);

  function lireFichier(fichier) {
    if (!fichier) return;
    const ext = fichier.name.split(".").pop().toLowerCase();
    if (!["json", "md", "markdown"].includes(ext)) {
      setErreur(`Format non supporté : .${ext}. Utilisez .json ou .md`);
      setEtat("erreur");
      return;
    }
    setEtat("lecture");
    setErreur("");
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const texte = e.target.result;
        const activites = ext === "json" ? parserJSON(texte) : parserMarkdown(texte);
        setPreview(activites);
        setEtat("preview");
      } catch (err) {
        setErreur(err.message);
        setEtat("erreur");
      }
    };
    reader.onerror = () => { setErreur("Impossible de lire le fichier."); setEtat("erreur"); };
    reader.readAsText(fichier, "utf-8");
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const fichier = e.dataTransfer.files[0];
    if (fichier) lireFichier(fichier);
  }

  function handleChange(e) {
    lireFichier(e.target.files[0]);
  }

  function handleConfirmer() {
    onImport(preview);
  }

  function handleRecommencer() {
    setEtat("idle");
    setPreview([]);
    setErreur("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-import" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-eyebrow">Importer des activités</div>
        <h2 className="modal-title">Import JSON ou Markdown</h2>

        {etat === "idle" && (
          <>
            <div
              className={`import-dropzone ${dragging ? "import-dropzone-active" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <span className="import-dropzone-icon">📂</span>
              <span className="import-dropzone-label">Glissez un fichier ici ou cliquez pour parcourir</span>
              <span className="import-dropzone-hint">.json ou .md acceptés</span>
              <input
                ref={inputRef}
                type="file"
                accept=".json,.md,.markdown"
                style={{ display: "none" }}
                onChange={handleChange}
              />
            </div>
            <div className="import-formats">
              <div className="import-format-block">
                <div className="import-format-title">Format JSON attendu</div>
                <pre className="import-format-code">{`[
  {
    "titre": "Nom de l'activité",
    "phase": "Avant",
    "public": ["11-15", "16-20"],
    "duree": "30-60min",
    "groupe": ["Moyen"],
    "preparation": "Légère",
    "themes": ["IA déconnecté"],
    "contexte": ["Scolaire"],
    "description_courte": "...",
    "description": "...",
    "apprentissage_cle": "..."
  }
]`}</pre>
              </div>
              <div className="import-format-block">
                <div className="import-format-title">Format Markdown (export catalogue)</div>
                <pre className="import-format-code">{`## 1. Titre de l'activité \`ID\`

**Phase :** Avant
**Public :** 11-15, 16-20
**Durée :** 30-60min
**Groupe :** Moyen
**Préparation :** Légère
**Thèmes :** IA déconnecté
**Contexte :** Scolaire

### Description

Déroulé de l'activité...

### Apprentissage clé

> Ce que les participants retiennent.

---`}</pre>
              </div>
            </div>
          </>
        )}

        {etat === "lecture" && (
          <div className="import-loading">⏳ Lecture du fichier en cours…</div>
        )}

        {etat === "erreur" && (
          <div className="import-erreur-bloc">
            <div className="import-erreur-titre">❌ Erreur de parsing</div>
            <div className="import-erreur-msg">{erreur}</div>
            <button className="btn" onClick={handleRecommencer} style={{ marginTop: "16px" }}>
              Réessayer avec un autre fichier
            </button>
          </div>
        )}

        {etat === "preview" && (
          <>
            <div className="import-preview-header">
              <span className="import-preview-count">
                ✅ {preview.length} activité{preview.length > 1 ? "s" : ""} prête{preview.length > 1 ? "s" : ""} à importer
              </span>
              <button className="btn-reset" onClick={handleRecommencer} style={{ fontSize: "12px" }}>
                Changer de fichier
              </button>
            </div>
            <div className="import-preview-list">
              {preview.map((a, i) => (
                <div key={i} className="import-preview-item">
                  <span className="import-preview-num">{i + 1}</span>
                  <div className="import-preview-info">
                    <div className="import-preview-titre">{a.titre}</div>
                    <div className="import-preview-meta">
                      {a.phase} · {a.public.join(", ")} · {a.duree}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={handleConfirmer}>
                ✚ Importer {preview.length} activité{preview.length > 1 ? "s" : ""}
              </button>
              <button className="btn-reset" style={{ marginTop: "8px" }} onClick={onClose}>Annuler</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}



const PHASES_DISPONIBLES = [
  "Avant", "Demander", "Produire", "Évaluer",
  "Sécuriser", "Piloter", "Construire", "Contribuer",
];
const PUBLICS_DISPONIBLES = ["7-10", "11-15", "16-20", "Post-bac", "Adultes"];
const DUREES_DISPONIBLES = ["<30min", "30-60min", "1-2h", "2-4h", "Projet"];
const GROUPES_DISPONIBLES = ["Petit", "Moyen", "Grand"];
const PREPARATIONS_DISPONIBLES = ["Légère", "Moyenne", "Importante"];
const CONTEXTES_DISPONIBLES = ["Scolaire", "Études sup.", "Entreprise"];

function genererIdCustom(activitesCustom) {
  const nums = activitesCustom
    .map((a) => {
      const m = a.id.match(/^CUS-(\d+)$/);
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter(Boolean);
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `CUS-${String(next).padStart(3, "0")}`;
}

function ActivityFormModal({ onClose, onSave, tousThemes, initialData }) {
  const modeEdition = !!initialData;
  const [form, setForm] = React.useState(() => {
    if (initialData) {
      return {
        titre: initialData.titre || "",
        phase: initialData.phase || "Avant",
        public: initialData.public || [],
        duree: initialData.duree || "<30min",
        duree_detail: initialData.duree_detail || "",
        groupe: initialData.groupe || ["Moyen"],
        preparation: initialData.preparation || "Légère",
        themes: initialData.themes || [],
        contexte: initialData.contexte || [],
        description_courte: initialData.description_courte || "",
        description: initialData.description || "",
        apprentissage_cle: initialData.apprentissage_cle || "",
      };
    }
    return {
      titre: "",
      phase: "Avant",
      public: [],
      duree: "<30min",
      duree_detail: "",
      groupe: ["Moyen"],
      preparation: "Légère",
      themes: [],
      contexte: [],
      description_courte: "",
      description: "",
      apprentissage_cle: "",
    };
  });
  const [nouveauTheme, setNouveauTheme] = React.useState("");
  const [erreurs, setErreurs] = React.useState({});

  // Thèmes triés, "IA déconnecté" en premier
  const themesTriés = [...tousThemes].sort((a, b) => {
    if (a === "IA déconnecté") return -1;
    if (b === "IA déconnecté") return 1;
    return a.localeCompare(b, "fr");
  });
  // Thèmes non encore sélectionnés dans le form
  const themesDispo = themesTriés.filter((t) => !form.themes.includes(t));

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErreurs((prev) => ({ ...prev, [key]: undefined }));
  }

  function toggleMulti(key, value) {
    setForm((prev) => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
    setErreurs((prev) => ({ ...prev, [key]: undefined }));
  }

  function toggleTheme(theme) {
    setForm((prev) => {
      const arr = prev.themes;
      return {
        ...prev,
        themes: arr.includes(theme) ? arr.filter((t) => t !== theme) : [...arr, theme],
      };
    });
    setErreurs((prev) => ({ ...prev, themes: undefined }));
  }

  function ajouterNouveauTheme() {
    const t = nouveauTheme.trim();
    if (!t) return;
    if (!form.themes.includes(t)) {
      setForm((prev) => ({ ...prev, themes: [...prev.themes, t] }));
    }
    setNouveauTheme("");
    setErreurs((prev) => ({ ...prev, themes: undefined }));
  }

  function valider() {
    const e = {};
    if (!form.titre.trim()) e.titre = "Le titre est obligatoire.";
    if (form.public.length === 0) e.public = "Sélectionnez au moins un public.";
    if (form.themes.length === 0) e.themes = "Sélectionnez ou créez au moins un thème.";
    if (form.contexte.length === 0) e.contexte = "Sélectionnez au moins un contexte.";
    if (!form.description_courte.trim()) e.description_courte = "La description courte est obligatoire.";
    if (!form.description.trim()) e.description = "La description est obligatoire.";
    if (!form.apprentissage_cle.trim()) e.apprentissage_cle = "L'apprentissage clé est obligatoire.";
    setErreurs(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!valider()) return;
    onSave(form);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-add" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-eyebrow">{modeEdition ? `Modifier · ${initialData.id}` : "Nouvelle activité personnalisée"}</div>
        <h2 className="modal-title">{modeEdition ? "Modifier l'activité" : "Créer une activité"}</h2>

        {/* TITRE */}
        <div className="form-group">
          <label className="form-label">Titre <span className="form-required">*</span></label>
          <input
            className={`form-input ${erreurs.titre ? "form-input-error" : ""}`}
            type="text"
            placeholder="Titre de l'activité"
            value={form.titre}
            onChange={(e) => setField("titre", e.target.value)}
          />
          {erreurs.titre && <div className="form-error">{erreurs.titre}</div>}
        </div>

        {/* PHASE */}
        <div className="form-group">
          <label className="form-label">Phase</label>
          <div className="form-chips">
            {PHASES_DISPONIBLES.map((p) => (
              <button
                key={p}
                className={`form-chip ${form.phase === p ? "form-chip-active" : ""}`}
                onClick={() => setField("phase", p)}
                type="button"
              >{p}</button>
            ))}
          </div>
        </div>

        {/* PUBLIC */}
        <div className="form-group">
          <label className="form-label">Public <span className="form-required">*</span></label>
          <div className="form-chips">
            {PUBLICS_DISPONIBLES.map((p) => (
              <button
                key={p}
                className={`form-chip ${form.public.includes(p) ? "form-chip-active" : ""}`}
                onClick={() => toggleMulti("public", p)}
                type="button"
              >{p}</button>
            ))}
          </div>
          {erreurs.public && <div className="form-error">{erreurs.public}</div>}
        </div>

        {/* DURÉE + DÉTAIL */}
        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Durée</label>
            <div className="form-chips">
              {DUREES_DISPONIBLES.map((d) => (
                <button
                  key={d}
                  className={`form-chip ${form.duree === d ? "form-chip-active" : ""}`}
                  onClick={() => setField("duree", d)}
                  type="button"
                >{d}</button>
              ))}
            </div>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Précision durée <span className="form-hint">(optionnel)</span></label>
            <input
              className="form-input"
              type="text"
              placeholder="ex : 30min (enfants) / 1h (adultes)"
              value={form.duree_detail}
              onChange={(e) => setField("duree_detail", e.target.value)}
            />
          </div>
        </div>

        {/* GROUPE + PRÉPARATION */}
        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Taille du groupe</label>
            <div className="form-chips">
              {GROUPES_DISPONIBLES.map((g) => (
                <button
                  key={g}
                  className={`form-chip ${form.groupe.includes(g) ? "form-chip-active" : ""}`}
                  onClick={() => toggleMulti("groupe", g)}
                  type="button"
                >{g}</button>
              ))}
            </div>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Préparation</label>
            <div className="form-chips">
              {PREPARATIONS_DISPONIBLES.map((p) => (
                <button
                  key={p}
                  className={`form-chip ${form.preparation === p ? "form-chip-active" : ""}`}
                  onClick={() => setField("preparation", p)}
                  type="button"
                >{p}</button>
              ))}
            </div>
          </div>
        </div>

        {/* THÈMES */}
        <div className="form-group">
          <label className="form-label">Thèmes <span className="form-required">*</span></label>

          {/* Chips des thèmes existants */}
          {themesTriés.length > 0 && (
            <div className="form-chips" style={{ marginBottom: "8px" }}>
              {themesTriés.map((t) => (
                <button
                  key={t}
                  className={`form-chip ${form.themes.includes(t) ? "form-chip-active" : ""}`}
                  onClick={() => toggleTheme(t)}
                  type="button"
                >{t}</button>
              ))}
            </div>
          )}

          {/* Chips sélectionnées */}
          {form.themes.length > 0 && (
            <div className="form-themes-selected">
              {form.themes.map((t) => (
                <span key={t} className="form-theme-chip">
                  {t}
                  <button onClick={() => toggleTheme(t)} className="form-theme-chip-remove">×</button>
                </span>
              ))}
            </div>
          )}

          {/* Créer un nouveau thème */}
          <div className="form-new-theme">
            <input
              className="form-input"
              type="text"
              placeholder="Créer un nouveau thème…"
              value={nouveauTheme}
              onChange={(e) => setNouveauTheme(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); ajouterNouveauTheme(); } }}
            />
            <button
              className="btn-add-theme"
              onClick={ajouterNouveauTheme}
              type="button"
              disabled={!nouveauTheme.trim()}
            >Ajouter</button>
          </div>
          {erreurs.themes && <div className="form-error">{erreurs.themes}</div>}
        </div>

        {/* CONTEXTE */}
        <div className="form-group">
          <label className="form-label">Contexte <span className="form-required">*</span></label>
          <div className="form-chips">
            {CONTEXTES_DISPONIBLES.map((c) => (
              <button
                key={c}
                className={`form-chip ${form.contexte.includes(c) ? "form-chip-active" : ""}`}
                onClick={() => toggleMulti("contexte", c)}
                type="button"
              >{c}</button>
            ))}
          </div>
          {erreurs.contexte && <div className="form-error">{erreurs.contexte}</div>}
        </div>

        {/* DESCRIPTION COURTE */}
        <div className="form-group">
          <label className="form-label">Description courte <span className="form-required">*</span></label>
          <input
            className={`form-input ${erreurs.description_courte ? "form-input-error" : ""}`}
            type="text"
            placeholder="1-2 phrases pour la carte"
            value={form.description_courte}
            onChange={(e) => setField("description_courte", e.target.value)}
          />
          {erreurs.description_courte && <div className="form-error">{erreurs.description_courte}</div>}
        </div>

        {/* DESCRIPTION */}
        <div className="form-group">
          <label className="form-label">Description complète <span className="form-required">*</span></label>
          <textarea
            className={`form-textarea ${erreurs.description ? "form-input-error" : ""}`}
            placeholder="Déroulé détaillé de l'activité"
            rows={4}
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
          />
          {erreurs.description && <div className="form-error">{erreurs.description}</div>}
        </div>

        {/* APPRENTISSAGE CLÉ */}
        <div className="form-group">
          <label className="form-label">Apprentissage clé <span className="form-required">*</span></label>
          <textarea
            className={`form-textarea ${erreurs.apprentissage_cle ? "form-input-error" : ""}`}
            placeholder="Ce que les participants retiennent"
            rows={2}
            value={form.apprentissage_cle}
            onChange={(e) => setField("apprentissage_cle", e.target.value)}
          />
          {erreurs.apprentissage_cle && <div className="form-error">{erreurs.apprentissage_cle}</div>}
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={handleSave}>{modeEdition ? "✔ Enregistrer les modifications" : "✚ Enregistrer l'activité"}</button>
          <button className="btn-reset" style={{ marginTop: "8px" }} onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div>
  );
}

function PrintView({ activitesPanier }) {
  const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const source = activitesPanier;

  if (source.length === 0) return null;

  return (
    <div className="print-view">
      {/* En-tête de document */}
      <div className="print-doc-header">
        <div className="print-doc-eyebrow">Ressources pédagogiques · IA générative</div>
        <h1 className="print-doc-title">Fiche de séance</h1>
        <div className="print-doc-meta">
          <span>Exporté le {date}</span>
          <span className="print-doc-meta-sep">·</span>
          <span>{source.length} activité{source.length > 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Sommaire */}
      {source.length > 1 && (
        <div className="print-toc">
          <div className="print-toc-title">Sommaire</div>
          <ol className="print-toc-list">
            {source.map((a, i) => (
              <li key={a.id} className="print-toc-item">
                <span className="print-toc-num">{i + 1}.</span>
                <span className="print-toc-name">{a.titre}</span>
                <span className="print-toc-id">{a.id}</span>
                <span className="print-toc-phase">{a.phase}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Fiches activités */}
      {source.map((a, i) => (
        <div key={a.id} className="print-fiche">
          <div className="print-fiche-header">
            <div className="print-fiche-header-left">
              <span className="print-fiche-num">{i + 1}</span>
              <div>
                <h2 className="print-fiche-titre">{a.titre}</h2>
                <div className="print-fiche-id-phase">
                  <span className="print-fiche-id">{a.id}</span>
                  <span className="print-fiche-phase">{a.phase}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="print-fiche-meta-grid">
            <div className="print-fiche-meta-item">
              <div className="print-fiche-meta-label">Durée</div>
              <div className="print-fiche-meta-value">{a.duree_detail || a.duree}</div>
            </div>
            <div className="print-fiche-meta-item">
              <div className="print-fiche-meta-label">Public</div>
              <div className="print-fiche-meta-value">{a.public.join(", ")}</div>
            </div>
            <div className="print-fiche-meta-item">
              <div className="print-fiche-meta-label">Taille groupe</div>
              <div className="print-fiche-meta-value">{a.groupe.join(", ")}</div>
            </div>
            <div className="print-fiche-meta-item">
              <div className="print-fiche-meta-label">Préparation</div>
              <div className="print-fiche-meta-value">{a.preparation}</div>
            </div>
            <div className="print-fiche-meta-item">
              <div className="print-fiche-meta-label">Thèmes</div>
              <div className="print-fiche-meta-value">{a.themes.join(", ")}</div>
            </div>
            <div className="print-fiche-meta-item">
              <div className="print-fiche-meta-label">Contexte</div>
              <div className="print-fiche-meta-value">{a.contexte.join(", ")}</div>
            </div>
          </div>

          <div className="print-fiche-section">
            <div className="print-fiche-section-label">Description</div>
            <p className="print-fiche-body">{a.description}</p>
          </div>

          <div className="print-fiche-apprentissage">
            <div className="print-fiche-section-label">Apprentissage clé</div>
            <p className="print-fiche-apprentissage-text">« {a.apprentissage_cle} »</p>
          </div>
        </div>
      ))}

      <div className="print-doc-footer">
        Catalogue d'activités pédagogiques · IA générative — {source.length} activité{source.length > 1 ? "s" : ""}
      </div>
    </div>
  );
}

// ============================================================
// APPLICATION
// ============================================================


// ============================================================
// APPLICATION
// ============================================================

export default function Catalogue() {
  const [selected, setSelected] = React.useState(null);
  const [filtres, setFiltres] = React.useState(FILTRES_INIT);
  const [showChoixImport, setShowChoixImport] = React.useState(false);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showImportModal, setShowImportModal] = React.useState(false);
  const [editingActivite, setEditingActivite] = React.useState(null);

  // ── Activités natives : copiées dans localStorage au premier lancement ──
  const [activitesNatives, setActivitesNatives] = React.useState(() => {
    try {
      const raw = localStorage.getItem("catalogue_activites_natives");
      if (raw) {
        const data = JSON.parse(raw);
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {}
    // Premier lancement : on copie les 105 natives
    localStorage.setItem("catalogue_activites_natives", JSON.stringify(ACTIVITES_NATIVES));
    return ACTIVITES_NATIVES;
  });

  // ── Activités custom ──
  const [activitesCustom, setActivitesCustom] = React.useState(() => {
    try {
      const raw = localStorage.getItem("catalogue_custom_activites");
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  });

  // ── Panier ──
  const [panier, setPanier] = React.useState(() => {
    try {
      const raw = localStorage.getItem("catalogue_panier_ordre");
      const ids = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(ids) ? ids : []);
    } catch {
      return new Set();
    }
  });
  const [panierOrdre, setPanierOrdre] = React.useState(() => {
    try {
      const raw = localStorage.getItem("catalogue_panier_ordre");
      const ids = raw ? JSON.parse(raw) : [];
      return Array.isArray(ids) ? ids : [];
    } catch {
      return [];
    }
  });

  // ── Synchronisations localStorage ──
  useEffect(() => {
    try { localStorage.setItem("catalogue_panier_ordre", JSON.stringify(panierOrdre)); } catch {}
  }, [panierOrdre]);

  useEffect(() => {
    try { localStorage.setItem("catalogue_activites_natives", JSON.stringify(activitesNatives)); } catch {}
  }, [activitesNatives]);

  useEffect(() => {
    try { localStorage.setItem("catalogue_custom_activites", JSON.stringify(activitesCustom)); } catch {}
  }, [activitesCustom]);

  // ── Pool complet = natives (modifiées) + custom ──
  const toutesActivites = useMemo(
    () => [...activitesNatives, ...activitesCustom],
    [activitesNatives, activitesCustom]
  );

  // ── Thèmes distincts ──
  const tousThemes = useMemo(() => {
    const set = new Set();
    for (const a of toutesActivites) {
      if (Array.isArray(a.themes)) a.themes.forEach((t) => set.add(t));
    }
    return [...set];
  }, [toutesActivites]);

  // ── Filtrage ──
  const activitesFiltrees = useMemo(() => {
    return toutesActivites.filter((a) => {
      if (filtres.search.trim()) {
        const q = filtres.search.toLowerCase();
        const haystack = [a.titre, a.description_courte, a.apprentissage_cle, a.id]
          .join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filtres.public.length > 0 && !filtres.public.some((v) => a.public.includes(v))) return false;
      if (filtres.duree.length > 0 && !filtres.duree.includes(a.duree)) return false;
      if (filtres.groupe.length > 0 && !filtres.groupe.some((v) => a.groupe.includes(v))) return false;
      if (filtres.preparation.length > 0 && !filtres.preparation.includes(a.preparation)) return false;
      if (filtres.themes.length > 0 && !filtres.themes.some((v) => a.themes.includes(v))) return false;
      if (filtres.contexte.length > 0 && !filtres.contexte.some((v) => a.contexte.includes(v))) return false;
      return true;
    });
  }, [filtres, toutesActivites]);

  const groupedByPhase = useMemo(() => {
    const groups = {};
    for (const phase of PHASE_ORDER) groups[phase] = [];
    for (const a of activitesFiltrees) {
      if (groups[a.phase]) groups[a.phase].push(a);
    }
    return groups;
  }, [activitesFiltrees]);

  const activitesPanierOrdonnees = panierOrdre
    .filter((id) => panier.has(id))
    .map((id) => toutesActivites.find((a) => a.id === id))
    .filter(Boolean);

  // ── Handlers ──
  function handleSaveActivite(formData) {
    const id = genererIdCustom(activitesCustom);
    const nouvelleActivite = {
      id,
      titre: formData.titre.trim(),
      phase: formData.phase,
      public: formData.public,
      duree: formData.duree,
      duree_detail: formData.duree_detail.trim() || null,
      groupe: formData.groupe,
      preparation: formData.preparation,
      themes: formData.themes,
      contexte: formData.contexte,
      description_courte: formData.description_courte.trim(),
      description: formData.description.trim(),
      apprentissage_cle: formData.apprentissage_cle.trim(),
      _custom: true,
    };
    setActivitesCustom((prev) => [...prev, nouvelleActivite]);
    setShowAddModal(false);
  }

  function handleImportActivites(nouvellesActivites) {
    const ids = new Set([...activitesNatives.map((a) => a.id), ...activitesCustom.map((a) => a.id)]);
    // Génère des IDs pour les activités importées qui n'en ont pas ou dont l'ID est déjà pris
    let compteur = activitesCustom.length;
    const nums = activitesCustom
      .map((a) => { const m = a.id.match(/^CUS-(\d+)$/); return m ? parseInt(m[1], 10) : 0; })
      .filter(Boolean);
    let nextNum = nums.length > 0 ? Math.max(...nums) + 1 : 1;

    const activitesAvecIds = nouvellesActivites.map((a) => {
      let id = a.id;
      if (!id || ids.has(id)) {
        id = `CUS-${String(nextNum).padStart(3, "0")}`;
        nextNum++;
      }
      ids.add(id);
      return { ...a, id, _custom: true };
    });

    setActivitesCustom((prev) => [...prev, ...activitesAvecIds]);
    setShowImportModal(false);
  }

  function handleUpdateActivite(formData) {
    const id = editingActivite.id;
    const estNative = activitesNatives.some((a) => a.id === id);
    const activiteMiseAJour = {
      id,
      titre: formData.titre.trim(),
      phase: formData.phase,
      public: formData.public,
      duree: formData.duree,
      duree_detail: formData.duree_detail.trim() || null,
      groupe: formData.groupe,
      preparation: formData.preparation,
      themes: formData.themes,
      contexte: formData.contexte,
      description_courte: formData.description_courte.trim(),
      description: formData.description.trim(),
      apprentissage_cle: formData.apprentissage_cle.trim(),
      ...(editingActivite._custom ? { _custom: true } : {}),
      ...(editingActivite._modifiee ? { _modifiee: true } : {}),
      ...(!estNative ? {} : { _modifiee: true }),
    };
    if (estNative) {
      setActivitesNatives((prev) => prev.map((a) => (a.id === id ? activiteMiseAJour : a)));
    } else {
      setActivitesCustom((prev) => prev.map((a) => (a.id === id ? activiteMiseAJour : a)));
    }
    setEditingActivite(null);
  }

  function handleDeleteActivite(id) {
    const estNative = activitesNatives.some((a) => a.id === id);
    if (estNative) {
      setActivitesNatives((prev) => prev.filter((a) => a.id !== id));
    } else {
      setActivitesCustom((prev) => prev.filter((a) => a.id !== id));
    }
    setPanier((prev) => { const next = new Set(prev); next.delete(id); return next; });
    setPanierOrdre((prev) => prev.filter((x) => x !== id));
  }

  function handleReinitialiser() {
    if (!window.confirm(
      "Réinitialiser les 105 activités natives ?\n\nToutes vos modifications sur les activités natives seront perdues. Vos activités personnalisées seront conservées."
    )) return;
    setActivitesNatives(ACTIVITES_NATIVES);
    // Nettoyer le panier des IDs natifs supprimés qui n'existent plus
    const idsNatifs = new Set(ACTIVITES_NATIVES.map((a) => a.id));
    setPanierOrdre((prev) => prev.filter((id) => idsNatifs.has(id) || activitesCustom.some((a) => a.id === id)));
    setPanier((prev) => {
      const next = new Set();
      for (const id of prev) {
        if (idsNatifs.has(id) || activitesCustom.some((a) => a.id === id)) next.add(id);
      }
      return next;
    });
  }

  // Compte des activités natives modifiées ou supprimées
  const nbNativesModifiees = activitesNatives.filter((a) => a._modifiee).length;
  const nbNativesSupprimees = ACTIVITES_NATIVES.length - activitesNatives.length;

  return (
    <div className="app">
      <style>{CSS}</style>
      <PrintView activitesPanier={activitesPanierOrdonnees} />
      <Header
        totalActivites={toutesActivites.length}
        filteredCount={activitesFiltrees.length}
        onNouvelleActivite={() => setShowChoixImport(true)}
        onReinitialiser={handleReinitialiser}
        nbNativesModifiees={nbNativesModifiees}
        nbNativesSupprimees={nbNativesSupprimees}
      />
      <div className="layout">
        <FiltersPanel
          filtres={filtres}
          setFiltres={setFiltres}
          filteredCount={activitesFiltrees.length}
          totalActivites={toutesActivites.length}
          tousThemes={tousThemes}
        />
        <main className="main">
          {activitesFiltrees.length === 0 ? (
            <div className="no-results">
              <p className="no-results-title">Aucune activité ne correspond à ces filtres.</p>
              <p className="no-results-hint">Essayez de réduire le nombre de critères sélectionnés.</p>
            </div>
          ) : (
            PHASE_ORDER.map((phase) =>
              groupedByPhase[phase].length > 0 ? (
                <PhaseSection
                  key={phase}
                  phase={phase}
                  activites={groupedByPhase[phase]}
                  onCardClick={setSelected}
                  panier={panier}
                />
              ) : null
            )
          )}
          <footer className="app-footer">
            <p>
              Catalogue · {toutesActivites.length} activités
              {activitesCustom.length > 0 && (
                <span style={{ color: "var(--accent-deep)", marginLeft: "6px" }}>
                  (dont {activitesCustom.length} personnalisée{activitesCustom.length > 1 ? "s" : ""})
                </span>
              )}
              {" "}· {activitesFiltrees.length} affichées
            </p>
          </footer>
        </main>
        <CartPanel
          panier={panier}
          setPanier={setPanier}
          panierOrdre={panierOrdre}
          setPanierOrdre={setPanierOrdre}
          toutesActivites={toutesActivites}
        />
      </div>
      <DetailModal
        activite={selected}
        onClose={() => setSelected(null)}
        panier={panier}
        setPanier={setPanier}
        panierOrdre={panierOrdre}
        setPanierOrdre={setPanierOrdre}
        onEdit={setEditingActivite}
        onDelete={handleDeleteActivite}
      />
      {showChoixImport && (
        <ChoixImportModal
          onClose={() => setShowChoixImport(false)}
          onManuel={() => { setShowChoixImport(false); setShowAddModal(true); }}
          onImport={() => { setShowChoixImport(false); setShowImportModal(true); }}
        />
      )}
      {showAddModal && (
        <ActivityFormModal
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveActivite}
          tousThemes={tousThemes}
        />
      )}
      {showImportModal && (
        <ImportFichierModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImportActivites}
          activitesCustom={activitesCustom}
        />
      )}
      {editingActivite && (
        <ActivityFormModal
          onClose={() => setEditingActivite(null)}
          onSave={handleUpdateActivite}
          tousThemes={tousThemes}
          initialData={editingActivite}
        />
      )}
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400&family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  --bg: #faf9f6;
  --bg-elevated: #ffffff;
  --bg-soft: #f3f0e9;
  --text: #1a1a1a;
  --text-muted: #6b6b66;
  --text-faint: #a8a59e;
  --accent: #d4a574;
  --accent-deep: #a87a3f;
  --accent-soft: #f5e9d6;
  --border: #e8e4dc;
  --border-strong: #d4cfc4;
  --serif: 'Fraunces', Georgia, serif;
  --sans: 'Inter', -apple-system, sans-serif;
  --shadow-card: 0 1px 2px rgba(0,0,0,0.03), 0 1px 0 rgba(0,0,0,0.02);
  --shadow-card-hover: 0 8px 24px rgba(168, 122, 63, 0.08), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-modal: 0 20px 60px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.08);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body, .app {
  background: var(--bg);
  color: var(--text);
  font-family: var(--sans);
  font-size: 14px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* HEADER */
.header {
  border-bottom: 1px solid var(--border);
  background: var(--bg);
  padding: 56px 48px 40px;
}
.header-inner {
  max-width: 1600px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 64px;
  align-items: end;
}
.header-eyebrow {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--accent-deep);
  font-weight: 500;
  margin-bottom: 16px;
}
.header-title {
  font-family: var(--serif);
  font-weight: 400;
  font-size: 56px;
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: var(--text);
  margin-bottom: 18px;
}
.header-title em {
  font-style: italic;
  color: var(--accent-deep);
  font-weight: 400;
}
.header-subtitle {
  font-size: 16px;
  color: var(--text-muted);
  max-width: 540px;
  line-height: 1.6;
}
.header-right {
  display: flex;
  gap: 32px;
}
.header-stat {
  text-align: right;
}
.header-stat-num {
  font-family: var(--serif);
  font-weight: 400;
  font-size: 42px;
  line-height: 1;
  color: var(--text);
  letter-spacing: -0.02em;
}
.header-stat-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--text-muted);
  margin-top: 6px;
}

/* LAYOUT 3 COLONNES */
.layout {
  flex: 1;
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  gap: 0;
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  align-items: start;
}

/* PANELS LATÉRAUX */
.panel {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}
.panel-filters {
  border-right: 1px solid var(--border);
}
.panel-cart {
  border-left: 1px solid var(--border);
}
.panel-header {
  padding: 24px 24px 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.panel-title {
  font-family: var(--serif);
  font-size: 22px;
  font-weight: 500;
  letter-spacing: -0.01em;
}
.panel-subtitle {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
}
.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}
.panel-body-empty {
  display: flex;
  align-items: center;
  justify-content: center;
}
.panel-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  background: var(--bg-soft);
}
.panel-footnote {
  font-size: 11px;
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* SEARCH BOX (placeholder) */
.search-box-placeholder {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--border-strong);
  border-radius: 4px;
  background: var(--bg-elevated);
  color: var(--text-faint);
  font-size: 13px;
  margin-bottom: 24px;
  cursor: not-allowed;
}
.search-icon {
  font-size: 16px;
  color: var(--text-faint);
}

/* FILTRES (stubs) */
.filter-group { margin-bottom: 22px; }
.filter-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--text-muted);
  margin-bottom: 8px;
  font-weight: 500;
}
.filter-values { display: flex; flex-wrap: wrap; gap: 4px; }
.filter-chip {
  font-size: 11px;
  padding: 4px 9px;
  border-radius: 3px;
  border: 1px solid var(--border-strong);
  background: var(--bg-elevated);
  color: var(--text-muted);
  letter-spacing: 0.01em;
}
.filter-chip-disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

/* PANIER VIDE */
.empty-state {
  text-align: center;
  padding: 24px 12px;
}
.empty-state-icon {
  font-size: 36px;
  color: var(--text-faint);
  font-weight: 200;
  margin-bottom: 16px;
  font-family: var(--serif);
}
.empty-state-text {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.55;
  margin-bottom: 12px;
}
.empty-state-hint {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--text-faint);
}

/* MAIN */
.main {
  padding: 32px 48px 80px;
}

/* PHASES */
.phase-section {
  margin-bottom: 64px;
}
.phase-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}
.phase-header-left {
  display: flex;
  align-items: baseline;
  gap: 20px;
}
.phase-title {
  font-family: var(--serif);
  font-size: 32px;
  font-weight: 500;
  letter-spacing: -0.015em;
  color: var(--text);
}
.phase-desc {
  font-size: 14px;
  color: var(--text-muted);
  font-style: italic;
  font-family: var(--serif);
}
.phase-count {
  font-family: var(--serif);
  font-size: 22px;
  font-weight: 400;
  color: var(--accent-deep);
  font-variant-numeric: tabular-nums;
}

/* GRILLE DE CARTES */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 20px;
}

/* CARTE */
.card {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 22px 22px 18px;
  cursor: pointer;
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-card);
}
.card:hover {
  border-color: var(--accent);
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-2px);
}
.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.card-id {
  font-family: var(--serif);
  font-size: 13px;
  font-weight: 500;
  color: var(--accent-deep);
  letter-spacing: 0.02em;
}
.card-phase {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--text-muted);
  font-weight: 500;
  padding: 3px 8px;
  background: var(--bg-soft);
  border-radius: 3px;
}
.card-title {
  font-family: var(--serif);
  font-size: 19px;
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: -0.01em;
  color: var(--text);
  margin-bottom: 10px;
}
.card-desc {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.55;
  margin-bottom: 16px;
  flex: 1;
}
.card-meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 12px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  margin-bottom: 14px;
}
.meta-item { min-width: 0; }
.meta-label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-faint);
  margin-bottom: 3px;
  font-weight: 500;
}
.meta-value {
  font-size: 12px;
  color: var(--text);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-tags {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.card-tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.tag {
  font-size: 10px;
  padding: 3px 7px;
  border-radius: 3px;
  letter-spacing: 0.02em;
  font-weight: 500;
}
.tag-public {
  background: var(--accent-soft);
  color: var(--accent-deep);
}
.tag-theme {
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border-strong);
}
.tag-contexte {
  background: var(--bg-soft);
  color: var(--text-muted);
}
.tag-large {
  font-size: 12px;
  padding: 5px 10px;
}

/* MODAL */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(26, 26, 26, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 32px;
  animation: fadeIn 180ms ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal {
  background: var(--bg-elevated);
  border-radius: 8px;
  max-width: 720px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 48px 56px;
  box-shadow: var(--shadow-modal);
  position: relative;
  animation: slideUp 220ms cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.modal-close {
  position: absolute;
  top: 20px;
  right: 24px;
  background: none;
  border: none;
  font-size: 28px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px 10px;
  line-height: 1;
  border-radius: 4px;
  transition: background 150ms ease;
}
.modal-close:hover { background: var(--bg-soft); color: var(--text); }
.modal-eyebrow {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--accent-deep);
  font-weight: 500;
  margin-bottom: 14px;
}
.modal-title {
  font-family: var(--serif);
  font-size: 36px;
  font-weight: 500;
  line-height: 1.15;
  letter-spacing: -0.015em;
  margin-bottom: 24px;
}
.modal-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  padding-bottom: 24px;
  margin-bottom: 28px;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  color: var(--text-muted);
}
.modal-meta strong {
  color: var(--text-faint);
  font-weight: 500;
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.12em;
}
.modal-section { margin-bottom: 24px; }
.modal-section-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--text-muted);
  font-weight: 500;
  margin-bottom: 10px;
}
.modal-text {
  font-size: 15px;
  line-height: 1.65;
  color: var(--text);
}
.modal-text-italic {
  font-family: var(--serif);
  font-style: italic;
  font-size: 17px;
  color: var(--accent-deep);
}
.modal-apprentissage {
  background: var(--accent-soft);
  padding: 20px 24px;
  border-radius: 6px;
  border-left: 3px solid var(--accent);
}
.modal-apprentissage .modal-section-title { color: var(--accent-deep); }
.modal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.modal-footer {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

/* BOUTONS */
.btn {
  font-family: var(--sans);
  font-size: 13px;
  padding: 10px 18px;
  border-radius: 4px;
  border: 1px solid var(--accent-deep);
  background: var(--accent-deep);
  color: var(--bg-elevated);
  cursor: pointer;
  font-weight: 500;
  letter-spacing: 0.01em;
  transition: background 150ms ease;
  width: 100%;
}
.btn:hover { background: var(--text); border-color: var(--text); }
.btn-disabled {
  background: var(--bg-soft);
  color: var(--text-faint);
  border-color: var(--border-strong);
  cursor: not-allowed;
}
.btn-disabled:hover { background: var(--bg-soft); border-color: var(--border-strong); }

/* FOOTER APPLI */
.app-footer {
  margin-top: 64px;
  padding-top: 32px;
  border-top: 1px solid var(--border);
  text-align: center;
  color: var(--text-faint);
  font-size: 12px;
  letter-spacing: 0.04em;
}

/* RESPONSIVE LIGHT (desktop principalement) */
@media (max-width: 1200px) {
  .layout { grid-template-columns: 240px 1fr 280px; }
  .header { padding: 40px 32px 28px; }
  .main { padding: 28px 32px 60px; }
}

/* SEARCH BOX FONCTIONNEL */
.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--border-strong);
  border-radius: 4px;
  background: var(--bg-elevated);
  margin-bottom: 24px;
}
.search-box:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-soft);
}
.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: var(--sans);
  font-size: 13px;
  color: var(--text);
  outline: none;
}
.search-input::placeholder { color: var(--text-faint); }
.search-clear {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 0 2px;
}

/* FILTRES FONCTIONNELS */
.filter-chip {
  font-size: 11px;
  padding: 4px 9px;
  border-radius: 3px;
  border: 1px solid var(--border-strong);
  background: var(--bg-elevated);
  color: var(--text-muted);
  letter-spacing: 0.01em;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease, border-color 120ms ease;
}
.filter-chip:hover {
  border-color: var(--accent);
  color: var(--accent-deep);
  background: var(--accent-soft);
}
.filter-chip-active {
  background: var(--accent-deep);
  color: var(--bg-elevated);
  border-color: var(--accent-deep);
}
.filter-chip-active:hover {
  background: var(--text);
  border-color: var(--text);
  color: var(--bg-elevated);
}

/* FILTRE THÈMES — select + chips actives */
.theme-filter-clear {
  background: none;
  border: none;
  font-family: var(--sans);
  font-size: 10px;
  color: var(--text-faint);
  cursor: pointer;
  padding: 0;
  letter-spacing: 0.04em;
  transition: color 120ms ease;
}
.theme-filter-clear:hover { color: var(--accent-deep); }

.theme-filter-select {
  width: 100%;
  font-family: var(--sans);
  font-size: 12px;
  color: var(--text);
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  border-radius: 4px;
  padding: 6px 8px;
  cursor: pointer;
  outline: none;
  transition: border-color 120ms ease;
  appearance: auto;
}
.theme-filter-select:focus { border-color: var(--accent); }

.theme-filter-active {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.theme-filter-chip {
  font-family: var(--sans);
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 3px;
  border: 1px solid var(--accent-deep);
  background: var(--accent-soft);
  color: var(--accent-deep);
  cursor: pointer;
  font-weight: 500;
  transition: background 120ms ease;
}
.theme-filter-chip:hover { background: var(--accent-deep); color: #fff; }

/* BOUTON RESET */
.btn-reset {
  width: 100%;
  background: none;
  border: 1px solid var(--border-strong);
  border-radius: 4px;
  font-family: var(--sans);
  font-size: 12px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 8px;
  letter-spacing: 0.02em;
  transition: border-color 120ms ease, color 120ms ease;
}
.btn-reset:hover { border-color: var(--accent); color: var(--accent-deep); }

/* PANIER — liste */
.cart-list { display: flex; flex-direction: column; gap: 10px; }
.cart-item {
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: 5px;
  padding: 10px 12px;
}
.cart-item-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.cart-item-id {
  font-size: 10px;
  color: var(--accent-deep);
  font-weight: 500;
  letter-spacing: 0.06em;
}
.cart-item-remove {
  background: none;
  border: none;
  color: var(--text-faint);
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 0;
  transition: color 120ms ease;
}
.cart-item-remove:hover { color: var(--text); }
.cart-item-titre {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  line-height: 1.35;
  margin-bottom: 4px;
}
.cart-item-meta {
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.01em;
}

/* CARTE ÉPINGLÉE */
.card-epingle {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.card-epingle-badge {
  font-size: 12px;
  margin-left: auto;
}

/* BOUTON RETIRER */
.btn-retirer {
  background: var(--bg-soft);
  color: var(--accent-deep);
  border-color: var(--accent);
}
.btn-retirer:hover { background: var(--accent-soft); border-color: var(--accent-deep); color: var(--text); }

/* CONTRÔLES D'ORDRE DANS LE PANIER */
.cart-item-order {
  display: flex;
  align-items: center;
  gap: 3px;
}
.cart-item-num {
  font-size: 10px;
  color: var(--text-faint);
  min-width: 14px;
  text-align: center;
  font-weight: 500;
}
.cart-order-btn {
  background: none;
  border: 1px solid var(--border-strong);
  border-radius: 3px;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 11px;
  line-height: 1;
  padding: 1px 4px;
  transition: background 100ms ease, color 100ms ease;
}
.cart-order-btn:hover:not(:disabled) {
  background: var(--accent-soft);
  color: var(--accent-deep);
  border-color: var(--accent);
}
.cart-order-btn:disabled {
  opacity: 0.25;
  cursor: default;
}

/* EXPORT */
.export-wrapper { position: relative; }
.export-menu {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  right: 0;
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  overflow: hidden;
  z-index: 50;
}
.export-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  background: none;
  border: none;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  text-align: left;
  transition: background 120ms ease;
  font-family: var(--sans);
}
.export-option:last-child { border-bottom: none; }
.export-option:hover { background: var(--accent-soft); }
.export-option-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
  color: var(--accent-deep);
}
.export-option-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 1px;
}
.export-option-desc {
  font-size: 11px;
  color: var(--text-muted);
}

/* NO RESULTS */
.no-results {
  padding: 80px 24px;
  text-align: center;
}
.no-results-title {
  font-family: var(--serif);
  font-size: 22px;
  color: var(--text);
  margin-bottom: 12px;
}
.no-results-hint {
  font-size: 14px;
  color: var(--text-muted);
}

/* BOUTON IMPRIMER */
.btn-print {
  background: var(--bg-soft);
  color: var(--text);
  border-color: var(--border-strong);
}
.btn-print:hover { background: var(--accent-soft); border-color: var(--accent); color: var(--accent-deep); }

/* ============================================================
   FICHE IMPRIMABLE — invisible à l'écran, visible à l'impression
   ============================================================ */

.print-view {
  display: none;
}

/* ============================================================
   @media print — tout ce qui se passe à l'impression
   ============================================================ */

@media print {
  /* On cache TOUT l'UI sauf la print-view */
  .header,
  .layout,
  .modal-backdrop,
  .app-footer {
    display: none !important;
  }

  /* On affiche la vue imprimable */
  .print-view {
    display: block;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 10.5pt;
    line-height: 1.6;
    color: #111;
    background: #fff;
  }

  /* Marges page */
  @page {
    margin: 18mm 20mm 18mm 20mm;
    size: A4;
  }

  /* En-tête document */
  .print-doc-header {
    text-align: center;
    border-bottom: 2px solid #1a1a1a;
    padding-bottom: 14pt;
    margin-bottom: 20pt;
  }
  .print-doc-eyebrow {
    font-size: 7.5pt;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: #666;
    margin-bottom: 6pt;
  }
  .print-doc-title {
    font-family: Georgia, serif;
    font-size: 26pt;
    font-weight: normal;
    font-style: italic;
    letter-spacing: -0.01em;
    margin-bottom: 8pt;
  }
  .print-doc-meta {
    font-size: 8.5pt;
    color: #555;
    display: flex;
    justify-content: center;
    gap: 8pt;
    align-items: center;
  }
  .print-doc-meta-sep {
    color: #bbb;
  }

  /* Sommaire */
  .print-toc {
    background: #f7f5f0;
    border: 1pt solid #ddd;
    border-radius: 4pt;
    padding: 12pt 16pt;
    margin-bottom: 24pt;
    page-break-inside: avoid;
  }
  .print-toc-title {
    font-size: 8pt;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: #888;
    font-family: Arial, sans-serif;
    margin-bottom: 8pt;
    font-weight: bold;
  }
  .print-toc-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .print-toc-item {
    display: flex;
    align-items: baseline;
    gap: 6pt;
    padding: 2.5pt 0;
    border-bottom: 0.5pt dotted #ccc;
    font-size: 9.5pt;
  }
  .print-toc-item:last-child { border-bottom: none; }
  .print-toc-num {
    color: #999;
    min-width: 14pt;
    font-size: 8.5pt;
  }
  .print-toc-name {
    flex: 1;
    font-weight: normal;
  }
  .print-toc-id {
    font-size: 7.5pt;
    color: #888;
    font-family: 'Courier New', monospace;
    background: #ede9e0;
    padding: 0.5pt 3pt;
    border-radius: 2pt;
  }
  .print-toc-phase {
    font-size: 7.5pt;
    color: #666;
    font-style: italic;
    min-width: 50pt;
    text-align: right;
  }

  /* Fiches */
  .print-fiche {
    break-inside: avoid;
    page-break-inside: avoid;
    border: 1pt solid #ccc;
    border-radius: 4pt;
    padding: 14pt 16pt;
    margin-bottom: 16pt;
  }

  /* En-tête de fiche */
  .print-fiche-header {
    display: flex;
    align-items: flex-start;
    gap: 10pt;
    margin-bottom: 10pt;
    padding-bottom: 10pt;
    border-bottom: 1pt solid #e0ddd6;
  }
  .print-fiche-header-left {
    display: flex;
    align-items: flex-start;
    gap: 10pt;
    flex: 1;
  }
  .print-fiche-num {
    font-family: Georgia, serif;
    font-size: 22pt;
    font-weight: normal;
    color: #bbb;
    line-height: 1;
    min-width: 22pt;
    text-align: center;
  }
  .print-fiche-titre {
    font-family: Georgia, serif;
    font-size: 14pt;
    font-weight: normal;
    line-height: 1.3;
    margin: 0 0 3pt 0;
  }
  .print-fiche-id-phase {
    display: flex;
    gap: 6pt;
    align-items: center;
  }
  .print-fiche-id {
    font-family: 'Courier New', monospace;
    font-size: 7.5pt;
    color: #888;
    background: #f0ede6;
    padding: 0.5pt 3pt;
    border-radius: 2pt;
  }
  .print-fiche-phase {
    font-size: 7.5pt;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #666;
    font-family: Arial, sans-serif;
  }

  /* Grille méta */
  .print-fiche-meta-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6pt 12pt;
    margin-bottom: 10pt;
    background: #faf8f4;
    padding: 8pt 10pt;
    border-radius: 3pt;
  }
  .print-fiche-meta-label {
    font-size: 6.5pt;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: #999;
    font-family: Arial, sans-serif;
    margin-bottom: 1.5pt;
  }
  .print-fiche-meta-value {
    font-size: 9pt;
    font-weight: bold;
    color: #222;
  }

  /* Sections texte */
  .print-fiche-section {
    margin-bottom: 8pt;
  }
  .print-fiche-section-label {
    font-size: 6.5pt;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: #999;
    font-family: Arial, sans-serif;
    margin-bottom: 3pt;
  }
  .print-fiche-body {
    font-size: 9.5pt;
    line-height: 1.55;
    color: #222;
    margin: 0;
  }

  /* Bloc apprentissage clé */
  .print-fiche-apprentissage {
    background: #f0ede6;
    border-left: 3pt solid #a87a3f;
    padding: 7pt 10pt;
    border-radius: 0 3pt 3pt 0;
    margin-top: 8pt;
  }
  .print-fiche-apprentissage-text {
    font-size: 9.5pt;
    font-style: italic;
    color: #333;
    margin: 0;
    line-height: 1.5;
  }

  /* Pied de page document */
  .print-doc-footer {
    margin-top: 20pt;
    padding-top: 8pt;
    border-top: 1pt solid #ddd;
    text-align: center;
    font-size: 7.5pt;
    color: #aaa;
    font-family: Arial, sans-serif;
  }
}


/* ============================================================
   BOUTON NOUVELLE ACTIVITÉ (HEADER)
   ============================================================ */

.btn-nouvelle-activite {
  font-family: var(--sans);
  font-size: 13px;
  font-weight: 500;
  padding: 10px 18px;
  border-radius: 4px;
  border: 1px solid var(--accent-deep);
  background: var(--accent-deep);
  color: var(--bg-elevated);
  cursor: pointer;
  letter-spacing: 0.01em;
  transition: background 150ms ease, border-color 150ms ease;
  white-space: nowrap;
  align-self: center;
}
.btn-nouvelle-activite:hover {
  background: var(--text);
  border-color: var(--text);
}

/* ============================================================
   MODALE D'AJOUT — formulaire
   ============================================================ */

.modal-add {
  max-width: 780px;
  padding: 40px 48px;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--text-muted);
  font-weight: 500;
  margin-bottom: 8px;
}

.form-required {
  color: var(--accent-deep);
  margin-left: 2px;
}

.form-hint {
  color: var(--text-faint);
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  font-size: 11px;
}

.form-input {
  width: 100%;
  font-family: var(--sans);
  font-size: 13px;
  color: var(--text);
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  border-radius: 4px;
  padding: 9px 12px;
  outline: none;
  transition: border-color 120ms ease, box-shadow 120ms ease;
}
.form-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-soft);
}
.form-input-error {
  border-color: #c0392b;
  background: #fef9f9;
}
.form-input-error:focus {
  box-shadow: 0 0 0 2px rgba(192,57,43,0.1);
}

.form-textarea {
  width: 100%;
  font-family: var(--sans);
  font-size: 13px;
  color: var(--text);
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  border-radius: 4px;
  padding: 9px 12px;
  outline: none;
  resize: vertical;
  line-height: 1.55;
  transition: border-color 120ms ease, box-shadow 120ms ease;
}
.form-textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-soft);
}
.form-textarea.form-input-error {
  border-color: #c0392b;
}

.form-error {
  font-size: 11px;
  color: #c0392b;
  margin-top: 5px;
  letter-spacing: 0.01em;
}

/* Chips de sélection dans le formulaire */
.form-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.form-chip {
  font-family: var(--sans);
  font-size: 11px;
  padding: 5px 10px;
  border-radius: 3px;
  border: 1px solid var(--border-strong);
  background: var(--bg-elevated);
  color: var(--text-muted);
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease, border-color 120ms ease;
  font-weight: 400;
  letter-spacing: 0.01em;
}
.form-chip:hover {
  border-color: var(--accent);
  color: var(--accent-deep);
  background: var(--accent-soft);
}
.form-chip-active {
  background: var(--accent-deep);
  color: var(--bg-elevated);
  border-color: var(--accent-deep);
  font-weight: 500;
}
.form-chip-active:hover {
  background: var(--text);
  border-color: var(--text);
  color: var(--bg-elevated);
}

/* Thèmes sélectionnés dans le formulaire */
.form-themes-selected {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 8px;
  margin-bottom: 8px;
}

.form-theme-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 500;
  padding: 4px 9px;
  border-radius: 3px;
  background: var(--accent-soft);
  color: var(--accent-deep);
  border: 1px solid var(--accent);
}

.form-theme-chip-remove {
  background: none;
  border: none;
  color: var(--accent-deep);
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 0;
  display: flex;
  align-items: center;
  opacity: 0.6;
  transition: opacity 120ms ease;
}
.form-theme-chip-remove:hover { opacity: 1; }

/* Nouveau thème — input + bouton inline */
.form-new-theme {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.form-new-theme .form-input {
  flex: 1;
}

.btn-add-theme {
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 500;
  padding: 8px 14px;
  border-radius: 4px;
  border: 1px solid var(--accent-deep);
  background: var(--accent-soft);
  color: var(--accent-deep);
  cursor: pointer;
  white-space: nowrap;
  transition: background 120ms ease;
}
.btn-add-theme:hover:not(:disabled) { background: var(--accent-deep); color: #fff; }
.btn-add-theme:disabled { opacity: 0.35; cursor: default; }

/* Badge custom sur les cartes */
.card-custom-badge {
  font-size: 10px;
  background: var(--accent-soft);
  color: var(--accent-deep);
  border: 1px solid var(--accent);
  border-radius: 3px;
  padding: 2px 6px;
  font-weight: 500;
  letter-spacing: 0.03em;
}

/* Badge "modifiée" sur les cartes natives éditées */
.card-modifiee-badge {
  font-size: 10px;
  background: #f0f4ff;
  color: #3a5bd9;
  border: 1px solid #9ab0f5;
  border-radius: 3px;
  padding: 2px 6px;
  font-weight: 500;
  letter-spacing: 0.03em;
}

/* Bouton Réinitialiser dans le header */
.btn-reinitialiser {
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 500;
  padding: 8px 14px;
  border-radius: 4px;
  border: 1px solid #c0392b;
  background: #fef9f9;
  color: #c0392b;
  cursor: pointer;
  letter-spacing: 0.01em;
  transition: background 150ms ease, color 150ms ease;
  white-space: nowrap;
  align-self: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  line-height: 1.2;
}
.btn-reinitialiser:hover {
  background: #c0392b;
  color: #fff;
}
.btn-reinitialiser-badge {
  font-size: 10px;
  font-weight: 400;
  opacity: 0.8;
}

/* Actions custom dans la modale de détail */
.modal-custom-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
}

.btn-custom-edit {
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 500;
  padding: 7px 14px;
  border-radius: 4px;
  border: 1px solid var(--accent-deep);
  background: var(--accent-soft);
  color: var(--accent-deep);
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;
  letter-spacing: 0.01em;
}
.btn-custom-edit:hover {
  background: var(--accent-deep);
  color: var(--bg-elevated);
}

.btn-custom-delete {
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 500;
  padding: 7px 14px;
  border-radius: 4px;
  border: 1px solid #c0392b;
  background: #fef9f9;
  color: #c0392b;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;
  letter-spacing: 0.01em;
}
.btn-custom-delete:hover {
  background: #c0392b;
  color: #fff;
}

/* ====================================================
   MODALE CHOIX IMPORT
   ==================================================== */

.modal-choix {
  max-width: 520px;
}

.choix-import-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-top: 4px;
}

.choix-import-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 16px;
  border: 1.5px solid var(--border-strong);
  border-radius: 8px;
  background: var(--bg-elevated);
  cursor: pointer;
  transition: border-color 140ms ease, box-shadow 140ms ease, background 140ms ease;
  font-family: var(--sans);
  text-align: center;
}
.choix-import-card:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
  box-shadow: 0 4px 16px rgba(168,122,63,0.1);
}

.choix-import-icon { font-size: 28px; line-height: 1; }
.choix-import-label { font-size: 14px; font-weight: 600; color: var(--text); letter-spacing: -0.01em; }
.choix-import-desc { font-size: 11px; color: var(--text-muted); line-height: 1.45; }

/* ====================================================
   MODALE IMPORT FICHIER
   ==================================================== */

.modal-import {
  max-width: 680px;
}

.import-dropzone {
  border: 2px dashed var(--border-strong);
  border-radius: 8px;
  padding: 36px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: border-color 140ms ease, background 140ms ease;
  margin-bottom: 24px;
  background: var(--bg);
}
.import-dropzone:hover,
.import-dropzone-active {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.import-dropzone-icon { font-size: 32px; margin-bottom: 4px; }
.import-dropzone-label { font-size: 14px; font-weight: 500; color: var(--text); }
.import-dropzone-hint { font-size: 12px; color: var(--text-muted); }

.import-formats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 4px;
}

.import-format-block {
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 12px;
}

.import-format-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.import-format-code {
  font-family: 'Menlo', 'Consolas', monospace;
  font-size: 10px;
  line-height: 1.55;
  color: var(--text);
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
}

.import-loading {
  text-align: center;
  padding: 40px;
  font-size: 14px;
  color: var(--text-muted);
}

.import-erreur-bloc {
  background: #fef9f9;
  border: 1px solid #e8b8b8;
  border-radius: 6px;
  padding: 20px;
  margin: 8px 0;
}
.import-erreur-titre { font-size: 14px; font-weight: 600; color: #c0392b; margin-bottom: 8px; }
.import-erreur-msg {
  font-size: 12px;
  color: #922b21;
  line-height: 1.5;
  font-family: 'Menlo', 'Consolas', monospace;
  white-space: pre-wrap;
}

.import-preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}
.import-preview-count { font-size: 14px; font-weight: 600; color: var(--text); }

.import-preview-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 280px;
  overflow-y: auto;
  margin-bottom: 20px;
  padding-right: 4px;
}

.import-preview-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: 5px;
  padding: 10px 12px;
}

.import-preview-num {
  font-size: 11px;
  font-weight: 600;
  color: var(--accent-deep);
  background: var(--accent-soft);
  border-radius: 3px;
  padding: 2px 6px;
  flex-shrink: 0;
  margin-top: 1px;
}

.import-preview-titre { font-size: 13px; font-weight: 500; color: var(--text); margin-bottom: 2px; }
.import-preview-meta { font-size: 11px; color: var(--text-muted); }

`;
