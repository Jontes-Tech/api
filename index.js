const express = require('express')
const app = express()
var cors = require('cors')
const http = require('https')
const port = 3000

app.use(cors())

app.get('/', (req, res) => {
  res.send("Welcome to Jonte's epic API.")
})
app.get('/api/arch', (req, res) => {
  // This endpoint is only for backwards compatibility.
  // It will be removed in the future.
  archapi(req, res)
})
app.get('/age', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({
    "seconds": ~~(Date.now() / 1000) - 1233516000,
    "days": ~~(Date.now() / 1000) - 1233516000 / 86400,
    "wholeDays": Math.round(~~(Date.now() / 1000) - 1233516000 / 86400),
    "years": ~~((Date.now() / 1000) - 1233516000) / 86400 / 365.2425,
    "wholeYears": Math.round(((Date.now() / 1000) - 1233516000) / 86400 / 365.2425)
  }))
})
app.get('/arch', (req, res) => {
  archapi(req, res)
})
function archapi(req, res) {
  http.get('https://mirror.rackspace.com/archlinux/iso/latest/arch/version', (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });
    response.on('end', () => {
      let version = data.split('\n')[0]
      let mirror = req.query.mirror
      if (mirror == null || mirror == '') {
        res.send("Please specify a mirror.")
      } else if (mirror == 'rackspace') {
        res.send("https://mirror.rackspace.com/archlinux/iso/latest/archlinux-" + version + "-x86_64.iso")
      } else if (mirror == 'acc-umu') {
        res.send("https://ftp.acc.umu.se/mirror/archlinux/iso/" + version + "/archlinux-" + version + "-x86_64.iso")
      } else if (mirror == 'torrent') {
        res.send("https://archlinux.org/releng/releases/" + version + "/torrent/")
      } else {
        res.send("Mirror not supported, please ask Jonte to add it.")
      }
    });
  });
}
app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
