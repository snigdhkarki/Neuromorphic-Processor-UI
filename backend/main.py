from fastapi import FastAPI, UploadFile, File
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import tempfile
import os
import zipfile
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],   # restrict later to your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/process")
async def process_files(
    network_file: UploadFile = File(...),
    spike_file: UploadFile = File(...)
):
    # Read both uploaded files
    network_content = await network_file.read()
    spike_content = await spike_file.read()

    # Temporary paths
    input_path = tempfile.NamedTemporaryFile(delete=False, suffix=".txt").name
    output_path = tempfile.NamedTemporaryFile(delete=False, suffix=".txt").name
    processor_input_path = tempfile.NamedTemporaryFile(delete=False, suffix=".txt").name
    final_output_path = tempfile.NamedTemporaryFile(delete=False, suffix=".txt").name

    try:
        # --- Step 1: Run network_tool on network file ---
        with open(input_path, "wb") as f:
            f.write(network_content)

        # Execute network_tool
        subprocess.run(
            f"./network_tool < {input_path} > {output_path}",
            shell=True,
            check=True,
            executable="/bin/bash",
            stderr=subprocess.PIPE,
            text=True
        )

        # Read the output of network_tool (out.txt content)
        with open(output_path, "r") as f:
            out_content = f.read()

        # --- Step 2: Build processorinput.txt ---
        # Format: "ML\n{out_content}\n{spike_content}"
        processor_content = "ML\n" + out_content + "\n" + spike_content.decode('utf-8')
        with open(processor_input_path, "w") as f:
            f.write(processor_content)

        # --- Step 3: Run processor_tool_risp ---
        subprocess.run(
            f"./processor_tool_risp < {processor_input_path} > {final_output_path}",
            shell=True,
            check=True,
            executable="/bin/bash",
            stderr=subprocess.PIPE,
            text=True
        )

        # --- Step 4: Create a ZIP with both output files ---
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zipf:
            # Add out.txt
            zipf.writestr("out.txt", out_content)
            # Add finalout.txt
            with open(final_output_path, "rb") as f:
                zipf.writestr("finalout.txt", f.read())

        zip_buffer.seek(0)

        # --- Step 5: Return ZIP as download ---
        return Response(
            content=zip_buffer.getvalue(),
            media_type="application/zip",
            headers={"Content-Disposition": "attachment; filename=results.zip"}
        )

    except subprocess.CalledProcessError as e:
        # Return the error from the binary if possible
        error_msg = e.stderr.strip() if e.stderr else str(e)
        return Response(content=f"Binary error: {error_msg}", status_code=500)
    except Exception as e:
        return Response(content=f"Server error: {str(e)}", status_code=500)
    finally:
        # Clean up temp files
        for path in [input_path, output_path, processor_input_path, final_output_path]:
            if os.path.exists(path):
                os.unlink(path)