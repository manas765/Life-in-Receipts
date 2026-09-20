const PATHS = {
  music: (
    <>
      <circle cx="6.5" cy="16.5" r="2.5" />
      <circle cx="15.5" cy="14.5" r="2.5" />
      <path d="M9 16.5V5.5L18 4v10" fill="none" />
    </>
  ),
  purchase: (
    <>
      <path
        d="M11.5 3.5h5a1 1 0 0 1 1 1v5a1 1 0 0 1-.29.71l-8.5 8.5a1 1 0 0 1-1.42 0l-5-5a1 1 0 0 1 0-1.42l8.5-8.5a1 1 0 0 1 .71-.29Z"
        fill="none"
      />
      <circle cx="15" cy="7" r="1.4" />
    </>
  ),
  movie: (
    <>
      <rect x="3" y="6.5" width="18" height="13" rx="1.2" fill="none" />
      <path d="M3 10.5h18M6.5 6.5l2 4M11.5 6.5l2 4M16.5 6.5l2 4" fill="none" />
    </>
  ),
  place: (
    <>
      <path
        d="M12 21s7-6.6 7-11.5A7 7 0 0 0 5 9.5C5 14.4 12 21 12 21Z"
        fill="none"
      />
      <circle cx="12" cy="9.5" r="2.4" fill="none" />
    </>
  ),
  photo: (
    <>
      <rect x="3" y="6.5" width="18" height="12.5" rx="1.5" fill="none" />
      <path d="M8 6.5 9.5 4h5L16 6.5" fill="none" />
      <circle cx="12" cy="12.5" r="3.3" fill="none" />
    </>
  ),
  message: (
    <path
      d="M4 5.5h16a1 1 0 0 1 1 1V15a1 1 0 0 1-1 1H9l-4 3.5V16H4a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1Z"
      fill="none"
    />
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6" fill="none" />
      <path d="M15 15l5 5" fill="none" />
    </>
  ),
  note: (
    <>
      <path d="M5 4.5h11l3 3V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1Z" fill="none" />
      <path d="M8 10h8M8 13.5h8M8 17h5" fill="none" />
    </>
  ),
  event: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="1.5" fill="none" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" fill="none" />
      <circle cx="12" cy="14.5" r="1.3" />
    </>
  ),
};

export default function TypeIcon({ type, size = 16, color = "currentColor" }) {
  const content = PATHS[type] || PATHS.note;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={color}
      aria-hidden="true"
    >
      {content}
    </svg>
  );
}
