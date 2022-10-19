#! /usr/bin/env node
const { program } = require('commander')
const fetch = require('./commands/fetch')
program
  .name('odoo-cli')
  .description('odoo-cli used to fetch and addons from github and gitlab and enable developer to upgrade and install modules')
  .version('1.0.0');

program.command('fetch')
  .description('This command to fetch addons from YML configuration file to addons path')
  .argument('<string>', 'Path To YML File')
  .option('-a,--addons-path <char>', 'Target Addons Path',false)
  .option('-t, --gitlab-token <char>', 'Token to Accsess private repo in gitlab', false)
  .action((str, options) => {
   fetch(str,options.addonsPath,options.gitlabToken)
  });

program.parse();
