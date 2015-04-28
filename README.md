# Angular Globe
AngularJS directive for visualising data on interactive 3D globe.

![Example Gif](http://madvas.github.io/angular-globe/pages/core/resources/angular-globe.gif)

### Requirements
  - AngularJS
  - D3.js
  - [topojson] (only if using version with built in map)

### Examples & API Reference
You can see it in action here [madvas.github.io/angular-globe]

### Installation
```sh
$ bower install angular-globe --save
```
This will download two kinds of files: 
* angular-globe.js - Needs to load land data manually. See [Expert Example]
* angular-globe-with-map.js - Version with built in land data for convenient usage

### Usage
```javascript
angular.module('myModule', ['madvas.angular-globe'])
```

```html
<m2s-globe
    points="points"
    point-lat="d.position.lat"
    point-lng="d.position.lng"
    point-radius="d.pointRadius"
    point-fill="d.fillColor"
    draggable="true"
    clickable="false"
    point-stroke-width="1">
</m2s-globe>
```
For more explanatory examples see: [madvas.github.io/angular-globe]

### Contributions
Would be greaat ;)

[Expert Example]: http://madvas.github.io/angular-globe/#/expert
[topojson]: https://github.com/mbostock/topojson
[madvas.github.io/angular-globe]: http://madvas.github.io/angular-globe

