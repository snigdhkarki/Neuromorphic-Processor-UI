from fastapi import FastAPI, UploadFile, File
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware # 1. Import the middleware
import subprocess
import tempfile
import os

app = FastAPI()

# 2. Add the CORS middleware to your app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Allows requests from your React app
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (POST, GET, etc.)
    allow_headers=["*"], # Allows all headers
)

@app.post("/process")
async def process_file(file: UploadFile = File(...)):
    # 1. Read the uploaded file content
    input_content = await file.read()
    
    # 2. Create a temporary output file path
    output_path = tempfile.NamedTemporaryFile(delete=False, suffix=".txt").name

    try:
        # 3. Execute your binary.
        # IMPORTANT: Your binary MUST be a Linux executable (see warning below).
        # This replicates: ./binaryfilename < example.txt > out.txt
        with tempfile.NamedTemporaryFile(delete=False, suffix=".txt") as tmp_input:
            tmp_input.write(input_content)
            input_path = tmp_input.name
        
        # Run the command using shell redirection (simplest way to replicate your exact command)
        # Ensure 'your_binary_name' is in the same directory and has execute permissions.
        subprocess.run(
            f"./network_tool < {input_path} > {output_path}",
            shell=True,
            check=True,
            executable="/bin/bash"
        )
        
        # 4. Read the generated output file
        with open(output_path, "rb") as f:
            output_content = f.read()
            
        # 5. Return the file as a download
        return Response(
            content=output_content,
            media_type="application/octet-stream",
            headers={"Content-Disposition": "attachment; filename=out.txt"}
        )
        
    except subprocess.CalledProcessError as e:
        return Response(content=f"Processing failed: {str(e)}", status_code=500)
    finally:
        # 6. Clean up temporary files
        os.unlink(input_path)
        if os.path.exists(output_path):
            os.unlink(output_path)