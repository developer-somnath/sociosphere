const http = require("http");

http.get("http://127.0.0.1:8000/login", (res) => {
  let data = "";
  res.on("data", (chunk) => data += chunk);
  res.on("end", () => {
    const lines = data.split("\n");
    for (const line of lines) {
      if (line.includes("<script") || line.includes("<link") || line.includes("src=") || line.includes("href=")) {
        console.log(line);
      }
    }
  });
});
