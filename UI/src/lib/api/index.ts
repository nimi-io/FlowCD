// API wrapper that routes to mock data when VITE_MOCK_MODE is true (default)
const MOCK_MODE = import.meta.env.VITE_MOCK_MODE !== "false";

export { MOCK_MODE };

export * from "./auth";
export * from "./apps";
export * from "./clusters";
export * from "./pipelines";
export * from "./activity";
export * from "./settings";
