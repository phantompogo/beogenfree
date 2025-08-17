
import React from 'react';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="mt-6 p-4 bg-red-900/50 border border-red-500 text-red-300 rounded-lg" role="alert">
      <p className="font-bold">Terjadi Kesalahan</p>
      <p>{message}</p>
    </div>
  );
};