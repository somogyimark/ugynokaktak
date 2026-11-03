import { PageMeta } from '../components/PageMeta';

export default function Home() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <PageMeta title="Home" />
      <h1 className="font-stamp text-3xl uppercase tracking-widest">Home</h1>
      <p>Hamarosan.</p>
    </section>
  );
}
