import Link from 'next/link';

import type { LegalDocumentContent } from '../lib/types';

/**
 * Documento legal legible de verdad: índice navegable, párrafos cortos
 * y un resumen en lenguaje simple antes de la letra formal.
 */
export function LegalDocument({ doc }: { doc: LegalDocumentContent }) {
  return (
    <main id="contenido" className="shell pb-section pt-10 sm:pt-14">
      <header className="max-w-3xl">
        <p className="eyebrow mb-3">Legales</p>
        <h1 className="text-display-md font-display text-balance">{doc.title}</h1>
        <p className="mt-4 text-sm text-ink-400">
          Última actualización: <time dateTime={doc.updatedAt.iso}>{doc.updatedAt.label}</time>
        </p>
      </header>

      <div className="mt-8 max-w-3xl rounded-panel border border-sage-200 bg-sage-50 p-5 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-sage-700">En pocas palabras</h2>
        <ul className="mt-3 flex flex-col gap-2 text-[0.95rem] leading-relaxed text-sage-900">
          {doc.summary.map((item) => (
            <li key={item} className="flex gap-2.5">
              <span aria-hidden className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-sage-500" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
        <nav aria-label="Índice del documento" className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-ink-400">Índice</p>
          <ol className="flex flex-col gap-1 border-l border-cream-300 text-sm">
            {doc.sections.map((section, index) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="-ml-px block border-l border-transparent py-1 pl-4 text-ink-500 transition-colors hover:border-clay-400 hover:text-ink-900"
                >
                  {index + 1}. {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="flex max-w-prose flex-col gap-10 lg:max-w-2xl">
          {doc.sections.map((section, index) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-xl font-semibold tracking-[-0.015em] text-ink-900">
                <span className="mr-2 tabular-nums text-ink-300">{index + 1}.</span>
                {section.title}
              </h2>
              <div className="mt-3 flex flex-col gap-3 text-[1rem] leading-relaxed text-ink-700">
                {section.body.map((block, blockIndex) =>
                  typeof block === 'string' ? (
                    <p key={blockIndex}>{block}</p>
                  ) : (
                    <ul key={blockIndex} className="flex flex-col gap-1.5 pl-5 [list-style:disc] marker:text-clay-400">
                      {block.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ),
                )}
              </div>
            </section>
          ))}

          <p className="border-t border-cream-300 pt-6 text-sm text-ink-400">
            ¿Dudas sobre este documento? Escribinos a{' '}
            <a href={`mailto:${doc.contactEmail}`} className="legal-link">
              {doc.contactEmail}
            </a>
            . También podés leer {doc.related.prefix}{' '}
            <Link href={doc.related.href} className="legal-link">
              {doc.related.label}
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
