# GUI Interface for Data Logging & Plotting: Keithley 2450 

## Overview

This project is a web application designed to retrieve, log, and plot data from the Keithley 2450 source meter. It addresses challenges related to the limited buffer memory and potential power outage issues during prolonged experiments by providing remote access and control capabilities.

## Project Structure

The project consists of two main folders:

1. **client:** This folder contains the React-based front-end of the web application.
2. **server:** This folder hosts the Flask-based backend server responsible for communication with the Keithley 2450 and handling data storage.

## Setting Up the Project

### Client Setup:

1. Navigate to the `client` folder.
2. Run the following command to install the necessary dependencies:
   ```bash
   npm install

### Flask Setup:

1. Ensure that Python is installed on your system.
2. Navigate to the server folder.
3. Run the following command to install the required Python dependencies:
   ```bash
   pip install Flask Flask-SocketIO Flask-CORS pyvisa

## Running the Project

### Client:
1. Navigate to the client folder.
2. Run the following command to start the React development server:
   ```bash
   npm start

### Flask
1. Navigate to the server folder.
2. Run the following command to start the Flask server:
   ```bash
   python -m flask run

## Usage
Open your web browser and navigate to the provided address (http://localhost:3000) to access the web application.
Use the web interface to communicate with the Keithley 2450, retrieve data, and control experiments remotely.
The data is logged and stored in a .txt file for further analysis.

## Note
Ensure that the Keithley 2450 is properly connected with an Ethernet Cable and configured to accept SCPI commands before running the application.
