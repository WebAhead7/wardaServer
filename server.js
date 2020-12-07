const express = require('express');
const connectDB = require('./config/db');
const path = require('path');

const app = express();

// Connect DB
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  app.use('*', (req, res) =>
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'))
  );
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started at ${PORT}`));
