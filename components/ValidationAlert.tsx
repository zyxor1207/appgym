interface ValidationAlertProps {
  show: boolean;
  onClose: () => void;
  title: string;
  fields: string[];
}

export default function ValidationAlert({ show, onClose, title, fields }: ValidationAlertProps) {
  if (!show) return null;

  return (
    <div className="mb-6 p-6 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg shadow-lg animate-pulse">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            ⚠️ {title}
          </h3>
          <div className="text-sm text-red-700 space-y-2">
            <p className="font-medium">Por favor, completa todos los campos marcados con (*):</p>
            <div className="grid grid-cols-1 gap-1 ml-4">
              {fields.map((field, index) => (
                <div key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                  <span>{field}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="ml-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full transition-colors duration-200"
          >
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
