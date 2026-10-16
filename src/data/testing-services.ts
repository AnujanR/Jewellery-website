export const testingServices = [
    { id: "touchstone", price: 1500, turnaround: "minutes20" },
    { id: "xrf", price: 2500, turnaround: "sameDay" },
    { id: "certificate", price: 4500, turnaround: "oneDay" },
    { id: "batch", price: 18000, turnaround: "twoDays" },
] as const;

export type TestingServiceId = (typeof testingServices)[number]["id"];
export type TurnaroundId = (typeof testingServices)[number]["turnaround"];

export const audiences = ["jeweller", "pawnbroker", "family"] as const;
export type Audience = (typeof audiences)[number];

export function getTestingService(id: string) {
    return testingServices.find((service) => service.id === id) ?? null;
}
