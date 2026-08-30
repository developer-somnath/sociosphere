const http = require("http");

http.get("http://127.0.0.1:8000/login", (res) => {
  let data = "";
  res.on("data", (chunk) => data += chunk);
  res.on("end", () => {
    console.log("STATUS:", res.statusCode);
    console.log("HEADERS:", res.headers);
    console.log("HTML BODY:\n", data);
  });
}).on("error", (err) => {
  console.error("HTTP Error:", err.message);
});
