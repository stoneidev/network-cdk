import * as ec2 from "aws-cdk-lib/aws-ec2";

export class SubnetCidrAssigner {
  constructor(private readonly startCidr: string) {}

  public assignCidrs(subnets: ec2.ISubnet[]): void {
    for (let i = 0; i < subnets.length; i++) {
      const cfnSubnet = subnets[i].node.defaultChild as ec2.CfnSubnet;
      const nextCidr = this.getNextCidr(i);
      cfnSubnet.cidrBlock = nextCidr;
    }
  }

  private getNextCidr(increment: number): string {
    const [baseIp, mask] = this.startCidr.split('/');
    const octets = baseIp.split('.').map(Number);
    
    if (increment === 0) {
      return this.startCidr;
    } else {
      octets[2]++;  // 세 번째 옥텟 증가
      return `${octets.join('.')}/${mask}`;
    }
  }
}
