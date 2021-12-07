Checks new docker registry tag versions, given the image versions used on your projects.

## Usage

`npm install`

create a `[project name].ini` file on folder `projects` for each project with relevant data.

run `node detect-upgrades` with arguments `[repo/name]:[current.version.number]` ex.: `library/mysql:5.7.11`
