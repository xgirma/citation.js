const fs = require('fs')
const disc = require('disc')
const file = fs.readFileSync('build/tmp/citation.js', 'utf8')

const cb = function (err, html) {
  if (err) {
    throw err
  } else {
    fs.writeFileSync('docs/disc/index.html', html)
  }

  fs.unlinkSync('build/tmp/citation.js')
}

const title = '<title>Build Size Disc - Citation.js</title>'
const back = '<p><a style="color: inherit;" href="https://larsgw.github.io/citation.js/">< Back</a></p>'
const attribution = '<p>Generated by <a style="color: inherit;" href="https://npmjs.com/package/disc">disc</a></p>'
const header = '<h1>Citation.js</h1>'

disc.bundle([file], {
  header: `${title}<div style="padding-left: 1em">${back}${attribution}</div>`,
  footer: header
}, cb)
