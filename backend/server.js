const { app } = require('./functions/api');
const cors = require('cors');

// Enable CORS for local development
app.use(cors());

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
