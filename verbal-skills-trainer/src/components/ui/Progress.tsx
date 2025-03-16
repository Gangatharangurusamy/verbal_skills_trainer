interface ProgressProps {
    value: number;
  }
  
  export function Progress({ value }: ProgressProps) {
    return (
      <div className="w-full bg-gray-200 rounded-md">
        <div
          className="bg-blue-500 h-2 rounded-md"
          style={{ width: `${value}%` }}
        ></div>
      </div>
    );
  }
  