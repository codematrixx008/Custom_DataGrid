import React from 'react';
import './App.css';
import CallDataGrid from './Component/CallDataGrid/CallDataGrid.tsx';
import CustomComponent from './Component/CustomComponent2/CustomComponent.tsx';
// import { columns, rows } from "./Component/CustomComponent2/Data.ts";
import './Component/CustomComponent2/Style.css';


function App() {
  return (
    <div className="App">
     <CallDataGrid/>
     {/* <CustomComponent columns={columns} rows={rows} /> */}
    </div>
  );
}

export default App;
