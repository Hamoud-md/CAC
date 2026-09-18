type VersionedDocument = { _status?: null | 'draft' | 'published' }

/** A draft-only save cannot change public content, even if a published version exists. */
export function shouldRevalidatePublishedChange(
  doc: VersionedDocument,
  previousDoc: VersionedDocument | null | undefined,
  draftQuery: unknown,
): boolean {
  if (doc._status === 'published') return true
  if (draftQuery === true || draftQuery === 'true') return false
  return previousDoc?._status === 'published'
}
