export const title = "Employee Record";
export const buttonSetting = {
    ButtonAction: ['Add', 'Edit', 'Delete', 'CSV', 'XLSX', 'PDF','ShowHideColumns'],
    IsButtonVisible: 
    {
        Add: true,
        Edit: true,
        Delete: true,
        CSV: true,
        XLSX: true,
        PDF: true,
        ShowHideColumns:true
    },
    IsButtonEnabled:
    {
        Add: true,
        Edit: true,
        Delete: true,
        CSV: true,
        XLSX: true,
        PDF: true,
        ShowHideColumns:true
    }
};
export const listViewColumns = [
    { ColumnHeader: "EmployeeName", DataType: "string", Tooltip: true, Width: 200, isVisible: true, isEditable: true, isFreeze: false, Sorting: true, Filtering: true, ColumnOrder: 1 },
    { ColumnHeader: "BirthDate", DataType: "date", Tooltip: false, Width: 200, isVisible: true, isEditable: false, isFreeze: false, Sorting: true, Filtering: true, ColumnOrder: 6 },
    { ColumnHeader: "RelationshipStatus", DataType: "string", Tooltip: false, Width: 200, isVisible: true, isEditable: true, isFreeze: false, Sorting: true, Filtering: true, ColumnOrder: 3 },
    { ColumnHeader: "AnnualIncome", DataType: "number", Tooltip: false, Width: 200, isVisible: true, isEditable: false, isFreeze: false, Sorting: true, Filtering: true, ColumnOrder: 4 },
    { ColumnHeader: "IdentificationNumber", DataType: "string", Tooltip: false, Width: 200, isVisible: true, isEditable: false, isFreeze: true, Sorting: false, Filtering: true, ColumnOrder: 5 },
    { ColumnHeader: "StartDate", DataType: "date", Tooltip: false, Width: 200, isVisible: true, isEditable: true, isFreeze: false, Sorting: true, Filtering: true, ColumnOrder: 2 },
    { ColumnHeader: "FullTimeEmployment", DataType: "boolean", Tooltip: false, Width: 200, isVisible: false, isEditable: false, isFreeze: false, Sorting: false, Filtering: false, ColumnOrder: 7 },
    { ColumnHeader: "ProfessionalExperience", DataType: "number", Tooltip: false, Width: 200, isVisible: true, isEditable: true, isFreeze: false, Sorting: true, Filtering: true, ColumnOrder: 8 },
    { ColumnHeader: "WorkDepartment", DataType: "string", Tooltip: false, Width: 200, isVisible: false, isEditable: true, isFreeze: false, Sorting: true, Filtering: true, ColumnOrder: 9 },
    { ColumnHeader: "RecentPromotionDate", DataType: "date", Tooltip: false, Width: 200, isVisible: true, isEditable: false, isFreeze: false, Sorting: true, Filtering: true, ColumnOrder: 10 },
    { ColumnHeader: "ManagementPosition", DataType: "boolean", Tooltip: false, Width: 200, isVisible: false, isEditable: false, isFreeze: false, Sorting: false, Filtering: false, ColumnOrder: 11 },
    { ColumnHeader: "JobPerformanceRating", DataType: "number", Tooltip: false, Width: 200, isVisible: true, isEditable: true, isFreeze: false, Sorting: true, Filtering: true, ColumnOrder: 12 },
    { ColumnHeader: "ContactEmail", DataType: "string", Tooltip: false, Width: 200, isVisible: true, isEditable: true, isFreeze: false, Sorting: false, Filtering: true, ColumnOrder: 13 },
    { ColumnHeader: "LastAccessDate", DataType: "date", Tooltip: false, Width: 200, isVisible: true, isEditable: false, isFreeze: false, Sorting: true, Filtering: true, ColumnOrder: 14 },
    { ColumnHeader: "ActiveEmployeeStatus", DataType: "boolean", Tooltip: false, Width: 200, isVisible: true, isEditable: false, isFreeze: false, Sorting: false, Filtering: false, ColumnOrder: 15 }
];
export const tableData = [
    {
        id: 1,
        EmployeeName: "John Cena",
        BirthDate: "2024-11-15",
        RelationshipStatus: "Single",
        AnnualIncome: 60000,
        IdentificationNumber: "EMP001",
        StartDate: "2015-07-15",
        FullTimeEmployment: true,
        ProfessionalExperience: 9,
        WorkDepartment: "Sales",
        RecentPromotionDate: "2023-02-10",
        ManagementPosition: false,
        JobPerformanceRating: 3.8,
        ContactEmail: "alice.johnson@example.com",
        LastAccessDate: "2024-09-26",
        ActiveEmployeeStatus: true
    },
    ...Array.from({ length: 199 }, (_, i) => ({
        id: i + 2,
        EmployeeName: `Employee ${i + 2}`,
        BirthDate: `198${Math.floor(i / 10) + 1}-0${(i % 9) + 1}-15`,
        RelationshipStatus: ["Single", "Married", "Divorced"][i % 3],
        AnnualIncome: 50000 + (i * 1000),
        IdentificationNumber: `EMP${(i + 2).toString().padStart(3, '0')}`,
        StartDate: `201${i % 10}-08-20`,
        FullTimeEmployment: i % 2 === 0,
        ProfessionalExperience: (i % 15) + 1,
        WorkDepartment: ["IT", "HR", "Finance", "Marketing", "Sales"][i % 5],
        RecentPromotionDate: `202${i % 5}-05-10`,
        ManagementPosition: i % 5 === 0,
        JobPerformanceRating: (Math.random() * 5).toFixed(1),
        ContactEmail: `employee${i + 2}@example.com`,
        LastAccessDate: `2024-09-${(i % 28) + 1}`,
        ActiveEmployeeStatus: i % 2 === 0
    }))
];