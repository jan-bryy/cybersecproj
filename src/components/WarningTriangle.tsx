// src/components/WarningTriangle.tsx
const WarningTriangle: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 96 70" className={className} aria-hidden="true">
    <polygon
      points="48,8 88,62 8,62"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="12"
      strokeLinejoin="round"
    />
    <rect x="44.5" y="26" width="7" height="20" rx="3.5" fill="#fff" />
    <circle cx="48" cy="54" r="4" fill="#fff" />
  </svg>
);

export default WarningTriangle;