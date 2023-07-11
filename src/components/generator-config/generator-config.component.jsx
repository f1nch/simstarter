import React from "react";
import * as consts from "../consts";
import "./generator-config.css";

function GeneratedConfig(props) {
    const {expansionPackList, gamePackList, stuffPackList, kitsList} = consts;

    return (
        <div className="generator-config">
            {expansionPackList && expansionPackList.map((expansionPack, index) => {
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
            })}
        </div>
    );
}

export default GeneratedConfig;