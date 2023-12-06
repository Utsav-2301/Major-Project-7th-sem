import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  FormControl,
  Select,
  InputAdornment,
  InputLabel,
  MenuItem,
  TextField,
  Card,
  CardContent,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import AlertComponent from "./AlertComponent";
import CustomButton from "./CustomButton";
import ChartComponent from "./ChartComponent";

const theme = createTheme({
  typography: {
    fontFamily: "Poppins, sans-serif",
  },
});

const HomePage = () => {
  const [sourceType, setSourceType] = useState("voltage");
  const [connectionType, setConnectionType] = useState("rear");
  const [sourceValue, setSourceValue] = useState("");
  const [ipAddress, setIpAdress] = useState("");
  const [chartVisible, setChartVisible] = useState(false);
  const [showSelectOptions, setShowSelectOptions] = useState(false);
  const [maxCurrentLimit, setMaxCurrentLimit] = useState("");
  const [measurementTypeOptions, setMeasurementTypeOptions] = useState([
    { value: "current", label: "Current" },
    { value: "resistance", label: "Resistance" },
  ]);
  const [measurementType, setMeasurementType] = useState(
    measurementTypeOptions[0].value
  );
  const [sourceLabel, setSourceLabel] = useState("Voltage Value:");
  const [sourcePlaceholder, setSourcePlaceholder] = useState(
    "Enter voltage value"
  );

  useEffect(() => {
    updateForm();
    updateMeasurementOptions(sourceType);
  }, [sourceType, measurementTypeOptions]);

  const updateForm = () => {
    if (sourceType === "voltage") {
      setSourceLabel("Voltage Value:");
      setSourcePlaceholder("Enter voltage value");
    } else if (sourceType === "current") {
      setSourceLabel("Current Value:");
      setSourcePlaceholder("Enter current value");
    }
  };

  const updateMeasurementOptions = (sourceType) => {
    if (sourceType === "current") {
      setMeasurementTypeOptions([{ value: "resistance", label: "Resistance" }]);
      setMeasurementType(measurementTypeOptions[0].value);
    } else {
      setMeasurementTypeOptions([
        { value: "current", label: "Current" },
        { value: "resistance", label: "Resistance" },
      ]);
    }
  };

  const connectKeihtley = () => {
    fetch("http://localhost:5000/connect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ip_address: ipAddress,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          <AlertComponent message={"Error establishing a connection"} type={"error"} />;
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        <AlertComponent message={data.message} type={'success'}/>
        setShowSelectOptions(true);
      })
      .catch((error) => console.error("Error:", error));
  };

  const sendData = () => {
    fetch("http://localhost:5000/receive-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        connection_type: connectionType,
        source_type: sourceType,
        source_value: sourceValue,
        measurement_type: measurementType,
        max_current_limit: maxCurrentLimit,
        plot_graph: "True",
      }),
    })
      .then((response) => {
        if (!response.ok) {
          <AlertComponent
            message={"Error sending request"}
            type={"error"}
          />;
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        <AlertComponent message={data.message} type={"success"} />;
        setChartVisible(true);
      })
      .catch((error) => console.error("Error:", error));
  };

  const newConnection = ()=>{
    fetch("http://localhost:5000/disconnect-keithley", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }
    })
      .then((response) => {
        if (!response.ok) {
          <AlertComponent
            message={"Error establishing a new connection"}
            type={"error"}
          />;
          throw new Error('Error disconnecting and starting a new plot');
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        setShowSelectOptions(false);
        setChartVisible(false);
      })
      .catch((error) => console.error("Error:", error));
  }

  const downloadData = () => {
    fetch('http://localhost:5000/download-data')
      .then((response) => response.blob())
      .then((blob) => {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = 'data.txt'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
      .catch((error) => console.error('Error:', error))
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" style={{ paddingTop: "50px" }}>
        <Typography gutterBottom variant="h4">
          <b>Log and Plot</b> data from Keithley 2450!
        </Typography>

        <Card style={{ padding: "20px" }}>
          <CardContent>
            {!showSelectOptions && (
              <>
                <TextField
                  id="ip_address"
                  label="Enter IP Address of Keithley"
                  type="text"
                  value={ipAddress}
                  fullWidth
                  placeholder=""
                  onChange={(e) => setIpAdress(e.target.value)}
                />
                <br />
                <br />
                <CustomButton
                  text="Connect with Keithley"
                  handleClick={() => connectKeihtley()}
                  disabled={!ipAddress}
                />
              </>
            )}

            {showSelectOptions && (
              <>
                <Typography variant="caption">
                  Connected with Keithley
                </Typography>
                <FormControl fullWidth>
                  <InputLabel id="connection-type-label">
                    Select Connection Type
                  </InputLabel>
                  <Select
                    labelId="connection-type-label"
                    id="connection_type"
                    value={connectionType}
                    label="Select Connection Type"
                    onChange={(e) => {
                      setConnectionType(e.target.value);
                    }}
                  >
                    <MenuItem value="rear">Rear</MenuItem>
                    <MenuItem value="front">Front</MenuItem>
                  </Select>
                </FormControl>
                <br />
                <br />
                <FormControl fullWidth>
                  <InputLabel id="source-type-label">
                    Select Source Type
                  </InputLabel>
                  <Select
                    labelId="source-type-label"
                    id="source_type"
                    value={sourceType}
                    label="Select Source Type"
                    onChange={(e) => {
                      setSourceType(e.target.value);
                    }}
                  >
                    <MenuItem value="voltage">Voltage</MenuItem>
                    <MenuItem value="current">Current</MenuItem>
                  </Select>
                </FormControl>
                <br />
                <br />

                <TextField
                  id="source_value"
                  label={sourceLabel}
                  type="number"
                  value={sourceValue}
                  fullWidth
                  placeholder={sourcePlaceholder}
                  onChange={(e) => setSourceValue(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {sourceType === "voltage" && "V (in volts)"}
                        {sourceType === "current" && "mA (in milliamps)"}
                      </InputAdornment>
                    ),
                  }}
                />

                <br />
                <br />

                <FormControl fullWidth>
                  <InputLabel id="measurement-type-label">
                    Select Measurement
                  </InputLabel>
                  <Select
                    labelId="measurement-type-label"
                    id="measurement_type"
                    value={measurementType}
                    label="Select Measurement"
                    onChange={(e) => setMeasurementType(e.target.value)}
                  >
                    {measurementTypeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <br />
                <br />

                <TextField
                  id="max_current_limit"
                  label={"Max Current Limit"}
                  type="number"
                  value={maxCurrentLimit}
                  fullWidth
                  placeholder={"Set Max Current Limit"}
                  onChange={(e) => setMaxCurrentLimit(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {sourceType === "current" && "A (in amps)"}
                      </InputAdornment>
                    ),
                  }}
                />

                <br />
                <br />

                <CustomButton
                  text="Plot Graph"
                  handleClick={() => sendData()}
                  disabled={!sourceValue}
                />
              </>
            )}
          </CardContent>
        </Card>
        <CustomButton
          text="Start a new plot"
          handleClick={() => newConnection()}
          disabled={false}
        />
        {/* <CustomButton
          text="Stop Plotting"
          handleClick={() => stopPlotting()}
          disabled={false}
        /> */}
        <CustomButton
          text="Download Data"
          handleClick={() => downloadData()}
          disabled={false}
        />
        {chartVisible && <ChartComponent measurementType={measurementType} />}
      </Container>
    </ThemeProvider>
  );
};

export default HomePage;
