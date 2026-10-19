import Head from 'next/head';
import Link from 'next/link';
import styles from './Landscape.module.css';

const proposals = [
  { slug: 'serra', short: 'Serra', title: 'Serra Serena' },
  { slug: 'brisa', short: 'Brisa', title: 'Brisa Entre Vales' },
  { slug: 'estelar', short: 'Céu', title: 'Céu de Casa' },
];

export default function ProposalNav({ variant }) {
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
