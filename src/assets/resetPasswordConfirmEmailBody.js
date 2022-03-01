export const resetPasswordConfirmEmailBody = () => {
    return (
        `<!DOCTYPE html>
        <html>
            <head>
                <title>Utworzenie nowego hasła!</title>
                <style type="text/css">
                    body {margin: 0; padding: 0; min-width: 100%!important;}
                </style>
            </head>
            <body>
                <div style="background: #f6f8f1; text-align: center; padding: 0 0 100px 0;">
                    <h1 style="padding: 30px 0 15px 0; color: #000;">Twoje hasło zostało zmienione!</h1>
                </div>
            </body>
        </html>`
    )
}