const fs = require('fs')
const path = require('path')
const express = require('express')
const app = express()
const port = 3000

app.use(express.static('public'))

// =============================================================================
app.use('/hello-world', (req, res) => {
  const foo = 'Hello World'

  res.status(200)
    .end(foo)
})

// =============================================================================
const fooGlobal = 'Hello World'
app.use('/hello-world-global', (req, res) => {
  res.status(200)
    .end(fooGlobal)
})

// =============================================================================
app.use('/gc', (req, res) => {
  if (global.gc) {
    global.gc()
    console.log('running gc')
  }

  res.status(200)
    .end()
})

// =============================================================================
app.use('/read-file-sync', (req, res) => {
  const file = fs.readFileSync('./public/index.html')

  res.status(200)
    .end(file)
})

// =============================================================================
const fileGlobal = fs.readFileSync('./public/index.html')
app.use('/read-file-sync-cache', (req, res) => {
  res.status(200)
    .end(fileGlobal)
})

// =============================================================================
app.use('/read-data', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const dataList = {}

  const files = fs.readdirSync(path.join(__dirname, 'results'))
  files.forEach((file) => {
    const [name, rsp] = file.split('#')
    const data = fs.readFileSync(path.join(__dirname, 'results', file), 'utf-8')

    if (!dataList[rsp]) {{
      dataList[rsp] = {}
    }}

    dataList[rsp][name] = data.match(/\d+\.\d+m?s/g).map(value => {
      const msRegExp = /ms/
      const secondRegExp = /s/

      if (msRegExp.test(value)) {
        return Number(value.replace(msRegExp, ''))
      }

      return Number(value.replace(secondRegExp, '') * 1000)
    })
  })
  
  res.status(200)
    .end(JSON.stringify({
      group: ['P50', 'P75', 'P90', 'P95', 'P99', 'P99.9', 'P99.99'],
      data: dataList
    }))
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
