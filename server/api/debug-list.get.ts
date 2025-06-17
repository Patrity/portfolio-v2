// server/api/debug/blob-list.get.ts
export default eventHandler(async () => {
  try {
    const { blobs } = await hubBlob().list()
    return { blobs }
  } catch (error) {
    console.error('Error listing blobs:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error listing blobs'
    })
  }
})