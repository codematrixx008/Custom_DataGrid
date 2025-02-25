import React, { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../CustomComponent/Components.css';
import '../CustomComponent/Style.css';
import { LuPin } from 'react-icons/lu';
import { LucidePinOff, LucidePin, Plus, FilePenLine, Trash, ArrowDownUp, EllipsisVertical, RotateCcw, ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, FileText } from "lucide-react";


const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  select: {
    padding: '8px',
    fontSize: '16px',
  },
  icon: {
    marginLeft: '8px',
    cursor: 'pointer',
    fontSize: '20px',
    marginRight: '9px'
  },
  overlay: {
    position: 'fixed', // Use fixed positioning for overlay
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // Ensure overlay is above other elements
  },
  popup: {
    backgroundColor: '#fff',
    padding: '20px',
    border: '1px solid #ccc',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    borderRadius: '4px',
    width: "400px",
    height: "500px",
  },
  deletePopup: {
    backgroundColor: '#fff',
    padding: '20px',
    border: '1px solid #ccc',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    borderRadius: '4px',
  }
};

const CustomDataGrid = ({ title, settings, listViewColumns, data }: any) => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [inputValues, setInputValues] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [sortedData, setSortedData] = useState<any[]>([]);
  const [selectedsortedData, setSelectedSortedData] = useState(data);
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [visibleColumns, setVisibleColumns] = useState(listViewColumns);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const isAnyRowSelected = selectedRows.length > 0;
  const [filters, setFilters] = useState<{ [key: string]: { condition: string; value: any } }>({});
  const [sortConfig, setSortConfig] = useState<{ column: string; direction: string } | null>(null);
  const [columnFilterVisible, setColumnFilterVisible] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState({ visible: false, text: 'abcds', x: 0, y: 0 });
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [showColumnVisiblePopUp, setShowColumnVisiblePopUp] = useState<boolean>(false);
  const [showActionPopup, setShowActionPopup] = useState<{ [key: string]: boolean }>({
    Add: false,
    Edit: false,
    Delete: false
  });
  const [editCell, setEditCell] = useState<{ rowId: number; ColumnHeader: string } | null>(null);
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const isSelectAllChecked = selectedRows.length === paginatedData.length && paginatedData.length > 0;
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const popupColumnRef = useRef<HTMLDivElement>(null);
  const frozenColumns = (visibleColumns as any[])
    .filter((col: any) => col?.isVisible && col?.isFreeze)
    .sort((a: any, b: any) => a?.ColumnOrder - b?.ColumnOrder);

  const nonFrozenColumns = (visibleColumns as any[])
    .filter((col: any) => col?.isVisible && !col?.isFreeze)
    .sort((a: any, b: any) => a?.ColumnOrder - b?.ColumnOrder);
  const [pinnedColumns, setPinnedColumns] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (columnFilterVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [columnFilterVisible]);

  useEffect(() => {
    handlefiltersearch();
  }, [filters]);

  const formatDate = (date: any, targetFormat: any): any => {
    if (!date || !targetFormat) return date;
    const parts = date.split(/[-/]/);
    if (parts.length !== 3 || parts.some(isNaN)) return date;
    let [year, month, day] =
      date.includes("/") ? [parts[2], parts[0], parts[1]] : [parts[2], parts[0], parts[1]];
    switch (targetFormat) {
      case "MM-DD-YYYY":
        return `${month}-${day}-${year}`;
      case "MM/DD/YYYY":
        return `${month}/${day}/${year}`;
      case "YYYY-MM-DD":
        return `${year}-${month}-${day}`;
      case "YYYY/MM/DD":
        return `${year}/${month}/${day}`;
      case "DD-MM-YYYY":
        return `${day}-${month}-${year}`;
      case "DD/MM/YYYY":
        return `${day}/${month}/${year}`;
      default:
        return date;
    }
  };

  useEffect(() => {
    if (!data || !settings?.dateFormat) return;
    setSortedData(
      data.map((item: any) => {
        let formattedItem = { ...item };
        listViewColumns.forEach(({ ColumnHeader, DataType }: any) => {
          if (DataType === "date" && item[ColumnHeader]) {
            formattedItem[ColumnHeader] = formatDate(item[ColumnHeader], settings.dateFormat);
          }
        });
        return formattedItem;
      })
    );
  }, [data, settings]);

  useEffect(() => {
    if (showActionPopup.Edit && selectedRows !== null && data && listViewColumns) {
      const selectedRowData = data.find((row: any) => row.id === selectedRows[0]);
      if (selectedRowData) {
        const updatedInputValues: { [key: string]: any } = {};
        listViewColumns.forEach((col: any) => {
          updatedInputValues[col.ColumnHeader] = selectedRowData[col.ColumnHeader] || '';
        });
        setInputValues(updatedInputValues);
      }
    }
  }, [showActionPopup.Edit, selectedRows, data, listViewColumns]);

  useEffect(() => {
    if (showColumnVisiblePopUp) {
      document.addEventListener('mousedown', handleClickOutsideColumns);
    } else {
      document.removeEventListener('mousedown', handleClickOutsideColumns);
    }
    return () => document.removeEventListener('mousedown', handleClickOutsideColumns);
  }, [showColumnVisiblePopUp]);

  const handleMouseEnter = (e: any, name: any) => {
    setTooltip({ visible: true, text: name, x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setTooltip({ ...tooltip, visible: false });
  };

  const handleInputChange = (columnHeader: string, value: any) => {
    setInputValues((prev: any) => ({
      ...prev,
      [columnHeader]: value
    }));
  };

  const handleActionEditButtonclose = () => {
    setShowActionPopup({ ...showActionPopup, Edit: false });
    setInputValues({});
  };

  const handleAddSubmit = () => {
    const newRow = { id: Date.now(), ...inputValues };
    setSortedData((prevData) => [...prevData, newRow]);
    setInputValues({});
    handleActionAddButtonclose();
  };

  const handleEditSubmit = (): void => {
    if (showActionPopup?.Edit) {
      const updatedData = (sortedData as any[]).map((row: any) => {
        if (row.id === selectedRows[0]) {
          return { ...row, ...inputValues };
        }
        return row;
      });
      setSortedData(updatedData);
    }
    setInputValues({} as any);
    handleActionEditButtonclose(); // Close modal after submission
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSortClick = (column: string) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.column === column && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ column, direction });
    const sorted = [...sortedData].sort((a, b) => {
      if (a[column] < b[column]) return direction === 'ascending' ? -1 : 1;
      if (a[column] > b[column]) return direction === 'ascending' ? 1 : -1;
      return 0;
    });
    setSortedData(sorted);
  };

  const handleCheckboxChange = (id: number) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(id)
        ? prevSelectedRows.filter((rowId) => rowId !== id)
        : [...prevSelectedRows, id]
    );
  };

  const handleSelectAllChange = () => {
    if (selectedRows.length === paginatedData.length) {
      setSelectedRows([]);
    } else {
      const pageRowIds = paginatedData.map((row: any) => row.id);
      setSelectedRows(pageRowIds);
    }
  };

  const formatData = (data: any, dataType: string) => {
    if (dataType === 'date') {
      const date = new Date(data);
      return date.toLocaleDateString('en-GB'); // Formats date as 'DD/MM/YYYY'
    } else if (dataType === 'boolean') {
      return data ? "Yes" : "No"; // Converts true/false to Yes/No
    }
    return data;
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filteredData = data.filter((row: any) =>
      visibleColumns.some((col: any) =>
        String(row[col.ColumnHeader]).toLowerCase().includes(value.toLowerCase())
      )
    );
    setSortedData(filteredData);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    const filteredData = data.filter((row: any) =>
      visibleColumns.some((col: any) =>
        String(row[col.ColumnHeader]).toLowerCase())
    )
    setSortedData(filteredData);
    setCurrentPage(1);
    setSearchTerm('');

  };

  const getSelectedExportData = (): typeof sortedData => {
    if (selectedRows.length > 0) {
      return sortedData.filter(row => selectedRows.includes(row.id));
    }
    return sortedData;
  };

  const exportToCSV = () => {
    const csvRows: string[] = [];
    const dataToExport = getSelectedExportData();
    const headers = (visibleColumns as any[])
      .filter((col: any) => col?.isVisible)
      .map((col: any) => `"${col?.ColumnHeader}"`);
    csvRows.push(headers.join(','));
    dataToExport.forEach(row => {
      const values = visibleColumns
        .filter((col: any) => col.isVisible)
        .map((col: any) => {
          let value = formatData(row[col.ColumnHeader], col.DataType);
          return `"${value !== null && value !== undefined ? value : ''}"`; // Handle null values
        });
      csvRows.push(values.join(','));
    });
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'data.csv');
  };

  const exportToExcel = () => {
    const dataToExport = getSelectedExportData();
    const headers = visibleColumns
      .filter((col: any) => col.isVisible)
      .map((col: any) => col.ColumnHeader);
    const data = dataToExport.map(row =>
      visibleColumns
        .filter((col: any) => col.isVisible)
        .reduce((acc: any, col: any) => {
          acc[col.ColumnHeader] = formatData(row[col.ColumnHeader], col.DataType);
          return acc;
        }, {} as Record<string, any>)
    );

    const ws = XLSX.utils.json_to_sheet([headers, ...data.map(Object.values)]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, title);
    XLSX.writeFile(wb, 'data.xlsx');
  };

  const exportToPDF = () => {
    const dataToExport = getSelectedExportData();
    const doc = new jsPDF({ orientation: "landscape", putOnlyUsedFonts: true, format: "a3" });

    const headers = (visibleColumns as any[])
      .filter((col: any) => col?.isVisible)
      .map((col: any) => col?.ColumnHeader);

    const data = (dataToExport as any[]).map((row: any) =>
      (visibleColumns as any[])
        .filter((col: any) => col?.isVisible)
        .map((col: any) => formatData(row[col?.ColumnHeader], col?.DataType))
    );

    doc.text(title, 14, 10);
    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 20,
      styles: { fontSize: 10, cellPadding: 2 }, // Better styling
    });

    doc.save("data.pdf");
  };

  const handleColumnVisibilityChange = (columnHeader: string) => {
    setVisibleColumns((prevColumns: any) =>
      prevColumns.map((col: any) =>
        col.ColumnHeader === columnHeader
          ? { ...col, isVisible: !col.isVisible }
          : col
      )
    );
  };

  const handlecolumnvisiblepopup = () => {
    setShowColumnVisiblePopUp((prevState) => !prevState);
  };

  const handleFilterClick = (columnHeader: string) => {
    setColumnFilterVisible((prev) => (prev === columnHeader ? null : columnHeader));
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
      setColumnFilterVisible(null);
    }
  };

  const handleClickOutsideColumns = (event: MouseEvent) => {
    if (popupColumnRef.current && !popupColumnRef.current.contains(event.target as Node)) {
      setShowColumnVisiblePopUp(false);
    }
  };

  const renderFilterOptions = (dataType: string) => {
    switch (dataType) {
      case 'string':
        return (
          <>
            <option value="contain">Contain</option>
            <option value="doesnotcontain">Does not contain</option>
            <option value="startwith">Start with</option>
            <option value="endwith">End with</option>
            {/* <option value="is">Is</option> */}
          </>
        );

      case 'number':
        return (
          <>
            <option value="equal">=</option>
            <option value="notequal">!=</option>
            <option value="greaterthan">{">"}</option>
            <option value="greaterthanequal">{">="}</option>
            <option value="lessthan">{"<"}</option>
            <option value="lessthanequal">{"<="}</option>
            <option value="isempty">Is empty</option>
            <option value="isnotempty">Is not empty</option>
            <option value="between">Between</option>
          </>
        );

      case 'date':
      case 'datetime':
        return (
          <>
            {/* <option value="is">Is</option> */}
            <option value="isnot">Is not</option>
            <option value="isafter">Is after</option>
            <option value="isonorafter">Is on or after</option>
            <option value="isbefore">Is before</option>
            <option value="isonorbefore">Is on or before</option>
            <option value="isempty">Is empty</option>
            <option value="isnotempty">Is not empty</option>
            <option value="between">Between</option>
          </>
        );

      case 'boolean':
        return (
          <>
            <option value="is">Is</option>
          </>
        );

      default:
        return null;
    }
  };

  const getDistinctBooleanValues = (column: string) => {
    const distinctValues = [...new Set(data.map((row: any) => row[column]))];
    return distinctValues;
  };

  const handleFilterConditionChange = (column: string, condition: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [column]: { ...prevFilters[column], condition },
    }));
  };

  const handleFilterInputChange = (column: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [column]: { ...prevFilters[column], value },
    }));
  };

  const renderFilterInput = (dataType: string, column: string) => {
    const filterValue = filters[column]?.value ?? "";
    switch (dataType) {
      case 'string':
        return (
          <>
            {filters[column]?.condition === 'isempty' ? (
              <input
                type="text"
                className="search-input2"
                value={filterValue}
                disabled
                placeholder="No value"
              />
            ) : filters[column]?.condition === 'doesnotcontain' ? (
              <input
                type="text"
                className="search-input2"
                value={filterValue}
                onChange={(e) => handleFilterInputChange(column, e.target.value)}
                placeholder="Does not contain"
              />
            ) : (
              <input
                type="text"
                className="search-input2"
                value={filterValue}
                onChange={(e) => handleFilterInputChange(column, e.target.value)}
                placeholder="Search"
              />
            )}
          </>
        );

      case 'number':
        return (
          <>
            {filters[column]?.condition === 'between' ? (
              <>
                <input
                  type="number"
                  className="search-input2"
                  value={filters[column]?.value?.min ?? ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      [column]: {
                        ...prev[column],
                        value: { ...prev[column]?.value, min: e.target.value },
                      },
                    }))
                  }
                  placeholder="Min value"
                />
                <input
                  type="number"
                  className="search-input2"
                  value={filters[column]?.value?.max ?? ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      [column]: {
                        ...prev[column],
                        value: { ...prev[column]?.value, max: e.target.value },
                      },
                    }))
                  }
                  placeholder="Max value"
                />
              </>
            ) : (
              <input
                type="text"
                className="search-input2"
                value={filterValue}
                onChange={(e) => handleFilterInputChange(column, e.target.value)}
                placeholder="Search"
              />
            )}
          </>
        );

      case 'date':
      case 'datetime':
        return (
          <>
            {filters[column]?.condition === 'between' ? (
              <>
                <input
                  type="date"
                  className="DatePicker-custom"
                  value={filters[column]?.value?.startDate?.toISOString().split("T")[0] ?? ""}
                  onChange={(e) => {
                    const newDate = e.target.value ? new Date(e.target.value) : null;
                    setFilters((prev) => ({
                      ...prev,
                      [column]: {
                        ...prev[column],
                        value: { ...prev[column]?.value, startDate: newDate }
                      }
                    }));
                  }}
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  className="DatePicker-custom"
                  value={filters[column]?.value?.endDate?.toISOString().split("T")[0] ?? ""}
                  onChange={(e) => {
                    const newDate = e.target.value ? new Date(e.target.value) : null;
                    setFilters((prev) => ({
                      ...prev,
                      [column]: {
                        ...prev[column],
                        value: { ...prev[column]?.value, endDate: newDate }
                      }
                    }));
                  }}
                  placeholder="End Date"
                />
              </>
            ) : (
              <input
                type="date"
                id="date"
                name="date"
                className="DatePicker-custom"
                value={filterValue ? new Date(filterValue).toISOString().split("T")[0] : ""}
                onChange={(e: any) => {
                  const newDate = e.target.value ? new Date(e.target.value) : null;
                  setFilters((prev) => ({
                    ...prev,
                    [column]: { ...prev[column], value: newDate }
                  }));
                }}
                placeholder="Select Date"
              />
            )}
          </>
        );


      case 'boolean':
        const distinctValues = getDistinctBooleanValues(column);
        return (
          <select
            className="search-input2"
            onChange={(e: any) => handleFilterInputChange(column, e.target.value)}
            value={filterValue}
          >
            <option value="">Select</option>
            {distinctValues.map((val: any, idx: number) => {
              return (
                <option key={idx} value={val}>
                  {val ? 'True' : 'False'}
                </option>
              );
            })}
          </select>
        );
      default:
        return null;
    }
  };

  const handlefiltersearch = () => {
    let filteredData = data;

    Object.keys(filters).forEach((column) => {
      const { condition, value } = filters[column];

      if (value !== undefined && value !== null) {
        filteredData = filteredData.filter((row: any) => {
          const cellValue = row[column];

          if (condition === 'isempty') return cellValue === null || cellValue === undefined || cellValue === '';
          if (condition === 'isnotempty') return !(cellValue === null || cellValue === undefined || cellValue === '');

          if (typeof cellValue === 'number') {
            const numValue = Number(cellValue);
            switch (condition) {
              case 'equal': return numValue === Number(value);
              case 'notequal': return numValue !== Number(value);
              case 'greaterthan': return numValue > Number(value);
              case 'greaterthanequal': return numValue >= Number(value);
              case 'lessthan': return numValue < Number(value);
              case 'lessthanequal': return numValue <= Number(value);
              case 'between':
                return Number(value.min) <= numValue && numValue <= Number(value.max);
              default:
                return true;
            }
          }
          else if (typeof cellValue === 'string') {
            if (['isafter', 'isonorafter', 'isbefore', 'isonorbefore', 'between'].includes(condition)) {
              const dateValue = new Date(cellValue);
              switch (condition) {
                case 'isafter':
                  return dateValue > new Date(value);
                case 'isonorafter':
                  return dateValue >= new Date(value);
                case 'isbefore':
                  return dateValue < new Date(value);
                case 'isonorbefore':
                  return dateValue <= new Date(value);
                case 'between':
                  return dateValue >= new Date(value.startDate) && dateValue <= new Date(value.endDate);
                default:
                  return true;
              }
            } else {
              const strValue = String(cellValue);
              switch (condition) {
                case 'contain':
                  return strValue.toLowerCase().includes(value.toLowerCase());
                case 'doesnotcontain':
                  return !strValue.toLowerCase().includes(value.toLowerCase());
                case 'startwith':
                  return strValue.toLowerCase().startsWith(value.toLowerCase());
                case 'endwith':
                  return strValue.toLowerCase().endsWith(value.toLowerCase());
                case 'is':
                  return strValue === value;
                default:
                  return true;
              }
            }
          }

          else if (typeof cellValue === 'boolean') {
            const boolValue = value === 'true' || value === true; // Convert value to boolean
            switch (condition) {
              case 'is':
                return cellValue === boolValue;
              case 'isnot':
                return cellValue !== boolValue;
              default:
                return true;
            }
          }
          else if (cellValue instanceof Date || !isNaN(Date.parse(cellValue))) {
            const dateValue = new Date(cellValue);
            switch (condition) {
              case 'isafter':
                return dateValue > new Date(value);
              case 'isonorafter':
                return dateValue >= new Date(value);
              case 'isbefore':
                return dateValue < new Date(value);
              case 'isonorbefore':
                return dateValue <= new Date(value);
              case 'between':
                return (
                  new Date(value.startDate) <= dateValue &&
                  dateValue <= new Date(value.endDate)
                );
              default:
                return true;
            }
          }

          return true;
        });
      }
    });

    setSortedData(filteredData);
    setCurrentPage(1);
  };

  const handleclearfilter = () => {
    setFilters({
      filter: { condition: '', value: '' }
    });
    handlefiltersearch();
  };

  const handleDelete = (id: number) => {
    setSortedData((prevData: any) => prevData.filter((item: any) => item.id !== id));
    setSelectedRows([])
    handleActionDeleteButtonClose();
  };

  const handleActionAddButton = () => {
    setShowActionPopup((prev) => ({ ...prev, Add: true }));
  };

  const handleActionAddButtonclose = () => {
    setShowActionPopup((prev) => ({ ...prev, Add: false }));
  };

  const handleActionEditButton = () => {
    setShowActionPopup((prev) => ({ ...prev, Edit: true }));
  };

  const handleActionDeleteButton = () => {
    setShowActionPopup((prev) => ({ ...prev, Delete: true }));
  };

  const handleActionDeleteButtonClose = () => {
    setShowActionPopup((prev) => ({ ...prev, Delete: false }));
  };

  const handleDoubleClick = (rowId: number, ColumnHeader: string) => {
    setEditCell({ rowId, ColumnHeader });
  };

  const handleEditableInput = (ColumnHeader: string, value: any): void => {
    const updatedData = (sortedData as any[]).map((row: any) => {
      if (row.id === editCell?.rowId) {
        return { ...row, [ColumnHeader]: value };
      }
      return row;
    });

    setSortedData(updatedData);
    setEditCell(null);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const calculateLeftOffset = (col: any) => {
    const index = frozenColumns.findIndex(fCol => fCol.ColumnHeader === col.ColumnHeader);
    return 30 + frozenColumns.slice(0, index).reduce((acc, curr) => acc + curr.Width + 8, 0);
  };

  const togglePin = (columnHeader: string) => {
    setPinnedColumns((prev) => ({
      ...prev,
      [columnHeader]: !prev[columnHeader],
    }));

    setVisibleColumns((prevColumns: any) =>
      prevColumns.map((col: any) =>
        col.ColumnHeader === columnHeader
          ? { ...col, isFreeze: !col.isFreeze }
          : col
      )
    );
  };

  const [columnOrder, setColumnOrder] = useState(
    [...frozenColumns, ...nonFrozenColumns].map((col) => col.ColumnHeader)
  );

  const getReorderedColumns = (order) => {
    const allColumns = [...frozenColumns, ...nonFrozenColumns];
    const reordered = order.map((header) => allColumns.find((col) => col.ColumnHeader === header));
    return {
      frozen: reordered.filter((col) => col.isFreeze),
      nonFrozen: reordered.filter((col) => !col.isFreeze),
    };
  };

  const handleColumnDrop = (draggedIndex, targetIndex) => {
    if (draggedIndex === targetIndex) return;
    const updatedOrder = [...columnOrder];
    const [moved] = updatedOrder.splice(draggedIndex, 1);
    updatedOrder.splice(targetIndex, 0, moved);
    setColumnOrder(updatedOrder);
  };

  const { frozen: reorderedFrozenColumns, nonFrozen: reorderedNonFrozenColumns } = getReorderedColumns(columnOrder);

  return (
    <div className="main-card-container">

      {showActionPopup.Add && (
        <div
          style={styles.overlay}
          onClick={(e: any) => {
            if (e.target === e.currentTarget) {
              handleActionAddButtonclose();
            }
          }}
        >
          <div style={styles.popup} onClick={(e) => e.stopPropagation()}>
            <div className="column-inputs-container">
              <span className="popup-ActionTitle">Add New :</span>
              <hr />
              <div className="popup-mainconatiner">
                {listViewColumns.map((col: any, index: number) => (
                  <div key={index} className="popup-inner-container">
                    <label
                      htmlFor={`input-${col.ColumnHeader}`}
                      className="popup-ActionLabel"
                    >
                      {col.ColumnHeader}
                    </label>

                    {col.DataType === "boolean" ? (
                      <input
                        id={`input-${col.ColumnHeader}`}
                        type="checkbox"
                        checked={inputValues[col.ColumnHeader] || false}
                        onChange={(e) => handleInputChange(col.ColumnHeader, e.target.checked)}
                        className="popup-ActionCheckInput"
                      />
                    ) : col.DataType === "date" ? (
                      <input
                        id={`input-${col.ColumnHeader}`}
                        type="date"
                        value={inputValues[col.ColumnHeader] || ""}
                        onChange={(e) => handleInputChange(col.ColumnHeader, e.target.value)}
                        className="popup-ActionInput"
                        placeholder={col.ColumnHeader}
                      />
                    ) : col.DataType === "string" ? (
                      <input
                        id={`input-${col.ColumnHeader}`}
                        type="text"
                        value={inputValues[col.ColumnHeader] || ""}
                        onChange={(e) => handleInputChange(col.ColumnHeader, e.target.value)}
                        className="popup-ActionInput"
                        placeholder={col.ColumnHeader}
                      />
                    ) : col.DataType === "number" ? (
                      <input
                        id={`input-${col.ColumnHeader}`}
                        type="number"
                        value={inputValues[col.ColumnHeader] || ""}
                        onChange={(e) => handleInputChange(col.ColumnHeader, e.target.value)}
                        className="popup-ActionInput"
                        placeholder={col.ColumnHeader}
                      />
                    ) : (
                      <input
                        id={`input-${col.ColumnHeader}`}
                        type="text"
                        value={inputValues[col.ColumnHeader] || ""}
                        onChange={(e) => handleInputChange(col.ColumnHeader, e.target.value)}
                        className="popup-ActionInput"
                        placeholder={col.ColumnHeader}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="popup-button-container">

                <button onClick={handleActionAddButtonclose} className="popup-ActionButton"
                  style={{
                    background: settings.background || 'whitesmoke',
                    color: settings.color || 'black'
                  }} >

                  Close
                </button>
                <button
                  onClick={handleAddSubmit}
                  style={{ marginLeft: 10, background: settings.background || 'whitesmoke', color: settings.color || 'black' }}
                  className="popup-ActionButton"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showActionPopup.Edit && (
        <div
          style={styles.overlay}
          onClick={(e: any) => {
            if (e.target === e.currentTarget) {
              handleActionEditButtonclose();
            }
          }}
        >
          <div style={styles.popup} onClick={(e: any) => e.stopPropagation()}>
            <div className="column-inputs-container">
              <span className="popup-ActionTitle">Edit Record:</span>
              <hr />
              <div className="popup-mainconatiner">
                {listViewColumns.map((col: any, index: number) => (
                  <div key={index} className="popup-inner-container">
                    <label
                      htmlFor={`input-${col.ColumnHeader}`}
                      className="popup-ActionLabel"
                    >
                      {col.ColumnHeader}
                    </label>

                    {col.DataType === "boolean" ? (
                      <input
                        id={`input-${col.ColumnHeader}`}
                        type="checkbox"
                        checked={inputValues[col.ColumnHeader] || false}
                        onChange={(e) => handleInputChange(col.ColumnHeader, e.target.checked)}
                        className="popup-ActioncheckInput"
                      />
                    ) : col.DataType === "date" ? (
                      <input
                        id={`input-${col.ColumnHeader}`}
                        type="date"
                        value={
                          inputValues[col.ColumnHeader]
                            ? (() => {
                              const date = new Date(inputValues[col.ColumnHeader]);
                              const year = date.getFullYear();
                              const month = String(date.getMonth() + 1).padStart(2, "0");
                              const day = String(date.getDate()).padStart(2, "0");
                              return `${year}-${month}-${day}`;
                            })()
                            : ""
                        }
                        onChange={(e) => handleInputChange(col.ColumnHeader, e.target.value)}
                        className="popup-ActionInput"
                        placeholder={col.ColumnHeader}
                      />
                    ) : col.DataType === "string" ? (
                      <input
                        id={`input-${col.ColumnHeader}`}
                        type="text"
                        value={inputValues[col.ColumnHeader] || ""}
                        onChange={(e) => handleInputChange(col.ColumnHeader, e.target.value)}
                        className="popup-ActionInput"
                        placeholder={col.ColumnHeader}
                      />
                    ) : col.DataType === "number" ? (
                      <input
                        id={`input-${col.ColumnHeader}`}
                        type="number"
                        value={inputValues[col.ColumnHeader] || ""}
                        onChange={(e) => handleInputChange(col.ColumnHeader, e.target.value)}
                        className="popup-ActionInput"
                        placeholder={col.ColumnHeader}
                      />
                    ) : (
                      <input
                        id={`input-${col.ColumnHeader}`}
                        type="text"
                        value={inputValues[col.ColumnHeader] || ""}
                        onChange={(e) => handleInputChange(col.ColumnHeader, e.target.value)}
                        className="popup-ActionInput"
                        placeholder={col.ColumnHeader}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="popup-button-container" >
                <button
                  onClick={handleActionEditButtonclose}
                  className="popup-ActionButton"
                  style={{ background: settings.background || 'whitesmoke', color: settings.color || 'black' }}
                >
                  Close
                </button>
                <button
                  onClick={handleEditSubmit}
                  className="popup-ActionButton"
                  style={{ marginLeft: 10, background: settings.background || 'whitesmoke', color: settings.color || 'black' }}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showActionPopup.Delete && (
        <div style={styles.overlay}
          onClick={(e: any) => {
            if (e.target === e.currentTarget) {
              handleActionDeleteButtonClose();
            }
          }}>
          <div style={styles.deletePopup} onClick={(e: any) => e.stopPropagation()} >
            <div className="column-inputs-delete-container">
              <span className='popup-ActionTitle'>Are you sure you want to delete this item ?</span>

              <div className="popup-button-delete-container" >
                <button onClick={handleActionDeleteButtonClose} style={{ background: settings.background || 'whitesmoke', color: settings.color || 'black' }} className='popup-ActionButton'>
                  Close
                </button>
                <button style={{ marginLeft: 10, background: settings.background || 'whitesmoke', color: settings.color || 'black' }} className='popup-ActionButton' onClick={() => {
                  selectedRows.forEach((id) => handleDelete(id));
                }} >
                  Submit
                </button>

              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid-main-container">
        <div className="headingbox">
          <div className='table-title'>
            <h2>{title}</h2>
          </div>

          <div className="actions-container">
            {settings.isGlobalSearchVisible && (
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="searchBoxInput"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="clear-button"
                  >
                    <b>x</b>
                  </button>
                )}
              </div>
            )}

            <div className="buttons headerbuttons">
              {settings.ButtonAction.includes('Add') && settings.IsButtonVisible.Add && (

                <button className='table-actionbtn'
                  disabled={!settings.IsButtonEnabled.Add}
                  onClick={handleActionAddButton}
                  title='Add'>
                  <Plus />
                </button>
              )}

              {settings.ButtonAction.includes('Edit') && settings.IsButtonVisible.Edit && (
                <button className='table-actionbtn'
                  disabled={!isAnyRowSelected || !settings.IsButtonEnabled.Edit || selectedRows.length > 1}
                  title='Edit'
                  onClick={handleActionEditButton}>
                  <FilePenLine />
                </button>
              )}

              {settings.ButtonAction.includes('Delete') && settings.IsButtonVisible.Delete && (
                <button className='table-actionbtn'
                  disabled={!isAnyRowSelected || !settings.IsButtonEnabled.Delete}
                  title='Delete'
                  onClick={handleActionDeleteButton}>
                  <Trash />
                </button>
              )}

              {settings.ButtonAction.includes('CSV') && settings.IsButtonVisible.CSV && (
                <button className="table-actionbtn"
                  onClick={exportToCSV}
                  disabled={!settings.IsButtonEnabled.CSV}
                  title='CSV'>
                  <FileText />
                </button>
              )}

              {settings.ButtonAction.includes('XLSX') && settings.IsButtonVisible.XLSX && (
                <button className="table-actionbtn"
                  onClick={exportToExcel}
                  disabled={!settings.IsButtonEnabled.XLSX}
                  title='XLSX'>
                  <FileText />
                </button>
              )}

              {settings.ButtonAction.includes('PDF') && settings.IsButtonVisible.PDF && (
                <button className="table-actionbtn"
                  onClick={exportToPDF}
                  disabled={!settings.IsButtonEnabled.PDF}
                  title='PDF'>
                  <FileText />
                </button>
              )}


              <div className="column-control-panel">
                {settings.IsButtonVisible.ShowHideColumns && (
                  <button onClick={handlecolumnvisiblepopup} className='table-actionbtn' disabled={!settings.IsButtonEnabled.ShowHideColumns} title='ShowHideColumns' >&#9776;</button>
                )}
                {showColumnVisiblePopUp &&
                  <div ref={popupColumnRef} className="column-visibility-container" >
                    <div className='inner-column-visibility' >

                      {listViewColumns.map((col: any, index: number) => (
                        <div
                          key={index}
                          className="checkbox-container"
                        >
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                              type="checkbox"
                              id={`checkbox-${index}`}
                              checked={visibleColumns.find((visibleCol: any) => visibleCol.ColumnHeader === col.ColumnHeader)?.isVisible}
                              onChange={() => handleColumnVisibilityChange(col.ColumnHeader)}
                            />
                            <label htmlFor={`checkbox-${index}`} style={{ marginLeft: 4 }}>{col.ColumnHeader}</label>
                          </div>
                          <button
                            onClick={() => togglePin(col.ColumnHeader)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            {col.isFreeze ? (
                              pinnedColumns[col.ColumnHeader] ? <LucidePinOff /> : <LucidePin />
                            ) : (
                              pinnedColumns[col.ColumnHeader] ? <LucidePin /> : <LucidePinOff />
                            )}
                          </button>
                        </div>

                      ))}
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
        <div className='table-main-container' ref={filterDropdownRef}>
          <div className="table-main-box"
          >
            <table cellPadding="5" className="custom-grid">
              <thead className="custom-grid-header">
                <tr>
                  <th
                    className="sticky-column"
                    style={{ background: settings.background || "whitesmoke", left: 0, zIndex: 120 }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelectAllChecked}
                      onChange={handleSelectAllChange}
                      style={{ background: settings.background }}
                    />
                  </th>
                  {[...reorderedFrozenColumns, ...reorderedNonFrozenColumns].map((col, index) => (
                    <th
                      key={col.ColumnHeader}
                      className={`th-tab sticky-columns ${col.isFreeze ? "sticky-column" : ""}`}
                      draggable
                      title={col.ColumnHeader}
                      onDragStart={(e) => e.dataTransfer.setData("dragIndex", index.toString())}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        const draggedIndex = parseInt(e.dataTransfer.getData("dragIndex"), 10);
                        handleColumnDrop(draggedIndex, index);
                      }}
                      style={{
                        textAlign: "left",
                        minWidth: `${col.Width}px`,
                        fontSize: settings.fontSize ? `${settings.fontSize}px` : "13px",
                        fontFamily: settings.fontFamily || "Arial, sans-serif",
                        color: settings.color || "black",
                        background: settings.background || "whitesmoke",
                        left: col.isFreeze
                          ? `${calculateLeftOffset(col) ?? reorderedFrozenColumns
                            .slice(0, reorderedFrozenColumns.findIndex((c) => c.ColumnHeader === col.ColumnHeader))
                            .reduce((acc, curr) => acc + curr.Width + 8, 0)}px`
                          : undefined,
                        position: col.isFreeze ? "sticky" : "static",
                        zIndex: col.isFreeze ? 110 : 1,
                        whiteSpace: "nowrap",
                        cursor: "move",
                        top: "-2px",
                      }}
                    >
                      <span className="table-columnHeader-name">{col.ColumnHeader}</span>

                      <div className="columnHeader-filters-btn-container">
                        <button
                          className="btnsort"
                          style={{
                            border: `1px solid ${settings.background || "whitesmoke"}`,
                            background: settings.background || "whitesmoke",
                            color: settings.color || "black",
                          }}
                          onClick={() => handleSortClick(col.ColumnHeader)}
                        >
                          <ArrowDownUp />
                        </button>
                        <button
                          className="btnfilter"
                          style={{
                            border: `1px solid ${settings.background || "whitesmoke"}`,
                            background: settings.background || "whitesmoke",
                            color: settings.color || "black",
                          }}
                          onClick={() => handleFilterClick(col.ColumnHeader)}
                        >
                          <EllipsisVertical />
                        </button>
                        {columnFilterVisible === col.ColumnHeader && (
                          <div className="column-header-filters-box">
                            <div ref={filterDropdownRef} className="column-filters-dropdown">
                              <div className="select-container">
                                <select
                                  value={filters[col.ColumnHeader]?.condition || ""}
                                  onChange={(e) =>
                                    handleFilterConditionChange(col.ColumnHeader, e.target.value)
                                  }
                                  className="autocomplete-input2"
                                >
                                  <option value="" disabled>Select Filter</option>
                                  {renderFilterOptions(col.DataType)}
                                </select>
                              </div>
                              {renderFilterInput(col.DataType, col.ColumnHeader)}
                              <button className="clear-input-button" onClick={handleclearfilter}>
                                <RotateCcw />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="custom-grid-body">
                {paginatedData.map((row, rowIndex) => (
                  <tr key={row.id} className={rowIndex % 2 === 0 ? "stripedRow" : "table-row"}>
                    <td
                      className={rowIndex % 2 === 0 ? "stripedRow sticky-column" : "table-row sticky-column"}
                      style={{ position: "sticky", left: 0, zIndex: 104 }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => handleCheckboxChange(row.id)}
                      />
                    </td>
                    {[...reorderedFrozenColumns, ...reorderedNonFrozenColumns].map((col) => (
                      <td
                        key={col.ColumnHeader}
                        className={rowIndex % 2 === 0 ? "stripedRow" : "table-row"}
                        style={{
                          textAlign: col.Alignment,
                          minWidth: `${col.Width}px`,
                          fontSize: settings.fontSize ? `${settings.fontSize - 1}px` : "12px",
                          fontFamily: settings.fontFamily || "system-ui",
                          borderRight: "1px solid #ccc",
                          position: col.isFreeze ? "sticky" : "static",
                          left: col.isFreeze
                            ? `${calculateLeftOffset(col) ?? reorderedFrozenColumns
                              .slice(0, reorderedFrozenColumns.findIndex((c) => c.ColumnHeader === col.ColumnHeader))
                              .reduce((acc, curr) => acc + curr.Width + 8, 0)}px`
                            : undefined,
                          background: col.isFreeze ? settings.freezebackground || "whitesmoke" : "transparent",
                          zIndex: col.isFreeze ? 100 : 1,
                        }}
                        onDoubleClick={() => col.isEditable && handleDoubleClick(row.id, col.ColumnHeader)}
                      >
                        {editCell?.rowId === row.id && editCell?.ColumnHeader === col.ColumnHeader ? (
                          col.DataType === 'string' ? (
                            <input type="text" defaultValue={row[col.ColumnHeader]} className="editable-input" onBlur={(e) => handleEditableInput(col.ColumnHeader, e.target.value)} onKeyDown={(e: any) => e.key === "Enter" && handleEditableInput(col.ColumnHeader, e.target.value)} />
                          ) : col.DataType === 'number' ? (
                            <input type="number" defaultValue={row[col.ColumnHeader]} className="editable-input" onBlur={(e) => handleEditableInput(col.ColumnHeader, e.target.value)} onKeyDown={(e: any) => e.key === "Enter" && handleEditableInput(col.ColumnHeader, e.target.value)} />
                          ) : col.DataType === 'date' ? (
                            <input type="date"
                              defaultValue={(() => {
                                const dateStr = row[col.ColumnHeader]?.trim();
                                if (!dateStr) return "";

                                const parts = dateStr.split(/[-/]/);
                                if (parts.length !== 3 || parts.some(isNaN)) return "";

                                let [year, month, day] =
                                  settings?.dateFormat === "DD-MM-YYYY" || settings?.dateFormat === "DD/MM/YYYY" ? [parts[2], parts[1], parts[0]] :
                                    settings?.dateFormat === "MM-DD-YYYY" || settings?.dateFormat === "MM/DD/YYYY" ? [parts[2], parts[0], parts[1]] :
                                      parts; // Default: YYYY-MM-DD or YYYY/MM/DD

                                year = Number(year);
                                month = String(Number(month)).padStart(2, "0");
                                day = String(Number(day)).padStart(2, "0");

                                return isNaN(year) || isNaN(Number(month)) || isNaN(Number(day)) ? "" :
                                  `${year}-${month}-${day}`;
                              })()}
                              className="editable-input"
                              onBlur={(e) => {
                                let [year, month, day] = e.target.value.split("-").map((num) => parseInt(num, 10));

                                if (isNaN(year) || isNaN(month) || isNaN(day)) return;

                                let formattedMonth = String(month).padStart(2, "0");
                                let formattedDay = String(day).padStart(2, "0");

                                let formattedDate =
                                  settings?.dateFormat === "DD-MM-YYYY" ? `${formattedDay}-${formattedMonth}-${year}` :
                                    settings?.dateFormat === "DD/MM/YYYY" ? `${formattedDay}/${formattedMonth}/${year}` :
                                      settings?.dateFormat === "MM-DD-YYYY" ? `${formattedMonth}-${formattedDay}-${year}` :
                                        settings?.dateFormat === "MM/DD/YYYY" ? `${formattedMonth}/${formattedDay}/${year}` :
                                          settings?.dateFormat === "YYYY/MM/DD" ? `${year}/${formattedMonth}/${formattedDay}` :
                                            e.target.value; // Default: YYYY-MM-DD

                                handleEditableInput(col.ColumnHeader, formattedDate);
                              }}

                              onKeyDown={(e: any) => e.key === "Enter" && e.target.blur()} />
                          ) : col.DataType === 'boolean' ? (
                            <input type="checkbox" checked={row[col.ColumnHeader]} onChange={(e) => handleEditableInput(col.ColumnHeader, e.target.checked)} />
                          ) : null
                        ) : (
                          col.DataType === 'boolean' ? <input type="checkbox" checked={row[col.ColumnHeader]} disabled /> : row[col.ColumnHeader]
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
          <div className="pagination-container">
            <div className="footer">
              <span>Total Records: {sortedData.length}</span> &nbsp;&nbsp;&nbsp;
              <span>Selected Records: {selectedRows.length}</span>
            </div>
            <div className="pagination">
              <label>
                Page Size:{" "}
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                >
                  {[10, 20, 100, 500, 1000].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>

              <button disabled={currentPage === 1} onClick={() => handlePageChange(1)}>
                <ChevronFirst />
              </button>
              <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
                <ChevronLeft />
              </button>

              <span>Page {currentPage} - {totalPages}</span>

              <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
                <ChevronRight />
              </button>
              <button disabled={currentPage === totalPages} onClick={() => handlePageChange(totalPages)}>
                <ChevronLast />
              </button>

            </div>
          </div>
        </div>
      </div>
    </div >
  );
};
export default CustomDataGrid;