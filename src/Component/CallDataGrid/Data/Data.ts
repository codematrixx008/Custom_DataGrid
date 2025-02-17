export const title = "Employee Record";

export const buttonSetting = {
    ButtonAction: ['Add', 'Edit', 'Delete', 'CSV', 'XLSX', 'PDF', 'ShowHideColumns'],
    IsButtonVisible:
    {
        Add: true,
        Edit: true,
        Delete: true,
        CSV: true,
        XLSX: true,
        PDF: true,
        ShowHideColumns: true
    },
    IsButtonEnabled:
    {
        Add: true,
        Edit: true,
        Delete: true,
        CSV: true,
        XLSX: true,
        PDF: true,
        ShowHideColumns: true
    }
};

export const listViewColumns = [
    { ColumnHeader: "EmployeeName", DataType: "string", Tooltip: true, Width: 150, isVisible: true, isEditable: true, isFreeze: true, Sorting: true, Filtering: true, ColumnOrder: 1, Alignment: "left" },
    { ColumnHeader: "BirthDate", DataType: "date", Tooltip: false, Width: 120, isVisible: true, isEditable: true, isFreeze: true, Sorting: true, Filtering: true, ColumnOrder: 2, Alignment: "left" },
    { ColumnHeader: "RelationshipStatus", DataType: "string", Tooltip: false, Width: 170, isVisible: true, isEditable: true, isFreeze: false, Sorting: true, Filtering: true, ColumnOrder: 3, Alignment: "left" },
    { ColumnHeader: "AnnualIncome", DataType: "number", Tooltip: false, Width: 150, isVisible: true, isEditable: false, isFreeze: false, Sorting: true, Filtering: true, ColumnOrder: 4, Alignment: "center" },
    { ColumnHeader: "IdentificationNumber", DataType: "string", Tooltip: false, Width: 180, isVisible: true, isEditable: false, isFreeze: false, Sorting: false, Filtering: true, ColumnOrder: 5, Alignment: "center" },
    { ColumnHeader: "StartDate", DataType: "date", Tooltip: false, Width: 150, isVisible: true, isEditable: false, isFreeze: false, Sorting: true, Filtering: true, ColumnOrder: 6, Alignment: "center" },
    { ColumnHeader: "FullTimeEmployment", DataType: "boolean", Tooltip: false, Width: 190, isVisible: true, isEditable: true, isFreeze: false, Sorting: true, Filtering: true, ColumnOrder: 7, Alignment: "center" },
    { ColumnHeader: "ProfessionalExperience", DataType: "number", Tooltip: false, Width: 200, isVisible: true, isEditable: true, isFreeze: true, Sorting: true, Filtering: true, ColumnOrder: 8, Alignment: "center" },
    { ColumnHeader: "WorkDepartment", DataType: "string", Tooltip: false, Width: 180, isVisible: true, isEditable: true, isFreeze: false, Sorting: true, Filtering: true, ColumnOrder: 9, Alignment: "left" },
    { ColumnHeader: "RecentPromotionDate", DataType: "date", Tooltip: false, Width: 180, isVisible: true, isEditable: false, isFreeze: false, Sorting: true, Filtering: true, ColumnOrder: 10, Alignment: "center" },
    { ColumnHeader: "ManagementPosition", DataType: "boolean", Tooltip: false, Width: 150, isVisible: true, isEditable: false, isFreeze: false, Sorting: true, Filtering: true, ColumnOrder: 11, Alignment: "center" },
    { ColumnHeader: "JobPerformanceRating", DataType: "number", Tooltip: false, Width: 210, isVisible: true, isEditable: true, isFreeze: true, Sorting: true, Filtering: true, ColumnOrder: 12, Alignment: "center" },
    { ColumnHeader: "ContactEmail", DataType: "string", Tooltip: false, Width: 220, isVisible: true, isEditable: true, isFreeze: false, Sorting: false, Filtering: true, ColumnOrder: 13, Alignment: "left" },
    { ColumnHeader: "PhoneNumber", DataType: "string", Tooltip: false, Width: 180, isVisible: true, isEditable: true, isFreeze: false, Sorting: false, Filtering: true, ColumnOrder: 14, Alignment: "left" },
    { ColumnHeader: "EmergencyContact", DataType: "string", Tooltip: false, Width: 200, isVisible: true, isEditable: true, isFreeze: false, Sorting: false, Filtering: true, ColumnOrder: 15, Alignment: "left" },
    { ColumnHeader: "LastAccessDate", DataType: "date", Tooltip: false, Width: 180, isVisible: true, isEditable: false, isFreeze: false, Sorting: true, Filtering: true, ColumnOrder: 16, Alignment: "center" },
    { ColumnHeader: "ActiveEmployeeStatus", DataType: "boolean", Tooltip: false, Width: 180, isVisible: true, isEditable: false, isFreeze: false, Sorting: true, Filtering: true, ColumnOrder: 17, Alignment: "center" },
    { ColumnHeader: "BonusAmount", DataType: "number", Tooltip: false, Width: 150, isVisible: true, isEditable: true, isFreeze: false, Sorting: true, Filtering: true, ColumnOrder: 18, Alignment: "center" },
    { ColumnHeader: "TaxBracket", DataType: "string", Tooltip: false, Width: 150, isVisible: true, isEditable: false, isFreeze: false, Sorting: true, Filtering: true, ColumnOrder: 19, Alignment: "center" },
    { ColumnHeader: "RemoteWorkEligible", DataType: "boolean", Tooltip: false, Width: 180, isVisible: true, isEditable: false, isFreeze: false, Sorting: true, Filtering: true, ColumnOrder: 20, Alignment: "center" },
];

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
};

export const tableData = [
    {
        id: 1,
        EmployeeName: "John Cena",
        BirthDate: formatDate("2024-11-15"),
        RelationshipStatus: "Single",
        AnnualIncome: 60000,
        IdentificationNumber: "EMP001",
        StartDate: formatDate("2015-07-15"),
        FullTimeEmployment: true,
        ProfessionalExperience: 9,
        WorkDepartment: "Sales",
        RecentPromotionDate: formatDate("2023-02-10"),
        ManagementPosition: false,
        JobPerformanceRating: 3.8,
        ContactEmail: "john.cena@example.com",
        PhoneNumber: "123-456-7890",
        EmergencyContact: "Jane Doe - 987-654-3210",
        LastAccessDate: formatDate("2024-09-26"),
        ActiveEmployeeStatus: true,
        BonusAmount: 5000,
        TaxBracket: "20%",
        RemoteWorkEligible: true
    },
    ...Array.from({ length: 100000 }, (_, i) => ({
        id: i + 2,
        EmployeeName: `Employee ${i + 2}`,
        BirthDate: formatDate(`201${Math.floor(i / 10) + 1}-0${(i % 9) + 1}-15`),
        RelationshipStatus: ["Single", "Married", "Divorced"][i % 3],
        AnnualIncome: 50000 + (i * 1000),
        IdentificationNumber: `EMP${(i + 2).toString().padStart(3, '0')}`,
        StartDate: formatDate(`201${i % 10}-08-20`),
        FullTimeEmployment: i % 2 === 0,
        ProfessionalExperience: (i % 15) + 1,
        WorkDepartment: ["IT", "HR", "Finance", "Marketing", "Sales"][i % 5],
        RecentPromotionDate: formatDate(`202${i % 5}-05-10`),
        ManagementPosition: i % 5 === 0,
        JobPerformanceRating: (Math.random() * 5).toFixed(1),
        ContactEmail: `employee${i + 2}@example.com`,
        PhoneNumber: `555-123-${(i % 900) + 100}`,
        EmergencyContact: `Person ${(i % 50) + 1} - 555-789-${(i % 900) + 100}`,
        LastAccessDate: formatDate(`2024-09-${(i % 28) + 1}`),
        ActiveEmployeeStatus: i % 2 === 0,
        BonusAmount: Math.floor(Math.random() * 5000) + 1000,
        TaxBracket: ["10%", "15%", "20%", "25%"][i % 4],
        RemoteWorkEligible: i % 3 === 0
    }))
];

