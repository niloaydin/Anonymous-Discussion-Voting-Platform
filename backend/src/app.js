const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { connectToMongo } = require('./db/connection');
const discussionRoutes = require('./routes/discussionRoute');
const { checkDiscussionsForVoting } = require('./services/periodicVotingCheckService');
const http = require("http");
const { Server } = require("socket.io");


const app = express();
const port = process.env.PORT;

app.use(cors());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/api/discussion", discussionRoutes);

//websocket
const server = http.createServer(app);
console.log(`websocket server ${JSON.stringify(server)}`)
const io = new Server(server, {
  cors: {
    origin: "*"
  },
});
app.set("socketio", io);

io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("A client disconnected:", socket.id);
  });
});

setInterval(checkDiscussionsForVoting, 30 * 1000); //check every 12 hours

if (process.env.NODE_ENV !== 'test') {
  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    connectToMongo();
  });
}
