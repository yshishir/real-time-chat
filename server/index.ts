import { createServer } from "node:http";

const httpServer = createServer();

const PORT = 4000;

httpServer.listen(PORT, () => {
    console.log(`Socket.IO server running on http://localhost:${PORT}`);
  });
