async function test() {
  const res = await fetch("https://barber-pro-6o5c.vercel.app/api/ping");
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Body:", text);
}
test();
