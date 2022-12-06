import { App, Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Repository, Code } from 'aws-cdk-lib/aws-codecommit'
import * as repositoryECR  from 'aws-cdk-lib/aws-ecr'
import * as lambdapipeline from 'lambda-pipeline-construct';
import * as config from '../config/config.json';
import path = require('path');

const app = new App()
const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: config.region };
const general = `${config.orgName}-${config.appName}-${config.attribute}`.toLowerCase();


export class teamALambdaPipelineStack extends lambdapipeline.LambdaPipelineConstruct {
  constructor(scope: Construct, id: string, props: lambdapipeline.LambdaPipelineConstructProps = {
    pipelineName: config.pipelineName,
    coderepoName: config.coderepoName,
    branchName: config.branchName,
    orgName: config.orgName,
    appName: config.appName,
    attribute: config.attribute,
    envType: config.envType,
    region: config.region,
    ecrrepoName: config.ecrrepoName,
    buildSpecPathECR: config.buildSpecPathECR,
    buildSpecPathLambda: config.buildSpecPathLambda,
    lambdaArn: ""
  }){
    super(scope, id, props);
    
    const repo = new Repository(this, `${general}-codecommit-repo`, {
      repositoryName: `${general}-repo`,
      description: `${general}-repo`,
      code: Code.fromDirectory(path.join(__dirname, '../bootstrap/'), config.branchName)
    })
    new CfnOutput(this, `${general}-codercommit-repo-name`, { value: repo.repositoryName })

    const ecrrepo = new repositoryECR.Repository(this, `${general}-ECRRepo`, {
      repositoryName: `${general}-ecr-repo`,
      imageScanOnPush: true,
    });
    new CfnOutput(this, `${general}-ecr-repo-name`, { value: ecrrepo.repositoryName} )
    
  }
}

const pipelineStack = new teamALambdaPipelineStack(app, `${general}-stack`)