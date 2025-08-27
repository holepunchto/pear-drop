'use strict'
const ref = require('pear-ref')
module.exports = function drop (link, opts) {
  const ipc = global.Pear?.[global.Pear?.constructor.IPC] ?? global.Pear?.[Symbol.for('pear.ipc')]
  if (!ipc) throw new Error('pear-reset is designed for Pear - IPC missing')
  ref.ref()
  const stream = ipc.drop ? ipc.drop({ ...opts, link }) : ipc.reset({ ...opts, link })
  stream.on('close', () => ref.unref())
  return stream
}
