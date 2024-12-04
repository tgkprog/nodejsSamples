const http = require('http');
const fs = require('fs');
const path = require('path');

// Function to get current date-time as a formatted string
function getFormattedTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[-:.TZ]/g, '_'); // Formats as yy_mm_dd_HH_MM_ss
}

const directoryPath = path.join('/data/tmp/http1/');
let counter = 0;

// Ensure directory exists
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
    console.log(`Directory created : ${directoryPath}`);
  }else{
	  console.log(`Directory for saving : ${directoryPath}`);
  }
  
// Define server
const server = http.createServer((req, res) => {
  const timestamp = getFormattedTimestamp();
  const method = req.method;
  const fileName = `${timestamp}${method}.txt`;
  const filePath = path.join(directoryPath, fileName);


  // Open the file for writing
  const fileStream = fs.createWriteStream(filePath);

  // Write request method, URL, and headers to the file
  fileStream.write(`Method: ${method}\n`);
  fileStream.write(`At: ${timestamp}\n`);
  fileStream.write(`URL: ${req.url}\n`);
  fileStream.write(`Headers:\n${JSON.stringify(req.headers, null, 2)}\n\n`);
  fileStream.write('BODY:\n\n');

  // Write incoming chunks of data to the file as they arrive
  req.on('data', (chunk) => {
    fileStream.write(chunk);
  });

  req.on('end', () => {
    fileStream.end(); // Close the file stream
    console.log(`Request saved to ${filePath}`);
    
    const responseBody = {
  "data": {
    "duplicateEntities": `s${counter}`

  }
};
	counter++;
	res.setHeader('Content-Type', 'application/json');
	res.statusCode = 200;
	res.end(JSON.stringify(responseBody));
  
  });

  req.on('error', (err) => {
    console.error('Request error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server Error');
    fileStream.end(); // Ensure file stream is closed on error
  });
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
