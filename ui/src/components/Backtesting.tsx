// Backtesting.tsx
import { useEffect, useState } from "react";
import {
  BacktestingData,
  PairGroupData,
  StrategyData,
} from "../types/Backtesting";
import {
  getBacktestings,
  getPairGroups,
  getStrategies,
  createBacktesting,
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
  Checkbox,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import "./Backtesting.scss";
import StrategyPerformanceTable from "./StrategyPerformanceTable";
import { FaPlus } from "react-icons/fa";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
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
    uid: item.uid,
    name: item.name,
  }));
  const strategyOptions = strategies.map((item) => ({
    uid: item.uid,
    name: item.name,
  }));
  const [backtesting, setBacktesting] = useState<any>({
    name: "",
    pairGroup: "",
    startDate: new Date(),
    endDate: new Date(),
    strategies: [] as string[],
  });
  const isBacktestingValid = () => {
    return (
      backtesting.name &&
      backtesting.pairGroup &&
      backtesting.startDate &&
      backtesting.endDate &&
      backtesting.strategies.length > 0
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
          <Grid item xs={6}>
            <DatePicker
              label="Start Date"
              slotProps={{
                textField: { size: "small", fullWidth: true, required: true },
              }}
              onChange={(date) => {
                setBacktesting({
                  ...backtesting,
                  startDate: date?.toISOString() || "",
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
                  endDate: date?.toISOString() || "",
                });
              }}
              value={backtesting.endDate}
            />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              multiple
              size="small"
              style={{ width: "100%" }}
              options={strategyOptions}
              getOptionLabel={(option) => option.name}
              value={
                strategyOptions.filter((item: any) =>
                  backtesting.strategies.includes(item.uid)
                ) || []
              }
              onChange={(event, newValue) => {
                setBacktesting({
                  ...backtesting,
                  strategies: newValue.map((item: any) => item.uid),
                });
              }}
              renderOption={(prop, option, { selected }) => {
                return (
                  <li {...prop}>
                    <Checkbox
                      icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                      checkedIcon={<CheckBoxIcon fontSize="small" />}
                      style={{ marginRight: 8 }}
                      checked={selected}
                    />
                    {option.name}
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Strategies"
                  placeholder="Type..."
                  required
                />
              )}
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
              disabled={ true || !isBacktestingValid() }
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
  const [strategies, setStrategies] = useState<StrategyData[]>([]);

  useEffect(() => {
    getBacktestings().then((data) => setData(data));
    getPairGroups().then((data) => setPairGroups(data));
    getStrategies().then((data) => setStrategies(data));
  }, []);

  const backtestingOptions = data.map((item) => ({
    uid: item.uid,
    name: `${item.name} (${format(new Date(item.startDate), 'dd-MM-yyyy')} - ${format(new Date(item.endDate), 'dd-MM-yyyy')})`,
  }));

  const pairGroupOptions = pairGroups.map((item) => ({
    uid: item.uid,
    name: item.name,
  }));

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

  const handleClickSaveBacktesting = async (data: any) => {
    await createBacktesting(data, data.strategies);
    setOpen(false);
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
          <Grid item xs={4}>
            <Autocomplete
              size="small"
              style={{ width: "100%" }}
              id="backtesting-select"
              options={backtestingOptions}
              getOptionLabel={(option) => option.name}
              onChange={(event, newValue) => {
                const selectedOption = data.find(
                  (item) => item.uid === newValue?.uid
                );
                setSelectedBacktesting(selectedOption || null);
              }}
              renderInput={(params) => (
                <TextField {...params} label="Backtesting" />
              )}
            />
          </Grid>
          <Grid item xs={2.25}>
            <DatePicker
              label="Start Date"
              value={startDate as null | undefined}
              slotProps={{ textField: { size: "small", fullWidth: true } }}
              onChange={(date) => {}}
              disabled
            />
          </Grid>
          <Grid item xs={2.25}>
            <DatePicker
              label="End Date"
              value={endDate as null | undefined}
              slotProps={{ textField: { size: "small", fullWidth: true } }}
              onChange={(date) => {}}
              disabled
            />
          </Grid>
          <Grid item xs={2}>
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
          <Grid item xs={1.5}>
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
