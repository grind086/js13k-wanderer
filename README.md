# Wanderer
My entry for the 2017 [js13k competition](http://2017.js13kgames.com/). I used the [js13k-toolkit](https://github.com/lucaspenney/js13k-toolkit) as a starting point.

## Install
```
git clone https://github.com/grind086/js13k-wanderer.git
npm install
```

## Build
```
gulp build
// or
gulp watch
```

The minified files are put in the `build` directory, and the zipped version will be in `dist`. A warning is displayed if the result is greater than 13kb. To run the game
simply serve the files in the `build` directory

## Run
Simply serve the files in the `build` directory on a local server. For example using [http-server](https://github.com/indexzero/http-server):

```
http-server ./build
```
