import { Autocomplete, Button, Card, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { StrategyData, StrategyGroupData } from "../types/Backtesting";
import StrategyGroupTable from "./StrategyGroupTable";
import { createStrategyGroup, deleteStrategyGroup, getStrategies, getStrategyGroups, updateStrategyGroup } from "../services/ApiService";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import './StrategyGroups.scss';

function EditStrategyGroupDialog({ open, setOpen, handleSave, strategyGroup: initialStrategyGroup }: { 
  open: boolean, 
  setOpen: (state: boolean) => void, 
  handleSave: (data: any) => Promise<any> 
  strategyGroup?: StrategyGroupData | undefined | null
}) {
  const [strategies, setStrategies] = useState<StrategyData[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [strategyGroup, setStrategyGroup] = useState<StrategyGroupData>({
    uid: "",
    name: "",
    description: "",
    strategies: [] as string[]
  });

  const strategyOptions = strategies.map(s => s.name);

  useEffect(() => {
    getStrategies().then(strategies => setStrategies(strategies));
  }, [open]);

  useEffect(() => {
    if (open && initialStrategyGroup) {
      setStrategyGroup(initialStrategyGroup);
    } else if (open) {
      setStrategyGroup({
        uid: "",
        name: "",
        description: "",
        strategies: [] as string[]
      });
    }
  }, [open, initialStrategyGroup]);

  const isStrategyGroupValid = () => {
    return strategyGroup.name && strategyGroup.strategies.length > 0;
  }

  const handleClose = () => {
    setOpen(false);
    setStrategyGroup({
      uid: "",
      name: "",
      description: "",
      strategies: [] as string[]
    });
  };

  const handleSaveStrategyGroup = () => {
    setIsSaving(true);
    if (initialStrategyGroup) {
      handleSave({ ...strategyGroup, uid: initialStrategyGroup.uid }).then(() => setIsSaving(false)).then(() => handleClose());
    } else {
      handleSave(strategyGroup).then(() => setIsSaving(false)).then(() => handleClose());
    }
  }

  return (
    <div className="strategy-group-editing-dialog">
      <Dialog open={open} onClose={() => handleClose()} fullWidth maxWidth="sm">
        <DialogTitle>{
          initialStrategyGroup ? 'Edit Strategy Group' : 'Create Strategy Group'
        }</DialogTitle>
        <DialogContent>
          <div className="strategy-group-editing-dialog-content">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  label="Strategy Group Name"
                  fullWidth
                  value={strategyGroup.name}
                  onChange={(e) => setStrategyGroup({ ...strategyGroup, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  style={{ width: "100%" }}
                  options={strategyOptions}
                  getOptionLabel={(option) => option}
                  value={
                    strategyOptions.filter((item: any) =>
                      strategyGroup.strategies.includes(item)
                    ) || []
                  }
                  onChange={(event, newValue) => {
                    setStrategyGroup({ ...strategyGroup, strategies: newValue });
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
                        {option}
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
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={4}
                  value={strategyGroup.description}
                  onChange={(e) => setStrategyGroup({ ...strategyGroup, description: e.target.value })}
                />
              </Grid>
            </Grid>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose()}>Cancel</Button>
          <Button onClick={() => handleSaveStrategyGroup()} disabled={!isStrategyGroupValid() || isSaving} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}


function StrategyGroups() {
  const [strategyGroups, setStrategyGroups] = useState<StrategyGroupData[]>([]);
  const [selectedStrategyGroup, setSelectedStrategyGroup] = useState<StrategyGroupData | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getStrategyGroups().then((groups) => setStrategyGroups(groups))
  }, [])

  const handleSave = (data: StrategyGroupData) => {
    if (data.uid) {
      return updateStrategyGroup(data.uid, data).then(() => {
        getStrategyGroups().then(setStrategyGroups);
      });
    } else {
      return createStrategyGroup(data).then(() => {
        getStrategyGroups().then(setStrategyGroups);
      });
    }
  }

  const handleDeleteGroup = (uid: string) => {
    return deleteStrategyGroup(uid).then(() => {
      getStrategyGroups().then(setStrategyGroups);
    });
  };

  const handleOpenEditDialog = (id?: string) => {
    if (id) {
      const strategyGroup = strategyGroups.find(g => g.uid === id);
      if (strategyGroup) {
        setSelectedStrategyGroup(strategyGroup);
      } else {
        setSelectedStrategyGroup(null);
      }
    } else {
      setSelectedStrategyGroup(null);
    }
    setOpen(true);
    return Promise.resolve();
  }

  return (
    <div className="strategy-groups">
      <EditStrategyGroupDialog
        open={open}
        setOpen={setOpen}
        handleSave={handleSave}
        strategyGroup={selectedStrategyGroup}
      />
      <Card className="strategy-groups-control">
        <Grid container spacing={2} alignItems="top">
          <Grid item xs={8}>
            <TextField size="small" fullWidth label="Strategy Group Name" />
          </Grid>
          <Grid item xs={2}>
            <Button
              variant="outlined"
              color="primary"
              sx={{
                height: "40px",
                transform: "none",
              }}
              onClick={() => handleOpenEditDialog()}
              size="small"
              startIcon={<FaPlus />}
            >
              {" "}
              Strategy Group
            </Button>
          </Grid>
        </Grid>
      </Card>
      { strategyGroups ? (
        <Card className="strategy-groups-result">
          <StrategyGroupTable
            strategyGroups={strategyGroups}
            handleDeleteGroup={handleDeleteGroup}
            handleEditGroup={(id) => handleOpenEditDialog(id)}
          />
        </Card>
      ) : (
        <p>There are no Strategy Groups.</p>
      )}
    </div>
  );
}

export default StrategyGroups;
