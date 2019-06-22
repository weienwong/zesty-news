const SDK = require('@zesty-io/sdk')
require('dotenv').config()

const https = require('https')

const instanceZUID = '8-caff8ff5cf-mkstfc'
const cmZUID = '6-abbeac-hf1cgk'
const token = process.env.APPSID
const sdk = new SDK(instanceZUID, token)

const cheerio = require('cheerio')

const scrapeNPR = (cb) => {
  https.get('https://www.npr.org/sections/news/', (res) => {
    let rawData = ''
    res.on('data', (chunk) => {
      rawData += chunk
    })
    res.on('end', () => {
      const $ = cheerio.load(rawData)
      const title = $('#featured > div > article:nth-child(1) > div.item-info-wrap > div > h2 > a').text()
      const url = $('#featured > div > article:nth-child(1) > div.item-info-wrap > div > h2 > a').attr('href')
      cb(title, url)
    })
  })
}

const buildPayload = (title, url) => {
  const pathPart = title.toLowerCase().replace(/ /gi, '-')
  const metaTitle = title

  const payload = {
    data: {
      title,
      url
    },
    web: {
      pathPart,
      metaTitle,
      metaLinkText: metaTitle
    }
  }

  sdk.instance.createItem(cmZUID, payload).then((res) => {
    console.log(res)
  }).catch((err) => {
    console.error(err)
  })
}

setInterval(() => {
  scrapeNPR(buildPayload)
}, 10000)
