#! /usr/bin/env node

const fs = require("fs");
const https = require("https");

const dir = "./projects/";

const args = process.argv.slice(2);

if (args.length == 0) {
  console.log(
    "USAGE [repo/name]:[current.version.number] ex.: library/mysql:5.7.11"
  );
  return;
}

// for each project
args.forEach((arg) => {
  argSplit = arg.split(":");
  const dependency = {
    repository: argSplit[0],
    currentVersion: argSplit[1],
  };

  detectDependencyNewVersions(dependency);
});

function detectDependencyNewVersions(dependency) {
  const options = {
    host: "registry.hub.docker.com",
    path: `/v2/repositories/${dependency.repository}/tags/?page_size=9999999`,
  };

  https.get(options, (res) => {
    res.setEncoding("utf-8");

    var data = "";

    res.on("data", function (chunk) {
      data += chunk;
    });

    res.on("end", () => {
      // console.log(dependency);
      console.log(
        `Current ${dependency.repository} Version: ${dependency.currentVersion}`
      );
      const [currentMajor, currentMinor, currentPatch] =
        dependency.currentVersion.split(".");
      // console.log(data);
      var latestTags = JSON.parse(data);
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
