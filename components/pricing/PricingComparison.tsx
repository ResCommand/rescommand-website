import { PRICING_COMPARISON } from '@/lib/content'

function Cell({ value }: { value: string | boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <span aria-label="Included">✓</span>
    ) : (
      <span className="text-grey-light" aria-label="Not included">
        —
      </span>
    )
  }
  return <span>{value}</span>
}

/** Feature comparison table: Core vs. Operator, on hairline rows. */
export function PricingComparison() {
  return (
    <table className="w-full border-collapse text-left text-[15px]">
      <caption className="sr-only">Feature comparison between Core and Operator plans</caption>
      <thead>
        <tr>
          <th scope="col" className="w-1/2 pb-3 font-normal text-grey">
            Feature
          </th>
          <th scope="col" className="pb-3 font-medium">
            Core
          </th>
          <th scope="col" className="pb-3 font-medium">
            Operator
          </th>
        </tr>
      </thead>
      <tbody>
        {PRICING_COMPARISON.map((row) => (
          <tr key={row.label} className="border-t border-line">
            <th scope="row" className="py-3.5 pr-4 font-normal">
              {row.label}
            </th>
            <td className="py-3.5 pr-4">
              <Cell value={row.starter} />
            </td>
            <td className="py-3.5">
              <Cell value={row.pro} />
            </td>
          </tr>
        ))}
        <tr className="border-y border-line">
          <th scope="row" className="py-3.5 pr-4 font-medium">
            Price
          </th>
          <td className="py-3.5 pr-4 font-medium">$99/mo</td>
          <td className="py-3.5 font-medium">$199/mo</td>
        </tr>
      </tbody>
    </table>
  )
}
