import React from "react";
import * as consts from "../consts";
import "./generator-config.css";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function GeneratedConfig(props) {
  const { expansionPackList, gamePackList, stuffPackList, kitsList } = consts;

  return (
    <div className="generator-config">
      {/* {expansionPackList &&
        expansionPackList.map((expansionPack, index) => {
          return (
            <div key={expansionPack} className="expansion-item">
              <input
                type="checkbox"
                id={expansionPack}
                name={expansionPack}
                value={expansionPack}
              />
              <label htmlFor={expansionPack}>{expansionPack}</label>
            </div>
          );
        })} */}

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
        style={{ width: 500 }}
        renderInput={(params) => (
          <TextField {...params} label="Expansion Packs" />
        )}
      />
    </div>
  );
}

export default GeneratedConfig;
