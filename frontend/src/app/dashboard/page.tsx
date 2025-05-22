"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [repo, setRepo] = useState("");
  const [outputPath, setOutputPath] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [fileList, setFileList] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);

  async function generateTutorial() {
    setLoading(true);
    setOutputPath(null);
    setProjectName(null);
    setFileList([]);
    setSelectedFile(null);
    setFileContent("");

    const res = await fetch("http://localhost:8000/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repo }),
    });

    setLoading(false);

    if (!res.ok) {
      alert("Failed to generate tutorial");
      return;
    }

    const data = await res.json();
    setOutputPath(data.output_path);
    setProjectName(data.project_name);

    if (data.project_name) {
      await fetchFileList(data.project_name);
    }
  }

  async function fetchFileList(projectName: string) {
    try {
      const res = await fetch(`http://localhost:8000/files?project_name=${projectName}`);
      if (!res.ok) {
        alert("Failed to fetch file list");
        return;
      }
      const data = await res.json();
      setFileList(data.files || []);
    } catch (error) {
      alert("Error fetching file list");
    }
  }

  async function loadFile(fileName: string) {
    if (!outputPath) return;
    setLoadingFile(true);

    const url = `http://localhost:8000${outputPath}/${fileName}`;
    const res = await fetch(url);
    setLoadingFile(false);

    if (!res.ok) {
      alert("Failed to load file");
      return;
    }
    const text = await res.text();
    setSelectedFile(fileName);
    setFileContent(text);
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold mb-6 text-center">
        Replix – GitHub Tutorial Generator
      </motion.h1>
      <div className="flex gap-4 mb-4">
        <Input
          placeholder="Enter GitHub repo URL"
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          className="flex-1 text-base"
        />
        <Button onClick={generateTutorial} disabled={loading} className="bg-amber-400 hover:bg-amber-500 text-black">
          {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Generate"}
        </Button>
      </div>

      {fileList.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-2">Files in Tutorial</h2>
            <ul className="space-y-2 overflow-y-auto max-h-[400px]">
              {fileList.map((file) => (
                <li key={file}>
                  <button
                    onClick={() => loadFile(file)}
                    className={`w-full text-left hover:underline ${selectedFile === file ? "font-semibold text-amber-600" : ""}`}
                  >
                    {file}
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <div className="md:col-span-2">
            {loadingFile ? (
              <div className="flex items-center justify-center h-full py-20">
                <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
              </div>
            ) : fileContent ? (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">{selectedFile}</h3>
                  <div className="prose max-w-none">
                    <ReactMarkdown>{fileContent}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center text-gray-500 mt-20">Select a file to preview</div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
