const express = require('express');
const ytdl = require('ytdl-core');
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

    res.header('Content-Disposition', `attachment; filename="${info.title}.mp3"`);
    ytdl(url, { format: audioFormat })
      .pipe(res);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
