import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { ec2Config } from "../config/ec2-config";
import { appConfig } from "../config/app-config";

interface EC2StackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
}

export class EC2Stack extends cdk.Stack {
  public readonly bastionSecurityGroup: ec2.ISecurityGroup;

  constructor(scope: Construct, id: string, props: EC2StackProps) {
    super(scope, id, props);

    const ec2Instance = new ec2.Instance(this, "PublicEC2Instance", {
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux2(),
      allowAllOutbound: true,
      instanceName: appConfig.getResourceName("EC2"),
    });

    // EC2 인스턴스에 태그 추가
    cdk.Tags.of(ec2Instance).add("Service", appConfig.getTags().Service);
    cdk.Tags.of(ec2Instance).add("Env", appConfig.getTags().Env);

    const securityGroup = new ec2.SecurityGroup(this, "EC2SecurityGroup", {
      vpc: props.vpc,
      description: "Allow SSH access to EC2 instances",
      allowAllOutbound: true,
      securityGroupName: appConfig.getResourceName("SG"),
    });

    // 보안 그룹에 태그 추가
    cdk.Tags.of(securityGroup).add("Service", appConfig.getTags().Service);
    cdk.Tags.of(securityGroup).add("Env", appConfig.getTags().Env);

    securityGroup.addIngressRule(
      ec2.Peer.ipv4(ec2Config.myIp),
      ec2.Port.tcp(22),
      "Allow SSH access from my IP only"
    );

    securityGroup.addIngressRule(
      ec2.Peer.ipv4("13.209.1.56/29"),
      ec2.Port.tcp(22),
      "Allow EC2 Instance Connect"
    );

    ec2Instance.addSecurityGroup(securityGroup);

    this.bastionSecurityGroup = securityGroup;

    // 출력
    new cdk.CfnOutput(this, "EC2InstanceId", {
      value: ec2Instance.instanceId,
      exportName: appConfig.getResourceName("EC2Id"),
    });
    new cdk.CfnOutput(this, "EC2PublicIP", {
      value: ec2Instance.instancePublicIp,
      exportName: appConfig.getResourceName("EC2IP"),
    });
  }
}
