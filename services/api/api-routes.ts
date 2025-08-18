const BASE_URL = "/api/v1/";

const createRoute = (path: string) => `${BASE_URL}${path}`;
// const createDynamicRoute = (path: string) => (id: string | string[]) =>
//   `${BASE_URL}${path.replace(":id", id.toString())}`;

export const apiRoutes = {
  auth: {
    login: createRoute("auth/login"),
    validate: (user_id: number) =>
      createRoute(`auth/${user_id}/validate/phone`),
    verify: (user_id: number) =>
      createRoute(`auth/${user_id}/verification/phone`),
    onboard: (user_id: number, type: "agent" | "individual") =>
      createRoute(`auth/${user_id}/onboard/${type}`),
    resetPasswordRequest: createRoute("auth/reset-password/request"),
    updatePassword: createRoute("auth/reset-password/update"),
    register: createRoute("auth/register"),
  },
  utility: {
    states: createRoute("utility/states"),
    cities: (state_id: number) => createRoute(`utility/states/${state_id}/cities`),
    validatePhone: (phoneNumber: string) =>
      createRoute(`transactions/validate/phone-number/${phoneNumber}`),
  },
  plans: {
plans: (network: string) =>
  createRoute(`plans/${network}`)
  },
  transactions: {
    get: createRoute("transactions"),
    getById: (id: string | string[]) => `${BASE_URL}transactions/${id}`,
    airtimePurchase: createRoute("transactions/airtime/purchase"),
    dataPurchase: createRoute("transactions/data/purchase"),
    submitpin: createRoute("cards/auth/pin"),
    submitotp: createRoute("cards/auth/otp"),
  },
  calendar: {
    createReminder: createRoute("Calendar/reminder"),
    events: createRoute("Calendar/events"),
  },
  complaints: {
    create: createRoute("Complaint"),
  },
  dashboard: {
    get: (path: string) => `${BASE_URL}${path}`,
    data: (stakeholder: string) =>
      createRoute(`Dashboard/${stakeholder}/data-analysis-cards`),
    compliance: (stakeholder: string) =>
      createRoute(`Dashboard/${stakeholder}/acja-compliance-management-charts`),
    mc_compliance: (stakeholder: string) =>
      createRoute(`Dashboard/${stakeholder}/compliance-management-charts`),
    performance: (stakeholder: string) =>
      createRoute(`Dashboard/${stakeholder}/performance-report-charts`),
    ncsData: createRoute("Dashboard/ncs"),
    oagSummary: createRoute("Dashboard/oag/summary-charts"),
  },
};
