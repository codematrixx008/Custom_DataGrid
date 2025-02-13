import React, { useState } from 'react';
import CustomDataGrid from '../CustomComponent/CustomDataGrid.tsx';
import {title,buttonSetting,listViewColumns,tableData} from './Data/Data.ts';

export default function CallDataGrid() {
  return (
    <>
      <div style={{width:'100%',height:'600px'}}>
        <CustomDataGrid
          title={title}
          buttonSetting={buttonSetting}
          listViewColumns={listViewColumns}
          data={tableData}
        />
      </div>
    </>
  );
}