const TimePeriodInput = ({ timePeriod, setTimePeriod }) => {
    return (
      <div className="time-period mb-4">
        <label htmlFor="timePeriod" className="mr-2 text-lg font-semibold">
          Time Period (Rec. 90):
        </label>
        <input
          type="number"
          id="timePeriod"
          value={timePeriod}
          onChange={(e) => setTimePeriod(Math.max(0, Math.min(200, Number(e.target.value))))}
          className="relative z-10 p-3 border rounded-md w-full md:w-1/12 bg-white"
          min="0"
        />
      </div>
    );
  };
  
  export default TimePeriodInput;