# Building and Publishing Construct

1. Get the codeartifact details from AWS Console
2. Replace Appropriate domain and repository in the following command and run it
     ```aws codeartifact login \
     --tool npm \
     --domain amzn-app1-01-cdk-construct-demo \
     --domain-owner $(aws sts get-caller-identity --output text --query 'Account') \
     --repository amzn-app1-01-lambda-pipeline```
3. clean npm files and folders by `rm package-lock.json && rm -rf node_modules`
4. install npm packages bu `npm install`
5. build a npm pacakges by `npm run build`
6. publish construct with the following command `npm publish`