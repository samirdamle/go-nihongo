/**
 * Extract a JSON object/array from an LLM response that may include
 * markdown fences or leading prose.
 */
export function parseJsonFromLlm<T>(raw: string): T {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    // fenced ```json ... ```
    const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence?.[1]) {
      return JSON.parse(fence[1].trim()) as T;
    }
    // first { ... } or [ ... ]
    const objStart = trimmed.indexOf("{");
    const arrStart = trimmed.indexOf("[");
    let start = -1;
    let endChar = "";
    if (objStart >= 0 && (arrStart < 0 || objStart < arrStart)) {
      start = objStart;
      endChar = "}";
    } else if (arrStart >= 0) {
      start = arrStart;
      endChar = "]";
    }
    if (start >= 0) {
      const end = trimmed.lastIndexOf(endChar);
      if (end > start) {
        return JSON.parse(trimmed.slice(start, end + 1)) as T;
      }
    }
    throw new Error("Could not parse JSON from LLM response");
  }
}
