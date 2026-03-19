import { Racket, BALANCE_KO, FLEX_KO } from '@/types/racket'

export function RacketSpec({ racket }: { racket: Racket }) {
  const specs = [
    { label: '브랜드', value: racket.brand },
    { label: '무게',   value: racket.weight },
    { label: '밸런스', value: racket.balance ? BALANCE_KO[racket.balance] : null },
    { label: '강성',   value: racket.flex ? FLEX_KO[racket.flex] : null },
    { label: '가격대', value: racket.price_range },
  ].filter((s): s is { label: string; value: string } => s.value !== null && s.value !== undefined)

  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <tbody>
          {specs.map(({ label, value }) => (
            <tr key={label} className="border-b border-border last:border-0">
              <td className="px-4 py-2.5 text-muted-foreground bg-muted/40 w-20 text-xs font-medium">
                {label}
              </td>
              <td className="px-4 py-2.5 text-sm font-medium">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
