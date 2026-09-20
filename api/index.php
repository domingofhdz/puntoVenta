<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Allow: GET, POST, OPTIONS");
 
if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    http_response_code(200);
    exit;
}

require "conexion.php";

$con = new Conexion(array(
    "tipo" => "sqlite",
    "bd"   => "../data/bd.db"
));

$con->query("CREATE TABLE IF NOT EXISTS productos (
    id TEXT PRIMARY KEY,
    nombreProducto TEXT NOT NULL,
    precio REAL NOT NULL,
    categoria TEXT NOT NULL
)");
$con->query("CREATE TABLE IF NOT EXISTS ventas (
    id TEXT PRIMARY KEY,
    usuario INTEGER NOT NULL,
    fechaHora TEXT NOT NULL,
    pago REAL NULL
)");



require "../firebase-php-jwt/vendor/autoload.php";

$jwtClave = "Test12345-----------------------------------------------";

$headers = getallheaders();

$token = "";
if (isset($headers["Authorization"])) {
    $token = str_replace("Bearer ", "", $headers["Authorization"]);
}
 
try {
    # el segundo parametro es la clave para codificar y decodificar el JWT
    # debe ser una string no corta, por eso rellené de guiones
    $decoded = Firebase\JWT\JWT::decode($token, new Firebase\JWT\Key($jwtClave, "HS256"));

    # $usuario puede ser usada para validaciones
    $usuario = explode("/", $decoded->sub);
    $id      = $usuario[0];
    $usr     = $usuario[1];
    $nivel   = $usuario[2];

    # $login puede ser usada para validaciones
    $login = true;
}
catch (Exception $error) {
    $usuario = array();
    $login   = false;
    $id      = 0;
}
 
# endpoint para revisar estado de la sesión
if (isset($_GET["sesion"])) {
    header("Content-Type: application/json");
    echo json_encode($usuario);
}
# endpoint para iniciar sesión
elseif (isset($_GET["iniciarSesion"])) {
    $usuarios = array();

    $nombreUsuario = $_POST["txtUsuario"];
    $contrasena    = $_POST["txtContrasena"];

    $nombreUsuario = addslashes($nombreUsuario);
    $contrasena = addslashes($contrasena);

    $sql = "SELECT id, nivelUsuario FROM usuarios
    WHERE nombreUsuario = '$nombreUsuario' AND contrasena = '$contrasena';";

    foreach ($con->query($sql) as $usuario) {
        $usuarios[] = $usuario;
    }

    if (count($usuarios)) {
        $usuario = $usuarios[0];

        $payload = [
            "iat" => time(),
            "exp" => time() + (60 * 60 * 24 * 7),
            "sub" => $usuario["id"] . "/" . $nombreUsuario . "/" . $usuario["nivelUsuario"]
        ];
        # el segundo parametro es la clave para codificar y decodificar el JWT
        # debe ser una string no corta, por eso rellené de guiones
        $jwt = Firebase\JWT\JWT::encode($payload, $jwtClave, "HS256");

        echo $jwt;
    }
    else {
        echo "error";
    }
}



// Endpoints de Productos
elseif (isset($_GET["buscarProductos"]) && $login) {
    $busqueda = $_GET["txtBusqueda"];
    $busqueda = addslashes($busqueda);

    $array = array();

    $sql = "SELECT * FROM productos
    WHERE nombreProducto LIKE '%$busqueda%';";

    foreach ($con->query($sql) as $producto) {
        $array[] = $producto;
    }

    header("Content-Type: application/json");
    echo json_encode($array);
    exit;
}
elseif (isset($_GET["guardarProducto"]) && $login) {
    $id = $_POST["txtId"];
    $nombreProducto = $_POST["txtNombreProducto"];
    $precio = $_POST["txtPrecio"];
    $categoria = $_POST["cboCategoria"];

    if ($id) {
        $guardar = $con->update("productos");
        $guardar->set("nombreProducto", $nombreProducto);
        $guardar->set("precio", $precio);
        $guardar->set("categoria", $categoria);
        $guardar->where("id", "=", $id);
    }
    else {
        $guardar = $con->insert("productos", "id, nombreProducto, precio, categoria");
        $guardar->value(uniqid());
        $guardar->value($nombreProducto);
        $guardar->value($precio);
        $guardar->value($categoria);
    }

    $guardar->execute();
}
elseif (isset($_GET["editarProducto"]) && $login) {
    $id = $_GET["txtId"];
    $id = addslashes($id);

    $array = array();

    $sql = "SELECT * FROM productos
    WHERE id = '$id';";

    foreach ($con->query($sql) as $producto) {
        $array[] = $producto;
    }

    header("Content-Type: application/json");
    echo json_encode($array);
    exit;
}
elseif (isset($_GET["eliminarProducto"]) && $login) {
    $id = $_POST["txtId"];

    $delete = $con->delete("productos");
    $delete->where("id", "=", $id);
    $delete->execute();
}



elseif (isset($_GET["buscarVentas"]) && $login) {
    $busqueda = $_GET["txtBusqueda"];
    $busqueda = addslashes($busqueda);

    $array = array();

    $sql = "SELECT ventas.*, usuarios.nombreUsuario FROM ventas
    INNER JOIN usuarios ON usuarios.id = ventas.usuario
    WHERE fechaHora LIKE '%$busqueda%';";

    foreach ($con->query($sql) as $venta) {
        $array[] = $venta;
    }

    header("Content-Type: application/json");
    echo json_encode($array);
    exit;
}
elseif (isset($_GET["guardarVenta"]) && $login) {
    $idUsuario = $id;

    $id        = $_POST["txtId"];
    $fechaHora = date("Y-m-d H:i:s");

    if (!$id) {
        $guardar = $con->insert("ventas", "id, usuario, fechaHora");
        $guardar->value(uniqid());
        $guardar->value($idUsuario);
        $guardar->value($fechaHora);
    }

    $guardar->execute();
}
elseif (isset($_GET["editarVenta"]) && $login) {
    $id = $_GET["txtId"];
    $id = addslashes($id);

    $array = array();

    $sql = "SELECT * FROM ventas
    WHERE id = '$id';";

    foreach ($con->query($sql) as $venta) {
        $array[] = $venta;
    }

    header("Content-Type: application/json");
    echo json_encode($array);
    exit;
}
elseif (isset($_GET["eliminarVenta"]) && $login) {
    $id = $_POST["txtId"];

    $delete = $con->delete("ventas");
    $delete->where("id", "=", $id);
    $delete->execute();
}