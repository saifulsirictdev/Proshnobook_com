const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createHmac } = require("node:crypto");
const { createRequire } = require("node:module");
const fs = require("node:fs");
const blob = require("@vercel/blob");
const client = require("@vercel/blob/client");
// Use the SDK's own transport; deny every real outbound connection, including retries.
const { MockAgent, getGlobalDispatcher, setGlobalDispatcher } = createRequire(
  require.resolve("@vercel/blob"),
)("undici");
const token = "vercel_blob_rw_contracttest_fake_local_only";

test("real Blob SDK preserves server put/head/list/delete contracts without network or credentials", async () => {
  const agent = new MockAgent();
  agent.disableNetConnect();
  const previous = getGlobalDispatcher();
  setGlobalDispatcher(agent);
  const api = agent.get("https://vercel.com");
  const pathname = "pdf-vault/local-fixture.bin";
  const url = `https://contracttest.public.blob.vercel-storage.com/${pathname}`;
  const result = {
    url,
    pathname,
    downloadUrl: url + "?download=1",
    contentType: "application/octet-stream",
    size: 7,
    uploadedAt: "2026-11-10T00:00:00Z",
    etag: "fixture",
  };
  try {
    api
      .intercept({
        path: "/api/blob/?" + new URLSearchParams({ pathname }).toString(),
        method: "PUT",
      })
      .reply(200, result);
    const saved = await blob.put(pathname, Buffer.from("fixture"), {
      token,
      abortSignal: AbortSignal.timeout(2000),
      access: "public",
      contentType: "application/octet-stream",
      addRandomSuffix: false,
    });
    assert.equal(saved.url, url);
    assert.equal(saved.pathname, pathname);
    api
      .intercept({
        path: "/api/blob?" + new URLSearchParams({ url }).toString(),
        method: "GET",
      })
      .reply(200, result);
    const info = await blob.head(url, {
      token,
      abortSignal: AbortSignal.timeout(2000),
    });
    assert.equal(info.size, 7);
    assert.equal(info.contentType, "application/octet-stream");
    assert.ok(info.uploadedAt instanceof Date);
    api
      .intercept({ path: /\/api\/blob\?.*prefix=pdf-vault/, method: "GET" })
      .reply(200, { blobs: [result], hasMore: false });
    assert.equal(
      (
        await blob.list({
          token,
          abortSignal: AbortSignal.timeout(2000),
          prefix: "pdf-vault/",
          limit: 1,
        })
      ).blobs[0].url,
      url,
    );
    api
      .intercept({
        path: "/api/blob/delete",
        method: "POST",
        body: JSON.stringify({ urls: [url] }),
      })
      .reply(200, {});
    await blob.del(url, { token, abortSignal: AbortSignal.timeout(2000) });
    agent.assertNoPendingInterceptors();
  } finally {
    setGlobalDispatcher(previous);
    await agent.close();
  }
});

test("real client-token SDK retains PDF upload constraints and authenticates completion callbacks", async () => {
  const pathname =
    "ready-papers/parts/00000000-0000-4000-8000-000000000001.pdf";
  const validUntil = Date.now() + 3600000;
  const generated = await client.handleUpload({
    token,
    request: new Request("https://example.invalid/api/ready-upload"),
    body: {
      type: "blob.generate-client-token",
      payload: { pathname, clientPayload: null, multipart: false },
    },
    onBeforeGenerateToken: async (path) => {
      assert.equal(path, pathname);
      return {
        allowedContentTypes: ["application/pdf"],
        maximumSizeInBytes: 10000000,
        addRandomSuffix: false,
        validUntil,
        tokenPayload: "owned-part",
        callbackUrl: "https://example.invalid/api/ready-upload",
      };
    },
    onUploadCompleted: async () => {},
  });
  const payload = client.getPayloadFromClientToken(generated.clientToken);
  assert.equal(payload.pathname, pathname);
  assert.deepEqual(payload.allowedContentTypes, ["application/pdf"]);
  assert.equal(payload.maximumSizeInBytes, 10000000);
  assert.equal(payload.validUntil, validUntil);
  assert.equal(payload.addRandomSuffix, false);
  assert.equal(payload.onUploadCompleted.tokenPayload, "owned-part");
  const body = {
    type: "blob.upload-completed",
    payload: {
      blob: { url: "https://example.invalid/fixture.pdf", pathname },
      tokenPayload: "owned-part",
    },
  };
  let completions = 0;
  const complete = (signature, event = body) =>
    client.handleUpload({
      token,
      request: new Request("https://example.invalid/api/ready-upload", {
        headers: signature ? { "x-vercel-signature": signature } : {},
      }),
      body: event,
      onBeforeGenerateToken: async () => {
        throw Error("unexpected token issuance");
      },
      onUploadCompleted: async (received) => {
        assert.equal(received.tokenPayload, "owned-part");
        completions++;
      },
    });
  await assert.rejects(complete(), /signature/i);
  await assert.rejects(complete("forged"), /signature/i);
  const signature = createHmac("sha256", token)
    .update(JSON.stringify(body))
    .digest("hex");
  await assert.rejects(
    complete(signature, {
      ...body,
      payload: { ...body.payload, tokenPayload: "tampered" },
    }),
    /signature/i,
  );
  assert.equal(completions, 0);
  assert.equal((await complete(signature)).response, "ok");
  assert.equal(completions, 1);
});

test("lockfile keeps the reviewed storage transport and Next PostCSS security fixes", () => {
  const lock = JSON.parse(fs.readFileSync("package-lock.json", "utf8"));
  assert.equal(lock.packages["node_modules/@vercel/blob"].version, "2.4.0");
  assert.equal(lock.packages["node_modules/undici"].version, "6.29.1");
  assert.equal(
    lock.packages["node_modules/next/node_modules/postcss"]?.version ??
      lock.packages["node_modules/postcss"].version,
    "8.5.33",
  );
  for (const name of [
    "node_modules/@fastify/busboy",
    "node_modules/@vercel/cli-config",
    "node_modules/@vercel/oidc",
  ])
    assert.equal(lock.packages[name], undefined);
});
