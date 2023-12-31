import React from "react";
import * as consts from "../consts";
import "./generator-config.css";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function GeneratedConfig(props) {
  const { expansionPackList, gamePackList, stuffPackList, kitsList } = consts;

  return (
    <div className="generator-config">
      <Autocomplete
        multiple
        id="checkboxes-tags-demo"
        options={expansionPackList}
        disableCloseOnSelect
        getOptionLabel={(option) => option.label}
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={selected}
            />
            {option.label}
          </li>
        )}
        renderInput={(params) => (
          <TextField {...params} label="Expansion Packs" />
        )}
      />

      <Autocomplete
        multiple
        id="checkboxes-tags-demo"
        options={gamePackList}
        disableCloseOnSelect
        getOptionLabel={(option) => option.label}
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={selected}
            />
            {option.label}
          </li>
        )}
        renderInput={(params) => <TextField {...params} label="Game Packs" />}
      />

      <Autocomplete
        multiple
        id="checkboxes-tags-demo"
        options={stuffPackList}
        disableCloseOnSelect
        getOptionLabel={(option) => option.label}
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={selected}
            />
            {option.label}
          </li>
        )}
        renderInput={(params) => <TextField {...params} label="Stuff Packs" />}
      />

      <Autocomplete
        multiple
        id="checkboxes-tags-demo"
        options={kitsList}
        disableCloseOnSelect
        getOptionLabel={(option) => option.label}
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={selected}
            />
            {option.label}
          </li>
        )}
        renderInput={(params) => <TextField {...params} label="Kits" />}
      />
    </div>
  );
}

export default GeneratedConfig;
