const http = require('http');
const fs = require('fs');

const localHost = 'localhost'
const port = 4001



const requestHandler = (req, res) => {

  if (req.url === '/'){
    getHomePage(req, res);
  }
  
  if (req.url.endsWith('.html') && req.method === 'GET'){
    try {
      getDiffPage(req, res)
    } catch (error) {
      getErrorPage(req, res) 
    }
  }
}

// HANDLERS
const getHomePage = (req, res) => {
  const homePage = fs.readFileSync('./index.html')
  res.setHeader('content-type', 'text/html')
  res.writeHead(200)
  res.end(homePage)
}

const getDiffPage = (req, res) => {
  const spliturl = req.url.split('/')
  const diffPageName = spliturl[1]
  const diffLocation = `./${diffPageName}`

  const diffPage = fs.readFileSync(diffLocation)
  res.setHeader('content-type', 'text/html')
  res.writeHead(200)
  res.end(diffPage)
}

const getErrorPage = (req, res) => {
  const errorPage = fs.readFileSync('./404.html')
  res.setHeader('content-type', 'text/html')
  res.writeHead(404)
  res.end(errorPage)
}



const server = http.createServer(requestHandler)

server.listen(port, () => {
  console.log(`Listening on port: ${localHost}:${port}`);
})