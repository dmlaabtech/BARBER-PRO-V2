async function test() {
  const res = await fetch("https://barber-pro-6o5c.vercel.app/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test@test.com", password: "password" })
  });
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Body:", text);
}
test();
