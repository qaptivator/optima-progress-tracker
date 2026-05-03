# optima-progress-tracker

shows in a nice table the number of lessons you have done, have to do and will have to do in the future.

designed specifically for optima school, but works on any moodle dashboard actually. (css classes, used to detect elements, will probably need to be changed)

# build and release

to test the extension, go to `about:debugging#/runtime/this-firefox` and load the `manifest.json` as a temporary extension.

to release the extensio:

- increment the `version` in `manifest.json`
- commit your changes under the name: `RELEASE (vX.Y): ...` (where `X` is major release, usually `1`, and `Y` is minor release)
- put everything other than `releases/` and `.git/` into a `.zip` archive with the following name: `optima-progress-tracker_X.Y.zip` (put it inside `releases/`)
- go to [Mozilla Add-on Developer Hub](https://addons.mozilla.org/en-US/developers/) and enter the project
- click `Upload New Version` and drag the zip archive there
- when you are done, go to `Extensions` in your firefox and check for updates (or just reinstall the extension)
