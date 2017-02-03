const Path = require('path')
const config = require('../config')
const port = process.env.PORT || 3002
const makeHandler = require('./db.js')


const manifest = {
  server: {
    connections: {
      routes: {
        validate: {
          options: {
            abortEarly: false
          }
        },
        cache: {
          otherwise: 'no-cache, must-revalidate, max-age=0, no-store'
        },
        security: {
          xframe: 'deny',
          hsts: {
            includeSubDomains: true
          }
        }
      }
    }
  },
  connections: [
    {
      port: port,
      labels: 'www'
    },
    {
      port: port + 1,
      labels: 'api',
      routes: {
        cors: true
      }
    }
  ],
  registrations: [
    {
      plugin: {
        register: 'inert'
      }
    },
    {
      plugin: {
        register: 'vision'
      }
    },
    {
      plugin: {
        register: 'visionary',
        options: {
          engines: {
            html: require('handlebars')
          },
          relativeTo: Path.resolve(__dirname, 'views'),
          layout: true,
          isCached: config.views.isCached,
          partialsPath: 'partials',
          helpersPath: 'helpers',
          context: {
            siteName: 'name.co',
            copyrightName: 'co.co',
            copyrightYear: (new Date()).getFullYear()
          }
        }
      }
    },
    // {
    //   plugin: {
    //     register: 'lout'
    //   }
    // },
    {
      plugin: {
        register: 'good',
        options: config.logging
      }
    },
    {
      plugin: {
        register: './plugins/ext-pre-response'
      },
      options: {
        select: 'www'
      }
    },
    {
      plugin: {
        register: './plugins/load-db',
        options: {
          schema: Path.resolve(__dirname, 'public/schema/*.json')
        }
      }
    },
    {
      plugin: {
        register: 'jpi-hapi-json-schema',
        options: {
          prepareRouteOptions: function (options, file, schema, link) {
            const handler = makeHandler(file, schema, link, Path.resolve(__dirname, './routes/api'))
            options.config.handler = handler
          },
          schema: Path.resolve(__dirname, 'public/schema/*.json')
        }
      },
      options: {
        select: 'api'
      }
    }
  ]
}

module.exports = manifest
