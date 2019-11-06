# Actinium Auth

## Getting Started
```
$ npm install && cd ./ui && npm install
```

### Node Module Local Development
1. Remove `@atomic-reactor/actinium-auth` from your Actinium package.json
2. Use `npm link /path/to/this/code` from Actinium directory.

## Auth UI Local Development
1. Follow the steps for Node Module Local Development
2. `$ cd ./ui && npm run local`


## Building for distribution

```
$ npm run static
```

```
$ npm publish
```
> _Note: Be sure to bump version before publishing to NPM_
