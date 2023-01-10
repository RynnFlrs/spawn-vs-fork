import crypto from 'node:crypto'

process.on('message', (obj) => {
  try {
    const { publicKey, file } = JSON.parse(obj)
    const encrypted = crypto.publicEncrypt(publicKey, `${file}\n`)
    // const encrypted = crypto.publicEncrypt(publicKey, file)

    process.send(encrypted)
  } catch (error) {
    console.error(error)
  }
})
