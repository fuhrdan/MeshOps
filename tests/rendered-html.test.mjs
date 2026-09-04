import assert from "node:assert/strict";
import test from "node:test";

test("renders the MeshOps v1.0.1 start screen", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, /MeshOps/);
  assert.match(html, /v1\.0\.1/);
  assert.match(html, /Keep the tiny helpers talking/);
  assert.match(html, /Quick tutorial/);
  assert.match(html, /Explain it like I’m five/);
  assert.match(html, /Open command console/);
  assert.match(html, /Safe simulation/);
  assert.match(html, /Real Istio lab/);
  assert.doesNotMatch(html, /Starter Project/);
});
