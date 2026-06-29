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



