#! /usr/bin/env node

const fs = require("fs");
const https = require("https");

fs.readFile("./versions-to-check.json", (err, data) => {
  if (err) throw err;
  const projects = JSON.parse(data);
  projects.forEach((project) => {
    console.log("\x1b[34m%s\x1b[0m", `### Project: ${project.projectName}`);

    project.dependencies.forEach((dependency) => {
      detectDependencyNewVersions(dependency);
    });
  });
});

function detectDependencyNewVersions(dependency) {
  console.log(
    `Current ${dependency.name} Version: ${dependency.currentVersion}`
  );
  const [currentMajor, currentMinor, currentPatch] =
    dependency.currentVersion.split(".");

  const options = {
    host: "registry.hub.docker.com",
    path: `/v2/repositories/library/${dependency.repository}/tags/`,
  };

  https.get(options, (res) => {
    res.setEncoding("utf-8");
    res.on("data", (d) => {
      var latestTags = JSON.parse(d);
      var versionsArray = [];
      latestTags.results.forEach((tag) => {
        let [tagMajor, tagMinor, tagPatch] = tag.name.split(".");
        versionsArray.push({
          major: Number.parseInt(tagMajor),
          minor: Number.parseInt(tagMinor),
          patch: Number.parseInt(tagPatch),
          updated: tag.last_updated,
        });
      });
      // console.table(versionsArray);

      var latestMajor = 0;
      var latestMinor = 0;
      var latestPatch = 0;
      versionsArray.forEach((version) => {
        if (version.major > latestMajor)
          latestMajor = Number.parseInt(version.major);
        if (
          Number.parseInt(currentMajor) == Number.parseInt(version.major) &&
          version.minor > latestMinor
        )
          latestMinor = version.minor;
        if (
          Number.parseInt(currentMajor) == Number.parseInt(version.major) &&
          Number.parseInt(currentMinor) == Number.parseInt(version.minor) &&
          version.patch > latestPatch
        )
          latestPatch = version.patch;
      });

      const result = {
        latestMajor: latestMajor + "",
        latestMinor: currentMajor + "." + latestMinor,
        latestPatch: currentMajor + "." + currentMinor + "." + latestPatch,
      };

      console.table(result);
    });
  });
}
