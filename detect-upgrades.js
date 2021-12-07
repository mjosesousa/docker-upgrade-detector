#! /usr/bin/env node

const fs = require("fs");
const ini = require("ini");
const https = require("https");

const dir = "./projects/";

//read all projects in the directory
fs.readdir(dir, (err, files) => {
  if (err) {
    throw err;
  }

  // for each project
  files.forEach((file) => {
    // Print project name
    console.log("####" + file.replace(/\.[^/.]+$/, ""));

    // Parse
    const project = ini.parse(fs.readFileSync(dir + file, "utf-8"));

    // for each Section of the ini file (each Section represents one of the dependencies)
    for (var dependency in project) {
      detectDependencyNewVersions(project[dependency]);
    }
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
