"use strict";
const autocannon = require("autocannon");

const instance = autocannon(
  {
    title: "Load Testing",
    url: "http://localhost:3000",
    connections: 100, // 700
    pipelining: 1,
    duration: 10, // 60
  },
  console.log
);
// kill the instance on CTRL-C
process.once("SIGINT", () => {
  instance.stop();
});

// render results
autocannon.track(instance, { renderProgressBar: true });
