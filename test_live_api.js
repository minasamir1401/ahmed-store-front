const test = async () => {
  const res = await fetch("https://ahmed.red-gate.tech/api/ai/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] })
  });
  const text = await res.text();
  console.log("STATUS:", res.status);
  console.log("RESPONSE:", text);
};
test();
