import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { LinuxBuildImage, PipelineProject } from 'aws-cdk-lib/aws-codebuild'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { Pipeline, Artifact, StagePlacement } from 'aws-cdk-lib/aws-codepipeline'
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions'
import { AuthorizationToken }  from 'aws-cdk-lib/aws-ecr'
import { readFileSync } from 'fs';
import { Repository } from 'aws-cdk-lib/aws-codecommit'
import { Role, PolicyStatement, ServicePrincipal, ManagedPolicy } from 'aws-cdk-lib/aws-iam';
import { BuildEnvironment, BuildEnvironmentVariable, BuildSpec, ImagePullPrincipalType } from 'aws-cdk-lib/aws-codebuild';
import { IStage } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export interface LambdaPipelineConstructProps {
    pipelineName: string;
    coderepoName: string;
    branchName: string;
    orgName: string;
    appName: string;
    attribute: string;
    envType: string;
    region: string;
    buildSpecPathECR: string;
    buildSpecPathLambda: string;
    ecrrepoName: string;
    lambdaArn: string;
}

export class LambdaPipelineConstruct extends Stack {
    constructor(scope: Construct, id: string, props: LambdaPipelineConstructProps) {
        super(scope, id)
        var orgName = (props.orgName).toLowerCase();
        var envType = (props.envType).toLowerCase();
        var attribute = (props.attribute).toLowerCase();
        var appName = (props.appName).toLowerCase();
        var general = `${orgName}-${appName}-${envType}-${attribute}`;
        var sourceArtifact = new Artifact();
        const pipeline = new Pipeline(this, `${general}-lambda-pipeline`, {
            pipelineName: props.pipelineName
        });
        const buildDockerProject = new PipelineProject(this, `${general}-buildDocker`, {
            buildSpec: BuildSpec.fromSourceFilename(props.buildSpecPathECR),
            environmentVariables: {
                "REPO_URI": { value: `${this.account}.dkr.ecr.${props.region}.amazonaws.com/${props.ecrrepoName}`},
                "AWS_DEFAULT_REGION": { value: props.region },
                "AWS_ACCOUNT_ID": { value: `${this.account}`}
            },
            environment: {
                privileged: true,
                buildImage: LinuxBuildImage.STANDARD_5_0
            }
        });
        const deployDockerProject = new PipelineProject(this, `${general}-deployDocker`, {
            buildSpec: BuildSpec.fromSourceFilename(props.buildSpecPathLambda),
            environmentVariables: {
                "REPO_URI": { value: `${this.account}.dkr.ecr.${props.region}.amazonaws.com/${props.ecrrepoName}` },
                "AWS_DEFAULT_REGION": { value: props.region },
                "AWS_ACCOUNT_ID": { value: `${this.account}` },
                "LambdaFunctionArn": { value: props.lambdaArn },
                "ecrrepoName": { value: props.ecrrepoName }
            },
            environment: {
                privileged: true,
                buildImage: LinuxBuildImage.STANDARD_5_0
            }
        });
        const sourceStage = pipeline.addStage({
            stageName: "Source",
        });
        sourceStage.addAction(new codepipeline_actions.CodeCommitSourceAction({
            actionName: 'Source',
            repository: Repository.fromRepositoryName(this, 'repoName', props.coderepoName),
            branch: props.branchName,
            output: sourceArtifact
        }));
        const buildStage = pipeline.addStage({
            stageName: "Build-and-Deploy-Docker-Image",
        });
        buildStage.addAction(new codepipeline_actions.CodeBuildAction({
            actionName: 'Build',
            input: sourceArtifact,
            project: buildDockerProject
        }));
        const deploystage = pipeline.addStage({
            stageName: "UpdateLambda",
        });
        deploystage.addAction(new codepipeline_actions.CodeBuildAction({
            actionName: 'Deploy',
            input: sourceArtifact,
            project: deployDockerProject
        }));
        pipeline.addToRolePolicy(new PolicyStatement({
            resources: [
                pipeline.artifactBucket.bucketArn,
                pipeline.artifactBucket.bucketArn + '/*'
            ],
            actions: [
                "s3:GetObject*",
                "s3:GetBucket*",
                "s3:List*",
                "s3:DeleteObject*",
                "s3:PutObject",
                "s3:Abort*"
            ]
        }));
        buildDockerProject.role?.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryFullAccess'))
        deployDockerProject.role?.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryFullAccess'))
        deployDockerProject.role?.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AWSLambda_FullAccess'))
        deployDockerProject.role?.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMFullAccess'))
        buildDockerProject.addToRolePolicy(new PolicyStatement({
            resources: [
                "arn:aws:iam::*:role/cdk-readOnlyRole",
                "arn:aws:iam::*:role/cdk-hnb659fds-deploy-role-*",
                "arn:aws:iam::*:role/cdk-hnb659fds-file-publishing-*"
            ],
            actions: [
                "sts:AssumeRole",
                "iam:PassRole"
            ]
        }));
        deployDockerProject.addToRolePolicy(new PolicyStatement({
            resources: [
                "arn:aws:iam::*:role/cdk-readOnlyRole",
                "arn:aws:iam::*:role/cdk-hnb659fds-deploy-role-*",
                "arn:aws:iam::*:role/cdk-hnb659fds-file-publishing-*"
            ],
            actions: [
                "sts:AssumeRole",
                "iam:PassRole"
            ]
        }));
        pipeline.role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryFullAccess'))
        pipeline.role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AWSLambda_FullAccess'))
        new CfnOutput(this, "LambdaPipelineArn", { value: pipeline.pipelineArn });
        new CfnOutput(this, "LambdaPipelineArtifactBucket", { value: pipeline.artifactBucket.bucketArn });
        new CfnOutput(this, "LambdaPipelineARN", { value: pipeline.role.roleArn });
    }

}