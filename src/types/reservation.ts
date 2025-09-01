export const stepOrder = ['service-menu', 'staff', 'datetime', 'customer-info', 'confirm'] as const;

export type ReservationStep = (typeof stepOrder)[number];
