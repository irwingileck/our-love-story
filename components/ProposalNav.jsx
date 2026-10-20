import Head from 'next/head';
import Link from 'next/link';
import styles from './Landscape.module.css';

import { originals, hybrids, refinements } from './proposals';

export default function ProposalNav({ variant }) {
  const proposals = refinements.some(proposal => proposal.slug === variant) ? refinements : hybrids.some(proposal => proposal.slug === variant) ? hybrids : originals;
  const current = proposals.find((proposal) => proposal.slug === variant);
  return <>
    <Head>
      <title>{`${current.title} · Estudo de paisagem`}</title>
      <meta name="robots" content="noindex, nofollow" />
    </Head>
    <nav className={styles.navigation} aria-label="Comparar paisagens">
      {proposals.map(({ slug, short, title }) => <Link key={slug} href={`/propostas/${slug}`} aria-label={title} title={title} aria-current={variant === slug ? 'page' : undefined}>{short}</Link>)}
    </nav>
  </>;
}
