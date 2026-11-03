import { Link } from 'react-router';
import { PageMeta } from '../components/PageMeta';
import { PaperSheet } from '../components/PaperSheet';
import { Stamp } from '../components/Stamp';

export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl px-4 py-16">
      <PageMeta title="Nem található" />
      <PaperSheet variant="aged" tilt={-1} className="p-8 text-center">
        <Stamp size="lg" rotate={-8} slam={250}>
          Nem található
        </Stamp>
        <h1 className="mt-6 font-stamp text-2xl tracking-widest uppercase">404 – Az akta hiányzik</h1>
        <p className="mt-3">A keresett irat nincs a nyilvántartásban, vagy a hivatkozás elavult.</p>
        <p className="mt-6">
          <Link to="/" className="underline underline-offset-4">
            Vissza az aktához
          </Link>
        </p>
      </PaperSheet>
    </section>
  );
}
