type IconProps = { className?: string };

const base = "w-8 h-8";

export function FoodIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
      <circle cx="24" cy="24" r="19" />
      <path d="M14 20c0-3.5 2.5-6 6-6h1v12h-1c-3.5 0-6-2.5-6-6Z" />
      <path d="M14 20h7" />
      <path d="M27 14v12M30 14v12M33 14c0 3-1.5 5-3 5.4V26" />
    </svg>
  );
}

export function PetFoodIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
      <circle cx="24" cy="24" r="19" />
      <rect x="14" y="16" width="9" height="16" rx="1.5" />
      <rect x="25" y="16" width="9" height="16" rx="1.5" />
      <path d="M18.5 21a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z" />
      <path d="M29.5 21a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z" />
    </svg>
  );
}

export function KidsIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
      <circle cx="24" cy="24" r="19" />
      <rect x="13" y="24" width="16" height="8" rx="1.5" />
      <circle cx="17" cy="34" r="2" />
      <circle cx="25" cy="34" r="2" />
      <path d="M15 24v-3a4 4 0 0 1 4-4h2" />
      <circle cx="27" cy="17" r="3.2" />
    </svg>
  );
}

export function CleaningIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
      <circle cx="24" cy="24" r="19" />
      <rect x="16" y="19" width="7" height="14" rx="1.2" />
      <path d="M18 19v-3a1.5 1.5 0 0 1 1.5-1.5h1A1.5 1.5 0 0 1 22 16v3" />
      <rect x="26" y="16" width="7" height="17" rx="1.2" />
      <path d="M29.5 16v-2" />
    </svg>
  );
}

export function MedIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
      <circle cx="24" cy="24" r="19" />
      <path d="M20 16 32 28a4.2 4.2 0 1 1-6 6L14 22a4.2 4.2 0 1 1 6-6Z" />
      <path d="M18.5 19.5 21 22" />
      <path d="M30 30v6M27 33h6" />
    </svg>
  );
}
