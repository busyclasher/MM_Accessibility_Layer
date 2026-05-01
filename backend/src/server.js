import http from "node:http";

const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  const route = req.url || "/";

  if (route === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "mal-backend" }));
    return;
  }

  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify({ message: "MAL backend starter service", route }));
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`MAL backend listening on http://localhost:${port}`);
});
