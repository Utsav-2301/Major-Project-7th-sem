from flask import Flask, request, jsonify, send_file
from flask_socketio import SocketIO
from threading import Lock, Event
from flask_cors import CORS
import csv
import pyvisa
from datetime import datetime

keithley = None

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

@app.route('/connect', methods=['POST'])
def connect_keithley():
    global keithley
    print('Connection request received')
    try:
        print('Trying to make post request')
        data = request.get_json()
        ip_address = data.get('ip_address')
        print(ip_address,'\n')
        ## TO ADD: Keithley IP connection script 
        rm = pyvisa.ResourceManager()
        keithley_resource_name = f'TCPIP0::{ip_address}::inst0::INSTR'
        global keithley
        keithley = rm.open_resource(keithley_resource_name)
        print(keithley)
        return jsonify({'message': 'IP Connection successfully done'})
    except Exception as e:
        print(f'Error: {str(e)}')
        return jsonify({'error': str(e)}), 500
    finally:
        if 'keithley' in locals():
            keithley.close()
            rm.close()

@app.route('/receive-data', methods=['POST'])
def receive_data():
    print('received request')
    try:
        print('trying to make post request')
        data = request.get_json()
        connection_type = data.get('connection_type')
        source_type = data.get('source_type')
        source_value = data.get('source_value')
        measurement_type = data.get('measurement_type')
        max_current_limit = data.get('max_current_limit')
        plt_graph = data.get('plot_graph')

        global voltage, current, resistance, Plot_Graph

        if source_type == 'voltage':
            voltage_value = float(source_value) 
            voltage = voltage_value
        elif source_type == 'current':
            current_value = float(source_value) 
            current = current_value
        print(voltage_value)
        Plot_Graph = bool(plt_graph)
        print(keithley)
        keithley.write(f':ROUT:TERM {connection_type}')
        keithley.write(':SOUR:FUNC VOLT')
        keithley.write(f':SOUR:VOLT {voltage_value}')
        keithley.write(f':SOUR:VOLT:ILIM {max_current_limit}')
        if measurement_type == "current":
            keithley.write(':SENS:FUNC "CURR"')
            keithley.write(':SENS:CURR:RANG:AUTO ON')
        else:
            keithley.write(':SENS:FUNC "RES"')
            keithley.write(':SENS:RES:RANG:AUTO ON')
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
@app.route('/disconnect-keithley', methods=['POST'])
def disconnect_keithley():
    global keithley
    global rm
    try:
        if 'keithley' in globals():
            keithley.close()
            rm.close()
        return {'message': 'Disconnected successfully'}
    except Exception as e:
        return {'error': str(e)}

@app.route('/stop-plotting', methods=['POST'])
def stop_websocket():
    try:
        socketio.stop()
        return jsonify({'message': 'WebSocket connection stopped successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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