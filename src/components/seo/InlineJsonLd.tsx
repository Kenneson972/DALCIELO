import React from 'react'

export function InlineJsonLd({ schema }: { schema: Record<string, unknown> | Array<Record<string, unknown>> }) {
  const schemas = Array.isArray(schema) ? schema : [schema]
  return (
    <>
      {schemas.map((s, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s).replace(/<\/script>/gi, '<\\/script>') }}
        />
      ))}
    </>
  )
}

