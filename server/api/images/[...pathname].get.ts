export default eventHandler(async (event) => {
  const { pathname } = getRouterParams(event)

  try {
    const r2 = event.context.cloudflare.env.R2
    const object = await r2.get(pathname)

    if (!object) {
      throw createError({ statusCode: 404, statusMessage: 'File not found' })
    }

    const extension = pathname?.split('.').pop()?.toLowerCase()
    let contentType = object.httpMetadata?.contentType || 'application/octet-stream'

    // Fallback content type detection from extension
    if (contentType === 'application/octet-stream') {
      const typeMap: Record<string, string> = {
        mp4: 'video/mp4',
        webm: 'video/webm',
        webp: 'image/webp',
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
        svg: 'image/svg+xml',
      }
      if (extension && typeMap[extension]) {
        contentType = typeMap[extension]
      }
    }

    if (contentType.startsWith('video/')) {
      setResponseHeaders(event, {
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
      })
    } else {
      setResponseHeader(event, 'Content-Type', contentType)
    }

    setResponseHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')

    return object.body
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error(`Error serving file: ${pathname}`, error)
    throw createError({ statusCode: 500, statusMessage: 'Error serving file' })
  }
})
