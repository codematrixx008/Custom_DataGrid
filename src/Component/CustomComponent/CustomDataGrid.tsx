import React, { useEffect, useRef, useState } from 'react';
import { BsFiletypeCsv, BsFiletypePdf, BsFiletypeXls } from "react-icons/bs";
import { GrDocumentCsv } from "react-icons/gr";
import { AiOutlineDelete } from "react-icons/ai";
import { IoMdAdd } from "react-icons/io";
import { CiEdit } from "react-icons/ci";
import { BiLastPage } from "react-icons/bi";
import { BiFirstPage } from "react-icons/bi";

// External Libraries
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Date Picker
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Icons
import { FaCalendar, FaFileCsv } from "react-icons/fa";

// Custom Styles
import '../CustomComponent/Components.css';
import '../CustomComponent/Style.css';


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

const CustomDataGrid = ({ title, buttonSetting, listViewColumns, data }: any) => {

  // **Search & Pagination**
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [sortedData, setSortedData] = useState(data);
  const [selectedsortedData, setSelectedSortedData] = useState(data);
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * rowsPerPage;

  // **Data & Selection**
  // const [sortedData, setSortedData] = useState(data);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [visibleColumns, setVisibleColumns] = useState(listViewColumns);


  // **Date Filters**

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);


  const isAnyRowSelected = selectedRows.length > 0;

  // **Filters & Sorting**
  const [filters, setFilters] = useState<{ [key: string]: { condition: string; value: any } }>({});
  const [sortConfig, setSortConfig] = useState<{ column: string; direction: string } | null>(null);
  const [columnFilterVisible, setColumnFilterVisible] = useState<string | null>(null);

  // **Tooltip Management**
  const [tooltip, setTooltip] = useState({ visible: false, text: 'abcds', x: 0, y: 0 });
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  // **Popups & Visibility**
  const [showColumnVisiblePopUp, setShowColumnVisiblePopUp] = useState<boolean>(false);
  const [showActionPopup, setShowActionPopup] = useState<{ [key: string]: boolean }>({
    Add: false,
    Edit: false,
    Delete: false
  });
  const [editCell, setEditCell] = useState<{ rowId: number; ColumnHeader: string } | null>(null);

  // **Input Values**
  const [inputValues, setInputValues] = useState<{ [key: string]: any }>({});

  // **Pagination Data**
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // **Selection Helpers**
  const isSelectAllChecked = selectedRows.length === paginatedData.length && paginatedData.length > 0;

  // **Refs**
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const popupColumnRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (columnFilterVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [columnFilterVisible]);

  useEffect(() => {
    handlefiltersearch();
  }, [filters]);

  useEffect(() => {

    if (showActionPopup.Edit && selectedRows !== null && data && listViewColumns) {
      console.log(showActionPopup.Edit, "showActionPopup.Edit ");
      console.log("selectedRows", selectedRows[0]);
      console.log("data", data);
      console.log("listViewColumns", listViewColumns);

      const selectedRowData = data.find((row: any) => row.id === selectedRows[0]);
      console.log(selectedRowData, "selectedRowData");

      if (selectedRowData) {
        const updatedInputValues: { [key: string]: any } = {};
        listViewColumns.forEach((col: any) => {
          updatedInputValues[col.ColumnHeader] = selectedRowData[col.ColumnHeader] || '';
        });
        setInputValues(updatedInputValues);
      }
    }
  }, [showActionPopup.Edit, selectedRows, data, listViewColumns]);

  const handleMouseEnter = (e: any, name: any) => {
    setTooltip({ visible: true, text: name, x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setTooltip({ ...tooltip, visible: false });
  };

  const handleInputChange = (columnHeader: string, value: string) => {
    setInputValues((prev) => ({
      ...prev,
      [columnHeader]: value
    }));
  };

  const handleActionEditButtonclose = () => {
    setShowActionPopup({ ...showActionPopup, Edit: false });
  };

  const handleAddSubmit = () => {
    alert("you click on add button ");
  }

  const handleEditSubmit = () => {
    if (showActionPopup.Edit) {
      const updatedData = sortedData.map((row) => {
        if (row.id === selectedRows[0]) {
          return { ...row, ...inputValues };
        }
        return row;

      });
      setSortedData(updatedData);
    }

    setInputValues({});

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
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filteredData = data.filter((row: any) =>
      visibleColumns.some((col: any) =>
        String(row[col.ColumnHeader]).toLowerCase().includes(value)
      )
    );

    setSortedData(filteredData);
    setCurrentPage(1);
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

    const headers = visibleColumns
      .filter(col => col.isVisible)
      .map(col => `"${col.ColumnHeader}"`); // Enclose headers in quotes

    csvRows.push(headers.join(','));

    dataToExport.forEach(row => {
      const values = visibleColumns
        .filter(col => col.isVisible)
        .map(col => {
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
      .filter(col => col.isVisible)
      .map(col => col.ColumnHeader);

    const data = dataToExport.map(row =>
      visibleColumns
        .filter(col => col.isVisible)
        .reduce((acc, col) => {
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
    const doc = new jsPDF({ orientation: "landscape", putOnlyUsedFonts: "true", format: "a3" });

    const headers = visibleColumns
      .filter(col => col.isVisible)
      .map(col => col.ColumnHeader);

    const data = dataToExport.map(row =>
      visibleColumns
        .filter(col => col.isVisible)
        .map(col => formatData(row[col.ColumnHeader], col.DataType))
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
  useEffect(() => {
    if (showColumnVisiblePopUp) {
      document.addEventListener('mousedown', handleClickOutsideColumns);
    } else {
      document.removeEventListener('mousedown', handleClickOutsideColumns);
    }
    return () => document.removeEventListener('mousedown', handleClickOutsideColumns);
  }, [showColumnVisiblePopUp]);

  const renderFilterOptions = (dataType: string) => {
    switch (dataType) {
      case 'string':
        return (
          <>
            <option value="contain">Contain</option>
            <option value="doesnotcontain">Does not contain</option>
            <option value="startwith">Start with</option>
            <option value="endwith">End with</option>
            <option value="is">Is</option>
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
            <option value="is">Is</option>
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

  const renderFilterInput = (dataType: string, column: string) => {
    switch (dataType) {
      case 'string':
      case 'number':
        return (
          <>
            {filters[column]?.condition === 'between' ? (
              <>
                <input
                  type="number"
                  className="search-input2"
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      [column]: {
                        ...prev[column],
                        value: { ...prev[column]?.value, min: e.target.value }
                      }
                    }));
                  }}
                  placeholder="Min value"
                />
                <input
                  type="number"
                  className="search-input2"
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      [column]: {
                        ...prev[column],
                        value: { ...prev[column]?.value, max: e.target.value }
                      }
                    }));
                  }}
                  placeholder="Max value"
                />
              </>
            ) : (
              <input
                type="text"
                className="search-input2"
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
                {/* <DatePicker
                  className="DatePicker-custom"
                  selected={filters[column]?.value?.startDate || null}
                  onChange={(date: Date | null) => {
                    setFilters((prev) => ({
                      ...prev,
                      [column]: {
                        ...prev[column],
                        value: { ...prev[column]?.value, startDate: date }
                      }
                    }));
                  }}
                  showTimeSelect={dataType === 'datetime'}
                  dateFormat={dataType === 'datetime' ? 'Pp' : 'P'}
                  placeholderText="Start Date"
                  isClearable
                />
                <DatePicker
                  className="DatePicker-custom"
                  selected={filters[column]?.value?.endDate || null}
                  onChange={(date: Date | null) => {
                    setFilters((prev) => ({
                      ...prev,
                      [column]: {
                        ...prev[column],
                        value: { ...prev[column]?.value, endDate: date }
                      }
                    }));
                  }}
                  showTimeSelect={dataType === 'datetime'}
                  dateFormat={dataType === 'datetime' ? 'Pp' : 'P'}
                  placeholderText="End Date"
                  isClearable
                /> */}

                <input
                  type="date"
                  className="DatePicker-custom"
                  value={filters[column]?.value?.startDate ? filters[column]?.value?.startDate.toISOString().split("T")[0] : ""}
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
                  value={filters[column]?.value?.endDate ? filters[column]?.value?.endDate.toISOString().split("T")[0] : ""}
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
                value={filters[column]?.value ? filters[column]?.value.toISOString().split("T")[0] : ""}
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
          <select className="search-input2" onChange={(e) => handleFilterInputChange(column, e.target.value)}>
            <option value="">Select</option>
            {distinctValues.map((val: any, idx: number) => (
              <option key={idx} value={val}>
                {val ? 'Yes' : 'No'}
              </option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };


  const handleFilterConditionChange = (column: string, condition: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [column]: {
        ...prevFilters[column],
        condition: condition,
      },
    }));
  };

  const handleFilterInputChange = (column: string, value: any) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [column]: {
        ...prevFilters[column],
        value: value,
      },
    }));
  };

  const handlefiltersearch = () => {
    let filteredData = data;

    Object.keys(filters).forEach((column) => {
      const { condition, value } = filters[column];

      if (value) {
        filteredData = filteredData.filter((row: any) => {
          const cellValue = row[column];

          if (!cellValue) return condition === 'isempty'; // Handle empty check early

          if (!isNaN(cellValue)) {
            // Number filtering
            const numValue = Number(cellValue);

            switch (condition) {
              case 'greaterthan':
                return numValue > Number(value);
              case 'greaterthanequal':
                return numValue >= Number(value);
              case 'lessthan':
                return numValue < Number(value);
              case 'lessthanequal':
                return numValue <= Number(value);
              case 'between':
                return (
                  Number(value.min) <= numValue &&
                  numValue <= Number(value.max)
                );
              default:
                return true;
            }
          } else {
            // Date filtering
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
        });
      }
    });

    setSortedData(filteredData);
    setCurrentPage(1); // Reset pagination
  };

  const handleclearfilter = () => {
    setFilters({
      filter: { condition: '', value: '' }
    });
    handlefiltersearch();
  };

  const handleDelete = (id: number) => {
    setSortedData((prevData: any) => prevData.filter((item: any) => item.id !== id));
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

  const handleEditableInput = (ColumnHeader: string, value: any) => {
    const updatedData = sortedData.map((row) => {
      if (row.id === editCell?.rowId) {
        return { ...row, [ColumnHeader]: value };
      }
      return row;
    });
    setSortedData(updatedData);
    setEditCell(null)
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const CustomInput = ({ value, onClick }: any) => (
    <div className="custom-date-picker" onClick={onClick}>
      <input value={value} readOnly placeholder="Select" />
      <FaCalendar />
    </div>
  );

  return (
    <div className="card" style={{ background: "#fcfefe" }}>

      {/* ///////////////////////////////////////////////////// */}

      {showActionPopup.Add && (
        <div style={styles.overlay}
          onClick={(e: any) => {
            if (e.target === e.currentTarget) {
              handleActionAddButtonclose();
            }
          }}>
          <div style={styles.popup} onClick={(e) => e.stopPropagation()} >

            <div className="column-inputs-container" style={{ marginTop: '2px' }}>
              <span className='popup-ActionTitle'>Add New :</span>
              <hr></hr>
              <div className='popup-mainconatiner' >
                {listViewColumns.map((col: any, index: number) => (
                  <div key={index} className='popup-inner-container'>
                    <label htmlFor={`input-${col.ColumnHeader}`} className='popup-ActionLabel'>
                      {col.ColumnHeader}
                    </label>
                    <input
                      id={`input-${col.ColumnHeader}`}
                      type="text"
                      value={inputValues[col.ColumnHeader] || ''}
                      onChange={(e) => handleInputChange(col.ColumnHeader, e.target.value)}
                      placeholder={`${col.ColumnHeader}`}
                      className='popup-ActionInput'
                    />
                  </div>
                ))}
              </div>
              <div style={{ float: 'right' }}>
                <button onClick={handleActionAddButtonclose} className='popup-ActionButton'>
                  Close
                </button>
                <button onClick={handleAddSubmit} style={{ marginLeft: 10 }} className='popup-ActionButton'>
                  Submit
                </button>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ///////////////////////////////////////////////////// */}

      {showActionPopup.Edit && (
        <div style={styles.overlay} onClick={(e: any) => {
          if (e.target === e.currentTarget) {
            handleActionEditButtonclose();
          }
        }}>
          <div style={styles.popup} onClick={(e: any) => e.stopPropagation()} >

            <div className="column-inputs-container" style={{ marginTop: '2px' }}>
              <span className='popup-ActionTitle'>Edit Record:</span>
              <hr />
              <div className='popup-mainconatiner' >
                {listViewColumns.map((col: any, index: number) => (
                  <div key={index} className='popup-inner-container'>
                    <label htmlFor={`input-${col.ColumnHeader}`} className='popup-ActionLabel'>
                      {col.ColumnHeader}
                    </label>
                    <input
                      id={`input-${col.ColumnHeader}`}
                      type="text"
                      value={inputValues[col.ColumnHeader] || ''}
                      onChange={(e) => handleInputChange(col.ColumnHeader, e.target.value)}
                      placeholder={` ${col.ColumnHeader}`}
                      className='popup-ActionInput'
                    />
                  </div>
                ))}
              </div>
              <div style={{ float: 'right' }}>
                <button
                  onClick={handleActionEditButtonclose} className='popup-ActionButton'
                >
                  Close
                </button>
                <button
                  onClick={handleEditSubmit} className='popup-ActionButton' style={{ marginLeft: 10 }}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ///////////////////////////////////////////////////// */}

      {showActionPopup.Delete && (
        <div style={styles.overlay}
          onClick={(e: any) => {
            if (e.target === e.currentTarget) {
              handleActionDeleteButtonClose();
            }
          }}>
          <div style={styles.deletePopup} onClick={(e: any) => e.stopPropagation()} >
            <div className="column-inputs-container" style={{ marginTop: '2px' }}>
              <span className='popup-ActionTitle'>Are you sure you want to delete this item ?</span>

              <div style={{ display: "flex", justifyContent: "end" }}>
                <button onClick={handleActionDeleteButtonClose} className='popup-ActionButton'>
                  Close
                </button>
                <button style={{ marginLeft: 10 }} className='popup-ActionButton' onClick={() => {
                  selectedRows.forEach((id) => handleDelete(id));
                }} >
                  Submit
                </button>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ///////////////////////////////////////////////////// */}
      <div className="grid-main-container">
        <div className="headingbox">
          <span style={{ color: "#085a99" }}
            className='table-title'><h2>{title}</h2></span>
          <div className="actions-container">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            <div className="buttons headerbuttons">
              {buttonSetting.ButtonAction.includes('Add') && buttonSetting.IsButtonVisible.Add && (
                <button className='table-actionbtn'
                  disabled={!buttonSetting.IsButtonEnabled.Add}
                  onClick={handleActionAddButton}
                  title='Add'>
                  <IoMdAdd />
                </button>
              )}

              {buttonSetting.ButtonAction.includes('Edit') && buttonSetting.IsButtonVisible.Edit && (
                <button className='table-actionbtn'
                  disabled={!isAnyRowSelected || !buttonSetting.IsButtonEnabled.Edit || selectedRows.length > 1}
                  title='Edit'
                  onClick={handleActionEditButton}>
                  <CiEdit />
                </button>
              )}

              {buttonSetting.ButtonAction.includes('Delete') && buttonSetting.IsButtonVisible.Delete && (
                <button className='table-actionbtn'
                  disabled={!isAnyRowSelected || !buttonSetting.IsButtonEnabled.Delete}
                  title='Delete'
                  onClick={handleActionDeleteButton}>
                  <AiOutlineDelete />
                </button>
              )}

              {buttonSetting.ButtonAction.includes('CSV') && buttonSetting.IsButtonVisible.CSV && (
                <button className="table-actionbtn"
                  onClick={exportToCSV}
                  disabled={!buttonSetting.IsButtonEnabled.CSV}
                  title='CSV'>
                  <BsFiletypeCsv />
                </button>
              )}

              {buttonSetting.ButtonAction.includes('XLSX') && buttonSetting.IsButtonVisible.XLSX && (
                <button className="table-actionbtn"
                  onClick={exportToExcel}
                  disabled={!buttonSetting.IsButtonEnabled.XLSX}
                  title='XLSX'>
                  <BsFiletypeXls />
                </button>
              )}

              {buttonSetting.ButtonAction.includes('PDF') && buttonSetting.IsButtonVisible.PDF && (
                <button className="table-actionbtn"
                  onClick={exportToPDF}
                  disabled={!buttonSetting.IsButtonEnabled.PDF}
                  title='PDF'>
                  <BsFiletypePdf />
                </button>
              )}


              <div style={{ position: 'relative', display: 'inline-block' }}>
                {buttonSetting.ButtonAction.includes('PDF') && buttonSetting.IsButtonVisible.ShowHideColumns && (
                  <button onClick={handlecolumnvisiblepopup} className='table-actionbtn' disabled={!buttonSetting.IsButtonEnabled.ShowHideColumns} title='ShowHideColumns' >&#9776;</button>
                )}
                {showColumnVisiblePopUp &&
                  <div ref={popupColumnRef} className="column-visibility" style={{ padding: "10px 0px" }}>
                    <div className='inner-column-visibility' style={{ maxheight: "255px", overflowY: "scroll" }}>

                      {listViewColumns.map((col: any, index: number) => (
                        <div key={index} className="checkbox-container" style={{ fontSize: 13 }}>
                          <input
                            type="checkbox"
                            id={`checkbox-${index}`}
                            checked={visibleColumns.find((visibleCol: any) => visibleCol.ColumnHeader === col.ColumnHeader)?.isVisible}
                            onChange={() => handleColumnVisibilityChange(col.ColumnHeader)}
                          />
                          <label htmlFor={`checkbox-${index}`}>{col.ColumnHeader}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
        <div className='form-group' style={{ background: "white", border: "1px solid #bab9b9", overflow: 'hidden' }} ref={filterDropdownRef}>
          <div classname="clsmainheaderrow" style={{ overflowY: 'auto', position: 'relative' }}>
            <table cellPadding="5" style={{ borderCollapse: 'collapse' }} className="custom-grid">
              <thead style={{ top: 0, zIndex: 10, background: 'white' }} className="custom-grid-header">
                <tr>
                  <th
                    style={{ width: 25, whiteSpace: 'nowrap', position: "sticky", top: "-2px", zIndex: 111 }}
                    className="sticky-column">
                    <input
                      type="checkbox"
                      checked={isSelectAllChecked}
                      onChange={handleSelectAllChange}
                    />
                  </th>
                  {visibleColumns
                    .filter((col: any) => col.isVisible)
                    .sort((a, b) => a.ColumnOrder - b.ColumnOrder)
                    .map((col: any) => (
                      <th
                        className='th-tab'
                        style={{ textAlign: "left", whiteSpace: 'nowrap', position: "sticky", top: "-2px" }}
                        key={col.ColumnHeader}>
                        {col.ColumnHeader}
                        <div style={{ position: 'relative', display: 'inline-block', float: 'right' }}>
                          <button className="btnsort" onClick={() => handleSortClick(col.ColumnHeader)}> ⇅ </button>
                          <button className='btnfilter' onClick={() => handleFilterClick(col.ColumnHeader)}>&#8942; </button>

                          {columnFilterVisible === col.ColumnHeader && (
                            <div className="column-visibilityy">
                              <div className="search-bar2" style={{ margin: "5px" }}>
                                <div ref={filterDropdownRef} className="filter-dropdown ">
                                  <div className="select-container">
                                    <select
                                      onChange={(e) => handleFilterConditionChange(col.ColumnHeader, e.target.value)}
                                      className="autocomplete-input2"
                                    >
                                      <option value="" disabled selected>Select Filter</option>
                                      {renderFilterOptions(col.DataType)}
                                    </select>
                                  </div>

                                  {renderFilterInput(col.DataType, col.ColumnHeader)}

                                  <button className="search-button" style={{ color: "black", backgroundColor: "white", fontSize: 17 }}
                                    onClick={() => {
                                      handleclearfilter();
                                      handleclearfilter();
                                    }}>
                                    ⟲
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="custom-grid-body">
                {paginatedData.map((row: any, index: number) => (
                  <tr key={row.id} className={index % 2 === 0 ? 'stripedRow' : 'table-row'}>
                    <td className="sticky-column">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => handleCheckboxChange(row.id)}
                      />
                    </td>
                    {visibleColumns
                      .filter((col: any) => col.isVisible)
                      .sort((a, b) => a.ColumnOrder - b.ColumnOrder)
                      .map((col: any) => (
                        <td

                          key={col.ColumnHeader}
                          style={{ textAlign: col.Alignment }}
                        key={col.ColumnHeader}
                        style={{ textAlign: col.Alignment }}

                          onDoubleClick={() => col.isEditable && handleDoubleClick(row.id, col.ColumnHeader)}
                        >
{console.log("chckdata", row[col.ColumnHeader] )}

                          {editCell?.rowId === row.id && col.DataType == "string" &&
                            editCell?.ColumnHeader === col.ColumnHeader ? (
                            <input
                              type="text"
                              defaultValue={row[col.ColumnHeader]}
                              className="editable-input"
                              onBlur={(e: any) => handleEditableInput(col.ColumnHeader, e.target.value)}
                              onKeyDown={(e: any) => {
                                if (e.key == "Enter") {
                                  handleEditableInput(col.ColumnHeader, e.target.value);
                                }
                              }}
                            />
                          ) : editCell?.rowId === row.id && col.DataType == "date" &&
                            editCell?.ColumnHeader === col.ColumnHeader ? (
                              <input
                              type="date"
                              defaultValue={new Date(row[col.ColumnHeader]).toISOString().split("T")[0]} 
                              className="editable-input"
                              onBlur={(e: any) => handleEditableInput(col.ColumnHeader, e.target.value)}
                              onKeyDown={(e: any) => {
                                if (e.key === "Enter") {
                                  handleEditableInput(col.ColumnHeader, e.target.value);
                                }
                              }}
                            />
                          )
                            :
                            (
                              <>  {row[col.ColumnHeader]}  </>
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
              <span>Total Records: {data.length}</span> &nbsp;&nbsp;&nbsp;
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
                <BiFirstPage />
              </button>
              <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
                🡄
              </button>

              <span>Page {currentPage} - {totalPages}</span>

              <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
                🡆
              </button>
              <button disabled={currentPage === totalPages} onClick={() => handlePageChange(totalPages)}>
                <BiLastPage />
              </button>
            </div>
          </div>
        </div>
      </div>

    </div >
  );
};
export default CustomDataGrid;