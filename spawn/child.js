import crypto from 'node:crypto'

process.stdin.on('data', (obj) => {
  try {
    const { publicKey, file } = JSON.parse(obj)
    // const encrypted = crypto.publicEncrypt(publicKey, `${file}\n`)
    const encrypted = crypto.publicEncrypt(publicKey, file)

    process.stdout.write(encrypted)
  } catch (error) {
    console.error(error)
  }
})
