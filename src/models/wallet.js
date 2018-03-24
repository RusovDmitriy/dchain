const {randomBytes} = require('crypto')
const secp256k1 = require('secp256k1')
const bs58 = require('bs58')

function generateKeyPair() {
  let privKey
  do {privKey = randomBytes(32)}
  while (!secp256k1.privateKeyVerify(privKey))
  
  const pubKey = secp256k1.publicKeyCreate(privKey)

  return {
    private: privKey.toString('hex'),
    public: bs58.encode(pubKey),
  }
}

function signHash(privateKey, hash) {
  return secp256k1.sign(Buffer.from(hash, 'hex'), Buffer.from(privateKey, 'hex')).signature.toString('base64')
}

function verifySign({address, signature, hash}) {
  return secp256k1.verify(Buffer.from(hash, 'hex'), Buffer.from(signature, 'base64'), bs58.decode(address))
}

function create() {
  return {...generateKeyPair()}
}

module.exports = {
  create,
  generateKeyPair,
  signHash,
  verifySign
}