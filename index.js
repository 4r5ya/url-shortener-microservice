require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
let mongoose = require('mongoose')
let axios = require('axios')
let schema = mongoose.Schema
const envVar = process.env.MONGO_URI
const bodyParser = require('body-parser')
const validUrl = require('valid-url');
mongoose.connect(envVar, { useNewUrlParser: true, useUnifiedTopology: true });
//create schema
const UrlSchema = new mongoose.Schema({
  original : String,
  short : String
});
const Url = mongoose.model('shortetsUrl', UrlSchema);
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});
//create Main Algorithm
app.use(bodyParser.urlencoded({extended: false}))
app.post('/api/shorturl', async (req, res) => {
  const originalUrl = req.body.url;
  const regexValidationUrl = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi)
  if (!validUrl.isWebUri(originalUrl)) {
    res.json({ error: 'Invalid Url' });
    setTimeout(()=>{
      res.redirect('/')
    }, 2000)
  }
  try {
    let url = await Url.findOne({ original: originalUrl });
    if (!url) {
      const randomShort = Math.random().toString(36).substring(2, 7);
      url = new Url({
        original: originalUrl,
        short: randomShort
      });
      await url.save();
    }
    res.json({ original_url: url.original, short_url: url.short });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/shorturl/:short', async(req, res) => {
  const shortCode = req.params.short
  try{
    const url = await Url.findOne({short : shortCode})
    if(url){
      res.redirect(url.original)
    }else{
      res.json("ShortLink Not Found")
    }
  }catch(err){
    res.json(err)
  }
})
//
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
