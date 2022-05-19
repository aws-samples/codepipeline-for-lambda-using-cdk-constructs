import { App, Stack, CfnOutput } from 'aws-cdk-lib';
import { Repository, Code } from 'aws-cdk-lib/aws-codecommit'
import * as config from '../config/config.json';
import path = require('path');

export class CodeCommitResources extends Stack {
  constructor(scope: App, id: string) {
    super(scope, id);
    const repo = new Repository(this, `${general}-codecommit-repo`, {
      repositoryName: `${general}-repo`,
      description: `${general}-repo`,
      code: Code.fromDirectory(path.join(__dirname, '../bootstrap/'), config.branchName)
    })
    new CfnOutput(this, `${general}-codercommit-repo-name`, { value: repo.repositoryName })
  }
}

const app = new App()
const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: config.region };
const general = `${config.orgName}-${config.appName}-${config.attribute}`.toLowerCase();
new CodeCommitResources(app, 'CodeCommitResources')
