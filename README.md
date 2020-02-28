# Game Explorer
![Preview](https://raw.githubusercontent.com/wiki/iSirThijs/web-app-from-scratch-1920/images/preview.png)

This is a webapp to explore games. Search for a game and view details from it. Check its detail page for more info about the game and more

The app is a work in progress, but you can check it here: https://isirthijs.github.io/web-app-from-scratch-1920/

## Features
- Check details about a game like rating, stores
- See if there is a reddit community
- Search on developer or creator
- find out where to buy it

# Contents <!-- omit in toc -->
- [Game Explorer](#game-explorer)
  - [Features](#features)
- [Minor Webdevelopment](#minor-webdevelopment)
- [Install and Usage](#install-and-usage)
  - [Prerequisites](#prerequisites)
  - [Install](#install)
  - [Usage](#usage)
    - [Development](#development)
    - [Build](#build)
- [Data sources](#data-sources)
- [App internals](#app-internals)
  - [Actor Diagram](#actor-diagram)
  - [Interaction Diagram](#interaction-diagram)
- [Dependencies](#dependencies)
- [Acknowledgements](#acknowledgements)
- [License](#license)

# Minor Webdevelopment 
This is my assignment from the subject 'Web App from scratch' in the minor [Webdevelopment](https://everythingweb.org) from the HvA(Amsterdam University of applied sciences) study Communication and Multimedia Design.

<details>
    <summary>Other assignments</summary>
    <ul>
        <li><a href='https://github.com/iSirThijs/web-app-from-scratch-1920'>Web App from Scratch</a> - This assignment</li>
        <li><a href='https://github.com/iSirThijs/css-to-the-rescue-1920'>CSS to the rescue</a></li>
    <ul>
</details>

# Install and Usage
## Prerequisites 
* Node.JS (12.14.1)
* NPM

## Install 
1. Clone this repo
```bash
git clone https://github.com/iSirThijs/web-app-from-scratch-1920.git
```
2. Install dependencies with ``` npm install```

## Usage
### Development 
To run the dev environment: ``` npm run dev ```. This wil run rollup watcher and serve with, allowing you to view on localhost:*. Terminal will show the port/address

### Build
Run `npm run build` to run rollup and bundle th JS to `docs/scripts/app.js`


# Data sources
This project features from the game database [RAWG](https://rawg.io). It uses REST GET request with query parameters to obtain the data. 

The API is free to use for personal use and doesn't have any rate limits.

The return data look like this and already has a good structure, there is not any need for transforming it:
```js
{
  "count": 0,
  "next": "http://example.com",
  "previous": "http://example.com",
  "results": [
    {
      "id": 0,
      "slug": "string",
      "name": "string",
      "released": "2020-02-14",
      "tba": true,
      "background_image": "http://example.com",
      "rating": 0,
      "rating_top": 0,
      "ratings": {},
      "ratings_count": 0,
      "reviews_text_count": "string",
      "added": 0,
      "added_by_status": {},
      "metacritic": 0,
      "playtime": 0,
      "suggestions_count": 0
    }
  ]
}
```

# App internals
This is how the app works internally, made visual using two diagrams:
## Actor Diagram
![Actor Diagram](https://raw.githubusercontent.com/wiki/iSirThijs/web-app-from-scratch-1920/images/actor-diagram-v3.png)

## Interaction Diagram
![Interaction Diagram](https://raw.githubusercontent.com/wiki/iSirThijs/web-app-from-scratch-1920/images/interaction-diagram-v2.png)

# Dependencies
* [Rollup](https://github.com/rollup/rollup)
* [Rollup Plugin Alias](https://[github](https://github.com/rollup/plugins/tree/master/packages/alias).com/zeit/serve)
* [Rollup Plugin Server](https://github.com/thgh/rollup-plugin-serve)

# Acknowledgements
* Virtual Dom tutorials and resources:
  * [Building a simple virtual dom from scratch](https://dev.to/ycmjason/building-a-simple-virtual-dom-from-scratch-3d05)
  * [Create your own virtual dom to understand it(part 1)](https://medium.com/@aibolkussain/create-your-own-virtual-dom-to-understand-it-part-1-47b9b6fc6dfb)
  * [Create your own virtual dom to understand it(part 2)](https://medium.com/@aibolkussain/create-your-own-virtual-dom-to-understand-it-part-2-c85c4ffd15f0)


# License
MIT License

Copyright (c) 2020 Thijs Spijker

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.