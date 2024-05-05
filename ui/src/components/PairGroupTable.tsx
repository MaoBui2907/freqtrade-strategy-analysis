import React, { useState } from "react";
import { PairGroupData } from "../types/Backtesting";
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
  Tooltip,
} from "@mui/material";
import { FaCheckDouble, FaStar, FaTrash } from "react-icons/fa";
import "./StrategyTable.scss";

type SortDirection = "asc" | "desc";

interface Header {
  name: string;
  align: "left" | "right";
  accessor?: keyof PairGroupData;
  width: string;
  suffix?: string;
}

function PairGroupTable({ pairGroups, handleDeleteGroup }: { pairGroups: PairGroupData[], handleDeleteGroup: (uid: string) =>  Promise<any>}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof PairGroupData | "">("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isPerformingAction, setIsPerformingAction] = useState(false);
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (field: keyof PairGroupData) => {
    const isAsc = sortField === field && sortDirection === "asc";
    setSortField(field);
    setSortDirection(isAsc ? "desc" : "asc");
  };

  const handleDeleteGroupButton = (uid: string) => {
    setIsPerformingAction(true);
    handleDeleteGroup(uid).then(() => {setIsPerformingAction(false);});
  };

  const sortedData = [...pairGroups].sort((a, b) => {
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

  const headers: Header[] = [
    {
      name: "Name",
      align: "left",
      accessor: "name",
      width: "250px",
    },
    {
      name: "Pairs",
      align: "left",
      accessor: "pairs",
      width: "500px",
    },
    {
      name: "Description",
      align: "left",
      accessor: "description",
      width: "auto",
    },
    {
      name: "Actions",
      align: "right",
      width: "85px",
    },
  ];

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: 590 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell
                  align={header.align as any}
                  style={{ width: header.width }}
                >
                  {header.accessor ? (
                    <TableSortLabel
                      active={sortField === header.accessor}
                      direction={
                        sortField === header.accessor ? sortDirection : "asc"
                      }
                      onClick={() =>
                        handleSort(header.accessor! as keyof PairGroupData)
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
              <TableRow key={row.uid}>
                {headers.map((header) => (
                  <TableCell
                    align={header.align as any}
                    style={{ 
                      width: header.width,
                      maxWidth: header.width,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    { header.name === "Actions" ? (
                      <div className="action-buttons">
                        <IconButton title="Favorite" disabled={true || isPerformingAction} size="small" color="info">
                          <FaStar />
                        </IconButton>
                        <IconButton title="Backtesting" disabled={true || isPerformingAction} size="small" color="primary">
                          <FaCheckDouble />
                        </IconButton>
                        <IconButton title="Delete" disabled={true || isPerformingAction} size="small" color="error" onClick={() => handleDeleteGroupButton(row.uid)}>
                          <FaTrash />
                        </IconButton>
                      </div>
                    ) : (header.accessor === 'pairs' ? (
                      (row[header.accessor as keyof PairGroupData] as string[]).map((pair, index) => (
                        <Chip key={index} label={pair} variant="outlined" size="small" style={{margin: '2px'}} />
                      ))
                    ) : (
                      ` ${row[header.accessor! as keyof PairGroupData] || ''} ${ header.suffix || "" }`
                    ))}
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
        count={pairGroups.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

export default PairGroupTable;
