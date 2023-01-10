import { spawn } from 'node:child_process'
import crypto from 'node:crypto'
import fs from 'node:fs'
import * as dotenv from 'dotenv'
import keyGenerator from '../keyGenerator.js'

const { SECRET } = dotenv.config({ path: '../../spawnVsFork/.env' }).parsed
const { publicKey, privateKey } = keyGenerator(SECRET)
const file = fs.readFileSync('../here/readMe.txt', 'utf8')

const child = spawn('node', ['./child.js'])

const hashCreator = (content) => {
  const hash = crypto.createHash('sha256')
  hash.update(content)
  return hash.digest('hex')
}

child.on('error', (error) => {
  console.error(`An error occurred while spawning the child process: ${error}`)
  process.exit(1)
})

try {
  child.stdin.write(Buffer.from(JSON.stringify({ publicKey, file }), 'utf8'))
} catch (error) {
  console.error(`An error occurred while writing to the child process' stdin stream: ${error}`)
  process.exit(1)
}

child.stdout.on('data', (encrypted) => {
  try {
    const decrypted = crypto.privateDecrypt(
      { key: privateKey, passphrase: SECRET },
      encrypted,
    )

    const originalHash = hashCreator(file)
    const decryptedHash = hashCreator(decrypted.toString())

    if (originalHash === decryptedHash) {
      console.log('The file has not been modified.')
    } else {
      console.log('The file has been modified.')
    }

    child.kill()
    console.table({
      'Total Memory Allocated (MB)': (process.memoryUsage().rss / 1048576).toFixed(2),
      'Process Up Time (Seconds)': process.uptime().toFixed(2),
    })
  } catch (error) {
    console.error(`An error occurred while decrypting the data sent by the child process: ${error}`)
    process.exit(1)
  }
})
