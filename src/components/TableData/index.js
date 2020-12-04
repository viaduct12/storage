import React from 'react';
import './style.css'

const TableData = (props) => {
  const { header, tableData } = props;
  let tableValue = tableData[header] !== undefined ? tableData[header] : '';
  return (
        <td className='tData'>{tableValue}</td>
    )
}

export default TableData;