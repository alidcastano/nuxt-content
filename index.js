const join = require('path').join
const fs = require('fs')
const fm = require('front-matter')
const pathToRegexp = require('path-to-regexp')
const paramCase = require('param-case')

/**
 * Nuxt Content Module.
 *
 *  Module Options:
 *   - srcDir    : STRING - content source directory
 *   - routePath : STRING - content parent route
 *   - content   : ARRAY  - content type and configuation options
 *
 * Content Options:
 *   - slug      : STRING  - content url identifation name
 *   - permalink : STRING  - content url path options
 *   - isPost    : BOOLEAN - whether the content is chronological
 *
 *
 * Content configuration can be done via modules or content property.
 *    @note All paths are relative to Nuxt root directory.
 *
 *  example:
 *    modules: [
 *      [@nuxtjs/content, {
 *        srcDir: "content",
 *        routePath: "blog"
 *        content: ["posts", { permalink: ":title" }]
 *      }]
 *    ]
 *   OR
 *   modules: [@nuxtjs/content, { srcDir: "content"} ]
 *   content: ["posts", { permalink: ":title" }]
 *
 *
 * For content, 2D Array is allowed multiple content types:
 *
 * example:
 *   content: [
 *    ["posts", { permalink: ":year/:title" }],
 *    ["collection", { permalink: ":year/:title", isPost: false }]
 *   ]
 *
 *  Route Configuration:
  *  Can either be top level route ("/") or nested route under an existing nuxt page.
  *    @note There cannot exist any dynamic route at same level of content route.
  *
  *  example: [
  *    ["posts", { routePath: "/" }],          // posts/HelloWorld -> /Helloworld
  *    ["projects", { routePath: "projects" }] // projects/Nuxt -> projects/Nuxt
  *   ]
 *
 */
module.exports = function (options) {
  const nuxt = this.options

  // convert markdown files to vue component
  nuxt.build.loaders.push({
    test: /\.md$/,
    use: [{
      loader: 'vue-content-loader',
      options: options.loaderOptions || {}
    }]
  })

  options.rootPath = options.srcDir
    ? join(nuxt.rootDir, options.srcDir)
    : config.rootDir


  // create routes for registered content
  const config = nuxt.content || options.content
  nuxt.router.extendRoutes = (routes, resolve) => {
    if (Array.isArray(config[0])) { // nested array of content sources
      config.forEach(type => {
        const filesData = getFilesData(type[0], options.rootPath)
        const contentOpts = getContentOpts(type[1], options)
        addRoutes(contentOpts, routes, filesData)
      })
    } else { // single content source
      const filesData = getFilesData(config[0], options.rootPath)
      const contentOpts = getContentOpts(config[1], options)
      addRoutes(contentOpts, routes, filesData)
    }
  }
}

/**
 * Get content options via 1) content property 2) module options
 */
function getContentOpts (config, options) {
  return {
    route: join("/", config.routePath || options.routePath),
    permalink: config.permalink || options.permalink,
    isPost: !(config.isPost === false)
  }
}

/**
 * Recursively get all content file paths with their respective metadata.
 */
function getFilesData (contentDir, rootPath, filesData = []) {
  const contentPath = join(rootPath, contentDir)
  fs.readdirSync(contentPath).forEach((stat, opts) => {
    const statPath = join(contentPath, stat)
    if(fs.statSync(statPath).isDirectory()) {
      const nestedContentDir = join(contentDir, stat)
      getFilesData(nestedContentDir, rootPath, filesData)
    } else {
      filesData.push({
        src: statPath,      // path to file
        section: contentDir // path to file directory
      })
    }
  })
  return filesData
}

/**
 * Adds content component to route.
 */
function addRoutes(options, routes, filesData) {
  if (options.route === "/") { // Top Level Route
    filesData.forEach(file => {
      routes.push(createRoute(file, options))
    })
  } else { // Nested route
    routes.forEach(route => {
      if (route.path.indexOf(options.route) > -1) {
        if (!route.children) route.children = []
        filesData.forEach(file => {
          route.children.push(createRoute(file, options))
        })
      }
    })
  }
}

/**
 * Gets page data via via 1) front-matter 2) file name.
 */
function createRoute (file, options) {
  const fileSource = fs.readFileSync(file.src, 'utf-8')
  const metadata = fm(fileSource).attributes

  const fileName = file.src.replace(/^.*[\\\/]/, '')
  const fileDate = fileName.match(/!?(\d{4}-\d{2}-\d{2})/)

  const pathOpts = {
    slug: paramCase(metadata.slug || toSlug(fileName)),
    section: file.section
  }

  if (options.isPost) {
    const dateData = fileDate[0].split('-')
    pathOpts.year = dateData[0]
    pathOpts.month = dateData[1]
    pathOpts.day = dateData[2]
  }

  const toPath = pathToRegexp.compile(options.permalink || '/:slug')

  return {
    // name: file.permalink,
    path: join("/",  toPath(pathOpts, { pretty: true })),
    component: file.src
  }
}



/**
 * Remove date and extension from file name.
 */
function toSlug (fileName) {
  const date = /!?(\d{4}-\d{2}-\d{2}-)/
  const ext = /(.)[^.]+$/
  return fileName.replace(date, '').replace(ext, '')
}
