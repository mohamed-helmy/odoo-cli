
const conf = new (require('conf'))()
const chalk = require('chalk')
const yaml = require('js-yaml');
const request = require('superagent');
const fs = require('fs');
const shell = require('shelljs');
const AdmZip = require('adm-zip');
const { exit } = require('process');
const cliProgress = require('cli-progress');
const colors = require('ansi-colors');
const tmpPath= '/odoo-cli-temp'

function createTmp() {
  if (fs.existsSync(tmpPath)) {
    shell.exec('rm -r ' + tmpPath)
  } 
  if (!fs.existsSync(tmpPath)) {
    fs.mkdirSync(tmpPath);
  }
}

function removeTmp() {
  if (fs.existsSync(tmpPath)) {
    shell.exec('rm -r ' + tmpPath)
  } 
}
function createAddonsPath(path) {
  if (fs.existsSync(path)) {
    shell.exec('rm -r ' + path)
  }
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

function fetch(pathToYml, addonsPath, gitlabToken) {
  let configDoc;
  try{
    configDoc = yaml.load(fs.readFileSync(pathToYml, 'utf8'));
  }catch(e){
    console.log(chalk.red.bold("Can not read config file .yml invalid path.. !!"));
    exit(1);
  }
  addonsDir = configDoc.odoo.default.addonsPath;
  if(addonsPath){
    addonsDir= addonsPath;
  }
  createAddonsPath(addonsDir);
  createTmp();
  console.log(chalk.green.bold("Addons Path : "+addonsDir));
  console.log(chalk.green.bold("Gitlab Url : "+configDoc.odoo.default.gitlabUrl));
  console.log(chalk.yellow.bold("Start Fetching ... "));
  configDoc.odoo.dependencies.forEach(dependency => {
    switch (dependency.source){
      case 'gitlab':
        fetchGitlab(dependency,configDoc.odoo.default.gitlabUrl,gitlabToken,addonsDir);
        break;
      case 'github':
        fetchGithub(dependency,addonsDir);
        break;

      default:
        console.log(chalk.red.bold("Can not recognize source of "+dependency.source));
        exit(1);
    }
  });

}


function fetchGitlab(dependency,gitlabUrl,gitlabToken,addonsPath){
  const addonsUrl = gitlabUrl + "/" + dependency.owner + "/" + dependency.repo + "/-/archive/" + dependency.version + ".zip?private_token=" + gitlabToken;
  const zipFile= dependency.repo + "-" + dependency.version;
  const progressBar = new cliProgress.SingleBar({
    format: dependency.repo+"   " + colors.cyan('{bar}') + '|   {percentage}%',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  });
  progressBar.start(100,10);
  request.get(addonsUrl).on('error', function (error) {
    console.log(chalk.red.bold(error));
    exit(1);
  })
  .pipe(fs.createWriteStream(tmpPath+"/"+ zipFile + '.zip'))
  .on('finish', function () {
    progressBar.update(50);
    let zip = new AdmZip(tmpPath+'/' + zipFile + '.zip');
    zip.extractEntryTo(zipFile + '/', tmpPath+"/", true, false);
    progressBar.update(80)
    dependency.addons.forEach(addon => {
      if (fs.existsSync(tmpPath+'/' + zipFile + "/" + addon)) {
        shell.exec('cp -r '+tmpPath+ '/' + zipFile + "/" + addon + " " + addonsPath)
      }else{
        console.log(chalk.red.bold("Can not recognize Module "+addon));
      }
    });
    progressBar.update(100);
    progressBar.stop();
  });
}

function fetchGithub(dependency,addonsPath){
  const addonsUrl = "https://github.com/"  + dependency.owner + "/" + dependency.repo + "/archive/" + dependency.version + ".zip";
  const zipFile= dependency.repo + "-" + dependency.version;
  const progressBar = new cliProgress.SingleBar({
    format: dependency.repo+"   " + colors.cyan('{bar}') + '|   {percentage}%',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  });
  progressBar.start(100,10);
  request.get(addonsUrl).on('error', function (error) {
    console.log(chalk.red.bold(error));
    exit(1);
  })
  .pipe(fs.createWriteStream(tmpPath+"/"+ zipFile + '.zip'))
  .on('finish', function () {
    progressBar.update(50);
    let zip = new AdmZip(tmpPath+'/' + zipFile + '.zip');
    zip.extractEntryTo(zipFile + '/', tmpPath+"/", true, false);
    progressBar.update(80)
    dependency.addons.forEach(addon => {
      if (fs.existsSync(tmpPath+'/' + zipFile + "/" + addon)) {
        shell.exec('cp -r '+tmpPath+ '/' + zipFile + "/" + addon + " " + addonsPath)
      }else{
        console.log(chalk.red.bold("Can not recognize Module "+addon));
      }
    });
    progressBar.update(100);
    progressBar.stop();
  });
}


process.on('exit', function (){
  console.log(chalk.green.bold("Congratulation .. addons fetched successfully !"));
  removeTmp()
});
module.exports = fetch

