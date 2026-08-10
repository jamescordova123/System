export type EnrollmentTrendPoint = {
    period: string;
    label: string;
    enrolled: number;
    dropped: number;
    completed: number;
    total: number;
};

export type EnrollmentSummary = {
    total: number;
    enrolled: number;
    dropped: number;
    completed: number;
    this_month: number;
    last_month: number;
    growth: number;
    retention_rate: number;
    average_per_section: number;
};

export type SectionHeadcount = {
    section: string;
    course: string;
    students: number;
    enrolled: number;
    dropped: number;
    completed: number;
    share: number;
};

export type PopulationStatus = {
    total: number;
    active: number;
    inactive: number;
    graduated: number;
    unassigned: number;
    active_rate: number;
    breakdown: {
        status: string;
        key: string;
        count: number;
        percentage: number;
    }[];
};

export type RevenueTrendPoint = {
    period: string;
    label: string;
    revenue: number;
    transactions: number;
    average: number;
};

export type RevenueSummary = {
    collected: number;
    billed: number;
    outstanding: number;
    collection_rate: number;
    transactions: number;
    average_payment: number;
    this_month: number;
    last_month: number;
    growth: number;
    today: number;
};

export type SectionFinancials = {
    section: string;
    course: string;
    students: number;
    billed: number;
    collected: number;
    outstanding: number;
    collection_rate: number;
};

export type RevenueByMethod = {
    method: string;
    amount: number;
    transactions: number;
    share: number;
};
