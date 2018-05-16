const fs = require('fs-extra')
const os = require('os')
const path = require('path')

const serveReport = epub_dir => {
  const report_loc = path.join(os.homedir(), '.percival/')
  fs.copySync(path.join(__dirname, '/app.js'), path.join(report_loc, 'app.js'))
  fs.copySync(
    path.join(__dirname, '/index.html'),
    path.join(report_loc, 'index.html')
  )
  fs.copySync(path.join(__dirname, '/static'), path.join(report_loc, 'static'))
  fs.writeFileSync(path.join(report_loc, 'epub_dir.txt'), epub_dir, 'utf-8')
  // serve to default browser
  const pidfile_path = path.join(report_loc, 'server.pid')
  // serve error report to default browser
  // eslint-disable-next-line
  const reporter = require('daemonize2').setup({
    main: './server.js',
    name: 'Percival Server',
    pidfile: pidfile_path,
    silent: true,
  })
  if (reporter.status() !== 0) {
    reporter.kill(() => {
      reporter.start()
    })
  } else {
    reporter.start()
  }
}

module.exports = serveReport
