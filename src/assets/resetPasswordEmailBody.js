export const resetPasswordEmailBody = (url) => {
    return (
        `<!DOCTYPE html>
        <html>
            <head>
                <title>Utworzenie nowego hasła</title>
                <style type="text/css">
                    body {margin: 0; padding: 0; min-width: 100%!important;}
                </style>
            </head>
            <body>
                <div style="background: #f6f8f1; text-align: center; padding: 0 0 100px 0;">
                    <h1 style="padding: 30px 0 15px 0; color: #000;">Zmień hasło</h1>
                    <a href="${url}" style="color: #fff; background-color: #064635; border-color: #064635; width: 100%; height: 48px; padding: 12px 32px; border-radius: 24px; text-decoration: none;">Zmień hasło</a>
                    <p>Link jest ważny 24h</p>
                </div>
            </body>
        </html>`
    )
}