import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || 'cryptocurrency';
    const apiKey = process.env.NEXT_PUBLIC_NEWSAPI_KEY;
    
    const url = `https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&apiKey=${apiKey}`;
    
    const response = await axios.get(url);

    if (!response.data.articles) {
      return NextResponse.json({ error: "No se encontraron noticias" }, { status: 404 });
    }

    return NextResponse.json(response.data.articles, { status: 200 });

  } catch (error) {
    console.error('Error al obtener noticias:', error);
    return NextResponse.json({ error: "Error al obtener noticias" }, { status: 500 });
  }
}
