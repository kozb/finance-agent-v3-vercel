import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, File, Link as LinkIcon, X, Loader2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { uploadFile, callEdgeFunction, deleteDocument } from "@/lib/supabase";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UploadedFile {
  id: string;
  name: string;
  type: "file" | "link";
  size?: string;
  status?: "uploading" | "success" | "error";
}

export const UploadPanel = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<{ id: string; name: string } | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch documents list - include user ID in query key for proper caching
  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const response = await callEdgeFunction("list-documents", { 
        method: "GET",
        queryParams: { limit: "50", offset: "0" }
      });
      return response.documents || [];
    },
    enabled: !!user, // Only fetch when user is logged in
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []);
    
    if (uploadedFiles.length === 0) return;

    setUploading(true);

    for (const file of uploadedFiles) {
      // Validate file type
      const allowedTypes = ["application/pdf", "text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name}: Invalid file type. Only PDF, CSV, and XLSX are allowed.`);
        continue;
      }

      // Validate file size (50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name}: File size exceeds 50MB limit.`);
        continue;
      }

      const tempId = Math.random().toString(36).substring(7);
      const tempFile: UploadedFile = {
        id: tempId,
        name: file.name,
        type: "file",
        size: `${(file.size / 1024).toFixed(1)} KB`,
        status: "uploading",
      };

      setFiles((prev) => [...prev, tempFile]);

      try {
        console.log("Uploading file:", file.name, file.type, file.size);
        const response = await uploadFile(file);
        console.log("Upload response:", response);
        
        if (response.success && response.document) {
          toast.success(`${file.name} uploaded successfully!`);
          
          setFiles((prev) =>
            prev.map((f) => (f.id === tempId ? { ...f, status: "success" } : f))
          );

        // Refresh documents list
        queryClient.invalidateQueries({ queryKey: ["documents", user?.id] });
        } else {
          throw new Error(response.error || "Upload failed - no document returned");
        }
      } catch (error: any) {
        console.error("Upload error:", error);
        toast.error(`${file.name}: ${error.message || "Upload failed"}`);
        setFiles((prev) =>
          prev.map((f) => (f.id === tempId ? { ...f, status: "error" } : f))
        );
      }
    }

    setUploading(false);
    // Clear the input
    e.target.value = "";
  };

  const handleAddLink = () => {
    if (linkInput.trim()) {
      setFiles([
        ...files,
        {
          id: Math.random().toString(36).substring(7),
          name: linkInput,
          type: "link",
        },
      ]);
      setLinkInput("");
      toast.info("Link added. Note: Link processing is not yet implemented.");
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  const handleDeleteClick = (doc: any) => {
    setDocumentToDelete({ id: doc.id, name: doc.file_name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete || !user) return;

    setDeleting(documentToDelete.id);
    setDeleteDialogOpen(false);

    try {
      await deleteDocument(documentToDelete.id);
      toast.success(`${documentToDelete.name} deleted successfully`);
      
      // Refresh documents list
      queryClient.invalidateQueries({ queryKey: ["documents", user.id] });
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(`Failed to delete: ${error.message || "Unknown error"}`);
    } finally {
      setDeleting(null);
      setDocumentToDelete(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-panel border-r border-panel-border">
      <div className="p-4 border-b border-panel-border">
        <h2 className="text-lg font-semibold text-foreground">Sources</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload files or add links
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* File Upload */}
        <div className="space-y-2">
          <label htmlFor="file-upload">
            <div
              className={`border-2 border-dashed border-border rounded-lg p-6 hover:border-primary hover:bg-panel-hover cursor-pointer transition-colors ${
                uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                {uploading ? (
                  <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                ) : (
                  <Upload className="h-8 w-8 text-muted-foreground" />
                )}
                <div className="text-sm text-center">
                  <span className="font-medium text-foreground">
                    {uploading ? "Uploading..." : "Click to upload"}
                  </span>
                  {!uploading && <p className="text-muted-foreground">or drag and drop</p>}
                </div>
                <p className="text-xs text-muted-foreground">
                  PDF, CSV, XLSX up to 50MB
                </p>
              </div>
            </div>
          </label>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            multiple
            onChange={handleFileUpload}
            accept=".pdf,.csv,.xls,.xlsx"
            disabled={uploading}
          />
        </div>

        {/* Link Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Add Link</label>
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddLink()}
              className="flex-1"
            />
            <Button onClick={handleAddLink} size="sm" disabled={!linkInput.trim()}>
              Add
            </Button>
          </div>
        </div>

        {/* Uploaded Files List */}
        {files.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-panel-border">
            <h3 className="text-sm font-medium text-foreground">Recent Uploads ({files.length})</h3>
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-panel-hover transition-colors group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {file.status === "uploading" ? (
                      <Loader2 className="h-4 w-4 text-primary flex-shrink-0 animate-spin" />
                    ) : file.type === "file" ? (
                      <File className="h-4 w-4 text-primary flex-shrink-0" />
                    ) : (
                      <LinkIcon className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {file.name}
                      </p>
                      {file.size && (
                        <p className="text-xs text-muted-foreground">{file.size}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(file.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents from Database */}
        {!isLoading && documents && documents.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-panel-border">
            <h3 className="text-sm font-medium text-foreground">Your Documents ({documents.length})</h3>
            <div className="space-y-2">
              {documents.map((doc: any) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-panel-hover transition-colors group"
                >
                  <File className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {doc.file_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {doc.file_type.toUpperCase()} • {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(doc)}
                    disabled={deleting === doc.id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                  >
                    {deleting === doc.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{documentToDelete?.name}"? This action cannot be undone and will also delete all associated data (chunks, financial data, etc.).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
