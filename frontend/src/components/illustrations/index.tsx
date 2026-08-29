/**
 * Inline SVG illustrations — self-contained React components.
 * No external CDN. All paths hand-crafted in the DukaSync brand palette.
 * Each component accepts className and aria-label for accessibility.
 */

interface IllustrationProps {
  className?: string
  'aria-label'?: string
}

// ─── Empty Inventory ─────────────────────────────────────────────────────────
export function EmptyInventoryIllustration({ className = 'w-48 h-48', ...props }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={props['aria-label'] ?? 'Empty inventory shelf illustration'}
    >
      {/* shelf back */}
      <rect x="20" y="140" width="160" height="10" rx="3" fill="#CBD5E1" />
      <rect x="20" y="90" width="160" height="10" rx="3" fill="#CBD5E1" />
      {/* shelf sides */}
      <rect x="18" y="88" width="8" height="64" rx="3" fill="#94A3B8" />
      <rect x="174" y="88" width="8" height="64" rx="3" fill="#94A3B8" />
      {/* empty boxes — outlines only */}
      <rect x="38" y="105" width="28" height="33" rx="4" stroke="#CBD5E1" strokeWidth="2" fill="white" />
      <rect x="76" y="105" width="28" height="33" rx="4" stroke="#CBD5E1" strokeWidth="2" fill="white" />
      <rect x="114" y="105" width="28" height="33" rx="4" stroke="#CBD5E1" strokeWidth="2" fill="white" />
      <rect x="152" y="105" width="18" height="33" rx="4" stroke="#CBD5E1" strokeWidth="2" fill="white" />
      {/* dashed lines inside boxes */}
      <line x1="44" y1="119" x2="60" y2="119" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="3 2" />
      <line x1="82" y1="119" x2="98" y2="119" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="3 2" />
      <line x1="120" y1="119" x2="136" y2="119" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="3 2" />
      {/* magnifier */}
      <circle cx="100" cy="60" r="22" stroke="#818CF8" strokeWidth="3" fill="white" />
      <circle cx="100" cy="60" r="14" fill="#EEF2FF" />
      <line x1="116" y1="76" x2="126" y2="88" stroke="#818CF8" strokeWidth="3.5" strokeLinecap="round" />
      {/* question mark */}
      <text x="94" y="66" fontSize="16" fontWeight="700" fill="#818CF8" fontFamily="sans-serif">?</text>
    </svg>
  )
}

// ─── Empty Sales ─────────────────────────────────────────────────────────────
export function EmptySalesIllustration({ className = 'w-48 h-48', ...props }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={props['aria-label'] ?? 'Empty sales chart illustration'}
    >
      {/* chart area */}
      <rect x="24" y="40" width="152" height="110" rx="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
      {/* grid lines */}
      <line x1="24" y1="100" x2="176" y2="100" stroke="#F1F5F9" strokeWidth="1" />
      <line x1="24" y1="75" x2="176" y2="75" stroke="#F1F5F9" strokeWidth="1" />
      <line x1="24" y1="125" x2="176" y2="125" stroke="#F1F5F9" strokeWidth="1" />
      {/* x axis */}
      <line x1="24" y1="150" x2="176" y2="150" stroke="#CBD5E1" strokeWidth="2" />
      {/* empty bar outlines */}
      {[40, 62, 84, 106, 128, 150].map((x, i) => (
        <rect key={i} x={x} y="110" width="14" height="38" rx="3" stroke="#E2E8F0" strokeWidth="1.5" fill="white" strokeDasharray="4 3" />
      ))}
      {/* trend arrow going up */}
      <polyline points="50,130 80,105 110,115 140,75 160,65" stroke="#34D399" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="160" cy="65" r="4" fill="#34D399" />
      {/* KES coin */}
      <circle cx="100" cy="170" r="16" fill="#FEF3C7" stroke="#FCD34D" strokeWidth="2" />
      <text x="94" y="175" fontSize="11" fontWeight="700" fill="#D97706" fontFamily="sans-serif">KES</text>
    </svg>
  )
}

// ─── No Restock Orders ────────────────────────────────────────────────────────
export function NoOrdersIllustration({ className = 'w-48 h-48', ...props }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={props['aria-label'] ?? 'No restock orders illustration'}
    >
      {/* clipboard */}
      <rect x="45" y="45" width="110" height="130" rx="8" fill="white" stroke="#CBD5E1" strokeWidth="2" />
      <rect x="70" y="38" width="60" height="18" rx="6" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.5" />
      {/* clip */}
      <rect x="88" y="34" width="24" height="10" rx="5" fill="#94A3B8" />
      {/* lines */}
      <line x1="62" y1="85" x2="138" y2="85" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
      <line x1="62" y1="103" x2="138" y2="103" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
      <line x1="62" y1="121" x2="120" y2="121" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
      {/* checkboxes */}
      <rect x="62" y="78" width="10" height="10" rx="2" stroke="#CBD5E1" strokeWidth="1.5" fill="white" />
      <rect x="62" y="96" width="10" height="10" rx="2" stroke="#CBD5E1" strokeWidth="1.5" fill="white" />
      <rect x="62" y="114" width="10" height="10" rx="2" stroke="#CBD5E1" strokeWidth="1.5" fill="white" />
      {/* big green tick overlay */}
      <circle cx="138" cy="148" r="22" fill="#D1FAE5" stroke="#6EE7B7" strokeWidth="2" />
      <polyline points="128,148 135,156 150,138" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

// ─── Welcome — morning ────────────────────────────────────────────────────────
export function WelcomeMorningIllustration({ className = 'w-40 h-40', ...props }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={props['aria-label'] ?? 'Morning sunrise illustration'}
    >
      {/* horizon */}
      <ellipse cx="80" cy="118" rx="70" ry="14" fill="#FEF3C7" />
      {/* sun */}
      <circle cx="80" cy="80" r="26" fill="#FCD34D" />
      {/* rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        const x1 = 80 + 32 * Math.cos(rad)
        const y1 = 80 + 32 * Math.sin(rad)
        const x2 = 80 + 44 * Math.cos(rad)
        const y2 = 80 + 44 * Math.sin(rad)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
      })}
      {/* small shop building */}
      <rect x="52" y="108" width="56" height="32" rx="3" fill="#1F3D2E" />
      <rect x="68" y="116" width="24" height="24" rx="2" fill="#4B7F52" />
      {/* door arch */}
      <path d="M72 140 L72 126 Q80 118 88 126 L88 140" fill="#0F2519" />
      {/* window */}
      <rect x="56" y="112" width="10" height="10" rx="1" fill="#FEF3C7" opacity="0.7" />
      <rect x="94" y="112" width="10" height="10" rx="1" fill="#FEF3C7" opacity="0.7" />
    </svg>
  )
}

// ─── Welcome — afternoon ──────────────────────────────────────────────────────
export function WelcomeAfternoonIllustration({ className = 'w-40 h-40', ...props }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={props['aria-label'] ?? 'Afternoon sun illustration'}
    >
      <circle cx="80" cy="52" r="28" fill="#FBBF24" />
      {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        return <line key={i} x1={80 + 34 * Math.cos(rad)} y1={52 + 34 * Math.sin(rad)} x2={80 + 46 * Math.cos(rad)} y2={52 + 46 * Math.sin(rad)} stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
      })}
      {/* store front */}
      <rect x="30" y="100" width="100" height="48" rx="4" fill="#1F3D2E" />
      <rect x="30" y="88" width="100" height="18" rx="3" fill="#4B7F52" />
      {/* awning stripes */}
      {[0,1,2,3,4].map(i => <rect key={i} x={30 + i * 20} y="88" width="10" height="18" fill="#2D6A4F" />)}
      {/* sign */}
      <rect x="46" y="92" width="68" height="10" rx="2" fill="#F6F3EA" opacity="0.15" />
      {/* door */}
      <rect x="62" y="116" width="36" height="32" rx="3" fill="#0F2519" />
      <circle cx="94" cy="133" r="2" fill="#4B7F52" />
    </svg>
  )
}

// ─── Welcome — evening / night ────────────────────────────────────────────────
export function WelcomeEveningIllustration({ className = 'w-40 h-40', ...props }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={props['aria-label'] ?? 'Evening moon and stars illustration'}
    >
      {/* night sky gradient circle */}
      <circle cx="80" cy="80" r="72" fill="#0F172A" />
      {/* moon */}
      <circle cx="90" cy="52" r="22" fill="#FEF3C7" />
      <circle cx="100" cy="46" r="18" fill="#0F172A" />
      {/* stars */}
      {[[38,30],[120,28],[50,55],[130,65],[35,70],[118,44]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.5" fill="white" opacity="0.8" />
      ))}
      {/* lit shop */}
      <rect x="35" y="108" width="90" height="44" rx="4" fill="#1F3D2E" />
      {/* lit windows */}
      <rect x="46" y="116" width="18" height="14" rx="2" fill="#FEF3C7" opacity="0.9" />
      <rect x="96" y="116" width="18" height="14" rx="2" fill="#FEF3C7" opacity="0.9" />
      {/* door */}
      <rect x="66" y="122" width="28" height="30" rx="2" fill="#0F2519" />
      {/* glow under windows */}
      <ellipse cx="55" cy="132" rx="12" ry="4" fill="#FEF3C7" opacity="0.12" />
      <ellipse cx="105" cy="132" rx="12" ry="4" fill="#FEF3C7" opacity="0.12" />
    </svg>
  )
}

// ─── Login brand panel illustration ──────────────────────────────────────────
export function LoginIllustration({ className = 'w-64 h-64', ...props }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 260 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={props['aria-label'] ?? 'Shop owner managing DukaSync dashboard illustration'}
    >
      {/* desk */}
      <rect x="30" y="185" width="200" height="12" rx="4" fill="#4B7F52" />
      <rect x="50" y="197" width="10" height="45" rx="3" fill="#2D6A4F" />
      <rect x="200" y="197" width="10" height="45" rx="3" fill="#2D6A4F" />
      {/* laptop body */}
      <rect x="80" y="130" width="100" height="58" rx="6" fill="#1E293B" />
      <rect x="84" y="134" width="92" height="50" rx="4" fill="#0EA5E9" opacity="0.15" />
      {/* screen content — mini bars */}
      <rect x="90" y="158" width="8" height="18" rx="2" fill="#34D399" />
      <rect x="102" y="152" width="8" height="24" rx="2" fill="#34D399" />
      <rect x="114" y="155" width="8" height="21" rx="2" fill="#34D399" opacity="0.7" />
      <rect x="126" y="148" width="8" height="28" rx="2" fill="#34D399" />
      <rect x="138" y="153" width="8" height="23" rx="2" fill="#34D399" opacity="0.6" />
      <rect x="150" y="156" width="8" height="20" rx="2" fill="#34D399" opacity="0.8" />
      {/* laptop base */}
      <rect x="68" y="187" width="124" height="8" rx="4" fill="#334155" />
      {/* person */}
      {/* head */}
      <circle cx="130" cy="95" r="22" fill="#FBBF24" />
      {/* hair */}
      <path d="M108 88 Q130 68 152 88" fill="#1C1917" />
      {/* body */}
      <rect x="100" y="116" width="60" height="30" rx="8" fill="#4B7F52" />
      {/* arms reaching toward laptop */}
      <path d="M100 128 Q75 140 82 155" stroke="#FBBF24" strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d="M160 128 Q185 140 178 155" stroke="#FBBF24" strokeWidth="12" strokeLinecap="round" fill="none" />
      {/* floating KES badge */}
      <circle cx="205" cy="80" r="18" fill="#D1FAE5" stroke="#6EE7B7" strokeWidth="1.5" />
      <text x="196" y="85" fontSize="9" fontWeight="700" fill="#059669" fontFamily="sans-serif">KES</text>
      {/* floating chart badge */}
      <circle cx="55" cy="100" r="16" fill="#EEF2FF" stroke="#A5B4FC" strokeWidth="1.5" />
      <polyline points="46,106 51,100 56,103 64,94" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}
