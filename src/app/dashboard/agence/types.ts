export type NavItem =
  | 'home'
  | 'check-in'
  | 'comite-organisation'
  | 'inscriptions-liste'
  | 'inscriptions-membre'
  | 'inscriptions-non-membre'
  | 'inscriptions-vip'
  | 'inscriptions-speaker'
  | 'inscriptions-planvol'
  | 'organisations-liste'
  | 'organisations-membre'
  | 'organisations-non-membre'
  | 'organisations-sponsor'
  | 'networking-liste'
  | 'networking-participant'
  | 'networking-sponsor'
  | 'networking-historique';

export type InscriptionSubSection = 'membre' | 'non-membre' | 'vip' | 'speaker' | 'planvol';
export type OrganisationSubSection = 'membre' | 'non-membre' | 'sponsor' | 'liste';
export type NetworkingSubSection = 'participant' | 'sponsor' | 'liste' | 'historique';

