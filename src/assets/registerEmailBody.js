export const registerEmailBody = (emailToken) => {
    return (
        `<!DOCTYPE html>
        <html>
            <head>
                <title>Potwierdzenie Rejestracji</title>
                <style type="text/css">
                    body {margin: 0; padding: 0; min-width: 100%!important;}
                </style>
            </head>
            <body>
                <div style="background: #f6f8f1; text-align: center; padding: 0 0 100px 0;">
                    <h1 style="padding: 30px 0 15px 0;">Potwierdzenie rejestracji!</h1>
                    <p style="padding-bottom: 30px">Dziękujemy za utworzenie konta w systemie inteligentnego ogrodu</p>
                    <a href="http://localhost:4000/confirmation/${emailToken}" style="color: #fff; background-color: #064635; border-color: #064635; width: 100%; height: 48px; padding: 12px 32px; border-radius: 24px; text-decoration: none;">Potwierdź adres email</a>
                </div>
            </body>
        </html>`
    )
}