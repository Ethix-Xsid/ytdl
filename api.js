const express = require('express');
const ytdl = require('ytdl-core');
const fs = require('fs'); // Add this line to import the fs module
const app = express();
const port = 3000;

app.get('/download', async (req, res) => {
  try {
    const url = req.query.url;

    if (!ytdl.validateURL(url)) {
      throw new Error('Invalid YouTube URL');
    }

    const info = await ytdl.getInfo(url);
    const audioFormat = ytdl.filterFormats(info.formats, 'audioonly')[0];

    const downloadURL = await downloadWithCallback(url, audioFormat);

    res.json({ downloadURL });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

async function downloadWithCallback(url, format) {
  return new Promise((resolve, reject) => {
    const videoStream = ytdl(url, { format });

    videoStream.on('end', () => {
      const downloadURL = `/downloads/${urlToFileName(url)}.mp3`;
      resolve(downloadURL);
    });

    videoStream.on('error', (error) => {
      reject(error);
    });

    videoStream.pipe(fs.createWriteStream(`./public/downloads/${urlToFileName(url)}.mp3`));
  });
}

function urlToFileName(url) {
  // Convert URL to a safe filename
  return url.replace(/[^\w\s]/gi, '');
}
