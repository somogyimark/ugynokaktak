import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { PageMeta } from '../components/PageMeta';
import { PaperSheet } from '../components/PaperSheet';
import { Stamp } from '../components/Stamp';
import { SourceBadge } from '../components/SourceBadge';
import { CONTACT_EMAIL, DATA_MODE, OFFICIAL_SOURCE_NAME, OFFICIAL_SOURCE_URL } from '../config';
import { loadManifest } from '../data/client';
import { SOURCE_TYPES, SOURCES } from '../data/sources';
import { useAsync } from '../hooks/useAsync';
import { formatDate, formatNumber } from '../lib/format';

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="space-y-3">
      <h2 id={id} className="font-stamp text-xl font-bold tracking-[0.12em] uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function Methodology() {
  const manifest = useAsync(loadManifest, []);
  const m = manifest.status === 'ready' ? manifest.value : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageMeta
        title="Módszertan és jogi tudnivalók"
        indexable
        description="Honnan származnak az adatok, mit jelentenek az egyes irattípusok, milyen korlátai vannak az adatoknak, és hogyan kérhető helyesbítés."
      />
      <PaperSheet className="space-y-10 px-5 py-8 leading-relaxed sm:px-10">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-stamp text-xs tracking-[0.25em] text-ink-soft uppercase">Tájékoztató</p>
            <h1 className="font-stamp text-3xl font-bold tracking-[0.12em] uppercase">Módszertan és jogi tudnivalók</h1>
          </div>
          <Stamp color="blue" rotate={5}>
            Olvasandó
          </Stamp>
        </header>

        <nav aria-label="Tartalom" className="text-sm">
          <ol className="list-inside list-decimal [&_a]:inline-block [&_a]:py-1.5">
            <li><a className="underline underline-offset-2" href="#forras">Honnan jön az adat?</a></li>
            <li><a className="underline underline-offset-2" href="#irattipusok">Az irattípusok</a></li>
            <li><a className="underline underline-offset-2" href="#korlatok">Korlátok – így olvasd az adatokat</a></li>
            <li><a className="underline underline-offset-2" href="#kereses">Hogyan működik a keresés?</a></li>
            <li><a className="underline underline-offset-2" href="#adatvedelem">Adatvédelem és etikai elvek</a></li>
            <li><a className="underline underline-offset-2" href="#helyesbites">Eltávolítási és helyesbítési kérés</a></li>
          </ol>
        </nav>

        <Section id="forras" title="1. Honnan jön az adat?">
          {DATA_MODE === 'mock' || m?.mode === 'mock' ? (
            <p className="border-l-4 border-stamp bg-stamp/10 p-3">
              <strong>Ez a változat fiktív tesztadatot mutat.</strong> Minden név és adat kitalált (a vezetéknevek szándékosan
              olyanok, mint „Próbaházi”, „Tesztelő”, „Mintás”), valós személyre nem utal. A valódi forrás formátuma még
              nem ismert; a bekötése külön, jóváhagyott lépés lesz.
            </p>
          ) : (
            <p>
              Az adatok forrása:{' '}
              {OFFICIAL_SOURCE_URL ? (
                <a className="underline underline-offset-2" href={OFFICIAL_SOURCE_URL} rel="noreferrer">
                  {OFFICIAL_SOURCE_NAME}
                </a>
              ) : (
                OFFICIAL_SOURCE_NAME
              )}
              .
            </p>
          )}
          <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
            <dt className="font-bold">Adatállomány</dt>
            <dd>{m ? m.sourceDescription : '…'}</dd>
            <dt className="font-bold">Utolsó frissítés</dt>
            <dd>{m ? formatDate(m.generatedAt.slice(0, 10)) : '…'}</dd>
            <dt className="font-bold">Bejegyzések száma</dt>
            <dd>{m ? formatNumber(m.totalRecords) : '…'}</dd>
          </dl>
          <p>
            Az adatokat a forrásból változtatás nélkül, egységes szerkezetre alakítva jelenítjük meg. Az eredeti mezők minden
            rekordnál megtekinthetők („Eredeti forrásmezők”), és ahol lehetséges, a hivatalos rekordra is hivatkozunk. Az
            adatokat nem egészítjük ki, nem javítjuk és nem kapcsoljuk össze más forrásokkal.
          </p>
        </Section>

        <Section id="irattipusok" title="2. Az irattípusok">
          <dl className="space-y-3">
            {SOURCE_TYPES.map((s) => (
              <div key={s}>
                <dt>
                  <SourceBadge source={s} />
                </dt>
                <dd className="mt-1">{SOURCES[s].description}</dd>
              </div>
            ))}
            <div>
              <dt className="font-stamp text-sm tracking-[0.12em] uppercase">B-dosszié (később)</dt>
              <dd className="mt-1">
                A beszervezési dossziék (20–több száz oldalas iratok, kb. 9000 darab) várhatóan 2027. február 25-ig válnak
                elérhetővé; az oldal szerkezete fel van készítve a fogadásukra.
              </dd>
            </div>
          </dl>
        </Section>

        <Section id="korlatok" title="3. Korlátok – így olvasd az adatokat">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>A név szerepelése a nyilvántartásban önmagában nem bizonyítja, hogy az illető együttműködött.</strong>{' '}
              Nyilvántartásba vétel történhetett az érintett tudta nélkül, kényszer hatására, vagy úgy, hogy érdemi
              együttműködés nem lett belőle.
            </li>
            <li>
              <strong>Azonos nevű személyek összetéveszthetők.</strong> Ha ugyanaz a név több irattípusban is szerepel, azt
              csak jelezzük („Azonos nevű bejegyzés más forrásban is”) – a bejegyzéseket nem vonjuk össze, mert a
              névegyezés nem bizonyít személyazonosságot.
            </li>
            <li>
              <strong>Hiányos mezők.</strong> Az egyes nyilvántartások eltérő adatkört tartalmaznak; a hiányzó adatot
              kitakarás jelöli („ADAT NEM ÁLL RENDELKEZÉSRE”). A mezők kitöltöttségét a{' '}
              <Link to="/kimutatas" className="underline underline-offset-2">
                Kimutatás
              </Link>{' '}
              mutatja.
            </li>
            <li>
              <strong>Írásmód.</strong> A mágnesszalagos H-adattár sokszor ékezet nélkül, nagybetűvel rögzítette a neveket;
              a forrásokban elírások is előfordulhatnak.
            </li>
            <li>
              <strong>Megyei adatok.</strong> A megyét a születési helyből vezetjük le egy helységnévtár alapján (a mai
              megyehatárok szerint); ahol a hely nem azonosítható, nem találgatunk.
            </li>
          </ul>
        </Section>

        <Section id="kereses" title="4. Hogyan működik a keresés?">
          <p>
            A keresés teljes egészében a böngésződben fut: a keresett nevek nem jutnak el szerverre, és nem naplózzuk őket.
            A kereső ékezetfüggetlen („gábor” = „Gabor”), és az apró elgépeléseket is tűri. Név és fedőnév szerint keres;
            szűrni lehet irattípusra, születési évre, beszervezés évére és megyére.
          </p>
        </Section>

        <Section id="adatvedelem" title="5. Adatvédelem és etikai elvek">
          <ul className="list-disc space-y-2 pl-5">
            <li>Nincs analitika, követőkód vagy süti; külső betűtípus- vagy szkriptszolgáltatót sem használunk.</li>
            <li>Az egyes rekordoldalakat kizárjuk a keresőmotorok indexeléséből (noindex).</li>
            <li>Nincs megosztásra optimalizált „leleplező” kártya, kommentelés, értékelés vagy jelölés.</li>
            <li>A teljes adatbázis nem tölthető le egyben az oldalról.</li>
            <li>Az adatforrás felhasználási feltételeit tiszteletben tartjuk; tömeges letöltés hiányában a hivatalos rekordra linkelünk.</li>
          </ul>
        </Section>

        <Section id="helyesbites" title="6. Eltávolítási és helyesbítési kérés">
          <p>
            Ha egy bejegyzést hibásnak vagy félrevezetőnek tartasz – például elírás, téves adat vagy összetéveszthetőség
            miatt –, írj a{' '}
            <a className="font-bold underline underline-offset-2" href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Helyesbítési kérés')}`}>
              {CONTACT_EMAIL}
            </a>{' '}
            címre. Kérjük, add meg a rekord azonosítóját (a rekordoldal alján található). A hivatalos nyilvántartás
            tartalmát csak az adatkezelő módosíthatja; a hozzánk érkezett kéréseket megvizsgáljuk, és szükség esetén
            továbbítjuk.
          </p>
        </Section>
      </PaperSheet>
    </div>
  );
}
