import React from 'react';
import TableData from '../TableData';
import './style.css'
const Table = (props) => {

  const { headers, tabData } = props;

  return (
    <div>
      <table>
        <thead>
          <tr>
            {headers.map(header => {
              return (
                <th>{header}</th>
              )
            })}
          </tr>
        </thead>
        {tabData.map(tab => {
          return (
            <tr>
              {headers.map(header => {
                return (
                  <TableData header={header} tableData={tab} />
                )
              })}
            </tr>

          )
        })}
      </table>
    </div>

  )
}

export default Table;