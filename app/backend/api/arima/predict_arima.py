import sys
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from pmdarima import auto_arima

def main():
    try:
        # Leer los datos de entrada desde stdin
        input_data = json.loads(sys.stdin.read())
        prices = input_data.get("prices", [])
        future_days = input_data.get("futureDays", 30)

        if len(prices) < 20:
            print(json.dumps({"error": "Not enough data for ARIMA"}))
            return

        # Crear un índice de fechas
        start_date = datetime.today() - timedelta(days=len(prices))
        dates = pd.date_range(start=start_date, periods=len(prices), freq='D')

        # Crear la serie de tiempo con índice de fechas
        series = pd.Series(prices, index=dates)

        # Encontrar y ajustar el mejor modelo ARIMA
        model_auto = auto_arima(
            series,
            seasonal=False,
            stepwise=True,
            suppress_warnings=True,
            error_action="ignore",
            trace=True,
            max_p=5,
            max_q=5,
            d=None,
            test="adf"
        )

        # Hacer la predicción con el modelo de auto_arima
        forecast = model_auto.predict(n_periods=future_days)
        predicted_price = forecast[-1]

        print(json.dumps({"predicted_price": predicted_price}))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()