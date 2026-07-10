export function formatSalary(min: number, max: number, currency: string) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return `${formatter.format(min)} - ${formatter.format(max)}`
}
