interface CrestProps {
  size?: number;
  className?: string;
}

export function Crest({ size = 36, className }: CrestProps) {
  return (
    <svg
      width={size}
      height={size * (76 / 64)}
      viewBox="0 0 64 76"
      fill="none"
      aria-label="FM Clubhouse crest"
      className={className}
    >
      <defs>
        <linearGradient id="crestBrass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#EBD897" />
          <stop offset="0.45" stopColor="#D4B354" />
          <stop offset="1" stopColor="#8A6A12" />
        </linearGradient>
        <linearGradient id="crestShield" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1B4332" />
          <stop offset="1" stopColor="#0F2A1E" />
        </linearGradient>
      </defs>
      <path
        d="M4 8 C 4 6, 6 4, 8 4 L 56 4 C 58 4, 60 6, 60 8 L 60 38 C 60 56, 46 68, 32 72 C 18 68, 4 56, 4 38 Z"
        fill="url(#crestShield)"
        stroke="url(#crestBrass)"
        strokeWidth="1.5"
      />
      <path
        d="M9 13 L 55 13 L 55 38 C 55 53, 43 63, 32 67 C 21 63, 9 53, 9 38 Z"
        fill="none"
        stroke="url(#crestBrass)"
        strokeWidth="0.6"
        opacity="0.55"
      />
      <g stroke="url(#crestBrass)" strokeWidth="2.4" strokeLinecap="round" fill="none">
        <line x1="20" y1="22" x2="44" y2="56" />
        <line x1="44" y1="22" x2="20" y2="56" />
      </g>
      <ellipse cx="19" cy="57" rx="4.4" ry="2.6" fill="url(#crestBrass)" transform="rotate(-32 19 57)" />
      <path d="M42 53 Q 49 56 46.5 60 Q 44 64 41 60 Z" fill="url(#crestBrass)" />
      <path d="M44 22 L 51 24 L 49 27 L 44 27 Z" fill="url(#crestBrass)" />
      <line x1="44" y1="20" x2="44" y2="28" stroke="url(#crestBrass)" strokeWidth="1.2" />
    </svg>
  );
}
