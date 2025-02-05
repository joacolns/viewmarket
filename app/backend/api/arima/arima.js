import { PythonShell } from 'python-shell';
import path from 'path';

export async function POST(req) {
  try {
    const { prices, futureDays } = await req.json();

    if (!prices || prices.length < 20) {
      return new Response(JSON.stringify({ error: "Not enough data for ARIMA" }), { status: 400 });
    }

    const scriptPath = path.join(process.cwd(), 'backend', 'ai', 'predict_arima.py');

    const options = {
      mode: 'text',
      pythonOptions: ['-u'],
      scriptPath: path.dirname(scriptPath),
      args: [JSON.stringify({ prices, futureDays })],
    };

    const result = await new Promise((resolve, reject) => {
      PythonShell.run('predict_arima.py', options, (err, results) => {
        if (err) reject(err);
        try {
          resolve(JSON.parse(results[0]));
        } catch (error) {
          reject(error);
        }
      });
    });

    return new Response(JSON.stringify(result), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
