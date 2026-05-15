export function Footer() {
  return (
    <footer
      className="mt-auto py-7 px-4 text-center border-t"
      style={{ borderColor: 'var(--hairline)' }}
    >
      <div
        className="font-serif italic text-[14px] tracking-[0.1em] text-brass"
        style={{ color: 'var(--brass)' }}
      >
        FM Clubhouse
      </div>
      <div className="smallcaps text-[10px] mt-1.5" style={{ color: 'var(--muted)' }}>
        Members Only Fantasy Golf App · Est. MMXXIV
      </div>
    </footer>
  );
}
