import React, { useEffect, useState } from "react";
import { StrategyPerformance } from "../types/Backtesting";
import { getStrategyPerformance } from "../services/ApiService";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, TableSortLabel } from '@mui/material';

type SortDirection = 'asc' | 'desc';

interface Header {
  name: string;
  align: 'left' | 'right';
  accessor: keyof StrategyPerformance;
  width: string;
  suffix?: string;
}

function StrategyPerformanceTable({ selectedUid }: {selectedUid: string}) {
  const [data, setData] = useState<StrategyPerformance[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof StrategyPerformance | ''>('');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    getStrategyPerformance(selectedUid).then((data) => setData(data));
  }, [selectedUid]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (field: keyof StrategyPerformance) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortField(field);
    setSortDirection(isAsc ? 'desc' : 'asc');
  };

  const sortedData = [...data].sort((a, b) => {
    if (sortField) {
      if (a[sortField] < b[sortField]) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (a[sortField] > b[sortField]) {
        return sortDirection === 'asc' ? 1 : -1;
      }
    }
    return 0;
  });

  const headers: Header[] = [
    { name: 'Strategy Name', align: 'left', accessor: 'strategyName', width: '10%' },
    { name: 'Wins', align: 'right', accessor: 'wins', width: '10%' },
    { name: 'Losses', align: 'right', accessor: 'losses', width: '10%' },
    { name: 'Draws', align: 'right', accessor: 'draws', width: '10%' },
    { name: 'Trade Per Day', align: 'right', accessor: 'tradePerDay', width: '10%' },
    { name: 'Total Trades', align: 'right', accessor: 'totalTrades', width: '10%' },
    { name: 'Profit', align: 'right', accessor: 'profit', width: '10%', suffix: '$' },
    { name: 'Final Balance', align: 'right', accessor: 'finalBalance', width: '10%', suffix: '$' },
    { name: 'Max Drawdown', align: 'right', accessor: 'maxDrawdown', width: '10%' },
    { name: 'Profit Percent', align: 'right', accessor: 'profitPercent', width: '10%', suffix: '%' },
  ];

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 590 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell align={header.align as any} style={{ width: header.width }}>
                  <TableSortLabel
                    active={sortField === header.accessor}
                    direction={sortField === header.accessor ? sortDirection : 'asc'}
                    onClick={() => handleSort(header.accessor)}
                  >
                    {header.name}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : sortedData
            ).map((row) => (
              <TableRow key={row.strategyName}>
                {headers.map((header) => (
                  <TableCell align={header.align as any} style={{ width: header.width }}>{row[header.accessor]}{header.suffix || ''}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100, { label: 'All', value: -1 }]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

export default StrategyPerformanceTable;