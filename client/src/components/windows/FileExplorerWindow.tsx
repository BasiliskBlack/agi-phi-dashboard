import React from 'react';
import { useSystem } from '@/contexts/SystemContext';
import { formatBytes } from '@/lib/utils';

const FileExplorerWindow: React.FC = () => {
  const { files, navigateDirectory, currentDirectory } = useSystem();

  // Parse path components for breadcrumb
  const pathComponents = currentDirectory.split('/').filter(Boolean);

  return (
    <div className="h-full flex flex-col">
      {/* Breadcrumb navigation */}
      <div className="flex items-center mb-4 text-sm">
        <button 
          className="hover:bg-gray-700 p-1 rounded mr-2"
          onClick={() => navigateDirectory('/')}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
          </svg>
        </button>
        <span 
          className="hover:bg-gray-700 px-2 py-1 rounded cursor-pointer"
          onClick={() => navigateDirectory('/')}
        >
          Root
        </span>
        {pathComponents.map((component, index) => (
          <React.Fragment key={index}>
            <span className="mx-1">/</span>
            <span 
              className="hover:bg-gray-700 px-2 py-1 rounded cursor-pointer"
              onClick={() => navigateDirectory('/' + pathComponents.slice(0, index + 1).join('/'))}
            >
              {component}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* File list */}
      <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800">
            <tr className="text-xs">
              <th className="text-left py-2 px-4 font-medium">Name</th>
              <th className="text-left py-2 px-4 font-medium">Size</th>
              <th className="text-left py-2 px-4 font-medium">Type</th>
              <th className="text-left py-2 px-4 font-medium">Modified</th>
            </tr>
          </thead>
          <tbody>
            {currentDirectory !== '/' && (
              <tr 
                className="border-b border-gray-800 hover:bg-gray-800 cursor-pointer"
                onClick={() => {
                  const parentPath = currentDirectory.split('/').slice(0, -1).join('/') || '/';
                  navigateDirectory(parentPath);
                }}
              >
                <td className="py-2 px-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  ..
                </td>
                <td className="py-2 px-4">-</td>
                <td className="py-2 px-4">Directory</td>
                <td className="py-2 px-4">-</td>
              </tr>
            )}
            {files.map((file) => (
              <tr 
                key={file.id} 
                className="border-b border-gray-800 hover:bg-gray-800 cursor-pointer"
                onClick={() => file.type === 'directory' ? navigateDirectory(file.path) : null}
              >
                <td className="py-2 px-4 flex items-center">
                  {file.type === 'directory' ? (
                    <svg className="w-5 h-5 mr-2 text-phixeo-blue" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 mr-2 text-phixeo-purple" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path>
                    </svg>
                  )}
                  {file.name}
                </td>
                <td className="py-2 px-4">{file.size ? formatBytes(file.size) : '-'}</td>
                <td className="py-2 px-4">{file.type.charAt(0).toUpperCase() + file.type.slice(1)}</td>
                <td className="py-2 px-4">{file.lastModified.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FileExplorerWindow;
