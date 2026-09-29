const NBSP = ' '

// en-US grouping gives "12,499" (the menu's own style), not the lakh style "1,24,999".
const rupeeNumber = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

/** 1999 → "1,999" */
export function formatRupeeAmount(amount: number): string {
  return rupeeNumber.format(amount)
}

/** 1999 → "Rs 1,999" (non-breaking space, so it never wraps). */
export function formatPrice(amount: number, options: { from?: boolean } = {}): string {
  const price = `Rs${NBSP}${formatRupeeAmount(amount)}`
  return options.from ? `from ${price}` : price
}
