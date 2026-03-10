const http = require("node:http");

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT || 3000);

const server = http.createServer((request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(
      JSON.stringify({
        status: "ok",
        service: "pf-llm-testing-app"
      })
    );
    return;
  }

  response.writeHead(404, { "Content-Type": "application/json" });
  response.end(
    JSON.stringify({
      error: "Not Found"
    })
  );
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
