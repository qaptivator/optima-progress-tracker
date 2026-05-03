# optima-progress-tracker

shows in a nice table the number of lessons you have done, have to do and will have to do in the future.

designed specifically for optima school, but works on any moodle dashboard actually. (css classes, used to detect elements, will probably need to be changed)

# build and release

**depending on whether you test/build for firefox or chrome, make a copy of `manifest.firefox.json` or `manifest.chrome.json`, and name it as `manifest.json`. also, _keep both manifests the same_**

unfortunately, they are not interchangeable, and i am lazy to make a build system, so just do it manually like this.

## build

to test the extension, go to `about:debugging#/runtime/this-firefox` and load the `manifest.firefox.json` as a temporary extension. OR go to extensions, click `Load Unpacked` and select this folder (assuming you have copied and renamed the correct `manifest.json`)

## release

to release the extension:

- increment the `version` in both `manifest.json` files
- commit your changes under the name: `RELEASE (vX.Y): ...` (where `X` is major release, usually `1`, and `Y` is minor release)
- put everything other than `releases/` and `.git/` into a `.zip` archive with the following name: `optima-progress-tracker_browser_X.Y.zip` (put it inside `releases/`. `browser` is either `chrome` or `firefox`)

firefox:

- go to [Mozilla Add-on Developer Hub](https://addons.mozilla.org/en-US/developers/) and enter the project
- click `Upload New Version` and drag the zip archive there
- when you are done, go to `Extensions` in your firefox and check for updates (or just reinstall the extension)

chrome:

- probably just upload to github? idk
