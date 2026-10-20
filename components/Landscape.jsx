import SerraMountain from '../assets/landscapes/serra/mountain.svg';
import SerraClouds from '../assets/landscapes/serra/clouds.svg';
import SerraWind from '../assets/landscapes/serra/wind.svg';
import BrisaMountain from '../assets/landscapes/brisa/mountain.svg';
import BrisaClouds from '../assets/landscapes/brisa/clouds.svg';
import BrisaWind from '../assets/landscapes/brisa/wind.svg';
import EstelarMountain from '../assets/landscapes/estelar/mountain.svg';
import EstelarClouds from '../assets/landscapes/estelar/clouds.svg';
import EstelarWind from '../assets/landscapes/estelar/wind.svg';
import MistLeft from '../assets/landscapes/refinements/mist-left.svg';
import MistRight from '../assets/landscapes/refinements/mist-right.svg';
import styles from './Landscape.module.css';
import { hybrids, refinements } from './proposals';

// Drawn in local side coordinates: the two banks never stretch across the message.
const serraDesktop = [
  'M-30 250 Q35 205 70 162 L106 192 137 174 184 222 222 265 256 254 313 322 361 345 414 386 500 420 V1000 H-30Z',
  'M-30 416 27 350 68 370 114 330 152 363 184 352 229 410 273 431 300 419 Q380 489 500 523 V1000 H-30Z',
  'M-30 605 Q25 565 75 506 L103 515 133 487 172 533 215 555 244 547 290 590 Q370 652 500 666 V1000 H-30Z',
  'M-30 844 30 782 74 794 115 742 149 760 178 739 227 788 258 802 302 842 Q408 900 500 892 V1000 H-30Z',
];
const serraMobile = [
  'M-20 150 35 126 64 155 95 142 130 187 170 209 216 255 270 270 340 330 V1000 H-20Z',
  'M-20 325 18 287 56 314 91 290 125 330 164 346 199 394 258 415 340 480 V1000 H-20Z',
  'M-20 570 22 520 52 528 81 499 116 552 151 561 198 614 250 633 340 680 V1000 H-20Z',
  'M-20 861 27 796 60 810 92 775 138 814 182 824 229 867 340 900 V1000 H-20Z',
];

const brisaDesktop = [
  'M-30 90 Q33 63 92 125 Q149 203 204 226 Q300 266 364 345 Q420 398 500 420 V1000 H-30Z',
  'M-30 270 Q65 200 128 290 Q181 370 243 387 Q336 410 388 490 Q428 542 500 559 V1000 H-30Z',
  'M-30 500 Q68 412 147 488 Q213 567 284 580 Q340 590 400 660 L500 702 V1000 H-30Z',
  'M-30 790 Q66 698 151 760 Q213 817 298 835 Q370 858 500 875 V1000 H-30Z',
];
const brisaMobile = [
  'M-20 100 Q20 65 74 160 Q124 227 174 240 Q221 270 340 350 V1000 H-20Z',
  'M-20 310 Q32 235 91 329 T204 420 L340 480 V1000 H-20Z',
  'M-20 570 Q45 480 106 560 T222 640 L340 710 V1000 H-20Z',
  'M-20 850 Q40 740 118 824 Q170 864 340 910 V1000 H-20Z',
];
const estelarDesktop = [
  'M-30 690 42 625 80 646 135 592 194 650 240 638 301 686 Q392 735 500 748 V1000 H-30Z',
  'M-30 800 38 750 90 768 144 710 183 736 212 725 281 786 Q390 829 500 837 V1000 H-30Z',
  'M-30 878 Q34 814 88 836 L151 797 195 840 239 830 Q354 894 500 909 V1000 H-30Z',
  'M-30 970 Q55 894 119 918 L170 888 220 924 Q360 974 500 970 V1000 H-30Z',
];
const estelarMobile = [
  'M-20 720 32 665 57 682 104 637 154 702 191 688 236 735 340 772 V1000 H-20Z',
  'M-20 821 31 774 68 788 112 746 153 787 190 775 241 824 340 850 V1000 H-20Z',
  'M-20 906 35 845 75 869 118 833 164 871 198 864 250 906 340 923 V1000 H-20Z',
  'M-20 985 40 931 80 947 126 919 169 951 234 975 340 987 V1000 H-20Z',
];
const skyDust = [[8, 12, true], [17, 20, false], [5, 32, false], [22, 39, true], [10, 58, false], [4, 80, true], [93, 12, false], [84, 22, true], [96, 35, false], [79, 47, false], [91, 62, true], [97, 84, false], [20, 91, false]];
const dust = [[7, 10, true], [19, 25, false], [4, 48, false], [12, 69, true], [23, 91, false], [94, 17, true], [86, 40, false], [96, 65, false], [86, 88, true]];

const kits = {
  serra: { Mountain: SerraMountain, Clouds: SerraClouds, Wind: SerraWind },
  brisa: { Mountain: BrisaMountain, Clouds: BrisaClouds, Wind: BrisaWind },
  estelar: { Mountain: EstelarMountain, Clouds: EstelarClouds, Wind: EstelarWind },
};

export default function Landscape({ variant }) {
  const refinement = refinements.find(proposal => proposal.slug === variant);
  const composition = refinement?.base || variant;
  const hybrid = hybrids.find(proposal => proposal.slug === composition);
  const banks = hybrid?.banks || ['left', 'right'].map(() => ({ ridge: variant, mountain: variant, clouds: variant, wind: variant }));
  const ridges = { serra: [serraDesktop, serraMobile], brisa: [brisaDesktop, brisaMobile], estelar: [estelarDesktop, estelarMobile] };
  const celestial = variant === 'estelar';
  return (
    <div data-landscape={variant} className={`landscape ${styles.landscape} ${styles[composition] || ''}`} aria-hidden="true">
      <div data-layer="mountains" className={styles.layer}>
        {['left', 'right'].map((side, index) => <div data-ridge-bank={side} data-ridge-kit={banks[index].ridge} className={`${styles.bank} ${styles[side]}`} key={side}>
          <svg className="landscape-desktop" viewBox="0 0 500 1000" preserveAspectRatio="none" focusable="false">
            {ridges[banks[index].ridge][0].map((d, index) => <path key={d} d={d} className={styles[`ridge${index}`]} />)}
          </svg>
          <svg className="landscape-mobile" viewBox="0 0 340 1000" preserveAspectRatio="none" focusable="false">
            {ridges[banks[index].ridge][1].map((d, index) => <path key={d} d={d} className={styles[`ridge${index}`]} />)}
          </svg>
        </div>)}
      </div>
      <div data-layer="ornaments" className={`${styles.layer} ${styles.ornaments}`}>
        {['desktop', 'mobile'].map((size) => ['left', 'right'].map((side, index) => {
          const bank = banks[index];
          const Mountain = kits[bank.mountain].Mountain;
          const Clouds = kits[bank.clouds].Clouds;
          const Wind = kits[bank.wind].Wind;
          const Mist = side === 'left' ? MistLeft : MistRight;
          return <div data-art-bank={side} key={`${size}-${side}`} className={`landscape-${size} ${styles.artBank} ${side === 'left' ? styles.artLeft : styles.artRight}`}>
            {!refinement && <Mountain data-artwork={`${bank.mountain}-mountain`} data-corner-mountain className={styles.peak} focusable="false" />}
            {refinement?.lower === 'mist' && <Mist data-artwork={`valley-mist-${side}`} data-lower-mist className={styles.mist} aria-hidden="true" focusable="false" />}
            <Clouds data-artwork={`${bank.clouds}-clouds`} data-decorative-cloud className={styles.cloud} focusable="false" />
            <Wind data-artwork={`${bank.wind}-wind`} className={styles.wind} focusable="false" />
          </div>;
        }))}
      </div>
      <div data-layer="particles" className={`${styles.layer} ${styles.particles}`}>
        {(celestial ? skyDust : dust).map(([x, y, star], index) => <span data-particle key={index} className={`${styles.particle} ${star ? styles.star : styles.dot}`} style={{ left: `${x}%`, top: `${y}%`, '--drift-duration': `${18 + index * 3}s`, '--drift-delay': `${-index * 2}s` }}>
          <svg viewBox="0 0 16 24" focusable="false">{star ? <path d="M8 1 Q8 10 14 12 Q8 14 8 23 Q8 14 2 12 Q8 10 8 1Z" /> : <circle cx="8" cy="12" r="2.3" />}</svg>
        </span>)}
      </div>
    </div>
  );
}
