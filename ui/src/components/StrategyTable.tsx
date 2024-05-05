import React, { useState } from "react";
import { StrategyData } from "../types/Backtesting";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
  IconButton,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router";
import { FaArrowRight, FaCheckDouble } from "react-icons/fa";
import "./StrategyTable.scss";

type SortDirection = "asc" | "desc";

interface Header {
  name: string;
  align: "left" | "right";
  accessor?: keyof StrategyData;
  width: string;
  suffix?: string;
}

function StrategyTable({ strategies }: { strategies: StrategyData[] }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof StrategyData | "">("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (field: keyof StrategyData) => {
    const isAsc = sortField === field && sortDirection === "asc";
    setSortField(field);
    setSortDirection(isAsc ? "desc" : "asc");
  };

  const sortedData = [...strategies].sort((a, b) => {
    if (sortField) {
      if (a[sortField] < b[sortField]) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (a[sortField] > b[sortField]) {
        return sortDirection === "asc" ? 1 : -1;
      }
    }
    return 0;
  });

  const navigate = useNavigate();

  const headers: Header[] = [
    {
      name: "Name",
      align: "left",
      accessor: "name",
      width: "200px",
    },
    {
      name: "Indicators",
      align: "left",
      accessor: "indicators",
      width: "400px",
    },
    {
      name: "Description",
      align: "left",
      accessor: "description",
      width: "600px",
    },
    {
      name: "Actions",
      align: "right",
      width: "100px",
    },
  ];

  const colors = ['primary', 'secondary', 'success', 'error', 'warning', 'info'];

  return (
    <Paper style={{ overflow: "hidden" }}>
      <TableContainer style={{ maxHeight: 590, maxWidth: 1600 }}>
        <Table size="medium" style={{ width: '100%' }} stickyHeader>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell
                  align={header.align as any}
                  width={header.width}
                  style={{
                    width: header.width,
                  }}
                >
                  {header.accessor ? (
                    <TableSortLabel
                      active={sortField === header.accessor}
                      direction={
                        sortField === header.accessor ? sortDirection : "asc"
                      }
                      onClick={() =>
                        handleSort(header.accessor! as keyof StrategyData)
                      }
                    >
                      {header.name}
                    </TableSortLabel>
                  ) : (
                    header.name
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? sortedData.slice(
                  page * rowsPerPage,
                  page * rowsPerPage + rowsPerPage
                )
              : sortedData
            ).map((row) => (
              <TableRow key={row.name}>
                {headers.map((header) => (
                  <TableCell
                    align={header.align as any}
                    width={header.width}
                    style={{
                      minWidth: header.width,
                      maxWidth: header.width,
                      width: header.width,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {header.name === "Actions" ? (
                      <div className="action-buttons">
                        <IconButton 
                          size="small"
                          color="secondary"
                          title="Backtest"
                          disabled
                        >
                          <FaCheckDouble />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          title="Details"
                          onClick={() => navigate(`/strategies/${row.uid}`)}
                        >
                          <FaArrowRight />
                        </IconButton>
                      </div>
                    ) : header.name === "Indicators" ? (
                      <div className="indicators">
                        {row.indicators.map((indicator, index) => (
                          <Chip key={indicator} className="indicator" label={indicator} color={colors[index % colors.length] as any} />
                        ))}
                      </div>
                    ) : (
                      ` ${row[header.accessor! as keyof StrategyData]} ${
                        header.suffix || ""
                      }`
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100, { label: "All", value: -1 }]}
        component="div"
        count={strategies.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

export default StrategyTable;
