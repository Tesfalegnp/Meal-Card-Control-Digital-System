import express from "express";
import cors from "cors";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";

const app = express();
app.use(cors({ origin: "*" }));

let latestUID = "";

const SERIAL_PATH = "/dev/ttyACM0";
console.log("Configured serial port path:", SERIAL_PATH);

const port = new SerialPort({
  path: SERIAL_PATH,
  baudRate: 9600,
});

const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

port.on("open", () => {
  console.log("Serial port opened:", SERIAL_PATH);
});

parser.on("data", (line) => {
  console.log("Serial data:", line);

  if (line.startsWith("UID:")) {
    latestUID = line.replace("UID:", "").trim().replace(/\s+/g, "");
    console.log("RFID UID received:", latestUID);
  }
});

app.get("/rfid/latest", (req, res) => {
  const temp = latestUID;
  latestUID = ""; // clear immediately → prevents looping
  res.json({ uid: temp });
});

app.listen(5000, () => {
  console.log("Express server running on http://localhost:5000");
});
