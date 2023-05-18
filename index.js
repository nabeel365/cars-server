const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 1000;

// cors
app.use(cors());

app.use(express.json());




app.get('/', (req, res) => {
    res.send('Toy Cars Are Running')
  })


app.listen(port, () => {
  console.log(`Toy Car World is running on port, ${port}`)
})

