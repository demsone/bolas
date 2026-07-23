async function start() {
  const [{ createServer }, nextModule] = await Promise.all([
    import("node:http"),
    import("next"),
  ]);

  const dev = process.env.NODE_ENV !== "production";
  const hostname = process.env.HOSTNAME || "127.0.0.1";
  const port = Number(process.env.PORT || 3000);

  const app = nextModule.default({ dev, hostname, port });
  const handle = app.getRequestHandler();

  await app.prepare();
  createServer((request, response) => {
    handle(request, response);
  }).listen(port, hostname, () => {
    console.log(`Bolas running at http://${hostname}:${port}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
