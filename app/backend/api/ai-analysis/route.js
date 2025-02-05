import OpenAI from 'openai';

export async function POST(request) {
  try {
    const requestData = await request.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const mode = requestData.mode;
    const assetType = mode === 'crypto' ? 'Criptomoneda' : 'Acción';
    const promptRole = mode === 'crypto'
      ? "Eres un experto en análisis cripto. Proporciona recomendaciones de inversión concisas (máximo 150 palabras) basadas en estos datos técnicos:"
      : "Eres un experto en análisis bursátil. Proporciona recomendaciones de inversión concisas (máximo 150 palabras) basadas en estos datos técnicos:";

    let userPrompt = '';
    if (requestData.predictionMode) {
      userPrompt = `
        Basado en los siguientes datos técnicos, ¿cuál sería tu predicción de precio para el final de este mes?
        ${assetType}: ${requestData.asset}
        Precio actual: $${requestData.price}
        Cambio 24h: ${requestData.change24h}%
        RSI: ${requestData.indicators.rsi}
        MACD: ${requestData.indicators.macd}
        Bandas de Bollinger: 
          Superior: ${requestData.indicators.bb.upper}
          Media: ${requestData.indicators.bb.middle}
          Inferior: ${requestData.indicators.bb.lower}
      `;
    } else if (requestData.actionQuery) {
      userPrompt = `
        Basado en los siguientes datos técnicos, ¿compro o vendo? Explica brevemente tu recomendación.
        ${assetType}: ${requestData.asset}
        Precio actual: $${requestData.price}
        Cambio 24h: ${requestData.change24h}%
        RSI: ${requestData.indicators.rsi}
        MACD: ${requestData.indicators.macd}
        Bandas de Bollinger: 
          Superior: ${requestData.indicators.bb.upper}
          Media: ${requestData.indicators.bb.middle}
          Inferior: ${requestData.indicators.bb.lower}
      `;
    } else if (requestData.holdQuery) {
      userPrompt = `
        Basado en los siguientes datos técnicos, ¿mantengo la posición actual? Explica brevemente tu recomendación.
        ${assetType}: ${requestData.asset}
        Precio actual: $${requestData.price}
        Cambio 24h: ${requestData.change24h}%
        RSI: ${requestData.indicators.rsi}
        MACD: ${requestData.indicators.macd}
        Bandas de Bollinger: 
          Superior: ${requestData.indicators.bb.upper}
          Media: ${requestData.indicators.bb.middle}
          Inferior: ${requestData.indicators.bb.lower}
      `;
    } else {
      userPrompt = `
        ${assetType}: ${requestData.asset}
        Precio actual: $${requestData.price}
        Cambio 24h: ${requestData.change24h}%
        RSI: ${requestData.indicators.rsi}
        MACD: ${requestData.indicators.macd}
        Bandas de Bollinger: 
          Superior: ${requestData.indicators.bb.upper}
          Media: ${requestData.indicators.bb.middle}
          Inferior: ${requestData.indicators.bb.lower}
      `;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: promptRole
      }, {
        role: "user",
        content: userPrompt
      }]
    });

    console.log('Datos recibidos:', {
      asset: requestData.asset,
      mode: requestData.mode,
      price: requestData.price,
      change24h: requestData.change24h,
      rsi: requestData.indicators.rsi,
      macd: requestData.indicators.macd,
      bb: requestData.indicators.bb
    });

    if (!completion.choices || completion.choices.length === 0) {
      throw new Error('La respuesta de OpenAI está vacía');
    }

    const analysis = completion.choices[0].message.content || 'Análisis no disponible';

    return new Response(JSON.stringify({ analysis }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Error en el backend:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Error interno'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
