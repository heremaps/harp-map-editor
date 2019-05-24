# @here/harp-mapeditor [![Build Status](https://travis-ci.com/heremaps/harp-mapeditor.svg?branch=master)](https://travis-ci.com/heremaps/harp-mapeditor)

## Overview

### A simple online editor for harp.gl themes.

Allows you to create and edit existing themes.

The following features are currently available:
 - export and import of themes
 - live preview
 - style change
 - restore page state after page reload
 - default themes
 - code formatting
 - theme source code validation
 - code autocompletion
 - two window mode

When you run the editor, you should get something similar to the image shown below:

![Sample editor](editor.png)

## Development

### Prerequisites

-   **Node.js** - Please see [nodejs.org](https://nodejs.org/) for installation instructions.
-   **Yarn** - Optional. Please see [yarnpkg.com](https://yarnpkg.com/en/) for installation instructions.

### Download dependencies

Run:

```sh
npm install
```
or

```sh
yarn install
```

to download and install all required packages.

### Launch development server for harp.gl theme editor

Run:

```sh
yarn start
```

To launch `webpack-dev-server`. Open `http://localhost:8080/` in your favorite browser.

To build the editor run:

```sh
yarn build
```
The build result will be in `dist` folder.

## License

Copyright (C) 2018-2019 HERE Europe B.V.

See the [LICENSE](./LICENSE) file in the root of this project for license details.
