#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/network-stack';
import { EC2Stack } from '../lib/ec2-stack';
import { RDSStack } from '../lib/rds-stack';

const app = new cdk.App();
const networkStack = new NetworkStack(app, 'NetworkStack');
const ec2Stack = new EC2Stack(app, 'EC2Stack', {
  vpc: networkStack.vpc,
});
new RDSStack(app, 'RDSStack', {
  vpc: networkStack.vpc,
  bastionSecurityGroup: ec2Stack.bastionSecurityGroup,
});
