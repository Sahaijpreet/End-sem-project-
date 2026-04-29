import React from 'react';

export default function TestPage() {
  console.log('TestPage rendering...');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">Test Page</h1>
        <p className="text-gray-600">If you can see this, React is working!</p>
        <div className="mt-4 p-4 bg-white rounded shadow">
          <p>Current time: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}