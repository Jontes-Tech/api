import express = require('express')
const app = express()
var cors = require('cors')
const port = 3000
import fetch from 'node-fetch'
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

app.get('/', (req:express, res:express) => {
  res.send("Welcome to Jonte's epic API.")
})

app.get('/docs', (req:express, res:express) => {res.sendFile(process.cwd()+"/static/index.html")})

app.get('/docs/arch', (req:express, res:express) => {res.sendFile(process.cwd()+"/static/arch.html")})

app.get('/docs/debian', (req:express, res:express) => {res.sendFile(process.cwd()+"/static/debian.html")})

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

const myDebian = {
  data: '',
  lastChecked: 0,
};

const getData = async () => {
  if (Date.now() - myDebian.lastChecked > 5 * 60 * 1000) {
      if ( process.env.jonte_api_debug == "true" ) {
        log.debug("Fetching new Debian version")
      }
      const temporaryData = await fetch('https://cdimage.debian.org/debian-cd/current/amd64/iso-cd/SHA512SUMS');
      const text = await temporaryData.text()
      myDebian.lastChecked = Date.now();
      myDebian.data = text.split(/[ \t\n]+/g)[1].split(/\-/g)[1];
  }
  return myDebian.data;
};

app.get('/debian',async (req:express, res:express) => {
  let debianversion = await getData()
  if (req.query.version == "true") {
    res.send(debianversion)
    return
  }
  if (req.query.netinst != "false") {
    // User does want Netinst
    sendResult("https://cdimage.debian.org/debian-cd/current/amd64/iso-cd/debian-"+debianversion+"-amd64-netinst.iso", req, res)
  }
  else {
    // User does not want Netinst
    sendResult("https://cdimage.debian.org/cdimage/unofficial/non-free/cd-including-firmware/current/amd64/iso-cd/firmware-"+debianversion+"-amd64-netinst.iso", req, res)
  }
})
app.get(['/api/arch', '/arch'], (req, res) => {
  let archversion = getArch()
  if (req.query.version == "true") {
    res.send(archversion)
    return
  }
  switch (req.query.mirror) {
    case '' || null || undefined:
      res.redirect("//api.jontes.page/docs/arch")
      break;
    case 'rackspace':
      sendResult("https://mirror.rackspace.com/archlinux/iso/latest/archlinux-" + archversion + "-x86_64.iso", req, res)
      break;
    case 'acc-umu' || 'umu':
      sendResult("https://ftp.acc.umu.se/mirror/archlinux/iso/" + archversion + "/archlinux-" + archversion + "-x86_64.iso", req ,res)
      break;
    case 'torrent':
      sendResult("https://archlinux.org/releng/releases/" + archversion + "/torrent/", req, res)
    default:
      res.send("Arch mirror not found, either you made a mistake or the mirror doesn't exist. Reporting to Jonte.")
      log.info("User requested arch mirror: "+req.query.mirror)
      break;
}})
app.get('/age', (res:express) => {
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
