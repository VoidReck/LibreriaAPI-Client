
# Libreria API/Cliente

API para gestionar una biblioteca, incluyendo funcionalidades de agregar, editar y eliminar libros, y un cliente web que permite administrar fácilmente la biblioteca.

## Requisitos

- Node.js 18 > 20
- npm 8 > 10
- MongoDB Community 7 > 8

## Instalación
1. Clona el repositorio:

```bash
git clone https://github.com/VoidReck/LibreriaAPI-Client.git
cd Libreria
```
2. Instala las depenencias en el servidor API y en el Cliente

```bash
npm install
```
## Configuración

1. Crea un archivo `.env` o copia el archivo `.env.example` en el directorio `Core` que está en la carpeta de cada proyecto y añade las siguientes variables:

#### Servidor API:
APIHOST=localhost
APIPORT= 4000
MONGODB=uri_del_servidor_mongo
TOKEN_SECRET=secreto_para_firmar_los_tokens

#### Cliente:
APIURL=http://localhost:4000/endpoint
PORT=3001
SECRET_KEY=secreto_para_la_firma_de_cookies

## Inicia el servidor:

### Servidor API:

```bash
cd directorio_servidor_api
npm .
O usa:
npm index.js
```

### Cliente:

```bash
cd directorio_cliente
npm start
```
## Accede a la documentación de la API:

`http://localhost:4000/api-docs`

> [!NOTE]
> Antes de interactuar con la API asegúrese de que se está ejecutando primero.


## Referencias API

#### Registrar Usuario

```http
  POST /users/register
```

| Parámetro | Tipo     | Descripción                       |
| :-------- | :------- | :-------------------------------- |
| `name`    | `string` | **Requerido**. Nombre del usuario |
| `email`   | `string` | **Requerido**. Correo del usuario |
| `password`  | `string` | **Requerido**. Contraseña del usuario |


#### Iniciar Sesión

```http
  POST /users/login
```

| Parámetro | Tipo     | Descripción                       |
| :-------- | :------- | :-------------------------------- |
| `email`   | `string` | **Requerido**. Correo del usuario |
| `password` | `string` | **Requerido**. Contraseña del usuario |

#### Obtener Todos los Libros

```http
  GET /libros
```

#### Buscar libros

```http
  GET /libros/buscar
```

| Parámetro | Tipo     | Descripción                       |
| :-------- | :------- | :-------------------------------- |
| `title`   | `string` | Título del libro (opcional, pero se debe proporcionar al menos uno de los parámetros) |
| `author`  | `string` | Autor del libro (opcional, pero se debe proporcionar al menos uno de los parámetros) |
		
#### Crear un libro

```http
  POST /libros
```

| Parámetro | Tipo     | Descripción                       |
| :-------- | :------- | :-------------------------------- |
| `title`   | `string` | **Requerido**. Título del libro   |
| `author`  | `string` | **Requerido**. Autor del libro    |
| `publishedYear` | `string` | **Requerido**. Año de publicación |
| `status`  | `string` | **Requerido**. Estado del libro   |

#### Actualizar un libro (PUT)

```http
  PUT /libros/{id}
```

| Parámetro | Tipo     | Descripción                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | **Requerido**. ID del libro       |
| `title`   | `string` | **Requerido**. Título del libro   |
| `author`  | `string` | **Requerido**. Autor del libro    |
| `publishedYear` | `string` | **Requerido**. Año de publicación |
| `status`  | `string` | **Requerido**. Estado del libro   |
	
#### Actualizar un libro (PATCH)

```http
  PATCH /libros/{id}
```

| Parámetro | Tipo     | Descripción                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | **Requerido**. ID del libro |
| `title`   | `string` | Título del libro (opcional, pero se debe proporcionar al menos uno de los parámetros) |
| `author`  | `string` | Autor del libro (opcional, pero se debe proporcionar al menos uno de los parámetros) |
| `publishedYear` | `string` | Año de publicación (opcional, pero se debe proporcionar al menos uno de los parámetros) |
| `status`  | `string` | Estado del libro (opcional, pero se debe proporcionar al menos uno de los parámetros) |
		
#### Eliminar un libro

```http
  DELETE /libros/{id}
```

| Parámetro | Tipo     | Descripción                       |
| :-------- | :------- | :-------------------------------- |
| `id` | `string` | **Requerido**. ID del libro a eliminar |

## Authors

- [@Cristian Vanegas](https://www.github.com/voidreck)

