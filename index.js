'use strict'
const ref = require('pear-ref')
const pearLink = require('pear-link')
module.exports = function drop (link, opts) {
  link = pearLink.parse(link).origin
  const ipc = global.Pear?.[global.Pear?.constructor.IPC] ?? global.Pear?.[Symbol.for('pear.ipc')]
  if (!ipc) throw new Error('pear-drop is designed for Pear - IPC missing')
  ref.ref()
  const stream = ipc.drop ? ipc.drop({ ...opts, link }) : ipc.reset({ ...opts, link })
  stream.on('close', () => ref.unref())
  return stream
}
