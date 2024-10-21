import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { networkConfig } from "../config/network-config";
import { SubnetCidrAssigner } from "./helper/subnet-cidr-assigner";
import { appConfig } from "../config/app-config";

export class NetworkStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC 생성
    this.vpc = new ec2.Vpc(this, "SandiCleanVpc", {
      ipAddresses: ec2.IpAddresses.cidr(networkConfig.vpcCidr),
      vpcName: appConfig.getResourceName("VPC"),
      availabilityZones: networkConfig.availabilityZones.map(az => `${this.region}${az}`),
      natGateways: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "Public",
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: "Private",
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          cidrMask: 24,
          name: "ISOLATED",
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
      enableDnsHostnames: true,
      enableDnsSupport: true,
    });

    // VPC에 태그 추가
    cdk.Tags.of(this.vpc).add("Service", appConfig.getTags().Service);
    cdk.Tags.of(this.vpc).add("Env", appConfig.getTags().Env);

    interface SubnetConfig {
      startCidr: string;
      subnets: ec2.ISubnet[];
    }

    const subnetConfigs: SubnetConfig[] = [
      {
        startCidr: networkConfig.subnetCidrs.public,
        subnets: this.vpc.publicSubnets,
      },
      {
        startCidr: networkConfig.subnetCidrs.private,
        subnets: this.vpc.privateSubnets,
      },
      {
        startCidr: networkConfig.subnetCidrs.isolated,
        subnets: this.vpc.isolatedSubnets,
      },
    ];

    subnetConfigs.forEach((config) => {
      const cidrAssigner = new SubnetCidrAssigner(config.startCidr);
      cidrAssigner.assignCidrs(config.subnets);
    });

    // 서브넷에 태그 추가
    this.vpc.publicSubnets.forEach((subnet, index) => {
      cdk.Tags.of(subnet).add("Name", appConfig.getResourceName(`PublicSubnet${index + 1}`));
      cdk.Tags.of(subnet).add("Service", appConfig.getTags().Service);
      cdk.Tags.of(subnet).add("Env", appConfig.getTags().Env);
    });

    this.vpc.privateSubnets.forEach((subnet, index) => {
      cdk.Tags.of(subnet).add("Name", appConfig.getResourceName(`PrivateSubnet${index + 1}`));
      cdk.Tags.of(subnet).add("Service", appConfig.getTags().Service);
      cdk.Tags.of(subnet).add("Env", appConfig.getTags().Env);
    });

    this.vpc.isolatedSubnets.forEach((subnet, index) => {
      cdk.Tags.of(subnet).add("Name", appConfig.getResourceName(`IsolatedSubnet${index + 1}`));
      cdk.Tags.of(subnet).add("Service", appConfig.getTags().Service);
      cdk.Tags.of(subnet).add("Env", appConfig.getTags().Env);
    });

    // 출력
    new cdk.CfnOutput(this, "VpcId", { value: this.vpc.vpcId });
    new cdk.CfnOutput(this, "PublicSubnetId", {
      value: this.vpc.publicSubnets[0].subnetId,
    });
    new cdk.CfnOutput(this, "PrivateSubnetId", {
      value: this.vpc.privateSubnets[0].subnetId,
    });
    new cdk.CfnOutput(this, "IsolatedSubnetId", {
      value: this.vpc.isolatedSubnets[0].subnetId,
    });
  }
}
