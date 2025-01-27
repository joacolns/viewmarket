const PriceDisplay = ({ price, chartData, prediction, predictionStyle }) => {
    return (
      <div className="price text-lg font-bold mb-2 md:mb-0">
        {price && chartData.length > 1 && (
          <p>
            Price: ${price.toFixed(8)}
            <span className={chartData[chartData.length - 1] > chartData[chartData.length - 2] ? 'text-green-500' : 'text-red-500'}>
              ({chartData[chartData.length - 1] > chartData[chartData.length - 2] ? '↑' : '↓'}
              {Math.abs(
                ((chartData[chartData.length - 1] - chartData[chartData.length - 2]) /
                  chartData[chartData.length - 2]) *
                100
              ).toFixed(2)}%)
            </span>
          </p>
        )}
        {prediction && (
          <p style={{ color: predictionStyle.color }}>
            {prediction} <span>{predictionStyle.icon}</span>
          </p>
        )}
      </div>
    );
  };
  
  export default PriceDisplay;