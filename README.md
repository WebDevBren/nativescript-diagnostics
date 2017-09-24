# nativescript-diagnostics

A DIRECT port of the fantastic Cordova-diagnostics plugin.

## Installation
installation should be as simple as running:
`tns plugin add nativescript-diagnostics`

## Usage

Now this isnt your typical Nativescript Plugin, we don't need to make use of registerElement or any of that, you simply import the function you need.

Typescript :

```(typescript)
import { requestLocationAuthorization } from 'nativescript-diagnostics'
```

ES6/Node-like :

```(javascript)
const requestLocationAuthorization = require('nativescript-diagnostics').requestLocationAuthorization;
```


## Many thanks

- [roblav96](https://github.com/roblav96) - For Providing the Initial Permissions for IOS. 

