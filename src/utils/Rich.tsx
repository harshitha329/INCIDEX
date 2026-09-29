// Renders **bold** segments from the backend text; all other text (and line breaks) is preserved as-is.
export function Rich({ text }: { text?: string }) {
  if (!text) return null
  return <>{text.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith('**') && p.endsWith('**') && p.length > 4 ? <strong key={i} className="font-semibold text-white">{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>))}</>
}
