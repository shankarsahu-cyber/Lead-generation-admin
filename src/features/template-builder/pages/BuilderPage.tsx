import React from "react";
import BuilderApp from "../App"; // adjust path if needed

type Props = {
  auth?: { token?: string; user?: { id?: string } };
  onSave?: (template: any) => Promise<any> | void;
};

const BuilderPage: React.FC<Props> = ({ auth, onSave }) => {
  return (
    <div className="template-builder-page min-h-screen bg-white">
      <BuilderApp auth={auth} onSave={onSave} />
    </div>
  );
};

export default BuilderPage;
