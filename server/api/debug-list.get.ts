export default eventHandler(async (event) => {
  try {
    const r2 = event.context.cloudflare.env.R2
    const listed = await r2.list()
    const blobs = listed.objects.map((obj: { key: string; size: number; uploaded: Date }) => ({
      key: obj.key,
      size: obj.size,
      uploaded: obj.uploaded,
    }))
    return { blobs }
  } catch (error) {
    console.error('Error listing blobs:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error listing blobs'
    })
  }
})
