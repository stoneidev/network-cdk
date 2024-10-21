export const appConfig = {
  ServiceName: "Stonei",
  Environment: "Dev",
  getResourceName: (resourceType: string) =>
    `${appConfig.ServiceName}-${appConfig.Environment}-${resourceType}`,
  getTags: () => ({
    Service: appConfig.ServiceName,
    Env: appConfig.Environment,
  }),
};
