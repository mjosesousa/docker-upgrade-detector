Checks new docker registry tag versions, given the image versions used on your projects.

## Usage

create a `versions-to-check.json` file with relevant data.

run `node detect-upgrades.js`

## Example versions-to-check.json file

```json
[
  {
    "projectName": "Boat Shop",
    "dependencies": [
      {
        "name": "MySQL",
        "currentVersion": "5.7.11",
        "repository": "mysql"
      }
    ]
  }
]
```