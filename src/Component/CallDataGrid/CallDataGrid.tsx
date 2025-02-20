import React, { useState } from 'react';
import CustomDataGrid from '../CustomComponent/CustomDataGrid.tsx';
import {title,settings,listViewColumns,tableData} from './Data/Data.ts';

export default function CallDataGrid() {
  return (
    <>
      <div style={{width:'100vw',height:'100vh'}}>
        <CustomDataGrid
          title={title}
          settings={settings}
          listViewColumns={listViewColumns}
          data={tableData}
        />
      </div>
    </>
  );
}