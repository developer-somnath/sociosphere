const http = require("http");

http.get("http://10.211.114.159:8000/login", (res) => {
  let data = "";
  res.on("data", (chunk) => data += chunk);
  res.on("end", () => {
    console.log("STATUS on 10.211.114.159:8000 ->", res.statusCode);
  });
}).on("error", (err) => {
  console.error("Connection Error on 10.211.114.159:8000 ->", err.message);
});
