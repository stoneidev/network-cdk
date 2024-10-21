import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import { Construct } from "constructs";
import { appConfig } from "../config/app-config";

interface RDSStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  bastionSecurityGroup: ec2.ISecurityGroup;
}

export class RDSStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: RDSStackProps) {
    super(scope, id, props);

    // RDS 보안 그룹 생성
    const rdsSecurityGroup = new ec2.SecurityGroup(this, "RDSSecurityGroup", {
      vpc: props.vpc,
      description: "Security group for RDS Aurora PostgreSQL",
      securityGroupName: appConfig.getResourceName("RDS-SG"),
    });

    // Bastion EC2에서의 접근만 허용
    rdsSecurityGroup.addIngressRule(
      props.bastionSecurityGroup,
      ec2.Port.tcp(5432),
      "Allow PostgreSQL access from Bastion"
    );

    // Aurora PostgreSQL 클러스터 생성
    const cluster = new rds.DatabaseCluster(this, "AuroraPostgreSQLCluster", {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_16_2,
      }),
      instanceProps: {
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T3,
          ec2.InstanceSize.MEDIUM
        ),
        vpcSubnets: {
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          availabilityZones: [`${this.region}a`, `${this.region}c`],
        },
        vpc: props.vpc,
        securityGroups: [rdsSecurityGroup],
      },
      instances: 1, // 단일 인스턴스 구성
      credentials: rds.Credentials.fromGeneratedSecret("postgresadmin"),
      defaultDatabaseName: "postgres",
      clusterIdentifier: appConfig.getResourceName("aurora-cluster"),
    });

    // RDS 클러스터에 태그 추가
    cdk.Tags.of(cluster).add("Service", appConfig.getTags().Service);
    cdk.Tags.of(cluster).add("Env", appConfig.getTags().Env);

    // 출력
    new cdk.CfnOutput(this, "RDSEndpoint", {
      value: cluster.clusterEndpoint.hostname,
      exportName: appConfig.getResourceName("RDSEndpoint"),
    });
    new cdk.CfnOutput(this, "RDSPort", {
      value: cluster.clusterEndpoint.port.toString(),
      exportName: appConfig.getResourceName("RDSPort"),
    });
    new cdk.CfnOutput(this, "RDSSecretName", {
      value: cluster.secret?.secretName || "No secret",
      exportName: appConfig.getResourceName("RDSSecretName"),
    });
  }
}
