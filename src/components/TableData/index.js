import React from 'react';
import './style.css'

const TableData = (props) => {
  const { header, tableData } = props;
  // console.log(tableData, header);
  let tableValue = tableData[header] !== undefined ? tableData[header] : '';
  // console.log(tableValue, 'table value');
  return (
        <td className='tData'>{tableValue}</td>
    )
}

export default TableData;