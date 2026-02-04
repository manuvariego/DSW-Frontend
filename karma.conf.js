process.env.CHROME_BIN = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        // opciones de jasmine...
      },
      clearContext: false // dejar visible el output en el navegador
    },
    jasmineHtmlReporter: {
      suppressAll: true // remover trazas duplicadas
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/frontend'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ]
    },
    reporters: ['progress', 'kjhtml'],
    
    browsers: ['Chrome'], // <--- AQUÍ está la magia: Usar Edge
    
    restartOnFileChange: true
  });
};