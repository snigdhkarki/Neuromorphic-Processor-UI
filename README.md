<h1>TENNLab RISP GUI Simulator</h1>

An open-source, interactive web-based Graphical User Interface (GUI) simulator for the RISP Neuroprocessor, built on top of the TENNLab Exploratory Neuromorphic Framework.

While the official TENNLab framework provides robust Command Line Interface (CUI) tools (`network_tool` and `processor_tool_risp`), this project bridges the gap by offering an intuitive, visual platform to design, simulate, and analyze spiking neural networks (SNNs) in real-time.

---

<h2> Live Link</h2>

* **URL:** [neuromorphic-processor-ui-dashboard.vercel.app](https://neuromorphic-processor-ui-dashboard.vercel.app)

---

<h2> Features</h2>

* **Visual Network design:** Interactive rendering of spiking neural network topologies, neurons, and synaptic connections.
* **Input Spike design:** Ability to design both dense input spike and sparse input spikes.
* **Easy simulation:** Easily find the result of certain input spike on a SNN.

---

<h2>Tech Stack & Deployment</h2>

<h3>Frontend</h3>

* **Framework:** React 
* **Deployment:** Vercel

<h3>Backend</h3>

* **Core Engine:** TENNLab C++ code
* **Containerization:** Docker (compiles and packages the C++ framework dependencies flawlessly)
* **Deployment:** Render

<h2> Local Development </h2>

If you want to make changes to the code, follow these steps to run the repository locally:

### 1. Fork and Clone

* **Fork** the repository https://github.com/snigdhkarki/Neuromorphic-Processor-UI to your own GitHub account.
* Clone your forked repository to your local machine:
```bash
git clone https://github.com/snigdhkarki/Neuromorphic-Processor-UI
```

### 2. Running the Pages
The project is divided into 4 distinct folders, each representing a page of the website. To run a specific page:

Navigate into any of the four project folders:

```bash
cd folder-name
```
Install the dependencies (if you haven't already):

```bash
npm install
```
Start the local development server:

```bash
npm start
```
Note: Repeat this process inside any of the other folders to spin up the respective pages of the website.

### 3. To Run the Backend Locally
Follow these steps to get your local development server up and running.

Prerequisites
Before you begin, ensure you have Python 3.8+ and pip installed on your machine.

Clone the Repository
Clone the backend repository https://github.com/snigdhkarki/Neuromorphic-backend-testing to your local machine

```Bash
git clone https://github.com/snigdhkarki/Neuromorphic-backend-testing
```

Set Up a Virtual Environment (Recommended)
It is highly recommended to use a virtual environment to isolate your project dependencies:

```Bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
.\venv\Scripts\activate
```

Install Dependencies
Install the required packages before running the server:

```Bash
pip install -r requirements.txt
```

Run the Application
Start the local FastAPI development server using Uvicorn with auto-reload enabled:

```Bash
uvicorn main:app --reload
```

This image shows the main landing page of the RISP Neuroprocessor dashboard outlining a clear three-step workflow for network design, input generation, and simulation.
<img width="940" height="649" alt="image" src="https://github.com/user-attachments/assets/296dac42-3b9f-43bc-a7c1-0f3295b89c71" />


This image displays the interactive network creation tool where users can visually build node topologies, assign properties, and see the real-time structural log generated below.
<img width="1903" height="963" alt="image" src="https://github.com/user-attachments/assets/bbcd9ca0-d7ff-4ded-89d0-96facef7c710" />

This image illustrates the "Design Sparse Input Spike" screen which allows users to manually schedule distinct, highly precise spike times and values for individual input nodes.
<img width="1895" height="956" alt="image" src="https://github.com/user-attachments/assets/6fb03e54-085a-4a90-9df0-5e688141d1c1" />

This image presents the "Design Dense Input Spike" interface, enabling users to efficiently input continuous binary bitstreams across a defined runtime for multiple node IDs.
<img width="1904" height="959" alt="image" src="https://github.com/user-attachments/assets/890de393-e20d-4a04-8b95-430864380d03" />

This image showcases the "Run Simulation" interface where uploaded network and spike files are processed to generate a color-coded, step-by-step waveform graph of neural activity.
<img width="972" height="942" alt="image" src="https://github.com/user-attachments/assets/fac835da-e1f0-4234-939a-fd2815461385" />


Acknowledgements
This project is a GUI extension built to interact with the framework-open repository developed by TENNLab (The University of Tennessee Neuromorphic Computing Laboratory).



