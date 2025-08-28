'use strict'
const test = require('brittle')
const b4a = require('b4a')
const sodium = require('sodium-native')
const IPC = require('pear-ipc')
const { ALIASES } = require('pear-aliases')
const { encode } = require('hypercore-id-encoding')
const Iambus = require('iambus')
const { isWindows } = require('which-runtime')
const drop = require('..')

function pipeId (s) {
  const buf = b4a.allocUnsafe(32)
  sodium.crypto_generichash(buf, b4a.from(s))
  return b4a.toString(buf, 'hex')
}

test('throws if not Pear', (t) => {
  t.exception(() => drop('pear://pear'))
})

test('drop(link, opts)', async (t) => {
  t.plan(1)
  const kIPC = Symbol('test.ipc')
  const socketPath = isWindows ? `\\\\.\\pipe\\test-${pipeId(__dirname)}` : __dirname + '/test.sock' // eslint-disable-line
  const bus = new Iambus()
  const srv = new IPC.Server({
    socketPath,
    handlers: {
      drop (params) {
        const sub = bus.sub({ params })
        bus.pub({ some: 'info', params })
        setImmediate(() => sub.end())
        return sub
      }
    }
  })
  t.teardown(() => srv.close())
  await srv.ready()
  const ipc = new IPC.Client({ socketPath })
  t.teardown(() => ipc.close())
  await ipc.ready()
  class API {
    static IPC = kIPC
    get [kIPC] () { return ipc }
  }
  global.Pear = new API()
  const opts = { dir: 'some/path' }
  const link = 'pear://pear'
  const stream = drop(link, opts)
  stream.on('data', (msg) => {
    t.alike({ some: 'info', params: { link, ...opts } }, msg)
  })
})

test('drop(link, opts) (v1)', async (t) => {
  t.plan(1)
  const socketPath = isWindows ? `\\\\.\\pipe\\test-${pipeId(__dirname)}` : __dirname + '/test.sock' // eslint-disable-line
  const bus = new Iambus()
  const srv = new IPC.Server({
    socketPath,
    handlers: {
      drop (params) {
        const sub = bus.sub({ params })
        bus.pub({ some: 'info', params })
        setImmediate(() => sub.end())
        return sub
      }
    }
  })
  t.teardown(() => srv.close())
  await srv.ready()
  const ipc = new IPC.Client({ socketPath })
  t.teardown(() => ipc.close())
  await ipc.ready()
  class API {
    [Symbol.for('pear.ipc')] = {
      __proto__: ipc,
      reset (...args) { return ipc.drop(...args) },
      drop: undefined
    }
  }
  global.Pear = new API()
  const opts = { dir: 'some/path' }
  const link = 'pear://pear'
  const stream = drop(link, opts)
  stream.on('data', (msg) => {
    t.alike({ some: 'info', params: { link, ...opts } }, msg)
  })
})

test('drop(linkWithKeyThatHasAlias, opts)', async (t) => {
  t.plan(1)
  const kIPC = Symbol('test.ipc')
  const socketPath = isWindows ? `\\\\.\\pipe\\test-${pipeId(__dirname)}` : __dirname + '/test.sock' // eslint-disable-line
  const bus = new Iambus()
  const srv = new IPC.Server({
    socketPath,
    handlers: {
      drop (params) {
        const sub = bus.sub({ params })
        bus.pub({ some: 'info', params })
        setImmediate(() => sub.end())
        return sub
      }
    }
  })
  t.teardown(() => srv.close())
  await srv.ready()
  const ipc = new IPC.Client({ socketPath })
  t.teardown(() => ipc.close())
  await ipc.ready()
  class API {
    static IPC = kIPC
    get [kIPC] () { return ipc }
  }
  global.Pear = new API()
  const opts = { dir: 'some/path' }
  const link = 'pear://' + encode(ALIASES.pear)
  const stream = drop(link, opts)
  stream.on('data', (msg) => {
    t.alike({ some: 'info', params: { link: 'pear://pear', ...opts } }, msg)
  })
})
