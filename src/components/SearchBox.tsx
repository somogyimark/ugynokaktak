import { forwardRef, type KeyboardEvent } from 'react';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  size?: 'md' | 'lg';
  autoFocus?: boolean;
  label?: string;
  placeholder?: string;
  describedBy?: string;
}

/** Typewriter-style search field: a typed line on paper with a label like a printed form. */
export const SearchBox = forwardRef<HTMLInputElement, SearchBoxProps>(function SearchBox(
  { value, onChange, onSubmit, onKeyDown, size = 'md', autoFocus, label = 'Név vagy fedőnév', placeholder = 'pl. Próbaházi Gábor, Fecske', describedBy },
  ref,
) {
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className="paper rounded-[2px] px-4 pt-2 pb-3"
    >
      <label htmlFor="kereso" className="block font-stamp text-xs tracking-[0.2em] text-ink-faded uppercase">
        {label}
      </label>
      <div className="flex items-end gap-3">
        <input
          ref={ref}
          id="kereso"
          type="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          aria-describedby={describedBy}
          placeholder={placeholder}
          className={`ink-typed w-full min-w-0 border-0 border-b-2 border-dashed border-ink/40 bg-transparent px-1 py-1 placeholder:text-ink-faded focus:border-solid focus:border-pen focus:outline-none ${
            size === 'lg' ? 'text-2xl sm:text-3xl' : 'text-xl'
          }`}
        />
        {onSubmit && (
          <button
            type="submit"
            className="shrink-0 rounded-sm bg-ink px-4 py-2 font-stamp text-sm tracking-[0.2em] text-paper uppercase hover:bg-stamp-dark"
          >
            Keresés
          </button>
        )}
      </div>
    </form>
  );
});
