import type { Tournament } from '@/types/tournament';
import { formatDate } from '@/utils/date';

interface MastheadProps {
  tournament: Tournament | null;
}

/**
 * Editorial masthead — title + dates + a hairline-divided fact bar.
 * Only renders fields that exist on the Tournament; missing fields are skipped.
 */
export function Masthead({ tournament }: MastheadProps) {
  if (!tournament) return null;

  const { name, venue, location, startDate, endDate, par } = tournament;
  const dates = `${formatDate(startDate)} – ${formatDate(endDate)}`;

  // Split common major names into "The" + rest for a magazine title break
  const titleParts = splitMajorTitle(name);

  const facts: { label: string; value: string }[] = [];
  if (venue)     facts.push({ label: 'Venue',   value: venue });
  if (par)       facts.push({ label: 'Par',     value: String(par) });
  if (location)  facts.push({ label: 'Location', value: location });
  facts.push({ label: 'Dates', value: dates });

  return (
    <section className="paper-grain relative text-center pt-10 pb-7 sm:pt-14 sm:pb-9">
      <div className="relative">
        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-3 mb-5 smallcaps text-[10px] tracking-[0.26em]"
             style={{ color: 'var(--brass)' }}>
          <span className="brass-diamond" />
          <span>{tournament.year} · The Championship</span>
          <span className="brass-diamond" />
        </div>

        {/* Title */}
        <h1
          className="font-serif italic font-light leading-[0.95] tracking-[-0.03em]"
          style={{ fontSize: 'clamp(48px, 9vw, 86px)', color: 'var(--ink)' }}
        >
          {titleParts.lead && (
            <>
              <span style={{ fontStyle: 'normal' }}>{titleParts.lead}</span>{' '}
            </>
          )}
          <span style={{ color: 'var(--brass)' }}>{titleParts.middle}</span>
          {titleParts.tail && (
            <>
              <br />
              <span>{titleParts.tail}</span>
            </>
          )}
        </h1>

        {/* Sub */}
        <div
          className="font-serif mt-5"
          style={{ fontSize: 'clamp(15px, 2.2vw, 19px)', color: 'var(--ink-soft)' }}
        >
          {venue && <em>{venue}</em>}
          {venue && location && <> &nbsp;·&nbsp; </>}
          {location}
          {dates && (
            <>
              {' '}&nbsp;·&nbsp; <em>{dates}</em>
            </>
          )}
        </div>

        {/* Fact bar */}
        <div
          className="mt-7 flex flex-wrap items-baseline justify-center gap-x-10 gap-y-4 pt-5 border-t"
          style={{ borderColor: 'var(--hairline)' }}
        >
          {facts.map(f => (
            <div key={f.label} className="text-center">
              <div className="smallcaps text-[10px]" style={{ color: 'var(--muted)' }}>
                {f.label}
              </div>
              <div
                className="font-serif mt-1"
                style={{ fontSize: '15px', color: 'var(--ink)' }}
              >
                {f.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function splitMajorTitle(name: string): {
  lead: string;
  middle: string;
  tail: string;
} {
  // Examples:
  //   "The Masters"            -> lead: "The",   middle: "Masters", tail: ""
  //   "The PGA Championship"   -> lead: "The",   middle: "PGA",     tail: "Championship"
  //   "The U.S. Open"          -> lead: "The",   middle: "U.S.",    tail: "Open"
  //   "The Open Championship"  -> lead: "The",   middle: "Open",    tail: "Championship"
  //   "The Players Championship" -> lead: "The", middle: "Players", tail: "Championship"
  const parts = name.split(' ');
  if (parts.length === 0) return { lead: '', middle: name, tail: '' };
  const lead = parts[0] === 'The' ? 'The' : '';
  const rest = lead ? parts.slice(1) : parts.slice(0);
  if (rest.length <= 1) return { lead, middle: rest.join(' '), tail: '' };
  return { lead, middle: rest[0], tail: rest.slice(1).join(' ') };
}
