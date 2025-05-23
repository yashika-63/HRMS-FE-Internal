export const reportTypes = {
    leave: {
        apiPath: 'leave-report',
        label: 'Leave',
        hasDepartment: true,
        filters: {
            year: true,
            department: true,
            region: true,
        },
        pagination: {
            enabled: true,
            defaultSize: 15,
            availableSizes: [5, 10, 15, 20, 50]
        }
    },
    induction: {
        apiPath: 'induction-report',
        label: 'Induction',
        hasDepartment: false,
        filters: {
            year: true,
            department: false,
            region: true,
        },
        pagination: {
            enabled: true,
            defaultSize: 15,
            availableSizes: [5, 10, 15, 20, 50]
        }
    },
    training: {
        apiPath: 'training-report-with-company-details',
        label: 'Training',
        hasDepartment: true,
        filters: {
            year: true,
            department: true,
            region: true,
        },
        pagination: {
            enabled: true,
            defaultSize: 15,
            availableSizes: [5, 10, 15, 20, 50]
        }
    },
    certification: {
        apiPath: 'training-report-Certificate',
        label: 'Training Certifications',
        hasDepartment: true,
        filters: {
            year: true,
            department: true,
            region: true,
        },
        pagination: {
            enabled: true,
            defaultSize: 15,
            availableSizes: [5, 10, 15, 20, 50]
        }
    },
    trainingResult: {
        apiPath: 'training-report-result',
        label: 'Training Results',
        hasDepartment: true,
        filters: {
            year: true,
            department: true,
            region: true,
        },
        pagination: {
            enabled: true,
            defaultSize: 15,
            availableSizes: [5, 10, 15, 20, 50]
        }
    },
    traininAssign: {
        apiPath: 'training-report-Assign',
        label: 'Training Assign',
        hasDepartment: true,
        filters: {
            year: true,
            department: true,
            region: true,
        },
        pagination: {
            enabled: true,
            defaultSize: 15,
            availableSizes: [5, 10, 15, 20, 50]
        }
    }
};

export const exportReportApiPaths = {
    training: 'training-report',
    trainingResult: 'result-training-report',
    customerReport: 'customers',
};

