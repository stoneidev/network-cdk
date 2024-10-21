export const networkConfig = {
  vpcCidr: "10.16.16.0/20",
  availabilityZones: ["a", "c"], // 여기에 원하는 AZ 접미사를 배열로 지정
  subnetCidrs: {
    public: "10.16.16.0/24",
    private: "10.16.18.0/24",
    isolated: "10.16.25.0/24",
  },
};
