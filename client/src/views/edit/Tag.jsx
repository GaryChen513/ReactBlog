import React, { useState } from "react";
import { Input, Tag } from "antd";

const { CheckableTag } = Tag;

const AppTag = (props) => {
  const { list, setList } = props;
  const { selectedList, setSelectedList } = props;
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");


  function removeItem(item) {
    const newList = list.filter((l) => l !== item);
    setList(newList);
  }

  function handleSelect(value, checked) {
    const newList = checked
      ? [...selectedList, value]
      : selectedList.filter((t) => t.name !== value.name);
    setSelectedList(newList);
  }

  return (
    <>
      {list.map((item, index) => {
        return (
          <CheckableTag
            key={item._id}
            closable="true"
            checked={selectedList.includes(item)}
            onChange={(checked) => handleSelect(item, checked)}
            onClose={() => removeItem(item)}
            color="#1890ff"
          >
            {item.name}
          </CheckableTag>
        );
      })}

      <Input
        style={{ width: 78, display: inputVisible ? "inline" : "none" }}
        type="text"
        size="small"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
    </>
  );
};

export default AppTag;
