import express = require('express')
const app = express()
var cors = require('cors')
import http = require('https')
const port = 3000
import { createLogger } from '@lvksh/logger';
import chalk = require('chalk')

const log = createLogger(
  {
      ok: {
          label: chalk.greenBright`[OK]`,
          newLine: '| ',
          newLineEnd: '\\-',
      },
      debug: chalk.magentaBright`[DEBUG]`,
      info: {
          label: chalk.cyan`[INFO]`,
          newLine: chalk.cyan`⮡`,
          newLineEnd: chalk.cyan`⮡`,
      },
      error: chalk.bgRed.white.bold`[ERROR]`,
  },
  { padding: 'PREPEND' },
  console.log
);

app.use(cors())

app.get('/', (req, res) => {
  res.send("Welcome to Jonte's epic API.")
})
app.get(['/api/arch', '/arch', '/test'], (req, res) => {
  http.get('https://mirror.rackspace.com/archlinux/iso/latest/arch/version', (response) => {
    let data:string;
    response.on('data', (chunk) => {
      data += chunk;
    });
    response.on('end', () => {
      let version:string = data.split('\n')[0]
      let mirror:string = req.query.mirror
      if (mirror == null || mirror == '') {
        res.send("Please specify a mirror.")
      } else if (mirror == 'rackspace') {
        res.send("https://mirror.rackspace.com/archlinux/iso/latest/archlinux-" + version + "-x86_64.iso")
      } else if (mirror == 'acc-umu') {
        res.send("https://ftp.acc.umu.se/mirror/archlinux/iso/" + version + "/archlinux-" + version + "-x86_64.iso")
      } else if (mirror == 'torrent') {
        res.send("https://archlinux.org/releng/releases/" + version + "/torrent/")
      } else {
        res.send("Mirror not supported, asking @Jonte to add "+mirror+".")
        log.info("Please add "+mirror+" to the list of supported mirrors.")
      }
    });
  });
})
app.get('/age', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({
    "seconds": ~~(Date.now() / 1000) - 1233516000,
    "days": ~~(Date.now() / 1000) - 1233516000 / 86400,
    "wholeDays": Math.round(~~(Date.now() / 1000) - 1233516000 / 86400),
    "years": ~~((Date.now() / 1000) - 1233516000) / 86400 / 365.2425,
    "wholeYears": Math.floor(((Date.now() / 1000) - 1233516000) / 86400 / 365.2425)
  }))
})
app.listen(port, () => {
  log.info("Welcome to Jonte's API")
  log.ok(`App listening on port ${port}`)
})
