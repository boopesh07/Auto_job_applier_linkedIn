from flask import Flask, request, jsonify, render_template
from flask_cors import CORS, cross_origin
import csv
from datetime import datetime
import os
import threading
import sys
import subprocess
import signal
import psutil

app = Flask(__name__)

# Make CORS completely open for development
CORS(app, origins="*", allow_headers="*", methods="*")

# Manual CORS headers to ensure they're always present
@app.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
    response.headers['Access-Control-Max-Age'] = '3600'
    return response

PATH = 'all excels/'

# Global variables to track the automation process
automation_process = None
automation_running = False

# Global OPTIONS handler for all routes
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({'status': 'ok'})
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
        return response

##> ------ Karthik Sarode : karthik.sarode23@gmail.com - UI for excel files ------
@app.route('/')
def home():
    """Displays the home page of the application."""
    return render_template('index.html')

@app.route('/applied-jobs', methods=['GET'])
def get_applied_jobs():
    '''
    Retrieves a list of applied jobs from the applications history CSV file.
    
    Returns a JSON response containing a list of jobs, each with details such as 
    Job ID, Title, Company, HR Name, HR Link, Job Link, External Job link, and Date Applied.
    
    If the CSV file is not found, returns a 404 error with a relevant message.
    If any other exception occurs, returns a 500 error with the exception message.
    '''

    try:
        jobs = []
        with open(PATH + 'all_applied_applications_history.csv', 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                jobs.append({
                    'Job_ID': row['Job ID'],
                    'Title': row['Title'],
                    'Company': row['Company'],
                    'HR_Name': row['HR Name'],
                    'HR_Link': row['HR Link'],
                    'Job_Link': row['Job Link'],
                    'External_Job_link': row['External Job link'],
                    'Date_Applied': row['Date Applied']
                })
        return jsonify(jobs)
    except FileNotFoundError:
        return jsonify({"error": "No applications history found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/applied-jobs/<job_id>', methods=['PUT'])
def update_applied_date(job_id):
    """
    Updates the 'Date Applied' field of a job in the applications history CSV file.

    Args:
        job_id (str): The Job ID of the job to be updated.

    Returns:
        A JSON response with a message indicating success or failure of the update
        operation. If the job is not found, returns a 404 error with a relevant
        message. If any other exception occurs, returns a 500 error with the
        exception message.
    """
    try:
        data = []
        csvPath = PATH + 'all_applied_applications_history.csv'
        
        if not os.path.exists(csvPath):
            return jsonify({"error": f"CSV file not found at {csvPath}"}), 404
            
        # Read current CSV content
        with open(csvPath, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            fieldNames = reader.fieldnames
            found = False
            for row in reader:
                if row['Job ID'] == job_id:
                    row['Date Applied'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    found = True
                data.append(row)
        
        if not found:
            return jsonify({"error": f"Job ID {job_id} not found"}), 404

        with open(csvPath, 'w', encoding='utf-8', newline='') as file:
            writer = csv.DictWriter(file, fieldnames=fieldNames)
            writer.writeheader()
            writer.writerows(data)
        
        return jsonify({"message": "Date Applied updated successfully"}), 200
    except Exception as e:
        print(f"Error updating applied date: {str(e)}")  # Debug log
        return jsonify({"error": str(e)}), 500

@app.route('/api/start-automation', methods=['POST', 'OPTIONS'])
def start_automation():
    """
    Starts the runAiBot.py automation script in a new process.
    
    Returns:
        JSON response indicating success or failure of starting the automation.
    """
    print(f"Received request: {request.method} from origin: {request.headers.get('Origin', 'Unknown')}")
    
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        print("Handling OPTIONS preflight request")
        return jsonify({'status': 'ok'})
    
    print("Handling POST request for automation start")
    global automation_process, automation_running
    
    try:
        # Check if automation is already running
        if automation_running and automation_process and automation_process.poll() is None:
            return jsonify({
                "success": False,
                "error": "Automation is already running. Please stop it first."
            }), 400
        
        # Get page info from request
        page_info = request.get_json()
        print(f"Received automation request for: {page_info.get('url', 'Unknown URL')}")
        
        # Start the Python automation script
        print("Starting runAiBot.py automation script...")
        
        # Get the absolute path to runAiBot.py
        script_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'runAiBot.py')
        
        # Start the subprocess
        automation_process = subprocess.Popen([
            sys.executable, script_path
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        automation_running = True
        
        response_data = {
            "success": True,
            "message": "Job application automation started successfully!",
            "timestamp": datetime.now().isoformat(),
            "process_id": automation_process.pid,
            "page_url": page_info.get('url', 'Unknown')
        }
        print(f"Sending successful response: {response_data}")
        return jsonify(response_data)
        
    except Exception as e:
        print(f"Error starting automation: {str(e)}")
        automation_running = False
        automation_process = None
        return jsonify({
            "success": False,
            "error": f"Failed to start automation: {str(e)}"
        }), 500

@app.route('/api/stop-automation', methods=['POST', 'OPTIONS'])
def stop_automation():
    """
    Stops the running automation process.
    
    Returns:
        JSON response indicating success or failure of stopping the automation.
    """
    print(f"Received stop request: {request.method}")
    
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'})
    
    global automation_process, automation_running
    
    try:
        if not automation_running or not automation_process:
            return jsonify({
                "success": False,
                "error": "No automation process is currently running."
            }), 400
        
        print(f"Stopping automation process with PID: {automation_process.pid}")
        
        # Try to terminate the process gracefully first
        try:
            # Get the process and all its children
            parent = psutil.Process(automation_process.pid)
            children = parent.children(recursive=True)
            
            # Terminate children first
            for child in children:
                try:
                    child.terminate()
                except psutil.NoSuchProcess:
                    pass
            
            # Terminate parent
            parent.terminate()
            
            # Wait for processes to terminate
            gone, still_alive = psutil.wait_procs(children + [parent], timeout=5)
            
            # Force kill any remaining processes
            for p in still_alive:
                try:
                    p.kill()
                except psutil.NoSuchProcess:
                    pass
                    
        except psutil.NoSuchProcess:
            print("Process already terminated")
        except Exception as e:
            print(f"Error terminating process gracefully: {e}")
            # Force kill as fallback
            try:
                automation_process.kill()
            except:
                pass
        
        automation_running = False
        automation_process = None
        
        return jsonify({
            "success": True,
            "message": "Automation stopped successfully!",
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Error stopping automation: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Failed to stop automation: {str(e)}"
        }), 500

@app.route('/api/automation-status', methods=['GET'])
def get_automation_status():
    """
    Returns the current status of the automation process.
    
    Returns:
        JSON response with automation status information.
    """
    global automation_running, automation_process
    
    # Check if process is actually still running
    if automation_process and automation_process.poll() is not None:
        automation_running = False
        automation_process = None
    
    is_running = automation_running and automation_process and automation_process.poll() is None
    
    status_data = {
        "running": is_running,
        "timestamp": datetime.now().isoformat()
    }
    
    if is_running and automation_process:
        status_data["process_id"] = automation_process.pid
    
    return jsonify(status_data)

@app.route('/api/test', methods=['GET', 'OPTIONS'])
def test_cors():
    """Test endpoint to verify CORS is working"""
    print(f"Test endpoint hit: {request.method} from {request.headers.get('Origin', 'Unknown')}")
    return jsonify({"status": "success", "message": "CORS is working!", "timestamp": datetime.now().isoformat()})

if __name__ == '__main__':
    app.run(debug=True, port=4000)

##<