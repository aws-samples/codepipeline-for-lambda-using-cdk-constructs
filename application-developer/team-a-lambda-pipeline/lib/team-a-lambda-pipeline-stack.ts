import { App, Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambdapipeline from 'lambda-pipeline-construct';
import * as config from '../config/config.json';

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
  }) {
    super(scope, id, props)
  }
}

const pipelineStack = new teamALambdaPipelineStack(app, `${general}-stack`)