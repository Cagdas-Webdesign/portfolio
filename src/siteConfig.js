/*
 * Zentrale Stelle fuer Kontakt- und Repository-Angaben des Portfolios.
 * Hero, Menue, Leistungs-Pop-ups und RAG-Section lesen nur von hier.
 *
 * Leerer String = existiert noch nicht. Die Komponenten zeigen dann ihren
 * neutralen Zustand (kein toter Link, keine erfundene Adresse).
 */

/** Kontakt-E-Mail (mailto-Links im Hero, im Menue und in den Pop-ups). */
export const CONTACT_MAIL = 'ucarcagdas18@gmail.com';

/** GitHub-Profil (kein Repository). */
export const GITHUB_PROFILE_URL = 'https://github.com/Cagdas-Webdesign';

/**
 * Oeffentliches Repository DIESES React-Portfolios.
 * Verlinkt „Open Repository“ im Hero und „React Portfolio“ im Menue; das
 * Menue zeigt den neuesten GitHub-Release dieses Repositorys automatisch
 * (services/githubRelease.js), sobald einer veroeffentlicht ist.
 *
 * Nicht verwechseln: Cagdas-Webdesign/Cagdas-Webdesign ist das
 * Profil-README-Repository, Cagdas-Webdesign/Cagdas-Portfolio die
 * fruehere statische HTML-Version.
 */
export const REACT_PORTFOLIO_REPOSITORY_URL = 'https://github.com/Cagdas-Webdesign/portfolio';

/** Repository des RAG-Backends (Portfolio Assistant). */
export const RAG_BACKEND_REPOSITORY_URL = 'https://github.com/Cagdas-Webdesign/portfolio-rag-backend';
