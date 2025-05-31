
"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Github, FileText, Sparkles, ArrowRight, Code2, BookOpen } from "lucide-react";

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

    const res = await fetch("https://replix-d28t.onrender.com/generate", {
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
      const res = await fetch(`https://replix-d28t.onrender.com/files?project_name=${projectName}`);
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

    const url = `https://replix-d28t.onrender.com${outputPath}/${fileName}`;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
              <Github className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Replix
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-2">AI-Powered GitHub Tutorial Generator</p>
          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
            <Sparkles className="w-4 h-4 mr-1" />
            Transform repositories into comprehensive tutorials
          </Badge>
        </motion.div>

        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-3xl mx-auto mb-12"
        >
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="https://github.com/username/repository"
                    value={repo}
                    onChange={(e) => setRepo(e.target.value)}
                    className="pl-12 h-12 text-base border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                  />
                </div>
                <Button 
                  onClick={generateTutorial} 
                  disabled={loading || !repo.trim()} 
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold h-12 px-8"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Tutorial
                    </>
                  )}
                </Button>
              </div>
              {repo && (
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <Code2 className="w-4 h-4 mr-2" />
                  Ready to analyze: {repo.split('/').pop()}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Section */}
        {fileList.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-6"
          >
            {/* File List Sidebar */}
            <Card className="lg:col-span-1 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <FileText className="w-5 h-5 mr-2 text-purple-500" />
                  Tutorial Files
                  <Badge variant="secondary" className="ml-auto">
                    {fileList.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[500px] overflow-y-auto">
                  {fileList.map((file, index) => (
                    <motion.button
                      key={file}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => loadFile(file)}
                      className={`w-full text-left p-4 border-b border-gray-100 hover:bg-purple-50 transition-all duration-200 group ${
                        selectedFile === file 
                          ? "bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-l-purple-500" 
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium truncate ${
                          selectedFile === file ? "text-purple-700" : "text-gray-700"
                        }`}>
                          {file}
                        </span>
                        <ArrowRight className={`w-4 h-4 transition-transform ${
                          selectedFile === file 
                            ? "text-purple-500 translate-x-1" 
                            : "text-gray-400 group-hover:translate-x-1"
                        }`} />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Content Display */}
            <div className="lg:col-span-3">
              {loadingFile ? (
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <Loader2 className="animate-spin h-8 w-8 text-purple-500 mx-auto mb-4" />
                      <p className="text-gray-600">Loading tutorial content...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : fileContent ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader className="border-b border-gray-100">
                      <CardTitle className="flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-purple-500" />
                        {selectedFile}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="prose prose-slate max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-code:text-purple-600 prose-code:bg-purple-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-200">
                        <ReactMarkdown>{fileContent}</ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a file to preview</h3>
                      <p className="text-gray-500">Choose a tutorial file from the sidebar to view its content</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        )}

        {!loading && fileList.length === 0 && !projectName && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Github className="w-10 h-10 text-purple-500" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Ready to Generate</h3>
              <p className="text-gray-600 leading-relaxed">
                Enter a GitHub repository URL above and click "Generate Tutorial" to create 
                comprehensive, AI-powered documentation for any codebase.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
