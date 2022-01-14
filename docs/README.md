# Inteligentny ogród

Celem pracy jest stworzenie modelu ogrodu z systemem Smart, który będzie opierał się na mikrokomputerze Raspberry Pi. System umożliwi: monitorowanie aktualnych parametrów, deklarowanie przez użytkownika profili roślin z zadanymi wartościami do których system będzie automatycznie dążyć, sprawdzenie historii wcześniejszych odczytów.

## Technologie

<p float="left" align="center">
  <img src="https://github.com/EvilDamage/SmartGarden-server/blob/main/docs/1200px-Node.js_logo.svg.png" height="150" />
  <img src="https://github.com/EvilDamage/SmartGarden-server/blob/main/docs/53402609-b97a2180-39ba-11e9-8100-812bab86357c.png" height="150" />
  <img src="https://github.com/EvilDamage/SmartGarden-server/blob/main/docs/1_BmORsbtFaWw0lyyfMtYd0Q.png" height="150" />
</p>

- Node.js v17.3.0
- NPM v8.3.0
- Apollo Server v3.4.0
- Mocha v9.1.3

## Instalacja

Schemat podłączenie czujników

<p float="left">
  <img src="https://github.com/EvilDamage/SmartGarden-server/blob/main/docs/Sketch_bb.jpg" height="500" />
</p>

Po skonowaniu rezpoytorium należy zainstalować node_modules

    npm install
    
## Zmienne środowiskowe

```` 
# MONGODB
MONGODB_CONNECT = <mongodb+srv>

# JWT
REFRESH_TOKEN_SECRET = <secret key>
ACCESS_TOKEN_SECRET = <secret key>

# Email
EMAIL_SECRET = <secret key>
EMAIL_LOGIN = <gmail>
EMAIL_PASSWORD = <gmail password>
```` 
## Uruchomienie

### Start

    npm start
    
### Test

    npm test
    
## Testy

<p float="left">
  <img src="https://github.com/EvilDamage/SmartGarden-server/blob/main/docs/tests.png" height="500" />
</p>


**Autor: Przemysław Kuca**
