interface PageMeta {
  title?: string
  description?: string
  image?: string
  url?: string
}

const BASE_URL = 'https://hirehub.community'
const DEFAULT_TITLE = 'HireHub Community — Find your next opportunity'
const DEFAULT_DESCRIPTION = 'HireHub Community connects talented job seekers with top employers. Browse thousands of curated job listings from leading companies.'
const DEFAULT_IMAGE = '/og-image.svg'

export function usePageMeta(meta: PageMeta = {}) {
  const title = meta.title ? `${meta.title} | HireHub Community` : DEFAULT_TITLE
  const description = meta.description || DEFAULT_DESCRIPTION
  const image = meta.image || DEFAULT_IMAGE
  const url = meta.url ? `${BASE_URL}${meta.url}` : BASE_URL

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </>
  )
}
