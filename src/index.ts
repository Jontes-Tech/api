import express = require('express')
const app = express()
var cors = require('cors')
const port = 3000
import { createLogger } from '@lvksh/logger';
import chalk = require('chalk')
const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]

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

function sendResult(query:string, req:express, res:express) {
  if (req.query.redirect == 'true') {
    res.redirect(query)
  } else {
    res.send(query)
  }
}
function getArch() {
  return (new Date().getFullYear()+"."+months[new Date().getMonth()]+".01")
}
app.get('/debian', (req:express, res:express) => {
  sendResult("Hello World!", req, res)
})
app.get(['/api/arch', '/arch'], (req, res) => {
  let version = getArch()
  switch (req.query.mirror) {
    case '' || null || undefined:
      res.sendFile(process.cwd()+"/static/arch.html")
      break;
    case 'rackspace':
      sendResult("https://mirror.rackspace.com/archlinux/iso/latest/archlinux-" + version + "-x86_64.iso", req, res)
      break;
    case 'acc-umu' || 'umu':
      sendResult("https://ftp.acc.umu.se/mirror/archlinux/iso/" + version + "/archlinux-" + version + "-x86_64.iso", req ,res)
      break;
    case 'torrent':
      sendResult("https://archlinux.org/releng/releases/" + version + "/torrent/", req, res)
    default:
      res.send("Arch mirror not found, either you made a mistake or the mirror doesn't exist. Reporting to Jonte.")
      log.info("User requested arch mirror: "+req.query.mirror)
      break;
}})
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
