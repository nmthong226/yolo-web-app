import React, { useEffect, useState } from 'react';
import MyCodeBlock from '../../components/CodeBlock.jsx';
import { LuCopy } from "react-icons/lu";
import './Document.css';
import { CopyBlock } from 'react-code-blocks';
import { LuCopyCheck } from "react-icons/lu";

const Document = () => {
  const [copyCode, setCopyCode] = useState(false);
  return (
    <div className="max-w-5xl mx-auto py-8 px-6 lg:px-8 bg-white text-gray-900">
      <h1 id="yolo-web-app" className="text-4xl font-bold text-indigo-600 mb-4">YOLO Web App</h1>
      <p className="text-lg text-gray-700 mb-6">
        This project is a web application designed to detect objects in user-uploaded images using YOLOv10 models. The application provides users with additional information about the detected objects via a chatbot-like interface similar to ChatGPT or Gemini.
      </p>

      <h2 className="text-3xl font-semibold text-gray-800 mb-4">Table of Contents</h2>
      <ul className="list-decimal ml-6 space-y-2 text-gray-700 mb-4">
        <li><a href="#yolo-web-app" className="text-indigo-600 hover:underline">YOLO Web App</a></li>
        <li><a href="#technologies" className="text-indigo-600 hover:underline">Technologies</a>
          <ul className="list-disc ml-6 space-y-1">
            <li><a href="#frontend-" className="text-indigo-600 hover:underline">Frontend</a></li>
            <li><a href="#backend-" className="text-indigo-600 hover:underline">Backend</a></li>
            <li><a href="#database-" className="text-indigo-600 hover:underline">Database</a></li>
          </ul>
        </li>
        <li><a href="#project-structure" className="text-indigo-600 hover:underline">Project Structure</a></li>
        <li><a href="#environment-setup" className="text-indigo-600 hover:underline">Environment Setup</a></li>
        <li><a href="#installation" className="text-indigo-600 hover:underline">Installation</a></li>
        <li><a href="#usage" className="text-indigo-600 hover:underline">Usage</a></li>
        <li><a href="#real-time-communication" className="text-indigo-600 hover:underline">Real-time Communication</a></li>
        <li><a href="#contributing" className="text-indigo-600 hover:underline">Contributing</a></li>
      </ul>

      <h2 id="technologies" className="text-3xl font-semibold text-gray-800 mb-3">Technologies</h2>

      <h3 id="frontend-" className="text-2xl font-semibold text-gray-800 mt-4 mb-2">Frontend:</h3>
      <ul className="list-disc ml-6 space-y-1 text-gray-700">
        <li>ReactJS</li>
        <li>TailwindCSS</li>
        <li>PusherJS</li>
      </ul>

      <h3 id="backend-" className="text-2xl font-semibold text-gray-800 mt-4 mb-2">Backend:</h3>
      <ul className="list-disc ml-6 space-y-1 text-gray-700">
        <li>Python</li>
        <li>Flask API</li>
        <li>YOLOv10 Models</li>
      </ul>

      <h3 id="database-" className="text-2xl font-semibold text-gray-800 mt-4 mb-2">Database:</h3>
      <ul className="list-disc ml-6 space-y-1 text-gray-700">
        <li>Firebase (stores uploaded images)</li>
        <li>SQLite (stores users, channels, and messages)</li>
      </ul>

      <h2 id="project-structure" className="text-3xl font-semibold text-gray-800 mt-6 mb-3">Project Structure</h2>
      <p className="text-lg text-gray-700 mb-4">The application has two main folders:</p>
      <ul className="list-disc ml-6 space-y-2 text-gray-700">
        <li><code className="font-mono bg-gray-100 p-1 rounded">frontend</code>: ReactJS-based frontend to handle the user interface and PusherJS events.</li>
        <li><code className="font-mono bg-gray-100 p-1 rounded">backend</code>: Python Flask API for handling YOLO model detections and backend logic.</li>
        <li><code className="font-mono bg-gray-100 p-1 rounded">yolo</code>: Handles YOLO models and weights for object detection (in backend directory).</li>
      </ul>

      <h3 id="yolo-folder-structure" className="text-2xl font-semibold text-gray-800 mt-6 mb-3">YOLO Folder Structure</h3>
      <ul className="list-disc ml-6 space-y-1 text-gray-700">
        <li><code className="font-mono bg-gray-100 p-1 rounded">yolo/models</code>: Contains the trained YOLO <code>.pt</code> files (e.g., <code>best.pt</code>) that are used for object detection.</li>
      </ul>

      <h2 id="environment-setup" className="text-3xl font-semibold text-gray-800 mt-6 mb-3">Environment Setup</h2>
      <h3 id="prerequisites" className="text-2xl font-semibold text-gray-800 mt-4 mb-2">Prerequisites</h3>
      <p className="text-lg text-gray-700">Ensure you have the following installed:</p>
      <ul className="list-disc ml-6 space-y-1 text-gray-700">
        <li>Node.js (for the frontend)</li>
        <li>Python (for the backend)</li>
        <li>SQLite</li>
        <li>Firebase setup (for image storage)</li>
      </ul>

      <h3 id="frontend-environment" className="text-2xl font-semibold text-gray-800 mt-6 mb-3">Frontend Environment</h3>
      <p className="text-lg text-gray-700 mb-4">Create a <code className="font-mono bg-gray-100 p-1 rounded">.env</code> file inside the <code className="font-mono bg-gray-100 p-1 rounded">frontend</code> folder with the following variables:</p>
      <pre className="flex flex-col justify-between bg-gray-100 rounded-lg overflow-auto">
        <div className='flex justify-between px-4 py-2 border-2'>
          <span>Bash</span>
          {copyCode ?
            <button className='flex items-center px-2 border-2 rounded-lg border-gray-100 hover:border-2 hover:border-gray-300' onClick={() => setCopyCode(true)}>
              <LuCopyCheck className='mr-2' />
              Copied
            </button> :
            <button className='flex items-center px-2 border-2 rounded-lg border-gray-100 hover:border-2 hover:border-gray-300' onClick={() => setCopyCode(true)}>
              <LuCopy className='mr-2' />
              Copy
            </button>
          }
        </div>
        <MyCodeBlock code={"VITE_API_BASE='http://127.0.0.1:5000'\nVITE_PUSHER_KEY='YOUR-KEY'\nVITE_PUSHER_CLUSTER='YOUR-CLUSTER'"} language="bash" showLineNumbers={true} />
      </pre>

      <h3 id="backend-environment" className="text-2xl font-semibold text-gray-800 mt-6 mb-3">Backend Environment</h3>
      <p className="text-lg text-gray-700 mb-4">Create two .env files inside the backend folder:</p>
      <ul className="list-disc ml-6 space-y-1 text-gray-700">
        <li>1 .env for general backend configuration:
          <pre className="flex flex-col justify-between bg-gray-100 rounded-lg overflow-auto">
            <div className='flex justify-between px-4 py-2 border-2'>
              <span>Bash</span>
              {copyCode ?
                <button className='flex items-center px-2 border-2 rounded-lg border-gray-100 hover:border-2 hover:border-gray-300' onClick={() => setCopyCode(true)}>
                  <LuCopyCheck className='mr-2' />
                  Copied
                </button> :
                <button className='flex items-center px-2 border-2 rounded-lg border-gray-100 hover:border-2 hover:border-gray-300' onClick={() => setCopyCode(true)}>
                  <LuCopy className='mr-2' />
                  Copy
                </button>
              }
            </div>
            <MyCodeBlock code={"PUSHER_APP_ID='YOUR-PUSHER-APP-ID'\nPUSHER_APP_KEY='YOUR-PUSHER-APP-KEY'\nPUSHER_APP_SECRET='YOUR-PUSHER-APP-SECRET'\nPUSHER_APP_CLUSTER='YOUR-PUSHER-APP-CLUSTER'\nAPI_KEY='YOUR-GEMINI-KEY' # Gemini API Key"} language="bash" showLineNumbers={true} />
          </pre>
        </li>
        <li>
          <div className='my-4'>
            2 .flaskenv for Flask configuration:
          </div>
          <pre className="flex flex-col justify-between bg-gray-100 rounded-lg overflow-auto">
            <div className='flex justify-between px-4 py-2 border-2'>
              <span>Bash</span>
              {copyCode ?
                <button className='flex items-center px-2 border-2 rounded-lg border-gray-100 hover:border-2 hover:border-gray-300' onClick={() => setCopyCode(true)}>
                  <LuCopyCheck className='mr-2' />
                  Copied
                </button> :
                <button className='flex items-center px-2 border-2 rounded-lg border-gray-100 hover:border-2 hover:border-gray-300' onClick={() => setCopyCode(true)}>
                  <LuCopy className='mr-2' />
                  Copy
                </button>
              }
            </div>
            <MyCodeBlock code={"FLASK_APP='app.py'\nFLASK_ENV=d'evelopment'"} language="bash" showLineNumbers={true} />
          </pre>
        </li>
      </ul>

      <h2 id="installation" className="text-3xl font-semibold text-gray-800 mt-6 mb-3">Installation</h2>
      <h3 id="backend-flask-api-" className="text-2xl font-semibold text-gray-800 mt-4 mb-2">Backend (Flask API)</h3>
      <ul className="list-disc ml-6 space-y-2 text-gray-700">
        <li>Navigate to the backend folder:<pre className="bg-gray-100 p-4 rounded overflow-auto"><code>cd backend</code></pre></li>
        <li>Create a virtual environment:<pre className="bg-gray-100 p-4 rounded overflow-auto"><code>python -m venv venv
          source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
        </code></pre></li>
        <li>Install the dependencies:<pre className="bg-gray-100 p-4 rounded overflow-auto"><code>pip install -r requirements.txt</code></pre></li>
        <li>Set up SQLite database:<pre className="bg-gray-100 p-4 rounded overflow-auto"><code>flask db init
          flask db migrate
          flask db upgrade
        </code></pre></li>
        <li>Run the Flask server:<pre className="bg-gray-100 p-4 rounded overflow-auto"><code>flask run</code></pre></li>
      </ul>

      <h3 id="frontend-reactjs-" className="text-2xl font-semibold text-gray-800 mt-6 mb-3">Frontend (ReactJS)</h3>
      <ul className="list-disc ml-6 space-y-2 text-gray-700">
        <li>Navigate to the frontend folder:<pre className="bg-gray-100 p-4 rounded overflow-auto"><code>cd frontend</code></pre></li>
        <li>Install the dependencies:<pre className="bg-gray-100 p-4 rounded overflow-auto"><code>npm install</code></pre></li>
        <li>Start the React development server:<pre className="bg-gray-100 p-4 rounded overflow-auto"><code>npm run dev</code></pre></li>
      </ul>

      <h2 id="usage" className="text-3xl font-semibold text-gray-800 mt-6 mb-3">Usage</h2>
      <h3 id="object-detection" className="text-2xl font-semibold text-gray-800 mt-4 mb-2">Object Detection</h3>
      <ul className="list-disc ml-6 space-y-1 text-gray-700">
        <li>Users can upload an image via the chat interface.</li>
        <li>The image is stored in Firebase.</li>
        <li>YOLOv10 models, running in the Flask backend, will process the image and detect objects.</li>
        <li>The detected objects are returned to the user in the chat interface along with additional information.</li>
      </ul>
      <h3 id="real-time-communication" className="text-2xl font-semibold text-gray-800 mt-6 mb-3">
        Real-time Communication
      </h3>
      <p className="text-lg text-gray-700 mb-6">
        The application uses PusherJS for real-time message delivery between the user and the bot.
      </p>

      <h2 id="contributing" className="text-3xl font-semibold text-gray-800 mt-6 mb-3">Contributing</h2>
      <ul className="list-disc ml-6 space-y-1 text-gray-700">
        <li>Fork the repository.</li>
        <li>Create your feature branch (<code className="font-mono bg-gray-100 p-1 rounded">git checkout -b feature/YourFeature</code>).</li>
        <li>Commit your changes (<code className="font-mono bg-gray-100 p-1 rounded">git commit -m 'Add YourFeature'</code>).</li>
        <li>Push to the branch (<code className="font-mono bg-gray-100 p-1 rounded">git push origin feature/YourFeature</code>).</li>
        <li>Open a pull request.</li>
      </ul>
    </div>

  );
};

export default Document;