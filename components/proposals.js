export const originals = [
  { slug: 'serra', short: 'Serra', title: 'Serra Serena' },
  { slug: 'brisa', short: 'Brisa', title: 'Brisa Entre Vales' },
  { slug: 'estelar', short: 'Céu', title: 'Céu de Casa' },
];

export const hybrids = [
  { slug: 'serra-lunar', short: 'Lua', title: 'Serra Lunar', banks: [
    { ridge: 'serra', mountain: 'serra', clouds: 'estelar', wind: 'estelar' },
    { ridge: 'serra', mountain: 'serra', clouds: 'estelar', wind: 'estelar' },
  ] },
  { slug: 'horizonte-sereno', short: 'Vale', title: 'Horizonte Sereno', banks: [
    { ridge: 'estelar', mountain: 'estelar', clouds: 'serra', wind: 'serra' },
    { ridge: 'estelar', mountain: 'estelar', clouds: 'serra', wind: 'estelar' },
  ] },
  { slug: 'ceu-das-serras', short: 'Serras', title: 'Céu das Serras', banks: [
    { ridge: 'serra', mountain: 'serra', clouds: 'estelar', wind: 'serra' },
    { ridge: 'estelar', mountain: 'estelar', clouds: 'serra', wind: 'estelar' },
  ] },
];

// Refinements inherit the selected composition, changing only its lower ornament.
export const refinements = [
  { slug: 'ceu-aberto', short: 'Aberto', title: 'Céu Aberto', base: 'ceu-das-serras', lower: 'none' },
  { slug: 'brisa-das-serras', short: 'Brisa', title: 'Brisa das Serras', base: 'ceu-das-serras', lower: 'mist' },
];
