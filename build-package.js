const fs = require('fs-extra');
const concat = require('concat');
var sass = require('node-sass');

(async function build() {
  // do styles first
  await sass.render({
    file: "./src/lib/scss/styles.scss",
    includePaths: ["./src/lib/scss/"]
  }, function(err, result) {
    if(err){
      console.log('SASSY ERROR: ',err.message);
    } else {
      // make styles dir
      fs.mkdir('./dist/@senzing/sdk-graph-components/styles', { recursive: true }, (err) => {
        if(!(err)){
          // was able to create styles dir

          // now write file to it
          fs.writeFile('./dist/@senzing/sdk-graph-components/styles/styles.css', result.css, function(err){
            if(!err){
              //file written on disk
              console.log('Built styles.css');
            } else {
              console.log('could not write ./dist/@senzing/sdk-graph-components/styles.css ',err);
            }
          });

        }
      });

    }
  });

  // root readme.md file to under sdk project(so the npm readme stays in sync)
  await fs.copyFile(
    './README.md',
    './src/README.md'
  ).catch((err)=>{
    console.log('build err #3: could not copy README.md to package.');
  });

  // do readme and markdown files
  await fs.copyFile(
    './src/README.md',
    './dist/@senzing/sdk-graph-components/README.md'
  ).then(() => {
    console.log('copied README.md to package.');
  }).catch((err)=>{
    console.log('build err #4: could not copy README.md to package.');
  });

  await fs.copyFile(
    './LICENSE',
    './dist/@senzing/sdk-graph-components/LICENSE'
  ).then(() => {
    console.log('copied LICENSE to package.');
  }).catch((err)=>{
    console.log('build err #5: could not copy LICENSE to package.');
  });

})();
