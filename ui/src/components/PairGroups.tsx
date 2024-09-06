import { useEffect, useState } from "react";
import { PairData, PairGroupData } from "../types/Backtesting";
import { createPairGroup, deletePairGroup, getPairGroups, getPairs } from "../services/ApiService";
import { Card, Grid, TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle, Autocomplete, Checkbox } from "@mui/material";
import { FaPlus } from "react-icons/fa";
import PairGroupTable from "./PairGroupTable";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import "./PairGroups.scss";


function EditPairGroupDialog({ open, setOpen, handleSave }: { open: boolean, setOpen: (state: boolean) => void, handleSave: (data: any) => Promise<any> }) {
  const [pairs, setPairs] = useState<PairData[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [pairGroup, setPairGroup] = useState<PairGroupData>({
    uid: "",
    name: "",
    description: "",
    pairs: [] as string[]
  });

  const pairOptions = pairs.map(pair => pair.name);

  useEffect(() => {
    getPairs().then(pairs => setPairs(pairs));
  }, [])

  const isPairGroupValid = () => {
    return pairGroup.name && pairGroup.pairs.length > 0;
  }

  const handleClose = () => {
    setOpen(false);
    setPairGroup({
      uid: "",
      name: "",
      description: "",
      pairs: [] as string[]
    });
  };

  const handleSavePairGroup = () => {
    setIsSaving(true);
    handleSave(pairGroup).then(() => setIsSaving(false)).then(() => handleClose());
  }

  return (
    <div className="pair-group-editing-dialog">
      <Dialog open={open} onClose={() => handleClose()} fullWidth maxWidth="sm">
        <DialogTitle>Edit Pair Group</DialogTitle>
        <DialogContent>
          <div className="pair-group-editing-dialog-content">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  label="Pair Group Name"
                  fullWidth
                  value={pairGroup.name}
                  onChange={(e) => setPairGroup({ ...pairGroup, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  style={{ width: "100%" }}
                  options={pairOptions}
                  getOptionLabel={(option) => option}
                  value={
                    pairOptions.filter((item: any) =>
                      pairGroup.pairs.includes(item)
                    ) || []
                  }
                  onChange={(event, newValue) => {
                    setPairGroup({ ...pairGroup, pairs: newValue });
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
                      label="Pairs"
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
                  value={pairGroup.description}
                  onChange={(e) => setPairGroup({ ...pairGroup, description: e.target.value })}
                />
              </Grid>
            </Grid>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose()}>Cancel</Button>
          <Button onClick={() => handleSavePairGroup()} disabled={!isPairGroupValid() || isSaving} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

function PairGroups() {
  const [pairGroups, setPairGroups] = useState<PairGroupData[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getPairGroups().then(setPairGroups);
  }, [])

  const handleSave = (data: PairGroupData) => {
    return createPairGroup(data).then(() => {
      getPairGroups().then(setPairGroups);
    });
  }

  const handleDeleteGroup = (uid: string) => {
    return deletePairGroup(uid).then(() => {
      getPairGroups().then(setPairGroups);
    });
  };

  return (
    <div className="pair-groups">
      <EditPairGroupDialog open={open} setOpen={setOpen} handleSave={handleSave} />
      <Card className="pair-groups-control">
        <Grid container spacing={2} alignItems="top">
          <Grid item xs={8}>
            <TextField 
              size="small" 
              fullWidth 
              label="Pair Group Name"
            />
          </Grid>
          <Grid item xs={1.5}>
            <Button 
              variant="outlined"
              color="primary"
              sx={{
                height: '40px',
                transform: 'none'
              }} 
              onClick={() => setOpen(true)}
              size="small"
              startIcon={<FaPlus />} 
            > Pair Group</Button>
          </Grid>
        </Grid>
      </Card>
        {pairGroups ? (
          <Card className="pair-groups-result">
            <PairGroupTable pairGroups={pairGroups} handleDeleteGroup={handleDeleteGroup} />
          </Card>
        ) : (
          <p>Please select a backtesting option.</p>
        )}
    </div>
  )
}

export default PairGroups;