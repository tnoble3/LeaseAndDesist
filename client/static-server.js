const http = require('http')
const fs = require('fs')
const path = require('path')

const port = process.env.PORT || 3000
const distDir = path.join(__dirname, 'dist')

const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
}

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0]
  if (reqPath === '/') reqPath = '/index.html'
  let filePath = path.join(distDir, reqPath)

  // fallback to index.html for SPA
  if (!fs.existsSync(filePath)) {
    filePath = path.join(distDir, 'index.html')
  }

  const ext = path.extname(filePath) || '.html'
  const contentType = mime[ext] || 'application/octet-stream'

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500)
      return res.end('Server error')
    }
    res.writeHead(200, { 'Content-Type': contentType })
    res.end(data)
  })
})

server.listen(port, () => {
  console.log(`Static server running at http://localhost:${port}`)
})
