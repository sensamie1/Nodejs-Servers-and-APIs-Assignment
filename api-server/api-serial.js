const http = require('http');

const fs = require('fs');

const path = require('path');

const localHost = 'localhost'

const port = 5002

const itemsDbPath = path.join(__dirname, 'items-serial.json');

const preReaditems = fs.readFileSync(itemsDbPath)
const items = JSON.parse(preReaditems)

//RESPONSE HANDLER
const responseHandler = (req, res) => ({ code = 200, error = null, data = null }) => {
  res.setHeader('content-type', 'application.json')
  res.writeHead(code)
  res.write(JSON.stringify({ data, error}))
  res.end()
}

//BODY PARSER
const bodyParser = (req, res, callback) => {
  const data = [];

  req.on('data', (chunk) => {
    data.push(chunk)
  })

  req.on('end', () => {
    if (data.length){
      const bufferBody = Buffer.concat(data).toString();
      bodyOfRequest = JSON.parse(bufferBody)
    }
    
    callback(req, res)

    })
}

// SAVE TO DATABASE (fs.writeFile)
const saveToDb = (req, res) => {
  fs.writeFile(itemsDbPath, JSON.stringify(items), (err) => {
    if (err) {
      console.log(err);
      res.writeHead(500);
      res.end(JSON.stringify({
        message: 'Internal Server Error.'
      }));
    }
    res.end(JSON.stringify(items));
  });
}

// READ DATABASE (fs.reaFile)
const readDb = (rea, res) => {
  fs.readFile(itemsDbPath, "utf8", (err, items)=> {
    if (err){
      console.log(err)
      res.writeHead(400)
      res.end("An error occured")
    }
    res.end(items);
})
}

//REQUEST HANDLER
const requestHandler = (req, res) => {
  
  const response = responseHandler(req, res)


  //POST
  if (req.url === '/v1/items' && req.method === 'POST') {

    // get ID of last item in the database
    const lastItem = items[items.length - 1];
    const lastItemId = lastItem.id;
    newItem = lastItemId + 1;

    items.push({ ...bodyOfRequest, id: newItem })
    saveToDb(req, res)
    return response({data: items})
  }

  //GET ALL
  if (req.url === '/v1/items' && req.method === 'GET'){
    readDb(req, res)
    return response({data: items})
  }

  //GET ONE
  if (req.url.startsWith('/v1/items') && req.method === 'GET'){
    const id = req.url.split('/')[3]
    console.log({ id });
    const itemIndex = items.findIndex((item) => item.id === parseInt(id) )
    if (itemIndex === -1){
      return response({
        code: 404,
        error: 'item not found!'
      })
    }
    const item = items[itemIndex]
    return response({
      data: item
    })
  }

  //UPDATE ONE
  if (req.url.startsWith('/v1/items') && req.method === 'PATCH'){
    const id = req.url.split('/')[3]
    console.log({ id });
    const itemIndex = items.findIndex((item) => item.id === parseInt(id) )
    if (itemIndex === -1){
      return response({ code: 404, error: 'item not found!' })
    }
    const item = {...items[itemIndex], ...bodyOfRequest}
    items.splice(itemIndex, 1, item)
    saveToDb(req, res)
    return response({ data: item, error: 'null -- Update Succesful!' })
  }

  //DELETE
  if (req.url.startsWith('/v1/items') && req.method === 'DELETE'){
    const id = req.url.split('/')[3]
    console.log({ id });
    const itemIndex = items.findIndex((item) => item.id === parseInt(id) )
    if (itemIndex === -1){
      return response({ code: 404, error: 'item not found!' })
    }
    items.splice(itemIndex, 1)
    saveToDb(req, res)
    return response({ data: items, error: 'null -- Delete Succesful!' })
  }

}


const server = http.createServer((req, res) => bodyParser(req, res, requestHandler))

server.listen(port, () => {
  console.log(`Listening on port: ${localHost}:${port}`);
})