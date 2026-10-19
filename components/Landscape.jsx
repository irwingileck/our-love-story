import Cloud from '../assets/nuvem_inf.svg';
import styles from './Landscape.module.css';

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

function MountainDrawing() {
  return (
    <g className={styles.mountainDrawing}>
      <path d="M-30 910 40 820 67 832 155 681 232 792 258 782 366 925 M67 832 155 681 134 771 183 748 232 792 M155 681 179 779 212 831 M134 771 100 841 M183 748 244 860 M40 820 81 879" />
      {Array.from({ length: 13 }, (_, i) => <path key={i} d={`M${147 - i * 4} ${714 + i * 10} l${-42 - i * 2} ${69 - i * 2}`} />)}
      <path d="M-25 930 Q65 869 150 908 T352 934 M-30 942 Q60 880 150 920 T376 948" />
    </g>
  );
}

export default function Landscape({ variant }) {
  const flowing = variant === 'brisa';
  const celestial = variant === 'estelar';
  const desktopRidges = celestial ? estelarDesktop : flowing ? brisaDesktop : serraDesktop;
  const mobileRidges = celestial ? estelarMobile : flowing ? brisaMobile : serraMobile;
  return (
    <div data-landscape={variant} className={`landscape ${styles.landscape} ${styles[variant] || ''}`} aria-hidden="true">
      <div data-layer="mountains" className={styles.layer}>
        {['left', 'right'].map((side) => <div className={`${styles.bank} ${styles[side]}`} key={side}>
          <svg className="landscape-desktop" viewBox="0 0 500 1000" preserveAspectRatio="none" focusable="false">
            {desktopRidges.map((d, index) => <path key={d} d={d} className={styles[`ridge${index}`]} />)}
          </svg>
          <svg className="landscape-mobile" viewBox="0 0 340 1000" preserveAspectRatio="none" focusable="false">
            {mobileRidges.map((d, index) => <path key={d} d={d} className={styles[`ridge${index}`]} />)}
          </svg>
        </div>)}
      </div>
      <div data-layer="ornaments" className={`${styles.layer} ${styles.ornaments}`}>
        {['left', 'right'].map((side) => <svg key={side} className={`landscape-desktop ${styles.bank} ${styles[side]}`} viewBox="0 0 500 1000" preserveAspectRatio="xMinYMid meet" focusable="false">
          <g transform={celestial ? 'translate(0 80)' : flowing ? (side === 'left' ? 'translate(-35 90)' : 'translate(5 -120) scale(.9)') : undefined}><MountainDrawing /></g>
          <Cloud focusable="false" data-decorative-cloud className={styles.cloud} x={flowing ? '-120' : '-60'} y={flowing && side === 'right' ? '680' : '864'} width="290" height="146" />
          <Cloud focusable="false" data-decorative-cloud className={`${styles.cloud} ${styles.highCloud}`} x="-100" y={celestial ? '510' : flowing ? '320' : '70'} width="290" height="146" />
          {celestial && <g className={styles.skyArc}>
            <path d="M-70 345 A190 190 0 0 1 290 240 M-62 352 A182 182 0 0 1 273 238 M27 180 A70 70 0 0 0 123 257 A60 60 0 0 1 27 180" />
            <path d="M18 389 93 350 153 398 231 365" strokeDasharray="2 7" />
            {[ [18,389], [93,350], [153,398], [231,365] ].map(([x,y]) => <circle key={x} cx={x} cy={y} r="2" />)}
          </g>}
          <g className={styles.wind}>
            {flowing ? <>
              <path d="M-100 180 C36 88 110 290 260 213 S395 180 470 234 M-100 194 C36 102 110 304 260 227 S395 194 470 248 M-100 208 C36 116 110 318 260 241 S395 208 470 262" />
              <path d="M-50 620 C54 486 151 738 303 645 M-50 635 C54 501 151 753 303 660" />
            </> : <>
              <path d="M-80 272 Q40 220 145 268 T352 290 M-80 284 Q40 233 145 280 T338 302" />
              <path d="M-80 612 Q10 564 76 603 T243 642 M-80 624 Q10 576 76 615 T225 653" />
            </>}
          </g>
        </svg>)}
        {['left', 'right'].map((side) => <svg key={side} className={`landscape-mobile ${styles.bank} ${styles[side]}`} viewBox="0 0 220 1000" preserveAspectRatio="none" focusable="false">
          <svg data-corner-mountain x="-35" y={flowing && side === 'right' ? '770' : '820'} width="170" height="170" viewBox="-30 660 420 340" focusable="false"><MountainDrawing /></svg>
          <Cloud focusable="false" data-decorative-cloud className={styles.cloud} x="-65" y="910" width="175" height="88" />
          <Cloud focusable="false" data-decorative-cloud className={`${styles.cloud} ${styles.highCloud}`} x="-95" y={celestial ? '570' : flowing ? '370' : '105'} width="170" height="86" />
          <g className={styles.wind}>
            <path d={flowing ? 'M-30 245 Q24 210 60 249 T166 265 M-30 259 Q24 224 60 263 T156 279 M-30 625 Q20 583 61 625 T170 651' : 'M-30 315 Q30 284 73 310 T167 326 M-30 328 Q30 297 73 323 T157 339 M-30 715 Q30 676 66 707 T155 730'} />
          </g>
          {celestial && <g className={styles.skyArc}>
            <path d="M-45 235 A95 95 0 0 1 125 175 M-40 242 A90 90 0 0 1 115 179 M5 341 54 316 93 352" strokeDasharray="2 6" />
            <circle cx="5" cy="341" r="2" /><circle cx="54" cy="316" r="2" /><circle cx="93" cy="352" r="2" />
          </g>}
        </svg>)}
      </div>
      <div data-layer="particles" className={`${styles.layer} ${styles.particles}`}>
        {(celestial ? skyDust : dust).map(([x, y, star], index) => <span data-particle key={index} className={`${styles.particle} ${star ? styles.star : styles.dot}`} style={{ left: `${x}%`, top: `${y}%`, '--drift-duration': `${18 + index * 3}s`, '--drift-delay': `${-index * 2}s` }}>
          <svg viewBox="0 0 16 24" focusable="false">{star ? <path d="M8 1 Q8 10 14 12 Q8 14 8 23 Q8 14 2 12 Q8 10 8 1Z" /> : <circle cx="8" cy="12" r="2.3" />}</svg>
        </span>)}
      </div>
    </div>
  );
}
