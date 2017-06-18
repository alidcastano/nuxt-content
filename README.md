# Nuxt Content Module

Nuxt Content grabs all content in registered directory and converts each file into a Vue route component. The content's front-matter or the file name is used to automatically create the route data. 

(Nuxt Content uses `vue-content-loader` to convert markdown files with front-matter into Vue components.)

## Installation

```
npm install nuxt-content

```

## Basic Setup

Configuration can be done inside `nuxt.config.js` via the modules property.

*Note: All paths are relative to Nuxt Root Directory.*

Top Level Module Options:

  - `srcDir`, String that specifies the directory where the content is located.
  - `routePath`, String that specifies the parent route, which content will be nested under.
  If it is "/," then a top level route will be created.
  will be nested under it.
  - `content`, Array that specifies options for all content under a directory.

Content Directory Options:
  - `permalink`, String that specifies path configuration options. The possible options
  are `:slug`, `:section`, `:year`, `:month`, `:day`.
  - `isPost`, Boolean that specifies whether the content requires a date.

```js
modules: [
  [@nuxtjs/content, {
    srcDir: "content",
    routePath: "/"
    content: ["posts", {
      routerDir: "/",
      permalink: ":slug"
    }]
  }]
}
```

Content configurations can also be done under the `content` property,
and a 2D Array is also allowed multiple content types:

```js

modules: [@nuxtjs/content, { srcDir: "content"} ]

content: [
  ['posts', { // content/posts/2013-01-10-HelloWorld.md -> localhost:3000/2013/hello-world
    routePath: '/',
    permalink: ':year/:slug'
  }],
  ['projects', { // content/projects/NuxtContent.md -> localhost:3000/projects/nuxt-content
    routePath: 'projects',
    permalink: ':section/:slug',
    isPost: false
  }]
]

```

By default, page specific data is extracted from the file name, but it can also be specified inside the front-matter of the respective file.

```js
// `nuxt.config.js`
content: ['posts', {
  routePath: '/',
  permalink: ':year/:slug'
}]

// content/posts/2014-05-10-MyFirstPost.md -> localhost:3000/1st
---
title: "My First Post!"
permalink: "1st"
---

# Hello World!

```


### License

MIT
