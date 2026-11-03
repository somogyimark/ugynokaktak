import { CONTACT_EMAIL, OFFICIAL_SOURCE_NAME, OFFICIAL_SOURCE_URL } from '../../config';
import type { AgentRecord } from '../../data/schema';
import { SOURCES } from '../../data/sources';

/** Mandatory notice on every record view (SPEC §9). */
export function RecordDisclaimer({ record }: { record: AgentRecord }) {
  const subject = encodeURIComponent(`Helyesbítési kérés – ${record.id}`);
  return (
    <aside
      aria-label="Fontos tudnivaló"
      data-testid="record-disclaimer"
      className="border-l-4 border-stamp bg-paper-light p-4 text-sm leading-relaxed text-ink shadow-sm"
    >
      <p>
        <strong>A név szerepelése a nyilvántartásban önmagában nem bizonyítja, hogy az illető együttműködött, és azonos nevű
        személyek összetéveszthetők.</strong>{' '}
        Az adatok forrása:{' '}
        {OFFICIAL_SOURCE_URL ? (
          <a className="underline underline-offset-2" href={OFFICIAL_SOURCE_URL} rel="noreferrer nofollow">
            {OFFICIAL_SOURCE_NAME}
          </a>
        ) : (
          OFFICIAL_SOURCE_NAME
        )}{' '}
        ({SOURCES[record.source].label}). Hibás vagy félrevezető bejegyzés esetén írj ide:{' '}
        <a className="font-bold underline underline-offset-2" href={`mailto:${CONTACT_EMAIL}?subject=${subject}`}>
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </aside>
  );
}
