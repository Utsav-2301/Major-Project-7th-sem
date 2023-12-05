from flask import Flask, request, jsonify, send_file
from flask_socketio import SocketIO
from threading import Lock, Event
from flask_cors import CORS
import random
import csv
import pyvisa


rm = pyvisa.ResourceManager()
keithley_resource_name = 'TCPIP0::169.254.56.27::inst0::INSTR'  # Replace with your instrument's resource name
keithley = rm.open_resource(keithley_resource_name)
thread = None
voltage = 0
current = 0
resistance = 0
measured_values = []
Plot_Graph = False
thread_lock = Lock()
plot_event = Event()

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins='*')


@app.route('/receive-data', methods=['POST'])
def receive_data():
    print('received request')
    try:
        print('trying to make post request')
        data = request.get_json()
        source_type = data.get('source_type')
        source_value = data.get('source_value')
        measurement_type = data.get('measurement_type')
        plt_graph = data.get('plot_graph')

        global voltage, current, resistance, Plot_Graph

        if source_type == 'voltage':
            voltage_value = int(source_value) 
            voltage = voltage_value
        elif source_type == 'current':
            current_value = int(source_value) 
            current = current_value
        print(voltage_value)
        Plot_Graph = bool(plt_graph)
        keithley.write(':ROUT:TERM REAR')
        keithley.write(':SOUR:FUNC VOLT')
        keithley.write(f':SOUR:VOLT {voltage_value}')
        keithley.write(':SOUR:VOLT:ILIM 0.01')
        keithley.write(':SENS:FUNC "CURR"')
        keithley.write(':SENS:CURR:RANG:AUTO ON')
        keithley.write(':SENSE:CURR:UNIT AMP')
        keithley.write(':OUTP ON')
        keithley.write(':INIT')
        keithley.write('*WAI')
        # Signal the background thread that the value is updated
        plot_event.set()

        return jsonify({'message': 'Data received successfully'})
    except Exception as e:
        print(f'Error: {str(e)}')
        return jsonify({'error': str(e)}), 500

def background_thread():
    while True:
        plot_event.wait()
        with thread_lock:
            plot = Plot_Graph

        if plot:
            try:
                current = float(keithley.query(':READ?').strip()) * 1e6
                socketio.emit('updateSensorData', {'value': current})
            except Exception as e:
                print(f'Error reading current: {str(e)}')

            socketio.sleep(1)
        else:
            socketio.sleep(1)

@app.route('/download-data', methods=['GET'])
def download_data():
    with open('voltage_data.txt', 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerows([[measured_value] for measured_value in measured_values])
    return send_file('voltage_data.txt', as_attachment=True)


@socketio.on('connect')
def connect():
    global thread
    print('Client connected')

    global thread
    with thread_lock:
        if thread is None:
            thread = socketio.start_background_task(background_thread)

@socketio.on('disconnect')
def disconnect():
    print('Client disconnected', request.sid)

if __name__ == '__main__':
    socketio.run(app)