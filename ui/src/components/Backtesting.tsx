// Backtesting.tsx
import { useEffect, useState } from "react";
import {
  BacktestingData,
  PairGroupData,
  StrategyGroupData,
  Timeframe,
} from "../types/Backtesting";
import {
  getBacktestings,
  getPairGroups,
  createBacktesting,
  getStrategyGroups,
} from "../services/ApiService";
import {
  TextField,
  Autocomplete,
  Card,
  Grid,
  Button,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  Box,
  Chip,
  MenuItem,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import "./Backtesting.scss";
import StrategyPerformanceTable from "./StrategyPerformanceTable";
import { FaPlus } from "react-icons/fa";
import { format } from "date-fns";

function EditBactestingDialog({
  pairGroups,
  strategyGroups,
  onSave,
  onCancel,
}: {
  pairGroups: PairGroupData[];
  strategyGroups: StrategyGroupData[];
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const pairGroupOptions = pairGroups.map((item) => ({
    uid: item.uid,
    name: item.name,
  }));
  const strategyGroupOptions = strategyGroups.map((item) => ({
    uid: item.uid,
    name: item.name
  }));
  const timeframeOptions = [{
    uid: Timeframe.M1,
    name: "1 Minute"
  }, {
    uid: Timeframe.M5,
    name: "5 Minutes"
  }, {
    uid: Timeframe.M15,
    name: "15 Minutes"
  }, {
    uid: Timeframe.M30,
    name: "30 Minutes"
  }, {
    uid: Timeframe.H1,
    name: "1 Hour"
  }, {
    uid: Timeframe.H4,
    name: "4 Hours"
  }, {
    uid: Timeframe.H8,
    name: "8 Hours"
  }, {
    uid: Timeframe.D1,
    name: "1 Day"
  }];
  const [backtesting, setBacktesting] = useState<BacktestingData>({
    uid: "",
    name: "",
    pairGroup: "",
    startDate: new Date(),
    status: "pending",
    endDate: new Date(),
    strategyGroup: "",
    timeframe: Timeframe.M5,
  });
  const isBacktestingValid = () => {
    return (
      backtesting.name &&
      backtesting.pairGroup &&
      backtesting.startDate &&
      backtesting.endDate &&
      backtesting.strategyGroup
    );
  };

  return (
    <div className="edit-backtesting-dialog">
      <div className="edit-backtesting-dialog-title">
        <Grid container spacing={2} justifyContent="space-between">
          <Grid item>
            <h2>Edit Backtesting</h2>
          </Grid>
        </Grid>
      </div>

      <div className="edit-backtesting-dialog-content">
        <Grid container spacing={2}>
          <Grid item xs={8}>
            <TextField
              required
              size="small"
              fullWidth
              label="Backtesting Name"
              value={backtesting.name}
              onChange={(event) => {
                setBacktesting({ ...backtesting, name: event.target.value });
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <Autocomplete
              size="small"
              style={{ width: "100%" }}
              options={pairGroupOptions}
              getOptionLabel={(option) => option.name}
              value={
                pairGroupOptions.find(
                  (item) => item.uid === backtesting.pairGroup
                ) || null
              }
              onChange={(event, newValue) => {
                setBacktesting({
                  ...backtesting,
                  pairGroup: newValue?.uid || "",
                });
              }}
              renderInput={(params) => (
                <TextField {...params} label="Pair Group" required />
              )}
            />
          </Grid>
          <Grid item xs={4}>
            <Autocomplete
              size="small"
              style={{ width: "100%" }}
              options={timeframeOptions}
              getOptionLabel={(option) => option.name}
              value={
                timeframeOptions.find(
                  (item) => item.uid === backtesting.timeframe
                ) || null
              }
              onChange={(event, newValue) => {
                setBacktesting({
                  ...backtesting,
                  timeframe: newValue?.uid || Timeframe.M5,
                });
              }}
              renderInput={(params) => (
                <TextField {...params} label="Timeframe" required />
              )}
            />
          </Grid>
          <Grid item xs={8}>
              <Autocomplete 
                size="small"
                style={{ width: "100%" }}
                options={strategyGroupOptions}
                getOptionLabel={(option) => option.name}
                value={
                  strategyGroupOptions.find(
                    (item) => item.uid === backtesting.strategyGroup
                  ) || null
                }
                onChange={(event, newValue) => {
                  setBacktesting({
                    ...backtesting,
                    strategyGroup: newValue?.uid || ''
                  })
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Strategy Group" required />
                )}
              />
          </Grid>
          <Grid item xs={6}>
            <DatePicker
              label="Start Date"
              slotProps={{
                textField: { size: "small", fullWidth: true, required: true },
              }}
              onChange={(date) => {
                setBacktesting({
                  ...backtesting,
                  startDate: date || new Date(),
                });
              }}
              value={backtesting.startDate}
            />
          </Grid>
          <Grid item xs={6}>
            <DatePicker
              label="End Date"
              slotProps={{
                textField: { size: "small", fullWidth: true, required: true },
              }}
              onChange={(date) => {
                setBacktesting({
                  ...backtesting,
                  endDate: date || new Date(),
                });
              }}
              value={backtesting.endDate}
            />
          </Grid>
        </Grid>
      </div>

      <div className="edit-backtesting-dialog-actions">
        <Grid container spacing={2} justifyContent="flex-end">
          <Grid item>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => onSave(backtesting)}
              disabled={ !isBacktestingValid() }
            >
              Save
            </Button>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

function Backtesting() {
  const [data, setData] = useState<BacktestingData[]>([]);
  const [selectedBacktesting, setSelectedBacktesting] =
    useState<BacktestingData | null>(null);
  const [pairGroups, setPairGroups] = useState<PairGroupData[]>([]);
  const [strategyGroups, setStrategyGroups] = useState<StrategyGroupData[]>([])

  useEffect(() => {
    getBacktestings().then((data) => setData(data));
    getPairGroups().then((data) => setPairGroups(data));
    getStrategyGroups().then((data) => setStrategyGroups(data))
  }, []);

  const backtestingOptions = data.map((item) => ({
    uid: item.uid,
    name: `${item.name}`,
    status: item.status,
    timeRange: `${format(new Date(item.startDate), 'dd/MM/yy')} - ${format(new Date(item.endDate), 'dd/MM/yy')}`,
  }));

  console.log(backtestingOptions);

  const pairGroupOptions = pairGroups.map((item) => ({
    uid: item.uid,
    name: item.name,
  }));

  const statusColors: { [key: string]: string } = {
    "pending": "warning",
    "processing": "info",
    "completed": "success",
    "failed": "error",
  }

  const statusOptions = [
    { uid: "pending", name: "Pending" },
    { uid: "processing", name: "Processing" },
    { uid: "completed", name: "Completed" },
    { uid: "failed", name: "Failed" },
  ]

  const startDate = selectedBacktesting?.startDate
    ? new Date(selectedBacktesting.startDate)
    : null;
  const endDate = selectedBacktesting?.endDate
    ? new Date(selectedBacktesting.endDate)
    : null;

  const handleClickAddBacktesting = () => {
    setOpen(true);
  };

  const [open, setOpen] = useState(false);

  const handleClickCloseAddBacktesting = () => {
    setOpen(false);
  };

  const handleClickSaveBacktesting = (data: BacktestingData) => {
    createBacktesting(data).then(() => {
      getBacktestings().then((data) => {
        setData(data)
        setOpen(false)
      });
    });
  };

  return (
    <div className="backtesting">
      <Dialog open={open} onClose={handleClickCloseAddBacktesting}>
        <EditBactestingDialog
          strategyGroups={strategyGroups}
          pairGroups={pairGroups}
          onCancel={handleClickCloseAddBacktesting}
          onSave={handleClickSaveBacktesting}
        />
      </Dialog>
      <Card className="backtesting-control">
        <Grid container spacing={2} alignItems="top">
          <Grid item xs={3}>
            <Autocomplete
              size="small"
              style={{ width: "100%" }}
              id="backtesting-select"
              options={backtestingOptions}
              getOptionLabel={(option) => (option.name)}
              onChange={(event, newValue) => {
                const selectedOption = data.find(
                  (item) => item.uid === newValue?.uid
                );
                setSelectedBacktesting(selectedOption || null);
              }}
              renderInput={(params) => (
                <TextField {...params} label="Backtesting" />
              )}
              renderOption={(props, option) => {
                return (<Box
                  key={option.uid}
                  component="li"
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    overflow: 'hidden',
                    maxHeight: '40px',
                    maxWidth: '500px',
                  }}
                  {...props}
                >
                  <Box sx={{flexGrow: 1, marginRight: '4px'}}>
                    {option.name} ({option.timeRange})
                  </Box> &nbsp;
                  <Chip key={option.uid} size='small' sx={{ fontSize: '0.8rem' }} variant="outlined" label={option.status} color={statusColors[option.status] as any} />
                </Box>)
              }}
              componentsProps={{
                popper: {
                  style: {
                    width: "fit-content",
                  }
                }
              }}
            />
          </Grid>
          <Grid item xs={1}>
              <Button
                color={statusColors[selectedBacktesting?.status || "pending"] as any}
                sx={{
                  ':hover': {
                    backgroundColor: 'transparent',
                  },
                  ':focus': {
                    backgroundColor: 'transparent',
                  }, 
                  paddingTop: '10px',
                  paddingLeft: '0px',
                }}
              >
                {selectedBacktesting?.status || "Status"}
              </Button>
          </Grid>
          <Grid item xs={1.75}>
            <DatePicker
              label="Start Date"
              value={startDate as null | undefined}
              slotProps={{ textField: { size: "small", fullWidth: true } }}
              onChange={(date) => {}}
              disabled
            />
          </Grid>
          <Grid item xs={1.75}>
            <DatePicker
              label="End Date"
              value={endDate as null | undefined}
              slotProps={{ textField: { size: "small", fullWidth: true } }}
              onChange={(date) => {}}
              disabled
            />
          </Grid>
          
          <Grid item xs={1.75}>
            <FormControl fullWidth>
              <InputLabel id="strategy-group-label">Strategy Group</InputLabel>
              <Select
                labelId="strategy-group-label"
                size="small"
                label="Strategy Group"
                value={selectedBacktesting?.strategyGroup || ""}
                onChange={(event) => {}}
                disabled
              >
                {strategyGroups.map((option) => (
                  <option key={option.uid} value={option.uid}>
                    {option.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={1.75}>
            <FormControl fullWidth>
              <InputLabel id="pair-group-label">Pair Group</InputLabel>
              <Select
                labelId="pair-group-label"
                size="small"
                label="Pair Group"
                value={selectedBacktesting?.pairGroup || ""}
                onChange={(event) => {}}
                disabled
              >
                {pairGroupOptions.map((option) => (
                  <option key={option.uid} value={option.uid}>
                    {option.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={1}>
            <Button
              variant="outlined"
              color="primary"
              sx={{
                height: "40px",
                transform: "none",
              }}
              size="small"
              startIcon={<FaPlus />}
              onClick={handleClickAddBacktesting}
            >
              {" "}
              Backtesting
            </Button>
          </Grid>
        </Grid>
      </Card>
      {selectedBacktesting ? (
        <Card className="backtesting-result">
          <StrategyPerformanceTable selectedUid={selectedBacktesting.uid} />
        </Card>
      ) : (
        <p>Please select a backtesting option.</p>
      )}
    </div>
  );
}

export default Backtesting;
