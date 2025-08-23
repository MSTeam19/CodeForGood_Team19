const express = require('express');
const path = require('path')
require('dotenv').config();
const { FE_ENDPOINT } = process.env
const PORT = process.env.PORT || 3000;
const cors = require('cors');
const app = express()

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({origin: ['http://localhost:5173', 'http://127.0.0.1:5173', FE_ENDPOINT],
    credentials: true
}));

app.get('/', (req, res) => {
    res.status(200).send('ok')
});

let apiRouter = require('./api/index');
app.use('/', apiRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
});
