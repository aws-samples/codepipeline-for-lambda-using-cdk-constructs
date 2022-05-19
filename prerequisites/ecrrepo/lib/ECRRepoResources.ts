import { App, Stack, CfnOutput } from 'aws-cdk-lib';
import { Repository } from 'aws-cdk-lib/aws-ecr'
import * as config from '../config/config.json';

export class ECRRepoResources extends Stack {
  constructor(scope: App, id: string) {
    super(scope, id);
    const ecrrepo = new Repository(this, `${general}-ECRRepo`, {
      repositoryName: `${general}-ecr-repo`,
      imageScanOnPush: true,
    });
    new CfnOutput(this, `${general}-ecr-repo-name`, { value: ecrrepo.repositoryName} )
  }
}
const app = new App()
const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: config.region };
const general = `${config.orgName}-${config.appName}-${config.attribute}`.toLowerCase();
new ECRRepoResources(app, 'ECRRepoResources')
