Checks new docker registry tag versions, given the image versions used on your projects.

## Usage

`npm install`

run `node detect-upgrades` with arguments `[repo/name]:[current.version.number]` ex.: `library/mysql:5.7.11` or if using a text file ex.: `$(cat args.txt)`.

### Arguments

 - `-q` to quiet out the row of output (collumn names)
 - `-nw` to avoid workarounds. Some docker images like library/wordpress have non-standard version numbers that might affect the accurasy of the application's output, so by default workarounds might be in place like using an alternative endpoint. This argument disables said workarounds.