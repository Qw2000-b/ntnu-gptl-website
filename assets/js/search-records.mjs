// Exact word/phrase matching handles Chinese without relying on English tokenization.
const normalize = (value) => String(value ?? '').normalize('NFKC').toLocaleLowerCase();

export function searchRecords(records, query) {
  const words = normalize(query).trim().split(/\s+/u).filter(Boolean);
  if (!words.length) return [];
  return records.map((record, order) => {
    const title = normalize(record.title);
    const authors = normalize((record.authors || []).join(' '));
    const text = normalize([record.summary, record.content, record.section].join(' '));
    const all = `${title} ${authors} ${text}`;
    if (!words.every((word) => all.includes(word))) return null;
    const score = words.reduce((sum, word) => sum + (title.includes(word) ? 8 : 0) + (authors.includes(word) ? 4 : 0), 0);
    return {record, score, order};
  }).filter(Boolean).sort((a, b) => b.score - a.score || a.order - b.order).map(({record}) => record);
}
