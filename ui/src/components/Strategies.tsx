// Strategies.tsx
import { Card, Grid, TextField, Button, Popover, FormControlLabel, Checkbox, Badge } from '@mui/material';
import { useEffect, useState } from 'react';
import { FaFilter, FaPlus } from 'react-icons/fa';
import StrategyTable from './StrategyTable';
import { StrategyData } from '../types/Backtesting';
import { getStrategies } from '../services/ApiService';
import './Strategies.scss';


function Strategies() {
  const [strategies, setStrategies] = useState<StrategyData[]>([]);
  const [filteredStrategies, setFilteredStrategies] = useState<StrategyData[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [search, setSearch] = useState<string>('');
  const [filter, setFilter] = useState<any>({
    onlyValidStrategies: true,
  });

  const filterOptions = [
    {
      label: 'Only Valid Strategies',
      value: 'onlyValidStrategies',
    },
  ];

  useEffect(() => {
    console.log('Fetching strategies');
    getStrategies()
    .then(setStrategies);
  }, [])

  useEffect(() => {
    setFilteredStrategies(strategies.filter((strategy) => {
      if (filter.onlyValidStrategies && strategy.indicators.length === 0) {
        return false;
      }
      if (search !== '' && !strategy.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      return true;
    }));
  }, [strategies, filter, search]);

  const openFilter = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }

  const closeFilter = () => {
    setAnchorEl(null);
  }
  
  const filterOpen = Boolean(anchorEl);
  const filterId = filterOpen ? 'simple-popover' : undefined;

  return (
    <div className="strategies">
      <Card className="strategies-control">
        <Grid container spacing={2} alignItems="top">
          <Grid item xs={8}>
            <TextField 
              size="small" 
              fullWidth 
              label="Strategy Name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Grid>
          <Grid item xs={1.5}>
            <Button 
              variant="outlined"
              color="primary"
              sx={{
                width: '100%',
                height: '40px',
                transform: 'none'
              }} 
              size="small"
              disabled
              startIcon={<FaPlus />} 
            > Strategy</Button>
          </Grid>
          <Grid item xs={1.5}>
            <Button 
              variant="outlined"
              color="primary"
              sx={{
                width: '100%',
                height: '40px',
                transform: 'none'
              }} 
              onClick={openFilter}
              size="small"
              startIcon={
                <Badge badgeContent={filterOptions.filter((option) => filter[option.value]).length} color="primary">
                  <FaFilter />
                </Badge>
              } 
            > &nbsp; Filter</Button>
            <Popover
              id={filterId}
              open={filterOpen}
              anchorEl={anchorEl}
              onClose={closeFilter}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
            >
              <div style={{
                padding: 10,
                margin: 10,
              }}>
                {filterOptions.map((option) => (
                  <div key={option.value}>
                    <FormControlLabel 
                      control={<Checkbox 
                        checked={filter[option.value]} 
                        onChange={(e) => setFilter({
                          ...filter,
                          [option.value]: e.target.checked,
                        })} 
                        name={option.value} 
                        color="primary"
                      />} 
                      label={option.label}
                    />
                  </div>
                ))}
              </div>
            </Popover>
          </Grid>
        </Grid>
      </Card>
        {filteredStrategies ? (
          <Card className="strategies-result">
            <StrategyTable strategies={filteredStrategies} />
          </Card>
        ) : (
          <p>No Strategies</p>
        )}
    </div>
  )
}

export default Strategies;