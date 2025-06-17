export default eventHandler(async (event) => {
  const { pathname } = getRouterParams(event)
  
  try {
    const extension = pathname.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'
    
    if (extension === 'mp4') {
      contentType = 'video/mp4'
    } else if (extension === 'webp') {
      contentType = 'image/webp'
    } else if (extension === 'png') {
      contentType = 'image/png'
    } else if (extension === 'jpg' || extension === 'jpeg') {
      contentType = 'image/jpeg'
    } else if (extension === 'gif') {
      contentType = 'image/gif'
    } else if (extension === 'svg') {
      contentType = 'image/svg+xml'
    } else if (extension === 'webm') {
      contentType = 'video/webm'
    }
    
    if (contentType.startsWith('video/')) {
      setResponseHeaders(event, {
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes'
      })
    } else {
      setResponseHeader(event, 'Content-Type', contentType)
    }
    
    return hubBlob().serve(event, pathname)
  } catch (error) {
    console.error(`Error serving file: ${pathname}`, error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error serving file'
    })
  }
})