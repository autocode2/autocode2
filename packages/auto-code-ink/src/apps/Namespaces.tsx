import React from "react";
import { Static } from "ink";
import { NamespaceInfo } from "@autocode2/core/db/Database.js";
import Namespace from "../components/Namespace.js";

export default function Namespaces({
  namespaces
}: {
  namespaces: NamespaceInfo[];
}) {
  return (
    <Static items={namespaces}>
      {(namespace) => <Namespace namespace={namespace} key={namespace.name} />}
    </Static>
  );
}
