/** Route params can contain malformed escapes (e.g. "%"); never let decoding throw. */
export function safeDecode(v: string): string {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}
