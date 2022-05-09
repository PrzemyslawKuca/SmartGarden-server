export const statsEmailBody = (date, max_temeprature, min_temeprature, max_humidity, min_humidity, max_soil_humidity, min_soil_humidity) => {
    return (
        `<!DOCTYPE html>
        <html>
            <head>
                <title>Podsumowanie dnia</title>
                <style type="text/css">
                    body {margin: 0; padding: 0; min-width: 100%!important;}
                </style>
            </head>
            <body>
                <div style="background: #f6f8f1; text-align: center; padding: 0 0 100px 0;">
                    <h1 style="padding: 30px 0 15px 0;">Informacje o zebranych danych z ostatniej doby</h1>
                    <p style=margin: 0 0 30px 0;">Dane na dzień: <b>${date}</b></p>
                    <br/>
                    <p>Temperatura powietrza maksymalna: <b>${max_temeprature.toFixed(2)}°C</b></p>
                    <p>Temperatura powietrza minimalna: <b>${min_temeprature.toFixed(2)}°C</b></p>
                    <br/>
                    <p>Wilgotność powietrza maksymalna: <b>${max_humidity.toFixed(2)}%</b></p>
                    <p>Wilgotność powietrza minimalna: <b>${min_humidity.toFixed(2)}%</b></p>
                    <br/>
                    <p>Wilgotność gleby maksymalna: <b>${max_soil_humidity.toFixed(2)}%</b></p>
                    <p>Wilgotność gleby minimalna: <b>${min_soil_humidity.toFixed(2)}%</b></p>
                </div>
            </body>
        </html>`
    )
}