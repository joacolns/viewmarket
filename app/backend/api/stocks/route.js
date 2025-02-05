import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req) {
  try {
    const { stock } = await req.json();

    if (!stock) {
      //return NextResponse.json({ message: 'Símbolo de acción requerido' }, { status: 400 });
      return;
    }

    const response = await axios.get(
      `https://api.twelvedata.com/time_series?symbol=${stock}&interval=1day&outputsize=200&apikey=${process.env.TWELVE_DATA_KEY}`
    );

    if (!response.data || response.data.status === "error" || !response.data.values) {
      //return NextResponse.json({ message: 'Error en la API de Twelve Data' }, { status: 500 });
      return;
    }

    const timeSeries = response.data.values;
    if (!timeSeries || timeSeries.length < 2) {
      //return NextResponse.json({ message: 'Datos insuficientes de la API' }, { status: 500 });
      return;
    }

    const prices = timeSeries.map(entry => parseFloat(entry.close)).reverse();
    const currentPrice = prices[prices.length - 1];
    const pastPrice = prices[prices.length - 2];
    const priceChangeAbs = currentPrice - pastPrice;
    const priceChange24h = (priceChangeAbs / pastPrice) * 100;

    return NextResponse.json({
      price: currentPrice,
      priceChange24h,
      priceChangeAbs24h: priceChangeAbs,
      chartData: prices
    });

  } catch (error) {
    //return NextResponse.json({ message: 'Error obteniendo datos de stocks', error: error.message }, { status: 500 });
  }
}
