// Backtesting.tsx
import { useEffect, useState } from "react";
import {
  BacktestingData,
  PairGroupData,
  StrategyData,
  Timeframe,
} from "../types/Backtesting";
import {
  getBacktestings,
  getPairGroups,
  createBacktesting,
  getStrategies,
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
  strategies,
  onSave,
  onCancel,
}: {
  pairGroups: PairGroupData[];
  strategies: StrategyData[];
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const pairGroupOptions = pairGroups.map((item) => ({
    id: item.id,
    name: item.name,
  }));
  const strategyOptions = strategies.map((item) => ({
    id: item.id,
    name: item.name
  }));
  const timeframeOptions = [{
    id: Timeframe.M1,
    name: "1 Minute"
  }, {
    id: Timeframe.M5,
    name: "5 Minutes"
  }, {
    id: Timeframe.M15,
    name: "15 Minutes"
  }, {
    id: Timeframe.M30,
    name: "30 Minutes"
  }, {
    id: Timeframe.H1,
    name: "1 Hour"
  }, {
    id: Timeframe.H4,
    name: "4 Hours"
  }, {
    id: Timeframe.H8,
    name: "8 Hours"
  }, {
    id: Timeframe.D1,
    name: "1 Day"
  }];
  const [backtesting, setBacktesting] = useState<BacktestingData>({
    uid: "",
    name: "",
    pairGroup: "",
    startDate: new Date(),
    status: "pending",
    endDate: new Date(),
    strategy: "",
    timeframe: Timeframe.M5,
  });
  const isBacktestingValid = () => {
    return (
      backtesting.name &&
      backtesting.pairGroup &&
      backtesting.startDate &&
      backtesting.endDate &&
      backtesting.strategy
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
                  (item) => item.id === backtesting.pairGroup
                ) || null
              }
              onChange={(event, newValue) => {
                setBacktesting({
                  ...backtesting,
                  pairGroup: newValue?.id || "",
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
                  (item) => item.id === backtesting.timeframe
                ) || null
              }
              onChange={(event, newValue) => {
                setBacktesting({
                  ...backtesting,
                  timeframe: newValue?.id || Timeframe.M5,
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
                options={strategyOptions}
                getOptionLabel={(option) => option.name}
                value={
                                  strategyOptions.find(
                  (item) => item.id === backtesting.strategy
                ) || null
              }
              onChange={(event, newValue) => {
                setBacktesting({
                  ...backtesting,
                  strategy: newValue?.id || ''
                })
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Strategy" required />
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
  const [strategies, setStrategies] = useState<StrategyData[]>([])

  useEffect(() => {
    getBacktestings().then((data) => setData(data));
    getPairGroups().then((data) => setPairGroups(data));
    getStrategies().then((data) => setStrategies(data))
  }, []);

  const backtestingOptions = data.map((item) => ({
    id: item.id,
    name: `${item.name}`,
    status: item.status,
    timeRange: `${format(new Date(item.startDate), 'dd/MM/yy')} - ${format(new Date(item.endDate), 'dd/MM/yy')}`,
  }));

  console.log(backtestingOptions);

  const pairGroupOptions = pairGroups.map((item) => ({
    id: item.id,
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
          strategies={strategies}
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
                  (item) => item.id === newValue?.id
                );
                setSelectedBacktesting(selectedOption || null);
              }}
              renderInput={(params) => (
                <TextField {...params} label="Backtesting" />
              )}
              renderOption={(props, option) => {
                return (<Box
                  key={option.id}
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
                  <Chip key={option.id} size='small' sx={{ fontSize: '0.8rem' }} variant="outlined" label={option.status} color={statusColors[option.status] as any} />
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
              <InputLabel id="strategy-label">Strategy</InputLabel>
              <Select
                labelId="strategy-label"
                size="small"
                label="Strategy"
                value={selectedBacktesting?.strategy || ""}
                onChange={(event) => {}}
                disabled
              >
                {strategies.map((option) => (
                  <option key={option.id} value={option.id}>
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
                  <option key={option.id} value={option.id}>
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
          <StrategyPerformanceTable selectedId={selectedBacktesting.id} />
        </Card>
      ) : (
        <p>Please select a backtesting option.</p>
      )}
    </div>
  );
}

export default Backtesting;
