import { App, Stack, CfnOutput } from 'aws-cdk-lib';
import { CfnDomain, CfnRepository, } from 'aws-cdk-lib/aws-codeartifact'
import * as config from '../config/config.json';

export class CodeArtifactResources extends Stack {
  constructor(scope: App, id: string) {
    super(scope, id);
    const domain = new CfnDomain(this, `${general}-CodeArtifactDomain`, {
      domainName: `${general}-cdk-construct-demo`
    });
    const codeArtifactNpmRepo = new CfnRepository(this, `${general}-codeArtifactNpmRepo`, {
      domainName: domain.domainName,
      repositoryName: `${general}-npmrepo`,
      externalConnections: [
        'public:npmjs'
      ]
    });
    codeArtifactNpmRepo.addDependsOn(domain)
    const codeArtifactRepoName = new CfnRepository(this, `${general}-CodeArtifactRepoName`, {
      domainName: domain.domainName,
      repositoryName: `${general}-lambda-pipeline`,
      upstreams: [
        codeArtifactNpmRepo.repositoryName
      ]
    });
    codeArtifactRepoName.addDependsOn(codeArtifactNpmRepo)
    new CfnOutput(this, `${general}-coderartifact-repo-name`, { value: codeArtifactRepoName.repositoryName} )
    new CfnOutput(this, `${general}-coderartifact-domain-name`, { value: codeArtifactRepoName.domainName} )
  }
}
const app = new App()
const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: config.region };
const general = `${config.orgName}-${config.appName}-${config.attribute}`.toLowerCase();
new CodeArtifactResources(app, 'CodeArtifactResources')
