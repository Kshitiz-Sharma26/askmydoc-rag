import { useState, useEffect, useCallback } from "react";
import FileManager from "../components/FileManager";
import ChatPanel from "../components/ChatPanel";
import useApiCall from "../hooks/useApiCall";
import { getFilesAPI } from "../utility/ApiService";

export type ReportFile = {
  id: number | string;
  name: string;
  status: "processing" | "ready" | "failed";
};

export default function Home() {
  const [files, setFiles] = useState<ReportFile[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { fetchData: fetchFiles } = useApiCall(getFilesAPI);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = useCallback(async () => {
    const { data, error } = await fetchFiles({});
    const responseData = data as any;
    if (!error && responseData?.files) {
      setFiles(responseData.files.map((f: any) => ({ ...f, status: "ready" })));
    }
  }, [fetchFiles, setFiles]);

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <div className="flex w-full h-screen overflow-hidden relative">
        <FileManager
          files={files}
          setFiles={setFiles}
          reloadFiles={loadFiles}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />
        <ChatPanel
          hasReadyFiles={files.some((f) => f.status === "ready")}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
