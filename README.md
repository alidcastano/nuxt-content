# Nuxt Content Module

Automatically turns markdown files into Vue route components.

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
  - `isPost`, Boolean that specifies where content requires a date.

```js
modules: [
  [@nuxtjs/content, {
    srcDir: "content",
    routeDir: "/"
    content: ["posts"]
  }]
}
```

Content configurations can also be done under the `content` property,
and a 2D Array is also allowed multiple content types:

```js

modules: [@nuxtjs/content, { srcDir: "content"} ]

content: [
  ['posts', { // content/posts/2013-01-10-HelloWorld.md -> localhost:3000/2013/hello-world
    routeDir: '/',
    permalink: ':year/:slug'
  }],
  ['projects', { // content/projects/NuxtContent.md -> localhost:3000/projects/nuxt-content
    routeDir: 'projects',
    permalink: ':section/:slug',
    isPost: false
  }]
]

```

### License

MIT
