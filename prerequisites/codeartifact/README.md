# Instructions for Creating a CodeArtifact Repo:

aws codeartifact login \
     --tool npm \
     --domain amzn-app1-01-cdk-construct-demo \
     --domain-owner $(aws sts get-caller-identity --output text --query 'Account') \
     --repository amzn-app1-01-lambda-pipeline