export const dangerEmailBody = (date, sensorName) => {
    return (
        `<!DOCTYPE html>
        <html>
            <head>
                <title>Możliwe uszkodzenie jednego z czujników</title>
                <style type="text/css">
                    body {margin: 0; padding: 0; min-width: 100%!important;}
                </style>
            </head>
            <body>
                <div style="background: #f6f8f1; text-align: center; padding: 0 0 100px 0;">
                    <h1 style="padding: 30px 0 15px 0;">Możliwe uszkodzenie jednego z czujników</h1>
                    <p style=margin: 0 0 30px 0;">Wystąpienie awarii: <b>${date}</b></p>
                    <p style=margin: 0 0 30px 0;">Prawdopodobnie uszokdzony czujnik: ${sensorName}</p>
                </div>
            </body>
        </html>`
    )
}