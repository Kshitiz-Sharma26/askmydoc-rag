import { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Upload,
  Trash2,
  XCircle,
  CheckCircle2,
  Loader2,
  X,
  LogOut,
} from "lucide-react";
import { toast } from "react-toastify";
import useApiCall from "../hooks/useApiCall";
import { GlobalContext } from "../context/GlobalContextProvider";
import { uploadFileAPI, deleteFileAPI, logoutAPI } from "../utility/ApiService";
import type { ReportFile } from "../pages/Home";

type FileManagerProps = {
  files: ReportFile[];
  setFiles: React.Dispatch<React.SetStateAction<ReportFile[]>>;
  reloadFiles: () => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
};

export default function FileManager({
  files,
  setFiles,
  reloadFiles,
  isOpen,
  setIsOpen,
}: FileManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { state, dispatch } = useContext(GlobalContext);

  const { fetchData: uploadFile } = useApiCall(uploadFileAPI);
  const { fetchData: deleteFile } = useApiCall(deleteFileAPI);
  const { fetchData: logout, loading: loggingOut } = useApiCall(logoutAPI);

  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const file = selectedFiles[0];
    if (file.type !== "application/pdf") {
      toast.error("Please select a PDF file.");
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      toast.error("Maximum allowed size is 1MB");
      return;
    }

    if (files.some((f) => f.name === file.name && f.status !== "failed")) {
      toast.error("File with same name is already present.");
      return;
    }

    // Add optimistic processing file
    const tempId = "temp-" + Date.now();
    setFiles((prev) => [
      { id: tempId, name: file.name, status: "processing" },
      ...prev,
    ]);

    const formData = new FormData();
    formData.append("report", file);

    const { error } = await uploadFile(formData);

    if (error) {
      toast.error(error);
      setFiles((prev) =>
        prev.map((f) => (f.id === tempId ? { ...f, status: "failed" } : f)),
      );
    } else {
      toast.success("File uploaded and processed successfully!");
      // reload files from remote to get correct DB ID
      reloadFiles();
    }

    if (fileInputRef.current) fileInputRef.current.value = ""; // reset
  };

  const handleDelete = async (id: number | string) => {
    if (typeof id === "string" && id.startsWith("temp-")) {
      setFiles((prev) => prev.filter((f) => f.id !== id));
      return;
    }

    setDeletingId(id);
    const { error } = await deleteFile({ id: id as number });
    setDeletingId(null);

    if (error) {
      toast.error(error);
    } else {
      toast.success("File deleted!");
      setFiles((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const handleLogout = async () => {
    if (!state.user?.id) return;
    const { error } = await logout({ id: state.user.id });
    if (error) {
      toast.error(error);
    } else {
      dispatch({ type: "SET-USER", payload: null });
      toast.success("Logged out successfully");
      navigate("/login");
    }
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-40 w-[85%] sm:w-80 md:relative md:w-1/3 md:min-w-[300px] h-full bg-white border-r border-slate-200 flex flex-col pt-4 transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0 md:shadow-none"}`}
    >
      <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 shrink-0">
        <h2 className="text-xl font-semibold text-slate-800 tracking-tight">
          Your Reports
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            title="Upload PDF"
          >
            <Upload className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl md:hidden transition-colors focus:outline-none"
            title="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
        {files.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 px-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center">
              <Upload className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-500">
              Upload a report to get started
            </p>
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file.id}
              className="group bg-white border border-slate-200 p-4 rounded-2xl flex items-start gap-4 hover:shadow-md transition-all duration-200"
            >
              <div
                className={`p-2 rounded-xl shrink-0 ${file.status === "processing" ? "bg-blue-50 text-blue-500" : file.status === "failed" ? "bg-red-50 text-red-500" : "bg-cyan-50 text-cyan-600"}`}
              >
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold text-slate-800 truncate"
                  title={file.name}
                >
                  {file.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {file.status === "processing" && (
                    <span className="flex items-center text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />{" "}
                      Processing
                    </span>
                  )}
                  {file.status === "ready" && (
                    <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Ready
                    </span>
                  )}
                  {file.status === "failed" && (
                    <span className="flex items-center text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                      <XCircle className="w-3 h-3 mr-1" /> Failed
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(file.id)}
                disabled={
                  deletingId === file.id || file.status === "processing"
                }
                className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 focus:opacity-100 p-2 rounded-xl transition-all shrink-0 disabled:opacity-50"
                title="Delete file"
              >
                {deletingId === file.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Logout button sticky section */}
      <div className="p-4 border-t border-slate-100 bg-white shrink-0 mt-auto">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center justify-center gap-2 p-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium text-sm focus:outline-none focus:ring-2 focus:ring-red-100 disabled:opacity-50"
        >
          {loggingOut ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <LogOut className="w-5 h-5" />
          )}
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
