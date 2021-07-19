const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const HttpError = require('./models/http-error');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

app.use((req, res, next) => {
  console.log(req.method + " " + req.path + " - " + req.ip)
  next()
})

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


const scrapeRouter = require('./routes/scrape');

app.use('/search', scrapeRouter);


app.use((req, res, next) => {
  const error = new HttpError('No se ha podido encontrar la ruta.', 404)
  throw error;
});

app.use((error, req, res, next) => {
  if(res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({message: error.message || 'Ha ocurrido un error inesperado.'});
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});