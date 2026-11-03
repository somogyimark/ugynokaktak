interface PageMetaProps {
  title: string;
  description?: string;
  /**
   * Only the landing page, statistics and methodology may be indexed.
   * Everything else (search, records, styleguide) is noindex by default.
   */
  indexable?: boolean;
}

/** Per-page <head> tags; React 19 hoists these into the document head. */
export function PageMeta({ title, description, indexable = false }: PageMetaProps) {
  return (
    <>
      <title>{`${title} · Nyitott Akták`}</title>
      {description && <meta name="description" content={description} />}
      {!indexable && <meta name="robots" content="noindex, nofollow" />}
    </>
  );
}
