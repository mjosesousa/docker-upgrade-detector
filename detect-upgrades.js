#! /usr/bin/env node

const fs = require("fs");
const https = require("https");
const columns = require("cli-columns");

const dir = "./projects/";

const args = process.argv.slice(2);

if (args.length == 0) {
  console.log(
    "USAGE [repo/name]:[current.version.number] ex.: library/mysql:5.7.11\n"+
    "-q as first argument to remove first collumn"
  );
  return;
}

// for each dependency
if (args[0] != "-q") {
  var output = ["Respository", "Latest Major", "Latest Minor", "Latest Patch"];
  console.log(doColumns(output));
} else {
  args.shift();
}
// args.forEach(async (arg) => {});
processDependencies(args);
// console.log(columns(output, { sort: false }));

async function processDependencies(args) {
  for (let i = 0; i < args.length; i++) {
    argSplit = args[i].split(":");
    const dependency = {
      repository: argSplit[0],
      currentVersion: argSplit[1],
    };

    const result = await detectDependencyNewVersions(dependency);
    output = [
      dependency.repository,
      result.latestMajor,
      result.latestMinor,
      result.latestPatch,
    ];

    console.log(doColumns(output));
  }
}

function doColumns(output) {
  return columns(output, { sort: false, character: " ", padding: 5 });
}

function detectDependencyNewVersions(dependency) {
  return new Promise((resolve, reject) => {
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
        const [currentMajor, currentMinor, currentPatch] =
          dependency.currentVersion.split(".");
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
          latestMajor: currentMajor != latestMajor ? latestMajor + "" : "-",
          latestMinor:
            currentMinor != latestMinor
              ? currentMajor + "." + latestMinor
              : "-",
          latestPatch:
            currentPatch != latestPatch
              ? currentMajor + "." + currentMinor + "." + latestPatch
              : "-",
        };

        resolve(result);
      });
    });
  });
}
