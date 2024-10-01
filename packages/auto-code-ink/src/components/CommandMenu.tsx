import React from "react";
import Menu from "./Menu.js";

const menuItems = [
  {
    label: "Open in editor",
    value: "editor"
  },
  {
    label: "Exit",
    value: "exit"
  },
  {
    label: "Print Usage",
    value: "usage"
  }
];

export default function CommandMenu({
  onSelect
}: {
  onSelect: (command: string) => void;
}) {
  const onMenuSelect = (index: number) => {
    onSelect(menuItems[index].value);
  };
  const items = menuItems.map((item) => item.label);

  return <Menu items={items} onSelect={onMenuSelect} />;
}
