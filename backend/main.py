import os
import dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Set

from flow import create_tutorial_flow  # Your tutorial flow

dotenv.load_dotenv()

DEFAULT_INCLUDE_PATTERNS: Set[str] = {
    "*.py", "*.js", "*.jsx", "*.ts", "*.tsx", "*.go", "*.java", "*.pyi", "*.pyx",
    "*.c", "*.cc", "*.cpp", "*.h", "*.md", "*.rst", "Dockerfile",
    "Makefile", "*.yaml", "*.yml",
}

DEFAULT_EXCLUDE_PATTERNS: Set[str] = {
    "assets/*", "data/*", "examples/*", "images/*", "public/*", "static/*", "temp/*",
    "docs/*", 
    "venv/*", ".venv/*", "*test*", "tests/*", "docs/*", "examples/*", "v1/*",
    "dist/*", "build/*", "experimental/*", "deprecated/*", "misc/*", 
    "legacy/*", ".git/*", ".github/*", ".next/*", ".vscode/*", "obj/*", "bin/*", "node_modules/*", "*.log"
}

# Ensure output directory exists before mounting
os.makedirs("output", exist_ok=True)

app = FastAPI(title="Tutorial Generator API")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Adjust as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount output directory
app.mount("/output", StaticFiles(directory="output"), name="output")

class GenerateRequest(BaseModel):
    repo: Optional[str] = Field(None, description="GitHub repo URL")
    dir: Optional[str] = Field(None, description="Local directory path")
    name: Optional[str] = Field(None, description="Project name (optional)")
    token: Optional[str] = Field(None, description="GitHub access token")
    output: str = Field("output", description="Output base directory")
    include: Optional[List[str]] = Field(None, description="Include file patterns")
    exclude: Optional[List[str]] = Field(None, description="Exclude file patterns")
    max_size: int = Field(100000, description="Max file size bytes")
    language: str = Field("english", description="Tutorial language")
    no_cache: bool = Field(False, description="Disable LLM caching")
    max_abstractions: int = Field(10, description="Max abstractions")

@app.post("/generate")
async def generate_tutorial(data: GenerateRequest):
    if not (data.repo or data.dir):
        raise HTTPException(status_code=400, detail="Either 'repo' or 'dir' must be provided.")

    github_token = data.token or (os.environ.get('GITHUB_TOKEN') if data.repo else None)
    if data.repo and not github_token:
        print("Warning: No GitHub token provided. May hit API rate limits.")

    shared = {
        "repo_url": data.repo,
        "local_dir": data.dir,
        "project_name": data.name,
        "github_token": github_token,
        "output_dir": data.output,
        "include_patterns": set(data.include) if data.include else DEFAULT_INCLUDE_PATTERNS,
        "exclude_patterns": set(data.exclude) if data.exclude else DEFAULT_EXCLUDE_PATTERNS,
        "max_file_size": data.max_size,
        "language": data.language,
        "use_cache": not data.no_cache,
        "max_abstraction_num": data.max_abstractions,
        "files": [],
        "abstractions": [],
        "relationships": {},
        "chapter_order": [],
        "chapters": [],
        "final_output_dir": None,
    }

    print(f"Generating tutorial for: {data.repo or data.dir} (language: {data.language.capitalize()})")
    print(f"LLM caching: {'Disabled' if data.no_cache else 'Enabled'}")

    # Ensure the specified output subdirectory exists
    os.makedirs(data.output, exist_ok=True)

    tutorial_flow = create_tutorial_flow()

    try:
        tutorial_flow.run(shared)
        project_name = shared["project_name"] or (data.repo.split("/")[-1].replace(".git", "") if data.repo else "project")
        output_url_path = f"/output/{project_name}"
        return {"success": True, "output_path": output_url_path, "project_name": project_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/files")
async def list_generated_files(project_name: str = Query(..., description="Project name to list files for")):
    base_output_dir = "output"
    project_dir = os.path.join(base_output_dir, project_name)

    if not os.path.exists(project_dir) or not os.path.isdir(project_dir):
        return JSONResponse(status_code=404, content={"error": "Project output directory not found"})

    files = [f for f in os.listdir(project_dir) if f.endswith(".md") or f.endswith(".txt")]
    return {"files": files}
