import React from "react";

import SimpleMDE from "@uiw/react-md-editor";


function MdEditor(props) {
  return (
    <SimpleMDE value={props.value} onChange={props.onChange} height={400} />
  );
}

export default MdEditor;
