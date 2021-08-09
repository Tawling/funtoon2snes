import React from "react";

import './ToggleSwitch.css';

function ToggleSwitch({
    size = "default",
    checked,
    disabled,
    onChange,
    offstyle = "btn-danger",
    onstyle = "btn-success",
    className,
    children
  }) {

  let displayStyle = checked ? onstyle : offstyle;
  return (
    <>
      <label className={className}>
        <span className={`${size} switch-wrapper`}>
          <input
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={e => onChange(e)}
          />
          <span className={`${displayStyle} switch`}>
            <span className="switch-handle" />
          </span>
        </span>
        <span className="switch-label">{children}</span>
      </label>
    </>
  );
}

export default ToggleSwitch;
