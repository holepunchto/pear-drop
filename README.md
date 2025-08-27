# pear-drop

> Synchronize from-disk to app drive peer-to-peer

## Usage

```js
import drop from 'pear-drop'
```

```js
function status (info) { console.log(info) }
const link = 'pear://....'
const stream = drop(link, opts)
stream.on('data', status)
```

## License

Apache-2.0